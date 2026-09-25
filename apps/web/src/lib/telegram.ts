import WebApp from '@twa-dev/sdk'

export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  photo_url?: string
}

export const isTelegramEnvironment = (): boolean => {
  return typeof window !== 'undefined' && Boolean(WebApp?.initData)
}

export const getTelegramUser = (): TelegramUser | null => {
  if (isTelegramEnvironment() && WebApp.initDataUnsafe?.user) {
    return WebApp.initDataUnsafe.user as TelegramUser
  }
  // Mock User for Dev & Regular Browser Preview
  return {
    id: 999123456,
    first_name: 'Александр',
    last_name: 'Иванов',
    username: 'alex_phuket',
    language_code: 'ru',
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  }
}

export const getTelegramInitData = (): string => {
  if (isTelegramEnvironment()) {
    return WebApp.initData
  }
  return 'mock_init_data_for_web_dev'
}

export const triggerHapticFeedback = (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
  if (isTelegramEnvironment() && WebApp.HapticFeedback) {
    WebApp.HapticFeedback.impactOccurred(style)
  }
}

export const triggerNotificationFeedback = (type: 'error' | 'success' | 'warning') => {
  if (isTelegramEnvironment() && WebApp.HapticFeedback) {
    WebApp.HapticFeedback.notificationOccurred(type)
  }
}

export const openTelegramLink = (url: string) => {
  if (isTelegramEnvironment() && WebApp.openTelegramLink) {
    WebApp.openTelegramLink(url)
  } else {
    window.open(url, '_blank')
  }
}

export const initTelegramApp = () => {
  if (isTelegramEnvironment()) {
    WebApp.ready()
    WebApp.expand()
    WebApp.enableClosingConfirmation()
    // Match theme colors
    WebApp.setHeaderColor('#0B0F19')
    WebApp.setBackgroundColor('#0B0F19')
  }
}
