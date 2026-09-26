import React from 'react'
import { triggerHapticFeedback } from '../lib/telegram'

export type TabId = 'home' | 'my-bids' | 'explore' | 'chat' | 'account'

interface BottomNavProps {
  activeTab: TabId
  onSelectTab: (tab: TabId) => void
}

const NavIcon = ({ type, active, className }: { type: TabId, active: boolean, className: string }) => {
  if (type === 'home') {
    return active ? (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3.125L2 10.625h3v9.875h5v-6h4v6h5v-9.875h3L12 3.125z" />
      </svg>
    ) : (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    );
  }
  if (type === 'my-bids') {
    return active ? (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    ) : (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    );
  }
  if (type === 'explore') {
    return active ? (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
      </svg>
    ) : (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    );
  }
  if (type === 'chat') {
    return active ? (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM8 12c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm4 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm4 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
      </svg>
    ) : (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    );
  }
  if (type === 'account') {
    return active ? (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    ) : (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    );
  }
  return null;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const handleTabClick = (tab: TabId) => {
    triggerHapticFeedback('light')
    onSelectTab(tab)
  }

  const navItems: { id: TabId; label: string }[] = [
    { id: 'home', label: 'ГЛАВНАЯ' },
    { id: 'my-bids', label: 'ОТКЛИКИ' },
    { id: 'explore', label: 'ПОИСК' },
    { id: 'chat', label: 'ЧАТ' },
    { id: 'account', label: 'КАБИНЕТ' },
  ]

  return (
    <nav className="fixed sm:absolute bottom-0 left-0 right-0 bg-white/[0.08] backdrop-blur-2xl px-4 pt-3 pb-6 sm:pb-3 z-50">
      <div className="max-w-[390px] mx-auto flex justify-between items-center">
        {navItems.map((item) => {
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className="flex flex-col items-center gap-1 text-center cursor-pointer w-[60px]"
            >
              <NavIcon 
                type={item.id} 
                active={isActive} 
                className={`w-[24px] h-[24px] transition-all duration-300 ${isActive ? 'text-[#00F2FE] drop-shadow-[0_0_12px_rgba(0,242,254,0.7)] scale-110' : 'text-gray-500 hover:text-gray-400'}`} 
              />
              <span className={`text-[9px] tracking-wider transition-colors duration-300 font-display uppercase ${isActive ? 'font-black text-[#00F2FE] drop-shadow-[0_0_8px_rgba(0,242,254,0.6)]' : 'font-semibold text-gray-500'}`}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

