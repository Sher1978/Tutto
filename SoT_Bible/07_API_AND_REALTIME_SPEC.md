# 📁 07_API_AND_REALTIME_SPEC.md
> **NeedTnow** — Спецификация API, WebSockets и интеграций

---

## 1. Supabase Auth через Telegram initData

```typescript
// Авторизация в TMA — используем Telegram initData как JWT
import { retrieveLaunchParams } from '@twa-dev/sdk';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function authenticateWithTelegram(): Promise<void> {
  const { initDataRaw } = retrieveLaunchParams();
  
  // Supabase Edge Function верифицирует initData через Telegram Bot Token
  const { data, error } = await supabase.functions.invoke('auth-telegram', {
    body: { initData: initDataRaw },
  });
  
  if (error) throw error;
  
  // Устанавливаем сессию (JWT от Supabase)
  await supabase.auth.setSession(data.session);
}
```

---

## 2. Supabase Realtime — Подписки WebSocket

### Подписка на новые офферы в заказе (клиент)

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const subscribeToRequestBids = (
  requestId: string,
  onNewBid: (bid: Bid) => void
) => {
  const channel = supabase
    .channel(`request_bids_${requestId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'bids',
        filter: `request_id=eq.${requestId}`,
      },
      (payload) => {
        console.log('⚡ Новый отклик:', payload.new);
        onNewBid(payload.new as Bid);
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
};
```

### Подписка на новые заказы (исполнитель в своём хабе)

```typescript
export const subscribeToHubRequests = (
  hub: string,
  categoryL1Id: string | null,
  onNewRequest: (request: Request) => void
) => {
  const filter = categoryL1Id
    ? `hub=eq.${hub},category_l1_id=eq.${categoryL1Id}`
    : `hub=eq.${hub}`;

  const channel = supabase
    .channel(`hub_requests_${hub}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'requests',
        filter,
      },
      (payload) => onNewRequest(payload.new as Request)
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
};
```

---

## 3. REST API Эндпоинты (FastAPI AI Worker)

### `POST /api/v1/ai/trigger-auction`
**Вызывается:** Supabase Database Webhook при INSERT в `requests`

**Request:**
```json
{
  "type": "INSERT",
  "table": "requests",
  "record": {
    "id": "c39a8f12-7b2e-4d2b-9e12-88f4b23a1011",
    "client_id": "a11b22c3-...",
    "category_l1_id": "uuid",
    "category_l3_id": "uuid",
    "hub": "phuket",
    "district": "Rawai",
    "title": "Срочно нужен PCX на 10 дней",
    "description": "Нужен байк с доставкой к отелю завтра в 9 утра.",
    "budget": 120.00,
    "currency": "USD"
  }
}
```

**Response:**
```json
{
  "status": "accepted",
  "message": "Auction pipeline queued"
}
```

---

### `POST /api/v1/ai/update-embedding`
**Вызывается:** При сохранении Knowledge Base в B2B кабинете

**Request:**
```json
{
  "business_id": "uuid",
  "knowledge_text": "Текст базы знаний бизнеса..."
}
```

**Response:**
```json
{
  "status": "success",
  "embedding_updated": true
}
```

---

### `GET /api/v1/ai/test-bid`
**Вызывается:** Кнопка «Протестировать AI» в B2B кабинете

**Query params:** `business_id=uuid&sample_request=Нужен PCX на 5 дней в Раваи`

**Response:**
```json
{
  "can_bid": true,
  "proposed_price": 11.00,
  "proposed_price_unit": "day",
  "comment": "PCX 150 за $11/день. Доставка в Раваи бесплатно. Депозит: паспорт. Минимум 3 дня.",
  "reasoning": "Запрос соответствует PCX из KB. Цена $11 выше минимальной. Доставка по Раваи бесплатна."
}
```

---

## 4. Supabase Edge Functions

### `auth-telegram` — Верификация initData

```typescript
// supabase/functions/auth-telegram/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { validateTelegramInitData } from './utils.ts';

serve(async (req) => {
  const { initData } = await req.json();
  
  // Верифицируем подпись Telegram
  const userData = validateTelegramInitData(initData, Deno.env.get('BOT_TOKEN')!);
  if (!userData) {
    return new Response(JSON.stringify({ error: 'Invalid initData' }), { status: 401 });
  }
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  
  // Upsert профиль
  await supabase.from('profiles').upsert({
    telegram_id: userData.id,
    first_name: userData.first_name,
    last_name: userData.last_name,
    username: userData.username,
    photo_url: userData.photo_url,
  }, { onConflict: 'telegram_id' });
  
  // Создаём JWT сессию для пользователя
  const { data: authData } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: `tg_${userData.id}@needtnow.app`,
  });
  
  return new Response(JSON.stringify({ session: authData.properties }));
});
```

---

### `process-payment` — Обработка платежа + партнёрская комиссия

```typescript
// supabase/functions/process-payment/index.ts
serve(async (req) => {
  const { user_id, plan, amount, currency, provider, external_id } = await req.json();
  
  const supabase = createClient(/* ... */);
  
  // 1. Записываем платёж
  await supabase.from('payments').insert({
    user_id, plan, amount, currency, provider, external_id
  });
  
  // 2. Обновляем подписку бизнес-профиля
  const expiresAt = plan === 'pro_manual'
    ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  
  await supabase.from('business_profiles')
    .update({ sub_plan: plan, sub_expires_at: expiresAt.toISOString() })
    .eq('user_id', user_id);
  
  // 3. Проверяем реферала и начисляем комиссию 20%
  const { data: profile } = await supabase
    .from('profiles')
    .select('referred_by')
    .eq('id', user_id)
    .single();
  
  if (profile?.referred_by) {
    const commission = amount * 0.20;
    await supabase.from('partner_earnings').insert({
      partner_id: profile.referred_by,
      referred_user_id: user_id,
      payment_event_id: external_id,
      plan,
      payment_amount: amount,
      commission_pct: 20.00,
      commission_amount: commission,
      currency,
    });
    
    // TODO: PUSH партнёру через Telegram Bot
  }
  
  return new Response(JSON.stringify({ success: true }));
});
```

---

## 5. Telegram Bot Integration (Node.js + GrammyJS)

### Push-уведомления при новых офферах

```typescript
import { Bot } from 'grammy';

const bot = new Bot(process.env.BOT_TOKEN!);

export async function notifyClientNewBid(
  clientTelegramId: number,
  requestTitle: string,
  bidPrice: number,
  providerName: string,
  requestId: string,
  isAI: boolean
): Promise<void> {
  const emoji = isAI ? '🤖' : '💬';
  const deepLink = `https://t.me/NeedTnow_bot/app?startapp=request_${requestId}`;
  
  await bot.api.sendMessage(clientTelegramId, 
    `${emoji} <b>Новое предложение!</b>\n\n` +
    `📋 <i>${requestTitle}</i>\n` +
    `👤 ${providerName}: <b>$${bidPrice}</b>\n\n` +
    `Нажми чтобы посмотреть все предложения 👇`,
    {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [[
          { text: '👀 Смотреть предложения', web_app: { url: deepLink } }
        ]]
      }
    }
  );
}

export async function notifyProviderNewRequest(
  providerTelegramId: number,
  requestTitle: string,
  district: string,
  budget: number | null,
  requestId: string
): Promise<void> {
  const budgetText = budget ? `$${budget}` : 'Жду предложений';
  const deepLink = `https://t.me/NeedTnow_bot/app?startapp=request_${requestId}`;
  
  await bot.api.sendMessage(providerTelegramId,
    `📣 <b>Новый заказ в вашем районе!</b>\n\n` +
    `📍 <b>${district}</b>\n` +
    `📋 ${requestTitle}\n` +
    `💰 Бюджет: <b>${budgetText}</b>`,
    {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [[
          { text: '✍️ Сделать предложение', web_app: { url: deepLink } }
        ]]
      }
    }
  );
}
```
