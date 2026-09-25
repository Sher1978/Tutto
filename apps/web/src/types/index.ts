export type HubId = 'phuket' | 'bali' | 'bangkok' | 'vietnam'

export interface HubLocation {
  id: HubId
  nameRu: string
  nameEn: string
  flag: string
  districts: string[]
}

export interface Category {
  id: string
  slug: string
  titleRu: string
  titleEn: string
  iconName: string
  description?: string
}

export interface RequestItem {
  id: string
  clientId: string
  clientName: string
  clientAvatar?: string
  clientRating: number
  hub: HubId
  district: string
  categoryL1Id: string
  categoryL1Name: string
  title: string
  description: string
  budget: number | null // null = "Waiting for offers"
  currency: string
  mediaUrls: string[]
  isFeatured: boolean
  status: 'open' | 'in_progress' | 'completed' | 'cancelled' | 'expired'
  createdAt: string
  expiresAt: string
  auctionEndsAt: string
  bidsCount: number
}

export interface BidItem {
  id: string
  requestId: string
  providerId: string
  providerName: string
  providerAvatar?: string
  providerRating: number
  isPro: boolean
  isAiAgent: boolean
  proposedPrice: number
  currency: string
  comment: string
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
  createdAt: string
}

export interface UserProfile {
  id: string
  telegramId: number
  username?: string
  firstName: string
  lastName?: string
  photoUrl?: string
  role: 'client' | 'provider' | 'both'
  rating: number
  dealsCount: number
  hubLocation: HubId
  lang: 'ru' | 'en'
  referralCode?: string
}

export interface BusinessCard {
  id: string
  companyName: string
  tagline: string
  description: string
  logoUrl?: string
  coverPhotoUrl?: string
  rating: number
  dealsCount: number
  isPro: boolean
  isAiEnabled: boolean
  servicesList: { name: string; price: number; unit?: string }[]
  advantages: string[]
  coverageArea: string
  workingHours: string
  socialLinks: string[]
}
