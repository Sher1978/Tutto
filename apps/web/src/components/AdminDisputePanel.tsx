import React, { useState } from 'react'
import { X, Scale, AlertTriangle, MessageSquare, CheckCircle, Ban, ShieldAlert, DollarSign } from 'lucide-react'
import { triggerHapticFeedback, triggerNotificationFeedback } from '../lib/telegram'

interface AdminDisputePanelProps {
  isOpen: boolean
  onClose: () => void
}

const MOCK_DISPUTES = [
  {
    id: 'APL-012',
    date: '24 сент 18:30',
    client: '@alex_phuket',
    provider: 'Phuket Drive',
    dealId: 'DEAL-441',
    service: 'Аренда Honda PCX',
    price: 77,
    reason: 'Байк оказался в плохом состоянии, отличался от описания. Требую возврат 50% стоимости.',
    status: 'open',
  },
  {
    id: 'APL-015',
    date: '25 сент 09:15',
    client: '@maria_bali',
    provider: 'Clean&Clear',
    dealId: 'DEAL-882',
    service: 'Уборка виллы 3BR',
    price: 120,
    reason: 'Клининг не приехал в назначенное время, на сообщения не отвечают.',
    status: 'open',
  }
]

export const AdminDisputePanel: React.FC<AdminDisputePanelProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null

  const [activeTab, setActiveTab] = useState<'open' | 'closed'>('open')
  const [disputes, setDisputes] = useState(MOCK_DISPUTES)
  const [selectedDispute, setSelectedDispute] = useState<typeof MOCK_DISPUTES[0] | null>(null)
  const [decisionText, setDecisionText] = useState('')

  const handleResolve = (resolution: 'client' | 'provider' | 'reject') => {
    if (!selectedDispute) return
    triggerHapticFeedback('heavy')
    
    // Эмуляция закрытия диспута
    setDisputes(prev => prev.filter(d => d.id !== selectedDispute.id))
    setSelectedDispute(null)
    setDecisionText('')
    triggerNotificationFeedback('success')
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#0A101D] animate-fadeIn">
      {/* Header */}
      <div className="safe-area-top bg-black/50 border-b border-red-500/30 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center border border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
            <Scale className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h2 className="font-display font-black text-xl text-white tracking-wide">АРБИТРАЖ</h2>
            <p className="text-xs text-red-400 font-bold">Admin Panel • {disputes.length} открытых</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 relative">
        {/* Background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-red-500/10 blur-[100px] rounded-full pointer-events-none" />

        {selectedDispute ? (
          /* Окно детального диспута */
          <div className="space-y-4 animate-slideInRight relative z-10">
            <button 
              onClick={() => setSelectedDispute(null)}
              className="text-xs font-bold text-gray-400 flex items-center gap-1 hover:text-white mb-2"
            >
              ← Назад к списку
            </button>

            <div className="glass-panel p-5 border-red-500/30 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 px-3 py-1 bg-red-500/20 rounded-bl-xl border-l border-b border-red-500/30 text-[10px] font-black text-red-400 uppercase tracking-wider">
                {selectedDispute.id}
              </div>

              <div className="flex items-center gap-2 mb-4 mt-2">
                <ShieldAlert className="w-5 h-5 text-red-400" />
                <h3 className="text-white font-bold text-lg">Детали апелляции</h3>
              </div>

              <div className="space-y-3 text-xs mb-6">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-400">Клиент:</span>
                  <span className="text-white font-bold">{selectedDispute.client}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-400">Бизнес:</span>
                  <span className="text-cyan-400 font-bold flex items-center gap-1">
                    {selectedDispute.provider} <CheckCircle className="w-3 h-3" />
                  </span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-400">Сделка:</span>
                  <span className="text-white">{selectedDispute.dealId} • {selectedDispute.service}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-400">Сумма:</span>
                  <span className="text-[#00FF87] font-black font-mono text-sm">${selectedDispute.price}</span>
                </div>
              </div>

              <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 mb-6">
                <h4 className="text-red-400 font-bold mb-2 flex items-center gap-1.5 text-xs">
                  <AlertTriangle className="w-4 h-4" /> Причина апелляции:
                </h4>
                <p className="text-gray-300 text-sm leading-relaxed italic border-l-2 border-red-500/50 pl-3">
                  «{selectedDispute.reason}»
                </p>
              </div>

              <div className="flex gap-2 mb-6">
                <button className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-bold text-white transition-colors">
                  <MessageSquare className="w-4 h-4 text-cyan-400" /> Чат сделки
                </button>
              </div>

              <div className="space-y-3">
                <h4 className="text-white font-bold text-sm">Решение модератора:</h4>
                <textarea
                  value={decisionText}
                  onChange={(e) => setDecisionText(e.target.value)}
                  placeholder="Введите основание для решения..."
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-red-500/50 outline-none resize-none h-24"
                />
                
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button 
                    onClick={() => handleResolve('client')}
                    className="bg-[#00FF87]/10 hover:bg-[#00FF87]/20 border border-[#00FF87]/30 text-[#00FF87] rounded-xl py-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all"
                  >
                    <DollarSign className="w-4 h-4" /> В пользу Клиента
                  </button>
                  <button 
                    onClick={() => handleResolve('provider')}
                    className="bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-xl py-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all"
                  >
                    <CheckCircle className="w-4 h-4" /> В пользу Бизнеса
                  </button>
                </div>
                <button 
                  onClick={() => handleResolve('reject')}
                  className="w-full mt-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 rounded-xl py-3 text-xs font-bold flex items-center justify-center gap-1 transition-all"
                >
                  <Ban className="w-4 h-4" /> Отклонить апелляцию
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Список диспутов */
          <div className="space-y-4 relative z-10">
            <div className="flex gap-2 mb-6">
              <button 
                onClick={() => setActiveTab('open')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  activeTab === 'open' 
                  ? 'bg-red-500/20 border-red-500/50 text-white shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                  : 'bg-white/5 border-white/10 text-gray-500'
                }`}
              >
                Открытые ({disputes.length})
              </button>
              <button 
                onClick={() => setActiveTab('closed')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  activeTab === 'closed' 
                  ? 'bg-white/20 border-white/40 text-white' 
                  : 'bg-white/5 border-white/10 text-gray-500'
                }`}
              >
                Закрытые
              </button>
            </div>

            {disputes.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/10">
                  <CheckCircle className="w-8 h-8 text-[#00FF87]" />
                </div>
                <h3 className="text-white font-bold">Все диспуты разобраны</h3>
                <p className="text-gray-500 text-xs mt-2">Отличная работа!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {disputes.map((dispute) => (
                  <div 
                    key={dispute.id} 
                    onClick={() => setSelectedDispute(dispute)}
                    className="glass-panel p-4 border-white/10 rounded-2xl cursor-pointer hover:border-red-500/50 hover:bg-white/5 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded-md text-[10px] font-black uppercase">
                          {dispute.id}
                        </span>
                        <span className="text-[10px] text-gray-500">{dispute.date}</span>
                      </div>
                      <span className="text-xs font-black text-[#00FF87]">${dispute.price}</span>
                    </div>
                    
                    <div className="text-sm font-bold text-white mb-1">
                      {dispute.client} <span className="text-gray-600 mx-1">→</span> <span className="text-cyan-400">{dispute.provider}</span>
                    </div>
                    <div className="text-xs text-gray-400 mb-3 truncate">
                      {dispute.service}
                    </div>

                    <div className="text-[11px] text-gray-300 italic border-l-2 border-red-500/30 pl-2 line-clamp-2">
                      «{dispute.reason}»
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
