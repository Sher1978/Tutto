import React, { useState, useEffect } from 'react'
import { Clock, MessageSquare, Zap, MapPin, CheckCircle2, ChevronRight } from 'lucide-react'
import { RequestItem } from '../types'

interface RequestCardProps {
  request: RequestItem
  onOpenDetails: (request: RequestItem) => void
  onQuickBid: (request: RequestItem) => void
}

export const RequestCard: React.FC<RequestCardProps> = ({
  request,
  onOpenDetails,
  onQuickBid,
}) => {
  const [timeLeft, setTimeLeft] = useState<string>('')

  useEffect(() => {
    const updateTimer = () => {
      const endsAt = new Date(request.auctionEndsAt).getTime()
      const now = new Date().getTime()
      const diff = endsAt - now

      if (diff <= 0) {
        setTimeLeft('Аукцион завершен')
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeLeft(
        `${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      )
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [request.auctionEndsAt])

  return (
    <div
      className={`glass-card p-4 flex flex-col justify-between relative overflow-hidden group border ${
        request.isFeatured
          ? 'border-amber-400/40 bg-gradient-to-b from-amber-500/5 to-transparent shadow-lg shadow-amber-500/5'
          : 'border-white/10'
      }`}
    >
      {/* Featured Ribbon if applies */}
      {request.isFeatured && (
        <div className="absolute -top-3 -right-12 bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-extrabold text-[10px] uppercase tracking-wider py-1 px-10 rotate-45 shadow-md">
          VIP Закреп
        </div>
      )}

      <div>
        {/* Header: Location & Timer */}
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-cyan-300 font-medium flex items-center gap-1">
              <MapPin className="w-3 h-3 text-cyan-400" />
              {request.district}
            </span>
            <span className="text-gray-400 font-medium">{request.categoryL1Name}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 font-mono font-semibold">
            <Clock className="w-3 h-3 animate-pulse" />
            <span>{timeLeft}</span>
          </div>
        </div>

        {/* Title & Budget */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 
            onClick={() => onOpenDetails(request)}
            className="font-display font-bold text-base text-white hover:text-cyan-400 transition-colors cursor-pointer line-clamp-2"
          >
            {request.title}
          </h3>

          <div className="flex flex-col items-end shrink-0">
            {request.budget !== null ? (
              <div className="text-lg font-extrabold text-cyan-400 font-display">
                ${request.budget}
              </div>
            ) : (
              <div className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-semibold text-xs border border-purple-500/30">
                Жду предложений
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-300 line-clamp-2 mb-4 leading-relaxed">
          {request.description}
        </p>

        {/* Media Preview if exists */}
        {request.mediaUrls && request.mediaUrls.length > 0 && (
          <div className="mb-4 rounded-xl overflow-hidden h-32 w-full relative group-hover:brightness-105 transition-all">
            <img
              src={request.mediaUrls[0]}
              alt={request.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Footer Meta & Actions */}
      <div className="pt-3 border-t border-white/10 flex items-center justify-between">
        {/* Client Avatar & Bids count */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <img
              src={request.clientAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
              alt={request.clientName}
              className="w-6 h-6 rounded-full object-cover border border-white/20"
            />
            <span className="text-xs text-gray-300 font-medium">{request.clientName}</span>
          </div>

          <div className="flex items-center gap-1 text-xs text-gray-400 bg-white/5 px-2 py-0.5 rounded-full">
            <MessageSquare className="w-3 h-3 text-cyan-400" />
            <span className="font-semibold text-white">{request.bidsCount}</span>
            <span>откликов</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onQuickBid(request)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 text-black font-bold text-xs shadow-md shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-1"
          >
            <Zap className="w-3.5 h-3.5 fill-black" />
            <span>Откликнуться</span>
          </button>
        </div>
      </div>
    </div>
  )
}
