import React from 'react'
import { Menu } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface MobileHeaderProps {
  onOpenSidebar: () => void
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ onOpenSidebar }) => {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-50 flex w-full border-b border-slate-200 bg-white/95 backdrop-blur-md transition-transform duration-200 ease-in md:hidden">
      <div className="flex h-16 w-full items-center gap-3 px-4">
        <button
          onClick={onOpenSidebar}
          className="inline-flex items-center justify-center rounded-md text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background shadow-sm active:scale-[99%] transition-all duration-150 select-none bg-neutral-100 text-neutral-900 hover:bg-neutral-200 size-9 flex-none"
          aria-label="Toggle Sidebar"
        >
          <Menu className="size-5" />
          <span className="sr-only">Toggle Sidebar</span>
        </button>
        
        <div className="shrink-0 bg-slate-200 w-[1px] h-[18px]" role="none" data-orientation="vertical" />
        
        <a 
          href="/home" 
          onClick={(e) => {
            e.preventDefault()
            navigate('/home')
          }}
          className="flex items-center gap-3 flex-1 min-w-0"
        >
          <img
            src="https://auth.symplysis.com/storage/v1/object/public/Logos/Symplysis%20Logo/SymplyssAI.png"
            alt="Symplysis Logo"
            className="h-8 w-auto flex-shrink-0"
          />
          <span className="text-2xl font-bold tracking-tight text-slate-900 hover:text-blue-600 transition-colors truncate">
            SymplysisAI
          </span>
        </a>
      </div>
    </header>
  )
}

export default MobileHeader

