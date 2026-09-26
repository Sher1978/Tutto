import React from 'react'
import { Flame, ArrowUpDown, Filter, Search, Tag, Sparkles } from 'lucide-react'
import { triggerHapticFeedback } from '../lib/telegram'

export type MarketSortOption = 'discount' | 'price_asc' | 'price_desc' | 'urgent'

interface MarketFilterBarProps {
  searchQuery: string
  onSearchChange: (q: string) => void
  sortBy: MarketSortOption
  onSortChange: (sort: MarketSortOption) => void
  conditionFilter: string | null
  onConditionChange: (cond: string | null) => void
}

export const MarketFilterBar: React.FC<MarketFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  conditionFilter,
  onConditionChange,
}) => {
  return (
    <div className="w-full space-y-2.5 bg-[#121824] p-3 rounded-2xl border border-white/10 shadow-lg">
      {/* 1. Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#00F2FE] absolute left-3 top-2.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Поиск по названию или описанию лота..."
          className="w-full bg-[#070B12] border border-white/15 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:border-[#00F2FE] outline-none"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-2 text-xs text-gray-400 hover:text-white"
          >
            ✕
          </button>
        )}
      </div>

      {/* 2. Sorting & Condition Controls */}
      <div className="flex items-center justify-between gap-2 text-xs">
        {/* Sort selector */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[10px] font-bold text-gray-400 uppercase mr-1 shrink-0 flex items-center gap-1">
            <ArrowUpDown className="w-3 h-3 text-[#00F2FE]" />
            Сорт:
          </span>

          {[
            { id: 'discount', label: '🔥 Скидка %' },
            { id: 'price_asc', label: '💰 Сначала дешевле' },
            { id: 'urgent', label: '⏱️ Срочные' },
          ].map((sortItem) => {
            const isSelected = sortBy === sortItem.id
            return (
              <button
                key={sortItem.id}
                type="button"
                onClick={() => {
                  triggerHapticFeedback('light')
                  onSortChange(sortItem.id as MarketSortOption)
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold shrink-0 transition-all ${
                  isSelected
                    ? 'bg-[#00F2FE] text-black shadow-[0_0_10px_rgba(0,242,254,0.4)]'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
              >
                {sortItem.label}
              </button>
            )
          })}
        </div>

        {/* Condition Filter pills */}
        <div className="flex items-center gap-1 shrink-0">
          {(['Б/У', 'Новое'] as const).map((cond) => {
            const isSelected = conditionFilter === cond
            return (
              <button
                key={cond}
                type="button"
                onClick={() => {
                  triggerHapticFeedback('light')
                  onConditionChange(isSelected ? null : cond)
                }}
                className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all ${
                  isSelected
                    ? 'bg-[#CCFF00] text-black shadow-[0_0_10px_rgba(204,255,0,0.4)]'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {cond}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
