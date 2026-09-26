import React, { useState } from 'react'
import { X, Coins, ArrowUpRight, ArrowDownRight, Sparkles, CheckCircle2, CreditCard } from 'lucide-react'
import { triggerHapticFeedback, triggerNotificationFeedback } from '../lib/telegram'

interface TokenWalletModalProps {
  isOpen: boolean
  onClose: () => void
  currentBalance: number
  onTopUp: (amount: number) => void
}

const TRANSACTIONS = [
  { id: 1, type: 'income', title: 'Бонус за отзыв', amount: '+10', date: 'Сегодня, 14:30' },
  { id: 2, type: 'expense', title: 'Оплата VIP подсветки', amount: '-20', date: 'Вчера, 19:15' },
  { id: 3, type: 'income', title: 'Пополнение картой', amount: '+100', date: '22 Сен, 10:00' },
]

export const TokenWalletModal: React.FC<TokenWalletModalProps> = ({
  isOpen,
  onClose,
  currentBalance,
  onTopUp,
}) => {
  if (!isOpen) return null

  const [isProcessing, setIsProcessing] = useState(false)
  const [successPack, setSuccessPack] = useState<number | null>(null)

  const handleBuy = (tokens: number, price: number) => {
    triggerHapticFeedback('medium')
    setIsProcessing(true)

    // Эмуляция задержки платежного шлюза
    setTimeout(() => {
      setIsProcessing(false)
      setSuccessPack(tokens)
      onTopUp(tokens)
      triggerNotificationFeedback('success')
      triggerHapticFeedback('heavy')
      
      setTimeout(() => {
        setSuccessPack(null)
      }, 3000)
    }, 1500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full sm:max-w-lg glass-panel rounded-t-3xl sm:rounded-3xl border border-amber-400/30 flex flex-col max-h-[90vh] overflow-hidden safe-area-bottom relative">
        {/* Glow Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-amber-500/20 blur-[80px] rounded-full pointer-events-none" />

        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/40">
              <Coins className="w-4 h-4 text-amber-400" />
            </div>
            <h2 className="font-display font-extrabold text-lg text-white">Мой Кошелёк</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 text-xs relative z-10">
          {/* Main Balance Card */}
          <div className="glass-card p-5 border-amber-400/40 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-transparent opacity-50" />
            
            <p className="text-gray-300 font-bold mb-1 relative z-10">Баланс токенов</p>
            <div className="flex items-center justify-center gap-2 relative z-10">
              <Coins className="w-7 h-7 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
              <span className="font-display font-black text-4xl text-white tracking-tight">
                {currentBalance}
              </span>
            </div>
            <p className="text-[10px] text-amber-400/80 mt-1 relative z-10">≈ ${(currentBalance * 0.1).toFixed(2)} USD</p>
            
            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[10px] font-bold">
              <Sparkles className="w-3 h-3" />
              1 Токен (Tutto) = $0.10
            </div>
          </div>

          {/* Top Up Section */}
          <div>
            <h3 className="font-bold text-gray-200 mb-3 text-sm flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-cyan-400" /> Пополнить баланс
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Pack 1 */}
              <button 
                onClick={() => handleBuy(50, 5)}
                disabled={isProcessing}
                className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col items-center justify-center gap-2 hover:border-amber-400/50 hover:bg-amber-400/10 transition-all active:scale-95 disabled:opacity-50"
              >
                <div className="text-amber-400 font-extrabold text-lg flex items-center gap-1">
                  <Coins className="w-4 h-4" /> 50
                </div>
                <div className="bg-white/10 px-3 py-1 rounded-lg text-white font-bold w-full text-center">
                  $5.00
                </div>
              </button>

              {/* Pack 2 (Popular) */}
              <button 
                onClick={() => handleBuy(120, 10)}
                disabled={isProcessing}
                className="bg-gradient-to-b from-amber-500/20 to-amber-900/20 border border-amber-400/60 rounded-2xl p-3 flex flex-col items-center justify-center gap-2 hover:brightness-110 transition-all active:scale-95 disabled:opacity-50 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full text-center bg-amber-400 text-black text-[9px] font-black uppercase py-0.5 tracking-wider">
                  +20 Бонус
                </div>
                <div className="text-amber-400 font-extrabold text-lg flex items-center gap-1 mt-3 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]">
                  <Coins className="w-4 h-4" /> 120
                </div>
                <div className="bg-amber-400 text-black px-3 py-1 rounded-lg font-black w-full text-center">
                  $10.00
                </div>
              </button>
            </div>

            {successPack && (
              <div className="mt-3 p-2.5 rounded-xl bg-[#00FF87]/10 border border-[#00FF87]/30 flex items-center justify-center gap-2 animate-fadeIn text-[#00FF87] font-bold">
                <CheckCircle2 className="w-4 h-4" />
                Успешно зачислено {successPack} токенов!
              </div>
            )}
            {isProcessing && (
              <div className="mt-3 text-center text-amber-400 font-bold animate-pulse">
                Обработка платежа...
              </div>
            )}
          </div>

          {/* Transaction History */}
          <div>
            <h3 className="font-bold text-gray-200 mb-3 text-sm">История операций</h3>
            <div className="space-y-2">
              {TRANSACTIONS.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      tx.type === 'income' ? 'bg-[#00FF87]/10 text-[#00FF87]' : 'bg-white/10 text-gray-400'
                    }`}>
                      {tx.type === 'income' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="text-white font-bold">{tx.title}</div>
                      <div className="text-[10px] text-gray-500">{tx.date}</div>
                    </div>
                  </div>
                  <div className={`font-extrabold font-mono text-sm ${
                    tx.type === 'income' ? 'text-[#00FF87]' : 'text-white'
                  }`}>
                    {tx.amount}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
