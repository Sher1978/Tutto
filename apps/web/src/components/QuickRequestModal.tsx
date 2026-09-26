import React, { useState, useEffect } from 'react'
import { Sparkles, Zap, MapPin, Calendar, FileText, CheckCircle2, Edit3, ArrowRight, X, Info, Target, Navigation } from 'lucide-react'
import { RequestItem, HubId } from '../types'
import { HUBS } from '../data/mockData'
import { triggerHapticFeedback, triggerNotificationFeedback } from '../lib/telegram'
import { detectUserLocation } from '../lib/geo'

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
  
  // Quick Form State
  const [hubName, setHubName] = useState(initialHub)
  const [districtName, setDistrictName] = useState(initialDistrict)
  const [location, setLocation] = useState('')
  const [dateTime, setDateTime] = useState('Сегодня, в ближайшее время')
  const [serviceTitle, setServiceTitle] = useState('')
  const [serviceDescription, setServiceDescription] = useState('')
  const [showTutorial, setShowTutorial] = useState(true)
  const [isDetectingGeo, setIsDetectingGeo] = useState(false)
  const [geoStatusMsg, setGeoStatusMsg] = useState('')

  // Generated AI Preview State
  const [aiPreviewData, setAiPreviewData] = useState({
    title: '',
    hub: 'BALI',
    district: 'Jimbaran',
    categoryName: 'Услуги',
    budget: 250,
    description: '',
  })

  useEffect(() => {
    if (isOpen) {
      setStep('form')
      const hubUpper = (initialHub || 'BALI').toUpperCase()
      const dName = initialDistrict || (
        hubUpper === 'PHUKET' ? 'Patong' :
        hubUpper === 'BANGKOK' ? 'Thonglor' :
        hubUpper === 'SEOUL' ? 'Gangnam' :
        hubUpper === 'TOKYO' ? 'Shibuya' : 'Canggu'
      )

      setHubName(hubUpper)
      setDistrictName(dName)
      setLocation(`${hubUpper}, ${dName}`)
      setServiceTitle(initialServiceTitle || 'Аренда байка / услуги')
      setServiceDescription(`Быстрый заказ на "${initialServiceTitle || 'Услугу'}": нужная услуга, утреннее/вечернее время, место доставки ${dName}.`)
    }
  }, [isOpen, initialHub, initialServiceTitle, initialDistrict])

  if (!isOpen) return null

  // GPS Geolocation auto-detection
  const handleGPSDetect = async () => {
    triggerHapticFeedback('medium')
    setIsDetectingGeo(true)
    setGeoStatusMsg('Определение GPS координаты...')
    try {
      const res = await detectUserLocation()
      setHubName(res.hubNameRu.toUpperCase())
      setDistrictName(res.district)
      setLocation(`${res.hubNameRu.toUpperCase()}, ${res.district}`)
      setGeoStatusMsg(`📍 Найдено: ${res.hubNameRu} (${res.district}), ~${res.distanceKm} км`)
      triggerHapticFeedback('heavy')
    } catch (err: any) {
      setGeoStatusMsg(`⚠️ ${err.message || 'GPS не доступен'}`)
      triggerNotificationFeedback('error')
    } finally {
      setIsDetectingGeo(false)
    }
  }

  const handleStartAiProcessing = () => {
    triggerHapticFeedback('medium')
    setStep('ai_processing')

    const isCustom = serviceTitle.toLowerCase().includes('другое') || serviceTitle.toLowerCase().includes('свой')

    setTimeout(() => {
      setAiPreviewData({
        title: serviceTitle || 'Заявка на услугу',
        hub: hubName || 'BALI',
        district: districtName || 'Canggu',
        categoryName: isCustom
          ? 'Другое'
          : serviceTitle.toLowerCase().includes('байк') || serviceTitle.toLowerCase().includes('авто')
          ? 'Прокат'
          : serviceTitle.toLowerCase().includes('тур')
          ? 'Туры'
          : 'Услуги',
        budget: serviceTitle.toLowerCase().includes('байк') ? 15 : isCustom ? 100 : 250,
        description: serviceDescription || `ИИ Заявка: Заказ для "${serviceTitle}" в районе ${districtName}. Время: ${dateTime}. Нужны варианты от проверенных исполнителей!`,
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
              {step === 'form' && '⚡ БЫСТРАЯ ЗАЯВКА'}
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

      {/* Content Body */}
      <div className="p-6 space-y-6 overflow-y-auto no-scrollbar flex-1 max-w-2xl mx-auto w-full" style={{ fontFamily: "'Roboto', sans-serif" }}>
        
        {/* FRIENDLY INTRO CARD */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/50 via-slate-900/80 to-emerald-950/40 border border-cyan-500/40 shadow-[0_8px_30px_rgba(0,0,0,0.4)] space-y-2.5">
          <div className="flex items-center gap-2 text-[#00FF87] font-bold text-[15px]">
            <Target className="w-5 h-5 text-[#00FF87]" />
            <span>Как это работает и почему это удобно:</span>
          </div>
          <p className="text-[13px] text-gray-200 leading-relaxed font-normal">
            <strong className="text-white font-semibold">Ваша заявка — ваши правила:</strong> Опишите, что вам нужно и укажите желаемую цену (или «Жду предложений»).
          </p>
          <p className="text-[13px] text-gray-300 leading-relaxed font-normal">
            <strong className="text-[#00F2FE] font-semibold">Без лишней суеты:</strong> Проверенные исполнители и ИИ-менеджеры пришлют вам лучшие предложения за 1 минуту. Вам останется только выбрать подходящее!
          </p>
        </div>

        {/* STEP 1: QUICK FORM & TUTORIAL */}
        {step === 'form' && (
          <div className="space-y-6 animate-fadeIn">
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
                  <li>Уточните ваш курорт и район доставки (или используйте GPS).</li>
                  <li>Проверьте описание услуги или заполните своё.</li>
                  <li>Нажмите <b>«Сгенерировать через ИИ»</b> для запуска аукциона!</li>
                </ol>
              </div>
            )}

            <div className="space-y-4">
              {/* 1. Geo-Matrix Location + GPS button */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[13px] font-bold text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#00FF87]" />
                    <span>Локация (Курорт & Район)</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGPSDetect}
                    disabled={isDetectingGeo}
                    className="text-[11px] font-bold text-[#00FF87] bg-[#00FF87]/15 px-2.5 py-1 rounded-lg border border-[#00FF87]/40 flex items-center gap-1 hover:bg-[#00FF87]/25"
                  >
                    <Navigation className={`w-3 h-3 ${isDetectingGeo ? 'animate-spin' : ''}`} />
                    <span>GPS Найти</span>
                  </button>
                </div>

                {geoStatusMsg && (
                  <p className="text-[11px] text-cyan-300 font-medium">{geoStatusMsg}</p>
                )}

                <div className="grid grid-cols-2 gap-3 mt-1">
                  <div>
                    <select
                      value={hubName.toLowerCase()}
                      onChange={(e) => {
                        const newH = e.target.value as HubId
                        setHubName(newH.toUpperCase())
                        const hd = HUBS.find((h) => h.id === newH)
                        if (hd) {
                          setDistrictName(hd.districts[0] || 'Center')
                          setLocation(`${newH.toUpperCase()}, ${hd.districts[0] || 'Center'}`)
                        }
                      }}
                      className="w-full px-3 py-3 rounded-2xl bg-slate-900/90 border border-white/20 text-white font-semibold text-[14px] focus:outline-none focus:border-[#00FF87] transition-all shadow-inner appearance-none"
                    >
                      {HUBS.map((h) => (
                        <option key={h.id} value={h.id}>
                          {h.flag} {h.nameRu}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <select
                      value={districtName}
                      onChange={(e) => {
                        setDistrictName(e.target.value)
                        setLocation(`${hubName}, ${e.target.value}`)
                      }}
                      className="w-full px-3 py-3 rounded-2xl bg-slate-900/90 border border-white/20 text-white font-semibold text-[14px] focus:outline-none focus:border-[#00FF87] transition-all shadow-inner appearance-none"
                    >
                      {(HUBS.find((h) => h.id.toLowerCase() === hubName.toLowerCase()) || HUBS[0]).districts.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
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
                  <span>Название и требования к услуге</span>
                </label>
                <input
                  type="text"
                  value={serviceTitle}
                  onChange={(e) => setServiceTitle(e.target.value)}
                  placeholder="Опишите услугу (например: Нужен NMAX 155 на 7 дней в Чангу)"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-900/90 border border-white/20 text-white font-semibold text-[14px] focus:outline-none focus:border-amber-400 transition-all shadow-inner mb-2"
                />
                <textarea
                  rows={3}
                  value={serviceDescription}
                  onChange={(e) => setServiceDescription(e.target.value)}
                  placeholder="Дополнительные детали: время доставки, пожелания, отсутствие залога..."
                  className="w-full px-4 py-3 rounded-2xl bg-slate-900/90 border border-white/20 text-white font-normal text-[13px] focus:outline-none focus:border-amber-400 transition-all resize-none shadow-inner"
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
            <div className="p-5 rounded-3xl bg-slate-900 border border-white/20 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-[12px] font-extrabold text-[#00FF87] uppercase tracking-wider">
                  {aiPreviewData.categoryName}
                </span>
                <span className="text-[12px] text-gray-400 font-semibold">
                  📍 {aiPreviewData.hub}, {aiPreviewData.district}
                </span>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase">Название карточки</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={aiPreviewData.title}
                    onChange={(e) => setAiPreviewData({ ...aiPreviewData, title: e.target.value })}
                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-white font-bold text-[14px] focus:outline-none focus:border-[#00FF87]"
                  />
                  <Edit3 className="w-4 h-4 text-gray-400 shrink-0" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase">Рекомендуемый бюджет (USD)</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="number"
                    value={aiPreviewData.budget}
                    onChange={(e) => setAiPreviewData({ ...aiPreviewData, budget: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-[#00FF87] font-black text-lg focus:outline-none focus:border-[#00FF87]"
                  />
                  <span className="text-gray-400 font-bold text-xs">$</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase">Текст заявки для аукциона</label>
                <textarea
                  rows={3}
                  value={aiPreviewData.description}
                  onChange={(e) => setAiPreviewData({ ...aiPreviewData, description: e.target.value })}
                  className="w-full mt-1 bg-slate-800 border border-white/10 rounded-xl p-3 text-white text-[13px] leading-relaxed focus:outline-none focus:border-[#00FF87] resize-none"
                />
              </div>
            </div>

            <button
              onClick={handlePublishAuction}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#00C2A8] via-[#00FF87] to-[#00F2FE] text-[#03100A] font-black text-[15px] uppercase tracking-wider flex items-center justify-center gap-2.5 cursor-pointer shadow-[0_0_35px_rgba(0,255,135,0.6)] hover:brightness-110 active:scale-[0.98] transition-all"
            >
              <Zap className="w-5 h-5 fill-[#03100A]" />
              <span>ОПУБЛИКОВАТЬ ЗАЯВКУ В АУКЦИОН</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
