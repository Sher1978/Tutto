import React from 'react'
import { Send, MoreHorizontal } from 'lucide-react'
import { getTelegramUser } from '../lib/telegram'

export const Navbar: React.FC = () => {
  const user = getTelegramUser()

  return (
    <header className="w-full pt-3 pb-2 px-4 safe-area-top flex flex-col items-center justify-center">
      {/* Top Controls Row (Paper Plane & 3 Dots like Mockup) */}
      <div className="w-full max-w-lg flex items-center justify-between mb-2 px-1">
        <button className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#00F2FE] hover:bg-white/10 transition-colors">
          <Send className="w-4 h-4 fill-[#00F2FE]" />
        </button>
        <button className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:bg-white/10 transition-colors">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Giant Centered 3D Glowing Brand Logo */}
      <div className="flex flex-col items-center justify-center text-center">
        <h1 className="font-display font-black text-3xl sm:text-4xl tracking-wider flex items-center justify-center gap-2">
          <span className="glow-tutto text-[#00F2FE] drop-shadow-[0_0_25px_#00F2FE]">TUTTO</span>
          <span className="glow-minutto text-[#00FF87] drop-shadow-[0_0_25px_#00FF87]">MINUTTO</span>
        </h1>
        <p className="text-sm font-bold text-gray-200 tracking-wide mt-0.5 drop-shadow-md">
          Here, you choose!
        </p>
      </div>

      {/* User Profile & AI Manager Pill Container (1:1 Mockup) */}
      <div className="w-full max-w-lg mt-3.5 px-3.5 py-2.5 rounded-2xl bg-[#121826]/90 border border-white/12 backdrop-blur-xl flex items-center justify-between shadow-xl">
        {/* Left: User Info */}
        <div className="flex items-center gap-2.5">
          <img
            src={user?.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
            alt="User avatar"
            className="w-9 h-9 rounded-full border-2 border-[#00FF87] object-cover"
          />
          <div className="flex flex-col">
            <span className="text-xs font-black text-white leading-tight">
              {user?.first_name || 'Kaitlyn L.'} <span className="text-gray-400 font-normal">| @{user?.username || 'kaitlyn.l'}</span>
            </span>
            <span className="text-[10px] text-[#00FF87] font-bold flex items-center gap-1 mt-0.5">
              4.9 ★ <span className="w-1.5 h-1.5 rounded-full bg-[#00FF87] animate-ping" /> <span className="text-gray-300">Online</span>
            </span>
          </div>
        </div>

        {/* Right: AI Sales Agent Status Pill */}
        <div className="px-3 py-1.5 rounded-xl bg-[#0D1524] border border-[#00FF87]/40 flex items-center gap-2 text-[10px]">
          <span className="w-2 h-2 rounded-full bg-[#00FF87] shadow-[0_0_10px_#00FF87]" />
          <div className="flex flex-col">
            <span className="font-extrabold text-[#00FF87] uppercase tracking-wider text-[9px]">AI SALES AGENT</span>
            <span className="text-gray-300 font-medium text-[8px]"><span className="text-[#00FF87] font-bold">ACTIVE</span> • Online</span>
            <span className="text-gray-400 text-[7.5px]">Response Time: &lt;1m</span>
          </div>
        </div>
      </div>
    </header>
  )
}
