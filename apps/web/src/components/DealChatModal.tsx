import React, { useState, useEffect } from 'react'
import { X, Send, ShieldCheck, CheckCircle2, AlertTriangle, ExternalLink, Bot, Star } from 'lucide-react'
import { RequestItem, BidItem } from '../types'
import { triggerHapticFeedback, triggerNotificationFeedback } from '../lib/telegram'
import { supabase } from '../lib/supabase'
import { ReviewModal } from './ReviewModal'

interface DealChatModalProps {
  isOpen: boolean
  request: RequestItem | null
  bid: BidItem | null
  onClose: () => void
  onCompleteDeal: () => void
}

interface ChatMessage {
  id: string
  senderRole: 'client' | 'provider' | 'system'
  senderName: string
  content: string
  timestamp: string
}

export const DealChatModal: React.FC<DealChatModalProps> = ({
  isOpen,
  request,
  bid,
  onClose,
  onCompleteDeal,
}) => {
  if (!isOpen || !request || !bid) return null

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      senderRole: 'system',
      senderName: 'TuttoMinutto System',
      content: `🎉 Оффер принят! Сделка по «${request.title}» переведена в статус «В процессе». Договоренная сумма: $${bid.proposedPrice}.`,
      timestamp: 'Только что',
    },
    {
      id: 'msg-2',
      senderRole: 'provider',
      senderName: bid.providerName,
      content: bid.comment,
      timestamp: '1 мин назад',
    },
  ])

  const [newMessage, setNewMessage] = useState('')
  const [dealStatus, setDealStatus] = useState<'in_progress' | 'completed' | 'disputed'>('in_progress')
  const [showReviewModal, setShowReviewModal] = useState(false)

  // Supabase Realtime Channel Subscription for live deal chat
  useEffect(() => {
    if (!isOpen || !request) return

    const channelName = `deal_chat_${request.id}`
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `request_id=eq.${request.id}`,
        },
        (payload) => {
          const newMsg = payload.new
          if (newMsg) {
            setMessages((prev) => [
              ...prev,
              {
                id: newMsg.id || `msg-${Date.now()}`,
                senderRole: newMsg.sender_role || 'provider',
                senderName: newMsg.sender_name || bid.providerName,
                content: newMsg.content,
                timestamp: 'Только что',
              },
            ])
            triggerNotificationFeedback('success')
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [isOpen, request, bid.providerName])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const text = newMessage.trim()
    setNewMessage('')
    triggerHapticFeedback('light')

    const msg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderRole: 'client',
      senderName: 'Вы (Клиент)',
      content: text,
      timestamp: 'Только что',
    }

    setMessages((prev) => [...prev, msg])

    // Try posting message to Supabase DB for Realtime sync
    try {
      await supabase.from('chat_messages').insert({
        request_id: request.id,
        sender_role: 'client',
        sender_name: 'Вы (Клиент)',
        content: text,
      })
    } catch {
      // Ignore if offline
    }

    // Fallback simulated Provider reply after 2 seconds for demo
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-reply-${Date.now()}`,
          senderRole: 'provider',
          senderName: bid.providerName,
          content: 'Отлично! Всё понял, готов к работе.',
          timestamp: 'Только что',
        },
      ])
      triggerNotificationFeedback('success')
    }, 2000)
  }

  const handleComplete = () => {
    setDealStatus('completed')
    triggerHapticFeedback('heavy')
    triggerNotificationFeedback('success')
    setShowReviewModal(true)
    onCompleteDeal()
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
        <div className="w-full sm:max-w-lg glass-panel rounded-t-3xl sm:rounded-3xl border border-[#00F2FE]/30 flex flex-col h-[90vh] sm:h-[80vh] overflow-hidden safe-area-bottom">
          {/* Deal Header */}
          <div className="p-4 bg-[#161B22] border-b border-white/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <img
                src={bid.providerAvatar || 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=100'}
                alt={bid.providerName}
                className="w-10 h-10 rounded-xl border border-[#00F2FE]/40 object-cover"
              />
              <div>
                <div className="font-extrabold text-white text-sm flex items-center gap-1.5">
                  <span>{bid.providerName}</span>
                  <span className="badge-pro text-[9px] px-1.5 py-0.2 rounded font-black">PRO</span>
                </div>
                <div className="text-xs text-gray-400 flex items-center gap-2">
                  <span className="glow-cyan font-extrabold">${bid.proposedPrice} USD</span>
                  <span>• {request.district}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action Toolbar Inside Chat */}
          <div className="px-4 py-2 bg-[#0D1117] border-b border-white/10 flex items-center justify-between text-xs shrink-0">
            {dealStatus === 'in_progress' ? (
              <button
                onClick={handleComplete}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#00F2FE] to-[#00FF87] text-black font-extrabold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,255,135,0.3)] hover:scale-105 transition-transform"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>✅ Подтвердить оказание услуги</span>
              </button>
            ) : (
              <div className="text-[#00FF87] font-extrabold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Сделка успешно завершена</span>
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="ml-2 px-2 py-0.5 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-bold flex items-center gap-1"
                >
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  Отзыв
                </button>
              </div>
            )}

            <button
              onClick={() => alert('Чат апелляции передан модератору TuttoMinutto')}
              className="text-gray-400 hover:text-red-400 font-semibold flex items-center gap-1 text-[11px]"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Апелляция</span>
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0D1117]/60">
            {messages.map((msg) => {
              if (msg.senderRole === 'system') {
                return (
                  <div key={msg.id} className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-200 text-xs text-center font-medium my-2">
                    <div className="flex items-center justify-center gap-1.5 mb-1 font-bold text-purple-300">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Системное уведомление TuttoMinutto</span>
                    </div>
                    {msg.content}
                  </div>
                )
              }

              const isMe = msg.senderRole === 'client'

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] text-gray-500 mb-0.5 px-1">{msg.senderName}</span>
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
                      isMe
                        ? 'bg-gradient-to-r from-[#00F2FE] to-cyan-600 text-black font-semibold rounded-br-none shadow-[0_0_15px_rgba(0,242,254,0.2)]'
                        : 'bg-[#161B22] border border-white/10 text-gray-100 rounded-bl-none'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[9px] text-gray-500 mt-1 px-1">{msg.timestamp}</span>
                </div>
              );
            })}
          </div>

          {/* Input Footer */}
          <form onSubmit={handleSendMessage} className="p-3 bg-[#161B22] border-t border-white/10 flex items-center gap-2 shrink-0">
            <input
              type="text"
              placeholder="Напишите сообщение..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={dealStatus === 'completed'}
              className="flex-1 bg-[#0D1117] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:border-[#00F2FE] outline-none"
            />
            <button
              type="submit"
              disabled={dealStatus === 'completed'}
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00F2FE] to-[#00FF87] flex items-center justify-center text-black font-extrabold hover:scale-105 active:scale-95 transition-transform"
            >
              <Send className="w-4 h-4 fill-black" />
            </button>
          </form>
        </div>
      </div>

      {/* Post-Deal Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        providerName={bid.providerName}
        providerAvatar={bid.providerAvatar}
        serviceTitle={request.title}
        onClose={() => setShowReviewModal(false)}
        onSubmitReview={(review) => {
          console.log('Review submitted:', review)
          triggerNotificationFeedback('success')
        }}
      />
    </>
  )
}

