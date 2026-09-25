# 📁 11_REVIEWS_AND_AUCTION_TIMING.md
> **NeedTnow** — Система отзывов + Тайминги аукциона  
> Версия: 1.0 | Дата: 2026-09-25

---

# ЧАСТЬ 1: СИСТЕМА ОТЗЫВОВ

---

## 1.1 Концепция и ключевые принципы

### Кто может оставить отзыв
- **Только клиент**, который нажал «Принять предложение» (bid.status = `'accepted'`).
- Отзыв привязан к конкретной паре: `(request_id, bid_id)` — один заказ = один отзыв.
- Исполнитель **не может** оставить отзыв о клиенте в MVP (оставляем для v2).

### Окно для отзыва
- Открывается сразу после принятия оффера.
- Закрывается через **7 дней** (после этого кнопка «Оставить отзыв» исчезает).
- Если пользователь не оставил отзыв — напоминание через **24 часа** (push в Telegram).

### Что оценивается
- **⭐ Рейтинг** (1–5 звёзд) — обязательное поле.
- **📝 Текстовый комментарий** — необязательное, но поощряемое (мин. 20 символов для публикации).
- **Теги** — быстрые метки: `✅ Вовремя` | `💬 Хорошая связь` | `💰 Цена соответствует` | `👍 Рекомендую` | `❌ Опоздал` | `⚠️ Цена выше обещанной`.

---

## 1.2 Схема базы данных

```sql
-- ============================================================
-- СИСТЕМА ОТЗЫВОВ (добавить к основной схеме v1.2)
-- ============================================================

CREATE TYPE review_status AS ENUM ('pending', 'published', 'hidden', 'flagged');

CREATE TABLE reviews (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Связи (строго верифицированные)
    request_id      UUID REFERENCES requests(id) ON DELETE CASCADE NOT NULL,
    bid_id          UUID REFERENCES bids(id) ON DELETE CASCADE NOT NULL,
    reviewer_id     UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,   -- клиент
    provider_id     UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,   -- исполнитель

    -- Контент
    rating          SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment         TEXT,                                 -- необязательный текст
    tags            TEXT[] DEFAULT '{}',                  -- быстрые теги

    -- Ответ исполнителя
    provider_reply  TEXT,
    replied_at      TIMESTAMP WITH TIME ZONE,

    -- Статус и модерация
    status          review_status DEFAULT 'pending',
    moderation_note TEXT,                                 -- причина скрытия (admin)
    ai_score        NUMERIC(4,2),                         -- score от AI-модератора (0–1)

    -- Антифрод поля
    review_window_expires_at  TIMESTAMP WITH TIME ZONE NOT NULL,  -- deadline: created_at + 7 days
    ip_hash         VARCHAR(64),                          -- хэш IP (не храним сам IP)
    device_fp       VARCHAR(64),                          -- fingerprint устройства

    created_at      TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),

    -- Ключевые ограничения
    UNIQUE(bid_id),                 -- один отзыв на одну сделку
    UNIQUE(request_id, reviewer_id) -- клиент не напишет два отзыва к одному заказу
);

-- Индексы
CREATE INDEX idx_reviews_provider    ON reviews(provider_id, status);
CREATE INDEX idx_reviews_request     ON reviews(request_id);
CREATE INDEX idx_reviews_created     ON reviews(created_at DESC);

-- RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews_select_published"
    ON reviews FOR SELECT
    USING (status = 'published');

CREATE POLICY "reviews_insert_verified_client"
    ON reviews FOR INSERT
    WITH CHECK (
        auth.uid() = reviewer_id
        AND NOW() < review_window_expires_at
        AND EXISTS (
            SELECT 1 FROM bids b
            WHERE b.id = bid_id
              AND b.status = 'accepted'
              AND b.request_id = reviews.request_id
        )
        AND EXISTS (
            SELECT 1 FROM requests r
            WHERE r.id = request_id
              AND r.client_id = auth.uid()
        )
    );

CREATE POLICY "reviews_provider_reply"
    ON reviews FOR UPDATE
    USING (
        auth.uid() = provider_id
        AND provider_reply IS NULL  -- ответить можно только один раз
    )
    WITH CHECK (
        provider_reply IS NOT NULL
        AND replied_at IS NOT NULL
    );
```

### Trigger: авто-открытие окна отзыва при принятии оффера

```sql
-- Функция: при UPDATE bids SET status='accepted' → создаём "слот" для отзыва
CREATE OR REPLACE FUNCTION create_review_slot()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
        -- Проверяем что слот ещё не создан
        INSERT INTO review_slots (request_id, bid_id, reviewer_id, provider_id, expires_at)
        SELECT
            NEW.request_id,
            NEW.id,
            r.client_id,
            NEW.provider_id,
            NOW() + INTERVAL '7 days'
        FROM requests r WHERE r.id = NEW.request_id
        ON CONFLICT (bid_id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_create_review_slot
    AFTER UPDATE ON bids
    FOR EACH ROW EXECUTE FUNCTION create_review_slot();

-- review_slots — лёгкая таблица-флаг (отдельно от reviews для производительности)
CREATE TABLE review_slots (
    bid_id          UUID PRIMARY KEY REFERENCES bids(id),
    request_id      UUID NOT NULL,
    reviewer_id     UUID NOT NULL,   -- клиент
    provider_id     UUID NOT NULL,   -- исполнитель
    expires_at      TIMESTAMP WITH TIME ZONE NOT NULL,
    review_id       UUID REFERENCES reviews(id), -- NULL до написания
    notified_24h    BOOLEAN DEFAULT FALSE         -- флаг напоминания
);
```

---

## 1.3 Антифрод и защита от накруток

### Уровень 1 — Верификация сделки (DB-уровень)

| Правило | Реализация |
|---|---|
| Только реальный покупатель | RLS: `auth.uid() = reviewer_id` + EXISTS(bid accepted) |
| Один отзыв на сделку | `UNIQUE(bid_id)` constraint |
| Дедлайн 7 дней | `CHECK(NOW() < review_window_expires_at)` |
| Нельзя оценить себя | `CHECK(reviewer_id != provider_id)` |
| Нельзя оценить чужую сделку | EXISTS(request.client_id = reviewer_id) |

### Уровень 2 — AI-модерация текста

При создании отзыва Edge Function вызывает OpenAI для проверки:

```python
REVIEW_MODERATION_PROMPT = """
Ты — модератор отзывов платформы сервисов в ЮВА.

Текст отзыва:
"{review_text}"

Рейтинг: {rating}/5
Теги: {tags}

Проверь на:
1. Спам / нерелевантный контент
2. Рекламу конкурентов или внешних ресурсов
3. Оскорбления, угрозы, ненормативную лексику
4. Явно заказные / шаблонные «накрученные» отзывы
5. Персональные данные (номера телефонов, адреса)

Верни JSON:
{
  "approve": true/false,
  "score": 0.0–1.0,  // 1.0 = точно легитимный
  "reason": "причина если approve=false"
}
"""
```

- `score >= 0.75` → `status = 'published'` (авто)
- `score 0.4–0.74` → `status = 'pending'` (ручная модерация)
- `score < 0.4` → `status = 'hidden'` (авто-скрыт, уведомление автору)

### Уровень 3 — Детектор паттернов (Scheduled Job)

Ежедневная Supabase Cron Function проверяет аномалии:

```sql
-- Подозрительный паттерн: >3 отзывов одному провайдеру за 24 часа
-- от аккаунтов с одинаковым ip_hash
SELECT provider_id, ip_hash, COUNT(*) as cnt
FROM reviews
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY provider_id, ip_hash
HAVING COUNT(*) > 3;

-- Подозрительный паттерн: все отзывы 5 звёзд без текста за неделю
SELECT provider_id, COUNT(*) as cnt
FROM reviews
WHERE created_at > NOW() - INTERVAL '7 days'
  AND rating = 5
  AND (comment IS NULL OR LENGTH(comment) < 10)
GROUP BY provider_id
HAVING COUNT(*) > 5;
```

Если аномалия найдена → статус профиля `flagged_for_review` → ручная модерация.

### Уровень 4 — Дополнительные защиты

| Мера | Описание |
|---|---|
| **Device Fingerprint** | FingerprintJS на фронте, сохраняем хэш. Один девайс ≠ много разных аккаунтов |
| **Cooling period** | После удаления аккаунта — новый аккаунт с тем же Telegram ID не может оставлять отзывы 30 дней |
| **Минимальный аккаунт** | Отзыв доступен только если аккаунт старше 24 часов |
| **Rate limit** | Не более 10 отзывов от одного пользователя в месяц |
| **TG ID как якорь** | Telegram ID — неизменный уникальный идентификатор, привязанный к реальному номеру телефона |

---

## 1.4 UX — Флоу написания отзыва

```
[Push через 30 мин после принятия оффера]
«⭐ Как всё прошло? Оцените {company_name}»
       │
       ▼ [Deep Link → /review/:bid_id]
[Экран отзыва]

┌─────────────────────────────────────────────────┐
│  Как вам услуга от                              │
│  🛵 Phuket Drive?                               │
├─────────────────────────────────────────────────┤
│         ☆  ☆  ☆  ☆  ☆                          │
│    (тапаешь — анимированно заполняется ⭐)       │
├─────────────────────────────────────────────────┤
│  Быстрые теги (мульти-выбор):                   │
│  [✅ Вовремя] [💬 Отличная связь]               │
│  [💰 Цена ок] [👍 Рекомендую]                   │
├─────────────────────────────────────────────────┤
│  Расскажите подробнее (необязательно):          │
│  ┌─────────────────────────────────────────┐   │
│  │ Байк был в отличном состоянии, доставили│   │
│  │ прямо к отелю. Буду снова!              │   │
│  └─────────────────────────────────────────┘   │
│  (минимум 20 символов для публикации)           │
├─────────────────────────────────────────────────┤
│       [ ✅ Опубликовать отзыв ]                 │
│       [ Пропустить → ] (ghost btn)              │
└─────────────────────────────────────────────────┘
```

---

## 1.5 Отображение отзывов на бизнес-карточке

```
┌─────────────────────────────────────────────────────┐
│  ⭐ 4.9   128 отзывов                               │
│  ████████████████████░░  (progress bar по звёздам)  │
│  5★ ████████████  87%                               │
│  4★ ████          10%                               │
│  3★ █              2%                               │
│  2★                1%                               │
├─────────────────────────────────────────────────────┤
│  ПОСЛЕДНИЕ ОТЗЫВЫ                                    │
│                                                     │
│  @maria_k  ⭐⭐⭐⭐⭐  3 дня назад                   │
│  [✅ Вовремя] [👍 Рекомендую]                       │
│  «Отличный байк, доставили в отель в 8 утра!»      │
│                                                     │
│  💬 Ответ Phuket Drive:                             │
│  «Спасибо, Мария! Ждём вас снова 🙏»               │
│  ─────────────────────────────────────────────────  │
│  @alex_m  ⭐⭐⭐⭐  5 дней назад                     │
│  [💰 Цена ок] [💬 Отличная связь]                   │
│  «Хороший сервис, немного опоздали с доставкой»    │
│                                                     │
│           [ Показать все отзывы (128) ]             │
└─────────────────────────────────────────────────────┘
```

---

## 1.6 Пересчёт рейтинга провайдера

```sql
-- Функция: пересчитать средний рейтинг и deals_count при новом отзыве
CREATE OR REPLACE FUNCTION update_provider_rating()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'published' THEN
        UPDATE profiles SET
            rating = (
                SELECT ROUND(AVG(rating)::numeric, 2)
                FROM reviews
                WHERE provider_id = NEW.provider_id
                  AND status = 'published'
            ),
            deals_count = (
                SELECT COUNT(*)
                FROM reviews
                WHERE provider_id = NEW.provider_id
                  AND status = 'published'
            )
        WHERE id = NEW.provider_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_update_provider_rating
    AFTER INSERT OR UPDATE OF status ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_provider_rating();
```

---

---

# ЧАСТЬ 2: ТАЙМИНГИ АУКЦИОНА

---

## 2.1 Концепция

### Жизненный цикл аукциона

```
[Заказ создан]
    │
    ▼ status = 'open'
[⏳ Таймер аукциона запущен]
    │
    ├─► Приходят офферы (manual + AI)
    │
    ├─► Клиент нажимает «Принять оффер» → аукцион завершён досрочно
    │
    └─► Таймер истёк → status = 'expired'
              └─► Push клиенту: «Время вышло. Продлить аукцион?»
```

### Ключевые правила

1. **Дефолтное время** — задаётся по нише (L1 категории) при создании заказа.
2. **Клиент может продлить** вручную, выбрав из вариантов: `+30 мин` | `+1 ч` | `+2 ч` | `+6 ч` | `+24 ч`.
3. **Принятие оффера** немедленно завершает аукцион и переводит остальные биды в `'rejected'`.
4. **Кнопка «Принять»** на каждой BidCard визуально «опустошается» как батарейка — справа налево — синхронно с таймером.
5. **Исполнитель не видит** точного оставшегося времени (только клиент) — это стимулирует делать сильные офферы сразу.

---

## 2.2 Дефолтные тайминги по нишам

| L1 Категория | Код | Дефолт | Логика |
|---|---|---|---|
| 🍽️ Еда и доставка | `food` | **15 мин** | Максимальная срочность, клиент голоден |
| 🚗 Транспорт (трансфер) | `transfer` | **30 мин** | Нужно быстро, рейс не ждёт |
| 🚗 Транспорт (прокат байка/авто) | `transport` | **45 мин** | Срочно, но не критично |
| 🔧 Ремонт и мастер | `services` | **1 ч** | Нужно в этот день |
| 💆 Красота и здоровье | `beauty` | **2 ч** | Планируется на сегодня/завтра |
| 🗺️ Туры и активности | `tours` | **3 ч** | Обычно планируют за день |
| 🧹 Клининг | `cleaning` | **4 ч** | Планируют заранее |
| 🏡 Жильё (краткосрочное) | `housing_short` | **6 ч** | Нужен вариант на ближайшее время |
| 🏡 Жильё (долгосрочное) | `housing_long` | **24 ч** | Требует обдумывания |

### Логика определения дефолта

```typescript
// frontend/src/utils/auctionTiming.ts

export const AUCTION_DEFAULTS_MINUTES: Record<string, number> = {
  food:           15,
  transport:      45,
  transfer:       30,   // L2-уровень, перекрывает transport
  cleaning:       240,
  beauty:         120,
  tours:          180,
  services:       60,
  housing:        360,
  housing_long:   1440,
};

// При создании заказа — выбираем дефолт по L1 slug
// Если L2 = 'transport_transfer' — переопределяем на 30 мин
export function getDefaultAuctionMinutes(
  l1Slug: string,
  l2Slug?: string
): number {
  if (l2Slug === 'transport_transfer') return AUCTION_DEFAULTS_MINUTES.transfer;
  if (l2Slug === 'housing_condo' && /* долгосрочная */ true) {
    // определяется по тегу в L3 или отдельному полю
  }
  return AUCTION_DEFAULTS_MINUTES[l1Slug] ?? 120;
}

// Варианты продления
export const EXTENSION_OPTIONS_MINUTES = [30, 60, 120, 360, 1440];
```

---

## 2.3 Изменения в схеме БД

```sql
-- Добавить в таблицу requests (дополнение к v1.2):

ALTER TABLE requests
    ADD COLUMN IF NOT EXISTS auction_duration_minutes INT NOT NULL DEFAULT 120,
    ADD COLUMN IF NOT EXISTS auction_ends_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS auction_extended_count INT DEFAULT 0;  -- кол-во продлений

-- При INSERT — auction_ends_at = created_at + auction_duration_minutes * interval '1 min'
-- Реализуется через Supabase Edge Function или DB trigger:

CREATE OR REPLACE FUNCTION set_auction_end()
RETURNS TRIGGER AS $$
BEGIN
    NEW.auction_ends_at := NEW.created_at + (NEW.auction_duration_minutes || ' minutes')::INTERVAL;
    NEW.expires_at := NEW.auction_ends_at;  -- синхронизируем с существующим полем
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_auction_end
    BEFORE INSERT ON requests
    FOR EACH ROW EXECUTE FUNCTION set_auction_end();

-- Функция продления аукциона
CREATE OR REPLACE FUNCTION extend_auction(
    p_request_id UUID,
    p_extension_minutes INT,
    p_user_id UUID
)
RETURNS VOID AS $$
BEGIN
    -- Проверяем что запрашивает сам клиент и аукцион ещё открыт
    UPDATE requests SET
        auction_ends_at = auction_ends_at + (p_extension_minutes || ' minutes')::INTERVAL,
        expires_at = expires_at + (p_extension_minutes || ' minutes')::INTERVAL,
        auction_extended_count = auction_extended_count + 1
    WHERE id = p_request_id
      AND client_id = p_user_id
      AND status = 'open'
      AND auction_extended_count < 3;  -- максимум 3 продления
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Автоматическое закрытие истекших аукционов (CRON каждую минуту)
-- Supabase pg_cron:
SELECT cron.schedule(
    'expire-auctions',
    '* * * * *',
    $$
        UPDATE requests
        SET status = 'expired'
        WHERE status = 'open'
          AND auction_ends_at < NOW();
    $$
);
```

---

## 2.4 UI — Таймер и кнопка «Принять» (Draining Battery)

### Логика таймера на экране заказа

```
[Экран /request/:id — вид клиента]

┌──────────────────────────────────────────────┐
│  ⏱️  До конца аукциона: 00:38:17             │
│  ████████████████████████░░░░░░░░░  (прогресс)│
│                           [ + Продлить ▾ ]   │
└──────────────────────────────────────────────┘

          ↓ список офферов ↓

┌──────────────────────────────────────────────┐
│  🛵 Phuket Drive   ⭐4.9   🤖 AI             │
│  $11/день                                    │
│  «PCX 2023. Доставка в Раваи бесплатно»     │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │ ✓ Принять предложение  ████████░░░░░░ │  │
│  └────────────────────────────────────────┘  │
│               ↑ "батарейка" опустошается     │
└──────────────────────────────────────────────┘
```

---

### Спецификация кнопки-батарейки (Draining Button)

**Поведение:**
- Кнопка полностью заполнена зелёным `#00FF87` в момент появления оффера.
- Медленно опустошается **справа налево** — пропорционально оставшемуся времени аукциона.
- При `≤ 20%` оставшегося времени — цвет меняется на `#FFD166` (жёлтый, предупреждение).
- При `≤ 10%` — цвет `#FF2A6D` (красный, критично).
- При нажатии — полный нативный ripple + success-анимация.

**CSS реализация:**

```css
/* DrainingButton.css */

.draining-btn {
  position: relative;
  overflow: hidden;
  border-radius: 14px;
  height: 52px;
  width: 100%;
  border: none;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  color: #0D1117;
  transition: transform 0.1s ease;
}

/* Слой-заливка (анимированный) */
.draining-btn__fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  /* width управляется через JS: percentRemaining% */
  background: var(--fill-color, #00FF87);
  transition: width 1s linear, background-color 0.5s ease;
  z-index: 0;
  border-radius: 14px;
}

/* Текст поверх заливки */
.draining-btn__label {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 100%;
  padding: 0 20px;
  /* текст всегда читаем — mix-blend-mode */
  mix-blend-mode: normal;
  color: #0D1117;
  text-shadow: none;
}

/* Фоновый слой (пустая часть) */
.draining-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: #21262D;
  border-radius: 14px;
  z-index: -1;
}

/* Состояния цвета по оставшемуся времени */
.draining-btn[data-state="normal"]  .draining-btn__fill { background: #00FF87; }
.draining-btn[data-state="warning"] .draining-btn__fill { background: #FFD166; }
.draining-btn[data-state="danger"]  .draining-btn__fill { background: #FF2A6D; }
```

**React компонент:**

```typescript
// src/components/DrainingButton.tsx

import { useEffect, useState, useRef } from 'react';

interface DrainingButtonProps {
  auctionEndsAt: string;   // ISO timestamp
  onAccept: () => void;
  label?: string;
  disabled?: boolean;
}

export function DrainingButton({
  auctionEndsAt,
  onAccept,
  label = '✓ Принять предложение',
  disabled = false,
}: DrainingButtonProps) {
  const [percentFill, setPercentFill] = useState(100);
  const [colorState, setColorState] = useState<'normal' | 'warning' | 'danger'>('normal');
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    const endTime = new Date(auctionEndsAt).getTime();

    const tick = () => {
      const now = Date.now();
      const totalMs = endTime - new Date(auctionEndsAt).getTime() + /* initial */ 0;
      const remainingMs = Math.max(0, endTime - now);

      // Получаем оригинальное время из requests.auction_duration_minutes
      // Здесь упрощённо используем prop (в реальности — из контекста заказа)
      const durationMs = /* auction_duration_minutes * 60000 */ 2700000; // 45 мин пример
      const pct = Math.max(0, Math.min(100, (remainingMs / durationMs) * 100));

      setPercentFill(pct);
      setColorState(pct > 20 ? 'normal' : pct > 10 ? 'warning' : 'danger');

      if (remainingMs <= 0) clearInterval(intervalRef.current);
    };

    tick();
    intervalRef.current = setInterval(tick, 1000);
    return () => clearInterval(intervalRef.current);
  }, [auctionEndsAt]);

  return (
    <button
      className="draining-btn"
      data-state={colorState}
      onClick={onAccept}
      disabled={disabled || percentFill === 0}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <div
        className="draining-btn__fill"
        style={{ width: `${percentFill}%` }}
      />
      <span className="draining-btn__label">
        {percentFill === 0 ? '⏰ Время вышло' : label}
      </span>
    </button>
  );
}
```

---

### Компонент таймера аукциона (клиент)

```typescript
// src/components/AuctionTimer.tsx

import { useEffect, useState } from 'react';

function formatTime(ms: number): string {
  if (ms <= 0) return '00:00:00';
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1_000);
  return [h, m, s].map(n => String(n).padStart(2, '0')).join(':');
}

interface AuctionTimerProps {
  auctionEndsAt: string;         // ISO
  durationMinutes: number;       // для прогрессбара
  extendedCount: number;         // кол-во уже сделанных продлений
  onExtend: (minutes: number) => void;
  onExpired: () => void;
}

const EXTENSION_OPTIONS = [
  { label: '+30 мин', value: 30 },
  { label: '+1 ч',   value: 60 },
  { label: '+2 ч',   value: 120 },
  { label: '+6 ч',   value: 360 },
  { label: '+24 ч',  value: 1440 },
];

export function AuctionTimer({
  auctionEndsAt,
  durationMinutes,
  extendedCount,
  onExtend,
  onExpired,
}: AuctionTimerProps) {
  const [remaining, setRemaining] = useState(0);
  const [showExtend, setShowExtend] = useState(false);

  const endMs = new Date(auctionEndsAt).getTime();
  const totalMs = durationMinutes * 60_000;

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, endMs - Date.now());
      setRemaining(diff);
      if (diff === 0) onExpired();
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endMs]);

  const pct = Math.min(100, (remaining / totalMs) * 100);
  const isLow = pct < 20;
  const canExtend = extendedCount < 3;

  return (
    <div className="auction-timer">
      <div className="auction-timer__header">
        <span className={`auction-timer__label ${isLow ? 'auction-timer__label--low' : ''}`}>
          ⏱️ До конца аукциона: <strong>{formatTime(remaining)}</strong>
        </span>
        {canExtend && (
          <button
            className="btn-ghost auction-timer__extend-btn"
            onClick={() => setShowExtend(v => !v)}
          >
            + Продлить ▾
          </button>
        )}
      </div>

      {/* Прогрессбар */}
      <div className="auction-timer__bar-track">
        <div
          className="auction-timer__bar-fill"
          style={{
            width: `${pct}%`,
            background: pct > 20 ? '#00FF87' : pct > 10 ? '#FFD166' : '#FF2A6D',
            transition: 'width 1s linear',
          }}
        />
      </div>

      {/* Dropdown продления */}
      {showExtend && (
        <div className="auction-timer__extend-menu">
          {EXTENSION_OPTIONS.map(opt => (
            <button
              key={opt.value}
              className="auction-timer__extend-option"
              onClick={() => { onExtend(opt.value); setShowExtend(false); }}
            >
              {opt.label}
            </button>
          ))}
          {!canExtend && (
            <p className="auction-timer__extend-limit">
              Максимум 3 продления исчерпаны
            </p>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## 2.5 Realtime — Синхронизация таймера

Таймер рассчитывается **на клиенте** (по `auction_ends_at` из БД), а не через polling. Это гарантирует точность и не нагружает сервер.

При продлении — клиент вызывает Supabase RPC `extend_auction`, после чего:
1. `auction_ends_at` обновляется в БД.
2. Через Realtime `postgres_changes` → UPDATE на `requests` — **все** открытые окна (клиент + исполнители если смотрят) получают новое время.

```typescript
// Подписка на изменения auction_ends_at в реальном времени
supabase
  .channel(`request_timer_${requestId}`)
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'requests',
    filter: `id=eq.${requestId}`,
  }, (payload) => {
    // Обновляем аукцион_ends_at локально без перезагрузки
    setAuctionEndsAt(payload.new.auction_ends_at);
  })
  .subscribe();
```

---

## 2.6 Push-уведомления по таймеру

| Событие | Кому | Сообщение |
|---|---|---|
| Аукцион создан | Все провайдеры хаба | «📣 Новый заказ в Раваи! Предложи цену — аукцион 45 мин» |
| Осталось 20% времени | Клиент | «⏰ До конца аукциона 9 минут. Выбери лучшее предложение!» |
| Аукцион истёк (офферы есть) | Клиент | «⌛ Время вышло. У вас 3 предложения — выберите сейчас или продлите» |
| Аукцион истёк (офферов нет) | Клиент | «😔 Нет предложений. Хотите продлить или изменить условия?» |
| Оффер принят | Исполнитель (победитель) | «🎉 Ваше предложение принято! Свяжитесь с клиентом» |
| Оффер отклонён | Остальные исполнители | «❌ Клиент выбрал другого исполнителя» |

---

## 2.7 Состояния кнопки — сводная таблица

| Состояние | `% fill` | Цвет | Текст | Действие |
|---|---|---|---|---|
| Активен (норма) | 100–21% | `#00FF87` | `✓ Принять предложение` | Принять |
| Предупреждение | 20–11% | `#FFD166` | `⚡ Принять (скоро истечёт)` | Принять |
| Критично | 10–1% | `#FF2A6D` | `🚨 Последний шанс принять` | Принять |
| Истёк | 0% | `#484F58` | `⏰ Время вышло` | Заблокирована |
| Оффер принят (другой) | — | `#484F58` | `✗ Выбран другой` | Заблокирована |
| Загрузка | — | shimmer | `...` | Заблокирована |

---

## 2.8 Roadmap изменений для реализации

### Изменения в БД (v1.2)
- `requests`: + `auction_duration_minutes`, `auction_ends_at`, `auction_extended_count`
- `reviews`: новая таблица (полная схема выше)
- `review_slots`: вспомогательная таблица-флаг
- Triggers: `set_auction_end`, `create_review_slot`, `update_provider_rating`
- CRON: `expire-auctions` (каждую минуту), `flag-suspicious-reviews` (ежедневно)

### Новые компоненты Frontend
- `<AuctionTimer />` — таймер с прогрессбаром и кнопкой продления
- `<DrainingButton />` — кнопка-батарейка для принятия оффера
- `<ReviewModal />` — экран написания отзыва (звёзды + теги + текст)
- `<ReviewList />` — список отзывов на бизнес-карточке с ответами

### Новые Endpoints / Functions
- `POST /api/v1/reviews` (Edge Function — с AI-модерацией)
- `RPC extend_auction(request_id, minutes, user_id)`
- Supabase Realtime: канал `request_timer_{id}` (UPDATE на requests)

### Новые Push-уведомления (Telegram Bot)
- При 20% оставшегося времени — Scheduled Job через Supabase
- При истечении аукциона
- При принятии / отклонении оффера
