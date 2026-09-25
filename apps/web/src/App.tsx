import React, { useState, useEffect } from 'react'
import { Navbar } from './components/Navbar'
import { MockupAuctionSection } from './components/MockupAuctionSection'
import { RequestCard } from './components/RequestCard'
import { TemplateCard } from './components/TemplateCard'
import { CreateRequestModal } from './components/CreateRequestModal'
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
      id: 'req-ayana',
      clientId: 'usr-kaitlyn',
      clientName: 'Kaitlyn L.',
      clientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      clientRating: 4.9,
      hub: 'bali',
      district: 'Jimbaran',
      categoryL1Id: 'cat-realestate',
      categoryL1Name: 'Resorts & Villas',
      title: 'AYANA Resort - Ocean View Suite',
      description: 'Luxury 5★ Resort Villa, private pool, ocean sunset view, breakfast included.',
      budget: 345,
      currency: 'USD',
      mediaUrls: ['https://images.unsplash.com/photo-1613977257363-707ba9348227?w=600'],
      isFeatured: true,
      status: 'open',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
      auctionEndsAt: new Date(Date.now() + 4 * 60 * 1000 + 18 * 1000).toISOString(),
      bidsCount: 12,
    },
    ...MOCK_REQUESTS,
  ])

  const [isCreateOpen, setIsCreateOpen] = useState(false)
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

  const handleCreateRequestFromTemplate = (template: ServiceTemplate) => {
    const createdItem: RequestItem = {
      id: `req-tpl-${Date.now()}`,
      clientId: 'usr-current',
      clientName: 'Kaitlyn L.',
      clientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      clientRating: 5.0,
      hub: activeHub as any,
      district: 'Central Hub',
      categoryL1Id: template.categoryL1Id,
      categoryL1Name: 'Services',
      title: template.title,
      description: template.description,
      budget: template.defaultBudget ?? 345,
      currency: 'USD',
      mediaUrls: [template.coverImageUrl],
      isFeatured: false,
      status: 'open',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
      auctionEndsAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      bidsCount: 1,
    }

    setRequests([createdItem, ...requests])
    setNotificationMsg(`⚡ Заявка "${template.title}" создана в 1-клик!`)
    setTimeout(() => setNotificationMsg(null), 4000)
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

  const [showTemplatesCatalog, setShowTemplatesCatalog] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a111a] via-[#101926] to-[#05090f] text-white flex flex-col font-sans pb-20">
      {/* Mobile Frame Centering Container (iPhone 390px calculation) */}
      <div className="max-w-[420px] w-full mx-auto flex flex-col flex-1">
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
            <>
              {/* В & Г. Asian Hubs & Live Reverse Auctions (1:1 Mockup Spec) */}
              <MockupAuctionSection
                activeHub={activeHub}
                onSelectHub={handleSelectHub}
                activeCategory={activeCategory}
                onSelectCategory={setActiveCategory}
                onOpenBidModal={(req) => setSelectedRequestForBid(req)}
                requests={requests}
              />

              {/* Optional Collapsible 1-Click Templates & Extra Requests */}
              <div className="pt-2 text-center">
                <button
                  onClick={() => setShowTemplatesCatalog(!showTemplatesCatalog)}
                  className="text-[10px] font-extrabold text-cyan-400/80 hover:text-cyan-400 py-1.5 px-3.5 rounded-full bg-cyan-950/30 border border-cyan-500/20 transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Zap className="w-3 h-3 text-cyan-400" />
                  <span>{showTemplatesCatalog ? '▲ Скрыть шаблоны' : '⚡ 1-Click Шаблоны услуг (Развернуть)'}</span>
                </button>
              </div>

              {showTemplatesCatalog && (
                <div className="space-y-3 pt-3 border-t border-white/5 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[11px] font-bold text-gray-400 tracking-widest uppercase flex items-center gap-1.5">
                      <span>КАТАЛОГ ШАБЛОНОВ (1-CLICK LAUNCH)</span>
                    </h3>
                    <button
                      onClick={() => setIsCreateOpen(true)}
                      className="text-[10px] font-bold text-cyan-400 hover:underline cursor-pointer"
                    >
                      + Своя заявка
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {SERVICE_TEMPLATES.map((tpl) => (
                      <TemplateCard
                        key={tpl.id}
                        template={tpl}
                        onLaunchTemplate={handleCreateRequestFromTemplate}
                        onSaveTemplate={() => {
                          setNotificationMsg(`📌 Шаблон "${tpl.title}" сохранен!`)
                          setTimeout(() => setNotificationMsg(null), 3000)
                        }}
                      />
                    ))}
                  </div>

                  {/* Additional Live Feed Cards */}
                  <div className="space-y-3 pt-2">
                    <h3 className="text-[11px] font-bold text-gray-400 tracking-widest uppercase">
                      ВСЕ АКТИВНЫЕ ЗАЯВКИ ПОКУПАТЕЛЕЙ
                    </h3>
                    {requests.slice(1).map((req) => (
                      <RequestCard
                        key={req.id}
                        request={req}
                        onOpenDetails={() => setSelectedRequestForBid(req)}
                        onQuickBid={() => setSelectedRequestForBid(req)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
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

