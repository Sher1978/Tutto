import React from 'react'
import { ServiceTemplate } from '../types'
import { triggerHapticFeedback } from '../lib/telegram'

interface TemplateCardProps {
  template: ServiceTemplate
  onLaunchTemplate: (template: ServiceTemplate) => void
  onSaveTemplate: (template: ServiceTemplate) => void
  isSaved?: boolean
}

// Short Russian display names for each template ID
const SHORT_NAMES: Record<string, string> = {
  'tmpl-nmax': 'БАЙК\nВ АРЕНДУ',
  'tmpl-car': 'АВТО\nВ АРЕНДУ',
  'tmpl-yacht': 'ЯХТА\nНА ДЕНЬ',
  'tmpl-phiphi': 'ТУР\nНА ОСТРОВА',
  'tmpl-cash-baht': 'ОБМЕН\nВАЛЮТЫ',
  'tmpl-villa': 'СНЯТЬ\nВИЛЛУ',
  'tmpl-massage': 'МАССАЖ\nНА ВИЛЛУ',
}

// Accent color per category
const CATEGORY_COLORS: Record<string, { glow: string; border: string; from: string; to: string }> = {
  'cat-transport':  { glow: '0,242,254',    border: 'rgba(0,242,254,0.5)',    from: '#003a4d', to: '#001a26' },
  'cat-tours':      { glow: '255,196,0',    border: 'rgba(255,196,0,0.5)',    from: '#3a2e00', to: '#1a1400' },
  'cat-exchange':   { glow: '168,85,247',   border: 'rgba(168,85,247,0.5)',   from: '#2d0a4e', to: '#12032b' },
  'cat-realestate': { glow: '0,255,135',    border: 'rgba(0,255,135,0.5)',    from: '#003323', to: '#001510' },
  'cat-beauty':     { glow: '255,100,180',  border: 'rgba(255,100,180,0.5)',  from: '#3a0028', to: '#1a0012' },
  'cat-services':   { glow: '255,140,0',    border: 'rgba(255,140,0,0.5)',    from: '#3a1a00', to: '#1a0c00' },
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onLaunchTemplate,
}) => {
  const colors = CATEGORY_COLORS[template.categoryL1Id] || CATEGORY_COLORS['cat-realestate']
  const displayName = SHORT_NAMES[template.id] || template.title.toUpperCase()

  const handleTap = () => {
    triggerHapticFeedback('heavy')
    onLaunchTemplate(template)
  }

  return (
    <button
      onClick={handleTap}
      className="relative flex flex-col items-center justify-between w-full rounded-3xl overflow-hidden cursor-pointer group active:scale-[0.95] transition-all duration-200"
      style={{
        minHeight: '135px',
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        border: '1px solid rgba(255, 255, 255, 0.22)',
        boxShadow: [
          `0 12px 40px rgba(0, 0, 0, 0.4)`,
          `inset 0 1.5px 1px rgba(255, 255, 255, 0.35)`,
          `0 0 30px rgba(${colors.glow}, 0.2)`,
        ].join(', '),
      }}
    >
      {/* Soft gradient accent tint */}
      <div
        className="absolute inset-0 opacity-40 group-hover:opacity-70 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 20%, rgba(${colors.glow}, 0.25) 0%, transparent 70%)`,
        }}
      />

      {/* Pulsing ring animation to signal "tap me" */}
      <span
        className="absolute inset-0 rounded-3xl pointer-events-none"
        style={{
          boxShadow: `0 0 0 0 rgba(${colors.glow}, 0.4)`,
          animation: 'ping 2.8s cubic-bezier(0, 0, 0.2, 1) infinite',
        }}
      />

      {/* Top: service name */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-3 pt-4 pb-2 w-full">
        <span
          className="font-display font-black text-white text-center leading-tight whitespace-pre-line tracking-wide uppercase"
          style={{
            fontSize: '15px',
            textShadow: `0 0 16px rgba(${colors.glow}, 0.9), 0 2px 8px rgba(0,0,0,0.9)`,
          }}
        >
          {displayName}
        </span>
      </div>

      {/* Glassy Divider */}
      <div
        className="w-full h-px mx-0"
        style={{ background: `rgba(255, 255, 255, 0.15)` }}
      />

      {/* Bottom: giant semi-transparent "+" */}
      <div className="relative z-10 w-full flex items-center justify-center py-2.5 bg-white/[0.03]">
        <span
          className="font-black leading-none select-none group-hover:scale-125 transition-transform duration-200"
          style={{
            fontSize: '44px',
            color: `rgba(${colors.glow}, 0.75)`,
            textShadow: `0 0 28px rgba(${colors.glow}, 0.9)`,
            lineHeight: 1,
          }}
        >
          +
        </span>
      </div>

      {/* Hover state sheen */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-3xl pointer-events-none"
        style={{ background: `rgba(255, 255, 255, 0.05)` }}
      />
    </button>
  )
}
