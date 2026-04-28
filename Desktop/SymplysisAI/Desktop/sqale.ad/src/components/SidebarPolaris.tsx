import React, { useState, useCallback, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Home,
  Layout,
  Type,
  Image,
  Mic,
  LogOut,
  User,
  HelpCircle,
  RefreshCw,
  ArrowUp,
  ChevronDown,
  Users,
  Clapperboard,
  Mail,
  WandSparkles,
  Menu,
  X,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../contexts/SubscriptionContext'
import { useUsageTracking, GenerationType } from '../hooks/useUsageTracking'
import { LoadingSpinner } from './ui/LoadingSpinner'

interface SidebarPolarisProps {
  isOpen?: boolean
  onClose?: () => void
}

const SidebarPolaris: React.FC<SidebarPolarisProps> = ({ isOpen, onClose }) => {
  // Default to closed on mobile, open on desktop
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // If isOpen is undefined, default based on mobile state
  const effectiveIsOpen = isOpen !== undefined ? isOpen : !isMobile
  const navigate = useNavigate()
  const location = useLocation()
  const { user, profile, signOut } = useAuth()
  const { hasAccess } = useSubscription()
  const { getCurrentCount, getLimit, getBonusCredits, refreshUsage } = useUsageTracking()

  const [isUserMenuActive, setIsUserMenuActive] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Close sidebar when navigating on mobile
  const handleNavigation = (path: string) => {
    navigate(path)
    if (onClose) {
      // Close sidebar on mobile after navigation
      setTimeout(() => {
        if (window.innerWidth < 768) {
          onClose()
        }
      }, 100)
    }
  }

  // Helper to check if a route is active
  const isActive = useCallback((path: string, tabs: string[] = []) => {
    const [pathName] = path.split('?')
    if (location.pathname === pathName) {
      if (tabs.length === 0) return true
      const currentTab = new URLSearchParams(location.search).get('tab')
      return tabs.includes(currentTab || '')
    }
    return false
  }, [location.pathname, location.search])

  // Handle Sign Out
  const handleSignOut = async () => {
    try {
      await signOut()
      setIsUserMenuActive(false)
      // Reload the page to clear all state and redirect to login
      window.location.href = '/login'
    } catch (error) {
      console.error('Error signing out:', error)
      // Still reload even if there's an error
      window.location.href = '/login'
    }
  }

  // Handle Usage Refresh
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshUsage()
    } finally {
      setIsRefreshing(false)
    }
  }

  // Navigation Items Configuration
  const navGroups = useMemo(() => ([
    {
      title: 'AI Tools',
      items: [
        {
          label: 'Dashboard',
          path: '/home',
          icon: Home,
          active: isActive('/home'),
        },
        {
          label: 'Ad Copy',
          path: '/ad-copy-generator',
          icon: Type,
          active: isActive('/ad-copy-generator'),
          featureType: 'adcopy' as GenerationType,
        },
        {
          label: 'Voiceover',
          path: '/voiceover-generator',
          icon: Mic,
          active: isActive('/voiceover-generator'),
          featureType: 'voiceover' as GenerationType,
        },
        {
          label: 'Poster',
          path: '/poster-generator',
          icon: Image,
          active: isActive('/poster-generator'),
          featureType: 'poster' as GenerationType,
        },
        {
          label: 'Landing Page',
          path: '/landing-page-generator',
          icon: Layout,
          active: isActive('/landing-page-generator'),
          featureType: 'landing_page' as GenerationType,
        },
      ],
    },
    {
      title: 'Future Tools',
      items: [
        { label: 'UGC Videos', path: '/ugc-videos', icon: Clapperboard, active: isActive('/ugc-videos'), badge: 'Soon' },
        { label: 'Email Maker', path: '/email-maker', icon: Mail, active: isActive('/email-maker'), badge: 'Soon' },
        { label: 'Researcher', path: '/product-researcher', icon: WandSparkles, active: isActive('/product-researcher'), badge: 'Soon' },
      ],
    },
    {
      title: 'Account',
      items: [
        { label: 'Affiliate', path: '/affiliate', icon: Users, active: isActive('/affiliate') || isActive('/dashboard/affiliate') },
        { label: 'Support', path: '/support', icon: HelpCircle, active: isActive('/support') },
      ],
    }
  ]), [isActive])

  // Dynamic Credits Logic
  const activeFeature = useMemo(() => {
    for (const group of navGroups) {
      for (const item of group.items) {
        if (item.active && 'featureType' in item && item.featureType) {
          return { name: item.label, type: item.featureType as GenerationType }
        }
      }
    }
    return null
  }, [navGroups])

  const showCredits = !!activeFeature && hasAccess
  const { name: featureName, type: featureType } = activeFeature || {}

  // Get actual user credits
  const currentUsage = hasAccess && featureType ? getCurrentCount(featureType) : 0
  const monthlyLimit = hasAccess && featureType ? getLimit(featureType) : 0
  const bonusCredits = hasAccess && featureType ? getBonusCredits(featureType) : 0
  const totalLimit = monthlyLimit + bonusCredits
  const usagePercent = totalLimit > 0 ? (currentUsage / totalLimit) * 100 : 0

  // User details
  const displayName = profile?.name || user?.email?.split('@')[0] || 'User'
  const displayEmail = user?.email || 'user@email.com'

  const UserMenu = () => (
    <div className="relative w-full">
      <button
        onClick={() => setIsUserMenuActive(!isUserMenuActive)}
        className="w-full flex items-center justify-between p-3 rounded-xl transition-all duration-150 ease-in-out hover:bg-slate-50 border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md"
      >
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
            {displayName?.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col text-left min-w-0">
            <span className="text-sm font-semibold text-slate-900 truncate">
              {displayName}
            </span>
            <span className="text-xs text-slate-500 truncate">
              {displayEmail}
            </span>
          </div>
        </div>
        <ChevronDown size={18} className={`text-slate-500 transition-transform ${isUserMenuActive ? 'rotate-180' : 'rotate-0'}`} />
      </button>

      {isUserMenuActive && (
        <div className="absolute bottom-full left-0 mb-2 w-full bg-white shadow-2xl rounded-xl z-50 border border-slate-200 p-2">
          <div className="space-y-1">
            <MenuItem label="My account" icon={User} onClick={() => { handleNavigation('/settings/info'); setIsUserMenuActive(false) }} />
            <MenuItem label="Support" icon={HelpCircle} onClick={() => { handleNavigation('/support'); setIsUserMenuActive(false) }} />
            <div className="border-t border-slate-200 my-1"></div>
            <MenuItem label="Sign out" icon={LogOut} onClick={handleSignOut} isDestructive />
          </div>
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Mobile Overlay */}
      {onClose && (
        <div
          className={`fixed inset-0 bg-black/50 z-[90] transition-opacity duration-300 md:hidden ${effectiveIsOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`flex flex-col w-64 h-screen bg-white border-r border-slate-200 shadow-lg text-slate-900 transition-all duration-300 ${onClose
            ? `fixed left-0 top-0 z-[100] md:relative md:z-auto transform ${effectiveIsOpen ? 'translate-x-0' : '-translate-x-full'
            }`
            : ''
          }`}
      >
        {/* Header/Title - Hidden on mobile */}
        {!onClose && (
          <div className="flex items-center gap-3 flex-shrink-0 relative" style={{ height: '60px', paddingTop: '14px', paddingBottom: '15px', paddingLeft: '24px', paddingRight: '24px' }}>
            <a href="/home" className="flex items-center gap-3 w-full" onClick={(e) => { e.preventDefault(); handleNavigation('/home') }}>
              <img
                src="https://auth.symplysis.com/storage/v1/object/public/Logos/Symplysis%20Logo/SymplyssAI.png"
                alt="Symplysis Logo"
                className="h-8 w-auto"
              />
              <span className="text-2xl font-bold tracking-tight text-slate-900 hover:text-blue-600 transition-colors">
                SymplysisAI
              </span>
            </a>
          </div>
        )}

        {/* Mobile User Profile Header - Only on mobile */}
        {onClose && (
          <div className="flex-shrink-0" style={{ marginTop: '10px', paddingLeft: '16px', paddingRight: '8px' }}>
            <div className="relative w-full flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <button
                  onClick={() => setIsUserMenuActive(!isUserMenuActive)}
                  className="w-full flex items-center justify-between p-3 rounded-xl transition-all duration-150 ease-in-out hover:bg-slate-50 border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md"
                >
                  <div className="flex flex-col text-left min-w-0 flex-1">
                    <span className="text-sm font-semibold text-slate-900 truncate">
                      {displayName}
                    </span>
                    <span className="text-xs text-slate-500 truncate">
                      {displayEmail}
                    </span>
                  </div>
                  <ChevronDown size={18} className={`text-slate-500 transition-transform flex-shrink-0 ${isUserMenuActive ? 'rotate-180' : 'rotate-0'}`} />
                </button>

                {isUserMenuActive && (
                  <div className="absolute top-full left-0 mt-2 bg-white shadow-2xl rounded-xl z-50 border border-slate-200 p-2" style={{ width: 'calc(100% - 48px)' }}>
                    <div className="space-y-1">
                      <MenuItem label="My account" icon={User} onClick={() => { handleNavigation('/settings/info'); setIsUserMenuActive(false) }} />
                      <MenuItem label="Support" icon={HelpCircle} onClick={() => { handleNavigation('/support'); setIsUserMenuActive(false) }} />
                      <div className="border-t border-slate-200 my-1"></div>
                      <MenuItem label="Sign out" icon={LogOut} onClick={handleSignOut} isDestructive />
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={onClose}
                className="rounded-lg hover:bg-slate-100 transition-colors flex-shrink-0"
                style={{ paddingRight: '0px', paddingLeft: '0px' }}
                aria-label="Close sidebar"
              >
                <X size={20} className="text-slate-600" />
              </button>
            </div>
          </div>
        )}

        {/* Main Navigation Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {navGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-2">
              <h3 className="text-xs font-semibold uppercase text-slate-500 tracking-wider px-3 pt-2 pb-1" style={{ paddingTop: '0px', paddingBottom: '0px' }}>
                {group.title}
              </h3>
              <nav className="space-y-1">
                {group.items.map((item) => (
                  <NavItem
                    key={item.label}
                    {...item}
                    onClick={() => handleNavigation(item.path)}
                    isActive={item.active}
                  />
                ))}
              </nav>
            </div>
          ))}
        </div>

        {/* Footer / Credits / User */}
        <div className="space-y-4 flex flex-col flex-shrink-0 border-t border-slate-200 bg-gradient-to-br from-slate-50 to-white" style={{ padding: '10px' }}>
          {/* Credits Section */}
          {showCredits && (
            <div className="space-y-3 p-4 bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-900">
                  {featureName} Credits
                </span>
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  title="Refresh Usage"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-50 transition-all disabled:opacity-50"
                >
                  {isRefreshing ? <LoadingSpinner size="sm" /> : <RefreshCw size={14} />}
                </button>
              </div>

              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${usagePercent > 80 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                      usagePercent > 50 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                        'bg-gradient-to-r from-blue-500 to-blue-600'
                    }`}
                  style={{ width: `${Math.min(usagePercent, 100)}%` }}
                ></div>
              </div>

              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-900">
                  {currentUsage} used
                </span>
                <span className="text-slate-600">
                  {totalLimit} total
                </span>
              </div>

              <button
                onClick={() => navigate('/settings/plans')}
                className="w-full flex items-center justify-center space-x-2 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
              >
                <ArrowUp size={16} />
                <span>Upgrade Plan</span>
              </button>
            </div>
          )}

          {/* User Menu - Only on desktop */}
          {!onClose && (
            <div style={{ marginTop: '10px' }}>
              <UserMenu />
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// Helper Components
interface NavItemProps {
  label: string
  path: string
  icon: React.ElementType
  onClick: () => void
  isActive: boolean
  badge?: string
  featureType?: string
}

const NavItem: React.FC<NavItemProps> = ({ label, icon: Icon, onClick, isActive, badge }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ease-in-out border ${isActive
          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm border-blue-200/50'
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-transparent'
        }`}
      style={{ minHeight: '40px' }}
    >
      <div className="flex items-center space-x-3">
        <Icon size={18} className="flex-shrink-0" />
        <span className="truncate">{label}</span>
      </div>
      {badge && (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white flex-shrink-0 shadow-sm">
          {badge}
        </span>
      )}
    </button>
  )
}

interface MenuItemProps {
  label: string
  icon: React.ElementType
  onClick: () => void
  isDestructive?: boolean
}

const MenuItem: React.FC<MenuItemProps> = ({ label, icon: Icon, onClick, isDestructive = false }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full px-3 py-2.5 text-sm rounded-xl transition-all duration-150 space-x-3 ${isDestructive
          ? 'text-red-600 hover:bg-red-50 hover:text-red-700'
          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
        }`}
    >
      <Icon size={16} className="flex-shrink-0" />
      <span className="font-medium">{label}</span>
    </button>
  )
}

export default SidebarPolaris
