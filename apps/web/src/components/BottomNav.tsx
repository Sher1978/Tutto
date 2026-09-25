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
            activeTab === 'feed' ? 'text-cyan-400 scale-105 font-bold' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Аукцион</span>
        </button>

        {/* My Bids / Deals Tab */}
        <button
          onClick={() => handleTabClick('my-bids')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'my-bids' ? 'text-cyan-400 scale-105 font-bold' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px]">Отклики</span>
        </button>

        {/* Create Request (+ Center Button) */}
        <button
          onClick={() => handleTabClick('create')}
          className="flex flex-col items-center gap-1 -mt-4 transition-transform active:scale-95"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 text-black border-2 border-slate-950">
            <PlusCircle className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="text-[10px] text-cyan-400 font-bold">Заказ</span>
        </button>

        {/* Business & AI Tab */}
        <button
          onClick={() => handleTabClick('business')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'business' ? 'text-purple-400 scale-105 font-bold' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Briefcase className="w-5 h-5" />
          <span className="text-[10px]">Бизнес / AI</span>
        </button>

        {/* Profile Tab */}
        <button
          onClick={() => handleTabClick('profile')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'profile' ? 'text-cyan-400 scale-105 font-bold' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px]">Профиль</span>
        </button>
      </div>
    </nav>
  )
}
