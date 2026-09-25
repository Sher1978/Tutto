import React from 'react'
import { Home, Gavel, Search, MessageSquare, User } from 'lucide-react'
import { triggerHapticFeedback } from '../lib/telegram'

export type TabId = 'home' | 'my-bids' | 'explore' | 'chat' | 'account'

interface BottomNavProps {
  activeTab: TabId
  onSelectTab: (tab: TabId) => void
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const handleTabClick = (tab: TabId) => {
    triggerHapticFeedback('light')
    onSelectTab(tab)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#05090f] border-t border-white/5 px-4 py-2 z-50">
      <div className="max-w-[420px] mx-auto flex justify-between items-center">
        {/* 1. HOME */}
        <button
          onClick={() => handleTabClick('home')}
          className="flex flex-col items-center gap-0.5 text-center cursor-pointer w-16"
        >
          <Home className={`w-5 h-5 ${activeTab === 'home' ? 'text-cyan-400' : 'text-slate-500/70'}`} />
          <span className={`text-[8px] tracking-wider ${activeTab === 'home' ? 'font-extrabold text-cyan-400' : 'font-medium text-slate-500/70'}`}>
            HOME
          </span>
        </button>

        {/* 2. MY BIDS */}
        <button
          onClick={() => handleTabClick('my-bids')}
          className="flex flex-col items-center gap-0.5 text-center cursor-pointer w-16"
        >
          <Gavel className={`w-5 h-5 ${activeTab === 'my-bids' ? 'text-cyan-400' : 'text-slate-500/70'}`} />
          <span className={`text-[8px] tracking-wider ${activeTab === 'my-bids' ? 'font-extrabold text-cyan-400' : 'font-medium text-slate-500/70'}`}>
            MY BIDS
          </span>
        </button>

        {/* 3. EXPLORE */}
        <button
          onClick={() => handleTabClick('explore')}
          className="flex flex-col items-center gap-0.5 text-center cursor-pointer w-16"
        >
          <Search className={`w-5 h-5 ${activeTab === 'explore' ? 'text-cyan-400' : 'text-slate-500/70'}`} />
          <span className={`text-[8px] tracking-wider ${activeTab === 'explore' ? 'font-extrabold text-cyan-400' : 'font-medium text-slate-500/70'}`}>
            EXPLORE
          </span>
        </button>

        {/* 4. CHAT */}
        <button
          onClick={() => handleTabClick('chat')}
          className="flex flex-col items-center gap-0.5 text-center cursor-pointer w-16"
        >
          <MessageSquare className={`w-5 h-5 ${activeTab === 'chat' ? 'text-cyan-400' : 'text-slate-500/70'}`} />
          <span className={`text-[8px] tracking-wider ${activeTab === 'chat' ? 'font-extrabold text-cyan-400' : 'font-medium text-slate-500/70'}`}>
            CHAT
          </span>
        </button>

        {/* 5. ACCOUNT */}
        <button
          onClick={() => handleTabClick('account')}
          className="flex flex-col items-center gap-0.5 text-center cursor-pointer w-16"
        >
          <User className={`w-5 h-5 ${activeTab === 'account' ? 'text-cyan-400' : 'text-slate-500/70'}`} />
          <span className={`text-[8px] tracking-wider ${activeTab === 'account' ? 'font-extrabold text-cyan-400' : 'font-medium text-slate-500/70'}`}>
            ACCOUNT
          </span>
        </button>
      </div>
    </nav>
  )
}

