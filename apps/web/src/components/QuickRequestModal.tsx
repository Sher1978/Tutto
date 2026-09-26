import React, { useState, useEffect } from 'react'
import { Sparkles, Zap, MapPin, Calendar, FileText, CheckCircle2, Edit3, ArrowRight, X, Info, Target, HelpCircle } from 'lucide-react'
import { RequestItem } from '../types'
import { triggerHapticFeedback } from '../lib/telegram'

interface QuickRequestModalProps {
  isOpen: boolean
  onClose: () => void
  initialHub?: string
  initialServiceTitle?: string
  initialDistrict?: string
  onCreateRequest: (newReq: Partial<RequestItem>) => void
}

type FlowStep = 'form' | 'ai_processing' | 'ai_preview'

export const QuickRequestModal: React.FC<QuickRequestModalProps> = ({
  isOpen,
  onClose,
  initialHub = 'BALI',
  initialServiceTitle = '',
  initialDistrict = 'Jimbaran',
  onCreateRequest,
}) => {
  const [step, setStep] = useState<FlowStep>('form')
  
  // Quick Form State (pre-filled if provided)
  const [location, setLocation] = useState('')
  const [dateTime, setDateTime] = useState('Сегодня, в ближайшее время')
  const [serviceTitle, setServiceTitle] = useState('')
  const [showTutorial, setShowTutorial] = useState(true)

  // Generated AI Preview State
  const [aiPreviewData, setAiPreviewData] = useState({
    title: '',
    hub: 'BALI',
    district: 'Jimbaran',
    categoryName: 'Жильё & Виллы',
    budget: 350,
    description: '',
  })

  useEffect(() => {
    if (isOpen) {
      setStep('form')
      const hubUpper = (initialHub || 'BALI').toUpperCase()
      const districtName =
        hubUpper === 'PHUKET' ? 'Patong' :
        hubUpper === 'BANGKOK' ? 'Thonglor' :
        hubUpper === 'SEOUL' ? 'Gangnam' :
        hubUpper === 'TOKYO' ? 'Shibuya' : 'Jimbaran'

      setLocation(`${hubUpper}, ${initialDistrict || districtName}`)
      setServiceTitle(initialServiceTitle || 'Аренда виллы / услуги')
    }
  }, [isOpen, initialHub, initialServiceTitle, initialDistrict])

  if (!isOpen) return null

  const handleStartAiProcessing = () => {
    triggerHapticFeedback('medium')
    setStep('ai_processing')

    // Simulate AI optimization & budget generation
    setTimeout(() => {
      setAiPreviewData({
        title: serviceTitle || 'Заявка на услугу',
        hub: initialHub || 'BALI',
        district: location.split(',')[1]?.trim() || initialDistrict || 'Jimbaran',
        categoryName: serviceTitle.toLowerCase().includes('байк') || serviceTitle.toLowerCase().includes('авто')
          ? 'Транспорт'
          : serviceTitle.toLowerCase().includes('тур')
          ? 'Туры'
          : 'Жильё & Виллы',
        budget: serviceTitle.toLowerCase().includes('байк') ? 15 : 320,
        description: `ИИ Заявка: Заказ для "${serviceTitle}" в локации ${location}. Время: ${dateTime}. Нужны лучшие предложения от проверенных исполнителей!`,
      })
      triggerHapticFeedback('heavy')
      setStep('ai_preview')
    }, 1200)
  }

  const handlePublishAuction = () => {
    triggerHapticFeedback('heavy')
    onCreateRequest({
      title: aiPreviewData.title,
      hub: aiPreviewData.hub as any,
      district: aiPreviewData.district,
      categoryL1Name: aiPreviewData.categoryName,
      budget: aiPreviewData.budget,
      description: aiPreviewData.description,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0A101D] text-white flex flex-col w-full h-full min-h-screen overflow-hidden animate-fadeIn">
      {/* Header — Fullscreen Top Bar */}
      <div className="px-6 py-5 border-b border-white/15 flex items-center justify-between bg-gradient-to-r from-slate-950 via-[#0A101D] to-cyan-950/60 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#00FF87]/20 border border-[#00FF87]/60 flex items-center justify-center text-[#00FF87] shadow-[0_0_15px_rgba(0,255,135,0.4)]">
            <Zap className="w-5 h-5 fill-[#00FF87]" />
          </div>
          <div>
            <h3 className="font-display font-black text-base sm:text-lg text-white tracking-wide uppercase">
              {step === 'form' && '⚡ БЫСТРАЯ ЗАЯВКА КЛИЕНТА'}
              {step === 'ai_processing' && '🧠 ИИ ОБРАБОТКА И ОПТИМИЗАЦИЯ...'}
              {step === 'ai_preview' && '✨ ПРЕВЬЮ ЗАЯВКИ ИИ'}
            </h3>
            <p className="text-[12px] text-cyan-400 font-semibold" style={{ fontFamily: "'Roboto', sans-serif" }}>
              Обратный аукцион • Запуск за 1 минуту
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2.5 rounded-full text-gray-300 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Content Body — Fullscreen Scrollable */}
      <div className="p-6 space-y-6 overflow-y-auto no-scrollbar flex-1 max-w-2xl mx-auto w-full" style={{ fontFamily: "'Roboto', sans-serif" }}>
        
        {/* EXPLANATORY INTRO CARD: WHAT AND WHY THE CLIENT IS DOING HERE */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/50 via-slate-900/80 to-emerald-950/40 border border-cyan-500/40 shadow-[0_8px_30px_rgba(0,0,0,0.4)] space-y-2.5">
          <div className="flex items-center gap-2 text-[#00FF87] font-bold text-[15px]">
            <Target className="w-5 h-5 text-[#00FF87]" />
            <span>Что и зачем делает клиент на этой странице:</span>
          </div>
          <p className="text-[13px] text-gray-200 leading-relaxed font-normal">
            <strong className="text-white font-semibold">Что вы делаете:</strong> Вы создаёте мгновенный запрос на необходимую вам услугу или товар в вашем курортном районе.
          </p>
          <p className="text-[13px] text-gray-300 leading-relaxed font-normal">
            <strong className="text-[#00F2FE] font-semibold">Зачем это нужно:</strong> Вам больше не нужно самостоятельно искать контакты, писать в десятки чатов и сравнивать цены. В режиме обратного аукциона проверенные исполнители и ИИ-менеджеры сами предлагают вам лучшие цены и условия за 1 минуту!
          </p>
        </div>

        {/* STEP 1: QUICK FORM & TUTORIAL */}
        {step === 'form' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Tutorial Onboarding Tip */}
            {showTutorial && (
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/20 text-[13px] text-gray-200 space-y-2.5 relative shadow-lg">
                <button
                  onClick={() => setShowTutorial(false)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-white text-[12px] font-bold"
                >
                  ✕
                </button>
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-[14px]">
                  <Info className="w-4 h-4" />
                  <span>3 простых шага для запуска:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-[13px] text-gray-300 font-normal">
                  <li>Уточните ваш курорт и район доставки.</li>
                  <li>Опишите услугу или выберите из шаблона.</li>
                  <li>Нажмите <b>«Сгенерировать через ИИ»</b> для запуска аукциона!</li>
                </ol>
              </div>
            )}

            {/* Form Inputs with +2pt Font Size */}
            <div className="space-y-4">
              {/* 1. Location */}
              <div>
                <label className="block text-[13px] font-bold text-gray-200 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#00FF87]" />
                  <span>Локация (Курорт & Район)</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Например: PHUKET, Patong"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-900/90 border border-white/20 text-white font-semibold text-[14px] focus:outline-none focus:border-[#00FF87] transition-all shadow-inner"
                />
              </div>

              {/* 2. Date & Time */}
              <div>
                <label className="block text-[13px] font-bold text-gray-200 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#00F2FE]" />
                  <span>Дата и время</span>
                </label>
                <input
                  type="text"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  placeholder="Например: Сегодня, в 18:00"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-900/90 border border-white/20 text-white font-semibold text-[14px] focus:outline-none focus:border-[#00F2FE] transition-all shadow-inner"
                />
              </div>

              {/* 3. Service Title */}
              <div>
                <label className="block text-[13px] font-bold text-gray-200 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>Какая услуга вам нужна?</span>
                </label>
                <textarea
                  rows={3}
                  value={serviceTitle}
                  onChange={(e) => setServiceTitle(e.target.value)}
                  placeholder="Опишите услугу (например: Нужен Honda PCX на 5 дней с доставкой)"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-900/90 border border-white/20 text-white font-semibold text-[14px] focus:outline-none focus:border-amber-400 transition-all resize-none shadow-inner"
                />
              </div>
            </div>

            {/* Submit CTA */}
            <button
              onClick={handleStartAiProcessing}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#00C2A8] via-[#00FF87] to-[#00F2FE] text-[#03100A] font-black text-[14px] uppercase tracking-wider flex items-center justify-center gap-2.5 cursor-pointer shadow-[0_0_30px_rgba(0,255,135,0.5)] hover:brightness-110 active:scale-[0.98] transition-all"
            >
              <Sparkles className="w-5 h-5 fill-[#03100A]" />
              <span>СГЕНЕРИРОВАТЬ ЗАЯВКУ ЧЕРЕЗ ИИ</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* STEP 2: AI PROCESSING ANIMATION */}
        {step === 'ai_processing' && (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-5 animate-fadeIn">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-[#00FF87]/20 border-t-[#00FF87] animate-spin" />
              <Sparkles className="w-10 h-10 text-[#00F2FE] animate-pulse" />
            </div>
            <div>
              <h4 className="font-bold text-lg text-white">
                ИИ обрабатывает параметры заявки...
              </h4>
              <p className="text-[14px] text-gray-300 mt-1 max-w-sm">
                Подбор оптимальной категории, расчет рекомендуемого бюджета и тегов для аукциона
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: AI PREVIEW & EDITING */}
        {step === 'ai_preview' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="p-4 rounded-2xl bg-[#00FF87]/15 border border-[#00FF87]/50 flex items-center gap-2.5 text-[14px] text-[#00FF87] font-bold">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>ИИ сформировал готовую карточку заявки! Проверьте и опубликуйте.</span>
            </div>

            {/* Editable Preview Card */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-white/20 space-y-4 shadow-inner">
              <div>
                <label className="text-[12px] font-bold text-gray-300 uppercase tracking-wider">Название заявки</label>
                <input
                  type="text"
                  value={aiPreviewData.title}
                  onChange={(e) => setAiPreviewData({ ...aiPreviewData, title: e.target.value })}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white font-bold text-[14px] focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] font-bold text-gray-300 uppercase tracking-wider">Категория</label>
                  <input
                    type="text"
                    value={aiPreviewData.categoryName}
                    onChange={(e) => setAiPreviewData({ ...aiPreviewData, categoryName: e.target.value })}
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white font-semibold text-[14px] focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-bold text-gray-300 uppercase tracking-wider">Бюджет ($ USD)</label>
                  <input
                    type="number"
                    value={aiPreviewData.budget}
                    onChange={(e) => setAiPreviewData({ ...aiPreviewData, budget: Number(e.target.value) })}
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-[#00FF87] font-black text-[14px] focus:outline-none focus:border-[#00FF87]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[12px] font-bold text-gray-300 uppercase tracking-wider">Район / Локация</label>
                <input
                  type="text"
                  value={aiPreviewData.district}
                  onChange={(e) => setAiPreviewData({ ...aiPreviewData, district: e.target.value })}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white font-semibold text-[14px] focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-[12px] font-bold text-gray-300 uppercase tracking-wider">Описание для исполнителей</label>
                <textarea
                  rows={3}
                  value={aiPreviewData.description}
                  onChange={(e) => setAiPreviewData({ ...aiPreviewData, description: e.target.value })}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-gray-200 font-medium text-[14px] focus:outline-none focus:border-cyan-400 resize-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setStep('form')}
                className="flex-1 py-3.5 rounded-xl bg-slate-800 text-gray-200 font-bold text-[14px] hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                <span>Назад</span>
              </button>
              <button
                onClick={handlePublishAuction}
                className="flex-[2] py-3.5 rounded-xl bg-gradient-to-r from-[#00FF87] to-[#00F2FE] text-[#03100A] font-black text-[14px] uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_25px_rgba(0,255,135,0.4)] hover:brightness-110 active:scale-[0.98] transition-all"
              >
                <Zap className="w-5 h-5 fill-[#03100A]" />
                <span>ОПУБЛИКОВАТЬ НА АУКЦИОН</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
