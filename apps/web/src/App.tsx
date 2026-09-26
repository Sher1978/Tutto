import React, { useState, useEffect } from 'react'
import { Navbar } from './components/Navbar'
import { MockupAuctionSection } from './components/MockupAuctionSection'
import { RequestCard } from './components/RequestCard'
import { TemplateCard } from './components/TemplateCard'
import { CreateRequestModal } from './components/CreateRequestModal'
import { QuickRequestModal } from './components/QuickRequestModal'
import { BidModal } from './components/BidModal'
import { BusinessProfileView } from './components/BusinessProfileView'
import { DealChatModal } from './components/DealChatModal'
import { SplashScreen } from './components/SplashScreen'
import { BottomNav, TabId } from './components/BottomNav'
import { MOCK_REQUESTS, SERVICE_TEMPLATES } from './data/mockData'
import { RequestItem, BidItem, ServiceTemplate } from './types'
import { initTelegramApp, triggerHapticFeedback } from './lib/telegram'
import { CheckCircle2, Zap, Scale } from 'lucide-react'
import { AdminDisputePanel } from './components/AdminDisputePanel'

export function App() {
  const [activeHub, setActiveHub] = useState<string>('bali')
  const [activeTab, setActiveTab] = useState<TabId>('home')
  const [activeCategory, setActiveCategory] = useState<string | null>('resorts')
  const [showSplash, setShowSplash] = useState<boolean>(true)

  const [requests, setRequests] = useState<RequestItem[]>([
    {
      id: 'req-bike',
      clientId: 'usr-kaitlyn',
      clientName: 'Александр',
      clientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      clientRating: 5.0,
      hub: 'bali',
      district: 'Доставка в отель',
      categoryL1Id: 'cat-transport',
      categoryL1Name: 'Транспорт',
      title: 'НУЖЕН БАЙК',
      description: 'Аренда скутера 155cc с бесплатной доставкой в отель.',
      budget: 15,
      currency: 'USD',
      mediaUrls: ['https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600'],
      isFeatured: true,
      status: 'open',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
      auctionEndsAt: new Date(Date.now() + 4 * 60 * 1000 + 18 * 1000).toISOString(),
      bidsCount: 8,
    },
    {
      id: 'req-car',
      clientId: 'usr-kaitlyn',
      clientName: 'Александр',
      clientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      clientRating: 4.9,
      hub: 'bali',
      district: 'Аренда с доставкой',
      categoryL1Id: 'cat-transport',
      categoryL1Name: 'Транспорт',
      title: 'НУЖНО АВТО',
      description: 'Компактный авто без залога оригиналов документов.',
      budget: 35,
      currency: 'USD',
      mediaUrls: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600'],
      isFeatured: true,
      status: 'open',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
      auctionEndsAt: new Date(Date.now() + 4 * 60 * 1000 + 18 * 1000).toISOString(),
      bidsCount: 5,
    },
    {
      id: 'req-villa-short',
      clientId: 'usr-kaitlyn',
      clientName: 'Александр',
      clientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      clientRating: 4.95,
      hub: 'bali',
      district: 'Вилла / Отель',
      categoryL1Id: 'cat-realestate',
      categoryL1Name: 'Жильё',
      title: 'АРЕНДА ПОСУТОЧНО',
      description: 'Посуточная аренда виллы с бассейном.',
      budget: 250,
      currency: 'USD',
      mediaUrls: ['https://images.unsplash.com/photo-1613977257363-707ba9348227?w=600'],
      isFeatured: true,
      status: 'open',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
      auctionEndsAt: new Date(Date.now() + 4 * 60 * 1000 + 18 * 1000).toISOString(),
      bidsCount: 12,
    },
    {
      id: 'req-villa-long',
      clientId: 'usr-kaitlyn',
      clientName: 'Александр',
      clientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      clientRating: 4.9,
      hub: 'bali',
      district: 'Апартаменты / Вилла',
      categoryL1Id: 'cat-realestate',
      categoryL1Name: 'Жильё',
      title: 'АРЕНДА ДОЛГОСРОК',
      description: 'Долгосрочная аренда апартаментов или виллы.',
      budget: 1200,
      currency: 'USD',
      mediaUrls: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600'],
      isFeatured: true,
      status: 'open',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
      auctionEndsAt: new Date(Date.now() + 4 * 60 * 1000 + 18 * 1000).toISOString(),
      bidsCount: 6,
    },
    {
      id: 'req-exchange',
      clientId: 'usr-kaitlyn',
      clientName: 'Александр',
      clientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      clientRating: 5.0,
      hub: 'bali',
      district: 'Доставка наличных',
      categoryL1Id: 'cat-exchange',
      categoryL1Name: 'Обмен',
      title: 'ОБМЕН ВАЛЮТЫ',
      description: 'Экспресс-доставка наличной валюты в отель.',
      budget: 0,
      currency: 'USD',
      mediaUrls: ['https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=600'],
      isFeatured: true,
      status: 'open',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
      auctionEndsAt: new Date(Date.now() + 4 * 60 * 1000 + 18 * 1000).toISOString(),
      bidsCount: 10,
    },
  ])

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedQuickRequestItem, setSelectedQuickRequestItem] = useState<RequestItem | null>(null)
  const [selectedRequestForBid, setSelectedRequestForBid] = useState<RequestItem | null>(null)

  // In-App Deal Chat State
  const [activeDealRequest, setActiveDealRequest] = useState<RequestItem | null>(null)
  const [activeDealBid, setActiveDealBid] = useState<BidItem | null>(null)
  const [isAdminDisputeOpen, setIsAdminDisputeOpen] = useState(false)

  const [notificationMsg, setNotificationMsg] = useState<string | null>(null)

  useEffect(() => {
    initTelegramApp()
  }, [])

  const handleSelectHub = (hub: string) => {
    setActiveHub(hub)
    triggerHapticFeedback('light')
  }

  const handleSelectTab = (tab: TabId) => {
    if (tab === 'home') {
      setShowSplash(true)
    }
    setActiveTab(tab)
  }

  const handleCreateRequest = (newReq: Partial<RequestItem>) => {
    const createdItem: RequestItem = {
      id: `req-${Date.now()}`,
      clientId: 'usr-current',
      clientName: 'Александр',
      clientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      clientRating: 5.0,
      hub: (newReq.hub as any) || activeHub,
      district: newReq.district || 'Jimbaran',
      categoryL1Id: newReq.categoryL1Id || 'cat-realestate',
      categoryL1Name: newReq.categoryL1Name || 'Жильё',
      title: newReq.title || 'Запрос на услугу',
      description: newReq.description || '',
      budget: newReq.budget ?? 345,
      currency: 'USD',
      mediaUrls: [],
      isFeatured: false,
      status: 'open',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
      auctionEndsAt: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
      bidsCount: 0,
    }

    setRequests([createdItem, ...requests])
    setNotificationMsg('🎉 Заявка опубликована на живой аукцион!')
    setTimeout(() => setNotificationMsg(null), 4000)
  }

  const handleSubmitBid = (requestId: string, price: number, comment: string) => {
    if (comment.startsWith('[CLARIFICATION]')) {
      const question = comment.replace('[CLARIFICATION] ', '')
      setRequests((prev) =>
        prev.map((r) => {
          if (r.id === requestId) {
            const reqs = r.clarificationRequests || []
            return {
              ...r,
              clarificationRequests: [
                ...reqs,
                { providerId: 'biz-current', question, createdAt: new Date().toISOString() }
              ]
            }
          }
          return r
        })
      )
      setNotificationMsg('📨 Запрос на уточнение отправлен клиенту!')
      setTimeout(() => setNotificationMsg(null), 4000)
      return
    }

    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, bidsCount: r.bidsCount + 1 } : r))
    )

    const targetReq = requests.find((r) => r.id === requestId)
    if (targetReq) {
      const mockBid: BidItem = {
        id: `bid-${Date.now()}`,
        requestId: targetReq.id,
        providerId: 'biz-1',
        providerName: 'Ayana Luxury Resort',
        providerAvatar: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=100',
        providerRating: 4.98,
        isPro: true,
        isAiAgent: true,
        proposedPrice: price,
        currency: 'USD',
        comment: comment || 'Вилла готова к бронированию!',
        status: 'accepted',
        createdAt: new Date().toISOString(),
      }

      setActiveDealRequest(targetReq)
      setActiveDealBid(mockBid)
    }

    setNotificationMsg(`✅ Предложение принято! Чат сделки открыт.`)
    setTimeout(() => setNotificationMsg(null), 4000)
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center font-sans sm:py-6 selection:bg-[#00F2FE] selection:text-black relative overflow-hidden">
      {/* Background Glow Sprites: Top-Left Blue, Top-Right Emerald Green, Center & Bottom Pure Black */}
      <div className="fixed top-0 left-0 w-[450px] h-[450px] bg-[#00F2FE]/20 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed top-0 right-0 w-[450px] h-[450px] bg-[#00FF87]/20 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-[#050811]/90 to-[#000000] pointer-events-none z-0" />

      {/* 3-Second Onboarding Splash Screen */}
      <SplashScreen isVisible={showSplash} onFinish={() => setShowSplash(false)} />

      {/* Smartphone Shell Container / Full Screen on Mobile */}
      <div className="w-full sm:max-w-[480px] mx-auto min-h-screen sm:min-h-[840px] bg-black/40 backdrop-blur-3xl sm:rounded-[44px] sm:border-[8px] sm:border-[#1c2433] sm:shadow-[0_30px_90px_rgba(0,0,0,0.95)] flex flex-col relative overflow-hidden z-10">
        {/* Header */}
        <Navbar
          onOpenQuickRequest={() => setSelectedQuickRequestItem({
            id: 'new',
            title: '',
            hub: activeHub as any,
            district: '',
            categoryL1Id: 'cat-realestate',
            categoryL1Name: 'Жильё',
            description: '',
            budget: 0,
            currency: 'USD',
            mediaUrls: [],
            isFeatured: false,
            status: 'open',
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
            auctionEndsAt: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
            bidsCount: 0,
            clientId: 'usr-current',
            clientName: 'Александр',
            clientAvatar: '',
            clientRating: 5.0,
          })}
          activeAuctionsCount={requests.filter(r => r.status === 'open').length}
          totalBidsCount={requests.reduce((acc, r) => acc + r.bidsCount, 0)}
          userRole="client"
        />

        {/* Notification Toast */}
        {notificationMsg && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-[#00FF87] text-[#050811] font-black text-xs shadow-[0_0_25px_rgba(0,255,135,0.6)] flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-[#050811]" />
            <span>{notificationMsg}</span>
          </div>
        )}

        {/* Main Content Area */}
        <main className="w-full px-4 py-2 flex-1 space-y-4">
          {activeTab === 'home' && (
            <MockupAuctionSection
              activeHub={activeHub}
              onSelectHub={handleSelectHub}
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
              onOpenBidModal={(req) => setSelectedRequestForBid(req)}
              onOpenQuickRequest={(req) => setSelectedQuickRequestItem(req)}
              requests={requests}
            />
          )}

          {activeTab === 'explore' && (
            <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-center my-4">
              <h3 className="font-bold text-base text-white">Все доступные аукционы</h3>
              <p className="text-xs text-gray-300 mt-1">Просмотр всех обратных аукционов в хабах ЮВА</p>
            </div>
          )}

          {activeTab === 'my-bids' && (
            <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-center my-4">
              <h3 className="font-bold text-base text-white">Мои отклики и заявки</h3>
              <p className="text-xs text-gray-300 mt-1">Отслеживание активных откликов и встречных предложений</p>
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-center my-4">
              <h3 className="font-bold text-base text-white">Чат сделок</h3>
              <p className="text-xs text-gray-300 mt-1">Прямое общение клиентов с исполнителями в реальном времени</p>
            </div>
          )}

          {activeTab === 'account' && <BusinessProfileView />}
        </main>

        {/* Modals */}
        <CreateRequestModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          currentHub={activeHub as any}
          onCreateRequest={handleCreateRequest}
        />

        <QuickRequestModal
          isOpen={Boolean(selectedQuickRequestItem)}
          onClose={() => setSelectedQuickRequestItem(null)}
          initialHub={selectedQuickRequestItem?.hub || activeHub}
          initialServiceTitle={selectedQuickRequestItem?.title || ''}
          initialDistrict={selectedQuickRequestItem?.district || 'Jimbaran'}
          onCreateRequest={handleCreateRequest}
        />

        <BidModal
          isOpen={Boolean(selectedRequestForBid)}
          request={selectedRequestForBid}
          onClose={() => setSelectedRequestForBid(null)}
          onSubmitBid={handleSubmitBid}
        />

        {/* In-App Realtime Deal Chat Modal */}
        <DealChatModal
          isOpen={Boolean(activeDealRequest && activeDealBid)}
          request={activeDealRequest}
          bid={activeDealBid}
          onClose={() => {
            setActiveDealRequest(null)
            setActiveDealBid(null)
          }}
          onCompleteDeal={() => {
            setNotificationMsg('🎉 Сделка завершена! Открыто окно отзыва.')
            setTimeout(() => setNotificationMsg(null), 4000)
          }}
        />

        <AdminDisputePanel 
          isOpen={isAdminDisputeOpen} 
          onClose={() => setIsAdminDisputeOpen(false)} 
        />

        {/* Bottom Tab Bar */}
        <BottomNav
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
        />
        
        {/* Admin Dev Button */}
        <button 
          onClick={() => setIsAdminDisputeOpen(true)}
          className="absolute bottom-24 right-4 w-12 h-12 bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 rounded-full flex items-center justify-center text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)] backdrop-blur-md z-40 transition-all active:scale-95"
        >
          <Scale className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}

export default App
