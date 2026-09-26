import React from 'react'
import { triggerHapticFeedback } from '../lib/telegram'
import { AppMode } from './BottomNav'

interface PillSwitcherProps {
  mode: AppMode
  onModeChange: (mode: AppMode) => void
}

export const PillSwitcher: React.FC<PillSwitcherProps> = ({ mode, onModeChange }) => {
  const handleSwitch = (newMode: AppMode) => {
    if (mode !== newMode) {
      triggerHapticFeedback('medium')
      onModeChange(newMode)
    }
  }

  return (
    <div className="pill-switcher flex bg-[#161B22] border border-white/10 rounded-2xl p-1 mx-4 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
      <button
        onClick={() => handleSwitch('services')}
        className={`flex-1 py-3 px-2 rounded-xl text-[13px] font-bold font-display tracking-wide text-center transition-all duration-300 ${
          mode === 'services'
            ? 'bg-gradient-to-br from-[#00F2FE] to-[#00D4E8] text-black shadow-[0_0_20px_rgba(0,242,254,0.3)]'
            : 'bg-transparent text-[#8B949E]'
        }`}
      >
        🛠 УСЛУГИ И АРЕНДА
      </button>
      
      <button
        onClick={() => handleSwitch('market')}
        className={`flex-1 py-3 px-2 rounded-xl text-[13px] font-bold font-display tracking-wide text-center transition-all duration-300 ${
          mode === 'market'
            ? 'bg-gradient-to-br from-[#CCFF00] to-[#B8E600] text-black shadow-[0_0_20px_rgba(204,255,0,0.3)]'
            : 'bg-transparent text-[#8B949E]'
        }`}
      >
        🏷 FLASH MARKET
      </button>
    </div>
  )
}
