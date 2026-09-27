import React, { useState } from 'react'
import { Sparkles, ArrowUp, ArrowDown, X, ChevronRight, ChevronLeft, Check, Compass } from 'lucide-react'
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
    targetLabel: 'Переключатель Режимов (Аукцион / Маркет)',
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
    targetLabel: 'Кнопка Размещения Лота',
  },
  {
    step: 5,
    title: '5. Легких и выгодаых сделок!',
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

  const handlePrev = () => {
    triggerHapticFeedback('light')
    if (currentStep > 0) setCurrentStep((prev) => prev - 1)
  }

  const handleSkip = () => {
    triggerHapticFeedback('medium')
    localStorage.setItem('needtnow_onboarding_completed', 'true')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col justify-between p-5 bg-black/65 backdrop-blur-[6px] animate-fadeIn select-none">
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

      {/* Dynamic Visual Pointer Arrow pointing directly at target UI element */}
      {stepData.pointerPos === 'top-mode' && (
        <div className="flex flex-col items-center pt-10 animate-bounce text-[#00F2FE] relative z-20">
          <ArrowUp className="w-9 h-9 stroke-[3.5] drop-shadow-[0_0_15px_#00F2FE]" />
          <span className="text-[11px] font-black uppercase tracking-wider bg-[#00F2FE] text-black px-3 py-1 rounded-full shadow-[0_0_20px_rgba(0,242,254,0.6)]">
            {stepData.targetLabel}
          </span>
        </div>
      )}

      {stepData.pointerPos === 'top-location' && (
        <div className="flex flex-col items-start pl-4 pt-16 animate-bounce text-[#CCFF00] relative z-20">
          <ArrowUp className="w-9 h-9 stroke-[3.5] drop-shadow-[0_0_15px_#CCFF00]" />
          <span className="text-[11px] font-black uppercase tracking-wider bg-[#CCFF00] text-black px-3 py-1 rounded-full shadow-[0_0_20px_rgba(204,255,0,0.6)]">
            {stepData.targetLabel}
          </span>
        </div>
      )}

      {stepData.pointerPos === 'top-market' && (
        <div className="flex flex-col items-end pr-6 pt-20 animate-bounce text-[#00F2FE] relative z-20">
          <ArrowUp className="w-9 h-9 stroke-[3.5] drop-shadow-[0_0_15px_#00F2FE]" />
          <span className="text-[11px] font-black uppercase tracking-wider bg-[#00F2FE] text-black px-3 py-1 rounded-full shadow-[0_0_20px_rgba(0,242,254,0.6)]">
            {stepData.targetLabel}
          </span>
        </div>
      )}

      {stepData.pointerPos === 'center-finish' && (
        <div className="flex flex-col items-center justify-center pt-6 relative z-20">
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

        {/* Step Indicator Dots */}
        <div className="flex items-center justify-center sm:justify-start gap-2 pt-2">
          {ONBOARDING_STEPS.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
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
      </div>

      {/* Pointer arrow for bottom central creation (+) button */}
      {stepData.pointerPos === 'bottom-plus' && (
        <div className="flex flex-col items-center pb-20 animate-bounce text-[#CCFF00] relative z-20">
          <span className="text-[11px] font-black uppercase tracking-wider bg-[#CCFF00] text-black px-3 py-1 rounded-full shadow-[0_0_20px_rgba(204,255,0,0.6)] mb-1.5">
            {stepData.targetLabel}
          </span>
          <ArrowDown className="w-9 h-9 stroke-[3.5] drop-shadow-[0_0_15px_#CCFF00]" />
        </div>
      )}

      {/* Bottom Action Controls Bar: Sleek frameless buttons directly on blurred backdrop */}
      <div className="flex items-center justify-between w-full max-w-lg mx-auto pb-4 px-1 relative z-20 gap-3">
        {currentStep > 0 ? (
          <button
            type="button"
            onClick={handlePrev}
            className="px-4 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer border border-white/20 backdrop-blur-md active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Назад</span>
          </button>
        ) : <div />}

        <button
          type="button"
          onClick={handleNext}
          className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-[#00F2FE] via-[#00DFEA] to-[#CCFF00] text-black font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_35px_rgba(0,242,254,0.6)] hover:brightness-110 active:scale-95 transition-all uppercase tracking-wider cursor-pointer"
        >
          <span>{isLastStep ? 'Начать пользование' : 'Далее'}</span>
          {isLastStep ? <Check className="w-4 h-4 stroke-[3]" /> : <ChevronRight className="w-4 h-4 stroke-[3]" />}
        </button>
      </div>
    </div>
  )
}
