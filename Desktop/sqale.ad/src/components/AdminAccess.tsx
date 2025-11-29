import React, { useState, useEffect } from 'react'
import { useNavigate, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useUserProfile } from '../contexts/UserProfileContext'
import { supabase } from '../lib/supabase'
import AdminPanelLayout from './admin/AdminPanelLayout'
import AdminDashboard from './admin/pages/AdminDashboard'
import AdminUsers from './admin/pages/AdminUsers'
import AdminSubscriptions from './admin/pages/AdminSubscriptions'
import AdminUsageAnalytics from './admin/pages/AdminUsageAnalytics'
import AdminAITasks from './admin/pages/AdminAITasks'
import AdminContentLibrary from './admin/pages/AdminContentLibrary'
import AdminAffiliates from './admin/pages/AdminAffiliates'
import AdminSupport from './admin/pages/AdminSupport'
import AdminSystemSettings from './admin/pages/AdminSystemSettings'
import AdminLogs from './admin/pages/AdminLogs'
import AdminEmail from './admin/pages/AdminEmail'
import { LoadingSpinner } from './ui/LoadingSpinner'

const AdminAccess: React.FC = () => {
  const { user, signIn, loading: authLoading } = useAuth()
  const { loading: profileLoading } = useUserProfile()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkingAdmin, setCheckingAdmin] = useState(true)

  // Check if user is already logged in and is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setCheckingAdmin(false)
        return
      }

      try {
        // Fetch user profile to check role
        const { data, error: fetchError } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('user_id', user.id)
          .single()

        if (fetchError) {
          console.error('Error fetching profile:', fetchError)
          setCheckingAdmin(false)
          return
        }

        if (data && data.role === 'admin') {
          setIsAdmin(true)
        } else {
          setError('Access denied. Admin privileges required.')
          // Sign out if user is not admin
          await supabase.auth.signOut()
        }
      } catch (err) {
        console.error('Error checking admin status:', err)
      } finally {
        setCheckingAdmin(false)
      }
    }

    if (!authLoading && !profileLoading) {
      checkAdminStatus()
    }
  }, [user, authLoading, profileLoading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Sign in the user
      await signIn(email, password)

      // Wait a bit for the session to be established
      await new Promise(resolve => setTimeout(resolve, 500))

      // Get the current user
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) {
        throw new Error('Failed to get session after login')
      }

      // Check if user has admin role
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', session.user.id)
        .single()

      if (profileError) {
        throw new Error('Failed to fetch user profile')
      }

      if (!profileData || profileData.role !== 'admin') {
        // Sign out if not admin
        await supabase.auth.signOut()
        throw new Error('Access denied. Admin privileges required.')
      }

      // User is admin, allow access
      setIsAdmin(true)
      setLoading(false)
    } catch (error: any) {
      setError(error.message || 'Failed to sign in')
      setLoading(false)
    }
  }

  // Show loading state while checking admin status
  if (checkingAdmin || authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If user is admin, show admin panel with routing
  if (isAdmin && user) {
    return (
      <AdminPanelLayout>
        <Routes>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="subscriptions" element={<AdminSubscriptions />} />
          <Route path="usage" element={<AdminUsageAnalytics />} />
          <Route path="ai-tasks" element={<AdminAITasks />} />
          <Route path="content" element={<AdminContentLibrary />} />
          <Route path="affiliates" element={<AdminAffiliates />} />
          <Route path="support" element={<AdminSupport />} />
          <Route path="settings" element={<AdminSystemSettings />} />
          <Route path="logs" element={<AdminLogs />} />
          <Route path="email" element={<AdminEmail />} />
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </AdminPanelLayout>
    )
  }

  // Show login form if not admin
  return (
    <div className="min-h-screen flex bg-gray-50/30">
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg overflow-hidden">
              <img 
                src="https://bmceibdtgypgsfiyumcr.supabase.co/storage/v1/object/public/Logos/symplysis.png" 
                alt="Logo" 
                className="h-full w-full object-cover"
              />
            </div>
            <h2 className="mt-8 text-3xl font-bold text-gray-900">
              Admin Access
            </h2>
            <p className="mt-3 text-gray-600">
              Sign in with your admin account to access the admin panel
            </p>
          </div>
          
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                    placeholder="Enter your admin email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-2xl bg-red-50 border border-red-200 p-4">
                  <div className="flex">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-2xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <LoadingSpinner size="sm" className="mr-3 text-white" />
                      Signing in...
                    </div>
                  ) : (
                    'Sign in as Admin'
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              <a href="/" className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200">
                ← Back to Home
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminAccess

