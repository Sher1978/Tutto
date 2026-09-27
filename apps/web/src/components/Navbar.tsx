import React, { useState, useEffect } from 'react'
import { Coins, ChevronDown, MapPin, Globe } from 'lucide-react'
import { getTelegramUser, triggerHapticFeedback } from '../lib/telegram'
import { TokenWalletModal } from './TokenWalletModal'
import { LocationSelectorModal } from './LocationSelectorModal'
import { AppMode } from './BottomNav'
import { Session } from '@supabase/supabase-js'
import { detectUserLocation } from '../lib/geo'
import { Language, LANGUAGES, t } from '../lib/i18n'

interface NavbarProps {
  currentLang?: Language
  onLanguageChange?: (lang: Language) => void
  onOpenQuickRequest?: () => void
  onLocationChange?: (hub: string, district: string) => void
  activeAuctionsCount?: number
  totalBidsCount?: number
  savedAmount?: number
  userRole?: 'client' | 'business'
  mode: AppMode
  session?: Session | null
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLang = 'ru',
  onLanguageChange,
  onOpenQuickRequest,
  onLocationChange,
  activeAuctionsCount = 0,
  totalBidsCount = 0,
  savedAmount = 85,
  userRole = 'client',
  mode,
  session,
}) => {
  const telegramUser = getTelegramUser()
  const [isWalletOpen, setIsWalletOpen] = useState(false)
  const [isLocationOpen, setIsLocationOpen] = useState(false)
  const [isLangOpen, setIsLangOpen] = useState(false)
  const [tokenBalance, setTokenBalance] = useState(150)
  const [currentHubId, setCurrentHubId] = useState<string>('phuket')
  const [locationName, setLocationName] = useState<string>('Определение...')

  useEffect(() => {
    // Автоматическое определение локации 1 и 2 уровня
    const fetchLoc = async () => {
      try {
        const loc = await detectUserLocation()
        setCurrentHubId(loc.hubId)
        setLocationName(`${loc.hubNameRu}, ${loc.district}`)
        if (onLocationChange) onLocationChange(loc.hubId, loc.district)
      } catch (err) {
        setLocationName('Пхукет, Chalong') // Фолбэк
        if (onLocationChange) onLocationChange('phuket', 'Chalong')
      }
    }
    fetchLoc()
  }, [])

  const handleOpenWallet = () => {
    triggerHapticFeedback('light')
    setIsWalletOpen(true)
  }

  const activeLangOption = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0]

  // Определяем аватар: Сначала сессия (Google/Email), затем Telegram, затем дефолт
  const avatarUrl =
    session?.user?.user_metadata?.avatar_url ||
    telegramUser?.photo_url ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'

  return (
    <>
      <header className="w-full pt-[max(env(safe-area-inset-top),60px)] pb-2 px-4 flex flex-col gap-3 relative z-10">
        {/* Top Row: Title, Slogan, Language & Profile */}
        <div className="flex items-center justify-between w-full">
          <div className="flex flex-col pt-1">
            <h1 className="font-display text-[28px] font-black tracking-wider leading-none flex items-center gap-1.5">
              <span className="glow-tutto">TUTTO</span>
              <span className="glow-minutto">MINUTTO</span>
            </h1>
            <span className="text-[10px] font-bold text-white tracking-widest uppercase mt-1.5">
              {t(currentLang, 'app_slogan')}
            </span>
          </div>

          <div className="flex items-center gap-2 relative">
            {/* Language Switcher Pill */}
            <div className="relative">
              <button
                aria-label="Переключить язык"
                onClick={() => {
                  triggerHapticFeedback('light')
                  setIsLangOpen(!isLangOpen)
                }}
                className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-2.5 py-1 hover:bg-white/10 transition-colors text-xs font-bold text-white cursor-pointer"
              >
                <span>{activeLangOption.flag}</span>
                <span className="uppercase">{activeLangOption.code}</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              {/* Language Dropdown Menu */}
              {isLangOpen && (
                <div className="absolute top-full right-0 mt-2 w-32 bg-slate-900 border border-white/15 rounded-2xl p-1.5 shadow-2xl z-50 animate-fadeIn space-y-0.5">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        triggerHapticFeedback('medium')
                        if (onLanguageChange) onLanguageChange(lang.code)
                        setIsLangOpen(false)
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        currentLang === lang.code
                          ? 'bg-gradient-to-r from-[#00F2FE]/20 to-[#CCFF00]/20 text-[#00F2FE] border border-[#00F2FE]/30'
                          : 'text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Wallet Balance Pill */}
            <button
              onClick={handleOpenWallet}
              className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-2.5 py-1 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[12px] font-bold text-white">{tokenBalance}</span>
            </button>

            {/* User Avatar */}
            <div className="relative shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
              <div
                className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full blur-[90px] pointer-events-none transition-all duration-500 z-0 ${
                  mode === 'services'
                    ? 'bg-[#CCFF00]/40 shadow-[0_0_80px_rgba(204,255,0,0.5)]'
                    : 'bg-[#00F2FE]/40 shadow-[0_0_80px_rgba(0,242,254,0.5)]'
                }`}
              />

              <img
                src={avatarUrl}
                alt="Profile"
                className={`w-12 h-12 rounded-full border-[2.5px] object-cover transition-all duration-300 relative z-10 ${
                  mode === 'services'
                    ? 'border-[#CCFF00] shadow-[0_0_18px_rgba(204,255,0,0.85)]'
                    : 'border-[#00F2FE] shadow-[0_0_18px_rgba(0,242,254,0.85)]'
                }`}
              />
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#0A101D] transition-colors duration-300 z-20 ${
                  mode === 'services' ? 'bg-[#CCFF00]' : 'bg-[#00F2FE]'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Bottom Row: Location Badge */}
        <div
          onClick={() => {
            triggerHapticFeedback('light')
            setIsLocationOpen(true)
          }}
          className="flex items-center self-start gap-1.5 bg-[#0D1117] border border-[#222222] rounded-full px-3 py-1 cursor-pointer hover:bg-[#161B22] transition-colors"
        >
          <MapPin className="w-3.5 h-3.5 text-[#00F2FE]" />
          <span className="text-[12px] font-bold text-white tracking-wide">{locationName}</span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-1" />
        </div>
      </header>

      <TokenWalletModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        currentBalance={tokenBalance}
        onTopUp={(amount) => setTokenBalance((prev) => prev + amount)}
      />

      <LocationSelectorModal
        isOpen={isLocationOpen}
        onClose={() => setIsLocationOpen(false)}
        currentHub={currentHubId}
        currentDistrict={locationName.split(', ')[1] || ''}
        onSelect={(hubId, district) => {
          const hubNames: Record<string, string> = {
            bali: 'Бали',
            phuket: 'Пхукет',
            dubai: 'Дубай',
            samui: 'Самуи',
          }
          setCurrentHubId(hubId)
          setLocationName(`${hubNames[hubId] || hubId}, ${district}`)
          if (onLocationChange) onLocationChange(hubId, district)
        }}
      />
    </>
  )
}
