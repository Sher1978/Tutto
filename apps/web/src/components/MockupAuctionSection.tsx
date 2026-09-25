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
      {/* 1. СЕКЦИЯ ХАБОВ (ASIAN HUBS) */}
      <h2 className="mt-4 text-[11px] font-bold text-gray-400 tracking-widest uppercase">
        ASIAN HUBS
      </h2>

      {/* City Selector (Clean Flex Gap layout without distracting lines) */}
      <div className="flex justify-between items-center mt-2 text-xs font-bold tracking-wider uppercase">
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

      {/* Category Horizontal Slider with w-14 h-14 containers */}
      <div className="flex gap-3 mt-3 overflow-x-auto no-scrollbar py-1">
        {categories.map((cat) => {
          const IconComp = cat.icon
          const isActive = activeCategory === cat.id || (cat.id === 'resorts' && !activeCategory)
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(isActive ? null : cat.id)}
              className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group"
            >
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isActive
                    ? 'border-2 border-cyan-400 bg-gradient-to-br from-cyan-900/80 via-cyan-900/50 to-cyan-500/30 text-cyan-400 shadow-[0_0_20px_rgba(0,242,254,0.5)] scale-105'
                    : 'bg-slate-900/80 border border-white/10 text-white/80 hover:border-white/30'
                }`}
              >
                <IconComp className="w-6 h-6" />
              </div>
              <span
                className={`text-[9.5px] uppercase tracking-tight ${
                  isActive ? 'font-extrabold text-cyan-400' : 'font-bold text-gray-400'
                }`}
              >
                {cat.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* 2. СЕКЦИЯ АУКЦИОНОВ (LIVE REVERSE AUCTIONS) */}
      <h2 className="mt-5 text-[11px] font-bold text-cyan-400 tracking-widest uppercase flex items-center justify-between">
        <span>LIVE REVERSE AUCTIONS</span>
        <span className="flex items-center gap-1 text-emerald-400 text-[9px] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> LIVE
        </span>
      </h2>

      {/* The Grid System (Height 255px perfectly matched for left and right columns) */}
      <div className="grid grid-cols-12 gap-3 mt-2.5 h-[255px]">
        {/* Левый главный баннер (Bali) - col-span-8 */}
        <div className="col-span-8 relative rounded-2xl overflow-hidden border border-white/10 h-full group shadow-2xl flex flex-col justify-between">
          {/* Background image */}
          <img
            src="https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800"
            alt="AYANA Resort"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />

          {/* Shadow Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/20" />

          {/* Top Banner Content (Badge left, Prices stacked right) */}
          <div className="relative z-10 p-2.5 flex justify-between items-start w-full">
            {/* Top Left Badge */}
            <div className="max-w-[55%]">
              <div className="text-[10px] font-bold text-white bg-black/50 px-2 py-1 rounded-md backdrop-blur-md border border-white/10 inline-block leading-tight shadow-md">
                BALI: AYANA Resort - Ocean View Suite
              </div>
              <div className="text-[8px] text-gray-300 mt-0.5 pl-0.5">
                5★ Resort, Jimbaran
              </div>
            </div>

            {/* Top Right Price Stack (Vertical) */}
            <div className="text-right space-y-1">
              <div className="bg-emerald-950/80 backdrop-blur-md border border-emerald-500/30 px-2 py-0.5 rounded-md text-[10px] font-black text-emerald-400 shadow-md inline-block">
                Current Low Bid: $345
              </div>
              <div className="bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-medium text-gray-400 line-through text-right block w-fit ml-auto">
                Original Price: $980
              </div>
            </div>
          </div>

          {/* Bottom Banner Content (Bidders + Timer + Integrated Rounded-B Button) */}
          <div className="relative z-10 w-full flex flex-col items-center">
            {/* Bidders count */}
            <div className="w-full px-2.5 text-left text-[9px] text-gray-300 flex items-center gap-1 mb-0.5">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-semibold">12 Bidders</span>
            </div>

            {/* Large Glowing Timer */}
            <div className="text-3xl sm:text-4xl font-mono font-black text-emerald-400 tracking-wider text-center my-0.5 drop-shadow-[0_0_12px_rgba(52,211,153,0.6)]">
              {timer1}
            </div>

            {/* View Offer / Bid Now Button (Perfect bottom integration rounded-b-2xl rounded-t-none) */}
            <button
              onClick={() => onOpenBidModal(mainRequest)}
              className="w-full h-10 bg-cyan-400 hover:bg-cyan-300 text-black font-black text-xs tracking-widest uppercase flex items-center justify-center transition-colors rounded-b-2xl rounded-t-none shadow-[0_4px_20px_rgba(0,242,254,0.4)] cursor-pointer mt-1"
            >
              VIEW OFFER / BID NOW
            </button>
          </div>
        </div>

        {/* Правая колонка мини-карточек - col-span-4 */}
        <div className="col-span-4 flex flex-col justify-between h-full gap-2">
          {/* Верхняя мини-карточка (Бали отель с бассейном) */}
          <div className="h-[calc(50%-4px)] rounded-xl overflow-hidden border border-white/10 relative shadow-md group">
            <img
              src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500"
              alt="Bali Luxury Pool Villa"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-1.5 flex items-end">
              <span className="text-[8px] font-bold text-white leading-tight">Bali: Royal Pool Villa</span>
            </div>
          </div>

          {/* Нижняя мини-карточка (Phuket Kata Rocks - Упакованная единая плашка) */}
          <div
            onClick={() => onOpenBidModal(phuketRequest)}
            className="h-[calc(50%-4px)] relative rounded-xl overflow-hidden border border-white/10 shadow-md group cursor-pointer"
          >
            <img
              src="https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=500"
              alt="Kata Rocks Villa"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-1">
              {/* Compact Unified Information Overlay */}
              <div className="bg-black/75 backdrop-blur-md p-1.5 rounded-lg border border-white/10">
                <div className="text-[9px] font-extrabold text-white leading-tight truncate">
                  Phuket: Kata Rocks Villa
                </div>
                <div className="flex items-center justify-between text-[8px] font-mono text-gray-300 mt-0.5">
                  <span className="text-amber-400 font-bold">TIMER</span>
                  <span className="font-bold text-white">{timer2}</span>
                </div>
                <div className="text-[9px] font-bold text-emerald-400 mt-0.5">
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

