-- ============================================================
-- TUTTOMINUTTO — SUPABASE DATABASE SCHEMA v1.3 (with Deals & Internal Chat)
-- ============================================================

-- 0. РАСШИРЕНИЯ
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 1. ENUM ТИПЫ
CREATE TYPE user_role       AS ENUM ('client', 'provider', 'both');
CREATE TYPE request_status  AS ENUM ('open', 'in_progress', 'completed', 'cancelled', 'expired');
CREATE TYPE bid_status      AS ENUM ('pending', 'accepted', 'rejected', 'withdrawn');
CREATE TYPE bid_type        AS ENUM ('manual', 'ai_agent');
CREATE TYPE sub_plan        AS ENUM ('free', 'pro_manual', 'ai_business');
CREATE TYPE payout_status   AS ENUM ('pending', 'processing', 'paid', 'failed');
CREATE TYPE review_status   AS ENUM ('pending', 'published', 'hidden', 'flagged');
CREATE TYPE deal_status     AS ENUM ('in_progress', 'completed', 'disputed', 'cancelled');
CREATE TYPE message_type    AS ENUM ('text', 'image', 'video', 'location', 'link', 'file', 'system');
CREATE TYPE sender_role     AS ENUM ('client', 'provider', 'system', 'admin', 'support');

-- 2. ПРОФИЛИ ПОЛЬЗОВАТЕЛЕЙ
CREATE TABLE profiles (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    telegram_id     BIGINT UNIQUE,
    username        VARCHAR(64),
    first_name      VARCHAR(128) NOT NULL,
    last_name       VARCHAR(128),
    photo_url       TEXT,
    phone           VARCHAR(32),
    role            user_role DEFAULT 'both',
    rating          NUMERIC(3,2) DEFAULT 5.00,
    deals_count     INT DEFAULT 0,
    hub_location    VARCHAR(64) NOT NULL DEFAULT 'phuket',
    lang            VARCHAR(8) DEFAULT 'ru',
    referral_code   VARCHAR(16) UNIQUE,
    referred_by     UUID REFERENCES profiles(id),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 3. БИЗНЕС-ПРОФИЛИ И AI-МЕНЕДЖЕР
CREATE TABLE business_profiles (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                 UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    company_name            VARCHAR(128) NOT NULL,
    category_id             UUID,
    sub_plan                sub_plan DEFAULT 'free',
    sub_expires_at          TIMESTAMP WITH TIME ZONE,

    -- AI Agent Config
    ai_enabled              BOOLEAN DEFAULT FALSE,
    ai_name                 VARCHAR(64) DEFAULT 'AI Manager',
    ai_tone                 VARCHAR(32) DEFAULT 'friendly',
    ai_min_budget           NUMERIC(10,2) DEFAULT 0.00,
    ai_auto_accept          BOOLEAN DEFAULT FALSE,
    knowledge_base_text     TEXT,
    knowledge_base_embedding VECTOR(1536),

    -- Business Card Fields
    tagline                 VARCHAR(120),
    card_description        TEXT,
    services_list           JSONB DEFAULT '[]'::jsonb,
    advantages              TEXT[] DEFAULT '{}',
    coverage_area           VARCHAR(256),
    working_hours           VARCHAR(128),
    social_links            TEXT[] DEFAULT '{}',
    logo_url                TEXT,
    cover_photo_url         TEXT,

    -- Onboarding
    onboarding_completed    BOOLEAN DEFAULT FALSE,
    onboarding_answers      JSONB DEFAULT '{}'::jsonb,

    created_at              TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 4. РУБРИКАТОР УСЛУГ (3 уровня)
CREATE TABLE categories_l1 (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug        VARCHAR(64) UNIQUE NOT NULL,
    title_ru    VARCHAR(128) NOT NULL,
    title_en    VARCHAR(128) NOT NULL,
    icon_name   VARCHAR(64) NOT NULL,
    default_cover_url TEXT,
    sort_order  INT DEFAULT 0,
    is_active   BOOLEAN DEFAULT TRUE
);

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

CREATE TABLE categories_l3 (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id   UUID REFERENCES categories_l2(id) ON DELETE CASCADE NOT NULL,
    slug        VARCHAR(128) UNIQUE NOT NULL,
    title_ru    VARCHAR(128) NOT NULL,
    title_en    VARCHAR(128) NOT NULL,
    cover_image_url TEXT,
    hint_ru     TEXT,
    hint_en     TEXT,
    price_min   NUMERIC(10,2),
    price_max   NUMERIC(10,2),
    currency    VARCHAR(8) DEFAULT 'USD',
    sort_order  INT DEFAULT 0,
    is_active   BOOLEAN DEFAULT TRUE
);

-- 5. ЗАЯВКИ (REQUESTS / АУКЦИОНЫ)
CREATE TABLE requests (
    id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id                   UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    category_l1_id              UUID REFERENCES categories_l1(id) NOT NULL,
    category_l2_id              UUID REFERENCES categories_l2(id),
    category_l3_id              UUID REFERENCES categories_l3(id),
    hub                         VARCHAR(64) NOT NULL,
    district                    VARCHAR(128),

    title                       VARCHAR(256) NOT NULL,
    description                 TEXT NOT NULL,
    media_urls                  TEXT[] DEFAULT '{}',

    budget                      NUMERIC(10,2),
    currency                    VARCHAR(8) DEFAULT 'USD',

    is_featured                 BOOLEAN DEFAULT FALSE,
    status                      request_status DEFAULT 'open',

    auction_duration_minutes    INT NOT NULL DEFAULT 120,
    auction_ends_at             TIMESTAMP WITH TIME ZONE,
    auction_extended_count      INT DEFAULT 0,

    expires_at                  TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at                  TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 6. ОТКЛИКИ (BIDS)
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

-- 7. СДЕЛКИ (DEALS & IN-APP CHATS)
CREATE TABLE deals (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id      UUID REFERENCES requests(id) ON DELETE CASCADE NOT NULL,
    bid_id          UUID REFERENCES bids(id) ON DELETE CASCADE UNIQUE NOT NULL,
    client_id       UUID REFERENCES profiles(id) NOT NULL,
    provider_id     UUID REFERENCES profiles(id) NOT NULL,

    status          deal_status DEFAULT 'in_progress',
    agreed_price    NUMERIC(10,2) NOT NULL,
    currency        VARCHAR(8) DEFAULT 'USD',

    started_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at    TIMESTAMP WITH TIME ZONE,
    auto_close_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '7 days',
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 8. СООБЩЕНИЯ ВНУТРЕННЕГО ЧАТА (CHAT MESSAGES)
CREATE TABLE chat_messages (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id         UUID REFERENCES deals(id) ON DELETE CASCADE NOT NULL,
    sender_id       UUID REFERENCES profiles(id),
    sender_role     sender_role NOT NULL,
    type            message_type DEFAULT 'text',

    content         TEXT,
    media_url       TEXT,
    is_read         BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 9. ОТЗЫВЫ
CREATE TABLE reviews (
    id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id                  UUID REFERENCES requests(id) ON DELETE CASCADE NOT NULL,
    bid_id                      UUID REFERENCES bids(id) ON DELETE CASCADE NOT NULL,
    reviewer_id                 UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    provider_id                 UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

    rating                      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment                     TEXT,
    tags                        TEXT[] DEFAULT '{}',
    provider_reply              TEXT,

    status                      review_status DEFAULT 'pending',
    created_at                  TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 10. ИНДЕКСЫ & RLS
CREATE INDEX idx_deals_client   ON deals(client_id, status);
CREATE INDEX idx_deals_provider ON deals(provider_id, status);
CREATE INDEX idx_chat_messages_deal ON chat_messages(deal_id, created_at ASC);

ALTER TABLE deals          ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "deals_select_participant" ON deals FOR SELECT
    USING (auth.uid() = client_id OR auth.uid() = provider_id);

CREATE POLICY "chat_select_participant" ON chat_messages FOR SELECT
    USING (EXISTS (SELECT 1 FROM deals d WHERE d.id = deal_id AND (d.client_id = auth.uid() OR d.provider_id = auth.uid())));
