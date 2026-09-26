import React, { useState, useEffect } from 'react'
import { Navbar } from './components/Navbar'
import { MockupAuctionSection } from './components/MockupAuctionSection'
import { RequestCard } from './components/RequestCard'
import { TemplateCard } from './components/TemplateCard'
import { CreateRequestModal } from './components/CreateRequestModal'
import { AIAssistantModal } from './components/AIAssistantModal'
import { BidModal } from './components/BidModal'
import { BusinessProfileView } from './components/BusinessProfileView'
import { DealChatModal } from './components/DealChatModal'
import { SplashScreen } from './components/SplashScreen'
import { BottomNav, TabId, AppMode } from './components/BottomNav'
import { PillSwitcher } from './components/PillSwitcher'
import { MarketSection } from './components/MarketSection'
import { CreateMarketListingModal } from './components/CreateMarketListingModal'
import { MarketBuyModal } from './components/MarketBuyModal'
import { MOCK_REQUESTS, SERVICE_TEMPLATES } from './data/mockData'
import { RequestItem, BidItem, ServiceTemplate, MarketItem } from './types'
import { initTelegramApp, triggerHapticFeedback, isTelegramEnvironment } from './lib/telegram'
import { CheckCircle2, Zap, Scale } from 'lucide-react'
import { AdminDisputePanel } from './components/AdminDisputePanel'
import { AuthModal } from './components/AuthModal'
import { supabase } from './lib/supabase'
import { Session } from '@supabase/supabase-js'

export function App() {
  const [mode, setMode] = useState<AppMode>('services')
  const [activeHub, setActiveHub] = useState<string>('bali')
  const [activeTab, setActiveTab] = useState<TabId>('home')
  const [activeCategory, setActiveCategory] = useState<string | null>('cat-transport')
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && (window as any).isPlaywright) {
      return false
    }
    return true
  })

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
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false)
  const [selectedRequestForBid, setSelectedRequestForBid] = useState<RequestItem | null>(null)

  // Flash Market State
  const [isCreateMarketListingOpen, setIsCreateMarketListingOpen] = useState(false)
  const [selectedMarketProduct, setSelectedMarketProduct] = useState<MarketItem | null>(null)
  const [marketProducts, setMarketProducts] = useState<MarketItem[]>([])

  // In-App Deal Chat State
  const [activeDealRequest, setActiveDealRequest] = useState<RequestItem | null>(null)
  const [activeDealBid, setActiveDealBid] = useState<BidItem | null>(null)
  const [isAdminDisputeOpen, setIsAdminDisputeOpen] = useState(false)

  const [notificationMsg, setNotificationMsg] = useState<string | null>(null)

  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    initTelegramApp()
    
    // Auth Session Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSelectHub = (hub: string) => {
    setActiveHub(hub)
    triggerHapticFeedback('light')
  }

  const handleSelectTab = (tab: TabId) => {
    if ((tab === 'account' || tab === 'my-bids' || tab === 'chat') && !session && !isTelegramEnvironment()) {
      setIsAuthOpen(true)
      triggerHapticFeedback('heavy')
      return
    }

    if (tab === 'home' || tab === 'market') {
      setShowSplash(true)
    }
    setActiveTab(tab)
  }

  const handleModeChange = (newMode: AppMode) => {
    setMode(newMode)
    setActiveTab(newMode === 'services' ? 'home' : 'market')
    setActiveCategory(null)
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

  const handleCreateMarketListing = (newItem: MarketItem) => {
    setMarketProducts((prev) => [newItem, ...prev])
    setActiveCategory(null)
    setNotificationMsg('🔥 Лот успешно опубликован во Flash Market!')
    setTimeout(() => setNotificationMsg(null), 4000)
  }

  const handleContactSeller = (item: MarketItem, deliveryMethod: string) => {
    const marketDealReq: RequestItem = {
      id: `req-market-${Date.now()}`,
      clientId: 'usr-buyer',
      clientName: 'Покупатель',
      clientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      clientRating: 5.0,
      hub: activeHub as any,
      district: item.district,
      categoryL1Id: 'cat-market',
      categoryL1Name: 'Маркет',
      title: `Покупка: «${item.title}»`,
      description: `Покупка лота на Маркете. Способ получения: ${deliveryMethod}.`,
      budget: item.price,
      currency: 'USD',
      mediaUrls: [item.image],
      isFeatured: true,
      status: 'in_progress',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
      auctionEndsAt: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
      bidsCount: 1,
    }

    const sellerBid: BidItem = {
      id: `bid-seller-${Date.now()}`,
      requestId: marketDealReq.id,
      providerId: item.sellerId || 'seller-1',
      providerName: item.sellerName || 'Продавец',
      providerAvatar: item.sellerAvatar,
      providerRating: item.sellerRating || 4.9,
      isPro: true,
      isAiAgent: false,
      proposedPrice: item.price,
      currency: 'USD',
      comment: `Здравствуйте! Готов к сделке по «${item.title}». Вариант получения: ${deliveryMethod}.`,
      status: 'accepted',
      createdAt: new Date().toISOString(),
    }

    setActiveDealRequest(marketDealReq)
    setActiveDealBid(sellerBid)
    setSelectedMarketProduct(null)
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

    let targetReq = requests.find((r) => r.id === requestId)
    if (!targetReq && selectedRequestForBid) {
      targetReq = selectedRequestForBid
    }

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
      {/* Background Glow Sprites */}
      <div className={`fixed top-[-5%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none z-0 transition-colors duration-1000 ${
        mode === 'services' ? 'bg-[#00F2FE]/15' : 'bg-[#CCFF00]/10'
      }`} />
      <div className={`fixed top-[-5%] right-[-15%] w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none z-0 transition-colors duration-1000 ${
        mode === 'services' ? 'bg-[#00F2FE]/30' : 'bg-[#CCFF00]/30'
      }`} />
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-[#050811]/90 to-[#000000] pointer-events-none z-0" />

      {/* 3-Second Onboarding Splash Screen */}
      <SplashScreen isVisible={showSplash} onFinish={() => setShowSplash(false)} />

      {/* Main Full-Width Application Container */}
      <div className="relative flex min-h-[100dvh] w-full flex-col overflow-x-hidden bg-transparent z-10">
        {/* Header */}
        <Navbar
          onOpenQuickRequest={() => setIsAIAssistantOpen(true)}
          onLocationChange={(hub, district) => {
            handleSelectHub(hub)
            // If you want to store district globally you can add it to state too
          }}
          activeAuctionsCount={requests.filter(r => r.status === 'open').length}
          totalBidsCount={requests.reduce((acc, r) => acc + r.bidsCount, 0)}
          userRole="client"
          mode={mode}
          session={session}
        />

        {(activeTab === 'home' || activeTab === 'market') && (
          <PillSwitcher mode={mode} onModeChange={handleModeChange} />
        )}

        {/* Notification Toast */}
        {notificationMsg && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-[#00F2FE] text-[#050811] font-black text-xs shadow-[0_0_25px_rgba(0,242,254,0.6)] flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-[#050811]" />
            <span>{notificationMsg}</span>
          </div>
        )}

        {/* Main Content Area */}
        <main className="w-full px-4 py-2 flex-1 space-y-4 relative z-10 pb-32">
          {mode === 'services' && (activeTab === 'home' || activeTab === 'market') && (
            <MockupAuctionSection
              activeHub={activeHub}
              onSelectHub={handleSelectHub}
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
              onOpenBidModal={(req) => setSelectedRequestForBid(req)}
              onOpenQuickRequest={() => setIsAIAssistantOpen(true)}
              requests={requests}
            />
          )}

          {mode === 'market' && (activeTab === 'home' || activeTab === 'market') && (
            <MarketSection
              activeCategory={activeCategory}
              products={marketProducts.length > 0 ? marketProducts : undefined}
              onSelectCategory={setActiveCategory}
              onOpenQuickRequest={() => setIsAIAssistantOpen(true)}
              onSelectProduct={(product) => setSelectedMarketProduct(product)}
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

        <AIAssistantModal
          isOpen={isAIAssistantOpen}
          onClose={() => setIsAIAssistantOpen(false)}
          currentHub={activeHub}
          currentDistrict="Равай" // Fallback district, could be dynamic
          onPublish={handleCreateRequest}
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

        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onSuccess={() => {
            setIsAuthOpen(false)
            setNotificationMsg('✅ Авторизация успешна!')
            setTimeout(() => setNotificationMsg(null), 3000)
          }}
        />

        <CreateMarketListingModal
          isOpen={isCreateMarketListingOpen}
          onClose={() => setIsCreateMarketListingOpen(false)}
          currentHub={activeHub as any}
          onCreateListing={handleCreateMarketListing}
        />

        <MarketBuyModal
          isOpen={Boolean(selectedMarketProduct)}
          item={selectedMarketProduct}
          onClose={() => setSelectedMarketProduct(null)}
          onContactSeller={handleContactSeller}
        />

        {/* Bottom Tab Bar */}
        <BottomNav
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          mode={mode}
          onCentralAction={() => {
            if (mode === 'services') {
              setIsCreateOpen(true)
            } else {
              triggerHapticFeedback('heavy')
              setIsCreateMarketListingOpen(true)
            }
          }}
        />

      </div>
    </div>
  )
}

export default App
