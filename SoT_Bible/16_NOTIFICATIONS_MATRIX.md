# 📁 16_NOTIFICATIONS_MATRIX.md
> **NeedTnow** — Полная матрица уведомлений  
> Версия: 1.0 | Telegram Bot (GrammyJS) + In-App лог

---

## 1. Принципы системы уведомлений

- **Канал:** Telegram Bot (push) + `/notifications` экран в TMA (лог)
- **Язык:** Уведомление отправляется на языке, выбранном пользователем при онбординге (RU или EN)
- **Deep Links:** Каждая кнопка уведомления открывает конкретный экран TMA
- **Тихий режим:** С 23:00 до 8:00 (по местному времени хаба) — push не отправляется, но появляется в логе
- **Дедупликация:** Одинаковое событие не отправляется дважды за 5 минут

---

## 2. Матрица уведомлений — КЛИЕНТ

### 2.1 События аукциона

---

**[С-01] Новый оффер (ручной)**

| Поле | Значение |
|---|---|
| Триггер | `INSERT INTO bids WHERE bid_type = 'manual'` |
| Кому | Клиент (владелец request) |
| Задержка | Немедленно |
| Частота | Не чаще 1 раза в 2 мин (batching при потоке) |

```
🇷🇺 RU:
💬 Новое предложение на ваш заказ!

📋 {request.title}
👤 {provider.company_name} (⭐{provider.rating})
💰 {bid.proposed_price} {bid.currency}

«{bid.comment_preview}...»

[Смотреть предложение →]
```

```
🇬🇧 EN:
💬 New offer on your request!

📋 {request.title}
👤 {provider.company_name} (⭐{provider.rating})
💰 {bid.proposed_price} {bid.currency}

"{bid.comment_preview}..."

[View offer →]
```

---

**[С-02] Новый оффер (AI)**

| Поле | Значение |
|---|---|
| Триггер | `INSERT INTO bids WHERE bid_type = 'ai_agent'` |
| Кому | Клиент |
| Задержка | Немедленно |

```
🇷🇺:
🤖 AI ответил за {response_time} сек!

📋 {request.title}
🏢 {provider.company_name} ✅ — AI Sales Agent
💰 {bid.proposed_price} {bid.currency}

[Смотреть предложение →]
```

---

**[С-03] Первый оффер после публикации заказа**

| Поле | Значение |
|---|---|
| Триггер | Первый bid на request (count = 1) |
| Кому | Клиент |
| Задержка | Немедленно |
| Приоритет | Высокий |

```
🇷🇺:
🎉 Первое предложение уже ждёт вас!

📋 {request.title} · {hub}
👤 {provider.company_name} (⭐{provider.rating})
💰 {bid.proposed_price} {bid.currency}

[Смотреть предложение →]
```

---

**[С-04] Таймер аукциона — осталось 20%**

| Поле | Значение |
|---|---|
| Триггер | `auction_ends_at - NOW() <= 20% от total duration` |
| Кому | Клиент |
| Условие | Только если есть хотя бы 1 оффер |
| Задержка | Немедленно при срабатывании |
| Реализация | Supabase CRON (каждую минуту) |

```
🇷🇺:
⏰ Аукцион заканчивается!

📋 {request.title}
⏱️ Осталось: {remaining_time}
💬 Предложений: {bids_count}

Выберите лучшее предложение сейчас!

[Выбрать предложение →] [+ Продлить аукцион]
```

---

**[С-05] Аукцион истёк — есть офферы**

| Поле | Значение |
|---|---|
| Триггер | `status → 'expired' AND bids_count > 0` |
| Кому | Клиент |
| Задержка | Немедленно |

```
🇷🇺:
⌛ Время аукциона вышло

📋 {request.title}
💬 {bids_count} предложений ждут вашего выбора

Выберите исполнителя или продлите аукцион ещё до 3 раз.

[Выбрать исполнителя →] [Продлить аукцион]
```

---

**[С-06] Аукцион истёк — нет офферов**

| Поле | Значение |
|---|---|
| Триггер | `status → 'expired' AND bids_count = 0` |
| Кому | Клиент |

```
🇷🇺:
😔 Никто не откликнулся на ваш заказ

📋 {request.title}

Попробуйте:
• Повысить бюджет
• Изменить описание
• Выбрать другую нишу

[Создать заново ↺] [Продлить аукцион]
```

---

**[С-07] Оффер принят — сделка открыта**

| Поле | Значение |
|---|---|
| Триггер | `bid.status → 'accepted'` (клиент нажал принять) |
| Кому | Клиент |
| Задержка | Немедленно |
| Приоритет | Высокий |

```
🇷🇺:
✅ Сделка оформлена!

🏢 {provider.company_name} ✅
📋 {request.title}
💰 {bid.proposed_price} {bid.currency}

Свяжитесь с исполнителем в чате для уточнения деталей.

[Открыть чат →]
```

---

### 2.2 События отзывов

**[С-08] Напоминание об отзыве — через 30 мин после принятия**

```
🇷🇺:
⭐ Как всё прошло?

Оцените услугу от {provider.company_name}

[Оставить отзыв →] [Позже]
```

---

**[С-09] Напоминание об отзыве — за 24 часа до дедлайна**

| Поле | Значение |
|---|---|
| Триггер | `review_slots.expires_at - NOW() <= 24h AND review_id IS NULL` |

```
🇷🇺:
⏰ Окно для отзыва закрывается завтра!

Успейте оценить {provider.company_name}
Осталось: 24 часа

[Оставить отзыв →]
```

---

**[С-10] Провайдер ответил на отзыв**

```
🇷🇺:
💬 {provider.company_name} ответил на ваш отзыв:

«{provider_reply_preview}...»

[Смотреть ответ →]
```

---

### 2.3 Чат и апелляции

**[С-11] Новое сообщение в чате (пока TMA не открыта)**

```
🇷🇺:
💬 {provider.company_name}:

«{message_preview}...»

[Открыть чат →]
```

---

**[С-12] Ответ администратора по апелляции**

```
🇷🇺:
⚖️ Администратор ответил по вашей апелляции

Сделка: {request.title}

[Смотреть решение →]
```

---

## 3. Матрица уведомлений — ИСПОЛНИТЕЛЬ/БИЗНЕС

### 3.1 Новые заказы

**[Б-01] Новый заказ в хабе — подходит по нише**

| Поле | Значение |
|---|---|
| Триггер | `INSERT INTO requests` → рассылка провайдерам подходящей ниши в хабе |
| Кому | Все провайдеры в хабе + нише (category_l1) |
| Условие | `ai_enabled = FALSE OR bid_type_check` (не дублировать AI) |
| Лимит | Не более 10 уведомлений о новых заказах в час |

```
🇷🇺:
📣 Новый заказ в {hub_name}!

🚗 {category_l1.title} › {category_l2.title}
📋 {request.title}
📍 {request.district}
💰 Бюджет: {budget_text}
⏱️ Аукцион: {auction_duration} мин

[Откликнуться →]
```

---

**[Б-02] AI-агент сделал отклик**

| Поле | Значение |
|---|---|
| Триггер | AI успешно создал bid |
| Кому | Провайдер (владелец AI-агента) |

```
🇷🇺:
🤖 AI откликнулся за {response_time} сек

📋 {request.title} · {hub}
💰 Предложена цена: {bid.proposed_price} {currency}

[Смотреть мой оффер →]
```

---

**[Б-03] AI-агент пропустил заказ (причина)**

| Поле | Значение |
|---|---|
| Триггер | AI принял решение пропустить (ниже min_budget) |
| Кому | Провайдер |
| Частота | Не чаще 1 раза в час |

```
🇷🇺:
ℹ️ AI пропустил заказ: ниже вашего минимума

📋 {request.title}
💰 Бюджет клиента: {budget} < ваш минимум {ai_min_budget}

Хотите изменить настройки? [Настройки AI →]
```

---

### 3.2 Результаты офферов

**[Б-04] Оффер принят — ПОБЕДА**

| Поле | Значение |
|---|---|
| Триггер | `bid.status → 'accepted' AND bid.provider_id` |
| Кому | Исполнитель (победитель) |
| Приоритет | Высокий |

```
🇷🇺:
🎉 Ваш оффер выбран!

📋 {request.title}
👤 Клиент: {client.first_name}
💰 Сумма: {bid.proposed_price} {currency}
🪙 Списано: {token_cost} токенов

Свяжитесь с клиентом для уточнения деталей.

[Открыть чат →]
```

---

**[Б-05] Оффер отклонён (другой выбран)**

| Поле | Значение |
|---|---|
| Триггер | Все остальные bids → 'rejected' при одном 'accepted' |
| Кому | Остальные провайдеры |
| Тон | Нейтральный, не демотивирующий |

```
🇷🇺:
❌ Клиент выбрал другого исполнителя

📋 {request.title} · {hub}

Не останавливайтесь — в ленте ещё {active_requests} заказов!

[Смотреть ленту →]
```

---

**[Б-06] Аукцион истёк — оффер не рассмотрен**

```
🇷🇺:
⌛ Аукцион завершился без выбора

📋 {request.title}
Клиент ещё не выбрал исполнителя.

[Смотреть статус заказа →]
```

---

### 3.3 Токены и финансы

**[Б-07] Предупреждение о низком балансе токенов**

| Поле | Значение |
|---|---|
| Триггер | `token_balance < 200` после любого списания |
| Кому | Провайдер |
| Частота | Не чаще 1 раза в день |

```
🇷🇺:
⚠️ Мало токенов!

🪙 Ваш баланс: {balance} токенов
≈ {approx_offers} принятых офферов

Пополните, чтобы не пропустить заказы.

[Купить токены →]
```

---

**[Б-08] Токены закончились**

| Поле | Значение |
|---|---|
| Триггер | `token_balance = 0` |
| Приоритет | Критический |

```
🇷🇺:
🚨 Токены закончились!

Ваши отклики временно заблокированы.
Пополните баланс, чтобы продолжить работу.

[Купить токены — от $5.99 →]
```

---

**[Б-09] Токены успешно начислены**

| Поле | Значение |
|---|---|
| Триггер | `INSERT INTO token_transactions WHERE amount > 0` |
| Кому | Провайдер |

```
🇷🇺:
✅ +{tokens_amount} токенов зачислено!

🪙 Текущий баланс: {new_balance} токенов
💳 Способ оплаты: {payment_method}

[Перейти в кошелёк →]
```

---

### 3.4 Verified Partner

**[Б-10] Заявка на верификацию получена**

```
🇷🇺:
✅ Ваша заявка на Verified Partner получена!

Наш менеджер свяжется с вами в течение 24 часов.
Следите за этим чатом.
```

---

**[Б-11] Верификация одобрена**

```
🇷🇺:
🎉 Поздравляем! Статус Verified Partner активирован!

✅ Синяя галочка добавлена к вашей карточке
🏆 Приоритет в списке офферов включён
💎 AI-отклики теперь стоят 50 токенов

[Открыть кабинет →]
```

---

**[Б-12] Верификация отклонена**

```
🇷🇺:
ℹ️ По вашей заявке на Verified Partner требуется дополнительная информация.

Свяжитесь с поддержкой для уточнений.
```

---

**[Б-13] Premium истекает через 7 дней**

```
🇷🇺:
⏰ Подписка Verified Partner истекает через 7 дней

Чтобы не потерять статус и приоритет в ленте — свяжитесь с поддержкой для продления.

$19/месяц или $180/год

[Написать в поддержку →]
```

---

### 3.5 Отзывы

**[Б-14] Новый отзыв о бизнесе**

```
🇷🇺:
⭐ Новый отзыв!

👤 {reviewer.first_name}: {rating}/5
«{review.comment_preview}...»

[Ответить на отзыв →]
```

---

**[Б-15] Напоминание ответить на отзывы**

| Поле | Значение |
|---|---|
| Триггер | 3+ отзыва без ответа за 7 дней |
| Кому | Провайдер |
| Частота | Раз в неделю |

```
🇷🇺:
💬 У вас {count} отзывов без ответа

Ответы на отзывы повышают доверие клиентов!

[Ответить на отзывы →]
```

---

### 3.6 Чат и апелляции

**[Б-16] Новое сообщение в чате**

```
🇷🇺:
💬 {client.first_name}:

«{message_preview}...»

[Открыть чат →]
```

---

**[Б-17] Клиент открыл апелляцию**

| Поле | Значение |
|---|---|
| Триггер | `INSERT INTO appeals` |
| Приоритет | Высокий |

```
🇷🇺:
⚖️ Клиент открыл апелляцию по сделке

📋 {request.title}
👤 Клиент: {client.first_name}

Администратор рассмотрит ситуацию в течение 24–48 часов.
Предоставьте дополнительную информацию в чате.

[Открыть чат →]
```

---

## 4. Матрица уведомлений — ПАРТНЁР

**[П-01] Реферал зарегистрировался**

```
🇷🇺:
🎉 По вашей ссылке зарегистрировался новый пользователь!

Вы будете получать 20% с каждой его оплаты.
```

---

**[П-02] Новое начисление комиссии**

| Поле | Значение |
|---|---|
| Триггер | `INSERT INTO partner_earnings` |

```
🇷🇺:
💰 +${commission_amount} начислено на партнёрский баланс!

🎯 Ваш реферал {referred.username} оплатил {plan_name}
💰 Сумма оплаты: ${payment_amount}
💸 Ваша комиссия (20%): +${commission_amount}

[Партнёрский кабинет →]
```

---

**[П-03] Баланс готов к выводу**

| Поле | Значение |
|---|---|
| Триггер | `partner_balance >= 20` впервые или после выплаты |

```
🇷🇺:
💸 Баланс готов к выводу!

💰 Доступно: ${available_balance}

[Запросить выплату →]
```

---

**[П-04] Выплата обработана**

```
🇷🇺:
✅ Выплата ${amount} отправлена!

Метод: {payout_method}
Транзакция: {tx_id}

Средства поступят в течение 1–3 рабочих дней.
```

---

## 5. Матрица уведомлений — СИСТЕМНЫЕ (Admin)

**[А-01] Новая заявка на верификацию**

```
🇷🇺 (только для admin-чата):
✅ Новая заявка на Verified Partner

🏢 {company_name} (@{username})
📍 {hub} · {category}
⭐ {rating} · {deals_count} сделок

[Рассмотреть заявку →]
```

---

**[А-02] Новая апелляция**

```
⚖️ Новая апелляция #APL-{id}

👤 {client} vs 🏢 {provider}
📋 {request.title} · ${amount}

[Рассмотреть →]
```

---

## 6. DB: Таблица логов уведомлений

```sql
CREATE TYPE notification_type AS ENUM (
    -- Клиент
    'new_bid', 'new_ai_bid', 'first_bid', 'auction_warning',
    'auction_expired_bids', 'auction_expired_no_bids',
    'deal_created', 'review_reminder', 'review_deadline',
    'review_reply', 'chat_message', 'appeal_response',
    -- Бизнес
    'new_request', 'ai_bid_sent', 'ai_bid_skipped',
    'bid_accepted', 'bid_rejected', 'auction_closed',
    'token_low', 'token_empty', 'token_added',
    'verified_request', 'verified_approved', 'verified_rejected',
    'premium_expiring', 'new_review', 'review_reminder_provider',
    'appeal_opened',
    -- Партнёр
    'referral_registered', 'commission_earned', 'payout_ready', 'payout_sent',
    -- Системные
    'admin_verification', 'admin_appeal'
);

CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    type            notification_type NOT NULL,
    title           TEXT NOT NULL,
    body            TEXT NOT NULL,
    deep_link       TEXT,                           -- URL для кнопки
    is_read         BOOLEAN DEFAULT FALSE,
    is_sent_tg      BOOLEAN DEFAULT FALSE,          -- отправлено в TG Bot
    related_id      UUID,                           -- id связанного объекта
    related_type    VARCHAR(64),                    -- 'request' | 'bid' | 'review' etc.
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications_own"
    ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_update_own"
    ON notifications FOR UPDATE USING (auth.uid() = user_id);
```

---

## 7. GrammyJS — Базовая структура отправки уведомлений

```typescript
// bot/src/notifications/sendNotification.ts

import { Bot } from 'grammy';
import { supabase } from '../lib/supabase';

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN!);

interface NotificationPayload {
  user_id: string;
  telegram_id: number;
  type: string;
  title: string;
  body: string;
  deep_link?: string;
  buttons?: Array<{ text: string; url: string }>;
}

export async function sendNotification(payload: NotificationPayload) {
  // 1. Записать в лог notifications
  await supabase.from('notifications').insert({
    user_id: payload.user_id,
    type: payload.type,
    title: payload.title,
    body: payload.body,
    deep_link: payload.deep_link,
    is_sent_tg: false,
  });

  // 2. Проверить тихий режим (23:00–08:00 по UTC+7)
  const hour = new Date().getUTCHours() + 7;
  if (hour >= 23 || hour < 8) {
    return; // Только в лог, без push
  }

  // 3. Отправить через Bot API
  try {
    const inlineKeyboard = payload.buttons?.map(btn => ([
      { text: btn.text, url: btn.url }
    ]));

    await bot.api.sendMessage(payload.telegram_id, payload.body, {
      parse_mode: 'HTML',
      reply_markup: inlineKeyboard ? {
        inline_keyboard: inlineKeyboard
      } : undefined,
    });

    // Обновить флаг
    await supabase
      .from('notifications')
      .update({ is_sent_tg: true })
      .eq('user_id', payload.user_id)
      .eq('type', payload.type)
      .order('created_at', { ascending: false })
      .limit(1);

  } catch (e) {
    console.error('TG push failed:', e);
  }
}

// Пример использования — уведомление о новом оффере
export async function notifyClientNewBid(
  requestId: string,
  bidId: string
) {
  const { data } = await supabase
    .from('bids')
    .select(`
      id, proposed_price, currency, comment, bid_type,
      provider:profiles!bids_provider_id_fkey(first_name, telegram_id, rating),
      provider_biz:business_profiles!inner(company_name),
      request:requests!bids_request_id_fkey(title, client_id,
        client:profiles!requests_client_id_fkey(telegram_id, lang)
      )
    `)
    .eq('id', bidId)
    .single();

  if (!data) return;

  const lang = data.request.client.lang;
  const isAI = data.bid_type === 'ai_agent';
  const commentPreview = data.comment.slice(0, 50);

  const body = lang === 'ru'
    ? `${isAI ? '🤖' : '💬'} ${isAI ? `AI ответил за 4 сек!` : 'Новое предложение!'}\n\n📋 ${data.request.title}\n🏢 ${data.provider_biz.company_name} (⭐${data.provider.rating})\n💰 ${data.proposed_price} ${data.currency}\n\n«${commentPreview}...»`
    : `${isAI ? '🤖' : '💬'} ${isAI ? 'AI responded in 4 sec!' : 'New offer!'}\n\n📋 ${data.request.title}\n🏢 ${data.provider_biz.company_name} (⭐${data.provider.rating})\n💰 ${data.proposed_price} ${data.currency}\n\n"${commentPreview}..."`;

  await sendNotification({
    user_id: data.request.client_id,
    telegram_id: data.request.client.telegram_id,
    type: isAI ? 'new_ai_bid' : 'new_bid',
    title: 'Новое предложение',
    body,
    deep_link: `${process.env.TMA_URL}?startapp=request_${requestId}`,
    buttons: [{
      text: lang === 'ru' ? 'Смотреть предложение →' : 'View offer →',
      url: `${process.env.TMA_URL}?startapp=request_${requestId}`
    }]
  });
}
```

---

## 8. Дополнительные уведомления (Отмены, Изменения и Срывы)

**[Д-01] Заявка обновилась (Клиент отредактировал)**

| Поле | Значение |
|---|---|
| Триггер | `UPDATE requests` до принятия оффера |
| Кому | Всем исполнителям, оставившим оффер (`bids`) |

```
🇷🇺:
✏️ Заявка обновилась!

📋 {request.title}
Клиент изменил условия или описание заявки. Проверьте, подходит ли вам новый вариант.

[Смотреть новую заявку →]
```

---

**[Д-02] Запрос на отмену сделки (от другой стороны)**

| Поле | Значение |
|---|---|
| Триггер | Участник нажал "Отменить сделку" (до подтверждения исполнения) |
| Кому | Второму участнику сделки |

```
🇷🇺:
⚠️ Запрос на отмену сделки!

👤 {initiator_name} хочет отменить сделку.
Причина: {reason}

Пожалуйста, подтвердите отмену или отклоните запрос (тогда будет открыта Апелляция).

[Подтвердить отмену] [Отклонить]
```

---

**[Д-03] Сделка сорвана (Неявка / Подтвержденная апелляция)**

| Поле | Значение |
|---|---|
| Триггер | Администратор закрыл апелляцию в пользу клиента с причиной No-show |
| Кому | Клиенту и Исполнителю |

```
🇷🇺:
❌ Сделка отменена (Неявка исполнителя)

Для клиента: Факт срыва зафиксирован, бизнесу выставлен штраф. Вы можете мгновенно пересоздать заявку.
[🔄 Опубликовать повторно]

Для бизнеса: Зафиксирована неявка. Рейтинг снижен, опубликован негативный отзыв. Свяжитесь с поддержкой, если произошла ошибка.
```

