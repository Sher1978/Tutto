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
      <div className="mt-4 text-center">
        <h1 className="text-3xl font-black tracking-widest text-cyan-400 uppercase font-sans drop-shadow-[0_0_20px_rgba(0,242,254,0.6)]">
          TUTTO MINUTTO
        </h1>
        <p className="text-xs font-light text-white/70 tracking-wide mt-0.5">
          Here, you choose!
        </p>
      </div>

      {/* 4. AI Agent Status Card */}
      <div className="mt-4 grid grid-cols-12 gap-2 bg-slate-900/50 backdrop-blur-lg border border-white/10 rounded-2xl p-3 items-center shadow-xl">
        {/* Left profile (col-span-7) */}
        <div className="col-span-7 flex items-center gap-2.5">
          <img
            src={user?.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
            alt="User avatar"
            className="w-11 h-11 rounded-full border border-white/20 object-cover"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-white truncate">
              {user?.first_name || 'Kaitlyn L.'} | @{user?.username || 'kaitlyn.l'}
            </span>
            <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
              4.9 <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> <span className="text-emerald-400 font-medium">Online</span>
            </span>
          </div>
        </div>

        {/* Right status (col-span-5) */}
        <div className="col-span-5 bg-emerald-950/40 border border-emerald-500/20 rounded-xl p-2 text-right flex flex-col justify-center items-end">
          <div className="flex items-center text-[9px] font-bold text-emerald-400 tracking-wider">
            <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full inline-block mr-1 animate-pulse" />
            <span>AI SALES AGENT</span>
          </div>
          <span className="text-[9px] font-medium text-emerald-400/80">
            ACTIVE • Online
          </span>
          <span className="text-[9px] font-light text-gray-400 mt-0.5">
            Response Time: &lt;1m
          </span>
        </div>
      </div>
    </header>
  )
}

