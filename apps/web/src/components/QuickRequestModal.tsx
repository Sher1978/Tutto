import React, { useState, useEffect } from 'react'
import { Sparkles, Zap, MapPin, Calendar, FileText, CheckCircle2, Edit3, ArrowRight, X, Info } from 'lucide-react'
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xl animate-fadeIn">
      <div className="w-full max-w-[390px] bg-[#0A101D]/95 border border-cyan-500/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,242,254,0.3)] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-slate-900 to-cyan-950/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#00FF87]/20 border border-[#00FF87]/50 flex items-center justify-center text-[#00FF87]">
              <Zap className="w-4 h-4 fill-[#00FF87]" />
            </div>
            <div>
              <h3 className="font-display font-black text-sm text-white tracking-wide uppercase">
                {step === 'form' && '⚡ БЫСТРАЯ ЗАЯВКА'}
                {step === 'ai_processing' && '🧠 ИИ ОБРАБОТКА...'}
                {step === 'ai_preview' && '✨ ПРЕВЬЮ ЗАЯВКИ ИИ'}
              </h3>
              <p className="text-[10px] text-cyan-400 font-semibold">
                JTBD • Запуск аукциона за 1 минуту
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto no-scrollbar flex-1" style={{ fontFamily: "'Roboto', sans-serif" }}>
          {/* STEP 1: QUICK FORM & TUTORIAL */}
          {step === 'form' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Tutorial Onboarding Tip */}
              {showTutorial && (
                <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-gray-200 space-y-2 relative">
                  <button
                    onClick={() => setShowTutorial(false)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-white text-[10px]"
                  >
                    ✕
                  </button>
                  <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                    <Info className="w-4 h-4" />
                    <span>Как работает быстрая заявка TuttoMinutto:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-gray-300 font-normal">
                    <li>Проверьте локацию, дату и название услуги.</li>
                    <li>Нажмите <b>«Сгенерировать ИИ»</b> для расчета бюджета.</li>
                    <li>Опубликуйте заявку и получайте предложения исполнителей!</li>
                  </ol>
                </div>
              )}

              {/* Form Inputs */}
              <div className="space-y-3">
                {/* 1. Location */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#00FF87]" />
                    <span>Локация (Курорт & Район)</span>
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Например: BALI, Jimbaran"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/15 text-white font-medium text-xs focus:outline-none focus:border-[#00FF87] transition-all"
                  />
                </div>

                {/* 2. Date & Time */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#00F2FE]" />
                    <span>Дата и время</span>
                  </label>
                  <input
                    type="text"
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    placeholder="Например: Сегодня, в 18:00"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/15 text-white font-medium text-xs focus:outline-none focus:border-[#00F2FE] transition-all"
                  />
                </div>

                {/* 3. Service Title */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <span>Какая услуга вам нужна?</span>
                  </label>
                  <textarea
                    rows={2}
                    value={serviceTitle}
                    onChange={(e) => setServiceTitle(e.target.value)}
                    placeholder="Опишите услугу (например: AYANA Resort Ocean View Suite)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/15 text-white font-medium text-xs focus:outline-none focus:border-amber-400 transition-all resize-none"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <button
                onClick={handleStartAiProcessing}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#00C2A8] via-[#00FF87] to-[#00F2FE] text-[#03100A] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_25px_rgba(0,255,135,0.5)] hover:brightness-110 active:scale-[0.98] transition-all"
              >
                <Sparkles className="w-4 h-4 fill-[#03100A]" />
                <span>СГЕНЕРИРОВАТЬ ЗАЯВКУ ЧЕРЕЗ ИИ</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: AI PROCESSING ANIMATION */}
          {step === 'ai_processing' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-fadeIn">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-[#00FF87]/20 border-t-[#00FF87] animate-spin" />
                <Sparkles className="w-8 h-8 text-[#00F2FE] animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-base text-white">
                  ИИ обрабатывает параметры...
                </h4>
                <p className="text-xs text-gray-400 mt-1 max-w-[240px]">
                  Подбор оптимальной категории, рекомендуемого бюджета и тегов для аукциона
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: AI PREVIEW & EDITING */}
          {step === 'ai_preview' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-3 rounded-xl bg-[#00FF87]/10 border border-[#00FF87]/40 flex items-center gap-2 text-xs text-[#00FF87] font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>ИИ сформировал готовую карточку заявки! Проверьте и опубликуйте.</span>
              </div>

              {/* Editable Preview Card */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/15 space-y-3 shadow-inner">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Название заявки</label>
                  <input
                    type="text"
                    value={aiPreviewData.title}
                    onChange={(e) => setAiPreviewData({ ...aiPreviewData, title: e.target.value })}
                    className="w-full mt-0.5 px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white font-bold text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Категория</label>
                    <input
                      type="text"
                      value={aiPreviewData.categoryName}
                      onChange={(e) => setAiPreviewData({ ...aiPreviewData, categoryName: e.target.value })}
                      className="w-full mt-0.5 px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white font-semibold text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Бюджет ($ USD)</label>
                    <input
                      type="number"
                      value={aiPreviewData.budget}
                      onChange={(e) => setAiPreviewData({ ...aiPreviewData, budget: Number(e.target.value) })}
                      className="w-full mt-0.5 px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-[#00FF87] font-black text-xs focus:outline-none focus:border-[#00FF87]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Район / Локация</label>
                  <input
                    type="text"
                    value={aiPreviewData.district}
                    onChange={(e) => setAiPreviewData({ ...aiPreviewData, district: e.target.value })}
                    className="w-full mt-0.5 px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white font-semibold text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Описание для исполнителей</label>
                  <textarea
                    rows={2}
                    value={aiPreviewData.description}
                    onChange={(e) => setAiPreviewData({ ...aiPreviewData, description: e.target.value })}
                    className="w-full mt-0.5 px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-gray-200 font-medium text-xs focus:outline-none focus:border-cyan-400 resize-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setStep('form')}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-gray-300 font-bold text-xs hover:bg-slate-700 transition-colors flex items-center justify-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Назад</span>
                </button>
                <button
                  onClick={handlePublishAuction}
                  className="flex-[2] py-2.5 rounded-xl bg-gradient-to-r from-[#00FF87] to-[#00F2FE] text-[#03100A] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_20px_rgba(0,255,135,0.4)] hover:brightness-110 active:scale-[0.98] transition-all"
                >
                  <Zap className="w-4 h-4 fill-[#03100A]" />
                  <span>ОПУБЛИКОВАТЬ НА АУКЦИОН</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
