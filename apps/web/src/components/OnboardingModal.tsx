import React, { useState } from 'react'
import { Sparkles, ArrowDown, X, Check, Compass } from 'lucide-react'
import { triggerHapticFeedback } from '../lib/telegram'

interface OnboardingModalProps {
  isOpen: boolean
  onClose: () => void
}

const ONBOARDING_STEPS = [
  {
    step: 1,
    title: '1. Аукцион Услуг & Маркетплейс',
    description: `В TuttoMinutto есть два удобных формата:\n\n• Обратный Аукцион Услуг — вы публикуете запрос, а исполнители сами предлагают наилучшую цену.\n• Flash Market — горячий маркетплейс товаров с быстрыми скидками и P2P-сделками.`,
    pointerPos: 'top-mode',
    targetLabel: 'Переключатель Режимов',
  },
  {
    step: 2,
    title: '2. Выбор Локации и Рубрики',
    description: `Указывайте ваш текущий хаб (Пхукет, Бали, Дубай) и конкретный район вверху экрана.\n\nИспользуйте интерактивные чипы рубрик для мгновенной фильтрации услуг и товаров.`,
    pointerPos: 'top-location',
    targetLabel: 'Локация & Рубрики',
  },
  {
    step: 3,
    title: '3. Создание Заявки на Услугу',
    description: `Нажмите яркую центральную плюс-кнопку (+) в нижнем меню или воспользуйтесь ИИ-Ассистентом.\n\nПросто скажите голосом или напишите — ИИ сам за пару секунд оформит идеальную заявку!`,
    pointerPos: 'bottom-plus',
    targetLabel: 'Кнопка Создания Заявки (+)',
  },
  {
    step: 4,
    title: '4. Объявление о Продаже',
    description: `Хотите быстро продать байк, гаджет или билеты?\n\nПереключитесь на Flash Market и нажмите «+ Разместить лот». Добавляйте до 10 фотографий с мгновенным автоматическим сжатием!`,
    pointerPos: 'top-market',
    targetLabel: 'Режим Flash Market',
  },
  {
    step: 5,
    title: '5. Легких и выгодных сделок!',
    description: `Платформа полностью готова к использованию.\n\nНаходите надёжных исполнителей, экономьте бюджет и заключайте безопасные сделки в один клик. Удачи на TuttoMinutto!`,
    pointerPos: 'center-finish',
    targetLabel: 'Всё готово!',
  },
]

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0)

  if (!isOpen) return null

  const stepData = ONBOARDING_STEPS[currentStep]
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1

  const handleNext = () => {
    triggerHapticFeedback('light')
    if (isLastStep) {
      localStorage.setItem('needtnow_onboarding_completed', 'true')
      onClose()
    } else {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleSkip = (e: React.MouseEvent) => {
    e.stopPropagation()
    triggerHapticFeedback('medium')
    localStorage.setItem('needtnow_onboarding_completed', 'true')
    onClose()
  }

  return (
    <div
      onClick={handleNext}
      className="fixed inset-0 z-[9999] flex flex-col justify-between p-5 bg-black/65 backdrop-blur-[6px] animate-fadeIn select-none cursor-pointer"
    >
      {/* Header bar: Step Counter & Skip Button directly on blurred backdrop */}
      <div className="flex items-center justify-between pt-[max(env(safe-area-inset-top),16px)] px-1 relative z-20">
        <div className="flex items-center gap-2 bg-[#00F2FE]/20 text-[#00F2FE] border border-[#00F2FE]/40 px-3.5 py-1.5 rounded-full text-xs font-black shadow-[0_0_20px_rgba(0,242,254,0.3)]">
          <Compass className="w-4 h-4 animate-spin-slow text-[#00F2FE]" />
          <span>Шаг {currentStep + 1} из {ONBOARDING_STEPS.length}</span>
        </div>

        <button
          type="button"
          onClick={handleSkip}
          className="flex items-center gap-1.5 text-xs font-extrabold text-white/90 hover:text-white bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-full transition-all cursor-pointer border border-white/20 backdrop-blur-md active:scale-95"
        >
          <span>Пропустить</span>
          <X className="w-3.5 h-3.5 text-white/70" />
        </button>
      </div>

      {/* 🎯 SPOTLIGHT HIGHLIGHT RINGS & DOWNWARD POINTER ARROWS */}

      {/* Step 1 Spotlight: Mode Switcher */}
      {stepData.pointerPos === 'top-mode' && (
        <div className="relative z-30 w-full max-w-lg mx-auto pointer-events-none">
          {/* Arrow pointing DOWN directly at PillSwitcher */}
          <div className="fixed top-[175px] left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce text-[#00F2FE] z-40">
            <span className="text-[11px] font-black uppercase tracking-wider bg-[#00F2FE] text-black px-3 py-1 rounded-full shadow-[0_0_20px_rgba(0,242,254,0.8)] mb-1">
              {stepData.targetLabel}
            </span>
            <ArrowDown className="w-8 h-8 stroke-[3.5] drop-shadow-[0_0_15px_#00F2FE]" />
          </div>

          {/* Glowing Neon Box encircling the PillSwitcher block */}
          <div className="fixed top-[236px] left-4 right-4 h-[52px] rounded-2xl border-2 border-[#00F2FE] shadow-[0_0_35px_rgba(0,242,254,0.9)] pointer-events-none z-30 animate-pulse bg-[#00F2FE]/15" />
        </div>
      )}

      {/* Step 2 Spotlight: Location Selector */}
      {stepData.pointerPos === 'top-location' && (
        <div className="relative z-30 w-full max-w-lg mx-auto pointer-events-none">
          <div className="fixed top-[110px] left-4 flex flex-col items-start animate-bounce text-[#CCFF00] z-40">
            <span className="text-[11px] font-black uppercase tracking-wider bg-[#CCFF00] text-black px-3 py-1 rounded-full shadow-[0_0_20px_rgba(204,255,0,0.8)] mb-1">
              {stepData.targetLabel}
            </span>
            <ArrowDown className="w-8 h-8 stroke-[3.5] drop-shadow-[0_0_15px_#CCFF00]" />
          </div>

          {/* Glowing ring encircling the location pill */}
          <div className="fixed top-[170px] left-4 w-[165px] h-[34px] rounded-full border-2 border-[#CCFF00] shadow-[0_0_30px_rgba(204,255,0,0.9)] pointer-events-none z-30 animate-pulse bg-[#CCFF00]/15" />
        </div>
      )}

      {/* Step 4 Spotlight: Flash Market Tab */}
      {stepData.pointerPos === 'top-market' && (
        <div className="relative z-30 w-full max-w-lg mx-auto pointer-events-none">
          <div className="fixed top-[175px] right-6 flex flex-col items-end animate-bounce text-[#00F2FE] z-40">
            <span className="text-[11px] font-black uppercase tracking-wider bg-[#00F2FE] text-black px-3 py-1 rounded-full shadow-[0_0_20px_rgba(0,242,254,0.8)] mb-1">
              {stepData.targetLabel}
            </span>
            <ArrowDown className="w-8 h-8 stroke-[3.5] drop-shadow-[0_0_15px_#00F2FE]" />
          </div>

          {/* Glowing box encircling Flash Market tab inside PillSwitcher */}
          <div className="fixed top-[236px] right-4 w-[48%] h-[52px] rounded-2xl border-2 border-[#00F2FE] shadow-[0_0_35px_rgba(0,242,254,0.9)] pointer-events-none z-30 animate-pulse bg-[#00F2FE]/15" />
        </div>
      )}

      {/* Step 5 Spotlight: Finish Celebration */}
      {stepData.pointerPos === 'center-finish' && (
        <div className="flex flex-col items-center justify-center pt-6 relative z-20 pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#00F2FE] to-[#CCFF00] flex items-center justify-center shadow-[0_0_40px_rgba(0,242,254,0.6)] animate-pulse">
            <Sparkles className="w-9 h-9 text-black stroke-[2.5]" />
          </div>
        </div>
      )}

      {/* DESCRIPTIVE TEXT: Frameless, directly on blurred background without frames, borders, or cards */}
      <div className="my-auto mx-auto w-full max-w-lg px-3 py-4 space-y-4 relative z-20 text-center sm:text-left">
        <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-wide drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] leading-tight">
          {stepData.title}
        </h2>
        
        <p className="text-sm sm:text-base text-gray-100 font-semibold leading-relaxed whitespace-pre-line drop-shadow-[0_3px_10px_rgba(0,0,0,0.95)] max-w-lg">
          {stepData.description}
        </p>

        {/* Step Indicator Dots & Tap hint */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            {ONBOARDING_STEPS.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  triggerHapticFeedback('light')
                  setCurrentStep(idx)
                }}
                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentStep
                    ? 'w-8 bg-gradient-to-r from-[#00F2FE] to-[#CCFF00] shadow-[0_0_12px_rgba(0,242,254,0.8)]'
                    : 'w-2.5 bg-white/30 hover:bg-white/60'
                }`}
                aria-label={`Перейти к шагу ${idx + 1}`}
              />
            ))}
          </div>

          {!isLastStep && (
            <span className="text-[11px] font-bold text-[#00F2FE] tracking-wide animate-pulse">
              Коснитесь экрана для продолжения →
            </span>
          )}
        </div>
      </div>

      {/* Step 3 Spotlight: Bottom Central Creation (+) Button */}
      {stepData.pointerPos === 'bottom-plus' && (
        <div className="relative z-30 w-full max-w-lg mx-auto pointer-events-none">
          <div className="fixed bottom-[100px] left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce text-[#CCFF00] z-40">
            <span className="text-[11px] font-black uppercase tracking-wider bg-[#CCFF00] text-black px-3 py-1 rounded-full shadow-[0_0_20px_rgba(204,255,0,0.8)] mb-1.5">
              {stepData.targetLabel}
            </span>
            <ArrowDown className="w-8 h-8 stroke-[3.5] drop-shadow-[0_0_15px_#CCFF00]" />
          </div>

          {/* Glowing ring encircling the central floating (+) button */}
          <div className="fixed bottom-[20px] left-1/2 -translate-x-1/2 w-[72px] h-[72px] rounded-full border-2 border-[#CCFF00] shadow-[0_0_35px_rgba(204,255,0,1)] pointer-events-none z-30 animate-pulse bg-[#CCFF00]/20" />
        </div>
      )}

      {/* Bottom Area: Show CTA ONLY on the final step so central (+) button is never overlapped on steps 1-4 */}
      {isLastStep ? (
        <div className="w-full max-w-lg mx-auto pb-4 px-1 relative z-20">
          <button
            type="button"
            onClick={handleNext}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#00F2FE] via-[#00DFEA] to-[#CCFF00] text-black font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_35px_rgba(0,242,254,0.6)] hover:brightness-110 active:scale-95 transition-all uppercase tracking-wider cursor-pointer"
          >
            <span>Начать пользование</span>
            <Check className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      ) : (
        <div className="pb-6" />
      )}
    </div>
  )
}
