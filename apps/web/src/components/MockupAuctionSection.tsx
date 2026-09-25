import React, { useState, useEffect } from 'react'
import { Palmtree, Plane, Wine, Anchor, AlertCircle, Users } from 'lucide-react'
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

  const hubs = [
    { id: 'bali', label: 'BALI', hasIcon: true },
    { id: 'phuket', label: 'PHUKET', hasIcon: false },
    { id: 'bangkok', label: 'BANGKOK', hasIcon: false },
    { id: 'seoul', label: 'SEOUL', hasIcon: false },
    { id: 'tokyo', label: 'TOKYO', hasIcon: false },
  ]

  const categories = [
    { id: 'resorts', label: 'RESORTS', icon: Palmtree },
    { id: 'tours', label: 'TOURS', icon: Plane },
    { id: 'experiences', label: 'EXPERIENCES', icon: Wine },
    { id: 'yachts', label: 'YACHTS', icon: Anchor },
    { id: 'stay', label: 'STAY!', icon: AlertCircle },
  ]

  return (
    <div className="w-full">
      {/* В. ASIAN HUBS NAVIGATION */}
      <h2 className="mt-5 text-[11px] font-bold text-gray-400 tracking-widest uppercase">
        ASIAN HUBS
      </h2>

      {/* City Selector */}
      <div className="flex justify-between items-center mt-2 pb-2 border-b border-white/5 text-xs font-bold tracking-wider uppercase">
        {hubs.map((h) => {
          const isActive = activeHub.toLowerCase() === h.id
          return (
            <button
              key={h.id}
              onClick={() => onSelectHub(h.id)}
              className={`transition-colors flex items-center gap-1 cursor-pointer ${
                isActive ? 'text-cyan-400' : 'text-gray-500 hover:text-white'
              }`}
            >
              {isActive && h.hasIcon && <Palmtree className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{h.label}</span>
            </button>
          )
        })}
      </div>

      {/* Category Horizontal Scroll Slider */}
      <div className="flex gap-3 mt-3 overflow-x-auto no-scrollbar py-1">
        {categories.map((cat) => {
          const IconComp = cat.icon
          const isActive = activeCategory === cat.id || (cat.id === 'resorts' && !activeCategory)
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(isActive ? null : cat.id)}
              className="flex flex-col items-center gap-1 shrink-0 cursor-pointer"
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isActive
                    ? 'border border-cyan-400 bg-cyan-950/20 text-cyan-400 shadow-[0_0_15px_rgba(0,242,254,0.3)]'
                    : 'bg-slate-900/80 border border-white/10 text-white/80 hover:border-white/30'
                }`}
              >
                <IconComp className="w-5 h-5" />
              </div>
              <span
                className={`text-[9px] font-bold uppercase tracking-tight ${
                  isActive ? 'text-cyan-400' : 'text-gray-400'
                }`}
              >
                {cat.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Г. LIVE REVERSE AUCTIONS SECTION */}
      <h2 className="mt-5 text-[11px] font-bold text-cyan-400 tracking-widest uppercase flex items-center justify-between">
        <span>LIVE REVERSE AUCTIONS</span>
        <span className="flex items-center gap-1 text-emerald-400 text-[9px] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> LIVE
        </span>
      </h2>

      {/* The Grid System */}
      <div className="grid grid-cols-12 gap-3 mt-2.5 h-[240px]">
        {/* 1. Left Main Banner (col-span-8) */}
        <div className="col-span-8 relative rounded-2xl overflow-hidden border border-white/10 h-full group shadow-2xl">
          {/* Background image */}
          <img
            src="https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800"
            alt="AYANA Resort"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />

          {/* Shadow Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent flex flex-col justify-between p-2.5">
            {/* Top Left Badge */}
            <div className="self-start">
              <div className="text-[10px] font-bold text-white bg-black/40 px-2 py-1 rounded-md backdrop-blur-sm border border-white/10 inline-block leading-tight">
                BALI: AYANA Resort - Ocean View Suite
              </div>
              <div className="text-[8px] text-gray-300 mt-0.5 pl-0.5">
                5★ Resort, Jimbaran
              </div>
            </div>

            {/* Middle Right Price Blocks */}
            <div className="self-end text-right space-y-1 my-auto pr-1">
              <div className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20 inline-block backdrop-blur-sm">
                Current Low Bid: $345
              </div>
              <div className="text-[9px] font-medium text-gray-400 line-through bg-black/40 px-2 py-0.5 rounded text-right block w-fit ml-auto">
                Original Price: $980
              </div>
            </div>

            {/* Bottom Content Area */}
            <div className="w-full flex flex-col items-center">
              {/* Bidders count */}
              <div className="w-full text-left text-[9px] text-gray-300 flex items-center gap-1 mb-0.5">
                <Users className="w-3 h-3 text-cyan-400" />
                <span>12 Bidders</span>
              </div>

              {/* Large Timer */}
              <div className="text-3xl font-mono font-black text-emerald-400 tracking-wider my-0.5 drop-shadow-[0_2px_8px_rgba(16,185,129,0.3)]">
                {timer1}
              </div>

              {/* View Offer / Bid Now Button */}
              <button
                onClick={() => onOpenBidModal(mainRequest)}
                className="w-full h-9 bg-cyan-400 hover:bg-cyan-300 text-black font-black text-[10px] tracking-widest uppercase flex items-center justify-center transition-colors rounded-b-xl shadow-[0_4px_20px_rgba(0,242,254,0.4)] cursor-pointer mt-1"
              >
                VIEW OFFER / BID NOW
              </button>
            </div>
          </div>
        </div>

        {/* 2. Right Column Mini-Cards (col-span-4) */}
        <div className="col-span-4 flex flex-col gap-2 h-full">
          {/* Top Mini Card */}
          <div className="h-1/2 rounded-xl overflow-hidden border border-white/10 relative shadow-md">
            <img
              src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400"
              alt="Bali Villa"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-1 flex items-end">
              <span className="text-[8px] font-bold text-white leading-tight">Bali: Royal Pool Villa</span>
            </div>
          </div>

          {/* Bottom Mini Card (Phuket Card) */}
          <div
            onClick={() => onOpenBidModal(phuketRequest)}
            className="h-1/2 relative rounded-xl overflow-hidden border border-white/10 shadow-md group cursor-pointer"
          >
            <img
              src="https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400"
              alt="Kata Rocks Villa"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-1.5 flex flex-col justify-end">
              <div className="text-[8px] font-bold text-white leading-tight truncate">
                Phuket: Kata Rocks Villa
              </div>
              <div className="bg-black/60 backdrop-blur-xs p-1 text-[8px] rounded mt-0.5 border border-white/10">
                <div className="text-white font-mono flex items-center justify-between">
                  <span className="text-amber-400 font-bold">TIMER</span>
                  <span>{timer2}</span>
                </div>
                <div className="text-emerald-400 font-medium mt-0.5">
                  Current Bid: $410
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
