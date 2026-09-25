import React, { useState, useEffect } from 'react'
import { Sparkles, Users, Zap } from 'lucide-react'
import { RequestItem } from '../types'

interface MockupAuctionSectionProps {
  onSelectHub: (hub: string) => void
  activeHub: string
  activeCategory: string | null
  onSelectCategory: (cat: string | null) => void
  onOpenBidModal: (request: RequestItem) => void
  requests: RequestItem[]
}

export const MockupAuctionSection: React.FC<MockupAuctionSectionProps> = ({
  onSelectHub,
  activeHub,
  activeCategory,
  onSelectCategory,
  onOpenBidModal,
  requests,
}) => {
  const [timer1, setTimer1] = useState('00:04:18')
  const [timer2, setTimer2] = useState('00:09:55')

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      const s1 = (18 - (now.getSeconds() % 18)).toString().padStart(2, '0')
      const s2 = (55 - (now.getSeconds() % 55)).toString().padStart(2, '0')
      setTimer1(`00:04:${s1}`)
      setTimer2(`00:09:${s2}`)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const mainRequest = requests[0] || {
    id: 'req-ayana',
    title: 'AYANA Resort - Ocean View Suite',
    hub: 'bali',
    district: 'Jimbaran',
    budget: 345,
    bidsCount: 12,
  }

  const phuketRequest: RequestItem = {
    id: 'req-phuket',
    clientId: 'usr-kata',
    clientName: 'Alex P.',
    clientAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    clientRating: 4.8,
    hub: 'phuket' as any,
    district: 'Kata Beach',
    categoryL1Id: 'cat-realestate',
    categoryL1Name: 'Resorts & Villas',
    title: 'Kata Rocks Sunset Villa',
    description: 'Cliffside ocean view luxury villa with infinity pool.',
    budget: 410,
    currency: 'USD',
    mediaUrls: ['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600'],
    isFeatured: true,
    status: 'open',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
    auctionEndsAt: new Date(Date.now() + 9 * 60 * 1000 + 55 * 1000).toISOString(),
    bidsCount: 8,
  }

  const hubsList = [
    { id: 'bali', label: '🌴 BALI' },
    { id: 'phuket', label: 'PHUKET' },
    { id: 'bangkok', label: 'BANGKOK' },
    { id: 'seoul', label: 'SEOUL' },
    { id: 'tokyo', label: 'TOKYO' },
  ]

  const categoryTiles = [
    {
      id: 'resorts',
      label: 'RESORTS',
      icon: '🌴',
      styleClass:
        'bg-gradient-to-br from-[#054838]/85 to-[#0c201a]/95 border border-[#00FF87]/50 shadow-[0_8px_24px_rgba(0,255,135,0.25)]',
    },
    {
      id: 'tours',
      label: 'TOURS',
      icon: '✈️',
      styleClass:
        'bg-gradient-to-br from-[#043d54]/85 to-[#0a1b28]/95 border border-[#00F2FE]/50 shadow-[0_8px_24px_rgba(0,242,254,0.25)]',
    },
    {
      id: 'experiences',
      label: 'EXPERIENCES',
      icon: '🥂',
      styleClass:
        'bg-gradient-to-br from-[#4d3805]/85 to-[#201a0a]/95 border border-amber-400/50 shadow-[0_8px_24px_rgba(255,179,2,0.25)]',
    },
    {
      id: 'yachts',
      label: 'YACHTS',
      icon: '⛵',
      styleClass:
        'bg-gradient-to-br from-[#0b2b40]/85 to-[#08131d]/95 border border-[#00F2FE]/40 shadow-[0_8px_24px_rgba(0,242,254,0.2)]',
    },
    {
      id: 'stay',
      label: 'STAY!',
      icon: '🏎️',
      styleClass:
        'bg-gradient-to-br from-[#4d1010]/85 to-[#200a0a]/95 border border-rose-500/50 shadow-[0_8px_24px_rgba(255,42,109,0.25)]',
    },
  ]

  return (
    <div className="w-full space-y-4">
      {/* 1. ASIAN HUBS (1:1 Mockup Selector) */}
      <div className="space-y-2">
        <h2 className="text-xs uppercase tracking-widest font-black text-gray-300 font-display">
          ASIAN HUBS
        </h2>
        <div className="flex items-center justify-between overflow-x-auto pb-1 no-scrollbar gap-2">
          {hubsList.map((h) => {
            const isActive = activeHub.toLowerCase() === h.id
            return (
              <button
                key={h.id}
                onClick={() => onSelectHub(h.id)}
                className={`text-xs font-black uppercase tracking-wider transition-all py-1 shrink-0 cursor-pointer ${
                  isActive
                    ? 'text-[#00FF87] border-b-2 border-[#00FF87] drop-shadow-[0_0_10px_rgba(0,255,135,0.6)]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {h.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* 2. 3D GLOSSY CATEGORY TILES (1:1 Mockup 5-Column Grid) */}
      <div className="grid grid-cols-5 gap-2">
        {categoryTiles.map((cat) => {
          const isActive = activeCategory === cat.id || (cat.id === 'resorts' && !activeCategory)
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(isActive ? null : cat.id)}
              className={`p-2.5 rounded-2xl flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                cat.styleClass
              } ${isActive ? 'scale-105 shadow-[0_0_25px_rgba(0,242,254,0.5)] ring-1 ring-white/30' : 'opacity-85 hover:opacity-100'}`}
            >
              <span className="text-2xl mb-1 drop-shadow-md">{cat.icon}</span>
              <span className="text-[8.5px] font-black uppercase tracking-wider text-white font-display">
                {cat.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* 3. LIVE REVERSE AUCTIONS (1:1 Mockup Layout) */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between">
          <h2 className="text-xs uppercase tracking-widest font-black text-white font-display flex items-center gap-1.5">
            <span>LIVE REVERSE AUCTIONS</span>
            <span className="w-2 h-2 rounded-full bg-[#00FF87] animate-ping" />
          </h2>
          <span className="text-[10px] text-[#00FF87] font-bold flex items-center gap-1 drop-shadow-[0_0_8px_rgba(0,255,135,0.6)]">
            <Sparkles className="w-3 h-3" /> Live Feed
          </span>
        </div>

        {/* Main Card + Side Overlapping Card Container */}
        <div className="relative flex items-stretch">
          {/* Main AYANA Resort Auction Card */}
          <div className="w-[78%] shrink-0 bg-[#121927]/95 backdrop-blur-xl border border-white/14 rounded-3xl p-3.5 shadow-2xl flex flex-col justify-between space-y-3 relative z-10">
            {/* Title Subheader inside Card */}
            <div>
              <h3
                onClick={() => onOpenBidModal(mainRequest)}
                className="font-display font-black text-sm text-white hover:text-[#00F2FE] transition-colors cursor-pointer leading-tight"
              >
                <span className="text-[#00FF87]">BALI:</span> AYANA Resort - Ocean View Suite
              </h3>
              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                5★ Resort, Jimbaran
              </p>
            </div>

            {/* Middle Layout: Left Photo + Right Price/Timer Block */}
            <div className="flex items-center gap-2.5">
              {/* Left Photo Thumbnail */}
              <div className="w-28 h-28 rounded-2xl overflow-hidden shrink-0 border border-white/12 shadow-lg relative group">
                <img
                  src="https://images.unsplash.com/photo-1613977257363-707ba9348227?w=600"
                  alt="AYANA Resort Villa"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>

              {/* Right Details Block */}
              <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                <div>
                  <div className="flex items-baseline justify-between text-[11px] text-gray-400">
                    <span className="truncate">Current Low Bid:</span>
                    <span className="text-sm font-black text-[#00FF87] font-display glow-price ml-1">
                      $345
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between text-[10px] text-gray-400 mt-0.5">
                    <span>Original Price:</span>
                    <span className="line-through text-gray-400 font-bold ml-1">$980</span>
                  </div>
                  <div className="text-[10px] text-gray-300 font-semibold mt-1 flex items-center gap-1">
                    <Users className="w-3 h-3 text-[#00F2FE]" />
                    <span>12 Bidders</span>
                  </div>
                </div>

                {/* Giant Glowing Timer */}
                <div className="mt-1">
                  <span className="text-2xl sm:text-3xl font-black text-[#00FF87] font-mono glow-timer leading-none tracking-wider block">
                    {timer1}
                  </span>
                </div>
              </div>
            </div>

            {/* Full Width Bright Gradient Action Button */}
            <button
              onClick={() => onOpenBidModal(mainRequest)}
              className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-[#00F2FE] to-[#00FF87] text-[#060911] font-display font-black text-[11px] sm:text-xs tracking-widest uppercase flex items-center justify-center gap-1.5 shadow-[0_6px_28px_rgba(0,242,254,0.45)] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-black" />
              <span>VIEW OFFER / BID NOW</span>
            </button>
          </div>

          {/* Right Side Overlapping Peek Card (Kata Rocks Phuket) */}
          <div
            onClick={() => onOpenBidModal(phuketRequest)}
            className="w-[30%] -ml-6 shrink-0 z-20 rounded-3xl overflow-hidden border border-white/20 bg-[#121927]/95 backdrop-blur-2xl p-2.5 flex flex-col justify-between shadow-[0_15px_35px_rgba(0,0,0,0.8)] cursor-pointer group hover:border-[#00F2FE]/60 transition-all"
          >
            <div className="space-y-1.5">
              <div className="w-full h-24 rounded-2xl overflow-hidden border border-white/12 relative shadow-md">
                <img
                  src="https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400"
                  alt="Kata Rocks Villa"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
              <div className="text-[9.5px] font-black text-white leading-tight">
                <span className="text-[#00F2FE] block font-bold">Phuket:</span>
                <span className="truncate block">Kata Rocks Villa</span>
              </div>
            </div>

            <div className="bg-black/60 rounded-xl p-1.5 border border-white/10 space-y-0.5 mt-1">
              <div className="text-[8px] text-gray-300 font-mono font-bold">
                TIMER <span className="text-white">{timer2}</span>
              </div>
              <div className="text-[9px] text-gray-300 font-bold flex items-baseline justify-between">
                <span>Current Bid:</span>
                <span className="text-[#00FF87] font-black text-[10px]">$410</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


