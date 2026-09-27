import React from 'react'
import { triggerHapticFeedback } from '../lib/telegram'
import { AppMode } from './BottomNav'
import { Language, t } from '../lib/i18n'

interface PillSwitcherProps {
  mode: AppMode
  onModeChange: (mode: AppMode) => void
  currentLang?: Language
}

export const PillSwitcher: React.FC<PillSwitcherProps> = ({ mode, onModeChange, currentLang = 'ru' }) => {
  const handleSwitch = (newMode: AppMode) => {
    if (mode !== newMode) {
      triggerHapticFeedback('medium')
      onModeChange(newMode)
    }
  }

  return (
    <div className="pill-switcher flex gap-2 bg-[#161B22] border border-white/10 rounded-2xl p-1.5 mx-4 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
      <button
        type="button"
        onClick={() => handleSwitch('services')}
        className={`flex-1 py-3 px-2 rounded-xl text-[13px] font-bold font-display tracking-wide text-center transition-all duration-300 border ${
          mode === 'services'
            ? 'bg-gradient-to-br from-[#00F2FE] to-[#00D4E8] text-black border-transparent shadow-[0_0_20px_rgba(0,242,254,0.4)]'
            : 'bg-transparent text-[#00F2FE]/80 border-[#00F2FE]/50 hover:border-[#00F2FE] hover:text-[#00F2FE] hover:bg-[#00F2FE]/10'
        }`}
      >
        {t(currentLang, 'mode_services')}
      </button>
      
      <button
        type="button"
        onClick={() => handleSwitch('market')}
        className={`flex-1 py-3 px-2 rounded-xl text-[13px] font-bold font-display tracking-wide text-center transition-all duration-300 border ${
          mode === 'market'
            ? 'bg-gradient-to-br from-[#CCFF00] to-[#B8E600] text-black border-transparent shadow-[0_0_20px_rgba(204,255,0,0.4)]'
            : 'bg-transparent text-[#CCFF00]/80 border-[#CCFF00]/50 hover:border-[#CCFF00] hover:text-[#CCFF00] hover:bg-[#CCFF00]/10'
        }`}
      >
        {t(currentLang, 'mode_market')}
      </button>
    </div>
  )
}
