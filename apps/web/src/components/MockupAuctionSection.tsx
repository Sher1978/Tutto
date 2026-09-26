import React, { useState, useEffect, useRef } from 'react'
import { Sparkles, Zap, ArrowRight, ShieldCheck, Heart, MapPin } from 'lucide-react'
import { RequestItem } from '../types'
import { SERVICE_TEMPLATES, CATEGORIES } from '../data/mockData'
import { triggerHapticFeedback } from '../lib/telegram'

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

/**
 * Reusable Marquee Continuous Auto-Scrolling Slider Component
 */
interface InteractiveMarqueeSliderProps {
  title: string
  items: RequestItem[]
  direction?: 'left' | 'right'
  activeHub: string
  selectedCardId: string | null
  onCardClick: (item: RequestItem, e: React.MouseEvent) => void
}

const InteractiveMarqueeSlider: React.FC<InteractiveMarqueeSliderProps> = ({
  title,
  items,
  direction = 'left',
  activeHub,
  selectedCardId,
  onCardClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const animFrameRef = useRef<number | null>(null)
  const isPausedRef = useRef(false)

  // Pause scrolling if any card in this slider is currently selected
  const hasSelectedCard = items.some((it) => it.id === selectedCardId)

  useEffect(() => {
    isPausedRef.current = hasSelectedCard
  }, [hasSelectedCard])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    let speed = direction === 'left' ? 0.75 : -0.75

    const step = () => {
      if (!isPausedRef.current && el) {
        el.scrollLeft += speed
        const max = el.scrollWidth - el.clientWidth
        if (speed > 0 && el.scrollLeft >= max - 2) {
          el.scrollLeft = 0
        } else if (speed < 0 && el.scrollLeft <= 2) {
          el.scrollLeft = max
        }
      }
      animFrameRef.current = requestAnimationFrame(step)
    }

    animFrameRef.current = requestAnimationFrame(step)

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [direction])

  return (
    <div className="space-y-2 pt-2">
      {/* Slider Header */}
      <div className="flex items-center justify-between px-1">
        <h3
          className="text-xs uppercase tracking-wider font-extrabold text-white flex items-center gap-1.5"
          style={{ fontFamily: "'Roboto', sans-serif" }}
        >
          <span>{title}</span>
          <span className="w-2 h-2 rounded-full bg-[#00FF87] animate-ping" />
        </h3>
        <span
          className="text-[10px] text-[#00FF87] font-bold flex items-center gap-1"
          style={{ fontFamily: "'Roboto', sans-serif" }}
        >
          <Sparkles className="w-3 h-3" /> Живой поток
        </span>
      </div>

      {/* Marquee Track */}
      <div
        ref={containerRef}
        onMouseEnter={() => (isPausedRef.current = true)}
        onMouseLeave={() => (isPausedRef.current = hasSelectedCard)}
        onTouchStart={() => (isPausedRef.current = true)}
        onTouchEnd={() => (isPausedRef.current = hasSelectedCard)}
        className="flex gap-3.5 overflow-x-auto no-scrollbar pb-3 pt-1 -mx-4 px-4 pr-10 scroll-smooth"
      >
        {items.map((item) => {
          const isSelected = item.id === selectedCardId
          const isCustomCard = item.id.includes('special-card-other')
          const coverImage =
            item.mediaUrls?.[0] || 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=600'

          return (
            <div
              key={item.id}
              onClick={(e) => onCardClick(item, e)}
              className={`w-[80vw] max-w-[300px] min-h-[235px] h-[235px] shrink-0 rounded-3xl p-4 flex flex-col justify-between relative overflow-hidden z-10 cursor-pointer group border transition-all duration-300 ${
                isSelected
                  ? 'scale-[1.05] border-[#00FF87] shadow-[0_0_35px_rgba(0,255,135,0.9)] ring-2 ring-[#00FF87]/80'
                  : isCustomCard
                  ? 'border-[#00FF87]/60 shadow-[0_0_25px_rgba(0,255,135,0.35)] hover:scale-[1.02]'
                  : 'border-white/25 shadow-[0_15px_35px_rgba(0,0,0,0.6)] hover:scale-[1.02]'
              }`}
              style={{
                background: isSelected ? 'rgba(0, 255, 135, 0.12)' : 'rgba(10, 16, 26, 0.45)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
              }}
            >
              {/* Photo Background */}
              <img
                src={coverImage}
                alt={item.title}
                className={`absolute inset-0 w-full h-full object-cover filter transition-all duration-500 pointer-events-none ${
                  isSelected ? 'blur-[1px] scale-110 opacity-70' : 'blur-[3px] scale-105 opacity-50 group-hover:scale-110'
                }`}
              />

              {/* Dark Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/85 pointer-events-none" />

              {/* Selection Badge Banner */}
              {isSelected && (
                <div className="absolute top-2.5 right-2.5 z-20 bg-[#00FF87] text-[#03100A] text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-lg animate-pulse">
                  Нажмите ещё раз для заказа
                </div>
              )}

              {/* Card Top: Title & Hub/District */}
              <div className="relative z-10">
                <h4 className="font-display font-black text-sm text-white leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
                  <span className="text-[#00FF87] tracking-wider uppercase font-bold">{activeHub.toUpperCase()}:</span> {item.title}
                </h4>
                <p
                  className="text-[10px] text-gray-300 font-medium mt-1 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] flex items-center gap-1"
                  style={{ fontFamily: "'Roboto', sans-serif" }}
                >
                  <span>📍 {item.district}</span> • <span className="text-[#00FF87]">{item.categoryL1Name}</span>
                </p>
              </div>

              {/* Card Middle: Giant Pulsing Plus */}
              <div className="relative z-10 flex items-center justify-center my-1">
                <span
                  className={`font-black leading-none select-none transition-all duration-300 ${
                    isSelected
                      ? 'text-[#00FF87] scale-135 drop-shadow-[0_0_35px_rgba(0,255,135,1)] animate-bounce'
                      : isCustomCard
                      ? 'text-[#00FF87] scale-125 drop-shadow-[0_0_25px_rgba(0,255,135,0.9)]'
                      : 'text-[#00FF87]/80 group-hover:scale-125 group-hover:text-[#00FF87] drop-shadow-[0_0_20px_rgba(0,255,135,0.8)]'
                  }`}
                  style={{ fontSize: '56px', lineHeight: 1 }}
                >
                  +
                </span>
              </div>

              {/* Card Bottom CTA Button */}
              <button
                className={`relative z-10 w-full py-2.5 rounded-xl text-[#03100A] text-xs font-black tracking-wider uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-all hover:brightness-110 active:scale-[0.98] ${
                  isSelected
                    ? 'bg-[#00FF87] shadow-[0_0_30px_rgba(0,255,135,1)]'
                    : isCustomCard
                    ? 'bg-gradient-to-r from-[#00FF87] via-[#00F2FE] to-[#00FF87]'
                    : 'bg-gradient-to-r from-[#00C2A8] via-[#00FF87] to-[#00F2FE]'
                }`}
                style={{
                  fontFamily: "'Roboto', sans-serif",
                  boxShadow: isSelected ? '0 0 30px rgba(0,255,135,1)' : '0 4px 24px rgba(0,255,135,0.6)',
                }}
              >
                <Zap className="w-4 h-4 fill-[#03100A]" />
                <span>
                  {isSelected
                    ? 'ПОДТВЕРДИТЬ И ЗАПУСТИТЬ'
                    : isCustomCard
                    ? '⚡ СОЗДАТЬ СВОЮ ЗАЯВКУ'
                    : 'БЫСТРАЯ ЗАЯВКА'}
                </span>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export const MockupAuctionSection: React.FC<MockupAuctionSectionProps> = ({
  onSelectHub,
  activeHub,
  activeCategory,
  onSelectCategory,
  onOpenBidModal,
  onOpenQuickRequest,
  requests,
}) => {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const timerRef = useRef<any>(null)

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

  // Clear selection after 5 seconds timeout or click outside
  const handleCardClick = (item: RequestItem, e: React.MouseEvent) => {
    e.stopPropagation()

    if (selectedCardId === item.id) {
      // 2nd click: Open Quick Request Modal!
      triggerHapticFeedback('heavy')
      if (timerRef.current) clearTimeout(timerRef.current)
      setSelectedCardId(null)
      onOpenQuickRequest(item)
    } else {
      // 1st click: Pause slider, zoom +5%, highlight, set 5s timeout
      triggerHapticFeedback('medium')
      setSelectedCardId(item.id)

      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        setSelectedCardId(null)
      }, 5000)
    }
  }

  // Deselect on click anywhere outside cards
  useEffect(() => {
    const handleOutsideClick = () => {
      if (selectedCardId) {
        setSelectedCardId(null)
        if (timerRef.current) clearTimeout(timerRef.current)
      }
    }
    window.addEventListener('click', handleOutsideClick)
    return () => window.removeEventListener('click', handleOutsideClick)
  }, [selectedCardId])

  // Filter templates/cards based on activeCategory for main hero slider
  const filteredTemplates = activeCategory
    ? SERVICE_TEMPLATES.filter((tmpl) => tmpl.categoryL1Id === activeCategory)
    : SERVICE_TEMPLATES

  // Helper to construct RequestItem list from templates with mandatory final "Другое" card
  const makeSliderItems = (categoryFilter?: string, prefix: string = 'main'): RequestItem[] => {
    const templates = categoryFilter
      ? SERVICE_TEMPLATES.filter((tmpl) => tmpl.categoryL1Id === categoryFilter)
      : SERVICE_TEMPLATES

    const cards: RequestItem[] = templates.map((tmpl, idx) => ({
      id: `${prefix}-card-${tmpl.id}-${idx}`,
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

    // MANDATORY final card: "Другое / More"
    const customOtherCard: RequestItem = {
      id: `${prefix}-special-card-other`,
      clientId: 'custom-usr',
      clientName: 'TuttoMinutto',
      clientAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      clientRating: 5.0,
      hub: activeHub.toLowerCase() as any,
      district: currentDistrict,
      categoryL1Id: 'cat-other',
      categoryL1Name: 'Другое',
      title: 'ДРУГОЕ / СВОЙ ИНДИВИДУАЛЬНЫЙ ЗАПРОС',
      description: 'Опишите вашу уникальную задачу — наш ИИ и суперадмин добавят её в матрицу!',
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

    return [...cards, customOtherCard]
  }

  // Hero Main Slider Items
  const heroSliderItems = makeSliderItems(activeCategory || undefined, 'hero')

  // Category specific rows for the multi-slider feed below
  const transportItems = makeSliderItems('cat-transport', 'row-transport')
  const housingItems = makeSliderItems('cat-housing', 'row-housing')
  const financeItems = makeSliderItems('cat-finance', 'row-finance')
  const beautyItems = makeSliderItems('cat-beauty', 'row-beauty')
  const toursItems = makeSliderItems('cat-tours', 'row-tours')
  const servicesItems = makeSliderItems('cat-services', 'row-services')

  return (
    <div className="w-full space-y-6">
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

      {/* 2. FROSTED GLASS CATEGORY TILES (All 13 Categories) */}
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

      {/* 3. HERO MAIN CONTINUOUS MARQUEE SLIDER */}
      <InteractiveMarqueeSlider
        title={
          activeCategory
            ? `УСЛУГИ В КАТЕГОРИИ "${ALL_CATEGORY_TILES.find((c) => c.id === activeCategory)?.label}"`
            : '🔥 ПОПУЛЯРНЫЕ УСЛУГИ'
        }
        items={heroSliderItems}
        direction="left"
        activeHub={activeHub}
        selectedCardId={selectedCardId}
        onCardClick={handleCardClick}
      />

      {/* 4. MULTI-ROW INFINITE FEED OF CATEGORY SLIDERS (ALTERNATING DIRECTIONS) */}
      <div className="space-y-6 pt-4 border-t border-white/10">
        <h3 className="text-xs uppercase tracking-widest font-black text-cyan-400 flex items-center gap-2">
          <span>ВИТРИНА УСЛУГ ПО РУБРИКАМ</span>
          <div className="h-0.5 flex-1 bg-gradient-to-r from-cyan-500/50 to-transparent" />
        </h3>

        {/* Row 1: Прокат (Moving Left ◀️) */}
        <InteractiveMarqueeSlider
          title="🛵 ПРОКАТ БАЙКОВ И АВТО"
          items={transportItems}
          direction="left"
          activeHub={activeHub}
          selectedCardId={selectedCardId}
          onCardClick={handleCardClick}
        />

        {/* Row 2: Жильё (Moving Right ▶️) */}
        <InteractiveMarqueeSlider
          title="🏡 ВИЛЛЫ, КОНДО И ЖИЛЬЁ"
          items={housingItems}
          direction="right"
          activeHub={activeHub}
          selectedCardId={selectedCardId}
          onCardClick={handleCardClick}
        />

        {/* Row 3: Деньги (Moving Left ◀️) */}
        <InteractiveMarqueeSlider
          title="💵 ОБМЕН ВАЛЮТ И КРИПТЫ"
          items={financeItems}
          direction="left"
          activeHub={activeHub}
          selectedCardId={selectedCardId}
          onCardClick={handleCardClick}
        />

        {/* Row 4: Услуги & Визы (Moving Right ▶️) */}
        <InteractiveMarqueeSlider
          title="💼 УСЛУГИ, ВИЗЫ И СТРАХОВКИ"
          items={servicesItems}
          direction="right"
          activeHub={activeHub}
          selectedCardId={selectedCardId}
          onCardClick={handleCardClick}
        />

        {/* Row 5: Красота (Moving Left ◀️) */}
        <InteractiveMarqueeSlider
          title="💆 МАССАЖ И СПА НА ВИЛЛУ"
          items={beautyItems}
          direction="left"
          activeHub={activeHub}
          selectedCardId={selectedCardId}
          onCardClick={handleCardClick}
        />

        {/* Row 6: Туры (Moving Right ▶️) */}
        <InteractiveMarqueeSlider
          title="🗺️ ТУРЫИ ЭКСКУРСИИ НА ОСТРОВА"
          items={toursItems}
          direction="right"
          activeHub={activeHub}
          selectedCardId={selectedCardId}
          onCardClick={handleCardClick}
        />
      </div>
    </div>
  )
}
