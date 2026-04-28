import React, { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { AdminService, AdminSubscription } from '../../../services/adminService'
import { LoadingSpinner } from '../../ui/LoadingSpinner'

const AdminSubscriptions: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [mrr, setMrr] = useState(0)
  const [churnRate, setChurnRate] = useState(0)

  useEffect(() => {
    loadSubscriptions()
  }, [])

  const loadSubscriptions = async () => {
    try {
      setLoading(true)
      
      // Get all subscriptions using admin service
      const subscriptionData = await AdminService.getAllSubscriptions()

      // Calculate MRR (Monthly Recurring Revenue)
      const activeSubs = subscriptionData.filter(sub => sub.status === 'active')
      const monthlyRevenue = activeSubs.reduce((sum, sub) => sum + (sub.price || 0), 0)
      setMrr(monthlyRevenue)

      // Calculate churn rate (simplified)
      const totalSubs = subscriptionData.length || 1
      const cancelledSubs = subscriptionData.filter(sub => sub.status === 'cancelled').length
      setChurnRate((cancelledSubs / totalSubs) * 100)

      setSubscriptions(subscriptionData)
    } catch (error) {
      console.error('Error loading subscriptions:', error)
      alert('Failed to load subscriptions. Make sure you have admin privileges.')
    } finally {
      setLoading(false)
    }
  }

  const filteredSubscriptions = subscriptions.filter(sub => {
    if (filterStatus === 'all') return true
    return sub.status === filterStatus
  })

  const handleCancelSubscription = async (subscriptionId: string) => {
    if (!window.confirm('Are you sure you want to cancel this subscription?')) return
    
    try {
      // Update subscription status
      const { error } = await supabase
        .from('subscription_history')
        .update({ status: 'cancelled' })
        .eq('id', subscriptionId)

      if (error) throw error
      
      loadSubscriptions()
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      alert('Failed to cancel subscription')
    }
  }

  const handleRefund = async (subscriptionId: string) => {
    if (!window.confirm('Are you sure you want to refund this subscription?')) return
    alert('Refund functionality would integrate with Stripe API')
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Subscriptions</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Manage all subscriptions and payments</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Recurring Revenue</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">${mrr.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Churn Rate</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{churnRate.toFixed(1)}%</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Subscriptions</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {subscriptions.filter(s => s.status === 'active').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="cancelled">Cancelled</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Next Renewal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Payment Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredSubscriptions.length > 0 ? (
                filteredSubscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{sub.user_name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{sub.user_email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        sub.plan_name === 'premium' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                        sub.plan_name === 'starter' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {sub.plan_name || 'Free'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {sub.current_period_end 
                        ? new Date(sub.current_period_end).toLocaleDateString()
                        : 'N/A'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        sub.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        sub.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        sub.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {sub.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {sub.currency || '$'}{(sub.price || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {sub.status === 'active' && (
                          <button
                            onClick={() => handleCancelSubscription(sub.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          onClick={() => handleRefund(sub.id)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Refund
                        </button>
                        <button className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">
                          Add Credits
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No subscriptions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">MRR Trend</h3>
          <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-600">
            <p>Chart placeholder - Integrate with Stripe API</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">New Subscriptions Daily</h3>
          <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-600">
            <p>Chart placeholder - Aggregate subscription data</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminSubscriptions

