import React, { useState } from 'react'
import { X, Zap, DollarSign, Bot, ShieldCheck } from 'lucide-react'
import { RequestItem } from '../types'
import { triggerHapticFeedback, triggerNotificationFeedback } from '../lib/telegram'

interface BidModalProps {
  request: RequestItem | null
  isOpen: boolean
  onClose: () => void
  onSubmitBid: (requestId: string, price: number, comment: string) => void
}

export const BidModal: React.FC<BidModalProps> = ({
  request,
  isOpen,
  onClose,
  onSubmitBid,
}) => {
  if (!isOpen || !request) return null

  const [price, setPrice] = useState(request.budget ? String(request.budget) : '180')
  const [comment, setComment] = useState('Готовы выполнить в лучшем виде. Доставим в течение 30 минут!')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!price || parseFloat(price) <= 0) {
      triggerNotificationFeedback('error')
      alert('Укажите корректную стоимость!')
      return
    }

    triggerHapticFeedback('medium')
    triggerNotificationFeedback('success')
    onSubmitBid(request.id, parseFloat(price), comment)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full sm:max-w-md glass-panel rounded-t-3xl sm:rounded-3xl border border-white/10 p-5 safe-area-bottom">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-black fill-black" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">Сделать оффер</h3>
              <p className="text-xs text-cyan-400 line-clamp-1">{request.title}</p>
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
          {/* Proposed Price */}
          <div>
            <label className="block text-gray-300 font-semibold mb-1.5">Ваша цена ($ USD)</label>
            <div className="relative">
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3 py-3 text-white text-lg font-extrabold pr-16 focus:border-cyan-400 outline-none"
              />
              <span className="absolute right-3 top-3 text-cyan-400 font-bold text-sm">USD</span>
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-gray-300 font-semibold mb-1.5">Сообщение клиенту</label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Опишите ваши преимущества, что входит в стоимость..."
              className="w-full bg-slate-900/90 border border-white/10 rounded-xl p-3 text-white focus:border-cyan-400 outline-none resize-none"
            />
          </div>

          {/* Business Guarantee Info */}
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-200 text-[11px] flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <span>Ваш профиль и отзывные оценки будут прикреплены к офферу. Оплата принимается напрямую от клиента.</span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 text-black font-extrabold text-sm shadow-lg shadow-cyan-500/25 hover:brightness-110 active:scale-[0.98] transition-all"
          >
            Отправить встречное предложение
          </button>
        </form>
      </div>
    </div>
  )
}
