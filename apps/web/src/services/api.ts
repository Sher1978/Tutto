import { supabase, isSupabaseConfigured } from '../lib/supabase'

export interface DbRequest {
  id: string
  client_id: string
  category_l1_id?: string
  hub: string
  district: string
  title: string
  description: string
  media_urls?: string[]
  budget: number | null
  currency: string
  is_featured?: boolean
  status: 'open' | 'in_progress' | 'completed' | 'cancelled' | 'expired'
  auction_duration_minutes: number
  auction_ends_at?: string
  created_at: string
}

export interface DbBid {
  id: string
  request_id: string
  provider_id: string
  proposed_price: number
  currency: string
  comment: string
  bid_type: 'manual' | 'ai_agent'
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
  created_at: string
}

export interface DbDeal {
  id: string
  request_id: string
  bid_id: string
  client_id: string
  provider_id: string
  status: 'in_progress' | 'completed' | 'disputed' | 'cancelled'
  agreed_price: number
  currency: string
  created_at: string
}

export interface DbChatMessage {
  id: string
  deal_id: string
  sender_id: string
  sender_role: 'client' | 'provider' | 'system'
  content: string
  created_at: string
}

/**
 * Subscribe to realtime bid additions for a specific request.
 */
export const subscribeToRequestBids = (
  requestId: string,
  onNewBid: (bid: DbBid) => void
) => {
  if (!isSupabaseConfigured()) {
    console.warn('[Realtime] Supabase credentials not set, subscription in mock mode.')
    return () => {}
  }

  const channel = supabase
    .channel(`request_bids_${requestId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'bids',
        filter: `request_id=eq.${requestId}`,
      },
      (payload) => {
        console.log('⚡ New Realtime Bid received:', payload.new)
        onNewBid(payload.new as DbBid)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

/**
 * Subscribe to new request auctions in a hub for providers.
 */
export const subscribeToHubRequests = (
  hub: string,
  onNewRequest: (request: DbRequest) => void
) => {
  if (!isSupabaseConfigured()) {
    return () => {}
  }

  const channel = supabase
    .channel(`hub_requests_${hub.toLowerCase()}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'requests',
        filter: `hub=eq.${hub.toLowerCase()}`,
      },
      (payload) => {
        console.log('📣 New Realtime Hub Request:', payload.new)
        onNewRequest(payload.new as DbRequest)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

/**
 * Fetch active requests for a hub
 */
export async function fetchRequests(hub: string): Promise<DbRequest[]> {
  if (!isSupabaseConfigured()) {
    return []
  }

  const { data, error } = await supabase
    .from('requests')
    .select('*')
    .eq('hub', hub.toLowerCase())
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching requests from Supabase:', error)
    return []
  }

  return data || []
}

/**
 * Create a new request auction
 */
export async function createRequest(payload: Omit<DbRequest, 'id' | 'created_at' | 'status'>): Promise<DbRequest | null> {
  if (!isSupabaseConfigured()) {
    console.log('[Database] Mock request creation executed:', payload)
    return null
  }

  const { data, error } = await supabase
    .from('requests')
    .insert([{ ...payload, status: 'open' }])
    .select()
    .single()

  if (error) {
    console.error('Error creating request in Supabase:', error)
    throw error
  }

  return data
}
