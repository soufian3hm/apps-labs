import React, { useState, useEffect, Suspense } from 'react'
import { useLocation, Navigate, useNavigate, Outlet } from 'react-router-dom'
import { AppProvider } from '@shopify/polaris'
import '@shopify/polaris/build/esm/styles.css'
import '../theme/polaris-custom.css'
import { useSubscription } from '../contexts/SubscriptionContext'
import { useUserProfile } from '../contexts/UserProfileContext'
import { AlertCircle, CreditCard } from 'lucide-react'
import SidebarPolaris from './SidebarPolaris'
import MobileHeader from './MobileHeader'
import { LoadingSpinner } from './ui/LoadingSpinner'

const Dashboard: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { subscription } = useSubscription()
  const { profile } = useUserProfile()

  // Mobile sidebar state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setIsMobileSidebarOpen(false)
      }
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close mobile sidebar when route changes
  useEffect(() => {
    if (isMobile) {
      setIsMobileSidebarOpen(false)
    }
  }, [location.pathname, isMobile])

  // Check if subscription renewal failed
  // This happens when:
  // 1. User has stripe_subscription_id (had a paid subscription)
  // 2. AND subscription_status is 'expired' 
  // 3. AND subscription_plan is 'free' (downgraded after failure)
  // OR subscription_plan is not 'free' but status is 'expired' and endDate passed
  const hasFailedRenewal = profile && (
    (profile.subscription_status === 'expired' &&
      profile.subscription_plan === 'free' &&
      profile.stripe_subscription_id) || // Downgraded to free after failure
    (profile.subscription_status === 'expired' &&
      profile.subscription_plan !== 'free' &&
      profile.subscription_end_date &&
      new Date(profile.subscription_end_date) < new Date()) // Expired but not yet downgraded
  )

  // If on /dashboard, redirect to /home
  if (location.pathname === '/dashboard') {
    return <Navigate to="/home" replace />
  }

  // Redirect symplysis?tab= routes to clean paths
  if (location.pathname === '/symplysis') {
    const params = new URLSearchParams(location.search)
    const tab = params.get('tab')

    if (tab === 'ad-copy-generator') {
      return <Navigate to="/ad-copy-generator" replace />
    }
    if (tab === 'landing-page') {
      return <Navigate to="/landing-page-generator" replace />
    }
    if (tab === 'poster-generator') {
      return <Navigate to="/poster-generator" replace />
    }
    if (tab === 'voiceover-generator') {
      return <Navigate to="/voiceover-generator" replace />
    }

    return <Navigate to="/home" replace />
  }

  return (
    <AppProvider i18n={{}}>
      <div className="flex h-screen w-full">
        {/* Sidebar - Fixed positioning on the left */}
        <div className="fixed left-0 top-0 h-full z-[100] md:z-10">
          <SidebarPolaris
            isOpen={!isMobile || isMobileSidebarOpen}
            onClose={isMobile ? () => setIsMobileSidebarOpen(false) : undefined}
          />
        </div>

        {/* Main Content - With left margin for sidebar on desktop only */}
        <div className="flex-1 md:ml-64 flex flex-col overflow-hidden">
          {/* Mobile Header - Sticky at top, only visible on mobile */}
          <MobileHeader onOpenSidebar={() => setIsMobileSidebarOpen(true)} />

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-auto">
            {/* Subscription Paused Notification Banner */}
            {hasFailedRenewal && (
              <div className="sticky top-16 md:top-0 z-40 bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-200 shadow-sm">
                <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="flex-shrink-0 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 p-2">
                        <AlertCircle className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-slate-900 mb-0.5">
                          Subscription Paused
                        </h3>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          We couldn't charge your payment method. Please update your payment method to continue your subscription.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => navigate('/settings/billing')}
                        className="inline-flex items-center gap-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-orange-600 to-red-600 text-white hover:shadow-lg hover:shadow-orange-200 h-8 px-3 shadow-md transition-all active:scale-[98%]"
                      >
                        <CreditCard className="h-3.5 w-3.5" />
                        Update Payment
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Outlet renders the matched child route component with Suspense for lazy loading */}
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <LoadingSpinner size="lg" className="mx-auto mb-3" />
                    <p className="text-sm font-medium text-slate-600">Loading...</p>
                  </div>
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </div>
        </div>
      </div>
    </AppProvider>
  )
}

export default Dashboard
