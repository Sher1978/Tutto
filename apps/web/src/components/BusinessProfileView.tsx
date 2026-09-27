import React, { useState } from 'react'
import { Shield, Sparkles, Bot, Check, ExternalLink, Copy, Star, Edit3, Zap } from 'lucide-react'
import { MOCK_BUSINESS_CARDS } from '../data/mockData'
import { getTelegramUser, triggerHapticFeedback, triggerNotificationFeedback } from '../lib/telegram'

interface BusinessProfileViewProps {
  onOpenAdmin?: () => void
}

export const BusinessProfileView: React.FC<BusinessProfileViewProps> = ({ onOpenAdmin }) => {
  const user = getTelegramUser()
  const bizCard = MOCK_BUSINESS_CARDS[0]
  const [aiEnabled, setAiEnabled] = useState(bizCard.isAiEnabled)
  const [copiedRef, setCopiedRef] = useState(false)
  
  // New RAG Knowledge Base and Min Budget state
  const [knowledgeBaseText, setKnowledgeBaseText] = useState(
    'Прайс: Тойота Фортунер — 1500 THB/сут. Хонда Клик — 300 THB/сут. Залог: Паспорт или 200$. Бесплатная доставка по Раваи и Найхарну при аренде от 7 дней. Страховка включена.'
  )
  const [minBudget, setMinBudget] = useState(25)
  const [isSaved, setIsSaved] = useState(false)

  const handleToggleAi = () => {
    setAiEnabled(!aiEnabled)
    triggerHapticFeedback('medium')
    triggerNotificationFeedback('success')
  }

  const handleSaveAiSettings = () => {
    setIsSaved(true)
    triggerHapticFeedback('heavy')
    triggerNotificationFeedback('success')
    setTimeout(() => setIsSaved(false), 2500)
  }

  const handleCopyRef = () => {
    navigator.clipboard.writeText(`https://t.me/tuttominutto_bot?start=ref_phuket999`)
    setCopiedRef(true)
    triggerHapticFeedback('light')
    setTimeout(() => setCopiedRef(false), 2000)
  }

  return (
    <div className="space-y-5 pb-20 animate-fadeIn text-xs">
      {/* AI Sales Agent Status Card */}
      <div className="glass-card p-5 relative overflow-hidden border-purple-500/30">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-cyan-400 p-0.5 shadow-lg shadow-purple-500/30">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Bot className="w-6 h-6 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-extrabold text-base text-white">AI Sales Agent</h3>
                <span className="badge-ai px-2 py-0.5 rounded-full text-[10px] font-bold">24/7 Autopilot</span>
              </div>
              <p className="text-gray-400 text-xs mt-0.5">
                Авто-отклики на новые целевые заказы за 3-5 секунд
              </p>
            </div>
          </div>

          <button
            onClick={handleToggleAi}
            className={`w-12 h-7 rounded-full p-1 transition-colors flex items-center ${
              aiEnabled ? 'bg-cyan-400 justify-end' : 'bg-white/10 justify-start'
            }`}
          >
            <div className={`w-5 h-5 rounded-full shadow-md ${aiEnabled ? 'bg-black' : 'bg-gray-400'}`} />
          </button>
        </div>

        {/* AI Stats Row */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/10 text-center">
          <div className="bg-white/5 p-2 rounded-xl">
            <div className="text-cyan-400 font-extrabold text-sm">3.4 сек</div>
            <div className="text-[10px] text-gray-400">Ср. скорость отклика</div>
          </div>
          <div className="bg-white/5 p-2 rounded-xl">
            <div className="text-purple-400 font-extrabold text-sm">84%</div>
            <div className="text-[10px] text-gray-400">Конверсия в чат</div>
          </div>
          <div className="bg-white/5 p-2 rounded-xl">
            <div className="text-amber-400 font-extrabold text-sm">142</div>
            <div className="text-[10px] text-gray-400">Сделок проведено</div>
          </div>
        </div>
      </div>

      {/* AI Knowledge Base (RAG) & Auto-Bid Settings */}
      <div className="glass-card p-5 border-cyan-500/30 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <div>
              <h4 className="font-display font-bold text-sm text-white">База знаний ИИ-продавца (RAG)</h4>
              <p className="text-[11px] text-gray-400">ИИ консультирует клиентов строго по вашим правилам</p>
            </div>
          </div>
        </div>

        {/* Text Area for RAG Prompt */}
        <div>
          <label className="block text-gray-300 font-medium text-xs mb-1">
            Инструкции и Прайс-лист для ИИ:
          </label>
          <textarea
            value={knowledgeBaseText}
            onChange={(e) => setKnowledgeBaseText(e.target.value)}
            rows={4}
            placeholder="Введите ваши цены, условия аренды, районы доставки, правила залога..."
            className="w-full bg-slate-950/80 border border-white/15 rounded-xl p-3 text-gray-200 text-xs focus:border-cyan-400 focus:outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Min Budget Threshold Slider */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-gray-300 font-medium text-xs flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Минимальный бюджет заказа для авто-отклика:</span>
            </label>
            <span className="font-extrabold text-cyan-400 text-sm bg-cyan-950/60 px-2 py-0.5 rounded-lg border border-cyan-500/30">
              ${minBudget} USD
            </span>
          </div>
          <input
            type="range"
            min="5"
            max="300"
            step="5"
            value={minBudget}
            onChange={(e) => setMinBudget(Number(e.target.value))}
            className="w-full accent-cyan-400 bg-white/10 rounded-lg h-2 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-gray-400 mt-1">
            <span>$5 (все подряд)</span>
            <span>$150 (средние)</span>
            <span>$300 (только крупные)</span>
          </div>
        </div>

        {/* Save Settings Button */}
        <button
          onClick={handleSaveAiSettings}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all"
        >
          {isSaved ? (
            <>
              <Check className="w-4 h-4 text-black" />
              <span>Настройки ИИ успешно сохранены!</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-black" />
              <span>Сохранить настройки ИИ-менеджера</span>
            </>
          )}
        </button>
      </div>

      {/* Business Card Preview */}
      <div className="glass-card p-4 border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <h4 className="font-display font-bold text-sm text-white">Моя Бизнес-карточка</h4>
          </div>
          <button className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 font-medium text-xs flex items-center gap-1">
            <Edit3 className="w-3 h-3 text-cyan-400" />
            Редактировать
          </button>
        </div>

        {/* Card Cover & Info */}
        <div className="relative rounded-xl overflow-hidden h-28 mb-3">
          <img
            src={bizCard.coverPhotoUrl}
            alt={bizCard.companyName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          <div className="absolute bottom-2 left-3 flex items-center gap-2">
            <img
              src={bizCard.logoUrl}
              alt={bizCard.companyName}
              className="w-10 h-10 rounded-xl border border-white/30 object-cover"
            />
            <div>
              <div className="font-bold text-white text-sm flex items-center gap-1">
                {bizCard.companyName}
                <span className="badge-pro text-[9px] px-1.5 py-0.2 rounded font-extrabold">PRO</span>
              </div>
              <div className="text-[11px] text-gray-300 flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span className="font-bold text-amber-400">{bizCard.rating}</span>
                <span>({bizCard.dealsCount} отзывов)</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-gray-300 mb-3 leading-relaxed">{bizCard.description}</p>

        {/* Advantages */}
        <div className="space-y-1.5 mb-3">
          {bizCard.advantages.map((adv, idx) => (
            <div key={idx} className="flex items-center gap-1.5 text-gray-300">
              <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>{adv}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Verified Customer Reviews & Ratings Section */}
      <div className="glass-card p-5 border-amber-400/30 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <div>
              <h4 className="font-display font-bold text-sm text-white flex items-center gap-2">
                <span>Отзывы клиентов</span>
                <span className="text-xs bg-amber-400/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-400/40">4.98 ★ (48)</span>
              </h4>
              <p className="text-[11px] text-gray-400">Подтвержденные P2P-сделки с гарантией отзивов</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {[
            {
              id: 'rev-1',
              authorName: 'Михаил К.',
              authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
              rating: 5,
              tags: ['⚡ Быстрый выезд', '💎 Идеальное состояние'],
              comment: 'Арендовали байк NMAX на 10 дней. Привезли прямо в отель, шлемы новые. Сервис супер!',
              createdAt: 'Вчера, 18:40',
            },
            {
              id: 'rev-2',
              authorName: 'Елена С.',
              authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120',
              rating: 5,
              tags: ['🤝 Честная цена', '💬 Вежливый сервис'],
              comment: 'Обмен прошел отлично, курс был лучший на Раваи. Доставили наличку за 15 минут.',
              createdAt: '3 дня назад',
            },
          ].map((rev) => (
            <div key={rev.id} className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src={rev.authorAvatar} alt={rev.authorName} className="w-7 h-7 rounded-full object-cover border border-amber-400/50" />
                  <span className="font-bold text-white text-xs">{rev.authorName}</span>
                </div>
                <div className="flex items-center gap-1 text-amber-400 text-xs font-black">
                  <span>{rev.rating}.0</span>
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {rev.tags.map((tag, i) => (
                  <span key={i} className="text-[10px] bg-white/5 border border-white/10 text-cyan-300 px-2 py-0.5 rounded-md">
                    {tag}
                  </span>
                ))}
              </div>

              <p className="text-gray-300 text-xs leading-relaxed">{rev.comment}</p>
              <div className="text-[10px] text-gray-500 text-right">{rev.createdAt}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Partner Referral Link Card */}
      <div className="glass-card p-4 border-amber-400/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h4 className="font-display font-bold text-sm text-white">Партнёрская программа (20%)</h4>
          </div>
          <span className="badge-pro text-[10px] px-2 py-0.5 rounded-full font-bold">20% Пассивный доход</span>
        </div>
        <p className="text-gray-300 text-xs mb-3">
          Делитесь реферальной ссылкой с коллегами и бизнесом. Получайте 20% от их подписок пожизненно.
        </p>

        <div className="flex items-center gap-2 bg-slate-950/80 p-2 rounded-xl border border-white/10">
          <input
            type="text"
            readOnly
            value="https://t.me/tuttominutto_bot?start=ref_phuket999"
            className="w-full bg-transparent text-gray-300 text-xs outline-none font-mono"
          />
          <button
            onClick={handleCopyRef}
            className="px-3 py-1.5 rounded-lg bg-amber-400 text-black font-bold text-xs shrink-0 flex items-center gap-1"
          >
            {copiedRef ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedRef ? 'Скопировано' : 'Копировать'}</span>
          </button>
        </div>
      </div>
      
      {/* Dev / Admin Button */}
      <button
        data-testid="admin-panel-btn"
        onClick={() => {
          if (onOpenAdmin) onOpenAdmin()
        }}
        className="w-full py-4 mt-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 font-bold tracking-wide flex items-center justify-center gap-2 hover:bg-red-500/20 transition-all cursor-pointer"
      >
        <Shield className="w-5 h-5" /> ПАНЕЛЬ АДМИНИСТРАТОРА (DEV)
      </button>
    </div>
  )
}

