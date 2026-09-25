# 📁 09_ROADMAP_AND_EXECUTION.md
> **NeedTnow** — Дорожная карта и план реализации MVP

---

## Обзор: 4 Недели до MVP

```
Неделя 1 ──► Инфраструктура + БД + Auth + Telegram Bot
Неделя 2 ──► TMA Frontend (Лента, Создание, Аукцион)
Неделя 3 ──► AI Worker + Realtime + B2B Кабинет
Неделя 4 ──► Монетизация + Партнёрка + QA + Релиз Пхукет
```

---

## Неделя 1: Инфраструктура и база

### Задачи Backend

| Задача | Исполнитель | Приоритет |
|---|---|---|
| Деплой Supabase проекта, настройка домена | Backend | 🔴 P0 |
| Запустить схему БД из `02_DATABASE_SCHEMA.md` | Backend | 🔴 P0 |
| Загрузить seed данные рубрикатора из `03_SERVICE_TAXONOMY.md` | Backend | 🔴 P0 |
| Написать Edge Function `auth-telegram` | Backend | 🔴 P0 |
| Развернуть Telegram Bot (GrammyJS), настроить webhook | Backend | 🔴 P0 |
| Настроить Supabase Storage (bucket: media) | Backend | 🟡 P1 |
| Настроить RLS политики и проверить изоляцию данных | Backend | 🔴 P0 |

### Задачи Frontend

| Задача | Исполнитель | Приоритет |
|---|---|---|
| `npx create-vite@latest` — инициализация TMA проекта | Frontend | 🔴 P0 |
| Настройка `@twa-dev/sdk`, `react-router-dom`, `supabase-js` | Frontend | 🔴 P0 |
| Реализовать `authenticateWithTelegram()` хук | Frontend | 🔴 P0 |
| Настроить дизайн-токены CSS (из `05_UI_UX_SCREEN_SPEC.md`) | Frontend | 🟡 P1 |
| Создать компонент `BottomTabBar` | Frontend | 🟡 P1 |

### Deliverable Week 1
✅ Авторизация через Telegram работает  
✅ Схема БД развёрнута и заполнена рубрикатором  
✅ Telegram Bot отвечает на `/start` и отправляет Deep Link в TMA  

---

## Неделя 2: TMA Frontend (Core Client/Provider Flows)

### Экраны для разработки

| Экран | Роут | Компоненты |
|---|---|---|
| Лента заказов | `/feed` | `RequestCard`, `FilterChips`, `HubSwitcher`, `FAB` |
| Карточка заказа | `/request/:id` | `BidCard`, `ClientInfo`, `BidList`, `BidModal` |
| Создание заказа | `/create` | `CategoryPicker (L1→L2→L3)`, `RequestForm`, `PhotoUpload`, `BudgetInput` |
| Профиль | `/profile` | `UserStats`, `RequestHistory`, `BidHistory` |
| Онбординг | `/onboarding` | `RolePicker`, `HubPicker` |

### Ключевые технические задачи

| Задача | Приоритет |
|---|---|
| Реализовать Realtime WebSocket подписку на новые биды | 🔴 P0 |
| Загрузка фото в Supabase Storage с прогрессбаром | 🟡 P1 |
| Геолокация — автоматическое определение хаба | 🟡 P1 |
| Анимации Framer Motion (stagger cards, slide transitions) | 🟢 P2 |
| Голосовой ввод описания заказа (Web Speech API) | 🟢 P2 |
| Двуязычность RU/EN — i18n (react-i18next) | 🟡 P1 |

### Deliverable Week 2
✅ Клиент может создать заказ  
✅ Исполнитель видит заказы в ленте и делает ручной отклик  
✅ Клиент видит новые офферы в реальном времени (Realtime)  

---

## Неделя 3: AI Worker + B2B Кабинет

### AI Worker (Python / FastAPI)

| Задача | Приоритет |
|---|---|
| Инициализировать FastAPI проект (`ai_worker/`) | 🔴 P0 |
| Написать `auto_bidder.py` — основной пайплайн | 🔴 P0 |
| Написать `llm_engine.py` — обёртка над OpenAI | 🔴 P0 |
| Написать `rag_service.py` — embeddings при сохранении KB | 🟡 P1 |
| Настроить Supabase Database Webhook → FastAPI | 🔴 P0 |
| Деплой AI Worker на Railway / Fly.io | 🔴 P0 |
| Тестирование: AI отвечает за ≤ 5 сек в 95% случаев | 🔴 P0 |

### B2B Кабинет (Frontend)

| Экран | Роут | Компоненты |
|---|---|---|
| AI Настройки | `/b2b/ai-agent` | `AIToggle`, `KnowledgeBaseEditor`, `MinBudgetSlider`, `TestAIButton` |
| Подписка | `/b2b/subscription` | `PlanCard`, `PaymentButton` |
| Аналитика | `/b2b/analytics` | `BidStats`, `WinRate`, `RevenueChart` |

### Deliverable Week 3
✅ AI делает автоматические ставки за ≤ 5 секунд  
✅ Бизнес может настроить knowledge base через B2B кабинет  
✅ Кнопка «Протестировать AI» работает  

---

## Неделя 4: Монетизация, Партнёрка, QA, Запуск

### Монетизация

| Задача | Приоритет |
|---|---|
| Интеграция Telegram Stars (покупка подписки PRO/AI внутри TMA) | 🔴 P0 |
| Edge Function `process-payment` с авто-начислением партнёру | 🔴 P0 |
| TON Connect кошелёк для Premium платежей | 🟡 P1 |
| QR-оплата PromptPay (Таиланд) — через ThaiBulksMS или аналог | 🟢 P2 |

### Партнёрская программа

| Задача | Приоритет |
|---|---|
| Экран `/partner` — реф-ссылка, статистика, запрос выплаты | 🔴 P0 |
| Генерация `referral_code` при регистрации | 🔴 P0 |
| Автоматическое начисление 20% в `partner_earnings` | 🔴 P0 |
| Уведомление партнёру в Telegram при новом начислении | 🟡 P1 |
| Запрос выплаты — форма с выбором метода вывода | 🟡 P1 |

### QA и полевые тесты

| Задача |
|---|
| Нагрузочный тест: 50 одновременных заявок → AI Worker не падает |
| Тест Realtime: задержка < 500ms на новый оффер |
| UX тест с 5 реальными исполнителями байков в Раваи (Пхукет) |
| Проверка RLS: пользователь А не видит данные пользователя Б |
| Тест партнёрской программы: реф-ссылка → регистрация → оплата → начисление |

### Deliverable Week 4 = MVP Launch 🚀
✅ Платёжная система работает (Telegram Stars)  
✅ Партнёрская программа начисляет комиссии автоматически  
✅ 10 бизнесов из Пхукета зарегистрированы и настроили AI-менеджера  
✅ Первая реальная сделка закрыта через NeedTnow  

---

## Технический стек (финальный список зависимостей)

### Frontend (`package.json`)
```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.26.0",
    "@supabase/supabase-js": "^2.45.0",
    "@twa-dev/sdk": "^7.10.0",
    "framer-motion": "^11.5.0",
    "lucide-react": "^0.447.0",
    "react-i18next": "^15.0.0",
    "i18next": "^23.15.0"
  },
  "devDependencies": {
    "vite": "^5.4.0",
    "typescript": "^5.5.0",
    "@vitejs/plugin-react": "^4.3.0",
    "tailwindcss": "^3.4.0"
  }
}
```

### AI Worker (`requirements.txt`)
```
fastapi==0.115.0
uvicorn[standard]==0.30.0
openai==1.51.0
supabase==2.8.0
pydantic-settings==2.5.0
langchain==0.3.0
python-dotenv==1.0.0
httpx==0.27.0
```

### Telegram Bot (`package.json`)
```json
{
  "dependencies": {
    "grammy": "^1.30.0",
    "@supabase/supabase-js": "^2.45.0"
  }
}
```

---

## Инфраструктура деплоя

| Сервис | Платформа | Цена |
|---|---|---|
| Frontend TMA | Vercel (Free tier) | $0 |
| Supabase (БД + Auth + Realtime) | Supabase Pro | $25/мес |
| AI Worker FastAPI | Railway.app | ~$5–$15/мес |
| Telegram Bot | Railway.app | ~$5/мес |
| **Итого MVP** | | **~$35–$45/мес** |
