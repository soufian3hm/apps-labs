import React, { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { LoadingSpinner } from '../../ui/LoadingSpinner'

interface Log {
  id: string
  type: 'auth' | 'payment' | 'error' | 'system' | 'webhook'
  level: 'info' | 'warning' | 'error' | 'success'
  message: string
  metadata?: any
  user_id?: string
  created_at: string
}

const AdminLogs: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterLevel, setFilterLevel] = useState<string>('all')
  const [selectedLog, setSelectedLog] = useState<Log | null>(null)
  const [realtime, setRealtime] = useState(true)

  useEffect(() => {
    loadLogs()
    
    if (realtime) {
      // Set up real-time subscription for logs
      const subscription = supabase
        .channel('admin_logs')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'stripe_events' }, (payload) => {
          if (payload.new) {
            const newData = payload.new as any
            const newLog: Log = {
              id: newData.id || '',
              type: 'webhook',
              level: 'info',
              message: `Stripe webhook: ${newData.event_type || 'unknown'}`,
              metadata: newData,
              created_at: newData.created_at || new Date().toISOString()
            }
            setLogs(prev => [newLog, ...prev].slice(0, 1000))
          }
        })
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [realtime])

  const loadLogs = async () => {
    try {
      setLoading(true)

      // Get Stripe events as logs
      const { data: stripeEvents, error: stripeError } = await supabase
        .from('stripe_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      const stripeLogs: Log[] = (stripeEvents || []).map(event => ({
        id: event.id,
        type: 'webhook' as const,
        level: 'info' as const,
        message: `Stripe webhook: ${event.event_type}`,
        metadata: event.event_data,
        created_at: event.created_at
      }))

      // In a real implementation, you would also fetch from:
      // - auth_logs table (authentication logs)
      // - error_logs table (error tracking)
      // - system_logs table (system events)

      setLogs(stripeLogs)
    } catch (error) {
      console.error('Error loading logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = logs.filter(log => {
    const matchesType = filterType === 'all' || log.type === filterType
    const matchesLevel = filterLevel === 'all' || log.level === filterLevel
    return matchesType && matchesLevel
  })

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'success': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'auth': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'payment': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'webhook': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  const exportLogs = () => {
    const csv = [
      ['Type', 'Level', 'Message', 'User ID', 'Created At'],
      ...filteredLogs.map(log => [
        log.type,
        log.level,
        log.message,
        log.user_id || '',
        new Date(log.created_at).toISOString()
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `logs-${new Date().toISOString()}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Logs</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">System logs and error tracking</p>
        </div>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={realtime}
              onChange={(e) => setRealtime(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Real-time</span>
          </label>
          <button
            onClick={exportLogs}
            className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
          >
            Export CSV
          </button>
          <button
            onClick={loadLogs}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="auth">Authentication</option>
            <option value="payment">Payment</option>
            <option value="webhook">Webhook</option>
            <option value="error">Error</option>
            <option value="system">System</option>
          </select>
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Levels</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
            <option value="success">Success</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Message</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(log.type)}`}>
                        {log.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getLevelColor(log.level)}`}>
                        {log.level}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white max-w-md truncate">
                        {log.message}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {log.user_id ? log.user_id.slice(0, 8) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No logs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedLog(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Log Details</h2>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</label>
                  <p className="mt-1 text-gray-900 dark:text-white">{selectedLog.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Level</label>
                  <p className="mt-1 text-gray-900 dark:text-white">{selectedLog.level}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Message</label>
                  <p className="mt-1 text-gray-900 dark:text-white">{selectedLog.message}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</label>
                  <p className="mt-1 text-gray-900 dark:text-white">{new Date(selectedLog.created_at).toLocaleString()}</p>
                </div>
              </div>
              
              {selectedLog.metadata && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Metadata</label>
                  <pre className="mt-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-xs text-gray-900 dark:text-white overflow-x-auto">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminLogs

