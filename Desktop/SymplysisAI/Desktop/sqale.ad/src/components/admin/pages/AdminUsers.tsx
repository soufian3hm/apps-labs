import React, { useState, useEffect } from 'react'
import { AdminService, AdminUser } from '../../../services/adminService'
import { LoadingSpinner } from '../../ui/LoadingSpinner'

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPlan, setFilterPlan] = useState<string>('all')
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [showAddCreditsModal, setShowAddCreditsModal] = useState(false)
  const [creditsToAdd, setCreditsToAdd] = useState({
    adcopy: 0,
    voiceover: 0,
    landing_page: 0,
    poster: 0
  })
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const usersData = await AdminService.getAllUsers()
      setUsers(usersData)
    } catch (error) {
      console.error('Error loading users:', error)
      alert('Failed to load users. Make sure you have admin privileges.')
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.company_name.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesPlan = filterPlan === 'all' || user.subscription_plan === filterPlan
    
    return matchesSearch && matchesPlan
  })

  const handleAddCredits = async () => {
    if (!selectedUser) return

    try {
      setActionLoading(true)
      await AdminService.addUserCredits(selectedUser.user_id, creditsToAdd)
      alert('Credits added successfully!')
      setShowAddCreditsModal(false)
      setCreditsToAdd({ adcopy: 0, voiceover: 0, landing_page: 0, poster: 0 })
      await loadUsers()
    } catch (error: any) {
      alert(error.message || 'Failed to add credits')
    } finally {
      setActionLoading(false)
    }
  }

  const handleBanUser = async (user: AdminUser, ban: boolean) => {
    if (!window.confirm(`Are you sure you want to ${ban ? 'ban' : 'unban'} ${user.name}?`)) return

    try {
      setActionLoading(true)
      await AdminService.banUser(user.user_id, ban)
      alert(`User ${ban ? 'banned' : 'unbanned'} successfully!`)
      await loadUsers()
    } catch (error: any) {
      alert(error.message || `Failed to ${ban ? 'ban' : 'unban'} user`)
    } finally {
      setActionLoading(false)
    }
  }

  const handleImpersonate = async (user: AdminUser) => {
    if (!window.confirm(`Are you sure you want to impersonate ${user.name}?`)) return

    try {
      setActionLoading(true)
      const url = await AdminService.impersonateUser(user.user_id)
      if (url) {
        window.open(url, '_blank')
      } else {
        alert('Impersonation link generated. Check console for details.')
      }
    } catch (error: any) {
      alert(error.message || 'Failed to impersonate user')
    } finally {
      setActionLoading(false)
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Users</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Complete user management</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
          + Add User
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, email, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Plans</option>
            <option value="free">Free</option>
            <option value="starter">Starter</option>
            <option value="premium">Premium</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name / Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Usage Summary</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Last Active</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">{user.company_name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.subscription_plan === 'premium' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                          user.subscription_plan === 'starter' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          user.subscription_plan === 'enterprise' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}>
                          {user.subscription_plan || 'Free'}
                        </span>
                        {user.is_banned && (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                            Banned
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        <div>Ad Copy: {user.adcopy_count || 0}</div>
                        <div>Voiceover: {user.voiceover_count || 0}</div>
                        <div>Landing: {user.landing_page_count || 0}</div>
                        <div>Poster: {user.poster_count || 0}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.last_active).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          disabled={actionLoading}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50"
                        >
                          View
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user)
                            setShowAddCreditsModal(true)
                          }}
                          disabled={actionLoading}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50"
                        >
                          Add Credits
                        </button>
                        <button
                          onClick={() => handleBanUser(user, !user.is_banned)}
                          disabled={actionLoading}
                          className={user.is_banned 
                            ? "text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300 disabled:opacity-50"
                            : "text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                          }
                        >
                          {user.is_banned ? 'Unban' : 'Ban'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedUser(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedUser.name}</h2>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                <p className="mt-1 text-gray-900 dark:text-white">{selectedUser.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Company</label>
                <p className="mt-1 text-gray-900 dark:text-white">{selectedUser.company_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Subscription</label>
                <p className="mt-1 text-gray-900 dark:text-white">{selectedUser.subscription_plan} - {selectedUser.subscription_status}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Usage</label>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Ad Copy</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">{selectedUser.adcopy_count || 0}</div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Voiceover</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">{selectedUser.voiceover_count || 0}</div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Landing Pages</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">{selectedUser.landing_page_count || 0}</div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Posters</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">{selectedUser.poster_count || 0}</div>
                  </div>
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => handleImpersonate(selectedUser)}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Loading...' : 'Impersonate User'}
                </button>
                <button
                  onClick={() => setShowAddCreditsModal(true)}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  Add Credits
                </button>
                <button
                  onClick={() => handleBanUser(selectedUser, !selectedUser.is_banned)}
                  disabled={actionLoading}
                  className={`px-4 py-2 rounded-xl transition-colors disabled:opacity-50 ${
                    selectedUser.is_banned
                      ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {selectedUser.is_banned ? 'Unban User' : 'Ban User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Credits Modal */}
      {showAddCreditsModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowAddCreditsModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add Credits</h2>
                <button
                  onClick={() => setShowAddCreditsModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Add credits to {selectedUser.name}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ad Copy Credits</label>
                <input
                  type="number"
                  min="0"
                  value={creditsToAdd.adcopy}
                  onChange={(e) => setCreditsToAdd({ ...creditsToAdd, adcopy: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Voiceover Credits</label>
                <input
                  type="number"
                  min="0"
                  value={creditsToAdd.voiceover}
                  onChange={(e) => setCreditsToAdd({ ...creditsToAdd, voiceover: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Landing Page Credits</label>
                <input
                  type="number"
                  min="0"
                  value={creditsToAdd.landing_page}
                  onChange={(e) => setCreditsToAdd({ ...creditsToAdd, landing_page: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Poster Credits</label>
                <input
                  type="number"
                  min="0"
                  value={creditsToAdd.poster}
                  onChange={(e) => setCreditsToAdd({ ...creditsToAdd, poster: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleAddCredits}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Adding...' : 'Add Credits'}
                </button>
                <button
                  onClick={() => {
                    setShowAddCreditsModal(false)
                    setCreditsToAdd({ adcopy: 0, voiceover: 0, landing_page: 0, poster: 0 })
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUsers

