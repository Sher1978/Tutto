import React from 'react'
import { Star } from 'lucide-react'
import { getTelegramUser } from '../lib/telegram'

export const Navbar: React.FC = () => {
  const user = getTelegramUser()

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
        <p className="text-xs font-semibold text-gray-300 tracking-wide mt-0.5">
          Here, you choose!
        </p>
      </div>

      {/* 4. AI Agent Status Card — Frosted Glassmorphism */}
      <div
        className="mt-3.5 rounded-3xl p-3 flex items-center justify-between"
        style={{
          background: 'rgba(255, 255, 255, 0.10)',
          backdropFilter: 'blur(30px) saturate(180%)',
          WebkitBackdropFilter: 'blur(30px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.22)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 1px 0 rgba(255, 255, 255, 0.25)',
        }}
      >
        {/* Left profile */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative shrink-0">
            <img
              src={user?.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
              alt="User avatar"
              className="w-11 h-11 rounded-full border border-white/20 object-cover"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#00FF87] border-2 border-[#0f1724]" />
          </div>
          <div className="flex flex-col min-w-0" style={{ fontFamily: "'Roboto', sans-serif" }}>
            <span className="text-xs font-bold text-white truncate">
              {user?.first_name || 'Kaitlyn L.'} <span className="text-gray-300 font-normal">| @{user?.username || 'kaitlyn.l'}</span>
            </span>
            <span className="text-[10px] text-gray-300 flex items-center gap-1 mt-0.5 font-semibold">
              4.9 <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> <span className="text-[#00FF87] font-bold">Online</span>
            </span>
          </div>
        </div>

        {/* Right AI Status Pill — Frosted Glass neon glow */}
        <div
          className="rounded-2xl px-2.5 py-1.5 text-right flex flex-col items-end justify-center shrink-0"
          style={{
            background: 'rgba(0, 255, 135, 0.12)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(0, 255, 135, 0.6)',
            boxShadow: '0 0 16px rgba(0, 255, 135, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
            fontFamily: "'Roboto', sans-serif",
          }}
        >
          <div className="flex items-center gap-1.5 text-[9px] font-bold text-[#00FF87] tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-[#00FF87] animate-ping shadow-[0_0_8px_#00FF87]" />
            <span>AI SALES AGENT</span>
          </div>
          <span className="text-[9px] font-bold text-gray-200 mt-0.5">
            <span className="text-[#00FF87]">ACTIVE</span> • Online
          </span>
          <span className="text-[8px] font-medium text-gray-300">
            Response Time: &lt;1m
          </span>
        </div>
      </div>
    </header>
  )
}

