import React from 'react'
import { Zap, Bookmark, Sparkles } from 'lucide-react'
import { ServiceTemplate } from '../types'
import { triggerHapticFeedback } from '../lib/telegram'

interface TemplateCardProps {
  template: ServiceTemplate
  onLaunchTemplate: (template: ServiceTemplate) => void
  onSaveTemplate: (template: ServiceTemplate) => void
  isSaved?: boolean
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onLaunchTemplate,
  onSaveTemplate,
  isSaved = false,
}) => {
  const handleLaunch = () => {
    triggerHapticFeedback('heavy')
    onLaunchTemplate(template)
  }

  const handleSave = () => {
    triggerHapticFeedback('light')
    onSaveTemplate(template)
  }

  return (
    <div className="mockup-card p-4.5 flex flex-col justify-between relative overflow-hidden group">
      <div>
        {/* Cover Photo Banner */}
        <div className="mb-3.5 rounded-2xl overflow-hidden h-40 w-full relative border border-white/12 shadow-xl">
          <img
            src={template.coverImageUrl}
            alt={template.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060911] via-[#060911]/30 to-transparent" />

          {/* Badge indicator */}
          <div className="absolute top-2.5 left-2.5">
            <span className="px-2.5 py-1 rounded-xl bg-black/75 backdrop-blur-md text-[10px] text-[#00FF87] font-extrabold border border-[#00FF87]/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#00FF87]" />
              {template.isCustomUserTemplate ? '⭐ Мой шаблон' : '⚡ Готовый шаблон'}
            </span>
          </div>

          {/* Budget Tag */}
          <div className="absolute bottom-2.5 right-2.5">
            {template.defaultBudget !== null ? (
              <span className="px-3 py-1 rounded-xl bg-black/80 backdrop-blur-md text-sm font-black glow-price font-display border border-[#00F2FE]/40">
                ~${template.defaultBudget} USD
              </span>
            ) : (
              <span className="px-3 py-1 rounded-xl bg-purple-500/30 backdrop-blur-md text-xs font-bold text-purple-200 border border-purple-400/40">
                Гибкая цена
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="font-display font-extrabold text-base text-white leading-snug mb-1.5 line-clamp-2">
          {template.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-gray-300 line-clamp-3 mb-4 leading-relaxed font-normal">
          {template.description}
        </p>
      </div>

      {/* Action Buttons Row */}
      <div className="flex items-center gap-2 pt-2 border-t border-white/10">
        <button
          onClick={handleLaunch}
          className="mockup-btn-primary flex-1 py-3 text-xs flex items-center justify-center gap-1.5"
        >
          <Zap className="w-4 h-4 fill-black" />
          <span>ЗАЯВКА В 1 КЛИК</span>
        </button>

        <button
          onClick={handleSave}
          title="Сохранить в мои шаблоны"
          className={`p-3 rounded-xl border transition-all ${
            isSaved
              ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(255,179,2,0.3)]'
              : 'bg-[#161B22] border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <Bookmark className="w-4 h-4 fill-current" />
        </button>
      </div>
    </div>
  )
}
