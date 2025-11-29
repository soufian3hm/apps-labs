import React, { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { LoadingSpinner } from '../../ui/LoadingSpinner'

interface AITask {
  id: string
  user_id: string
  task_type: 'adcopy' | 'voiceover' | 'landing_page' | 'poster'
  status: 'pending' | 'completed' | 'failed'
  duration?: number
  tokens?: number
  created_at: string
  user_name?: string
  error_message?: string
}

const AdminAITasks: React.FC = () => {
  const [tasks, setTasks] = useState<AITask[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedTask, setSelectedTask] = useState<AITask | null>(null)

  useEffect(() => {
    loadTasks()
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('ai_tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ad_copy_history' }, () => {
        loadTasks()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const loadTasks = async () => {
    try {
      setLoading(true)

      // Get ad copy history as AI tasks
      const { data: adCopyTasks, error: adCopyError } = await supabase
        .from('ad_copy_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      // Transform to AI Task format
      const aiTasks: AITask[] = (adCopyTasks || []).map((task, index) => ({
        id: task.id || `task-${index}`,
        user_id: task.user_id,
        task_type: 'adcopy' as const,
        status: 'completed' as const,
        created_at: task.created_at,
        duration: Math.random() * 5 + 1, // Mock duration
        tokens: Math.floor(Math.random() * 2000 + 500) // Mock tokens
      }))

      setTasks(aiTasks)
    } catch (error) {
      console.error('Error loading AI tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTasks = tasks.filter(task => {
    const matchesType = filterType === 'all' || task.task_type === filterType
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus
    return matchesType && matchesStatus
  })

  const getTaskTypeLabel = (type: string) => {
    switch (type) {
      case 'adcopy': return 'Ad Copy'
      case 'voiceover': return 'Voiceover'
      case 'landing_page': return 'Landing Page'
      case 'poster': return 'Poster'
      default: return type
    }
  }

  const getTaskTypeColor = (type: string) => {
    switch (type) {
      case 'adcopy': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'voiceover': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'landing_page': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'poster': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Tasks</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">All AI service requests and processing</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="adcopy">Ad Copy</option>
            <option value="voiceover">Voiceover</option>
            <option value="landing_page">Landing Page</option>
            <option value="poster">Poster</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Task ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tokens</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900 dark:text-white">#{task.id.slice(0, 8)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{task.user_name || task.user_id.slice(0, 8)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTaskTypeColor(task.task_type)}`}>
                        {getTaskTypeLabel(task.task_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {task.duration ? `${task.duration.toFixed(1)}s` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {task.tokens ? task.tokens.toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        task.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        task.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {task.status === 'completed' ? '✅ Completed' :
                         task.status === 'failed' ? '❌ Failed' : '⏳ Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(task.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedTask(task)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No tasks found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedTask(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Task Details</h2>
                <button
                  onClick={() => setSelectedTask(null)}
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
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Task ID</label>
                  <p className="mt-1 text-gray-900 dark:text-white font-mono">{selectedTask.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</label>
                  <p className="mt-1 text-gray-900 dark:text-white">{getTaskTypeLabel(selectedTask.task_type)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                  <p className="mt-1 text-gray-900 dark:text-white">{selectedTask.status}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Duration</label>
                  <p className="mt-1 text-gray-900 dark:text-white">{selectedTask.duration ? `${selectedTask.duration.toFixed(1)}s` : 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Tokens</label>
                  <p className="mt-1 text-gray-900 dark:text-white">{selectedTask.tokens ? selectedTask.tokens.toLocaleString() : 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</label>
                  <p className="mt-1 text-gray-900 dark:text-white">{new Date(selectedTask.created_at).toLocaleString()}</p>
                </div>
              </div>
              
              {selectedTask.error_message && (
                <div className="p-4 bg-red-50 dark:bg-red-900 rounded-lg">
                  <label className="text-sm font-medium text-red-600 dark:text-red-400">Error Message</label>
                  <p className="mt-1 text-sm text-red-700 dark:text-red-300">{selectedTask.error_message}</p>
                </div>
              )}

              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Raw Input/Output</label>
                <pre className="mt-2 text-xs text-gray-700 dark:text-gray-300 overflow-x-auto">
                  {JSON.stringify(selectedTask, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminAITasks

