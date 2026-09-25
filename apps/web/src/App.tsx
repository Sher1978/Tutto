import React, { useState, useEffect } from 'react'
import { Navbar } from './components/Navbar'
import { RequestCard } from './components/RequestCard'
import { CreateRequestModal } from './components/CreateRequestModal'
import { BidModal } from './components/BidModal'
import { BusinessProfileView } from './components/BusinessProfileView'
import { BottomNav, TabId } from './components/BottomNav'
import { HUBS, CATEGORIES, MOCK_REQUESTS } from './data/mockData'
import { HubId, RequestItem } from './types'
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
      clientName: 'Александр И.',
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
    setNotificationMsg('🎉 Заявка опубликована в аукцион!')
    setTimeout(() => setNotificationMsg(null), 4000)
  }

  const handleSubmitBid = (requestId: string, price: number, comment: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, bidsCount: r.bidsCount + 1 } : r))
    )
    setNotificationMsg(`✅ Ваш оффер $${price} успешно отправлен клиенту!`)
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
    <div className="min-h-screen bg-slate-950 text-gray-100 flex flex-col font-sans pb-20">
      {/* Top Navbar */}
      <Navbar
        currentHub={currentHub}
        onSelectHub={handleSelectHub}
        onOpenBusinessProfile={() => setActiveTab('business')}
      />

      {/* Notification Toast */}
      {notificationMsg && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-cyan-500 text-black font-extrabold text-xs shadow-xl shadow-cyan-500/30 flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-black" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-4xl w-full mx-auto px-4 py-4 flex-1">
        {activeTab === 'feed' && (
          <div className="space-y-4">
            {/* Search Bar & Filter */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Поиск по услугам, районам..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:border-cyan-400 outline-none transition-colors"
                />
              </div>
            </div>

            {/* Category Horizontal Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
                  selectedCategory === null
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-black font-extrabold'
                    : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                }`}
              >
                Все категории
              </button>

              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-black font-extrabold'
                      : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {cat.titleRu}
                </button>
              ))}
            </div>

            {/* Feed Header info */}
            <div className="flex items-center justify-between text-xs text-gray-400 font-medium pt-1">
              <span>
                Активные обратные аукционы ({filteredRequests.length})
              </span>
              <span className="text-cyan-400 flex items-center gap-1 font-semibold">
                <Sparkles className="w-3 h-3" /> Realtime Sync
              </span>
            </div>

            {/* Request Cards Feed */}
            {filteredRequests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="glass-panel p-8 rounded-3xl text-center border-dashed border-white/10 my-8">
                <div className="w-12 h-12 rounded-2xl bg-white/5 mx-auto flex items-center justify-center text-gray-400 mb-3">
                  <Filter className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white text-base">Нет активных аукционов</h3>
                <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                  Будьте первым, кто опубликует заказ в выбранном районе или измените фильтры!
                </p>
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="mt-4 px-4 py-2 rounded-xl bg-cyan-400 text-black font-bold text-xs"
                >
                  + Опубликовать заказ
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'business' && <BusinessProfileView />}

        {activeTab === 'my-bids' && (
          <div className="glass-panel p-6 rounded-3xl text-center border-white/10 my-6">
            <h3 className="font-display font-bold text-base text-white">Мои отклики и чаты сделок</h3>
            <p className="text-xs text-gray-400 mt-1">
              Все принятые офферы перенаправляются напрямую в Telegram-чат с клиентом.
            </p>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="glass-panel p-6 rounded-3xl text-center border-white/10 my-6">
            <h3 className="font-display font-bold text-base text-white">Профиль пользователя</h3>
            <p className="text-xs text-gray-400 mt-1">
              Рейтинг: ⭐ 5.0 | Завершено сделок: 12
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

      {/* Bottom Mobile Toolbar */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenCreateModal={() => setIsCreateOpen(true)}
      />
    </div>
  )
}

export default App
