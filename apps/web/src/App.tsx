import React, { useState, useEffect } from 'react'
import { Navbar } from './components/Navbar'
import { RequestCard } from './components/RequestCard'
import { CreateRequestModal } from './components/CreateRequestModal'
import { BidModal } from './components/BidModal'
import { BusinessProfileView } from './components/BusinessProfileView'
import { DealChatModal } from './components/DealChatModal'
import { BottomNav, TabId } from './components/BottomNav'
import { HUBS, CATEGORIES, MOCK_REQUESTS } from './data/mockData'
import { HubId, RequestItem, BidItem } from './types'
import { initTelegramApp, triggerHapticFeedback } from './lib/telegram'
import { Search, Sparkles, Filter, CheckCircle2 } from 'lucide-react'

export function App() {
  const [currentHub, setCurrentHub] = useState<HubId>('phuket')
  const [activeTab, setActiveTab] = useState<TabId>('feed')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const [requests, setRequests] = useState<RequestItem[]>(MOCK_REQUESTS)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedRequestForBid, setSelectedRequestForBid] = useState<RequestItem | null>(null)

  // In-App Deal Chat State
  const [activeDealRequest, setActiveDealRequest] = useState<RequestItem | null>(null)
  const [activeDealBid, setActiveDealBid] = useState<BidItem | null>(null)

  const [notificationMsg, setNotificationMsg] = useState<string | null>(null)

  useEffect(() => {
    initTelegramApp()
  }, [])

  const handleSelectHub = (hub: HubId) => {
    setCurrentHub(hub)
    triggerHapticFeedback('light')
  }

  const handleCreateRequest = (newReq: Partial<RequestItem>) => {
    const createdItem: RequestItem = {
      id: `req-${Date.now()}`,
      clientId: 'usr-current',
      clientName: 'Kaitlyn L.',
      clientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      clientRating: 5.0,
      hub: newReq.hub || currentHub,
      district: newReq.district || 'Rawai',
      categoryL1Id: newReq.categoryL1Id || CATEGORIES[0].id,
      categoryL1Name: newReq.categoryL1Name || CATEGORIES[0].titleRu,
      title: newReq.title || '',
      description: newReq.description || '',
      budget: newReq.budget ?? null,
      currency: newReq.currency || 'USD',
      mediaUrls: [],
      isFeatured: newReq.isFeatured || false,
      status: 'open',
      createdAt: new Date().toISOString(),
      expiresAt: newReq.auctionEndsAt || new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
      auctionEndsAt: newReq.auctionEndsAt || new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
      bidsCount: 0,
    }

    setRequests([createdItem, ...requests])
    setNotificationMsg('🎉 Заявка опубликована в аукцион TuttoMinutto!')
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
        providerName: 'Phuket Ride Express',
        providerAvatar: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=100',
        providerRating: 4.98,
        isPro: true,
        isAiAgent: true,
        proposedPrice: price,
        currency: 'USD',
        comment: comment || 'Байк готов к доставке!',
        status: 'accepted',
        createdAt: new Date().toISOString(),
      }

      setActiveDealRequest(targetReq)
      setActiveDealBid(mockBid)
    }

    setNotificationMsg(`✅ Оффер принят! Открыт внутренний чат сделки.`)
    setTimeout(() => setNotificationMsg(null), 4000)
  }

  const filteredRequests = requests.filter((r) => {
    const matchesHub = r.hub === currentHub
    const matchesCategory = selectedCategory ? r.categoryL1Id === selectedCategory : true
    const matchesSearch = searchQuery
      ? r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true
    return matchesHub && matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen text-white flex flex-col font-sans pb-24">
      {/* Top Navbar Header (Centered Giant Glowing Logo & Status Pill) */}
      <Navbar />

      {/* Notification Toast */}
      {notificationMsg && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#00F2FE] to-[#00FF87] text-[#060911] font-black text-xs shadow-[0_0_30px_rgba(0,255,135,0.6)] flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-black" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-4xl w-full mx-auto px-4 py-3 flex-1 space-y-6">
        {activeTab === 'feed' && (
          <>
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
              <input
                type="text"
                placeholder="Search services, hubs, districts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#121826]/90 border border-white/12 rounded-2xl pl-11 pr-4 py-3 text-xs text-white placeholder-gray-500 focus:border-[#00F2FE] focus:shadow-[0_0_20px_rgba(0,242,254,0.25)] outline-none transition-all"
              />
            </div>

            {/* Section 1: ASIAN HUBS Tab Bar (Match Mockup 1:1) */}
            <div className="space-y-2.5">
              <h2 className="text-xs uppercase tracking-widest font-black text-gray-300 font-display">
                ASIAN HUBS
              </h2>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {HUBS.map((hub) => (
                  <button
                    key={hub.id}
                    onClick={() => handleSelectHub(hub.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider shrink-0 transition-all ${
                      hub.id === currentHub
                        ? 'bg-gradient-to-r from-[#00F2FE] to-[#00FF87] text-[#060911] shadow-[0_0_15px_rgba(0,255,135,0.4)] scale-105'
                        : 'bg-[#121826]/80 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {hub.flag} {hub.id.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Section 2: CATEGORY SQUARES (Match Mockup 1:1) */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
                  className={`category-square-btn p-3 flex flex-col items-center justify-center text-center group ${
                    selectedCategory === cat.id ? 'border-[#00F2FE] shadow-[0_0_20px_rgba(0,242,254,0.4)]' : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#00F2FE]/20 to-[#00FF87]/20 flex items-center justify-center text-xl mb-1.5 border border-white/10 group-hover:scale-110 transition-transform">
                    {cat.slug === 'transport' && '🏍️'}
                    {cat.slug === 'realestate' && '🌴'}
                    {cat.slug === 'tours' && '⛵'}
                    {cat.slug === 'beauty' && '💆'}
                    {cat.slug === 'services' && '🛡️'}
                    {cat.slug === 'exchange' && '💱'}
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-200 line-clamp-1">
                    {cat.slug.toUpperCase()}
                  </span>
                </button>
              ))}
            </div>

            {/* Section 3: LIVE REVERSE AUCTIONS (Match Mockup 1:1) */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h2 className="text-sm uppercase tracking-widest font-black text-white font-display flex items-center gap-2">
                  <span>LIVE REVERSE AUCTIONS</span>
                  <span className="w-2 h-2 rounded-full bg-[#00FF87] animate-ping" />
                </h2>
                <span className="text-xs text-[#00FF87] font-bold flex items-center gap-1 glow-green">
                  <Sparkles className="w-3.5 h-3.5" /> Realtime Feed
                </span>
              </div>

              {/* Auction Feed Grid */}
              {filteredRequests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filteredRequests.map((req) => (
                    <RequestCard
                      key={req.id}
                      request={req}
                      onOpenDetails={() => setSelectedRequestForBid(req)}
                      onQuickBid={() => setSelectedRequestForBid(req)}
                    />
                  ))}
                </div>
              ) : (
                <div className="mockup-card p-8 text-center border-dashed border-white/15 my-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 mx-auto flex items-center justify-center text-gray-400 mb-3">
                    <Filter className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-white text-base">No active auctions in this hub</h3>
                  <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                    Be the first to create a reverse auction request!
                  </p>
                  <button
                    onClick={() => setIsCreateOpen(true)}
                    className="mt-4 mockup-btn-primary px-5 py-2.5 text-xs"
                  >
                    + CREATE AUCTION
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'business' && <BusinessProfileView />}

        {activeTab === 'my-bids' && (
          <div className="space-y-4">
            <div className="mockup-card p-6 border-white/15 flex items-center justify-between">
              <div>
                <h3 className="font-display font-extrabold text-lg text-white">My Deals & Realtime Chats</h3>
                <p className="text-xs text-gray-400 mt-1">Direct in-app communication without leaving the platform</p>
              </div>
              <button
                onClick={() => {
                  setActiveDealRequest(requests[0])
                  setActiveDealBid({
                    id: 'bid-demo',
                    requestId: requests[0].id,
                    providerId: 'biz-1',
                    providerName: 'Phuket Ride Express',
                    providerAvatar: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=100',
                    providerRating: 4.98,
                    isPro: true,
                    isAiAgent: true,
                    proposedPrice: 180,
                    currency: 'USD',
                    comment: 'Байк готов к доставке!',
                    status: 'accepted',
                    createdAt: new Date().toISOString(),
                  })
                }}
                className="mockup-btn-primary px-4 py-2.5 text-xs"
              >
                💬 OPEN DEMO CHAT
              </button>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="mockup-card p-6 text-center border-white/15 my-6">
            <h3 className="font-display font-extrabold text-lg text-white">User Profile</h3>
            <p className="text-xs text-gray-400 mt-1">
              Rating: ⭐ 5.0 | Completed Deals: 12
            </p>
          </div>
        )}
      </main>

      {/* Modals */}
      <CreateRequestModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        currentHub={currentHub}
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
          setNotificationMsg('🎉 Deal confirmed! Review window opened.')
          setTimeout(() => setNotificationMsg(null), 4000)
        }}
      />

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenCreateModal={() => setIsCreateOpen(true)}
      />
    </div>
  )
}

export default App
