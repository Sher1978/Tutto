import React, { useState } from 'react'
import { triggerHapticFeedback } from '../lib/telegram'
import { Home, Star, MessageSquare, User, Search, Package, Flame, Plus } from 'lucide-react'
import { Language, t } from '../lib/i18n'

export type TabId = 'home' | 'my-bids' | 'explore' | 'chat' | 'account' | 'market' | 'mine'
export type AppMode = 'services' | 'market'

interface BottomNavProps {
  activeTab: TabId
  onSelectTab: (tab: TabId) => void
  mode: AppMode
  onCentralAction?: () => void
  currentLang?: Language
  unreadChatCount?: number
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  mode,
  onCentralAction,
  currentLang = 'ru',
  unreadChatCount = 2,
}) => {
  const [isFabClicked, setIsFabClicked] = useState(false)

  const handleFabClick = () => {
    setIsFabClicked(true)
    triggerHapticFeedback('heavy')
    if (onCentralAction) onCentralAction()
    setTimeout(() => setIsFabClicked(false), 200)
  }
  const handleTabClick = (tab: TabId) => {
    triggerHapticFeedback('light')
    onSelectTab(tab)
  }

  const servicesItems: { id: TabId; labelKey: string; icon: React.ElementType }[] = [
    { id: 'home', labelKey: 'tab_home', icon: Home },
    { id: 'my-bids', labelKey: 'tab_my_bids', icon: Star },
    { id: 'chat', labelKey: 'tab_chat', icon: MessageSquare },
    { id: 'account', labelKey: 'tab_account', icon: User },
  ]

  const marketItems: { id: TabId; labelKey: string; icon: React.ElementType }[] = [
    { id: 'market', labelKey: 'tab_market', icon: Flame },
    { id: 'explore', labelKey: 'tab_explore', icon: Search },
    { id: 'mine', labelKey: 'tab_mine', icon: Package },
    { id: 'account', labelKey: 'tab_account', icon: User },
  ]

  const currentItems = mode === 'services' ? servicesItems : marketItems

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/[0.08] backdrop-blur-2xl px-4 pt-3 pb-6 sm:pb-3 z-50 transition-colors duration-300">
      <div className="max-w-[390px] mx-auto flex justify-between items-center relative">
        {currentItems.map((item, index) => {
          const isActive = activeTab === item.id
          const Icon = item.icon
          
          return (
            <React.Fragment key={item.id}>
              {index === 2 && (
                <div className="relative flex justify-center items-center w-[60px]">
                  <button
                    type="button"
                    onClick={handleFabClick}
                    aria-label={mode === 'services' ? 'Создать заказ' : 'Добавить лот'}
                    className={`absolute -top-6 flex items-center justify-center w-[64px] h-[64px] rounded-full border-2 transition-all duration-300 shadow-xl z-[60] ${
                      mode === 'services'
                        ? 'bg-gradient-to-br from-[#00D4E8] to-[#00F2FE] border-black shadow-[0_4px_25px_rgba(0,242,254,0.4)]'
                        : 'bg-gradient-to-br from-[#B8E600] to-[#CCFF00] border-black shadow-[0_4px_25px_rgba(204,255,0,0.4)]'
                    } ${
                      isFabClicked
                        ? 'scale-95 shadow-none'
                        : 'hover:scale-105'
                    }`}
                  >
                    <Plus 
                      className="w-9 h-9 transition-all duration-300 text-[#050811]" 
                      strokeWidth={3} 
                    />
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={() => handleTabClick(item.id)}
                className="flex flex-col items-center gap-1 text-center cursor-pointer w-[60px] relative"
              >
                <div className="relative flex items-center justify-center">
                  <Icon 
                    className={`w-[24px] h-[24px] transition-all duration-300 nav-icon-morph ${
                      isActive 
                        ? (mode === 'services' 
                            ? 'text-[#00F2FE] drop-shadow-[0_0_12px_rgba(0,242,254,0.7)] scale-110' 
                            : 'text-[#CCFF00] drop-shadow-[0_0_12px_rgba(204,255,0,0.7)] scale-110')
                        : 'text-white/90 hover:text-white'
                    }`} 
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {/* Unread Chat Messages Badge on the Chat / Deals icon */}
                  {(item.id === 'chat' || item.id === 'mine') && unreadChatCount > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#00F2FE] text-[#050811] font-black text-[10px] flex items-center justify-center border border-black shadow-[0_0_8px_#00F2FE]">
                      {unreadChatCount}
                    </span>
                  )}
                </div>

                <span className={`text-[9px] tracking-wider transition-colors duration-300 font-display uppercase ${
                  isActive 
                    ? (mode === 'services'
                        ? 'font-black text-[#00F2FE] drop-shadow-[0_0_8px_rgba(0,242,254,0.6)]'
                        : 'font-black text-[#CCFF00] drop-shadow-[0_0_8px_rgba(204,255,0,0.6)]')
                    : 'font-semibold text-white/90'
                }`}>
                  {t(currentLang, item.labelKey)}
                </span>
              </button>
            </React.Fragment>
          )
        })}
      </div>
    </nav>
  )
}
