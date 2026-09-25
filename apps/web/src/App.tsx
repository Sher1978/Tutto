import React, { useState, useEffect } from 'react'
import { Navbar } from './components/Navbar'
import { RequestCard } from './components/RequestCard'
import { CreateRequestModal } from './components/CreateRequestModal'
import { BidModal } from './components/BidModal'
import { BusinessProfileView } from './components/BusinessProfileView'
import { DealChatModal } from './components/DealChatModal'
import { BottomNav, TabId } from './components/BottomNav'
import { MOCK_REQUESTS } from './data/mockData'
import { RequestItem, BidItem } from './types'
import { initTelegramApp, triggerHapticFeedback } from './lib/telegram'
import { Sparkles, CheckCircle2 } from 'lucide-react'

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

  const hubsList = [
    { id: 'bali', label: '🌴 BALI' },
    { id: 'phuket', label: 'PHUKET' },
    { id: 'bangkok', label: 'BANGKOK' },
    { id: 'seoul', label: 'SEOUL' },
    { id: 'tokyo', label: 'TOKYO' },
  ]

  const categoryTiles = [
    { id: 'resorts', label: 'RESORTS', icon: '🌴', styleClass: 'cat-tile-resorts' },
    { id: 'tours', label: 'TOURS', icon: '✈️', styleClass: 'cat-tile-tours' },
    { id: 'experiences', label: 'EXPERIENCES', icon: '🥂', styleClass: 'cat-tile-experiences' },
    { id: 'yachts', label: 'YACHTS', icon: '⛵', styleClass: 'cat-tile-yachts' },
    { id: 'stay', label: 'STAY!', icon: '🏎️', styleClass: 'cat-tile-stay' },
  ]

  return (
    <div className="min-h-screen text-white flex flex-col font-sans pb-24">
      {/* 1. Header (Centered Logo + Profile Status Bar 1:1 Mockup) */}
      <Navbar />

      {/* Notification Toast */}
      {notificationMsg && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#00F2FE] to-[#00FF87] text-[#060911] font-black text-xs shadow-[0_0_30px_rgba(0,255,135,0.6)] flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-black" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-xl w-full mx-auto px-4 py-2 flex-1 space-y-5">
        {activeTab === 'home' && (
          <>
            {/* 2. ASIAN HUBS (1:1 Mockup Text Tabs) */}
            <div className="space-y-2">
              <h2 className="text-xs uppercase tracking-widest font-black text-gray-300 font-display">
                ASIAN HUBS
              </h2>
              <div className="flex items-center justify-between overflow-x-auto pb-1 scrollbar-none gap-3">
                {hubsList.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => handleSelectHub(h.id)}
                    className={`text-xs font-black uppercase tracking-wider transition-all py-1 shrink-0 ${
                      activeHub === h.id
                        ? 'text-[#00FF87] border-b-2 border-[#00FF87] glow-green'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {h.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. 3D GLOSSY CATEGORY TILES (1:1 Mockup 5-Column Tiles) */}
            <div className="grid grid-cols-5 gap-2.5">
              {categoryTiles.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id === activeCategory ? null : cat.id)}
                  className={`p-2.5 rounded-2xl flex flex-col items-center justify-center text-center transition-all ${cat.styleClass} ${
                    activeCategory === cat.id ? 'scale-105 shadow-[0_0_25px_rgba(0,242,254,0.5)]' : ''
                  }`}
                >
                  <span className="text-2xl mb-1 drop-shadow-md">{cat.icon}</span>
                  <span className="text-[9px] font-black uppercase tracking-wider text-white font-display">
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>

            {/* 4. LIVE REVERSE AUCTIONS (1:1 Mockup Card Grid) */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <h2 className="text-xs uppercase tracking-widest font-black text-white font-display flex items-center gap-1.5">
                  <span>LIVE REVERSE AUCTIONS</span>
                  <span className="w-2 h-2 rounded-full bg-[#00FF87] animate-ping" />
                </h2>
                <span className="text-[10px] text-[#00FF87] font-bold flex items-center gap-1 glow-green">
                  <Sparkles className="w-3 h-3" /> Live Feed
                </span>
              </div>

              {/* Render Pristine Auction Cards */}
              <div className="space-y-4">
                {requests.map((req) => (
                  <RequestCard
                    key={req.id}
                    request={req}
                    onOpenDetails={() => setSelectedRequestForBid(req)}
                    onQuickBid={() => setSelectedRequestForBid(req)}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'explore' && (
          <div className="mockup-card-main p-6 text-center border-white/15 my-4">
            <h3 className="font-display font-extrabold text-base text-white">Explore All Auctions</h3>
            <p className="text-xs text-gray-400 mt-1">Browse all available reverse auctions in South East Asia</p>
          </div>
        )}

        {activeTab === 'my-bids' && (
          <div className="mockup-card-main p-6 text-center border-white/15 my-4">
            <h3 className="font-display font-extrabold text-base text-white">My Bids & Auctions</h3>
            <p className="text-xs text-gray-400 mt-1">Track your active bids and incoming offers</p>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="mockup-card-main p-6 text-center border-white/15 my-4">
            <h3 className="font-display font-extrabold text-base text-white">In-App Messages</h3>
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

      {/* 5. Bottom Navigation (1:1 Mockup) */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />
    </div>
  )
}

export default App
