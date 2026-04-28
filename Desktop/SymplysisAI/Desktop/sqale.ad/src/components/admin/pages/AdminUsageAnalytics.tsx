import React, { useState, useEffect } from 'react'
import { AdminService, UsageAnalytics } from '../../../services/adminService'
import { LoadingSpinner } from '../../ui/LoadingSpinner'

interface FeatureUsage {
  feature: string
  count: number
  percentage: number
}

const AdminUsageAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<UsageAnalytics>({
    total_adcopy: 0,
    total_voiceover: 0,
    total_landing_page: 0,
    total_poster: 0,
    total_usage: 0,
    active_users: 0,
    avg_usage_per_user: 0
  })
  const [featureUsage, setFeatureUsage] = useState<FeatureUsage[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')

  useEffect(() => {
    loadUsageAnalytics()
  }, [timeRange])

  const loadUsageAnalytics = async () => {
    try {
      setLoading(true)

      // Convert time range to days
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 0

      // Get usage analytics using admin service
      const data = await AdminService.getUsageAnalytics(days)
      setAnalytics(data)

      // Calculate feature usage percentages
      const total = data.total_usage || 1
      const features: FeatureUsage[] = [
        { 
          feature: 'Ad Copy', 
          count: data.total_adcopy, 
          percentage: total > 0 ? (data.total_adcopy / total) * 100 : 0 
        },
        { 
          feature: 'Voiceover', 
          count: data.total_voiceover, 
          percentage: total > 0 ? (data.total_voiceover / total) * 100 : 0 
        },
        { 
          feature: 'Landing Pages', 
          count: data.total_landing_page, 
          percentage: total > 0 ? (data.total_landing_page / total) * 100 : 0 
        },
        { 
          feature: 'Posters', 
          count: data.total_poster, 
          percentage: total > 0 ? (data.total_poster / total) * 100 : 0 
        }
      ]

      setFeatureUsage(features)
    } catch (error) {
      console.error('Error loading usage analytics:', error)
      alert('Failed to load usage analytics. Make sure you have admin privileges.')
    } finally {
      setLoading(false)
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Usage Analytics</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Product traction and feature usage</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d' | 'all')}
          className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="all">All time</option>
        </select>
      </div>

      {/* Usage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ad Copy</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{analytics.total_adcopy.toLocaleString()}</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                {featureUsage.find(f => f.feature === 'Ad Copy')?.percentage.toFixed(1)}% of total
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Voiceover</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{analytics.total_voiceover.toLocaleString()}</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                {featureUsage.find(f => f.feature === 'Voiceover')?.percentage.toFixed(1)}% of total
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Landing Pages</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{analytics.total_landing_page.toLocaleString()}</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                {featureUsage.find(f => f.feature === 'Landing Pages')?.percentage.toFixed(1)}% of total
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Posters</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{analytics.total_poster.toLocaleString()}</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                {featureUsage.find(f => f.feature === 'Posters')?.percentage.toFixed(1)}% of total
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Usage Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Most Used Features</h3>
        <div className="space-y-4">
          {featureUsage.map((feature) => (
            <div key={feature.feature}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{feature.feature}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {feature.count.toLocaleString()} ({feature.percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    feature.feature === 'Ad Copy' ? 'bg-blue-600' :
                    feature.feature === 'Voiceover' ? 'bg-purple-600' :
                    feature.feature === 'Landing Pages' ? 'bg-green-600' :
                    'bg-orange-600'
                  }`}
                  style={{ width: `${feature.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">Active Users</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{analytics.active_users.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Usage</span>
              <span className="text-sm font-semibold text-green-600 dark:text-green-400">{analytics.total_usage.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">Avg Usage per User</span>
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{analytics.avg_usage_per_user.toFixed(1)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Usage Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">Time Range</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {timeRange === '7d' ? 'Last 7 days' : timeRange === '30d' ? 'Last 30 days' : timeRange === '90d' ? 'Last 90 days' : 'All time'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Features Used</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{featureUsage.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">Most Popular</span>
              <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                {featureUsage.length > 0 ? featureUsage.sort((a, b) => b.count - a.count)[0].feature : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminUsageAnalytics

