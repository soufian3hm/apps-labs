'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  IconLayoutDashboard, 
  IconSettings, 
  IconUsers, 
  IconLogout, 
  IconLayers, 
  IconFileText,
  IconMenu2, 
  IconX 
} from '@/components/icons'
import { useState } from 'react'

export function AdminSidebar({ user }: { user: any }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { 
      label: 'Pipeline', 
      href: '/en/admin', 
      icon: <IconLayoutDashboard size={20} /> 
    },
    { 
      label: 'Smart Tasks', 
      href: '/en/admin/tasks', 
      icon: <IconFileText size={20} /> 
    },
    { 
      label: 'Settings', 
      href: '/en/admin/settings', 
      icon: <IconSettings size={20} /> 
    },
    { 
      label: 'Visit Site', 
      href: '/en', 
      icon: <IconLayers size={20} /> 
    }
  ]

  const activeClass = "bg-accent/10 text-accent font-semibold"
  const inactiveClass = "text-fg-muted hover:bg-bg-alt hover:text-fg"

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-edge bg-surface sticky top-0 z-50">
        <Link href="/en/admin" className="font-display font-bold text-xl text-fg">Apps Labs</Link>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-lg border border-edge">
          {isOpen ? <IconX size={24} /> : <IconMenu2 size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40" 
          onClick={() => setIsOpen(false)} 
        />
      )}

      {/* Sidebar Content */}
      <aside className={`
        fixed top-0 left-0 bottom-0 w-64 bg-surface border-r border-edge z-50 transition-transform duration-300 lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-8 border-b border-edge flex items-center justify-between">
            <Link href="/en/admin" className="font-display font-bold text-2xl tracking-tight text-fg">
              Apps Labs
            </Link>
            <button className="lg:hidden" onClick={() => setIsOpen(false)}>
              <IconX size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 ${isActive ? activeClass : inactiveClass}`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* User Profile / Footer */}
          <div className="p-4 border-t border-edge bg-bg-alt/30">
            <div className="flex items-center gap-3 px-3 py-4 mb-3">
              <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-bold shadow-lg">
                {user?.email?.[0].toUpperCase() || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-fg truncate">
                  {user?.email?.split('@')[0]}
                </p>
                <p className="text-xs text-fg-tertiary truncate">Administrator</p>
              </div>
            </div>

            <form action="/auth/signout" method="post">
              <button 
                type="submit"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-500 hover:bg-red-500/10 font-medium transition-colors"
              >
                <IconLogout size={20} />
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  )
}
