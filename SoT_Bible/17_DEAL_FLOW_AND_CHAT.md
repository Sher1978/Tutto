# 📁 17_DEAL_FLOW_AND_CHAT.md
> **NeedTnow** — Флоу сделки после принятия оффера + Внутренний чат + Апелляции  
> Версия: 1.0

---

## 1. Жизненный цикл сделки

```
[bid.status = 'accepted']
        │
        ▼
[deal создаётся автоматически]
  ┌─────────────────────────────┐
  │ deals.status = 'in_progress'│
  │ Чат открыт                  │
  │ Таймер сделки запущен       │
  └─────────────────────────────┘
        │
        ├─► Клиент и исполнитель общаются
        │
        ├─► Клиент нажимает «✅ Услуга оказана» → status = 'completed'
        │         └─► Открывается окно отзыва (review_slot)
        │
        ├─► Один из участников нажимает «⚖️ Апелляция» → status = 'disputed'
        │         └─► Чат помечается как «под модерацией»
        │         └─► Администратор получает уведомление
        │         └─► Администратор принимает решение
        │
        └─► Auto-close: Если 7 дней без активности → status = 'completed' (авто)
```

---

## 2. Таблица deals (новая)

```sql
CREATE TYPE deal_status AS ENUM (
    'in_progress',  -- Чат открыт, услуга оказывается
    'completed',    -- Услуга оказана (клиент подтвердил или авто)
    'disputed',     -- Открыта апелляция
    'cancelled'     -- Отменена до начала
);

CREATE TABLE deals (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id      UUID REFERENCES requests(id) ON DELETE CASCADE NOT NULL,
    bid_id          UUID REFERENCES bids(id) ON DELETE CASCADE UNIQUE NOT NULL,
    client_id       UUID REFERENCES profiles(id) NOT NULL,
    provider_id     UUID REFERENCES profiles(id) NOT NULL,

    status          deal_status DEFAULT 'in_progress',

    -- Детали сделки
    agreed_price    NUMERIC(10,2) NOT NULL,
    currency        VARCHAR(8) DEFAULT 'USD',

    -- Таймеры
    started_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at    TIMESTAMP WITH TIME ZONE,
    auto_close_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '7 days',

    -- Апелляция
    appeal_id       UUID,               -- FK → appeals (заполняется при открытии)

    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_deals_client   ON deals(client_id, status);
CREATE INDEX idx_deals_provider ON deals(provider_id, status);
CREATE INDEX idx_deals_status   ON deals(status);

ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "deals_select_participant"
    ON deals FOR SELECT
    USING (auth.uid() = client_id OR auth.uid() = provider_id);

-- Trigger: создание сделки при принятии оффера
CREATE OR REPLACE FUNCTION create_deal_on_bid_accept()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
        INSERT INTO deals (request_id, bid_id, client_id, provider_id, agreed_price, currency)
        SELECT
            NEW.request_id,
            NEW.id,
            r.client_id,
            NEW.provider_id,
            NEW.proposed_price,
            NEW.currency
        FROM requests r
        WHERE r.id = NEW.request_id
        ON CONFLICT (bid_id) DO NOTHING;

        -- Обновить статус заявки
        UPDATE requests SET status = 'in_progress' WHERE id = NEW.request_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_create_deal
    AFTER UPDATE OF status ON bids
    FOR EACH ROW EXECUTE FUNCTION create_deal_on_bid_accept();
```

---

## 3. Чат по сделке

### 3.1 Таблица сообщений — полная версия с медиа

```sql
CREATE TYPE message_type AS ENUM (
    'text',         -- обычное текстовое сообщение
    'image',        -- фото (Supabase Storage)
    'video',        -- видео (Supabase Storage)
    'location',     -- геолокация (pin на карте)
    'link',         -- URL с превью (OpenGraph)
    'file',         -- документ/файл (PDF и др.)
    'system'        -- системное сообщение (от платформы)
);

CREATE TYPE sender_role AS ENUM ('client', 'provider', 'system', 'admin', 'support');

CREATE TABLE chat_messages (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id         UUID REFERENCES deals(id) ON DELETE CASCADE NOT NULL,
    sender_id       UUID REFERENCES profiles(id),    -- NULL для system
    sender_role     sender_role NOT NULL,
    type            message_type DEFAULT 'text',

    -- Текст сообщения (для text, link — полный URL)
    content         TEXT,

    -- Медиа-вложение (для image/video/file)
    media_url       TEXT,                -- Supabase Storage public URL
    media_thumb_url TEXT,                -- миниатюра (для видео)
    media_size_kb   INT,                 -- размер файла в КБ
    media_name      TEXT,                -- оригинальное имя файла

    -- Геолокация (для type = 'location')
    geo_lat         NUMERIC(10,7),
    geo_lng         NUMERIC(10,7),
    geo_label       TEXT,                -- «Моё текущее местоположение» / «Место встречи»

    -- Превью ссылки (для type = 'link')
    link_url        TEXT,
    link_title      TEXT,
    link_description TEXT,
    link_image_url  TEXT,                -- OG-image

    -- Статус и метаданные
    is_read         BOOLEAN DEFAULT FALSE,
    reply_to_id     UUID REFERENCES chat_messages(id), -- цитирование
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_deal ON chat_messages(deal_id, created_at ASC);
CREATE INDEX idx_chat_unread ON chat_messages(deal_id, is_read) WHERE is_read = FALSE;

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chat_select_participant"
    ON chat_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM deals d
            WHERE d.id = deal_id
              AND (d.client_id = auth.uid() OR d.provider_id = auth.uid())
        )
    );

CREATE POLICY "chat_insert_participant"
    ON chat_messages FOR INSERT
    WITH CHECK (
        sender_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM deals d
            WHERE d.id = deal_id
              AND (d.client_id = auth.uid() OR d.provider_id = auth.uid())
              AND d.status IN ('in_progress', 'disputed')
        )
    );
```

### 3.2 Supabase Storage — пути и лимиты

```
Bucket: chat-media (public, RLS по deal_id)

Структура путей:
  chat-media/
    {deal_id}/
      images/   {uuid}.jpg|png|webp     ← фото
      videos/   {uuid}.mp4              ← видео
      files/    {uuid}_{original_name}  ← документы

Лимиты:
  Фото:   макс. 10 МБ, форматы: jpg/png/webp/heic
  Видео:  макс. 50 МБ, форматы: mp4/mov, авто-сжатие до 720p
  Файл:   макс. 20 МБ, форматы: pdf/doc/docx/xlsx
  За одно сообщение: 1 медиафайл (несколько = несколько сообщений)
```

### 3.3 Лимиты чата — обновлённые

| Тип | Лимит | Примечание |
|---|---|---|
| Текст | 2000 символов | — |
| Фото | 10 МБ | jpg/png/webp/heic |
| Видео | 50 МБ | mp4/mov, 720p |
| Файл | 20 МБ | pdf/doc/xlsx |
| Геолокация | — | любая точка |
| Ссылка | — | OG-превью авто |
| За одно сообщение | 1 медиа | текст можно добавить к медиа |
| Цитата | — | reply_to_id |
| Сообщений на сделку | 500 | затем архив |

```

### 3.2 Системные сообщения (автогенерируемые)

Платформа автоматически вставляет системные сообщения в чат при ключевых событиях:

```typescript
// Примеры системных сообщений

const SYSTEM_MESSAGES = {
  deal_created: (client: string, provider: string, price: string) =>
    `🤝 Сделка оформлена!\n\n👤 Клиент: ${client}\n🏢 Исполнитель: ${provider}\n💰 Сумма: ${price}\n\nДля уточнения деталей общайтесь здесь. История чата сохраняется.`,

  deal_completed: () =>
    `✅ Услуга подтверждена клиентом. Сделка завершена.\n\n⭐ Не забудьте оставить отзыв!`,

  deal_auto_completed: () =>
    `⏰ Сделка автоматически завершена (7 дней без активности).`,

  appeal_opened: (reason: string) =>
    `⚖️ Открыта апелляция.\n\nПричина: ${reason}\n\nАдминистратор рассмотрит ситуацию в течение 24–48 часов. Пожалуйста, не удаляйте доказательства.`,

  appeal_resolved_client: (note: string) =>
    `⚖️ Апелляция рассмотрена. Решение: в пользу клиента.\n\n${note}`,

  appeal_resolved_provider: (note: string) =>
    `⚖️ Апелляция рассмотрена. Решение: в пользу исполнителя.\n\n${note}`,

  admin_message: (text: string) =>
    `🛡️ Сообщение от администратора NeedTnow:\n\n${text}`,
};
```

---

## 4. UI — Экран чата (`/chats/:deal_id`)

### 4.1 Основной экран

```
┌─────────────────────────────────────────────────────┐
│  ← Назад                                   ⋮ Меню  │
│  [👤] Phuket Drive ✅   ⏳ В процессе              │
│  Аренда Honda PCX · $77                            │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [СИСТЕМНОЕ СООБЩЕНИЕ]                             │
│  ┌─────────────────────────────────────────────┐   │
│  │ 🤝 Сделка оформлена!                        │   │
│  │ 👤 Алексей  🏢 Phuket Drive  💰 $77         │   │
│  └─────────────────────────────────────────────┘   │
│                              10:23 · system        │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ Добрый день! Уточните адрес отеля           │   │
│  │ для доставки байка завтра.                  │   │
│  └─────────────────────────────────────────────┘   │
│  Phuket Drive · 10:25                              │
│                                                     │
│  [IMAGE BUBBLE — фото байка]                       │
│  ┌─────────────────────────────────────────────┐   │
│  │  [🖼️ Фото PCX 2023 — 1920×1080]           │   │
│  │  Вот байк — PCX 2023, состояние отличное   │   │
│  └─────────────────────────────────────────────┘   │
│  Phuket Drive · 10:26                              │
│                                                     │
│        ┌──────────────────────────────────────┐    │
│        │ SALA Phuket Resort, Rawai. Встречаем │    │
│        │ в 9:00.                              │    │
│        └──────────────────────────────────────┘    │
│                              Вы · 10:28 ✓✓        │
│                                                     │
│  [LOCATION BUBBLE]                                  │
│  ┌─────────────────────────────────────────────┐   │
│  │  📍 Моё местоположение                      │   │
│  │  [🗺️ Мини-карта с пином]                   │   │
│  │  SALA Phuket Resort — Раваи                 │   │
│  │  [ Открыть в Maps ]                         │   │
│  └─────────────────────────────────────────────┘   │
│  Вы · 10:29 ✓✓                                    │
│                                                     │
│  [LINK BUBBLE]                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │  [OG-image preview ──────────────────────]  │   │
│  │  honda.com/th/pcx                           │   │
│  │  Honda PCX 2023 — Official Specs            │   │
│  │  150cc, ABS, Smart Key...                   │   │
│  └─────────────────────────────────────────────┘   │
│  Phuket Drive · 10:31                              │
│                                                     │
├─────────────────────────────────────────────────────┤
│  [СТАТУС — только для клиента]                     │
│  [ ✅ Услуга оказана ]   [ ⚖️ Апелляция ]         │
│  ─────────────────────────────────────────────────  │
│                                                     │
│  ┌──────────────────────────────┐  [📎] [😊] [➤] │
│  │  Написать сообщение...       │                  │
│  └──────────────────────────────┘                  │
│  [📷] [🎥] [📍] [🔗] [📄]  ← медиа-панель        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 4.2 Медиа-панель ввода (Telegram-стиль)

```
┌─────────────────────────────────────────────────────┐
│  МЕДИА-ПАНЕЛЬ (раскрывается при нажатии [📎])      │
│  ─────────────────────────────────────────────────  │
│                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │    📷    │ │    🎥    │ │    📄    │            │
│  │   Фото   │ │  Видео   │ │   Файл   │            │
│  └──────────┘ └──────────┘ └──────────┘            │
│                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │    📍    │ │    🔗    │ │    📷    │            │
│  │ Геопозиция│ │  Ссылка  │ │ Камера   │            │
│  └──────────┘ └──────────┘ └──────────┘            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 4.3 Флоу каждого типа медиа

#### 📷 Фото / 🎥 Видео
```
Нажать [📷] или [🎥]
      │
      ├── [📷 Камера]      → нативный камера Telegram
      ├── [🖼️ Галерея]    → выбор из галереи устройства
      │
      ▼
Превью перед отправкой:
┌─────────────────────────────────┐
│  [Превью фото]    [✕ Удалить]  │
│  Добавить подпись...            │
│          [➤ Отправить]          │
└─────────────────────────────────┘
      │
      ▼
Upload → Supabase Storage → INSERT chat_messages
  type='image'|'video', media_url=..., content='подпись'
```

#### 📍 Геолокация
```
Нажать [📍 Геопозиция]
      │
      ├── [✓ Моё текущее место]  → TG.WebApp.LocationManager.getLocation()
      ├── [🗺️ Выбрать на карте]  → Leaflet fullscreen пикер
      └── [🏨 Популярные места]  → отель, аэропорт, пляж (быстрый выбор)
      │
      ▼
INSERT chat_messages:
  type='location'
  geo_lat=7.788, geo_lng=98.329
  geo_label='Моё местоположение'

Рендер: мини-карта 200px × 120px + кнопка «Открыть в Google Maps»
```

#### 🔗 Ссылка
```
Пользователь вставляет URL в поле ввода
      │
      ▼
[Автоматически — onPaste/onChange]:
  FastAPI: GET /api/og-preview?url={url}
  → fetch OpenGraph-теги (title, description, image)
      │
      ▼
Превью появляется над полем ввода:
┌─────────────────────────────────────────┐
│ [OG image]  airbnb.com                  │
│             Phuket Villa — 3 bedrooms   │
│             Starting at ฿ 3,500/night   │
│                              [✕]        │
└─────────────────────────────────────────┘
      │
      ▼
INSERT chat_messages:
  type='link'
  link_url='https://...'
  link_title='...', link_description='...'
  link_image_url='...'
```

#### 📄 Файл
```
Нажать [📄 Файл]
      │
      ▼
Системный файловый пикер (pdf/doc/xlsx)
      │
      ▼
Превью: [📄 договор_аренды.pdf  · 2.3 MB]  [✕]
      │
      ▼
Upload → chat-media/{deal_id}/files/
INSERT: type='file', media_url=..., media_name='договор_аренды.pdf'
```

### 4.4 Цитата (Reply)

```
Долгое нажатие на сообщение → «Ответить»
      │
      ▼
Над полем ввода появляется:
┌──────────────────────────────────────────┐
│ ↩️  Phuket Drive:                        │
│    «Байк будет в 8:50»           [✕]    │
└──────────────────────────────────────────┘
      │
      ▼
INSERT: reply_to_id = {id цитируемого сообщения}
Рендер: цитата над основным текстом с полосой слева (как в TG)
```

### 4.5 Меню «⋮» в чате (обновлено)

```
┌─────────────────────────────┐
│  📋 Детали сделки           │
│  📍 Поделиться геолокацией  │
│  📷 Отправить фото/видео    │
│  📄 Отправить файл          │
│  ⚖️ Открыть апелляцию      │
│  ⚠️ Пожаловаться            │
│  📥 Скачать историю чата   │
└─────────────────────────────┘
```



---

## 5. Подтверждение завершения — Bottom Sheet

### Клиент нажимает «✅ Услуга оказана»

```
┌─────────────────────────────────────────────────────┐
│  ┄┄┄┄┄┄                                             │
│  Подтвердить завершение сделки?                     │
│                                                     │
│  🏢 Phuket Drive                                    │
│  📋 Аренда Honda PCX · 7 дней                      │
│  💰 $77                                             │
│                                                     │
│  ✅ Нажимая «Подтвердить», вы подтверждаете,       │
│     что услуга была оказана в полном объёме.        │
│     После подтверждения откроется окно отзыва.     │
│                                                     │
│  [ ✅ Подтвердить получение ]   ← primary          │
│  [ Отмена ]                     ← ghost            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 6. Система апелляций

### 6.1 Таблица апелляций

```sql
CREATE TYPE appeal_status AS ENUM (
    'open',         -- Открыта, ожидает рассмотрения
    'in_review',    -- Администратор взял в работу
    'resolved_client',    -- Решено в пользу клиента
    'resolved_provider',  -- Решено в пользу исполнителя
    'dismissed'     -- Отклонена
);

CREATE TABLE appeals (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id         UUID REFERENCES deals(id) ON DELETE CASCADE UNIQUE NOT NULL,
    opened_by       UUID REFERENCES profiles(id) NOT NULL,
    opened_by_role  VARCHAR(16) NOT NULL,   -- 'client' | 'provider'

    reason          TEXT NOT NULL,          -- причина апелляции
    status          appeal_status DEFAULT 'open',
    admin_note      TEXT,                   -- решение администратора
    resolved_by     UUID,                   -- admin_user_id
    resolved_at     TIMESTAMP WITH TIME ZONE,

    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE appeals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "appeals_select_participant"
    ON appeals FOR SELECT
    USING (
        auth.uid() = opened_by
        OR EXISTS (
            SELECT 1 FROM deals d
            WHERE d.id = deal_id
              AND (d.client_id = auth.uid() OR d.provider_id = auth.uid())
        )
    );
CREATE POLICY "appeals_insert_participant"
    ON appeals FOR INSERT
    WITH CHECK (
        auth.uid() = opened_by
        AND EXISTS (
            SELECT 1 FROM deals d
            WHERE d.id = deal_id
              AND (d.client_id = auth.uid() OR d.provider_id = auth.uid())
        )
    );
```

### 6.2 Флоу открытия апелляции (клиент или исполнитель)

```
Участник нажимает «⚖️ Апелляция» в чате
        │
        ▼
[Bottom Sheet: Открыть апелляцию]
  ┌─────────────────────────────────────────────────────┐
  │  ┄┄┄┄┄┄                                             │
  │  ⚖️  Открыть апелляцию                              │
  │                                                     │
  │  Опишите проблему:                                  │
  │  ┌─────────────────────────────────────────────┐   │
  │  │ Байк оказался в плохом состоянии,           │   │
  │  │ цепь слетела трижды за первый день...       │   │
  │  └─────────────────────────────────────────────┘   │
  │                                                     │
  │  Вы можете прикрепить фото или видео:              │
  │  [📷 Фото] [🎥 Видео]                             │
  │                                                     │
  │  ⚠️ Администратор рассмотрит ситуацию              │
  │     в течение 24–48 часов. История чата            │
  │     будет предоставлена как доказательство.        │
  │                                                     │
  │  [ ⚖️ Открыть апелляцию ]   ← danger btn          │
  │  [ Отмена ]                  ← ghost               │
  └─────────────────────────────────────────────────────┘
        │
        ▼
[appeals INSERT, deal.status → 'disputed']
[Системное сообщение в чат: «Открыта апелляция»]
[Push клиенту/исполнителю и администратору]
        │
        ▼
[Admin Panel → /admin/appeals]
  Администратор читает историю чата + апелляцию
        │
        ├─► Принимает решение: resolved_client / resolved_provider
        │
        └─► [appeal.status → resolved_*]
            [deal.status → 'completed']
            [Системное сообщение в чат с решением]
            [Push обоим участникам]
```

### 6.3 Доступность истории чата для администратора

**Ключевой принцип:** История чата **всегда доступна** администратору, независимо от статуса сделки или апелляции.

```sql
-- Admin Policy (без RLS — через service_role key)
-- Все chat_messages доступны администраторам через service_role

-- Для чтения истории через Admin Panel:
-- Запрос без RLS (service_role):
SELECT cm.*, 
    p.first_name, p.username, p.telegram_id
FROM chat_messages cm
LEFT JOIN profiles p ON p.id = cm.sender_id
WHERE cm.deal_id = '{deal_id}'
ORDER BY cm.created_at ASC;
```

---

## 7. Лимиты и правила чата

| Правило | Значение |
|---|---|
| Максимум фото в одном сообщении | 1 (следующее — отдельным сообщением) |
| Макс. размер фото | 10 MB |
| Максимум символов в сообщении | 2000 |
| Чат закрывается | При `deal.status = 'completed'` (нельзя писать) |
| Апелляция может быть открыта | До 7 дней после принятия оффера |
| Апелляция — один раз | `UNIQUE(deal_id)` на таблице appeals |
| Лимит сообщений | 500 на сделку (затем архив) |

---

## 8. Supabase Realtime — Подписка на чат + медиа-хук

```typescript
// frontend/src/hooks/useChat.ts

import { supabase } from '@/lib/supabase';
import { useState, useEffect, useCallback } from 'react';

export type MessageType = 'text' | 'image' | 'video' | 'location' | 'link' | 'file' | 'system';

export interface SendMediaPayload {
  type: MessageType;
  content?: string;          // подпись или текст
  file?: File;               // для image/video/file
  geo?: { lat: number; lng: number; label?: string }; // для location
  url?: string;              // для link
}

export function useChat(dealId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // Загрузить историю
    supabase
      .from('chat_messages')
      .select(`
        *,
        sender:profiles!chat_messages_sender_id_fkey(first_name, photo_url),
        reply_to:chat_messages!reply_to_id(id, type, content, sender_role)
      `)
      .eq('deal_id', dealId)
      .order('created_at', { ascending: true })
      .then(({ data }) => setMessages(data ?? []));

    // Realtime подписка
    const channel = supabase
      .channel(`chat_${dealId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `deal_id=eq.${dealId}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as ChatMessage]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [dealId]);

  // ── Загрузка медиа в Supabase Storage ──
  const uploadMedia = async (file: File, folder: 'images' | 'videos' | 'files') => {
    const ext = file.name.split('.').pop();
    const path = `${dealId}/${folder}/${crypto.randomUUID()}.${ext}`;
    const { data, error } = await supabase.storage
      .from('chat-media')
      .upload(path, file, { cacheControl: '3600', upsert: false });
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from('chat-media').getPublicUrl(path);
    return { url: publicUrl, path };
  };

  // ── Превью ссылки через FastAPI ──
  const fetchLinkPreview = async (url: string) => {
    const res = await fetch(`/api/og-preview?url=${encodeURIComponent(url)}`);
    return res.ok ? res.json() : null;
  };

  // ── Основной отправщик ──
  const sendMessage = useCallback(async (
    payload: SendMediaPayload,
    replyToId?: string
  ) => {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    const base = {
      deal_id: dealId,
      sender_id: userId,
      sender_role: 'client' as const,   // определяется в контексте
      reply_to_id: replyToId ?? null,
    };

    setUploading(true);
    try {
      switch (payload.type) {

        case 'text':
          await supabase.from('chat_messages').insert({
            ...base, type: 'text', content: payload.content,
          });
          break;

        case 'image':
        case 'video': {
          const folder = payload.type === 'image' ? 'images' : 'videos';
          const { url } = await uploadMedia(payload.file!, folder);
          await supabase.from('chat_messages').insert({
            ...base, type: payload.type,
            media_url: url,
            media_name: payload.file!.name,
            media_size_kb: Math.round(payload.file!.size / 1024),
            content: payload.content ?? null,
          });
          break;
        }

        case 'file': {
          const { url } = await uploadMedia(payload.file!, 'files');
          await supabase.from('chat_messages').insert({
            ...base, type: 'file',
            media_url: url,
            media_name: payload.file!.name,
            media_size_kb: Math.round(payload.file!.size / 1024),
          });
          break;
        }

        case 'location':
          await supabase.from('chat_messages').insert({
            ...base, type: 'location',
            geo_lat: payload.geo!.lat,
            geo_lng: payload.geo!.lng,
            geo_label: payload.geo!.label ?? 'Моё местоположение',
          });
          break;

        case 'link': {
          const preview = await fetchLinkPreview(payload.url!);
          await supabase.from('chat_messages').insert({
            ...base, type: 'link',
            link_url: payload.url,
            link_title: preview?.title ?? null,
            link_description: preview?.description ?? null,
            link_image_url: preview?.image ?? null,
            content: payload.content ?? null,
          });
          break;
        }
      }
    } finally {
      setUploading(false);
    }
  }, [dealId]);

  return { messages, sendMessage, uploading };
}
```



---

## 9. CRON: Авто-закрытие сделок

```sql
-- Supabase pg_cron: каждый день в полночь UTC
SELECT cron.schedule(
    'auto-close-deals',
    '0 0 * * *',
    $$
        -- Авто-завершение сделок после 7 дней
        UPDATE deals
        SET status = 'completed',
            completed_at = NOW()
        WHERE status = 'in_progress'
          AND auto_close_at < NOW();

        -- Вставить системное сообщение в завершённые чаты
        INSERT INTO chat_messages (deal_id, sender_role, type, content)
        SELECT id, 'system', 'system',
               '⏰ Сделка автоматически завершена (7 дней без активности).'
        FROM deals
        WHERE status = 'completed'
          AND completed_at >= NOW() - INTERVAL '1 minute'
          AND completed_at = auto_close_at; -- авто-закрытие
    $$
);
```

---

## 10. Обновлённая ERD (дополнение к 02_DATABASE_SCHEMA.md)

```
bids ── deals              (bid_id — 1:1)
deals ──< chat_messages    (deal_id)
deals ── appeals           (deal_id — 1:1)
profiles ──< deals         (client_id, provider_id)
profiles ──< chat_messages (sender_id)
appeals — profiles         (opened_by)
profiles ──< support_tickets  (user_id)
support_tickets ──< support_messages (ticket_id)
```

---

## 11. Чат с поддержкой (`/support`)

### 11.1 Концепция

| Параметр | Значение |
|---|---|
| Участники | Пользователь (клиент/бизнес) + агент поддержки |
| Медиа | Те же 6 типов: текст, фото, видео, гео, ссылка, файл |
| Цитата | ✅ Reply как в чате сделки |
| SLA | Первый ответ ≤ 2 часа (рабочее время), приоритетный — 30 мин |
| CSAT | Оценка после закрытия тикета (1–5 ⭐) |

### 11.2 DB — Тикеты поддержки

```sql
CREATE TYPE ticket_category AS ENUM (
    'payment',      -- вопросы по токенам и оплате
    'deal',         -- спор по сделке (без апелляции)
    'account',      -- аккаунт, блокировка
    'bug',          -- ошибка в приложении
    'other'
);

CREATE TYPE ticket_status AS ENUM (
    'open',         -- ожидает агента
    'in_progress',  -- агент отвечает
    'resolved',     -- закрыт агентом
    'rated'         -- клиент оценил
);

CREATE TABLE support_tickets (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES profiles(id) NOT NULL,
    category        ticket_category DEFAULT 'other',
    subject         TEXT NOT NULL,           -- краткая тема
    status          ticket_status DEFAULT 'open',
    priority        SMALLINT DEFAULT 2,      -- 1=высокий, 2=норм, 3=низкий

    -- Связь с deal/appeal если применимо
    deal_id         UUID REFERENCES deals(id),
    appeal_id       UUID REFERENCES appeals(id),

    assigned_to     UUID,                    -- admin/support user id
    first_reply_at  TIMESTAMP WITH TIME ZONE,
    resolved_at     TIMESTAMP WITH TIME ZONE,
    csat_score      SMALLINT CHECK (csat_score BETWEEN 1 AND 5),
    csat_comment    TEXT,

    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE support_messages (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id       UUID REFERENCES support_tickets(id) ON DELETE CASCADE NOT NULL,
    sender_id       UUID REFERENCES profiles(id),
    sender_role     VARCHAR(16) NOT NULL,    -- 'user' | 'support' | 'system'

    -- Те же поля медиа что и в chat_messages
    type            message_type NOT NULL DEFAULT 'text',
    content         TEXT,
    media_url       TEXT,
    media_thumb_url TEXT,
    media_size_kb   INT,
    media_name      TEXT,
    geo_lat         NUMERIC(10,7),
    geo_lng         NUMERIC(10,7),
    geo_label       TEXT,
    link_url        TEXT,
    link_title      TEXT,
    link_description TEXT,
    link_image_url  TEXT,
    reply_to_id     UUID REFERENCES support_messages(id),
    is_read         BOOLEAN DEFAULT FALSE,

    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_support_msg_ticket ON support_messages(ticket_id, created_at ASC);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "support_ticket_owner"
    ON support_tickets FOR ALL
    USING (auth.uid() = user_id);

ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "support_msg_owner"
    ON support_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM support_tickets t
            WHERE t.id = ticket_id AND t.user_id = auth.uid()
        )
    );
```

### 11.3 UI — Экран чата поддержки (`/support/:ticket_id`)

```
┌─────────────────────────────────────────────────────┐
│  ← Назад              🛡️ Поддержка          ⋮      │
│  Тема: Проблема с оплатой токенов                   │
│  🟡 В обработке  ·  Агент: Sophia                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [СИСТЕМНОЕ СООБЩЕНИЕ]                             │
│  ┌─────────────────────────────────────────────┐   │
│  │ 🛡️ Тикет #4821 открыт.                     │   │
│  │ Тема: Проблема с оплатой токенов            │   │
│  │ Среднее время ответа: до 2 часов            │   │
│  └─────────────────────────────────────────────┘   │
│                              14:01 · system        │
│                                                     │
│        ┌──────────────────────────────────────┐    │
│        │ Добрый день! Оплатил 1000 токенов,   │    │
│        │ но они не зачислились. Чек во вложении│   │
│        └──────────────────────────────────────┘    │
│                              Вы · 14:02 ✓✓        │
│                                                     │
│  [FILE BUBBLE]                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │  📄 receipt_stripe_4821.pdf   · 142 KB     │   │
│  │  [ Открыть ]                                │   │
│  └─────────────────────────────────────────────┘   │
│                              Вы · 14:02 ✓✓        │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ Здравствуйте! Sophia из поддержки.          │   │
│  │ Проверяю ваш платёж, займёт 5-10 минут.    │   │
│  └─────────────────────────────────────────────┘   │
│  🛡️ Sophia · 14:09                                │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────────────────┐  [📎] [😊] [➤] │
│  │  Написать в поддержку...     │                  │
│  └──────────────────────────────┘                  │
│  [📷] [🎥] [📍] [🔗] [📄]  ← та же медиа-панель  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 11.4 Создание тикета — Bottom Sheet

```
┌─────────────────────────────────────────────────────┐
│  ┄┄┄┄┄┄                                             │
│  🛡️ Написать в поддержку                            │
│                                                     │
│  Тема:                                              │
│  ┌─────────────────────────────────────────────┐   │
│  │ Кратко опишите проблему...                  │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  Категория:                                         │
│  [💳 Оплата] [🤝 Сделка] [👤 Аккаунт] [🐛 Баг]  │
│                                                     │
│  Прикрепить скриншот (опц.):                       │
│  [📷 Фото] [📄 Файл]                              │
│                                                     │
│  [Связано со сделкой? Выбрать ▾]                   │
│                                                     │
│  [ 🛡️ Отправить тикет ]   ← primary btn           │
│  [ Отмена ]                ← ghost                 │
└─────────────────────────────────────────────────────┘
```

### 11.5 CSAT — Оценка поддержки

После закрытия тикета агентом — через 30 мин. приходит push и в чате системное сообщение:

```
┌─────────────────────────────────────────────────────┐
│  [СИСТЕМНОЕ СООБЩЕНИЕ]                             │
│  ┌─────────────────────────────────────────────┐   │
│  │ ✅ Тикет закрыт агентом Sophia.             │   │
│  │ Оцените качество поддержки:                 │   │
│  │                                             │   │
│  │        ⭐ ⭐ ⭐ ⭐ ⭐                       │   │
│  │  [😠]  [😕]  [😐]  [🙂]  [😍]             │   │
│  │                                             │   │
│  │  Комментарий (опц.):                        │   │
│  │  ┌─────────────────────────────────────┐   │   │
│  │  │ Sophia помогла быстро, спасибо!     │   │   │
│  │  └─────────────────────────────────────┘   │   │
│  │                                             │   │
│  │  [ ✅ Отправить оценку ]                   │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### 11.6 TypeScript хук поддержки

```typescript
// frontend/src/hooks/useSupportChat.ts
// Идентичен useChat, но работает с support_tickets / support_messages

export function useSupportChat(ticketId: string) {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    supabase
      .from('support_messages')
      .select('*, reply_to:support_messages!reply_to_id(id, type, content)')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true })
      .then(({ data }) => setMessages(data ?? []));

    const channel = supabase
      .channel(`support_${ticketId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public',
        table: 'support_messages',
        filter: `ticket_id=eq.${ticketId}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as SupportMessage]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [ticketId]);

  // Тот же sendMessage pattern — upload → insert
  // (реализация идентична useChat, источник — support_messages)
  const sendMessage = useCallback(async (
    payload: SendMediaPayload, replyToId?: string
  ) => { /* идентично useChat, table: 'support_messages', ticket_id */ }, [ticketId]);

  return { messages, sendMessage, uploading };
}
```

### 11.7 SLA-мониторинг (Admin)

```sql
-- Тикеты без ответа дольше 2 часов → high priority alert
SELECT st.id, st.subject, st.created_at,
       EXTRACT(EPOCH FROM (NOW() - st.created_at)) / 3600 AS hours_open
FROM support_tickets st
WHERE st.status = 'open'
  AND st.first_reply_at IS NULL
  AND st.created_at < NOW() - INTERVAL '2 hours'
ORDER BY st.created_at ASC;

-- pg_cron: каждые 30 мин. уведомить команду поддержки
SELECT cron.schedule(
    'support-sla-alert', '*/30 * * * *',
    $$ SELECT notify_support_team_sla_breach(); $$
);
```

