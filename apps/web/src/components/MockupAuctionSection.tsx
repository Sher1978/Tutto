import React, { useState, useEffect, useRef } from 'react'
import { Sparkles, Zap } from 'lucide-react'
import { RequestItem } from '../types'
import { SERVICE_TEMPLATES, CATEGORIES } from '../data/mockData'

interface MockupAuctionSectionProps {
  onSelectHub: (hub: string) => void
  activeHub: string
  activeCategory: string | null
  onSelectCategory: (cat: string | null) => void
  onOpenBidModal: (request: RequestItem) => void
  onOpenQuickRequest: (request: RequestItem) => void
  requests: RequestItem[]
}

// All 13 Categories matching the strictly ordered expat taxonomy
const ALL_CATEGORY_TILES = [
  { id: 'cat-transport', label: 'ПРОКАТ', icon: '🛵', slug: 'transport' },
  { id: 'cat-housing', label: 'ЖИЛЬЁ', icon: '🏡', slug: 'housing' },
  { id: 'cat-finance', label: 'ДЕНЬГИ', icon: '💵', slug: 'finance' },
  { id: 'cat-services', label: 'УСЛУГИ', icon: '💼', slug: 'services' },
  { id: 'cat-food', label: 'ЕДА', icon: '🍽️', slug: 'food' },
  { id: 'cat-cleaning', label: 'КЛИНИНГ', icon: '🧹', slug: 'cleaning' },
  { id: 'cat-beauty', label: 'КРАСОТА', icon: '💆', slug: 'beauty' },
  { id: 'cat-kids', label: 'ДЕТИ', icon: '👶', slug: 'kids' },
  { id: 'cat-tours', label: 'ТУРЫ', icon: '🗺️', slug: 'tours' },
  { id: 'cat-health', label: 'ВРАЧИ', icon: '🩺', slug: 'health' },
  { id: 'cat-courier', label: 'КУРЬЕР', icon: '📦', slug: 'courier' },
  { id: 'cat-events', label: 'ИВЕНТЫ', icon: '🎈', slug: 'events' },
  { id: 'cat-other', label: 'ДРУГОЕ', icon: '🌀', slug: 'other' },
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
  const sliderRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)

  const hubsList = [
    { id: 'bali', label: '🌴 БАЛИ' },
    { id: 'phuket', label: 'ПХУКЕТ' },
    { id: 'bangkok', label: 'БАНГКОК' },
    { id: 'seoul', label: 'СЕУЛ' },
    { id: 'tokyo', label: 'ТОКИО' },
  ]

  // Default district helper per hub
  const getHubDefaultDistrict = (hubName: string) => {
    const lower = hubName.toLowerCase()
    if (lower === 'phuket') return 'Patong'
    if (lower === 'bangkok') return 'Thonglor'
    if (lower === 'seoul') return 'Gangnam'
    if (lower === 'tokyo') return 'Shibuya'
    return 'Canggu'
  }

  const currentDistrict = getHubDefaultDistrict(activeHub)

  // Filter templates/cards based on activeCategory
  const filteredTemplates = activeCategory
    ? SERVICE_TEMPLATES.filter((tmpl) => tmpl.categoryL1Id === activeCategory)
    : SERVICE_TEMPLATES

  // Convert service templates to RequestItems for display in slider
  const templateCards: RequestItem[] = filteredTemplates.map((tmpl, idx) => ({
    id: `tmpl-card-${tmpl.id}-${idx}`,
    clientId: 'demo-usr',
    clientName: 'Александр',
    clientAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    clientRating: 4.9,
    hub: activeHub.toLowerCase() as any,
    district: currentDistrict,
    categoryL1Id: tmpl.categoryL1Id,
    categoryL1Name: CATEGORIES.find((c) => c.id === tmpl.categoryL1Id)?.titleRu || 'Услуги',
    title: tmpl.title,
    description: tmpl.description,
    budget: tmpl.defaultBudget,
    currency: tmpl.currency || 'USD',
    mediaUrls: [tmpl.coverImageUrl],
    isFeatured: true,
    status: 'open',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 120 * 60 * 1000).toISOString(),
    auctionEndsAt: new Date(Date.now() + 120 * 60 * 1000).toISOString(),
    bidsCount: 4,
  }))

  // MANDATORY: Append "Другое / More" special card as the final item in the carousel slider!
  const customOtherCard: RequestItem = {
    id: 'special-card-other',
    clientId: 'custom-usr',
    clientName: 'TuttoMinutto',
    clientAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    clientRating: 5.0,
    hub: activeHub.toLowerCase() as any,
    district: currentDistrict,
    categoryL1Id: 'cat-other',
    categoryL1Name: 'Другое',
    title: 'ДРУГОЕ / СВОЙ ИНДИВИДУАЛЬНЫЙ ЗАПРОС',
    description: 'Опишите вашу задачу в свободной форме — мы мгновенно оповестим лучших исполнителей и создадим новую подкатегорию!',
    budget: null,
    currency: 'USD',
    mediaUrls: ['https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&auto=format&fit=crop&q=80'],
    isFeatured: true,
    status: 'open',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 120 * 60 * 1000).toISOString(),
    auctionEndsAt: new Date(Date.now() + 120 * 60 * 1000).toISOString(),
    bidsCount: 0,
  }

  const sliderItems = [...templateCards, customOtherCard]

  // Auto-scrolling Carousel effect (advances 1 card every 3.5 seconds)
  useEffect(() => {
    if (isPaused) return

    const interval = setInterval(() => {
      if (sliderRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current
        const maxScroll = scrollWidth - clientWidth

        // Card width ~300px + gap 12px
        const nextScroll = scrollLeft + 312
        if (nextScroll >= maxScroll - 10) {
          sliderRef.current.scrollTo({ left: 0, behavior: 'smooth' })
        } else {
          sliderRef.current.scrollTo({ left: nextScroll, behavior: 'smooth' })
        }
      }
    }, 3500)

    return () => clearInterval(interval)
  }, [isPaused, sliderItems.length])

  // Reset scroll on category change
  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.scrollTo({ left: 0, behavior: 'instant' as any })
    }
  }, [activeCategory])

  return (
    <div className="w-full space-y-4">
      {/* 1. ASIAN HUBS SELECTOR */}
      <div className="space-y-2">
        <h2
          className="text-[11px] uppercase tracking-widest font-bold text-gray-300"
          style={{ fontFamily: "'Roboto', sans-serif" }}
        >
          ВЫБЕРИТЕ ЧТО ВАМ НУЖНО
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
                  fontFamily: "'Roboto', sans-serif",
                  fontWeight: 700,
                  fontSize: '13px',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                {h.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* 2. FROSTED GLASS CATEGORY TILES (All 13 Categories in exact order) */}
      <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1.5 -mx-1 px-1">
        {ALL_CATEGORY_TILES.map((cat) => {
          const isActive = activeCategory === cat.id

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(isActive ? null : cat.id)}
              className={`relative min-w-[73px] h-[78px] shrink-0 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200 group ${
                isActive
                  ? 'scale-[1.05]'
                  : 'opacity-90 hover:opacity-100 hover:scale-[1.02]'
              }`}
              style={{
                background: isActive
                  ? 'rgba(0, 255, 135, 0.16)'
                  : 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(30px) saturate(180%)',
                WebkitBackdropFilter: 'blur(30px) saturate(180%)',
                border: isActive
                  ? '1px solid rgba(0, 255, 135, 0.7)'
                  : '1px solid rgba(255, 255, 255, 0.25)',
                boxShadow: isActive
                  ? '0 0 20px rgba(0, 255, 135, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.3)'
                  : '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 1px 0 rgba(255, 255, 255, 0.22)',
              }}
            >
              {isActive && (
                <div className="absolute inset-0 rounded-2xl bg-[#00FF87]/10" />
              )}
              <div className="relative z-10 flex flex-col items-center justify-center p-1 text-center">
                <span
                  className="leading-none mb-1.5 filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] group-hover:scale-110 transition-transform"
                  style={{ fontSize: '29px' }}
                >
                  {cat.icon}
                </span>
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider leading-none text-center ${
                    isActive ? 'text-[#00FF87]' : 'text-gray-100'
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

      {/* 3. AUTO-SCROLLING CAROUSEL SLIDER OF POPULAR SERVICES */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <h2
            className="text-xs uppercase tracking-wider font-bold text-white flex items-center gap-1.5"
            style={{ fontFamily: "'Roboto', sans-serif" }}
          >
            <span>
              {activeCategory
                ? `УСЛУГИ В КАТЕГОРИИ "${ALL_CATEGORY_TILES.find((c) => c.id === activeCategory)?.label}"`
                : 'ПОПУЛЯРНЫЕ УСЛУГИ'}
            </span>
            <span className="w-2 h-2 rounded-full bg-[#00FF87] animate-ping" />
          </h2>
          <span
            className="text-[10px] text-[#00FF87] font-bold flex items-center gap-1 drop-shadow-[0_0_8px_rgba(0,255,135,0.6)]"
            style={{ fontFamily: "'Roboto', sans-serif" }}
          >
            <Sparkles className="w-3 h-3" /> Прямой эфир
          </span>
        </div>

        {/* Carousel Container with Auto-Scroll & Pause on Hover/Touch */}
        <div
          ref={sliderRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4 pt-1 -mx-4 px-4 pr-10 scroll-smooth"
        >
          {sliderItems.map((item) => {
            const isCustomCard = item.id === 'special-card-other'
            const coverImage = item.mediaUrls?.[0] || 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=600'

            return (
              <div
                key={item.id}
                onClick={() => onOpenQuickRequest(item)}
                className={`w-[82vw] max-w-[310px] min-h-[235px] h-[235px] shrink-0 snap-center rounded-3xl p-4 flex flex-col justify-between relative overflow-hidden z-10 transition-all duration-300 hover:scale-[1.02] cursor-pointer group border shadow-[0_20px_45px_rgba(0,0,0,0.6)] ${
                  isCustomCard
                    ? 'border-[#00FF87]/60 shadow-[0_0_30px_rgba(0,255,135,0.4)]'
                    : 'border-white/25'
                }`}
                style={{
                  background: 'rgba(10, 16, 26, 0.4)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                }}
              >
                {/* Background Image under Glass */}
                <img
                  src={coverImage}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover filter blur-[3px] scale-105 opacity-55 group-hover:scale-115 transition-transform duration-500 pointer-events-none"
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/80 pointer-events-none" />

                {/* Card Top Header */}
                <div className="relative z-10">
                  <h3 className="font-display font-black text-sm text-white leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
                    <span className="text-[#00FF87] tracking-wider uppercase font-bold">{activeHub.toUpperCase()}:</span> {item.title}
                  </h3>
                  <p
                    className="text-[10px] text-gray-300 font-medium mt-1 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] flex items-center gap-1"
                    style={{ fontFamily: "'Roboto', sans-serif" }}
                  >
                    <span>📍 {item.district}</span> • <span className="text-[#00FF87]">{item.categoryL1Name}</span>
                  </p>
                </div>

                {/* Card Middle: Giant Glowing Plus */}
                <div className="relative z-10 flex items-center justify-center my-2">
                  <span
                    className={`font-black leading-none select-none transition-all duration-300 ${
                      isCustomCard
                        ? 'text-[#00FF87] scale-125 drop-shadow-[0_0_30px_rgba(0,255,135,1)]'
                        : 'text-[#00FF87]/80 group-hover:scale-125 group-hover:text-[#00FF87] drop-shadow-[0_0_25px_rgba(0,255,135,0.9)]'
                    }`}
                    style={{ fontSize: '56px', lineHeight: 1 }}
                  >
                    +
                  </span>
                </div>

                {/* Card Bottom Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onOpenQuickRequest(item)
                  }}
                  className={`relative z-10 w-full py-3 rounded-xl text-[#03100A] text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-all hover:brightness-110 active:scale-[0.98] ${
                    isCustomCard
                      ? 'bg-gradient-to-r from-[#00FF87] via-[#00F2FE] to-[#00FF87]'
                      : 'bg-gradient-to-r from-[#00C2A8] via-[#00FF87] to-[#00F2FE]'
                  }`}
                  style={{
                    fontFamily: "'Roboto', sans-serif",
                    boxShadow: '0 4px 24px rgba(0,255,135,0.6)',
                  }}
                >
                  <Zap className="w-4 h-4 fill-[#03100A]" />
                  <span>{isCustomCard ? '⚡ СОЗДАТЬ СВОЮ ЗАЯВКУ' : 'БЫСТРАЯ ЗАЯВКА'}</span>
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
