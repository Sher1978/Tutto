export type Language = 'ru' | 'en' | 'th' | 'zh'

export interface LanguageOption {
  code: Language
  label: string
  flag: string
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'th', label: 'ไทย', flag: '🇹🇭' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
]

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  ru: {
    // Top Nav & Brand
    app_title: 'TUTTO MINUTTO',
    app_slogan: 'ОБРАТНЫЙ АУКЦИОН УСЛУГ',
    wallet_title: 'Мой Кошелёк',
    
    // Bottom Nav Tabs
    tab_home: 'ГЛАВНАЯ',
    tab_my_bids: 'ОТКЛИКИ',
    tab_chat: 'ЧАТ',
    tab_account: 'КАБИНЕТ',
    tab_market: 'МАРКЕТ',
    tab_explore: 'ПОИСК',
    tab_mine: 'МОЁ',

    // Mode Switcher
    mode_services: '🛠 УСЛУГИ И АРЕНДА',
    mode_market: '🔥 FLASH MARKET',

    // Actions & Buttons
    btn_create_request: 'СОЗДАТЬ ЗАЯВКУ',
    btn_respond: 'Откликнуться',
    btn_buy_now: 'Купить сейчас',
    btn_close: 'Закрыть',
    btn_cancel: 'Отмена',
    btn_confirm: 'Подтвердить',
    btn_search: 'Поиск',
    btn_reset: 'Сбросить',
    btn_apply_promo: 'Активировать',
    
    // Feed & Headers
    header_active_requests: 'АКТИВНЫЕ ЗАПРОСЫ В ХАБЕ',
    header_flash_market: 'ГОРЯЩИЕ ТОВАРЫ & ЛОТЫ',
    header_search_explore: 'Поиск скутера, виллы, обмена...',
    header_quick_templates: 'Шаблоны в 1 клик',
    header_my_deals: 'Мои Сделки & Объявления',

    // Categories
    cat_transport: 'Прокат & Байки',
    cat_housing: 'Жильё & Виллы',
    cat_finance: 'Обмен валют',
    cat_services: 'Визы & Юристы',
    cat_food: 'Еда & Доставка',
    cat_cleaning: 'Клининг',
    cat_beauty: 'СПА & Массаж',

    // Badges & Labels
    badge_urgent: 'МИНУТ',
    badge_ai_bids: 'Откликов ИИ',
    badge_budget: 'Бюджет',
    badge_discount: 'Скидка',
  },

  en: {
    // Top Nav & Brand
    app_title: 'TUTTO MINUTTO',
    app_slogan: 'REVERSE SERVICE AUCTION',
    wallet_title: 'My Wallet',
    
    // Bottom Nav Tabs
    tab_home: 'HOME',
    tab_my_bids: 'MY BIDS',
    tab_chat: 'CHAT',
    tab_account: 'PROFILE',
    tab_market: 'MARKET',
    tab_explore: 'SEARCH',
    tab_mine: 'MY ITEMS',

    // Mode Switcher
    mode_services: '🛠 SERVICES & RENTALS',
    mode_market: '🔥 FLASH MARKET',

    // Actions & Buttons
    btn_create_request: 'CREATE REQUEST',
    btn_respond: 'Submit Bid',
    btn_buy_now: 'Buy Now',
    btn_close: 'Close',
    btn_cancel: 'Cancel',
    btn_confirm: 'Confirm',
    btn_search: 'Search',
    btn_reset: 'Reset',
    btn_apply_promo: 'Activate',
    
    // Feed & Headers
    header_active_requests: 'ACTIVE HUB AUCTIONS',
    header_flash_market: 'HOT DEALS & ITEMS',
    header_search_explore: 'Search bikes, villas, currency...',
    header_quick_templates: '1-Click Quick Templates',
    header_my_deals: 'My Deals & Listings',

    // Categories
    cat_transport: 'Rentals & Bikes',
    cat_housing: 'Housing & Villas',
    cat_finance: 'Currency Exchange',
    cat_services: 'Visas & Legal',
    cat_food: 'Food & Delivery',
    cat_cleaning: 'Cleaning',
    cat_beauty: 'SPA & Massage',

    // Badges & Labels
    badge_urgent: 'MIN',
    badge_ai_bids: 'AI Responses',
    badge_budget: 'Budget',
    badge_discount: 'Discount',
  },

  th: {
    // Top Nav & Brand
    app_title: 'TUTTO MINUTTO',
    app_slogan: 'การประมูลบริการย้อนกลับ',
    wallet_title: 'กระเป๋าเงินของฉัน',
    
    // Bottom Nav Tabs
    tab_home: 'หน้าแรก',
    tab_my_bids: 'ข้อเสนอ',
    tab_chat: 'แชท',
    tab_account: 'โปรไฟล์',
    tab_market: 'ตลาด',
    tab_explore: 'ค้นหา',
    tab_mine: 'รายการของฉัน',

    // Mode Switcher
    mode_services: '🛠 บริการและเช่า',
    mode_market: '🔥 ตลาดด่วน',

    // Actions & Buttons
    btn_create_request: 'สร้างคำขอ',
    btn_respond: 'เสนอราคา',
    btn_buy_now: 'ซื้อทันที',
    btn_close: 'ปิด',
    btn_cancel: 'ยกเลิก',
    btn_confirm: 'ยืนยัน',
    btn_search: 'ค้นหา',
    btn_reset: 'รีเซ็ต',
    btn_apply_promo: 'เปิดใช้งาน',
    
    // Feed & Headers
    header_active_requests: 'การประมูลที่เปิดอยู่',
    header_flash_market: 'สินค้าและข้อเสนอดีๆ',
    header_search_explore: 'ค้นหา มอเตอร์ไซค์ พูลวิลล่า แลกเงิน...',
    header_quick_templates: 'แม่แบบสร้างด่วนใน 1 คลิก',
    header_my_deals: 'ข้อตกลงและรายการของฉัน',

    // Categories
    cat_transport: 'เช่ารถและมอเตอร์ไซค์',
    cat_housing: 'ที่พักและวิลล่า',
    cat_finance: 'แลกเปลี่ยนเงินตรา',
    cat_services: 'วีซ่าและกฎหมาย',
    cat_food: 'อาหารและการจัดส่ง',
    cat_cleaning: 'ทำความสะอาด',
    cat_beauty: 'สปาและนวด',

    // Badges & Labels
    badge_urgent: 'นาที',
    badge_ai_bids: 'การตอบกลับ AI',
    badge_budget: 'งบประมาณ',
    badge_discount: 'ส่วนลด',
  },

  zh: {
    // Top Nav & Brand
    app_title: 'TUTTO MINUTTO',
    app_slogan: '服务反向拍卖平台',
    wallet_title: '我的钱包',
    
    // Bottom Nav Tabs
    tab_home: '首页',
    tab_my_bids: '竞价',
    tab_chat: '聊天',
    tab_account: '个人中心',
    tab_market: '闪购集市',
    tab_explore: '探索搜索',
    tab_mine: '我的商品',

    // Mode Switcher
    mode_services: '🛠 服务与租赁',
    mode_market: '🔥 闪购集市',

    // Actions & Buttons
    btn_create_request: '发布需求',
    btn_respond: '参与竞价',
    btn_buy_now: '立即购买',
    btn_close: '关闭',
    btn_cancel: '取消',
    btn_confirm: '确认',
    btn_search: '搜索',
    btn_reset: '重置',
    btn_apply_promo: '激活',
    
    // Feed & Headers
    header_active_requests: '进行中的服务拍卖',
    header_flash_market: '热门折扣商品',
    header_search_explore: '搜索摩托车、别墅、换汇...',
    header_quick_templates: '一键快捷模板',
    header_my_deals: '我的交易与列表',

    // Categories
    cat_transport: '车辆租赁',
    cat_housing: '房屋别墅',
    cat_finance: '货币兑换',
    cat_services: '签证法律',
    cat_food: '美食外卖',
    cat_cleaning: '保洁家政',
    cat_beauty: '水疗按摩',

    // Badges & Labels
    badge_urgent: '分钟',
    badge_ai_bids: 'AI自动回复',
    badge_budget: '预算',
    badge_discount: '折扣',
  },
}

export function detectDefaultLanguage(): Language {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('app_language') as Language
    if (saved && TRANSLATIONS[saved]) {
      return saved
    }
  }
  return 'ru'
}

export function setSavedLanguage(lang: Language) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('app_language', lang)
  }
}

export function t(lang: Language, key: string): string {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS['ru']
  return dict[key] || TRANSLATIONS['ru'][key] || key
}
