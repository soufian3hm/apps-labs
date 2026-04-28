import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useUserProfile } from '../../contexts/UserProfileContext'

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  path: string
}

interface AdminPanelLayoutProps {
  children: React.ReactNode
}

const AdminPanelLayout: React.FC<AdminPanelLayoutProps> = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, signOut } = useAuth()
  const { profile } = useUserProfile()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Check dark mode preference
  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true'
    setDarkMode(isDark)
    if (isDark) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem('darkMode', newDarkMode.toString())
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // Command palette keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowCommandPalette(true)
      }
      if (e.key === 'Escape') {
        setShowCommandPalette(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      path: 'dashboard'
    },
    {
      id: 'users',
      label: 'Users',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      path: 'users'
    },
    {
      id: 'subscriptions',
      label: 'Subscriptions',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      path: 'subscriptions'
    },
    {
      id: 'usage',
      label: 'Usage Analytics',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      path: 'usage'
    },
    {
      id: 'ai-tasks',
      label: 'AI Tasks',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      path: 'ai-tasks'
    },
    {
      id: 'content',
      label: 'Content Library',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      path: 'content'
    },
    {
      id: 'affiliates',
      label: 'Affiliates',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      path: 'affiliates'
    },
    {
      id: 'support',
      label: 'Support',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      path: 'support'
    },
    {
      id: 'email',
      label: 'Email',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      path: 'email'
    },
    {
      id: 'settings',
      label: 'System Settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      path: 'settings'
    },
    {
      id: 'logs',
      label: 'Logs',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      path: 'logs'
    }
  ]

  const currentPath = location.pathname
  const activeNavId = navItems.find(item => currentPath.includes(`/${item.path}`) || currentPath.endsWith(`/${item.path}`))?.id || 'dashboard'

  const handleSignOut = async () => {
    await signOut()
    navigate('/AdminAccess')
  }

  return (
    <div className={`min-h-screen flex ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 ${darkMode ? 'bg-gray-800 border-r border-gray-700' : 'bg-white border-r border-gray-200'} flex flex-col`}>
        {/* Logo */}
        <div className={`p-4 ${darkMode ? 'border-b border-gray-700' : 'border-b border-gray-200'} flex items-center justify-between`}>
          {sidebarOpen ? (
            <div className="flex items-center space-x-3">
              <img 
                src="https://bmceibdtgypgsfiyumcr.supabase.co/storage/v1/object/public/Logos/symplysis.png" 
                alt="Symplysis" 
                className="h-8 w-8"
              />
              <span className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>Symplysis</span>
            </div>
          ) : (
            <img 
              src="https://bmceibdtgypgsfiyumcr.supabase.co/storage/v1/object/public/Logos/symplysis.png" 
              alt="Symplysis" 
              className="h-8 w-8 mx-auto"
            />
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeNavId === item.id
            return (
              <button
                key={item.id}
                onClick={() => navigate(`/AdminAccess/${item.path}`)}
                className={`w-full flex items-center ${sidebarOpen ? 'justify-start px-4' : 'justify-center'} py-3 rounded-xl transition-all ${
                  isActive
                    ? darkMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-50 text-blue-600'
                    : darkMode
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {item.icon}
                {sidebarOpen && <span className="ml-3 font-medium">{item.label}</span>}
              </button>
            )
          })}
        </nav>

        {/* User Info */}
        <div className={`p-4 ${darkMode ? 'border-t border-gray-700' : 'border-t border-gray-200'}`}>
          <div className={`flex items-center ${sidebarOpen ? 'justify-start' : 'justify-center'} space-x-3`}>
            <div className={`h-10 w-10 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center`}>
              <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {profile?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {profile?.name || 'Admin'}
                </p>
                <p className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {user?.email}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className={`${darkMode ? 'bg-gray-800 border-b border-gray-700' : 'bg-white border-b border-gray-200'} px-6 py-4 flex items-center justify-between`}>
          <div className="flex-1 flex items-center space-x-4">
            {/* Search / Command Palette */}
            <button
              onClick={() => setShowCommandPalette(true)}
              className={`flex-1 max-w-md flex items-center space-x-3 px-4 py-2 rounded-xl ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'} hover:${darkMode ? 'bg-gray-600' : 'bg-gray-200'} transition-colors`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-sm">Search or press ⌘K</span>
              <kbd className={`ml-auto px-2 py-1 rounded text-xs ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>⌘K</kbd>
            </button>
          </div>

          <div className="flex items-center space-x-4">
            {/* Quick Actions */}
            <button className={`px-4 py-2 rounded-xl ${darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'} transition-colors text-sm font-medium`}>
              + Quick Action
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-xl ${darkMode ? 'hover:bg-gray-700 text-yellow-400' : 'hover:bg-gray-100 text-gray-600'}`}
            >
              {darkMode ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>

            {/* Profile Dropdown */}
            <div className="relative group">
              <button className={`flex items-center space-x-2 p-2 rounded-xl ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                <div className={`h-8 w-8 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center`}>
                  <span className={`text-xs font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {profile?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </button>

              {/* Dropdown Menu */}
              <div className={`absolute right-0 mt-2 w-48 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50`}>
                <div className="p-2">
                  <div className={`px-3 py-2 ${darkMode ? 'border-b border-gray-700' : 'border-b border-gray-200'}`}>
                    <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{profile?.name || 'Admin'}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user?.email}</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className={`w-full text-left px-3 py-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-red-400' : 'hover:bg-gray-100 text-red-600'} transition-colors text-sm`}
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className={`flex-1 overflow-y-auto ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
          {children}
        </main>
      </div>

      {/* Command Palette Modal */}
      {showCommandPalette && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-32" onClick={() => setShowCommandPalette(false)}>
          <div className={`w-full max-w-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl`} onClick={(e) => e.stopPropagation()}>
            <div className={`p-4 ${darkMode ? 'border-b border-gray-700' : 'border-b border-gray-200'}`}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type to search..."
                autoFocus
                className={`w-full px-4 py-3 rounded-xl ${darkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-gray-100 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            <div className={`max-h-96 overflow-y-auto p-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider">Navigation</div>
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    navigate(`/AdminAccess/${item.path}`)
                    setShowCommandPalette(false)
                  }}
                  className={`w-full text-left px-4 py-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                >
                  <div className="flex items-center space-x-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPanelLayout

