import React from 'react'
import { Home, Star, Search, MessageSquare, User } from 'lucide-react'
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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bottom-nav-glass py-2.5 px-4 safe-area-bottom">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {/* 1. HOME */}
        <button
          onClick={() => handleTabClick('home')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'home'
              ? 'text-[#00F2FE] font-black glow-cyan scale-105'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[9px] uppercase tracking-wider font-extrabold">HOME</span>
        </button>

        {/* 2. MY BIDS */}
        <button
          onClick={() => handleTabClick('my-bids')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'my-bids'
              ? 'text-[#00F2FE] font-black glow-cyan scale-105'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Star className="w-5 h-5" />
          <span className="text-[9px] uppercase tracking-wider font-extrabold">MY BIDS</span>
        </button>

        {/* 3. EXPLORE */}
        <button
          onClick={() => handleTabClick('explore')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'explore'
              ? 'text-[#00F2FE] font-black glow-cyan scale-105'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Search className="w-5 h-5" />
          <span className="text-[9px] uppercase tracking-wider font-extrabold">EXPLORE</span>
        </button>

        {/* 4. CHAT */}
        <button
          onClick={() => handleTabClick('chat')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'chat'
              ? 'text-[#00F2FE] font-black glow-cyan scale-105'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[9px] uppercase tracking-wider font-extrabold">CHAT</span>
        </button>

        {/* 5. ACCOUNT */}
        <button
          onClick={() => handleTabClick('account')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'account'
              ? 'text-[#00F2FE] font-black glow-cyan scale-105'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[9px] uppercase tracking-wider font-extrabold">ACCOUNT</span>
        </button>
      </div>
    </nav>
  )
}
