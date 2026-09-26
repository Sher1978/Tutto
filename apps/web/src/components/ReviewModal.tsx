import React, { useState } from 'react'
import { X, Star, ThumbsUp, Sparkles, Check } from 'lucide-react'
import { triggerHapticFeedback, triggerNotificationFeedback } from '../lib/telegram'

interface ReviewModalProps {
  isOpen: boolean
  providerName: string
  providerAvatar?: string
  serviceTitle: string
  onClose: () => void
  onSubmitReview: (review: { rating: number; comment: string; tags: string[] }) => void
}

const REVIEW_TAGS = [
  '⚡ Быстро и вовремя',
  '💰 Честная цена',
  '🤝 Вежливость и связь',
  '🏆 Отличное качество',
  '🚗 Удобная доставка',
]

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  providerName,
  providerAvatar,
  serviceTitle,
  onClose,
  onSubmitReview,
}) => {
  if (!isOpen) return null

  const [rating, setRating] = useState<number>(5)
  const [hoverRating, setHoverRating] = useState<number>(0)
  const [selectedTags, setSelectedTags] = useState<string[]>([REVIEW_TAGS[0], REVIEW_TAGS[3]])
  const [comment, setComment] = useState<string>('')
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false)

  const toggleTag = (tag: string) => {
    triggerHapticFeedback('light')
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true)
    triggerHapticFeedback('heavy')
    triggerNotificationFeedback('success')

    onSubmitReview({
      rating,
      comment,
      tags: selectedTags,
    })

    setTimeout(() => {
      setIsSubmitted(false)
      onClose()
    }, 1500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md glass-panel rounded-3xl border border-amber-400/40 p-5 space-y-4 relative overflow-hidden text-xs">
        {/* Glow Sprite */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-400/20 flex items-center justify-center">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-sm text-white">Оставить отзыв Исполнителю</h3>
              <p className="text-[10px] text-gray-400">Помогите сообществу выбирать лучших мастеров</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Provider Profile snippet */}
        <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10">
          <img
            src={providerAvatar || 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=100'}
            alt={providerName}
            className="w-11 h-11 rounded-xl object-cover border border-amber-400/40"
          />
          <div>
            <div className="font-bold text-white text-sm">{providerName}</div>
            <div className="text-[11px] text-gray-400">Услуга: «{serviceTitle}»</div>
          </div>
        </div>

        {/* Interactive 5-Star Rating Selector */}
        <div className="text-center py-2 space-y-2">
          <div className="text-gray-300 font-medium text-xs">Ваша оценка работы:</div>
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => {
                  setRating(star)
                  triggerHapticFeedback('medium')
                }}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 transition-transform hover:scale-125 focus:outline-none"
              >
                <Star
                  className={`w-8 h-8 ${
                    (hoverRating || rating) >= star
                      ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]'
                      : 'text-gray-600'
                  }`}
                />
              </button>
            ))}
          </div>
          <div className="text-amber-400 font-bold text-xs">
            {rating === 5 && '🌟 Превосходно! Впечатлён качеством'}
            {rating === 4 && '👍 Отлично, всё хорошо'}
            {rating === 3 && '😐 Нормально, но есть замечания'}
            {rating === 2 && '👎 Не совсем устроило'}
            {rating === 1 && '❌ Плохо, возникли проблемы'}
          </div>
        </div>

        {/* Quick Tag Chips */}
        <div>
          <label className="block text-gray-400 text-[11px] mb-1.5 font-medium">Отметьте плюсы:</label>
          <div className="flex flex-wrap gap-1.5">
            {REVIEW_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag)
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all ${
                    isSelected
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/60 shadow-[0_0_10px_rgba(251,191,36,0.2)]'
                      : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {tag}
                </button>
              )
            })}
          </div>
        </div>

        {/* Comment Input */}
        <div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Напишите пару слов о вашем впечатлении от работы..."
            className="w-full bg-slate-950/80 border border-white/15 rounded-xl p-3 text-gray-200 text-xs focus:border-amber-400 outline-none leading-relaxed resize-none"
          />
        </div>

        {/* Bonus Notification */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-200 text-[11px]">
          <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
          <span>За публикацию отзыва вы получите <strong>+10 Tuttos</strong> на ваш бонусный счёт!</span>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitted}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(251,191,36,0.4)] active:scale-[0.98] transition-transform"
        >
          {isSubmitted ? (
            <>
              <Check className="w-4 h-4 text-black" />
              <span>Спасибо! Отзыв опубликован</span>
            </>
          ) : (
            <>
              <ThumbsUp className="w-4 h-4 text-black" />
              <span>Опубликовать отзыв</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
