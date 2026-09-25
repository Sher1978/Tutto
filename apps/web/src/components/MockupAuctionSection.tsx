import React, { useState, useEffect } from 'react'
import { Sparkles, Zap, Users } from 'lucide-react'
import { RequestItem } from '../types'

interface MockupAuctionSectionProps {
  onSelectHub: (hub: string) => void
  activeHub: string
  activeCategory: string | null
  onSelectCategory: (cat: string | null) => void
  onOpenBidModal: (request: RequestItem) => void
  onOpenQuickRequest: (request: RequestItem) => void
  requests: RequestItem[]
}

// Category tiles data with photo backgrounds — matching the mockup
const CATEGORY_TILES = [
  {
    id: 'cat-realestate',
    label: 'ЖИЛЬЁ',
    icon: '🏡',
    img: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=200&q=80',
    color: 'from-blue-900/80 to-blue-700/60',
  },
  {
    id: 'cat-transport',
    label: 'ТРАНСПОРТ',
    icon: '🛵',
    img: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=200&q=80',
    color: 'from-cyan-900/80 to-cyan-700/60',
  },
  {
    id: 'cat-beauty',
    label: 'КРАСОТА',
    icon: '💅',
    img: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=200&q=80',
    color: 'from-rose-900/80 to-pink-700/60',
  },
  {
    id: 'cat-services',
    label: 'УСЛУГИ',
    icon: '🔧',
    img: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=200&q=80',
    color: 'from-purple-900/80 to-pink-700/60',
  },
  {
    id: 'cat-tours',
    label: 'ТУРЫ',
    icon: '🚤',
    img: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=200&q=80',
    color: 'from-amber-900/80 to-amber-700/60',
  },
  {
    id: 'cat-exchange',
    label: 'ОБМЕН',
    icon: '💱',
    img: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=200&q=80',
    color: 'from-emerald-900/80 to-teal-700/60',
  },
]

export const MockupAuctionSection: React.FC<MockupAuctionSectionProps> = ({
  onSelectHub,
  activeHub,
  activeCategory,
  onSelectCategory,
  onOpenBidModal,
  onOpenQuickRequest,
  requests,
}) => {
  const hubsList = [
    { id: 'bali', label: '🌴 BALI' },
    { id: 'phuket', label: 'PHUKET' },
    { id: 'bangkok', label: 'BANGKOK' },
    { id: 'seoul', label: 'SEOUL' },
    { id: 'tokyo', label: 'TOKYO' },
  ]

  return (
    <div className="w-full space-y-4">
      {/* 1. ASIAN HUBS */}
      <div className="space-y-2">
        <h2
          className="text-[11px] uppercase tracking-widest font-bold text-gray-300"
          style={{ fontFamily: "'Roboto', sans-serif" }}
        >
          CHOOSE WHAT YOU NEED
        </h2>
        <div className="flex items-center overflow-x-auto pb-1 no-scrollbar gap-4">
          {hubsList.map((h) => {
            const isActive = activeHub.toLowerCase() === h.id
            return (
              <button
                key={h.id}
                onClick={() => onSelectHub(h.id)}
                className={`shrink-0 py-0.5 cursor-pointer transition-all inline-block origin-bottom ${
                  isActive
                    ? 'text-[#00FF87] border-b-2 border-[#00FF87] drop-shadow-[0_0_12px_rgba(0,255,135,0.7)]'
                    : 'text-gray-400 hover:text-white'
                }`}
                style={{
                  fontFamily: "'Barlow Condensed', 'Oswald', sans-serif",
                  fontWeight: 300,
                  fontSize: '15px',
                  letterSpacing: '-0.03em',
                  textTransform: 'uppercase',
                  transform: 'scaleY(1.12)',
                }}
              >
                {h.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* 2. FROSTED GLASS CATEGORY TILES WITH TELEGRAM EMOJIS */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 -mx-0.5 px-0.5">
        {CATEGORY_TILES.map((cat, idx) => {
          const isActive = activeCategory === cat.id || (!activeCategory && idx === 0)
          const emojiIcon =
            cat.id === 'cat-beauty' ? '💆' :
            cat.id === 'cat-realestate' ? '🏡' :
            cat.id === 'cat-transport' ? '🛵' :
            cat.id === 'cat-tours' ? '🚤' :
            cat.id === 'cat-exchange' ? '💱' : '🔧'

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(isActive ? null : cat.id)}
              className={`relative min-w-[56px] h-[60px] shrink-0 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200 group ${
                isActive
                  ? 'scale-[1.05]'
                  : 'opacity-85 hover:opacity-100 hover:scale-[1.02]'
              }`}
              style={{
                background: isActive
                  ? 'rgba(0, 255, 135, 0.12)'
                  : 'rgba(255, 255, 255, 0.07)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: isActive
                  ? '1px solid rgba(0, 255, 135, 0.6)'
                  : '1px solid rgba(255, 255, 255, 0.16)',
                boxShadow: isActive
                  ? '0 0 16px rgba(0, 255, 135, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                  : '0 8px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
              }}
            >
              {/* Active neon highlight glow */}
              {isActive && (
                <div className="absolute inset-0 rounded-2xl bg-[#00FF87]/10" />
              )}
              {/* Icon & Label (Telegram Emojis + Roboto label) */}
              <div className="relative z-10 flex flex-col items-center justify-center p-0.5 text-center">
                <span
                  className="leading-none mb-1 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] group-hover:scale-115 transition-transform"
                  style={{ fontSize: '22px' }}
                >
                  {emojiIcon}
                </span>
                <span
                  className={`text-[7px] font-bold uppercase tracking-wider leading-none text-center ${
                    isActive ? 'text-[#00FF87]' : 'text-gray-200'
                  }`}
                  style={{ fontFamily: "'Roboto', sans-serif" }}
                >
                  {cat.label}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {/* 3. LIVE REVERSE AUCTIONS */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <h2
            className="text-xs uppercase tracking-wider font-bold text-white flex items-center gap-1.5"
            style={{ fontFamily: "'Roboto', sans-serif" }}
          >
            <span>CREATE YOUR REQUEST</span>
            <span className="w-2 h-2 rounded-full bg-[#00FF87] animate-ping" />
          </h2>
          <span className="text-[10px] text-[#00FF87] font-bold flex items-center gap-1 drop-shadow-[0_0_8px_rgba(0,255,135,0.6)]" style={{ fontFamily: "'Roboto', sans-serif" }}>
            <Sparkles className="w-3 h-3" /> Live Feed
          </span>
        </div>

        {/* Horizontal slider of service creation cards — TALLER (235px) + LESS BLURRED (blur-3px) */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4 pt-1 -mx-4 px-4 pr-10">
          {requests.map((req) => {
            const coverImage =
              req.mediaUrls?.[0] ||
              'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=600'

            return (
              <div
                key={req.id}
                onClick={() => onOpenQuickRequest(req)}
                className="w-[82vw] max-w-[310px] min-h-[235px] h-[235px] shrink-0 snap-center rounded-3xl p-4 flex flex-col justify-between relative overflow-hidden z-10 transition-all duration-300 hover:scale-[1.02] cursor-pointer group border border-white/25 shadow-[0_20px_45px_rgba(0,0,0,0.6)]"
                style={{
                  background: 'rgba(10, 16, 26, 0.4)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                }}
              >
                {/* Photo background under glass — LESS BLURRED (blur-3px) and MORE VISIBLE (opacity-55) */}
                <img
                  src={coverImage}
                  alt={req.title}
                  className="absolute inset-0 w-full h-full object-cover filter blur-[3px] scale-105 opacity-55 group-hover:scale-115 transition-transform duration-500 pointer-events-none"
                />

                {/* Dark overlay gradient for contrast */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/80 pointer-events-none" />

                {/* Top: Service Title */}
                <div className="relative z-10">
                  <h3 className="font-display font-black text-sm text-white leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
                    <span className="text-[#00FF87] tracking-wider uppercase font-bold">{activeHub.toUpperCase()}:</span> {req.title}
                  </h3>
                  <p
                    className="text-[10px] text-gray-300 font-medium mt-1 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] flex items-center gap-1"
                    style={{ fontFamily: "'Roboto', sans-serif" }}
                  >
                    <span>
                      📍 {
                        activeHub.toLowerCase() === 'phuket' ? 'Patong' :
                        activeHub.toLowerCase() === 'bangkok' ? 'Thonglor' :
                        activeHub.toLowerCase() === 'seoul' ? 'Gangnam' :
                        activeHub.toLowerCase() === 'tokyo' ? 'Shibuya' : req.district
                      }
                    </span> • <span className="text-[#00FF87]">{req.categoryL1Name}</span>
                  </p>
                </div>

                {/* Middle: Giant Semi-Transparent Pulsing Plus */}
                <div className="relative z-10 flex items-center justify-center my-2">
                  <span
                    className="font-black leading-none select-none text-[#00FF87]/80 group-hover:scale-125 group-hover:text-[#00FF87] transition-all duration-300 drop-shadow-[0_0_25px_rgba(0,255,135,0.9)]"
                    style={{ fontSize: '56px', lineHeight: 1 }}
                  >
                    +
                  </span>
                </div>

                {/* Bottom: Quick Request Button (Roboto font) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onOpenQuickRequest(req)
                  }}
                  className="relative z-10 w-full py-3 rounded-xl bg-gradient-to-r from-[#00C2A8] via-[#00FF87] to-[#00F2FE] text-[#03100A] text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-all hover:brightness-110 active:scale-[0.98]"
                  style={{
                    fontFamily: "'Roboto', sans-serif",
                    boxShadow: '0 4px 24px rgba(0,255,135,0.6)',
                  }}
                >
                  <Zap className="w-4 h-4 fill-[#03100A]" />
                  <span>БЫСТРАЯ ЗАЯВКА</span>
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

