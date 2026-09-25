# 📁 15_TOKEN_AND_PREMIUM.md
> **NeedTnow** — Система токенов и программа Verified Partner  
> Версия: 1.0 | Монетизация платформы

---

## 1. Модель монетизации — Обзор

```
Кто платит:    ТОЛЬКО бизнес/исполнитель
Клиент:        ВСЕГДА БЕСПЛАТНО (создание заказов, просмотр офферов)

Два источника дохода:
1. Токены     — pay-as-you-go за результат (100 токенов = 1 принятый оффер)
2. Premium    — Verified Partner $19/мес ($180/год) — статус + преимущества
```

---

## 2. Токены — Основная валюта

### Принцип «платишь за результат»

- Публикация и отправка откликов — **бесплатно**
- Списание происходит **только** в момент, когда клиент нажал «Принять предложение»
- Если оффер отклонён — токены **не списываются**
- Аукцион истёк без выбора — токены **не списываются**

### Стоимость списания

| Тип отклика | Кто делает | Списание |
|---|---|---|
| Ручной оффер | Сам провайдер | **100 токенов** |
| AI-оффер | AI Sales Agent | **50 токенов** (только Verified Partner) |

### Приветственный бонус

Каждый новый провайдер получает **50 токенов** при первой активации B2B-аккаунта.

> 50 токенов = 0.5 принятого ручного оффера  
> Это стимул сделать первую сделку и купить токены

---

## 3. Пакеты токенов — Цены

| Пакет | Токенов | Цена | Цена за 100 токенов | Экономия |
|---|---|---|---|---|
| Стартовый | 500 | $5.99 | $1.20 | — |
| Основной ⭐ | 1 000 | $10.99 | $1.10 | ~8% |
| Бизнес | 3 000 | $28.99 | $0.97 | ~19% |
| Корпоративный | 10 000 | $89.99 | $0.90 | ~25% |

> Базовая цена: $12 за 1 000 токенов (1 принятый оффер = $1.20)  
> Это выгодно при среднем чеке сделки $50–100+

---

## 4. Способы оплаты токенов

| Метод | Регион | Комментарий |
|---|---|---|
| ⭐ **Telegram Stars** | Глобально | Нативный TMA метод, приоритет |
| 💎 **TON Connect** | Глобально | TON кошелёк, авто-курс |
| 💎 **USDT (TRC-20/ERC-20)** | Глобально | Через CryptoPay API |
| 💳 **Банковская карта** | Глобально | Stripe или 2C2P для ЮВА |
| 📱 **PromptPay QR** | 🇹🇭 Таиланд | Для локальных пользователей |
| 🇻🇳 **VietQR** | 🇻🇳 Вьетнам | Для локальных пользователей |

---

## 5. Поведение при нулевом балансе

```
Токены = 0:
  ✗ AI-агент перестаёт отправлять отклики
  ✗ При попытке ручного отклика → Bottom Sheet с предложением купить токены
  ✓ Профиль и карточка остаются видимыми в поиске
  ✓ Можно просматривать заказы

Токены < 100 (предупреждение):
  → Push в Telegram: «⚠️ Осталось {N} токенов. Пополнить?»
  → Красный бейдж на иконке кошелька в кабинете
```

### Bottom Sheet при попытке откликнуться с 0 токенами

```
┌─────────────────────────────────────────────────────┐
│  ┄┄┄┄┄┄                                             │
│  🪙 Недостаточно токенов                            │
│                                                     │
│  Для отклика на этот заказ нужно                   │
│  100 токенов. На вашем балансе: 0                  │
│                                                     │
│  [ 🛒 Купить 1000 токенов — $10.99 ]  ← primary   │
│  [ Смотреть другие пакеты ]           ← ghost      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 6. Verified Partner — Premium-статус

### Что даёт статус

| Преимущество | Описание |
|---|---|
| ✅ **Синяя галочка** | На бизнес-карточке, в офферах, в поиске |
| 🏆 **Приоритет в списке офферов** | Офферы Verified Partner показываются **выше** обычных при одинаковой цене |
| 💎 **Скидка на AI-отклики** | 50 токенов вместо 100 за принятый AI-оффер |
| 🎯 **Приоритет в поиске** | Verified-карточки выше в результатах `/search` |
| 📞 **Приоритетная поддержка** | Отдельная линия в чате поддержки |
| 📊 **Расширенная аналитика** | Доступ к данным конкурентов в нише |

### Цены

| Период | Цена | Экономия |
|---|---|---|
| 1 месяц | $19 | — |
| 1 год | $180 | $48 (скидка 21%) |

### Флоу получения статуса

```
1. Провайдер открывает /b2b/subscription
2. Нажимает «Оставить заявку в поддержку»
3. Открывается Telegram-чат с поддержкой NeedTnow
4. Менеджер связывается в течение 24 часов
5. Проверка бизнеса:
   - Ссылки (Instagram, сайт)
   - Реальные отзывы на платформе
   - История сделок (мин. рекомендованная: 5+)
   - Опциональный звонок по видео
6. Администратор активирует в панели:
   UPDATE business_profiles SET verified = TRUE, sub_plan = 'verified_partner'
7. Провайдер получает Push: «✅ Verified Partner активирован!»
8. Оплата через отдельный инвойс (TG Stars, карта, крипта)
```

### Автоматическая оплата (продление)

- За 7 дней до истечения → Push: «Подписка истекает через 7 дней»
- За 1 день → Push: «Подписка истекает завтра»
- При истечении → статус снимается, Push уведомление
- Продление — также через запрос в поддержку (на MVP)

---

## 7. Порядок отображения офферов

Офферы в карточке заказа сортируются по следующему алгоритму:

```python
def sort_bid_score(bid):
    score = 0

    # 1. Verified Partner — всегда выше
    if bid.provider.is_verified:
        score += 1000

    # 2. Рейтинг провайдера (нормализован)
    score += bid.provider.rating * 100  # max 500

    # 3. Скорость отклика (быстрее = лучше)
    response_time_minutes = (bid.created_at - request.created_at).seconds / 60
    score += max(0, 60 - response_time_minutes)  # до 60 очков

    # 4. AI-отклик (незначительный буст)
    if bid.bid_type == 'ai_agent':
        score += 10

    return score
```

---

## 8. DB: Новые таблицы и поля

```sql
-- ============================================================
-- Баланс токенов провайдера
-- ============================================================
CREATE TABLE token_balances (
    user_id         UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    balance         INT NOT NULL DEFAULT 50,         -- стартовый бонус
    total_purchased INT DEFAULT 0,                   -- всего куплено (статистика)
    total_spent     INT DEFAULT 0,                   -- всего потрачено
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE token_tx_type AS ENUM (
    'purchase',       -- покупка пакета
    'spend_bid',      -- оффер принят (ручной)
    'spend_ai_bid',   -- оффер принят (AI)
    'bonus_welcome',  -- приветственный бонус
    'bonus_promo',    -- промокод
    'refund'          -- возврат (при апелляции)
);

-- История транзакций токенов
CREATE TABLE token_transactions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    type            token_tx_type NOT NULL,
    amount          INT NOT NULL,                    -- + пополнение, - списание
    balance_after   INT NOT NULL,                    -- баланс после операции
    -- Контекст
    bid_id          UUID REFERENCES bids(id),        -- если spend_bid
    payment_id      UUID REFERENCES payments(id),    -- если purchase
    promo_code      VARCHAR(32),                     -- если bonus_promo
    description     TEXT,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы
CREATE INDEX idx_token_tx_user ON token_transactions(user_id, created_at DESC);

-- RLS
ALTER TABLE token_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "token_balance_own"
    ON token_balances FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "token_tx_own"
    ON token_transactions FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- Дополнить business_profiles
-- ============================================================
ALTER TABLE business_profiles
    ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS verified_by UUID,        -- admin_id
    ADD COLUMN IF NOT EXISTS sub_plan_expires_at TIMESTAMP WITH TIME ZONE;

-- ============================================================
-- Trigger: Списать токены при принятии оффера
-- ============================================================
CREATE OR REPLACE FUNCTION deduct_bid_tokens()
RETURNS TRIGGER AS $$
DECLARE
    v_cost INT;
    v_tx_type token_tx_type;
    v_is_verified BOOLEAN;
    v_current_balance INT;
BEGIN
    IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN

        -- Проверяем верификацию провайдера
        SELECT bp.verified INTO v_is_verified
        FROM business_profiles bp
        WHERE bp.user_id = NEW.provider_id;

        -- Определяем стоимость
        IF NEW.bid_type = 'ai_agent' AND v_is_verified THEN
            v_cost := 50;
            v_tx_type := 'spend_ai_bid';
        ELSE
            v_cost := 100;
            v_tx_type := 'spend_bid';
        END IF;

        -- Получаем текущий баланс
        SELECT balance INTO v_current_balance
        FROM token_balances
        WHERE user_id = NEW.provider_id;

        -- Списываем
        UPDATE token_balances
        SET balance = balance - v_cost,
            total_spent = total_spent + v_cost,
            updated_at = NOW()
        WHERE user_id = NEW.provider_id;

        -- Записываем транзакцию
        INSERT INTO token_transactions (user_id, type, amount, balance_after, bid_id)
        VALUES (
            NEW.provider_id,
            v_tx_type,
            -v_cost,
            v_current_balance - v_cost,
            NEW.id
        );

    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_deduct_bid_tokens
    AFTER UPDATE OF status ON bids
    FOR EACH ROW EXECUTE FUNCTION deduct_bid_tokens();

-- ============================================================
-- Trigger: Начальный бонус при регистрации провайдера
-- ============================================================
CREATE OR REPLACE FUNCTION grant_welcome_tokens()
RETURNS TRIGGER AS $$
BEGIN
    -- При создании business_profiles → начисляем 50 токенов
    INSERT INTO token_balances (user_id, balance)
    VALUES (NEW.user_id, 50)
    ON CONFLICT (user_id) DO NOTHING;

    INSERT INTO token_transactions (user_id, type, amount, balance_after, description)
    VALUES (NEW.user_id, 'bonus_welcome', 50, 50, 'Приветственный бонус');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_welcome_tokens
    AFTER INSERT ON business_profiles
    FOR EACH ROW EXECUTE FUNCTION grant_welcome_tokens();
```

---

## 9. Обновлённые enum и payments

```sql
-- Обновить sub_plan для поддержки verified_partner
ALTER TYPE sub_plan ADD VALUE IF NOT EXISTS 'verified_partner';

-- Добавить в payments метаданные о пакете токенов
ALTER TABLE payments
    ADD COLUMN IF NOT EXISTS tokens_amount INT,       -- сколько токенов добавлено
    ADD COLUMN IF NOT EXISTS token_package VARCHAR(32); -- '500' | '1000' | '3000' | '10000'
```

---

## 10. Промокоды (MVP+)

```sql
CREATE TABLE promo_codes (
    code        VARCHAR(32) PRIMARY KEY,
    tokens      INT NOT NULL,           -- сколько токенов начисляется
    max_uses    INT,                    -- NULL = безлимит
    used_count  INT DEFAULT 0,
    expires_at  TIMESTAMP WITH TIME ZONE,
    created_by  UUID,                  -- admin_id
    is_active   BOOLEAN DEFAULT TRUE
);

CREATE TABLE promo_uses (
    user_id     UUID REFERENCES profiles(id),
    code        VARCHAR(32) REFERENCES promo_codes(code),
    used_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, code)         -- один промокод = один раз
);
```
