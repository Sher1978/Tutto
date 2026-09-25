# 📁 02_DATABASE_SCHEMA.md
> **NeedTnow** — Полная схема базы данных PostgreSQL (Supabase)  
> Включает: RLS, pgvector, партнёрскую программу, рубрикатор услуг, онбординг, бизнес-карточки  
> Версия схемы: v1.1

---

## Полный runnable SQL-скрипт

```sql
-- ============================================================
-- NEEDTNOW — SUPABASE DATABASE SCHEMA v1.2
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 0. РАСШИРЕНИЯ
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================
-- 1. ENUM ТИПЫ
-- ============================================================
CREATE TYPE user_role    AS ENUM ('client', 'provider', 'both');
CREATE TYPE request_status AS ENUM ('open', 'in_progress', 'completed', 'cancelled', 'expired');
CREATE TYPE bid_status   AS ENUM ('pending', 'accepted', 'rejected', 'withdrawn');
CREATE TYPE bid_type     AS ENUM ('manual', 'ai_agent');
CREATE TYPE sub_plan     AS ENUM ('free', 'pro_manual', 'ai_business');
CREATE TYPE payout_status AS ENUM ('pending', 'processing', 'paid', 'failed');

-- ============================================================
-- 2. ПРОФИЛИ ПОЛЬЗОВАТЕЛЕЙ
-- ============================================================
CREATE TABLE profiles (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    telegram_id     BIGINT UNIQUE NOT NULL,
    username        VARCHAR(64),
    first_name      VARCHAR(128) NOT NULL,
    last_name       VARCHAR(128),
    photo_url       TEXT,
    phone           VARCHAR(32),
    role            user_role DEFAULT 'both',
    rating          NUMERIC(3,2) DEFAULT 5.00,
    deals_count     INT DEFAULT 0,
    hub_location    VARCHAR(64) NOT NULL DEFAULT 'phuket',
    lang            VARCHAR(8) DEFAULT 'ru',           -- 'ru' | 'en'
    referral_code   VARCHAR(16) UNIQUE,                -- собственный реф-код пользователя
    referred_by     UUID REFERENCES profiles(id),      -- кто пригласил
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================
-- 3. БИЗНЕС-ПРОФИЛИ И НАСТРОЙКИ AI-МЕНЕДЖЕРА
-- ============================================================
CREATE TABLE business_profiles (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    company_name    VARCHAR(128) NOT NULL,
    category_id     UUID NOT NULL,                     -- FK → categories_l1
    sub_plan        sub_plan DEFAULT 'free',
    sub_expires_at  TIMESTAMP WITH TIME ZONE,

    -- AI Agent Config
    ai_enabled              BOOLEAN DEFAULT FALSE,
    ai_name                 VARCHAR(64) DEFAULT 'AI Manager',
    ai_tone                 VARCHAR(32) DEFAULT 'friendly',  -- friendly | professional | sales
    ai_min_budget           NUMERIC(10,2) DEFAULT 0.00,
    ai_auto_accept          BOOLEAN DEFAULT FALSE,
    knowledge_base_text     TEXT,
    knowledge_base_embedding VECTOR(1536),             -- OpenAI text-embedding-3-small

    -- Business Card Fields (заполняются через AI-онбординг)
    tagline                 VARCHAR(120),              -- короткий продающий слоган
    card_description        TEXT,                      -- публичное описание (до 200 символов)
    services_list           JSONB DEFAULT '[]'::jsonb, -- [{name, price, unit, note}]
    advantages              TEXT[] DEFAULT '{}',       -- список преимуществ (до 5)
    coverage_area           VARCHAR(256),              -- зона работы / доставки
    working_hours           VARCHAR(128),              -- напр. «8:00–22:00 ежедневно»
    social_links            TEXT[] DEFAULT '{}',       -- instagram, сайт, etc.
    logo_url                TEXT,                      -- Supabase Storage URL
    cover_photo_url         TEXT,                      -- Supabase Storage URL

    -- Онбординг
    onboarding_completed    BOOLEAN DEFAULT FALSE,
    onboarding_answers      JSONB DEFAULT '{}'::jsonb,  -- сырые ответы для переобучения

    created_at      TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================
-- 4. РУБРИКАТОР УСЛУГ (3 уровня)
-- ============================================================

-- УРОВЕНЬ 1: Мегакатегории
CREATE TABLE categories_l1 (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug        VARCHAR(64) UNIQUE NOT NULL,
    title_ru    VARCHAR(128) NOT NULL,
    title_en    VARCHAR(128) NOT NULL,
    icon_name   VARCHAR(64) NOT NULL,
    sort_order  INT DEFAULT 0,
    is_active   BOOLEAN DEFAULT TRUE
);

-- УРОВЕНЬ 2: Категории
CREATE TABLE categories_l2 (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id   UUID REFERENCES categories_l1(id) ON DELETE CASCADE NOT NULL,
    slug        VARCHAR(64) UNIQUE NOT NULL,
    title_ru    VARCHAR(128) NOT NULL,
    title_en    VARCHAR(128) NOT NULL,
    icon_name   VARCHAR(64),
    sort_order  INT DEFAULT 0,
    is_active   BOOLEAN DEFAULT TRUE
);

-- УРОВЕНЬ 3: Подкатегории / Услуги
CREATE TABLE categories_l3 (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id   UUID REFERENCES categories_l2(id) ON DELETE CASCADE NOT NULL,
    slug        VARCHAR(128) UNIQUE NOT NULL,
    title_ru    VARCHAR(128) NOT NULL,
    title_en    VARCHAR(128) NOT NULL,
    -- Подсказки для формы заказа
    hint_ru     TEXT,
    hint_en     TEXT,
    -- Типичный диапазон цен (для подсказки клиенту)
    price_min   NUMERIC(10,2),
    price_max   NUMERIC(10,2),
    currency    VARCHAR(8) DEFAULT 'USD',
    sort_order  INT DEFAULT 0,
    is_active   BOOLEAN DEFAULT TRUE
);

-- ============================================================
-- 5. ЗАЯВКИ (REQUESTS / АУКЦИОНЫ)
-- ============================================================
CREATE TABLE requests (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id       UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    category_l1_id  UUID REFERENCES categories_l1(id) NOT NULL,
    category_l2_id  UUID REFERENCES categories_l2(id),
    category_l3_id  UUID REFERENCES categories_l3(id),
    hub             VARCHAR(64) NOT NULL,              -- phuket | bali | bangkok | vietnam
    district        VARCHAR(128),                      -- Rawai, Canggu, Ekkamai, etc.

    title           VARCHAR(256) NOT NULL,
    description     TEXT NOT NULL,
    media_urls      TEXT[] DEFAULT '{}',

    budget          NUMERIC(10,2),                     -- NULL = «Жду предложений»
    currency        VARCHAR(8) DEFAULT 'USD',

    is_featured     BOOLEAN DEFAULT FALSE,             -- платный «закреп»
    status          request_status DEFAULT 'open',

    -- Тайминг аукциона
    auction_duration_minutes  INT NOT NULL DEFAULT 120,          -- дефолт по нише
    auction_ends_at           TIMESTAMP WITH TIME ZONE,          -- = created_at + duration
    auction_extended_count    INT DEFAULT 0,                     -- макс. 3 продления

    expires_at      TIMESTAMP WITH TIME ZONE NOT NULL,           -- = auction_ends_at
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================
-- 6. ОТКЛИКИ (BIDS)
-- ============================================================
CREATE TABLE bids (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id      UUID REFERENCES requests(id) ON DELETE CASCADE NOT NULL,
    provider_id     UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

    proposed_price  NUMERIC(10,2) NOT NULL,
    currency        VARCHAR(8) DEFAULT 'USD',
    comment         TEXT NOT NULL,

    bid_type        bid_type DEFAULT 'manual',
    status          bid_status DEFAULT 'pending',

    created_at      TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(request_id, provider_id)
);

-- ============================================================
-- 7. ОТЗЫВЫ
-- ============================================================

CREATE TYPE review_status AS ENUM ('pending', 'published', 'hidden', 'flagged');

CREATE TABLE reviews (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Связи (строго верифицированные)
    request_id      UUID REFERENCES requests(id) ON DELETE CASCADE NOT NULL,
    bid_id          UUID REFERENCES bids(id) ON DELETE CASCADE NOT NULL,
    reviewer_id     UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,  -- клиент
    provider_id     UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,  -- исполнитель

    -- Контент
    rating          SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment         TEXT,
    tags            TEXT[] DEFAULT '{}',

    -- Ответ исполнителя
    provider_reply  TEXT,
    replied_at      TIMESTAMP WITH TIME ZONE,

    -- Модерация
    status          review_status DEFAULT 'pending',
    moderation_note TEXT,
    ai_score        NUMERIC(4,2),                       -- 0.0–1.0 от AI-модератора

    -- Антифрод
    review_window_expires_at  TIMESTAMP WITH TIME ZONE NOT NULL,  -- created_at + 7 дней
    ip_hash         VARCHAR(64),                        -- хэш IP
    device_fp       VARCHAR(64),                        -- fingerprint устройства

    created_at      TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),

    UNIQUE(bid_id),
    UNIQUE(request_id, reviewer_id),
    CHECK(reviewer_id != provider_id)
);

-- Слоты для отзывов (лёгкая таблица-флаг)
CREATE TABLE review_slots (
    bid_id          UUID PRIMARY KEY REFERENCES bids(id),
    request_id      UUID NOT NULL,
    reviewer_id     UUID NOT NULL,
    provider_id     UUID NOT NULL,
    expires_at      TIMESTAMP WITH TIME ZONE NOT NULL,
    review_id       UUID REFERENCES reviews(id),        -- NULL до написания
    notified_24h    BOOLEAN DEFAULT FALSE
);

-- ============================================================
-- 8. ПАРТНЁРСКАЯ ПРОГРАММА
-- ============================================================

-- Начисления (events)
CREATE TABLE partner_earnings (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id      UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,  -- кто пригласил
    referred_user_id UUID REFERENCES profiles(id) NOT NULL,                   -- кого пригласили
    payment_event_id TEXT NOT NULL,                   -- ID транзакции оплаты (Stripe / TG Stars)
    plan            sub_plan NOT NULL,                -- за какой план начислено
    payment_amount  NUMERIC(10,2) NOT NULL,           -- сумма оплаты реф-пользователя
    commission_pct  NUMERIC(5,2) DEFAULT 20.00,       -- % партнёра (по умолчанию 20%)
    commission_amount NUMERIC(10,2) NOT NULL,         -- реальная сумма начисления
    currency        VARCHAR(8) DEFAULT 'USD',
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Выплаты
CREATE TABLE partner_payouts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id      UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    amount          NUMERIC(10,2) NOT NULL,
    currency        VARCHAR(8) DEFAULT 'USD',
    status          payout_status DEFAULT 'pending',
    payout_method   VARCHAR(64),                      -- ton_wallet | promptpay | usdt_trc20
    payout_address  TEXT,
    admin_note      TEXT,
    requested_at    TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    paid_at         TIMESTAMP WITH TIME ZONE
);

-- ============================================================
-- 9. PAYMENTS LOG
-- ============================================================
CREATE TABLE payments (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES profiles(id) NOT NULL,
    plan            sub_plan NOT NULL,
    amount          NUMERIC(10,2) NOT NULL,
    currency        VARCHAR(8) DEFAULT 'USD',
    provider        VARCHAR(32),                      -- tg_stars | ton | crypto_pay | qr
    external_id     TEXT UNIQUE,                      -- ID транзакции на стороне провайдера
    status          VARCHAR(16) DEFAULT 'completed',
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================
-- 10. ИНДЕКСЫ
-- ============================================================
CREATE INDEX idx_requests_hub_status     ON requests(hub, status);
CREATE INDEX idx_requests_category_l1    ON requests(category_l1_id);
CREATE INDEX idx_requests_category_l3    ON requests(category_l3_id);
CREATE INDEX idx_requests_featured       ON requests(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_requests_auction_ends   ON requests(auction_ends_at) WHERE status = 'open';
CREATE INDEX idx_bids_request_id         ON bids(request_id);
CREATE INDEX idx_business_ai_enabled     ON business_profiles(ai_enabled) WHERE ai_enabled = TRUE;
CREATE INDEX idx_profiles_referral_code  ON profiles(referral_code);
CREATE INDEX idx_partner_earnings_partner ON partner_earnings(partner_id);
CREATE INDEX idx_reviews_provider        ON reviews(provider_id, status);
CREATE INDEX idx_reviews_request         ON reviews(request_id);
CREATE INDEX idx_review_slots_reviewer   ON review_slots(reviewer_id) WHERE review_id IS NULL;

-- ============================================================
-- 10. ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests             ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_earnings     ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_payouts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews              ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_slots         ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "profiles_select_all"  ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own"  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Requests
CREATE POLICY "requests_select_all"  ON requests FOR SELECT USING (true);
CREATE POLICY "requests_insert_own"  ON requests FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "requests_update_own"  ON requests FOR UPDATE USING (auth.uid() = client_id);

-- Bids
CREATE POLICY "bids_select_all"      ON bids FOR SELECT USING (true);
CREATE POLICY "bids_insert_own"      ON bids FOR INSERT WITH CHECK (auth.uid() = provider_id);
CREATE POLICY "bids_update_own"      ON bids FOR UPDATE USING (auth.uid() = provider_id);

-- Business Profiles
CREATE POLICY "biz_select_all"       ON business_profiles FOR SELECT USING (true);
CREATE POLICY "biz_insert_own"       ON business_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "biz_update_own"       ON business_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Partner Earnings (только сам партнёр видит свои начисления)
CREATE POLICY "earnings_select_own"  ON partner_earnings FOR SELECT USING (auth.uid() = partner_id);

-- Partner Payouts
CREATE POLICY "payouts_select_own"   ON partner_payouts FOR SELECT USING (auth.uid() = partner_id);
CREATE POLICY "payouts_insert_own"   ON partner_payouts FOR INSERT WITH CHECK (auth.uid() = partner_id);

-- Reviews
CREATE POLICY "reviews_select_published"
    ON reviews FOR SELECT USING (status = 'published');

CREATE POLICY "reviews_insert_verified"
    ON reviews FOR INSERT WITH CHECK (
        auth.uid() = reviewer_id
        AND NOW() < review_window_expires_at
        AND EXISTS (SELECT 1 FROM bids b WHERE b.id = bid_id AND b.status = 'accepted')
        AND EXISTS (SELECT 1 FROM requests r WHERE r.id = request_id AND r.client_id = auth.uid())
    );

CREATE POLICY "reviews_provider_reply"
    ON reviews FOR UPDATE
    USING (auth.uid() = provider_id AND provider_reply IS NULL)
    WITH CHECK (provider_reply IS NOT NULL);

-- Review Slots
CREATE POLICY "review_slots_select_own"
    ON review_slots FOR SELECT USING (auth.uid() = reviewer_id);
```

---

## Диаграмма связей (ERD)

```
profiles ──< requests          (client_id)
profiles ──< bids              (provider_id)
profiles ──< business_profiles (user_id)
profiles ──< partner_earnings  (partner_id, referred_user_id)
profiles ──< partner_payouts   (partner_id)
profiles ──< payments          (user_id)
profiles ──< reviews           (reviewer_id, provider_id)

requests ──< bids              (request_id)
bids     ── reviews            (bid_id — 1:1)
bids     ── review_slots       (bid_id — 1:1)

categories_l1 ──< categories_l2 ──< categories_l3
categories_l1 ──< requests (category_l1_id)
categories_l2 ──< requests (category_l2_id)
categories_l3 ──< requests (category_l3_id)
categories_l1 ──< business_profiles (category_id)
```

---

## Changelog схемы

| Версия | Дата | Изменение |
|---|---|---|
| v1.0 | 2026-09-25 | Начальная схема: profiles, requests, bids, categories, partner, payments |
| v1.1 | 2026-09-25 | Добавлены поля бизнес-карточки в `business_profiles` |
| v1.2 | 2026-09-25 | Тайминг аукциона в `requests` (auction_ends_at, duration, extended_count); таблицы `reviews`, `review_slots`; RLS для отзывов; индексы для аукционных очередей |
