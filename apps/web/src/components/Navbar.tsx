import React from 'react'
import { getTelegramUser } from '../lib/telegram'

export const Navbar: React.FC = () => {
  const user = getTelegramUser()

  return (
    <header className="w-full pt-4 pb-2 px-4 safe-area-top flex flex-col items-center justify-center">
      {/* Giant Centered Glowing Brand Header */}
      <div className="flex flex-col items-center justify-center text-center">
        <h1 className="font-display font-black text-3xl sm:text-4xl tracking-wider flex items-center justify-center gap-2">
          <span className="glow-tutto text-[#00F2FE]">TUTTO</span>
          <span className="glow-minutto text-[#00FF87]">MINUTTO</span>
        </h1>
        <p className="text-sm font-semibold text-gray-200 tracking-wide mt-1 drop-shadow-md">
          Here, you choose!
        </p>
      </div>

      {/* User Status Bar & AI Sales Agent Status Pill */}
      <div className="w-full max-w-lg mt-4 px-3 py-2 rounded-2xl bg-[#121826]/80 border border-white/10 backdrop-blur-xl flex items-center justify-between shadow-lg">
        {/* User profile info */}
        <div className="flex items-center gap-2.5">
          <img
            src={user?.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
            alt="User avatar"
            className="w-8 h-8 rounded-full border border-[#00F2FE]/50 object-cover"
          />
          <div className="flex flex-col">
            <span className="text-xs font-extrabold text-white leading-tight">
              {user?.first_name || 'Kaitlyn L.'} <span className="text-gray-400 font-normal">| @{user?.username || 'kaitlyn.l'}</span>
            </span>
            <span className="text-[10px] text-[#00FF87] font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF87] animate-ping" />
              4.9 ★ • Online
            </span>
          </div>
        </div>

        {/* AI Sales Agent Status Pill */}
        <div className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-[#00F2FE]/15 to-[#00FF87]/15 border border-[#00FF87]/40 flex items-center gap-1.5 text-[10px]">
          <span className="w-2 h-2 rounded-full bg-[#00FF87] shadow-[0_0_8px_#00FF87]" />
          <div className="flex flex-col">
            <span className="font-extrabold text-[#00FF87] uppercase tracking-wider text-[9px]">AI Sales Agent</span>
            <span className="text-gray-300 font-medium text-[8px]">ACTIVE • Response &lt;1m</span>
          </div>
        </div>
      </div>
    </header>
  )
}
