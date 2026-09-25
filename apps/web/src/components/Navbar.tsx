import React from 'react'
import { MapPin, Bell, Sparkles, Shield } from 'lucide-react'
import { HUBS } from '../data/mockData'
import { HubId } from '../types'
import { getTelegramUser } from '../lib/telegram'

interface NavbarProps {
  currentHub: HubId
  onSelectHub: (hub: HubId) => void
  onOpenBusinessProfile: () => void
}

export const Navbar: React.FC<NavbarProps> = ({
  currentHub,
  onSelectHub,
  onOpenBusinessProfile,
}) => {
  const activeHub = HUBS.find((h) => h.id === currentHub) || HUBS[0]
  const user = getTelegramUser()

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 px-4 py-3 safe-area-top">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Brand Logo & Hub Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-5 h-5 text-black font-bold" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-lg tracking-tight text-white flex items-center gap-1">
                Need<span className="text-cyan-400">Tnow</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-gray-400 -mt-1 font-semibold">
                Reverse Auction
              </span>
            </div>
          </div>

          {/* Hub Dropdown Selector */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-200 hover:border-cyan-400/50 transition-all">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-medium">{activeHub.flag} {activeHub.nameRu}</span>
            </button>
            
            <div className="absolute left-0 top-full mt-2 w-48 py-2 bg-slate-900/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl hidden group-hover:block z-50">
              <div className="px-3 py-1 text-[11px] uppercase tracking-wider text-gray-400 font-bold">
                Выберите Хаб
              </div>
              {HUBS.map((hub) => (
                <button
                  key={hub.id}
                  onClick={() => onSelectHub(hub.id)}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                    hub.id === currentHub
                      ? 'bg-cyan-500/10 text-cyan-400 font-semibold'
                      : 'text-gray-300 hover:bg-white/5'
                  }`}
                >
                  <span>{hub.flag} {hub.nameRu}</span>
                  {hub.id === currentHub && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-2">
          <button 
            onClick={onOpenBusinessProfile}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold hover:bg-purple-500/20 transition-all"
          >
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">PRO / AI</span>
          </button>

          <button className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-400" />
          </button>

          {user && (
            <img
              src={user.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={user.first_name}
              className="w-9 h-9 rounded-xl border border-cyan-400/40 object-cover"
            />
          )}
        </div>
      </div>
    </header>
  )
}
