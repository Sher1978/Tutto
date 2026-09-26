import React, { useState } from 'react'
import { Mic, Flame, MapPin, Clock } from 'lucide-react'
import { triggerHapticFeedback } from '../lib/telegram'
import { MarketItem } from '../types'
import { MarketFilterBar, MarketSortOption } from './MarketFilterBar'

interface MarketSectionProps {
  activeCategory: string | null
  products?: MarketItem[]
  onSelectCategory: (cat: string | null) => void
  onOpenQuickRequest: (req: any) => void
  onSelectProduct: (product: MarketItem) => void
}

const MARKET_CATEGORY_TILES = [
  { id: 'mcat-moto', label: 'БАЙКИ', icon: '🏍️' },
  { id: 'mcat-tech', label: 'ТЕХНИКА', icon: '💻' },
  { id: 'mcat-tickets', label: 'БИЛЕТЫ', icon: '🎫' },
  { id: 'mcat-furniture', label: 'МЕБЕЛЬ', icon: '🛋️' },
  { id: 'mcat-clothes', label: 'ОДЕЖДА', icon: '👕' },
  { id: 'mcat-sport', label: 'СПОРТ', icon: '🏄‍♂️' },
  { id: 'mcat-pets', label: 'ЖИВОТНЫЕ', icon: '🐶' },
  { id: 'mcat-other', label: 'ДРУГОЕ', icon: '📦' },
]

const DEFAULT_PRODUCTS: MarketItem[] = [
  {
    id: 'prod-1',
    sellerId: 'seller-1',
    sellerName: 'Алексей (Мотопарк)',
    sellerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
    sellerRating: 4.9,
    title: 'Yamaha NMAX 155cc 2023',
    description: 'Идеальное состояние, пробег 15к. Отдаю срочно в связи с отлетом.',
    price: 1200,
    oldPrice: 1500,
    district: 'Чангу',
    expiresIn: '03:15',
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=400&q=80',
    condition: 'Б/У',
    category: 'mcat-moto',
  },
  {
    id: 'prod-2',
    sellerId: 'seller-2',
    sellerName: 'Иван TechStore',
    sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    sellerRating: 4.8,
    title: 'MacBook Pro 14 M1 Pro',
    description: '16GB RAM, 512GB SSD. Есть небольшая царапина на крышке.',
    price: 1100,
    oldPrice: 1350,
    district: 'Убуд',
    expiresIn: '08:40',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80',
    condition: 'Б/У',
    category: 'mcat-tech',
  },
  {
    id: 'prod-3',
    sellerId: 'seller-3',
    sellerName: 'Мария Event',
    sellerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    sellerRating: 5.0,
    title: 'Билеты на Finns VIP (2 шт)',
    description: 'Купили, но заболели. Продаю в 2 раза дешевле номинала!',
    price: 50,
    oldPrice: 120,
    district: 'Семиньяк',
    expiresIn: '01:20',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80',
    condition: 'Новое',
    category: 'mcat-tickets',
  },
  {
    id: 'prod-4',
    sellerId: 'seller-4',
    sellerName: 'Сергей SurfClub',
    sellerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
    sellerRating: 4.9,
    title: 'Серфборд Pyzel 5\'10',
    description: 'Откатал сезон, борд пушка. В комплекте лиш и чехол.',
    price: 250,
    oldPrice: 350,
    district: 'Улувату',
    expiresIn: '12:00',
    image: 'https://images.unsplash.com/photo-1531722569936-825d3dd91b15?w=400&q=80',
    condition: 'Б/У',
    category: 'mcat-sport',
  }
]

export const MarketSection: React.FC<MarketSectionProps> = ({
  activeCategory,
  products = DEFAULT_PRODUCTS,
  onSelectCategory,
  onOpenQuickRequest,
  onSelectProduct
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<MarketSortOption>('discount')
  const [conditionFilter, setConditionFilter] = useState<string | null>(null)

  let processed = products.filter((p) => {
    if (activeCategory && p.category !== activeCategory) return false
    if (conditionFilter && p.condition !== conditionFilter) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchTitle = p.title.toLowerCase().includes(q)
      const matchDesc = p.description.toLowerCase().includes(q)
      if (!matchTitle && !matchDesc) return false
    }
    return true
  })

  // Sorting
  processed = [...processed].sort((a, b) => {
    if (sortBy === 'discount') {
      const discA = a.oldPrice > a.price ? (a.oldPrice - a.price) / a.oldPrice : 0
      const discB = b.oldPrice > b.price ? (b.oldPrice - b.price) / b.oldPrice : 0
      return discB - discA
    }
    if (sortBy === 'price_asc') {
      return a.price - b.price
    }
    if (sortBy === 'urgent') {
      return a.expiresIn.localeCompare(b.expiresIn)
    }
    return 0
  })

  return (
    <div className="w-full space-y-4 pb-28">
      
      {/* 1. INTERACTIVE FILTER & SEARCH BAR */}
      <MarketFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
        conditionFilter={conditionFilter}
        onConditionChange={setConditionFilter}
      />

      {/* 2. CHIP CATEGORIES (Horizontal Scroll) */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-2 px-2">
        {MARKET_CATEGORY_TILES.map((cat) => {
          const isActive = activeCategory === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => {
                triggerHapticFeedback('light')
                onSelectCategory(isActive ? null : cat.id)
              }}
              className={`shrink-0 rounded-full flex items-center gap-1.5 px-3.5 py-2 cursor-pointer transition-all duration-200 border ${
                isActive
                  ? 'bg-[#00F2FE]/20 border-[#00F2FE]/60 text-[#00F2FE] shadow-[0_0_15px_rgba(0,242,254,0.2)]'
                  : 'bg-[#0D1117] border-[#222222] text-gray-300 hover:bg-[#161B22]'
              }`}
            >
              <span className="text-[14px] leading-none">{cat.icon}</span>
              <span className="text-[11px] font-bold tracking-wide uppercase">
                {cat.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* 3. FLASH MARKET GRID (Pinterest Style 2-Columns) */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between mb-1 px-1">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#00F2FE] animate-pulse" />
            <h2 className="text-[13px] font-bold uppercase tracking-wider text-white">
              ГОРЯЩИЕ ТОВАРЫ
            </h2>
          </div>
          <span className="text-[11px] font-medium text-gray-400">Скинули цену</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {processed.map((item) => (
            <div 
              key={item.id}
              onClick={() => {
                triggerHapticFeedback('medium')
                onSelectProduct(item)
              }}
              className="glass-card border border-[#00F2FE]/20 rounded-2xl overflow-hidden flex flex-col hover:border-[#00F2FE]/50 transition-all cursor-pointer group"
            >
              {/* Product Image with Overlays */}
              <div className="relative aspect-square w-full">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D1117] via-transparent to-transparent opacity-80" />
                
                {/* Condition Badge */}
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-bold text-white uppercase tracking-wider border border-white/10">
                  {item.condition}
                </div>

                {/* Expiration Timer Badge */}
                <div className="absolute bottom-2 right-2 bg-[#CCFF00] text-black px-1.5 py-0.5 rounded flex items-center gap-1 shadow-[0_0_10px_rgba(204,255,0,0.5)]">
                  <Clock className="w-2.5 h-2.5" />
                  <span className="text-[10px] font-black uppercase tracking-wider">{item.expiresIn}</span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-3 flex flex-col flex-1">
                <h3 className="text-[13px] font-bold text-white leading-snug line-clamp-2 mb-1">
                  {item.title}
                </h3>
                <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium mb-3 mt-auto">
                  <MapPin className="w-3 h-3 text-[#00F2FE]" />
                  <span className="truncate">{item.district}</span>
                </div>

                {/* Price Row */}
                <div className="flex items-end justify-between pt-2 border-t border-white/10">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 line-through font-semibold leading-none mb-0.5">
                      ${item.oldPrice}
                    </span>
                    <span className="text-[15px] font-black text-[#00F2FE] leading-none">
                      ${item.price}
                    </span>
                  </div>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      triggerHapticFeedback('heavy')
                      onSelectProduct(item)
                    }}
                    className="bg-gradient-to-r from-[#00F2FE] via-[#00DFEA] to-[#CCFF00] hover:brightness-110 text-black text-[11px] font-black px-3 py-1.5 rounded-xl transition-all shadow-[0_0_15px_rgba(0,242,254,0.3)]"
                  >
                    В корзину
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
