import React from 'react'
import { Send, MoreHorizontal, Wifi, Battery, Signal, Star } from 'lucide-react'
import { getTelegramUser } from '../lib/telegram'

export const Navbar: React.FC = () => {
  const user = getTelegramUser()

  return (
    <header className="w-full pt-2 pb-2 px-4 safe-area-top flex flex-col">
      {/* 1. System Status Bar (Time & System Icons) */}
      <div className="w-full flex justify-between items-center text-xs font-medium text-white/90 px-1 py-1">
        <span className="pl-1 text-white/90 font-medium">Time</span>
        <div className="flex items-center gap-1.5 text-white/80 pr-1">
          <Signal className="w-3.5 h-3.5" />
          <Wifi className="w-3.5 h-3.5" />
          <Battery className="w-4 h-4" />
        </div>
      </div>

      {/* 2. Navigation Controls (Paper Plane 45° left & 3 Dots right) */}
      <div className="flex justify-between items-center mt-2 px-1">
        <button className="text-white hover:opacity-80 transition-opacity">
          <Send className="w-5 h-5 transform rotate-45 fill-white text-white" />
        </button>
        <button className="text-white/70 hover:text-white transition-colors">
          <div className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center bg-white/5">
            <MoreHorizontal className="w-4 h-4 text-white" />
          </div>
        </button>
      </div>

      {/* 3. Main Branding Block */}
      <div className="mt-3 text-center">
        <h1 className="font-display font-black text-3xl sm:text-4xl tracking-wider flex items-center justify-center gap-2">
          <span className="glow-tutto text-[#00F2FE]">TUTTO</span>
          <span className="glow-minutto text-[#00FF87]">MINUTTO</span>
        </h1>
        <p className="text-xs font-semibold text-gray-300 tracking-wide mt-0.5">
          Here, you choose!
        </p>
      </div>

      {/* 4. AI Agent Status Card */}
      <div className="mt-3.5 bg-[#121927]/90 backdrop-blur-xl border border-white/12 rounded-3xl p-3 flex items-center justify-between shadow-2xl">
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
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-black text-white truncate font-display">
              {user?.first_name || 'Kaitlyn L.'} <span className="text-gray-400 font-normal">| @{user?.username || 'kaitlyn.l'}</span>
            </span>
            <span className="text-[10px] text-gray-300 flex items-center gap-1 mt-0.5 font-semibold">
              4.9 <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> <span className="text-[#00FF87] font-bold">Online</span>
            </span>
          </div>
        </div>

        {/* Right AI Status Pill */}
        <div className="bg-[#0b1422] border border-[#00FF87]/40 rounded-2xl px-2.5 py-1.5 text-right flex flex-col items-end justify-center shadow-[0_0_15px_rgba(0,255,135,0.2)] shrink-0">
          <div className="flex items-center gap-1.5 text-[9px] font-black text-[#00FF87] tracking-wider uppercase font-display">
            <span className="w-2 h-2 rounded-full bg-[#00FF87] animate-ping shadow-[0_0_8px_#00FF87]" />
            <span>AI SALES AGENT</span>
          </div>
          <span className="text-[9px] font-bold text-gray-300 mt-0.5">
            <span className="text-[#00FF87]">ACTIVE</span> • Online
          </span>
          <span className="text-[8px] font-medium text-gray-400">
            Response Time: &lt;1m
          </span>
        </div>
      </div>
    </header>
  )
}

