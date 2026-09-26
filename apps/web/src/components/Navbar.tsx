import React from 'react'
import { Star, Plus, Zap, Flame } from 'lucide-react'
import { getTelegramUser, triggerHapticFeedback } from '../lib/telegram'

interface NavbarProps {
  onOpenQuickRequest?: () => void
  activeAuctionsCount?: number
  totalBidsCount?: number
  savedAmount?: number
  userRole?: 'client' | 'business'
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenQuickRequest,
  activeAuctionsCount = 0,
  totalBidsCount = 0,
  savedAmount = 85,
  userRole = 'client',
}) => {
  const user = getTelegramUser()

  const handleOpenRequest = () => {
    triggerHapticFeedback('medium')
    if (onOpenQuickRequest) {
      onOpenQuickRequest()
    }
  }

  return (
    <header
      className="w-full pb-2 px-4 safe-area-top flex flex-col"
      style={{ paddingTop: '100px' }}
    >
      {/* 1. Main Branding Block — pushed 100px down from the top edge */}
      <div className="text-center">
        <h1 className="font-display font-black text-3xl sm:text-4xl tracking-wider flex items-center justify-center gap-2">
          <span className="glow-tutto text-[#00F2FE]">TUTTO</span>
          <span className="glow-minutto text-[#00FF87]">MINUTTO</span>
        </h1>
        <p className="text-[11px] font-semibold text-gray-200 tracking-wide mt-1.5 max-w-sm mx-auto leading-relaxed" style={{ fontFamily: "'Roboto', sans-serif" }}>
          Платформа, где <span className="text-[#00FF87] font-bold">цену определяет покупатель</span>, а не продавец. Создайте заявку и получайте предложения за 1 минуту!
        </p>
      </div>

      {/* 2. Client Profile Card with Dynamic Action Pill */}
      <div
        className="mt-3.5 rounded-2xl px-3 py-1.5 flex items-center justify-between gap-2"
        style={{
          background: 'rgba(255, 255, 255, 0.10)',
          backdropFilter: 'blur(30px) saturate(180%)',
          WebkitBackdropFilter: 'blur(30px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.22)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 1px 0 rgba(255, 255, 255, 0.25)',
        }}
      >
        {/* Left profile */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative shrink-0">
            <img
              src={user?.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
              alt="User avatar"
              className="w-8 h-8 rounded-full border border-white/20 object-cover"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#00FF87] border-2 border-[#0f1724]" />
          </div>
          <div className="flex flex-col min-w-0" style={{ fontFamily: "'Roboto', sans-serif" }}>
            <span className="text-[11px] font-bold text-white truncate leading-tight">
              {user?.first_name || 'Александр'} <span className="text-gray-300 font-normal">| @{user?.username || 'alex_phuket'}</span>
            </span>
            <span className="text-[9px] text-gray-300 flex items-center gap-1 leading-none mt-0.5 font-semibold">
              4.9 <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" /> <span className="text-[#00FF87] font-bold">В сети</span>
            </span>
          </div>
        </div>

        {/* Right Client Pill: Shows Active Auctions OR '+' Create Quick Request Button */}
        {userRole === 'business' ? (
          <div
            className="rounded-xl px-2.5 py-1 text-right flex flex-col items-end justify-center shrink-0"
            style={{
              background: 'rgba(0, 255, 135, 0.12)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(0, 255, 135, 0.6)',
              boxShadow: '0 0 16px rgba(0, 255, 135, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
              fontFamily: "'Roboto', sans-serif",
            }}
          >
            <div className="flex items-center gap-1.5 text-[8.5px] font-bold text-[#00FF87] tracking-wider uppercase leading-none">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF87] animate-ping shadow-[0_0_8px_#00FF87]" />
              <span>ИИ-МЕНЕДЖЕР</span>
            </div>
            <span className="text-[8.5px] font-bold text-gray-200 mt-0.5 leading-none">
              <span className="text-[#00FF87]">АКТИВЕН</span> • В сети
            </span>
            <span className="text-[7.5px] font-medium text-gray-300 leading-none mt-0.5">
              Ответ: &lt;1 мин
            </span>
          </div>
        ) : activeAuctionsCount > 0 ? (
          <button
            onClick={handleOpenRequest}
            className="rounded-xl px-2.5 py-1 text-right flex flex-col items-end justify-center shrink-0 cursor-pointer transition-all hover:scale-105 active:scale-95"
            style={{
              background: 'rgba(0, 255, 135, 0.14)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(0, 255, 135, 0.65)',
              boxShadow: '0 0 16px rgba(0, 255, 135, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.25)',
              fontFamily: "'Roboto', sans-serif",
            }}
          >
            <div className="flex items-center gap-1 text-[8.5px] font-bold text-[#00FF87] tracking-wider uppercase leading-none">
              <Flame className="w-2.5 h-2.5 text-[#00FF87] animate-pulse" />
              <span>{activeAuctionsCount} АКТИВНЫХ АУКЦИОНА</span>
            </div>
            <span className="text-[8.5px] font-bold text-gray-200 mt-0.5 leading-none">
              {totalBidsCount} офферов • <span className="text-[#00FF87]">Экономия ${savedAmount}</span>
            </span>
          </button>
        ) : (
          <button
            onClick={handleOpenRequest}
            className="rounded-xl px-2.5 py-1 flex items-center gap-1.5 shrink-0 cursor-pointer transition-all hover:scale-105 active:scale-95 group"
            style={{
              background: 'rgba(0, 255, 135, 0.16)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(0, 255, 135, 0.7)',
              boxShadow: '0 0 18px rgba(0, 255, 135, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
              fontFamily: "'Roboto', sans-serif",
            }}
          >
            <div className="w-6 h-6 rounded-full bg-[#00FF87] text-[#03100A] flex items-center justify-center font-black text-sm shadow-[0_0_10px_#00FF87] group-hover:rotate-90 transition-transform duration-300">
              +
            </div>
            <div className="flex flex-col text-right">
              <span className="text-[8.5px] font-black text-[#00FF87] tracking-wider uppercase leading-none">
                СОЗДАТЬ ЗАЯВКУ
              </span>
              <span className="text-[7.5px] font-bold text-gray-200 leading-none mt-0.5">
                Запуск за 1 мин
              </span>
            </div>
          </button>
        )}
      </div>
    </header>
  )
}
