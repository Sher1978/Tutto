import React, { useState } from 'react'
import { X, Flame, Tag, Clock, MapPin, DollarSign, Image as ImageIcon } from 'lucide-react'
import { HubId, MarketItem } from '../types'
import { HUBS } from '../data/mockData'
import { triggerHapticFeedback, triggerNotificationFeedback } from '../lib/telegram'

interface CreateMarketListingModalProps {
  isOpen: boolean
  onClose: () => void
  currentHub: HubId
  onCreateListing: (item: MarketItem) => void
}

const MARKET_CATEGORIES = [
  { id: 'mcat-moto', label: 'БАЙКИ', icon: '🏍️' },
  { id: 'mcat-tech', label: 'ТЕХНИКА', icon: '💻' },
  { id: 'mcat-tickets', label: 'БИЛЕТЫ', icon: '🎫' },
  { id: 'mcat-furniture', label: 'МЕБЕЛЬ', icon: '🛋️' },
  { id: 'mcat-clothes', label: 'ОДЕЖДА', icon: '👕' },
  { id: 'mcat-sport', label: 'СПОРТ', icon: '🏄‍♂️' },
  { id: 'mcat-pets', label: 'ЖИВОТНЫЕ', icon: '🐶' },
  { id: 'mcat-other', label: 'ДРУГОЕ', icon: '📦' },
]

const IMAGE_PRESETS = [
  { name: 'Байк / Мото', url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=400&q=80' },
  { name: 'Ноутбук', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80' },
  { name: 'Билеты', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80' },
  { name: 'Сёрфборд', url: 'https://images.unsplash.com/photo-1531722569936-825d3dd91b15?w=400&q=80' },
]

export const CreateMarketListingModal: React.FC<CreateMarketListingModalProps> = ({
  isOpen,
  onClose,
  currentHub,
  onCreateListing,
}) => {
  const activeHubData = HUBS.find((h) => h.id === currentHub) || HUBS[0]

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(MARKET_CATEGORIES[0].id)
  const [condition, setCondition] = useState<'Б/У' | 'Новое' | 'На запчасти'>('Б/У')
  const [oldPrice, setOldPrice] = useState('300')
  const [price, setPrice] = useState('210')
  const [district, setDistrict] = useState(activeHubData.districts[0] || 'Patong')
  const [expiresHours, setExpiresHours] = useState('6')
  const [imageUrl, setImageUrl] = useState(IMAGE_PRESETS[0].url)

  if (!isOpen) return null

  const numOldPrice = parseFloat(oldPrice) || 0
  const numPrice = parseFloat(price) || 0
  const discountPercent = numOldPrice > 0 && numPrice < numOldPrice 
    ? Math.round(((numOldPrice - numPrice) / numOldPrice) * 100) 
    : 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      triggerNotificationFeedback('error')
      alert('Укажите название вашего товара!')
      return
    }

    if (numPrice <= 0) {
      triggerNotificationFeedback('error')
      alert('Укажите корректную горящую цену товара!')
      return
    }

    const newItem: MarketItem = {
      id: `prod-${Date.now()}`,
      sellerId: 'user-me',
      sellerName: 'Вы (Продавец)',
      sellerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      sellerRating: 5.0,
      title,
      description: description || `Горящий лот «${title}» в районе ${district}. Скидка ${discountPercent}%!`,
      price: numPrice,
      oldPrice: numOldPrice > numPrice ? numOldPrice : numPrice,
      district,
      expiresIn: `${expiresHours}:00`,
      image: imageUrl,
      condition,
      category,
    }

    triggerHapticFeedback('heavy')
    triggerNotificationFeedback('success')
    onCreateListing(newItem)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[95] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <form 
        onSubmit={handleSubmit}
        className="w-full sm:max-w-lg glass-panel rounded-t-3xl sm:rounded-3xl border border-[#00F2FE]/40 p-5 space-y-4 overflow-y-auto max-h-[90vh] safe-area-bottom shadow-[0_0_50px_rgba(0,242,254,0.15)] relative"
      >
        {/* Glow Sprite */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#00F2FE]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#00F2FE]/20 flex items-center justify-center">
              <Flame className="w-4 h-4 text-[#00F2FE] animate-pulse" />
            </div>
            <div>
              <h3 className="font-display font-black text-sm text-white uppercase tracking-wider flex items-center gap-1.5">
                <span>Продать во Flash Market</span>
                <span className="text-[10px] bg-[#00F2FE]/20 text-[#00F2FE] px-1.5 py-0.5 rounded font-bold border border-[#00F2FE]/40">HOT</span>
              </h3>
              <p className="text-[11px] text-gray-400 font-medium">Разместите лот с горящей скидкой</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Item Title */}
        <div>
          <label className="block text-gray-300 text-xs mb-1.5 font-bold uppercase tracking-wider">
            Название товара / лота <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Например: Yamaha NMAX 155cc / iPhone 15 Pro Max"
            className="w-full bg-[#070B12] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:border-[#00F2FE] outline-none"
          />
        </div>

        {/* Category Chips */}
        <div>
          <label className="block text-gray-300 text-xs mb-1.5 font-bold uppercase tracking-wider">
            Категория
          </label>
          <div className="flex flex-wrap gap-1.5">
            {MARKET_CATEGORIES.map((cat) => {
              const isSelected = category === cat.id
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    triggerHapticFeedback('light')
                    setCategory(cat.id)
                  }}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 ${
                    isSelected
                      ? 'bg-[#00F2FE]/20 text-[#00F2FE] border border-[#00F2FE]/60 shadow-[0_0_12px_rgba(0,242,254,0.3)]'
                      : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Condition Selector */}
        <div>
          <label className="block text-gray-300 text-xs mb-1.5 font-bold uppercase tracking-wider">
            Состояние
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['Б/У', 'Новое', 'На запчасти'] as const).map((cond) => (
              <button
                key={cond}
                type="button"
                onClick={() => {
                  triggerHapticFeedback('light')
                  setCondition(cond)
                }}
                className={`py-2 rounded-xl text-xs font-bold text-center transition-all ${
                  condition === cond
                    ? 'bg-[#CCFF00] text-black font-extrabold shadow-[0_0_15px_rgba(204,255,0,0.4)]'
                    : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                }`}
              >
                {cond}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Inputs (Original vs Discounted) */}
        <div className="grid grid-cols-2 gap-3 bg-white/[0.03] p-3.5 rounded-2xl border border-white/10">
          <div>
            <label className="block text-gray-400 text-[11px] mb-1 font-medium">
              Обычная цена ($)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500 font-bold">$</span>
              <input
                type="number"
                value={oldPrice}
                onChange={(e) => setOldPrice(e.target.value)}
                className="w-full bg-[#070B12] border border-white/15 rounded-xl pl-7 pr-3 py-2 text-xs text-gray-300 line-through focus:border-[#00F2FE] outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[#00F2FE] text-[11px] font-bold">
                Горящая цена ($) <span className="text-red-400">*</span>
              </label>
              {discountPercent > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded animate-pulse">
                  -{discountPercent}%
                </span>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-[#00F2FE] font-black">$</span>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-[#070B12] border border-[#00F2FE]/50 rounded-xl pl-7 pr-3 py-2 text-xs text-white font-extrabold focus:border-[#00F2FE] outline-none shadow-[0_0_10px_rgba(0,242,254,0.2)]"
              />
            </div>
          </div>
        </div>

        {/* District & Timer Row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-gray-300 text-xs mb-1 font-bold uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#00F2FE]" />
              <span>Район</span>
            </label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full bg-[#070B12] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:border-[#00F2FE] outline-none"
            >
              {activeHubData.districts.map((dist) => (
                <option key={dist} value={dist} className="bg-[#070B12] text-white">
                  {dist}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-300 text-xs mb-1 font-bold uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#CCFF00]" />
              <span>Таймер скидки</span>
            </label>
            <select
              value={expiresHours}
              onChange={(e) => setExpiresHours(e.target.value)}
              className="w-full bg-[#070B12] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:border-[#00F2FE] outline-none"
            >
              <option value="3" className="bg-[#070B12] text-white">3 часа (Срочно)</option>
              <option value="6" className="bg-[#070B12] text-white">6 часов</option>
              <option value="12" className="bg-[#070B12] text-white">12 часов</option>
              <option value="24" className="bg-[#070B12] text-white">24 часа</option>
            </select>
          </div>
        </div>

        {/* Photo Selection Presets */}
        <div>
          <label className="block text-gray-300 text-xs mb-1.5 font-bold uppercase tracking-wider flex items-center gap-1">
            <ImageIcon className="w-3.5 h-3.5 text-[#00F2FE]" />
            <span>Обложка товара</span>
          </label>
          <div className="grid grid-cols-4 gap-2 mb-2">
            {IMAGE_PRESETS.map((preset) => (
              <button
                key={preset.url}
                type="button"
                onClick={() => {
                  triggerHapticFeedback('light')
                  setImageUrl(preset.url)
                }}
                className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all ${
                  imageUrl === preset.url
                    ? 'border-[#00F2FE] shadow-[0_0_12px_rgba(0,242,254,0.5)] scale-105'
                    : 'border-white/10 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[8px] font-bold text-white text-center py-0.5 truncate px-0.5">
                  {preset.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Description Textarea */}
        <div>
          <label className="block text-gray-300 text-xs mb-1 font-bold uppercase tracking-wider">
            Описание товара
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Укажите причину скидки, пробег, комплект или дефекты..."
            className="w-full bg-[#070B12] border border-white/15 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:border-[#00F2FE] outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00F2FE] via-[#00DFEA] to-[#CCFF00] text-black font-black text-xs flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,242,254,0.4)] active:scale-[0.98] transition-all uppercase tracking-wider"
        >
          <Flame className="w-4 h-4 text-black fill-black" />
          <span>🔥 Опубликовать лот во Flash Market</span>
        </button>
      </form>
    </div>
  )
}
