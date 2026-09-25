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
import { BottomNav, TabId } from './components/BottomNav'
import { MOCK_REQUESTS, SERVICE_TEMPLATES } from './data/mockData'
import { RequestItem, BidItem, ServiceTemplate } from './types'
import { initTelegramApp, triggerHapticFeedback } from './lib/telegram'
import { CheckCircle2, Zap } from 'lucide-react'

export function App() {
  const [activeHub, setActiveHub] = useState<string>('bali')
  const [activeTab, setActiveTab] = useState<TabId>('home')
  const [activeCategory, setActiveCategory] = useState<string | null>('resorts')

  const [requests, setRequests] = useState<RequestItem[]>([
    {
      id: 'req-bike',
      clientId: 'usr-kaitlyn',
      clientName: 'Kaitlyn L.',
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
      clientName: 'Kaitlyn L.',
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
      clientName: 'Kaitlyn L.',
      clientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      clientRating: 4.95,
      hub: 'bali',
      district: 'Вилла / Отель',
      categoryL1Id: 'cat-realestate',
      categoryL1Name: 'Жильё',
      title: 'АРЕНДА ПОСУТОЧНО',
      description: 'Посуточная аренда виллы с бассейноим.',
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
      clientName: 'Kaitlyn L.',
      clientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      clientRating: 4.9,
      hub: 'bali',
      district: 'Апартаменты / Вилла',
      categoryL1Id: 'cat-realestate',
      categoryL1Name: 'Жильё',
      title: 'АРЕНДА ДОЛГОСРОК',
      description: 'Долгосрочная аренда апартаментов или виллы.',
      budget: 1800,
      currency: 'USD',
      mediaUrls: ['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600'],
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
      clientName: 'Kaitlyn L.',
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

  const [notificationMsg, setNotificationMsg] = useState<string | null>(null)

  useEffect(() => {
    initTelegramApp()
  }, [])

  const handleSelectHub = (hub: string) => {
    setActiveHub(hub)
    triggerHapticFeedback('light')
  }

  const handleCreateRequest = (newReq: Partial<RequestItem>) => {
    const createdItem: RequestItem = {
      id: `req-${Date.now()}`,
      clientId: 'usr-current',
      clientName: 'Kaitlyn L.',
      clientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      clientRating: 5.0,
      hub: (newReq.hub as any) || activeHub,
      district: newReq.district || 'Jimbaran',
      categoryL1Id: newReq.categoryL1Id || 'cat-realestate',
      categoryL1Name: newReq.categoryL1Name || 'Resorts',
      title: newReq.title || 'Special Villa Request',
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
    setNotificationMsg('🎉 Request published to live auction!')
    setTimeout(() => setNotificationMsg(null), 4000)
  }

  const handleSubmitBid = (requestId: string, price: number, comment: string) => {
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
        comment: comment || 'Villa is ready for immediate booking!',
        status: 'accepted',
        createdAt: new Date().toISOString(),
      }

      setActiveDealRequest(targetReq)
      setActiveDealBid(mockBid)
    }

    setNotificationMsg(`✅ Offer accepted! In-app deal chat opened.`)
    setTimeout(() => setNotificationMsg(null), 4000)
  }

  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col items-center justify-center font-sans sm:py-6 selection:bg-[#00F2FE] selection:text-black">
      {/* Smartphone Shell Container for Pixel-Perfect Mockup Presentation */}
      <div className="w-full max-w-[390px] min-h-screen sm:min-h-[840px] bg-transparent sm:rounded-[44px] sm:border-[8px] sm:border-[#1c2433] sm:shadow-[0_30px_90px_rgba(0,0,0,0.95)] flex flex-col relative overflow-hidden">
        {/* А. System Status Bar & Header (1:1 Mockup Spec) */}
        <Navbar />

        {/* Notification Toast */}
        {notificationMsg && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-cyan-400 text-black font-black text-xs shadow-[0_0_25px_rgba(0,242,254,0.6)] flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-black" />
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
              <h3 className="font-bold text-base text-white">Explore All Auctions</h3>
              <p className="text-xs text-gray-400 mt-1">Browse all available reverse auctions in South East Asia</p>
            </div>
          )}

          {activeTab === 'my-bids' && (
            <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-center my-4">
              <h3 className="font-bold text-base text-white">My Bids & Auctions</h3>
              <p className="text-xs text-gray-400 mt-1">Track your active bids and incoming offers</p>
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-center my-4">
              <h3 className="font-bold text-base text-white">In-App Messages</h3>
              <p className="text-xs text-gray-400 mt-1">Realtime conversation with clients and service providers</p>
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
            setNotificationMsg('🎉 Deal completed! Review window opened.')
            setTimeout(() => setNotificationMsg(null), 4000)
          }}
        />

        {/* Д. Bottom Tab Bar (1:1 Mockup Spec) */}
        <BottomNav
          activeTab={activeTab}
          onSelectTab={setActiveTab}
        />
      </div>
    </div>
  )
}

export default App

