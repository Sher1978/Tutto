# 📁 20_FLASH_MARKET_SPEC.md
> **NeedTnow / TuttoMinutto** — Flash Market (Барахолка)  
> Версия: 1.0 | C2C/B2C маркетплейс с мгновенными аукционами  
> Последнее обновление: 2026-09-26

---

## 1. Концепция и JTBD

### 1.1 Назначение

**Flash Market** — встроенный C2C/B2C маркетплейс вещей и товаров для экспат-сообщества в ЮВА. Работает параллельно с основным обратным аукционом услуг, но имеет **отдельный рубрикатор** и **собственную механику торгов**.

### 1.2 Jobs To Be Done

| Роль | Задача (JTBD) | Сценарий |
|---|---|---|
| **Продавец (Seller)** | Быстро продать ненужную вещь при переезде | Экспат уезжает с Бали → выставляет мебель, байк, технику |
| **Покупатель (Buyer)** | Найти товар дешевле нового, рядом | Только приехал на Пхукет → ищет б/у байк, блендер, доску для сёрфа |
| **Платформа** | Увеличить DAU и вовлечённость | Пользователь заходит и на услуги, и на барахолку → retention |

### 1.3 Ключевые отличия от основного аукциона

| Параметр | Аукцион услуг (основной) | Flash Market |
|---|---|---|
| **Предмет** | Услуга | Физический товар |
| **Кто создаёт лот** | Клиент (покупатель) | Продавец |
| **Механика** | Обратный аукцион (цена падает) | Прямой аукцион + Buy Now (цена растёт) |
| **Оплата** | P2P при встрече (услуга) | P2P при встрече (товар) |
| **Комиссия** | Токены за принятый оффер | Бесплатно + платный Featured |
| **Рубрикатор** | `categories_l1/l2/l3` (услуги) | `market_categories` (товары) |

---

## 2. Рубрикатор товаров (market_categories)

### 2.1 Структура

Отдельный 2-уровневый рубрикатор, **не зависящий** от таблиц `categories_l1/l2/l3` (услуги).

```
L1: Мегакатегория товаров (10 категорий)
  └── L2: Подкатегория товаров (для детализации)
```

### 2.2 Список категорий

| # | Slug | Title RU | Title EN | Emoji | Примеры товаров |
|---|---|---|---|---|---|
| 1 | `electronics` | Электроника | Electronics | 📱 | iPhone, MacBook, наушники, камеры |
| 2 | `furniture` | Мебель / Дом | Home & Furniture | 🏠 | Столы, стулья, декор, полки, ковры |
| 3 | `fashion` | Одежда | Fashion | 👕 | Бренд, обувь, сумки, часы |
| 4 | `transport` | Транспорт | Transport | 🚲 | Байки б/у, самокаты, велосипеды |
| 5 | `sports` | Спорт / Сёрф | Sports & Surf | 🏄 | Доски, гантели, коврики, ласты |
| 6 | `kids` | Детские товары | Kids | 👶 | Коляски, игрушки, одежда, автокресла |
| 7 | `books_gaming` | Книги / Гейминг | Books & Gaming | 📚 | PS5, Switch, настолки, комиксы |
| 8 | `kitchen` | Кухня / Быт | Kitchen & Appliances | 🍳 | Блендеры, мультиварки, микроволновки |
| 9 | `music` | Музыка | Music | 🎸 | Гитары, укулеле, клавиши, ударные |
| 10 | `other` | Другое | Other | 📦 | Всё что не вошло в категории |

### 2.3 Seed SQL

```sql
-- ============================================================
-- FLASH MARKET — РУБРИКАТОР ТОВАРОВ (отдельный от услуг)
-- ============================================================

CREATE TABLE market_categories (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug        VARCHAR(64) UNIQUE NOT NULL,
    title_ru    VARCHAR(128) NOT NULL,
    title_en    VARCHAR(128) NOT NULL,
    emoji       VARCHAR(8) NOT NULL,
    icon_name   VARCHAR(64) NOT NULL,
    sort_order  INT DEFAULT 0,
    is_active   BOOLEAN DEFAULT TRUE
);

-- Подкатегории (L2)
CREATE TABLE market_subcategories (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id   UUID REFERENCES market_categories(id) ON DELETE CASCADE NOT NULL,
    slug        VARCHAR(64) UNIQUE NOT NULL,
    title_ru    VARCHAR(128) NOT NULL,
    title_en    VARCHAR(128) NOT NULL,
    sort_order  INT DEFAULT 0,
    is_active   BOOLEAN DEFAULT TRUE
);

-- SEED DATA — L1
INSERT INTO market_categories (slug, title_ru, title_en, emoji, icon_name, sort_order) VALUES
    ('electronics',  'Электроника',   'Electronics',           '📱', 'smartphone',     1),
    ('furniture',    'Мебель / Дом',  'Home & Furniture',      '🏠', 'sofa',           2),
    ('fashion',      'Одежда',        'Fashion',               '👕', 'shirt',          3),
    ('transport',    'Транспорт',     'Transport',             '🚲', 'bike',           4),
    ('sports',       'Спорт / Сёрф',  'Sports & Surf',        '🏄', 'dumbbell',       5),
    ('kids',         'Детские товары', 'Kids',                 '👶', 'baby',           6),
    ('books_gaming', 'Книги / Гейминг','Books & Gaming',      '📚', 'gamepad-2',      7),
    ('kitchen',      'Кухня / Быт',   'Kitchen & Appliances', '🍳', 'cooking-pot',    8),
    ('music',        'Музыка',        'Music',                 '🎸', 'guitar',         9),
    ('other',        'Другое',        'Other',                 '📦', 'package',       10);

-- SEED DATA — L2 (примеры)
INSERT INTO market_subcategories (parent_id, slug, title_ru, title_en, sort_order)
SELECT id, 'phones', 'Телефоны', 'Phones', 1 FROM market_categories WHERE slug = 'electronics'
UNION ALL
SELECT id, 'laptops', 'Ноутбуки', 'Laptops', 2 FROM market_categories WHERE slug = 'electronics'
UNION ALL
SELECT id, 'cameras', 'Камеры / Фото', 'Cameras', 3 FROM market_categories WHERE slug = 'electronics'
UNION ALL
SELECT id, 'audio', 'Аудио / Наушники', 'Audio', 4 FROM market_categories WHERE slug = 'electronics'
UNION ALL
SELECT id, 'accessories_tech', 'Аксессуары', 'Accessories', 5 FROM market_categories WHERE slug = 'electronics';

INSERT INTO market_subcategories (parent_id, slug, title_ru, title_en, sort_order)
SELECT id, 'motorbikes_used', 'Мотобайки б/у', 'Used Motorbikes', 1 FROM market_categories WHERE slug = 'transport'
UNION ALL
SELECT id, 'scooters_electric', 'Электросамокаты', 'E-Scooters', 2 FROM market_categories WHERE slug = 'transport'
UNION ALL
SELECT id, 'bicycles', 'Велосипеды', 'Bicycles', 3 FROM market_categories WHERE slug = 'transport';

INSERT INTO market_subcategories (parent_id, slug, title_ru, title_en, sort_order)
SELECT id, 'surfboards', 'Сёрфборды', 'Surfboards', 1 FROM market_categories WHERE slug = 'sports'
UNION ALL
SELECT id, 'gym_equipment', 'Тренажёры / Гантели', 'Gym Equipment', 2 FROM market_categories WHERE slug = 'sports'
UNION ALL
SELECT id, 'yoga_mats', 'Коврики / Йога', 'Yoga & Mats', 3 FROM market_categories WHERE slug = 'sports'
UNION ALL
SELECT id, 'diving', 'Дайвинг / Снорклинг', 'Diving & Snorkeling', 4 FROM market_categories WHERE slug = 'sports';
```

---

## 3. Таблица лотов (market_listings)

### 3.1 Schema

```sql
-- ============================================================
-- FLASH MARKET — ЛОТЫ
-- ============================================================

CREATE TYPE listing_status AS ENUM (
    'active',       -- Лот опубликован, аукцион идёт
    'sold',         -- Продан (сделка завершена)
    'expired',      -- Время истекло без продажи
    'cancelled',    -- Отменён продавцом
    'moderation'    -- На модерации (для первых лотов)
);

CREATE TYPE listing_condition AS ENUM (
    'new',          -- Новый (в упаковке)
    'like_new',     -- Как новый (использован 1-2 раза)
    'good',         -- Хорошее состояние
    'fair',         -- Удовлетворительное (есть следы использования)
    'for_parts'     -- На запчасти / требует ремонта
);

CREATE TABLE market_listings (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id           UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

    -- Рубрикатор
    category_id         UUID REFERENCES market_categories(id) NOT NULL,
    subcategory_id      UUID REFERENCES market_subcategories(id),

    -- Гео-привязка (те же хабы + районы что и для услуг)
    hub                 VARCHAR(64) NOT NULL,       -- phuket | bali | bangkok | vietnam
    district            VARCHAR(128),               -- Rawai, Canggu, Thonglor, etc.

    -- Описание
    title               VARCHAR(256) NOT NULL,
    description         TEXT NOT NULL,
    condition           listing_condition NOT NULL DEFAULT 'good',
    media_urls          TEXT[] DEFAULT '{}',         -- до 10 фото, первое = обложка

    -- Ценообразование
    buy_now_price       NUMERIC(10,2),              -- Цена «Купить сейчас» (NULL = только аукцион)
    starting_price      NUMERIC(10,2) NOT NULL,     -- Стартовая цена аукциона
    current_bid         NUMERIC(10,2),              -- Текущая максимальная ставка
    currency            VARCHAR(8) DEFAULT 'THB',   -- THB по умолчанию для ЮВА
    bid_step            NUMERIC(10,2) DEFAULT 50,   -- Мин. шаг ставки

    -- Статус
    status              listing_status DEFAULT 'active',
    is_featured         BOOLEAN DEFAULT FALSE,      -- Платное продвижение за токены

    -- Тайминг аукциона
    duration_minutes    INT NOT NULL DEFAULT 1440,  -- Выбирается продавцом (30 мин — 7 дней)
    auction_ends_at     TIMESTAMP WITH TIME ZONE NOT NULL,
    extension_count     INT DEFAULT 0,              -- Авто-продление при ставке в последнюю минуту (макс. 5)

    -- Счётчики
    bids_count          INT DEFAULT 0,
    views_count         INT DEFAULT 0,
    saves_count         INT DEFAULT 0,              -- Сколько раз добавлен в избранное

    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы
CREATE INDEX idx_ml_hub_status      ON market_listings(hub, status);
CREATE INDEX idx_ml_category        ON market_listings(category_id);
CREATE INDEX idx_ml_seller          ON market_listings(seller_id);
CREATE INDEX idx_ml_featured        ON market_listings(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_ml_auction_ends    ON market_listings(auction_ends_at) WHERE status = 'active';
CREATE INDEX idx_ml_price           ON market_listings(buy_now_price) WHERE status = 'active';
CREATE INDEX idx_ml_created         ON market_listings(created_at DESC) WHERE status = 'active';

-- RLS
ALTER TABLE market_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ml_select_active"
    ON market_listings FOR SELECT
    USING (status = 'active' OR seller_id = auth.uid());

CREATE POLICY "ml_insert_own"
    ON market_listings FOR INSERT
    WITH CHECK (seller_id = auth.uid());

CREATE POLICY "ml_update_own"
    ON market_listings FOR UPDATE
    USING (seller_id = auth.uid());

CREATE POLICY "ml_delete_own"
    ON market_listings FOR DELETE
    USING (seller_id = auth.uid() AND status != 'sold');
```

### 3.2 Правило авто-продления (Anti-Sniping)

```
Если ставка поступает в последние 2 минуты аукциона:
  → auction_ends_at += 2 минуты
  → extension_count += 1
  → Максимум 5 продлений
  → Push продавцу: «⏰ Аукцион продлён! Новая ставка: {price}»
```

### 3.3 Лимиты на публикацию

| Статус | Макс. активных лотов | Featured лотов |
|---|---|---|
| Обычный пользователь | 3 | 1 |
| Verified Partner | 20 | 5 |
| При нарушениях (флаг) | 0 (бан публикации) | 0 |

---

## 4. Ставки покупателей (market_bids)

### 4.1 Schema

```sql
-- ============================================================
-- FLASH MARKET — СТАВКИ ПОКУПАТЕЛЕЙ
-- ============================================================

CREATE TYPE market_bid_status AS ENUM (
    'active',       -- Текущая ставка (лидирует или нет)
    'outbid',       -- Перебита другой ставкой
    'won',          -- Победила — покупатель выиграл
    'buy_now',      -- Покупка по цене «Купить сейчас»
    'cancelled'     -- Отменена
);

CREATE TABLE market_bids (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id      UUID REFERENCES market_listings(id) ON DELETE CASCADE NOT NULL,
    buyer_id        UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

    amount          NUMERIC(10,2) NOT NULL,
    currency        VARCHAR(8) DEFAULT 'THB',
    status          market_bid_status DEFAULT 'active',

    is_buy_now      BOOLEAN DEFAULT FALSE,          -- TRUE = мгновенная покупка по Buy Now

    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы
CREATE INDEX idx_mb_listing     ON market_bids(listing_id, amount DESC);
CREATE INDEX idx_mb_buyer       ON market_bids(buyer_id);

-- RLS
ALTER TABLE market_bids ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mb_select_all"
    ON market_bids FOR SELECT USING (true);

CREATE POLICY "mb_insert_own"
    ON market_bids FOR INSERT
    WITH CHECK (
        buyer_id = auth.uid()
        AND buyer_id != (SELECT seller_id FROM market_listings WHERE id = listing_id)
    );
```

### 4.2 Правила ставок

```
1. Ставка >= current_bid + bid_step (минимальный шаг)
2. Ставка >= starting_price (если первая)
3. Продавец НЕ может ставить на свой лот (RLS + проверка)
4. При Buy Now:
   → Все остальные ставки → 'outbid'
   → Сделка мгновенно → 'sold'
   → Создаётся market_deal
5. При перебитии:
   → Предыдущий лидер → 'outbid'
   → Push бывшему лидеру: «Вашу ставку перебили!»
```

---

## 5. Сделки Flash Market (market_deals)

### 5.1 Schema

```sql
-- ============================================================
-- FLASH MARKET — СДЕЛКИ (после завершения аукциона / Buy Now)
-- ============================================================

CREATE TYPE market_deal_status AS ENUM (
    'pending_meetup',   -- Ожидание встречи (после выигрыша)
    'in_progress',      -- Стороны общаются, договариваются о передаче
    'completed',        -- Товар передан, сделка завершена
    'disputed',         -- Апелляция
    'cancelled'         -- Отменена (не встретились)
);

CREATE TABLE market_deals (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id      UUID REFERENCES market_listings(id) ON DELETE CASCADE NOT NULL,
    bid_id          UUID REFERENCES market_bids(id) ON DELETE CASCADE UNIQUE NOT NULL,
    seller_id       UUID REFERENCES profiles(id) NOT NULL,
    buyer_id        UUID REFERENCES profiles(id) NOT NULL,

    status          market_deal_status DEFAULT 'pending_meetup',

    -- Итоговая цена
    final_price     NUMERIC(10,2) NOT NULL,
    currency        VARCHAR(8) DEFAULT 'THB',

    -- P2P расчёт (информативно)
    payment_method  VARCHAR(64),                    -- 'cash' | 'transfer' | 'promptpay'
    payment_note    TEXT,                            -- «Перевёл на PromptPay»

    -- Таймеры
    started_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at    TIMESTAMP WITH TIME ZONE,
    auto_close_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '5 days',

    -- Апелляция
    appeal_id       UUID,

    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы
CREATE INDEX idx_md_seller   ON market_deals(seller_id, status);
CREATE INDEX idx_md_buyer    ON market_deals(buyer_id, status);
CREATE INDEX idx_md_status   ON market_deals(status);

-- RLS
ALTER TABLE market_deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "md_select_participant"
    ON market_deals FOR SELECT
    USING (auth.uid() = seller_id OR auth.uid() = buyer_id);
```

### 5.2 Жизненный цикл сделки

```
[Аукцион завершён] или [Buy Now нажат]
        │
        ▼
[market_deal создаётся: status = 'pending_meetup']
  → Чат открыт (deals + chat_messages — общая система)
  → Push обоим участникам
        │
        ├─► Договорились о встрече → 'in_progress'
        │
        ├─► Покупатель нажимает «✅ Товар получен» → 'completed'
        │     └─► Открывается окно отзыва
        │
        ├─► Одна сторона «⚖️ Апелляция» → 'disputed'
        │     └─► Администратор рассматривает
        │
        ├─► «❌ Отменить» → 'cancelled' (доступно обоим)
        │     └─► Возврат лота в статус 'active' (по желанию продавца)
        │
        └─► Auto-close: 5 дней без активности → 'cancelled'
```

---

## 6. Интеграция с существующими системами

### 6.1 Чат по сделке

Используется **та же система** `deals` + `chat_messages` из `17_DEAL_FLOW_AND_CHAT.md`:

```sql
-- При создании market_deal → INSERT INTO deals
-- Поле source добавляется для различения:
ALTER TABLE deals ADD COLUMN IF NOT EXISTS source VARCHAR(32) DEFAULT 'service';
-- 'service' = основной аукцион
-- 'market'  = Flash Market

-- При создании market_deal → триггер создаёт запись в deals
CREATE OR REPLACE FUNCTION create_deal_for_market()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO deals (
        request_id,     -- NULL для маркета
        bid_id,         -- NULL для маркета
        client_id,      -- = buyer_id
        provider_id,    -- = seller_id
        agreed_price,
        currency,
        source
    ) VALUES (
        NULL,
        NULL,
        NEW.buyer_id,
        NEW.seller_id,
        NEW.final_price,
        NEW.currency,
        'market'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_create_deal_market
    AFTER INSERT ON market_deals
    FOR EACH ROW EXECUTE FUNCTION create_deal_for_market();
```

### 6.2 Апелляции

Используется та же таблица `appeals`:

```sql
-- Добавить поддержку маркет-сделок
ALTER TABLE appeals ADD COLUMN IF NOT EXISTS market_deal_id UUID REFERENCES market_deals(id);

-- Обновить constraint: deal_id OR market_deal_id
-- Одна из ссылок обязательно заполнена
ALTER TABLE appeals ADD CONSTRAINT chk_appeal_ref
    CHECK (deal_id IS NOT NULL OR market_deal_id IS NOT NULL);
```

### 6.3 Уведомления

Добавляются новые типы в `notification_type` enum:

```sql
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'market_new_bid';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'market_outbid';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'market_auction_ending';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'market_sold';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'market_buy_now';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'market_deal_created';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'market_listing_expired';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'market_featured_boost';
```

### 6.4 Избранные лоты

```sql
CREATE TABLE market_saves (
    user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
    listing_id  UUID REFERENCES market_listings(id) ON DELETE CASCADE,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, listing_id)
);

ALTER TABLE market_saves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "saves_own" ON market_saves FOR ALL USING (auth.uid() = user_id);
```

---

## 7. Монетизация Flash Market

### 7.1 Бесплатно для всех

| Действие | Стоимость |
|---|---|
| Публикация лота | **Бесплатно** |
| Ставки / Buy Now | **Бесплатно** |
| Чат по сделке | **Бесплатно** |
| Просмотр и поиск | **Бесплатно** |

### 7.2 Платное продвижение (Featured)

| Пакет | Стоимость (токены) | Длительность | Описание |
|---|---|---|---|
| 🔥 Flash Boost | 50 токенов | 1 час | Закреп в топе ленты на 1 час |
| ⭐ Day Boost | 150 токенов | 24 часа | Закреп + метка «Рекомендуем» |
| 🚀 Week Boost | 500 токенов | 7 дней | Закреп + увеличенная карточка + push в ленту |

```sql
CREATE TABLE market_featured_purchases (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id      UUID REFERENCES market_listings(id) NOT NULL,
    seller_id       UUID REFERENCES profiles(id) NOT NULL,
    package_type    VARCHAR(32) NOT NULL,        -- 'flash_1h' | 'day_24h' | 'week_7d'
    tokens_spent    INT NOT NULL,
    starts_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at      TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 8. UI Спецификация

### 8.1 Точка входа — Виджет на главном экране

```
┌──────────────────────────────────────────────────────────┐
│                    TUTTO MINUTTO                         │
│ Платформа, где цену определяет покупатель, а не продавец! │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ [Avatar] Александр | @alex_phuket ⭐ 4.9             │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ 🔥 FLASH MARKET                        Смотреть все → │ │
│ │                                                      │ │
│ │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐      │ │
│ │ │ 📱   │ │ 🏠   │ │ 🏄   │ │ 🚲   │ │ +    │      │ │
│ │ │iPhone│ │ Стол │ │ Доска│ │ Байк │ │Свой  │      │ │
│ │ │฿15k  │ │ ฿3k  │ │ ฿8k  │ │ ฿25k │ │ лот  │      │ │
│ │ │⏱ 2ч  │ │⏱ 1д  │ │⏱ 4ч  │ │⏱ 3д  │ │ ┄┄┄  │      │ │
│ │ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘      │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ [ === СЛАЙДЕРЫ УСЛУГ (как раньше) === ]                  │
│ ...                                                      │
│                                                          │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ 🏠 Главная  📋 Отклики  [⚡]  💬 Чат  👤 Кабинет     │ │
│ └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### 8.2 Полноэкранный вид Flash Market

```
┌──────────────────────────────────────────────────────────┐
│  ← Назад                FLASH MARKET 🔥              🔍  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ HUBS: [🌴 БАЛИ]  [ПХУКЕТ]  [БАНГКОК]  [ВЬЕТНАМ]        │
│                                                          │
│ КАТЕГОРИИ:                                               │
│ [📱 Все] [🏠 Мебель] [👕 Одежда] [🚲 Транс.] [🏄 Спорт] │
│ [👶 Дети] [📚 Книги] [🍳 Кухня] [🎸 Музыка] [📦 Другое] │
│                                                          │
│ ФИЛЬТРЫ:                                                │
│ [💰 Цена ▾] [📍 Район ▾] [⏱ Время ▾] [📊 Состояние ▾] │
│                                                          │
│ СОРТИРОВКА: [🕐 Новые] [💰 Дешёвые] [🔥 Featured]       │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ ┌────────────────────┐  ┌────────────────────┐          │
│ │ [📸 Фото iPhone]   │  │ [📸 Фото доски]    │          │
│ │ 🔥 Featured         │  │                    │          │
│ │ iPhone 15 Pro 256GB │  │ Firewire Surfboard │          │
│ │ 📍 Rawai, Phuket   │  │ 📍 Canggu, Bali   │          │
│ │ 💰 ฿15,000          │  │ 💰 ฿8,500          │          │
│ │ 🏷️ Как новый        │  │ 🏷️ Хорошее        │          │
│ │ ⏱ 1ч 45м осталось  │  │ ⏱ 3д 12ч осталось │          │
│ │ 👁 34  ❤ 5  💬 3    │  │ 👁 12  ❤ 2  💬 0  │          │
│ │ [⚡ Buy Now ฿18k]   │  │ [⚡ Buy Now ฿12k]  │          │
│ └────────────────────┘  └────────────────────┘          │
│                                                          │
│ ┌────────────────────┐  ┌────────────────────┐          │
│ │ [📸 Фото стола]    │  │ [📸 Фото PS5]      │          │
│ │ ...                │  │ ...                │          │
│ └────────────────────┘  └────────────────────┘          │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  [ + 📸 Продать товар ]   ← FAB (Floating Action Btn)  │
│                                                          │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ 🏠 Главная  📋 Отклики  [⚡]  💬 Чат  👤 Кабинет     │ │
│ └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### 8.3 Карточка лота (детальный экран)

```
┌──────────────────────────────────────────────────────────┐
│  ← Назад               ❤ Сохранить         🔗 Поделиться│
├──────────────────────────────────────────────────────────┤
│                                                          │
│ [═══════════════ ФОТОГАЛЕРЕЯ (свайп) ═══════════════]   │
│ [  📸 Фото 1/5   ●  ○  ○  ○  ○  ]                      │
│                                                          │
│ КАТЕГОРИЯ: 📱 Электроника                                │
│ iPhone 15 Pro 256GB Natural Titanium                     │
│ 🏷️ Состояние: Как новый                                  │
│                                                          │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ 💰 ТЕКУЩАЯ СТАВКА         ⚡ КУПИТЬ СЕЙЧАС           │ │
│ │    ฿15,000                   ฿18,000                 │ │
│ │    (3 ставки)                                         │ │
│ │                                                      │ │
│ │    ⏱️ Осталось: 1 час 45 мин                          │ │
│ │    ████████████████░░░░░░ 78%                          │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ 📝 ОПИСАНИЕ                                              │
│ Куплен 3 месяца назад в Apple Store Singapore.           │
│ Полный комплект: коробка, зарядка, чехол.                │
│ Продаю из-за переезда в Бангкок.                         │
│                                                          │
│ 📍 ЛОКАЦИЯ                                               │
│ Пхукет, Раваи                                           │
│ [📍 Показать на карте]                                   │
│                                                          │
│ 👤 ПРОДАВЕЦ                                              │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ [Avatar] Алексей К.   ⭐ 4.8 · 12 сделок            │ │
│ │ На платформе с авг. 2026                              │ │
│ │ [💬 Написать продавцу]                                │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ 📊 ИСТОРИЯ СТАВОК                                        │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ 💰 ฿15,000  Buyer***3   2 мин назад   ← лидер       │ │
│ │ 💰 ฿14,500  Buyer***7   15 мин назад                 │ │
│ │ 💰 ฿14,000  Buyer***3   1 час назад                  │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ ┌────────────────────────────────────────────┐          │
│ │  💰 Ваша ставка: [฿ _______]  [Поставить] │          │
│ │  Минимум: ฿15,050 (шаг: ฿50)              │          │
│ └────────────────────────────────────────────┘          │
│                                                          │
│ [ ⚡ Купить сейчас за ฿18,000 ]   ← primary btn        │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 8.4 Форма создания лота

```
┌──────────────────────────────────────────────────────────┐
│  ← Назад              ПРОДАТЬ ТОВАР                     │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ 📸 ФОТОГРАФИИ (до 10)                                   │
│ ┌────┐ ┌────┐ ┌────┐ ┌────────────────┐                │
│ │ 📷 │ │ 📷 │ │ 📷 │ │  + Добавить    │                │
│ │ #1 │ │ #2 │ │ #3 │ │    ┄ ┄ ┄       │                │
│ └────┘ └────┘ └────┘ └────────────────┘                │
│                                                          │
│ 📂 КАТЕГОРИЯ *                                           │
│ [📱 Электроника ▾]                                       │
│ └── [📱 Телефоны ▾]                                      │
│                                                          │
│ 📝 НАЗВАНИЕ *                                            │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ iPhone 15 Pro 256GB Natural Titanium                  │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ 📄 ОПИСАНИЕ *                                            │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Куплен 3 месяца назад. Полный комплект...            │ │
│ │ ...                                                  │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ 🏷️ СОСТОЯНИЕ *                                           │
│ [○ Новый] [● Как новый] [○ Хорошее] [○ Удовл.] [○ Зап.] │
│                                                          │
│ 📍 ЛОКАЦИЯ *                                             │
│ Хаб: [Пхукет ▾]    Район: [Раваи ▾]   [📍 GPS]         │
│                                                          │
│ 💰 ЦЕНЫ *                                                │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Стартовая цена:   [฿ 14,000]                         │ │
│ │ Купить сейчас:    [฿ 18,000]  (опционально)          │ │
│ │ Шаг ставки:       [฿ 50]     (по умолчанию ฿50)     │ │
│ │ Валюта:           [THB ▾]                            │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ ⏱️ ДЛИТЕЛЬНОСТЬ АУКЦИОНА *                               │
│ [○ 30м] [○ 1ч] [○ 4ч] [○ 12ч] [● 24ч] [○ 3д] [○ 7д]  │
│                                                          │
│ 🔥 FEATURED (платное продвижение)                        │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ [ ] Flash Boost (1ч) — 50 🪙                          │ │
│ │ [ ] Day Boost (24ч) — 150 🪙                          │ │
│ │ [ ] Week Boost (7д) — 500 🪙                          │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ [ 📸 Опубликовать лот ]   ← primary btn                 │
│                                                          │
│ ⚠️ Публикация бесплатна.                                 │
│    Featured оплачивается из баланса токенов.             │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 9. Уведомления Flash Market

### 9.1 Продавцу (Seller)

---

**[M-01] Новая ставка на лот**

| Поле | Значение |
|---|---|
| Триггер | `INSERT INTO market_bids WHERE is_buy_now = FALSE` |
| Кому | Продавец (seller_id) |
| Задержка | Немедленно |

```
🇷🇺:
💰 Новая ставка на ваш лот!

📋 {listing.title}
👤 {buyer.first_name} (⭐{buyer.rating})
💰 Ставка: {bid.amount} {currency}
📊 Всего ставок: {bids_count}
⏱️ Аукцион заканчивается: {time_left}

[Смотреть лот →]
```

---

**[M-02] Buy Now — мгновенная продажа**

```
🇷🇺:
🎉 Ваш лот куплен!

📋 {listing.title}
👤 Покупатель: {buyer.first_name}
💰 Цена: {buy_now_price} {currency}

Свяжитесь с покупателем для передачи товара.

[Открыть чат →]
```

---

**[M-03] Аукцион завершён — есть ставки**

```
🇷🇺:
🏆 Аукцион завершён!

📋 {listing.title}
🥇 Победитель: {winner.first_name}
💰 Финальная цена: {final_price} {currency}
📊 Всего ставок: {bids_count}

Свяжитесь с покупателем в чате.

[Открыть чат →]
```

---

**[M-04] Аукцион истёк — нет ставок**

```
🇷🇺:
⌛ Никто не сделал ставку

📋 {listing.title}

Попробуйте:
• Снизить стартовую цену
• Добавить больше фото
• Использовать Featured 🔥

[Опубликовать заново ↺]
```

---

**[M-05] Anti-Sniping: аукцион продлён**

```
🇷🇺:
⏰ Аукцион продлён!

📋 {listing.title}
💰 Новая ставка: {bid.amount} {currency}
⏱️ +2 минуты добавлено
📊 Продление #{extension_count}/5

[Смотреть лот →]
```

---

### 9.2 Покупателю (Buyer)

---

**[M-06] Вашу ставку перебили**

| Поле | Значение |
|---|---|
| Триггер | `market_bids.status → 'outbid'` |
| Приоритет | Высокий |

```
🇷🇺:
⚠️ Вашу ставку перебили!

📋 {listing.title}
💰 Ваша ставка: {your_bid} → Текущая: {current_bid}
⏱️ Осталось: {time_left}

[Поставить выше →] [Купить сейчас за {buy_now_price}]
```

---

**[M-07] Вы выиграли аукцион**

```
🇷🇺:
🎉 Поздравляем! Вы выиграли аукцион!

📋 {listing.title}
💰 Ваша цена: {final_price} {currency}
👤 Продавец: {seller.first_name}

Договоритесь о встрече в чате.

[Открыть чат →]
```

---

**[M-08] Аукцион заканчивается (вы лидер)**

```
🇷🇺:
⏰ Аукцион скоро заканчивается!

📋 {listing.title}
🏆 Вы лидер! Ваша ставка: {your_bid}
⏱️ Осталось: {time_left}

Следите за лотом — ставку могут перебить.

[Смотреть лот →]
```

---

## 10. CRON-задачи Flash Market

```sql
-- ============================================================
-- CRON: Завершение просроченных аукционов Flash Market
-- ============================================================
SELECT cron.schedule(
    'market-close-auctions',
    '* * * * *',  -- Каждую минуту
    $$
        -- 1. Завершённые аукционы с ставками → 'sold'
        UPDATE market_listings ml
        SET status = 'sold',
            updated_at = NOW()
        WHERE ml.status = 'active'
          AND ml.auction_ends_at < NOW()
          AND ml.bids_count > 0;

        -- 2. Создать market_deals для победителей
        INSERT INTO market_deals (listing_id, bid_id, seller_id, buyer_id, final_price, currency)
        SELECT
            ml.id,
            mb.id,
            ml.seller_id,
            mb.buyer_id,
            mb.amount,
            ml.currency
        FROM market_listings ml
        JOIN market_bids mb ON mb.listing_id = ml.id AND mb.status = 'active'
        WHERE ml.status = 'sold'
          AND ml.updated_at >= NOW() - INTERVAL '2 minutes'
          AND mb.amount = ml.current_bid
        ON CONFLICT DO NOTHING;

        -- 3. Пометить проигравшие ставки
        UPDATE market_bids mb
        SET status = 'outbid'
        FROM market_listings ml
        WHERE mb.listing_id = ml.id
          AND ml.status = 'sold'
          AND mb.status = 'active'
          AND mb.amount < ml.current_bid;

        -- 4. Пометить победившие ставки
        UPDATE market_bids mb
        SET status = 'won'
        FROM market_listings ml
        WHERE mb.listing_id = ml.id
          AND ml.status = 'sold'
          AND mb.status = 'active'
          AND mb.amount = ml.current_bid;

        -- 5. Завершённые аукционы без ставок → 'expired'
        UPDATE market_listings
        SET status = 'expired',
            updated_at = NOW()
        WHERE status = 'active'
          AND auction_ends_at < NOW()
          AND bids_count = 0;
    $$
);

-- Auto-close market deals (5 дней без активности)
SELECT cron.schedule(
    'market-auto-close-deals',
    '0 */6 * * *',  -- Каждые 6 часов
    $$
        UPDATE market_deals
        SET status = 'cancelled',
            completed_at = NOW()
        WHERE status IN ('pending_meetup', 'in_progress')
          AND auto_close_at < NOW();
    $$
);
```

---

## 11. TypeScript Types (Frontend)

```typescript
// types/market.ts

export type ListingStatus = 'active' | 'sold' | 'expired' | 'cancelled' | 'moderation';
export type ListingCondition = 'new' | 'like_new' | 'good' | 'fair' | 'for_parts';
export type MarketBidStatus = 'active' | 'outbid' | 'won' | 'buy_now' | 'cancelled';
export type MarketDealStatus = 'pending_meetup' | 'in_progress' | 'completed' | 'disputed' | 'cancelled';

export interface MarketCategory {
  id: string;
  slug: string;
  titleRu: string;
  titleEn: string;
  emoji: string;
  iconName: string;
}

export interface MarketSubcategory {
  id: string;
  parentId: string;
  slug: string;
  titleRu: string;
  titleEn: string;
}

export interface MarketListing {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
  sellerRating: number;

  categoryId: string;
  categoryName: string;
  subcategoryId?: string;

  hub: HubId;
  district: string;

  title: string;
  description: string;
  condition: ListingCondition;
  mediaUrls: string[];

  buyNowPrice: number | null;
  startingPrice: number;
  currentBid: number | null;
  currency: string;
  bidStep: number;

  status: ListingStatus;
  isFeatured: boolean;

  durationMinutes: number;
  auctionEndsAt: string;
  extensionCount: number;

  bidsCount: number;
  viewsCount: number;
  savesCount: number;

  createdAt: string;
}

export interface MarketBid {
  id: string;
  listingId: string;
  buyerId: string;
  buyerName: string;
  buyerRating: number;
  amount: number;
  currency: string;
  status: MarketBidStatus;
  isBuyNow: boolean;
  createdAt: string;
}

export interface MarketDeal {
  id: string;
  listingId: string;
  sellerId: string;
  buyerId: string;
  status: MarketDealStatus;
  finalPrice: number;
  currency: string;
  paymentMethod?: string;
  startedAt: string;
  completedAt?: string;
}
```

---

## 12. Обновлённая ERD (дополнение к 02_DATABASE_SCHEMA.md)

```
profiles ──< market_listings       (seller_id)
profiles ──< market_bids           (buyer_id)
profiles ──< market_deals          (seller_id, buyer_id)
profiles ──< market_saves          (user_id)

market_categories ──< market_subcategories  (parent_id)
market_categories ──< market_listings       (category_id)
market_subcategories ──< market_listings    (subcategory_id)

market_listings ──< market_bids             (listing_id)
market_listings ──< market_saves            (listing_id)
market_listings ──< market_featured_purchases (listing_id)

market_listings ── market_deals             (listing_id — через bid)
market_bids     ── market_deals             (bid_id — 1:1)

market_deals → deals                        (через trigger — общий чат)
market_deals ── appeals                     (market_deal_id — 1:1)
```

---

## 13. Интеграция в существующие экраны

### 13.1 Обновления в BottomNav

Без изменений. Flash Market доступен через **виджет на главном экране** → полноэкранный раздел.

### 13.2 Обновления в App.tsx / Роутинг

```
Новые маршруты:
  /market                     — Полноэкранная лента Flash Market
  /market/:listingId          — Детальная карточка лота
  /market/create              — Форма создания лота
  /market/my-listings         — Мои лоты (Кабинет продавца)
  /market/my-bids             — Мои ставки (Кабинет покупателя)
```

### 13.3 Обновления в Кабинете (Profile/Cabinet)

```
Новые разделы:
  📦 Мои лоты                — Список созданных лотов + статусы
  🏷️ Мои ставки               — Где я делал ставки + текущий статус
  ❤️ Сохранённые лоты        — Избранное (market_saves)
```

### 13.4 Обновления в MockupAuctionSection

Добавить горизонтальный слайдер **Flash Market** в начало или конец основного контента:

```tsx
// Новый раздел между UserProfile и категориями услуг
<FlashMarketWidget
  hub={selectedHub}
  items={marketListings}
  onViewAll={() => navigate('/market')}
  onCreateLot={() => navigate('/market/create')}
/>
```

---

## 14. Модерация и безопасность

### 14.1 Автомодерация

```
При публикации лота:
  1. AI проверяет фото на NSFW (OpenAI Moderation API)
  2. AI проверяет описание на запрещённые товары
  3. Первые 3 лота нового пользователя → status = 'moderation'
  4. После 3 успешных публикаций → автопубликация

Запрещённые товары:
  - Оружие и амуниция
  - Наркотики и запрещённые вещества
  - Подделки и контрафакт (явные)
  - Живые животные
  - Медицинские препараты рецептурные
  - Поддельные документы
```

### 14.2 Репорт лота

```sql
CREATE TABLE market_reports (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id      UUID REFERENCES market_listings(id) NOT NULL,
    reporter_id     UUID REFERENCES profiles(id) NOT NULL,
    reason          TEXT NOT NULL,
    status          VARCHAR(16) DEFAULT 'pending',  -- pending | reviewed | dismissed
    admin_note      TEXT,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(listing_id, reporter_id)
);
```

---

## 15. Changelog

| Версия | Дата | Изменение |
|---|---|---|
| v1.0 | 2026-09-26 | Начальная спецификация: market_categories, market_listings, market_bids, market_deals, UI, уведомления, CRON |
