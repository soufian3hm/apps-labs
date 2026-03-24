'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMemo } from 'react'
import { 
  IconLayoutDashboard, 
  IconSettings, 
  IconLogout, 
  IconLayers, 
  IconFileText,
  IconReceipt
} from '@/components/icons'
import { getAdminCopy } from '@/lib/appslabs-admin-copy'

export function AdminSidebar({ user, locale }: { user: any, locale: string }) {
  const pathname = usePathname()
  const copy = useMemo(() => getAdminCopy(locale), [locale])

  const navItems = [
    { 
      label: copy.sidebar.pipeline, 
      href: `/${locale}/admin`, 
      icon: <IconLayoutDashboard size={20} /> 
    },
    { 
      label: copy.sidebar.tasks, 
      href: `/${locale}/admin/tasks`, 
      icon: <IconFileText size={20} /> 
    },
    {
      label: locale === 'ar' ? 'الفواتير' : 'Invoices',
      href: `/${locale}/admin/invoices`,
      icon: <IconReceipt size={20} />
    },
    { 
      label: copy.sidebar.settings, 
      href: `/${locale}/admin/settings`, 
      icon: <IconSettings size={20} /> 
    },
    { 
      label: copy.sidebar.visitSite, 
      href: `/${locale}`, 
      icon: <IconLayers size={20} /> 
    }
  ]

  const activeClass = "bg-accent/10 text-accent font-semibold"
  const inactiveClass = "text-fg-muted hover:bg-bg-alt hover:text-fg"
  const isItemActive = (href: string) => {
    if (href === `/${locale}`) return false
    if (href === `/${locale}/admin`) return pathname === href
    return pathname.startsWith(href)
  }
  const activeNav = navItems.find((item) => isItemActive(item.href)) || navItems[0]

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50 border-b border-edge/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,245,239,0.95))] px-4 py-3 shadow-[0_12px_28px_rgba(0,0,0,0.06)] lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">Apps Labs</p>
            <p className="mt-1 truncate text-sm font-bold text-fg">{activeNav.label}</p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-fg text-sm font-black text-bg shadow-[0_10px_24px_rgba(0,0,0,0.12)]">
            {user?.email?.[0]?.toUpperCase() || 'A'}
          </div>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-edge/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,245,239,0.96))] px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 shadow-[0_-12px_28px_rgba(0,0,0,0.06)] lg:hidden">
        <div className="grid grid-cols-5 gap-2">
          {navItems.map((item) => {
            const isActive = isItemActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2.5 text-[10px] font-black tracking-[0.14em] transition-all ${isActive ? 'bg-fg text-bg shadow-[0_10px_24px_rgba(0,0,0,0.12)]' : 'text-fg-muted hover:bg-bg-alt hover:text-fg'}`}
              >
                {item.icon}
                <span className="truncate">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      <aside className="hidden lg:flex fixed top-0 left-0 bottom-0 w-64 bg-surface border-r border-edge z-50">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-8 border-b border-edge flex items-center justify-between">
            <Link href={`/${locale}/admin`} className="font-display font-bold text-2xl tracking-tight text-fg">
              Apps Labs
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = isItemActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
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
                <p className="text-xs text-fg-tertiary truncate">{copy.sidebar.administrator}</p>
              </div>
            </div>

            <form action="/auth/signout" method="post">
              <button 
                type="submit"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-500 hover:bg-red-500/10 font-medium transition-colors"
              >
                <IconLogout size={20} />
                {copy.sidebar.signOut}
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  )
}
