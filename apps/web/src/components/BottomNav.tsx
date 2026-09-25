import React from 'react'
import { Home, PlusCircle, MessageSquare, Briefcase, User } from 'lucide-react'
import { triggerHapticFeedback } from '../lib/telegram'

export type TabId = 'feed' | 'my-bids' | 'create' | 'business' | 'profile'

interface BottomNavProps {
  activeTab: TabId
  onSelectTab: (tab: TabId) => void
  onOpenCreateModal: () => void
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenCreateModal,
}) => {
  const handleTabClick = (tab: TabId) => {
    triggerHapticFeedback('light')
    if (tab === 'create') {
      onOpenCreateModal()
    } else {
      onSelectTab(tab)
    }
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-white/10 px-4 py-2 safe-area-bottom">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {/* Feed Tab */}
        <button
          onClick={() => handleTabClick('feed')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'feed'
              ? 'text-[#00F2FE] scale-105 font-bold glow-cyan'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Аукцион</span>
        </button>

        {/* My Bids / Deals Tab */}
        <button
          onClick={() => handleTabClick('my-bids')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'my-bids'
              ? 'text-[#00F2FE] scale-105 font-bold glow-cyan'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px]">Отклики</span>
        </button>

        {/* Create Request (+ Center Button with Brand Gradient) */}
        <button
          onClick={() => handleTabClick('create')}
          className="flex flex-col items-center gap-1 -mt-4 transition-transform active:scale-95"
        >
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#00F2FE] to-[#00FF87] flex items-center justify-center shadow-[0_0_20px_rgba(0,242,254,0.4)] text-black border-2 border-[#0D1117]">
            <PlusCircle className="w-7 h-7 stroke-[2.5]" />
          </div>
          <span className="text-[10px] text-[#00FF87] font-extrabold glow-green">Заказ</span>
        </button>

        {/* Business & AI Tab */}
        <button
          onClick={() => handleTabClick('business')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'business'
              ? 'text-[#00FF87] scale-105 font-bold glow-green'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Briefcase className="w-5 h-5" />
          <span className="text-[10px]">Бизнес / AI</span>
        </button>

        {/* Profile Tab */}
        <button
          onClick={() => handleTabClick('profile')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'profile'
              ? 'text-[#00F2FE] scale-105 font-bold glow-cyan'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px]">Профиль</span>
        </button>
      </div>
    </nav>
  )
}
