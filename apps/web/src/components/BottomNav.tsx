import React from 'react'
import { Home, ListOrdered, PlusCircle, Bookmark, User } from 'lucide-react'
import { triggerHapticFeedback } from '../lib/telegram'

export type TabId = 'home' | 'my-requests' | 'create' | 'favorites' | 'profile'

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
        {/* Home / Templates Tab */}
        <button
          onClick={() => handleTabClick('home')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'home'
              ? 'text-[#00F2FE] scale-105 font-bold glow-cyan'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Главная</span>
        </button>

        {/* My Requests & Bids Tab */}
        <button
          onClick={() => handleTabClick('my-requests')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'my-requests'
              ? 'text-[#00F2FE] scale-105 font-bold glow-cyan'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <ListOrdered className="w-5 h-5" />
          <span className="text-[10px]">Мои заявки</span>
        </button>

        {/* Create Request (+ Center Button) */}
        <button
          onClick={() => handleTabClick('create')}
          className="flex flex-col items-center gap-1 -mt-4 transition-transform active:scale-95"
        >
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#00F2FE] to-[#00FF87] flex items-center justify-center shadow-[0_0_20px_rgba(0,242,254,0.4)] text-black border-2 border-[#060911]">
            <PlusCircle className="w-7 h-7 stroke-[2.5]" />
          </div>
          <span className="text-[10px] text-[#00FF87] font-extrabold glow-green">Заявка</span>
        </button>

        {/* Favorites & Custom Templates Tab */}
        <button
          onClick={() => handleTabClick('favorites')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'favorites'
              ? 'text-[#00FF87] scale-105 font-bold glow-green'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Bookmark className="w-5 h-5" />
          <span className="text-[10px]">Избранное</span>
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
