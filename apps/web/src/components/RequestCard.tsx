import React, { useState, useEffect } from 'react'
import { Clock, Zap, MapPin, Sparkles, Users } from 'lucide-react'
import { RequestItem } from '../types'
import { CATEGORIES } from '../data/mockData'

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

  const category = CATEGORIES.find((c) => c.id === request.categoryL1Id)
  const displayImage =
    request.mediaUrls && request.mediaUrls.length > 0
      ? request.mediaUrls[0]
      : category?.defaultCoverUrl || null

  const isUserPhoto = Boolean(request.mediaUrls && request.mediaUrls.length > 0)

  useEffect(() => {
    const updateTimer = () => {
      const endsAt = new Date(request.auctionEndsAt).getTime()
      const now = new Date().getTime()
      const diff = endsAt - now

      if (diff <= 0) {
        setTimeLeft('00:00:00')
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
    <div className="mockup-card p-5 flex flex-col justify-between relative overflow-hidden group">
      {/* Featured Ribbon */}
      {request.isFeatured && (
        <div className="absolute -top-3 -right-12 bg-gradient-to-r from-amber-400 to-yellow-300 text-black font-black text-[10px] uppercase tracking-wider py-1 px-10 rotate-45 shadow-lg z-10">
          VIP Закреп
        </div>
      )}

      <div>
        {/* Cover Image Banner with Subtitle overlay */}
        {displayImage && (
          <div className="mb-4 rounded-2xl overflow-hidden h-44 w-full relative border border-white/15 shadow-2xl">
            <img
              src={displayImage}
              alt={request.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#060911] via-[#060911]/40 to-transparent" />

            {/* Hub Badge overlay */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-[#00F2FE]/40 text-[#00F2FE] font-extrabold text-xs uppercase tracking-wider flex items-center gap-1 shadow-lg">
                <MapPin className="w-3.5 h-3.5 text-[#00F2FE]" />
                {request.hub.toUpperCase()}: {request.district}
              </span>
            </div>

            {/* Photo / Category Tag */}
            <div className="absolute bottom-3 left-3">
              <span className="px-2.5 py-1 rounded-xl bg-black/80 backdrop-blur-md text-[10px] text-gray-200 font-bold border border-white/15 flex items-center gap-1">
                {!isUserPhoto && <Sparkles className="w-3 h-3 text-[#00F2FE]" />}
                {isUserPhoto ? '📷 Фото клиента' : '✨ Категория'}
              </span>
            </div>
          </div>
        )}

        {/* Title */}
        <h3
          onClick={() => onOpenDetails(request)}
          className="font-display font-extrabold text-lg text-white hover:text-[#00F2FE] transition-colors cursor-pointer line-clamp-2 leading-snug mb-2"
        >
          {request.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-gray-300 line-clamp-2 mb-4 leading-relaxed font-normal">
          {request.description}
        </p>

        {/* Bidders & Low Bid Price Block */}
        <div className="bg-[#121826]/90 p-3.5 rounded-2xl border border-white/10 mb-4 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>{request.bidsCount} Bidders</span>
            </span>
            <span className="text-xs text-gray-300 mt-0.5">
              Current Low Bid:
            </span>
          </div>

          <div className="flex flex-col items-end">
            {request.budget !== null ? (
              <span className="text-2xl font-black glow-price font-display">
                ${request.budget}
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-xl bg-purple-500/20 text-purple-300 font-extrabold text-xs border border-purple-500/40">
                Open Offer
              </span>
            )}
          </div>
        </div>

        {/* Giant Timer Display */}
        <div className="flex items-center justify-between px-2 mb-4">
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-4 h-4 text-[#00FF87] animate-pulse" />
            Auction Timer:
          </span>
          <span className="text-2xl font-black text-[#00FF87] font-mono glow-timer tracking-widest">
            {timeLeft}
          </span>
        </div>
      </div>

      {/* Large Full-Width Action Button */}
      <button
        onClick={() => onQuickBid(request)}
        className="mockup-btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-2"
      >
        <Zap className="w-4 h-4 fill-black" />
        <span>VIEW OFFER / BID NOW</span>
      </button>
    </div>
  )
}
