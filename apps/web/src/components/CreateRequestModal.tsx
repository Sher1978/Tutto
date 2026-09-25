import React, { useState } from 'react'
import { X, Sparkles, MapPin, DollarSign, ImagePlus, CheckCircle } from 'lucide-react'
import { CATEGORIES, HUBS } from '../data/mockData'
import { HubId, RequestItem } from '../types'
import { triggerHapticFeedback, triggerNotificationFeedback } from '../lib/telegram'

interface CreateRequestModalProps {
  isOpen: boolean
  onClose: () => void
  currentHub: HubId
  onCreateRequest: (newReq: Partial<RequestItem>) => void
}

export const CreateRequestModal: React.FC<CreateRequestModalProps> = ({
  isOpen,
  onClose,
  currentHub,
  onCreateRequest,
}) => {
  if (!isOpen) return null

  const activeHub = HUBS.find((h) => h.id === currentHub) || HUBS[0]

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryL1Id, setCategoryL1Id] = useState(CATEGORIES[0].id)
  const [district, setDistrict] = useState(activeHub.districts[0] || 'Rawai')
  const [budgetType, setBudgetType] = useState<'fixed' | 'open'>('fixed')
  const [budgetValue, setBudgetValue] = useState('150')
  const [durationMinutes, setDurationMinutes] = useState('120') // 2 hours default
  const [isFeatured, setIsFeatured] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) {
      triggerNotificationFeedback('error')
      alert('Заполните название и описание заявки!')
      return
    }

    const selectedCategory = CATEGORIES.find((c) => c.id === categoryL1Id) || CATEGORIES[0]

    const newRequest: Partial<RequestItem> = {
      title,
      description,
      categoryL1Id,
      categoryL1Name: selectedCategory.titleRu,
      hub: currentHub,
      district,
      budget: budgetType === 'fixed' ? parseFloat(budgetValue) || 0 : null,
      currency: 'USD',
      isFeatured,
      auctionEndsAt: new Date(Date.now() + parseInt(durationMinutes) * 60 * 1000).toISOString(),
    }

    triggerHapticFeedback('heavy')
    triggerNotificationFeedback('success')
    onCreateRequest(newRequest)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full sm:max-w-lg glass-panel rounded-t-3xl sm:rounded-3xl border border-white/10 p-5 overflow-y-auto max-h-[90vh] safe-area-bottom">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 flex items-center justify-center border border-cyan-400/40">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-white">Создать заказ</h2>
              <p className="text-xs text-gray-400">Исполнители предложат свои цены</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Category */}
          <div>
            <label className="block text-gray-300 font-semibold mb-1.5">Категория услуги</label>
            <select
              value={categoryL1Id}
              onChange={(e) => setCategoryL1Id(e.target.value)}
              className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:border-cyan-400 outline-none"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.titleRu}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-gray-300 font-semibold mb-1.5">Что именно нужно сделать?</label>
            <input
              type="text"
              placeholder="Например: Нужна аренда NMAX на 14 дней в Раваи"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-gray-500 focus:border-cyan-400 outline-none"
            />
          </div>

          {/* District & Location */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 font-semibold mb-1.5">Хаб</label>
              <div className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>{activeHub.flag} {activeHub.nameRu}</span>
              </div>
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-1.5">Район</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:border-cyan-400 outline-none"
              >
                {activeHub.districts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-300 font-semibold mb-1.5">Подробное описание и требования</label>
            <textarea
              rows={3}
              placeholder="Укажите даты, важные условия, место доставки..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-900/90 border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 focus:border-cyan-400 outline-none resize-none"
            />
          </div>

          {/* Budget Switcher */}
          <div>
            <label className="block text-gray-300 font-semibold mb-1.5">Бюджет заказа</label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button
                type="button"
                onClick={() => setBudgetType('fixed')}
                className={`py-2 px-3 rounded-xl border font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  budgetType === 'fixed'
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                    : 'bg-white/5 border-white/10 text-gray-400'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Указать бюджет</span>
              </button>
              <button
                type="button"
                onClick={() => setBudgetType('open')}
                className={`py-2 px-3 rounded-xl border font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  budgetType === 'open'
                    ? 'bg-purple-500/20 border-purple-400 text-purple-300'
                    : 'bg-white/5 border-white/10 text-gray-400'
                }`}
              >
                <span>Жду предложений</span>
              </button>
            </div>

            {budgetType === 'fixed' && (
              <div className="relative">
                <input
                  type="number"
                  placeholder="200"
                  value={budgetValue}
                  onChange={(e) => setBudgetValue(e.target.value)}
                  className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3 py-2.5 text-white pr-16 focus:border-cyan-400 outline-none font-bold text-sm"
                />
                <span className="absolute right-3 top-2.5 text-cyan-400 font-bold">USD</span>
              </div>
            )}
          </div>

          {/* Auction Duration */}
          <div>
            <label className="block text-gray-300 font-semibold mb-1.5">Длительность аукциона</label>
            <select
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:border-cyan-400 outline-none"
            >
              <option value="30">30 минут (Срочный выезд)</option>
              <option value="120">2 часа (Стандарт)</option>
              <option value="360">6 часов</option>
              <option value="1440">24 часа</option>
            </select>
          </div>

          {/* Featured VIP Option */}
          <div
            onClick={() => setIsFeatured(!isFeatured)}
            className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
              isFeatured
                ? 'bg-amber-500/10 border-amber-400/50'
                : 'bg-white/5 border-white/10'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-400/20 flex items-center justify-center text-amber-400 font-bold">
                ★
              </div>
              <div>
                <div className="text-white font-bold">Закрепить заказ в ТОПе (VIP)</div>
                <div className="text-[10px] text-gray-400">В 3 раза больше откликов от PRO-исполнителей ($2)</div>
              </div>
            </div>
            {isFeatured && <CheckCircle className="w-5 h-5 text-amber-400" />}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 text-black font-extrabold text-sm shadow-lg shadow-cyan-500/25 hover:brightness-110 active:scale-[0.98] transition-all"
          >
            Опубликовать заявку в аукцион
          </button>
        </form>
      </div>
    </div>
  )
}
