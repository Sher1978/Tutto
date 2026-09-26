# 📁 22_DUAL_MODE_DESIGN_SYSTEM.md
> **NeedTnow / TuttoMinutto** — Dual-Mode UX: Дизайн-система двухрежимного приложения  
> Версия: 1.0 | Последнее обновление: 2026-09-26  
> Заменяет навигационную логику из `21_DYNAMIC_BOTTOM_NAV_AND_MARKET_ADMIN.md` (BottomNav)

---

## 1. Архитектурный подход: Dual-Mode App

Приложение работает в двух режимах, переключаемых через **Top Segmented Control (Pill Switcher)** — как в Uber (Rides/Eats) или inDrive.

### 1.1 Pill Switcher — Главный переключатель

Размещается **фиксированно вверху** экрана под логотипом, **всегда видим** (sticky).

```
┌──────────────────────────────────────────────────────────┐
│              TUTTO MINUTTO                                │
│         Здесь выбираешь ты!                              │
│                                                          │
│  ┌─────────────────────────┬───────────────────────────┐ │
│  │   🛠 УСЛУГИ И АРЕНДА    │   🏷 FLASH MARKET          │ │
│  └─────────────────────────┴───────────────────────────┘ │
│                                                          │
│  [=== Контент переключается под капсулой ===]            │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Визуальные правила Pill Switcher:**

```css
.pill-switcher {
  display: flex;
  background: #161B22;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 4px;
  margin: 0 16px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.pill-option {
  flex: 1;
  padding: 12px 8px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
  font-family: 'Outfit', sans-serif;
  letter-spacing: 0.02em;
  text-align: center;
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

/* Режим Услуг — активен */
.pill-option.active-services {
  background: linear-gradient(135deg, #00F2FE, #00D4E8);
  color: #000000;
  box-shadow: 0 0 20px rgba(0, 242, 254, 0.3);
}

/* Режим Flash Market — активен */
.pill-option.active-market {
  background: linear-gradient(135deg, #CCFF00, #B8E600);
  color: #000000;
  box-shadow: 0 0 20px rgba(204, 255, 0, 0.3);
}

.pill-option.inactive {
  background: transparent;
  color: #8B949E;
}
```

### 1.2 Принцип подачи контента

| Параметр | 🛠 Услуги и Аренда | 🏷 Flash Market |
|---|---|---|
| **Фокус** | Текстовая суть задачи + цена + статус | Визуал товара + цена + тикающий таймер |
| **Главный элемент карточки** | Описание запроса, локация, кнопки ставок | Фото товара, текущая ставка, TTL |
| **Accent-цвет** | Neon Cyan `#00F2FE` | Cyber Lemon `#CCFF00` / Coral `#FF2A6D` |
| **CTA** | + Разместить заказ | + Продать вещь |
| **Кто создаёт контент** | Клиент (покупатель услуги) | Продавец (владелец товара) |
| **Направление аукциона** | Обратный (цена падает) | Прямой (цена растёт) + Buy Now |

---

## 2. Цветовое зонирование режимов

### 2.1 Общие цвета (сквозные)

```css
/* Фоны — идентичны в обоих режимах */
--bg-primary:      #0D1117;  /* Сверхтёмный графит */
--bg-card:         #161B22;  /* Карточки и плашки */
--bg-surface:      #21262D;  /* Поля ввода, вторичные элементы */
--bg-elevated:     #1A2234;  /* Поднятые элементы (Bottom Sheets) */

/* Текст */
--text-primary:    #FFFFFF;
--text-secondary:  #8B949E;
--text-tertiary:   #484F58;

/* Универсальные акценты */
--gold:            #FFB302;  /* Рейтинги, VIP, Featured */
--purple-glow:     #7000FF;  /* Фоновые радиальные отсветы */
```

### 2.2 Режим «Услуги» — Neon Cyan

```css
/* Активен когда Pill Switcher = «Услуги и Аренда» */
--accent-primary:    #00F2FE;  /* Кнопки, бордеры, цены */
--accent-gradient:   linear-gradient(135deg, #00F2FE 0%, #00FF87 100%);
--accent-glow:       rgba(0, 242, 254, 0.3);

/* Использование: */
/* - Текущая ставка, цена, active states */
/* - Кнопка «Быстрая заявка» */
/* - Активная вкладка BottomNav */
/* - BottomNav active icon glow */
```

### 2.3 Режим «Flash Market» — Cyber Lemon + Coral

```css
/* Активен когда Pill Switcher = «Flash Market» */
--market-lemon:       #CCFF00;  /* Текущие цены, выгода, Buy Now */
--market-coral:       #FF2A6D;  /* Таймеры аукциона, urgency */
--market-gradient:    linear-gradient(135deg, #CCFF00 0%, #B8E600 100%);
--market-glow-lemon:  rgba(204, 255, 0, 0.3);
--market-glow-coral:  rgba(255, 42, 109, 0.4);

/* Использование: */
/* - Текущая ставка: --market-lemon */
/* - Тикающий таймер: --market-coral (пульсация при <1ч) */
/* - Кнопка «Продать вещь»: --market-gradient */
/* - Buy Now badge: --market-lemon */
/* - BottomNav active icon: --market-lemon */
```

### 2.4 Пульсирующий таймер (Urgency Effect)

Когда до конца аукциона (в обоих режимах) остаётся < 1 часа, карточка получает неоновое свечение:

```css
/* Пульсирующая рамка при urgency */
@keyframes urgency-pulse {
  0%   { box-shadow: 0 0 5px  var(--market-glow-coral); }
  50%  { box-shadow: 0 0 20px var(--market-glow-coral), 
                     0 0 40px rgba(255, 42, 109, 0.15); }
  100% { box-shadow: 0 0 5px  var(--market-glow-coral); }
}

.card-urgency {
  border: 1px solid var(--market-coral);
  animation: urgency-pulse 2s ease-in-out infinite;
}

/* Таймер с пульсацией */
.timer-urgent {
  color: var(--market-coral);
  font-family: 'JetBrains Mono', monospace;
  text-shadow: 0 0 15px var(--market-glow-coral);
  animation: urgency-pulse 1.5s ease-in-out infinite;
}
```

---

## 3. Структура главного экрана по режимам

### 3.1 Режим «Услуги и Аренда» (по умолчанию)

```
┌──────────────────────────────────────────────────────────┐
│              TUTTO MINUTTO                                │
│         Здесь выбираешь ты!                              │
│                                                          │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ [Avatar] Александр | @alex ⭐ 4.9 • 🤖 AI ACTIVE    │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────┬─────────────────────────────┐│
│  │ ● 🛠 УСЛУГИ И АРЕНДА   │   🏷 FLASH MARKET           ││
│  └────────────────────────┴─────────────────────────────┘│
│                                                          │
│ ASIAN HUBS:                                              │
│ [🌴 BALI]  [PHUKET]  [BANGKOK]  [VIETNAM]               │
│                                                          │
│ КАТЕГОРИИ:                                               │
│ [🛵 ПРОКАТ] [🏡 ЖИЛЬЁ] [💵 ДЕНЬГИ] [💼 УСЛУГИ]...       │
│                                                          │
│ ═══ СЛАЙДЕРЫ ПО КАТЕГОРИЯМ ═══                          │
│ 🛵 ПРОКАТ · Phuket                                      │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐          │
│ │ PCX  │ │ NMAX │ │ Авто │ │ Яхта │ │ + ⚡ │          │
│ │ $11/д│ │ $13/д│ │ $35/д│ │ $200 │ │ Своё │          │
│ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘          │
│                                                          │
│ 🏡 ЖИЛЬЁ · Phuket                                       │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐          │
│ │Вилла │ │Кондо │ │Хостел│ │ ...  │ │ + ⚡ │          │
│ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘          │
│ ...                                                      │
│                                                          │
│ ┌──────────────────────────────────────────────────────┐ │
│ │  [ + ⚡ РАЗМЕСТИТЬ ЗАКАЗ ]     ← Sticky Glow CTA   │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ 🏠 Главная  ⭐ Отклики   💬 Чат   👤 Кабинет        │ │
│ └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### 3.2 Режим «Flash Market»

```
┌──────────────────────────────────────────────────────────┐
│              TUTTO MINUTTO                                │
│         Здесь выбираешь ты!                              │
│                                                          │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ [Avatar] Александр | @alex ⭐ 4.9                    │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────┬─────────────────────────────┐│
│  │   🛠 УСЛУГИ И АРЕНДА   │ ● 🏷 FLASH MARKET           ││
│  └────────────────────────┴─────────────────────────────┘│
│                                                          │
│ ASIAN HUBS:                                              │
│ [🌴 BALI]  [PHUKET]  [BANGKOK]  [VIETNAM]               │
│                                                          │
│ ТОВАРЫ:                                                  │
│ [📱 Все] [🏠 Мебель] [👕 Одежда] [🚲 Транс.] [🏄 Спорт]│
│ [👶 Дети] [📚 Книги] [🍳 Кухня] [🎸 Музыка] [📦 Другое]│
│                                                          │
│ ФИЛЬТРЫ:                                                │
│ [🔍 Поиск...] [💰 Цена ▾] [📊 Состояние ▾] [⏱ Время ▾]│
│                                                          │
│ ═══ MASONRY GRID (2 столбца, как Xianyu/IdleFish) ═══  │
│                                                          │
│ ┌────────────────────┐  ┌────────────────────┐          │
│ │ [📸 iPhone 15 Pro] │  │ [📸 Сёрфборд]      │          │
│ │ 🔥 Featured        │  │                    │          │
│ │ iPhone 15 Pro      │  │ Firewire 6'2       │          │
│ │ 256GB              │  │ Как новый          │          │
│ │ 📍 Rawai           │  │ 📍 Canggu          │          │
│ │ ┌────────────────┐ │  │ ┌────────────────┐ │          │
│ │ │💰 ฿15,000      │ │  │ │💰 ฿8,500       │ │          │
│ │ │⏱ 01:45:22 🔴   │ │  │ │⏱ 3д 12ч       │ │          │
│ │ └────────────────┘ │  │ └────────────────┘ │          │
│ │ ⚡ BuyNow ฿18k     │  │ ⚡ BuyNow ฿12k    │          │
│ │ 👁 34 · 💬 3       │  │ 👁 12 · 💬 0      │          │
│ └────────────────────┘  └────────────────────┘          │
│                                                          │
│ ┌────────────────────┐  ┌────────────────────┐          │
│ │ [📸 Рабочий стол]  │  │ [📸 PS5 Slim]      │          │
│ │ ...                │  │ ...                │          │
│ └────────────────────┘  └────────────────────┘          │
│                                                          │
│ ┌──────────────────────────────────────────────────────┐ │
│ │  [ + 📸 ПРОДАТЬ ВЕЩЬ ]          ← Sticky Glow CTA  │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ 🔥 Маркет  🔍 Поиск   📦 Моё   👤 Кабинет          │ │
│ └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

---

## 4. Bottom Navigation — Контекстная смена

### 4.1 Два набора вкладок

BottomNav **морфится** при переключении Pill Switcher (200ms анимация):

```
РЕЖИМ УСЛУГ:
┌──────────────────────────────────────────────────────────┐
│  🏠          ⭐          💬          👤                  │
│ ГЛАВНАЯ    ОТКЛИКИ      ЧАТ      КАБИНЕТ               │
│            (мои заявки)                                  │
│                                                          │
│ Active color: #00F2FE (Neon Cyan)                        │
└──────────────────────────────────────────────────────────┘

РЕЖИМ FLASH MARKET:
┌──────────────────────────────────────────────────────────┐
│  🔥          🔍          📦          👤                  │
│ МАРКЕТ     ПОИСК        МОЁ      КАБИНЕТ               │
│  (лента)  (товары)    (архив)                            │
│                                                          │
│ Active color: #CCFF00 (Cyber Lemon)                      │
└──────────────────────────────────────────────────────────┘
```

### 4.2 Общие вкладки

- **👤 КАБИНЕТ** — сквозная, единая для обоих режимов (содержит секции «Услуги» + «Flash Market»)
- **💬 ЧАТ** — показывает все сделки (и услуги, и маркет) с метками 🔧/🔥

### 4.3 Sticky Floating CTA (Floating Action Button)

Центральная CTA-кнопка **плавает** между BottomNav и контентом — не в самом BottomNav, а **выше** него:

```css
.sticky-cta {
  position: fixed;
  bottom: 90px;  /* выше BottomNav */
  left: 16px;
  right: 16px;
  z-index: 60;
  
  padding: 16px;
  border-radius: 16px;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 15px;
  letter-spacing: 0.05em;
  text-align: center;
  color: #000000;
  
  cursor: pointer;
  transition: all 200ms ease;
}

/* Режим услуг */
.sticky-cta-services {
  background: linear-gradient(135deg, #00F2FE, #CCFF00);
  box-shadow: 0 0 30px rgba(0, 242, 254, 0.4),
              0 4px 20px rgba(0, 0, 0, 0.3);
}

/* Режим маркета */
.sticky-cta-market {
  background: linear-gradient(135deg, #CCFF00, #B8E600);
  box-shadow: 0 0 30px rgba(204, 255, 0, 0.4),
              0 4px 20px rgba(0, 0, 0, 0.3);
}

/* Glow Effect — мягкое мерцание */
.sticky-cta::after {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 18px;
  background: inherit;
  filter: blur(12px);
  opacity: 0.4;
  z-index: -1;
  animation: cta-breathe 3s ease-in-out infinite;
}

@keyframes cta-breathe {
  0%, 100% { opacity: 0.3; }
  50%      { opacity: 0.6; }
}
```

---

## 5. Bottom Sheet Drawers — Универсальный паттерн

Все действия открываются в **выдвигающихся шторках (Bottom Sheets)** поверх текущего экрана — **без перехода на новые страницы**:

### 5.1 Правила Bottom Sheet

```
TMA-специфика:
  - Нет аппаратной кнопки «Назад» на iPhone
  - Ограниченная высота (минус шапка Telegram ~88px)
  - Никаких вложенных переходов > 1 уровня

Поэтому:
  ✅ Отклик на заказ → Bottom Sheet
  ✅ Ставка на товар → Bottom Sheet
  ✅ Создание заявки (Quick) → Bottom Sheet
  ✅ Выбор категории → Bottom Sheet
  ✅ Фильтры → Bottom Sheet
  ✅ Детали сделки → Bottom Sheet (full-screen)

  ❌ НЕ новые страницы с transition
  ❌ НЕ модальные окна по центру экрана (слишком маленькие)
```

### 5.2 Визуальные правила Bottom Sheet

```css
.bottom-sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 200;
  
  background: #161B22;
  border-top: 1px solid rgba(255,255,255,0.08);
  border-radius: 24px 24px 0 0;
  
  /* Размытый фон за шторкой */
  backdrop-filter: blur(20px);
  
  /* Ручка для свайпа (drag handle) */
  &::before {
    content: '';
    position: absolute;
    top: 12px;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 4px;
    border-radius: 2px;
    background: rgba(255,255,255,0.2);
  }
  
  /* Анимация появления */
  animation: sheet-slide-up 300ms cubic-bezier(0.32, 0.72, 0, 1);
}

/* Затемнение фона (scrim) */
.bottom-sheet-scrim {
  position: fixed;
  inset: 0;
  z-index: 199;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  animation: fade-in 200ms ease;
}

@keyframes sheet-slide-up {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}
```

### 5.3 Типы Bottom Sheet

| Тип | Высота | Когда |
|---|---|---|
| **Compact** | 30-40% экрана | Быстрая ставка, подтверждение, ошибка |
| **Half** | 50-60% экрана | Форма отклика, фильтры, выбор категории |
| **Full** | 90% экрана | Создание лота, детали товара, чат, карточка заказа |

---

## 6. AI Agent Badge — Живой статус-бейдж

### 6.1 Визуальные правила

Все отклики от AI-агента получают **уникальный градиентный бейдж** для мгновенной дифференциации:

```
┌─────────────────────────────────────────────────────────┐
│  Оффер от обычного провайдера:                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │ 👤  Phuket Drive ⭐4.9 ✅                         │  │
│  │     $11/день · PCX 150 · Доставка бесплатно      │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  Оффер от AI-агента (визуально отличается):             │
│  ┌───────────────────────────────────────────────────┐  │
│  │ ┌─────────────────────────────────────────────┐   │  │
│  │ │ 🤖 AI AGENT · Phuket Drive · 3 сек         │   │  │ ← Gradient border badge
│  │ └─────────────────────────────────────────────┘   │  │
│  │     $11/день · PCX 150 · «Доставка в ваш отель   │  │
│  │     бесплатно! Байк 2023 года, 2 шлема...»      │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 6.2 CSS для AI Agent Badge

```css
.ai-agent-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 0.05em;
  color: #CCFF00;
  
  /* Градиентная рамка Cyan → Lemon */
  border: 1.5px solid transparent;
  background: 
    linear-gradient(#161B22, #161B22) padding-box,
    linear-gradient(135deg, #00F2FE, #CCFF00) border-box;
  
  /* Свечение */
  box-shadow: 0 0 12px rgba(204, 255, 0, 0.2),
              inset 0 0 8px rgba(0, 242, 254, 0.05);
}

.ai-agent-badge .ai-icon {
  font-size: 14px;
}

.ai-agent-badge .ai-speed {
  color: #00F2FE;
  font-size: 10px;
}

/* Пульсирующая точка «ACTIVE» */
.ai-agent-badge .ai-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #CCFF00;
  animation: ai-pulse 2s ease-in-out infinite;
}

@keyframes ai-pulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 4px #CCFF00; }
  50%      { opacity: 0.4; box-shadow: 0 0 8px #CCFF00; }
}
```

### 6.3 Где показывается AI Badge

| Экран | Описание |
|---|---|
| **Карточка оффера** (в заказе) | Градиентная рамка + `🤖 AI AGENT · {company} · {speed} сек` |
| **Список откликов** | Мини-бейдж `🤖 AI` с пульсирующей точкой |
| **Профиль провайдера** | Бейдж в шапке `🤖 AI Sales Agent ACTIVE • <1m` |
| **Push-уведомление** | Текст: `🤖 AI ответил за {N} сек!` |
| **Лента заказов (B2B)** | Если AI уже ответил → `🤖 AI уже ответил` зелёный тег |

---

## 7. Карточки товаров Flash Market — Fast Bidding UI

### 7.1 Быстрые ставки (Whatnot/Mercari Style)

Ставки делаются **прямо из карточки** одной кнопкой, без перехода на отдельный экран:

```
┌────────────────────────────────────────┐
│ [📸 Фото товара]                       │
│                                        │
│ iPhone 15 Pro 256GB                    │
│ 📍 Rawai · 🏷️ Как новый                │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │ 💰 ฿15,000   ← текущая ставка     │ │
│ │              3 ставки              │ │
│ │                                    │ │
│ │ ⏱ 01:45:22   ← неоновый таймер    │ │ ← urgency-pulse при < 1ч
│ │ ████████████████░░░░ 78%           │ │
│ └────────────────────────────────────┘ │
│                                        │
│ БЫСТРАЯ СТАВКА:                        │
│ [+ ฿50] [+ ฿200] [+ ฿500] [Своя ▾]   │ ← кнопки шага (как Whatnot)
│                                        │
│ [ ⚡ КУПИТЬ СЕЙЧАС ฿18,000 ]          │ ← gradient green CTA
│                                        │
│ 👁 34  ❤ 5  💬 3                       │
└────────────────────────────────────────┘
```

### 7.2 Кнопки быстрых ставок

```css
.quick-bid-btn {
  padding: 8px 16px;
  border-radius: 10px;
  background: #21262D;
  border: 1px solid rgba(204, 255, 0, 0.2);
  color: #CCFF00;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
  font-size: 13px;
  
  transition: all 150ms ease;
}

.quick-bid-btn:active {
  background: rgba(204, 255, 0, 0.12);
  border-color: #CCFF00;
  transform: scale(0.95);
  box-shadow: 0 0 12px rgba(204, 255, 0, 0.3);
}

.buy-now-btn {
  width: 100%;
  padding: 14px;
  border-radius: 14px;
  background: linear-gradient(135deg, #CCFF00, #B8E600);
  color: #000000;
  font-weight: 800;
  font-size: 14px;
  letter-spacing: 0.03em;
  
  box-shadow: 0 0 20px rgba(204, 255, 0, 0.3);
}
```

---

## 8. Masonry Grid — Двухколоночная сетка товаров

Стиль карточек как в **Xianyu (Idle Fish)** — плотная живая подача:

```css
.market-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 0 12px;
}

.market-card {
  background: #161B22;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.06);
  transition: transform 200ms ease, box-shadow 200ms ease;
}

.market-card:active {
  transform: scale(0.97);
}

.market-card-image {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
}

.market-card-body {
  padding: 10px;
}

/* Плашки срочности (поверх фото) */
.badge-urgent {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  background: rgba(255, 42, 109, 0.9);
  color: white;
  backdrop-filter: blur(4px);
}

.badge-featured {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  background: linear-gradient(135deg, #FFB302, #FF8C00);
  color: #000;
}

.badge-viewers {
  position: absolute;
  bottom: 8px;
  right: 8px;
  padding: 3px 6px;
  border-radius: 4px;
  font-size: 9px;
  background: rgba(0, 0, 0, 0.7);
  color: #8B949E;
  backdrop-filter: blur(4px);
}
```

---

## 9. Референсы проектов — Карта заимствований

### А. Услуги и Аукцион

| Проект | Что берём | Как адаптируем |
|---|---|---|
| **inDrive** | Counter-offer UI с кнопками $5/$10, общий layout приложения | Тот же тёмный стиль, но с неоновым свечением вместо зелёного flat |
| **Fragment.com** | Карточки аукциона, шрифты, статус-теги | Применяем к офферам и бизнес-карточкам |
| **Thumbtack / TaskRabbit** | Wizard создания заявки (3-4 шага) | Адаптируем под Bottom Sheet (не полноэкранный wizard) |

### Б. Flash Market

| Проект | Что берём | Как адаптируем |
|---|---|---|
| **Xianyu (Idle Fish)** | 2-колоночный Masonry Grid, плотная подача, бейджи «Срочно» | Адаптируем цветовую схему под Dark Neon |
| **Whatnot / Mercari** | Fast Bidding (+$1/+$5 кнопки), Buy Now UX | Кнопки `+฿50/+฿200/+฿500` прямо из карточки |
| **OpenSea / Blur.io** | Отображение таймера аукциона, urgency-пульсация | Пульсирующая рамка при < 1 часа |

### В. Сквозной UX

| Проект | Что берём | Как адаптируем |
|---|---|---|
| **Revolut / Wise** | Чистота B2B-кабинета, верификация, финансовые интерфейсы | Стиль настроек AI-менеджера, кошелёк токенов |

> **Важно:** Стиль дизайна максимально приближен к inDrive, но **без явных визуальных пересечений** — используем свою цветовую палитру, шрифты и неоновое свечение.

---

## 10. Обновлённая типографика

```css
/* Шрифты — Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');

/* Правила использования */
.font-display     { font-family: 'Outfit', sans-serif; }
.font-mono        { font-family: 'JetBrains Mono', monospace; }

/* Иерархия */
.heading-xl       { font-size: 28px; font-weight: 900; letter-spacing: -0.02em; }  /* Заголовки экранов */
.heading-lg       { font-size: 22px; font-weight: 800; }  /* Секции */
.heading-md       { font-size: 17px; font-weight: 700; }  /* Карточки */
.body-lg          { font-size: 15px; font-weight: 500; }  /* Основной текст */
.body-sm          { font-size: 13px; font-weight: 400; }  /* Описания */
.caption          { font-size: 11px; font-weight: 600; letter-spacing: 0.05em; }  /* Подписи */
.timer            { font-family: 'JetBrains Mono'; font-size: 18px; font-weight: 700; }  /* Таймеры */
.price            { font-family: 'Outfit'; font-size: 20px; font-weight: 800; }  /* Цены */
.badge-text       { font-family: 'JetBrains Mono'; font-size: 10px; font-weight: 700; letter-spacing: 0.08em; }  /* Бейджи */
```

---

## 11. Анимации и микро-взаимодействия

### 11.1 Переключение Pill Switcher

```css
/* Контент под Pill Switcher морфится */
.mode-content-enter {
  animation: mode-fade-in 250ms ease-out;
}

@keyframes mode-fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* BottomNav иконки меняются */
.nav-icon-morph {
  animation: icon-switch 200ms ease;
}

@keyframes icon-switch {
  0%   { transform: scale(1); opacity: 1; }
  50%  { transform: scale(0.7); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
```

### 11.2 Haptic feedback (тактильная отдача)

```typescript
// При каждом интерактивном действии:
const HAPTIC_MAP = {
  'pill-switch':    'medium',   // Переключение режима
  'bid-place':      'heavy',    // Ставка сделана
  'buy-now':        'heavy',    // Мгновенная покупка
  'tab-switch':     'light',    // Смена вкладки BottomNav
  'bottom-sheet':   'light',    // Открытие шторки
  'save-item':      'light',    // Добавить в избранное
  'timer-warning':  'warning',  // Таймер < 5 минут
} as const;
```

### 11.3 Skeleton Loading

```css
.skeleton {
  background: linear-gradient(
    90deg,
    #161B22 25%,
    #21262D 50%,
    #161B22 75%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
  border-radius: 8px;
}

@keyframes skeleton-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

---

## 12. Обновление всех документов Библии

### 12.1 Документы, затронутые Dual-Mode

| Документ | Что обновлено |
|---|---|
| `00_BRANDING.md` | Цветовое зонирование режимов, AI Badge стилистика |
| `05_UI_UX_SCREEN_SPEC.md` | Pill Switcher вместо плоской навигации, Masonry Grid |
| `12_USER_INTERFACE_COMPLETE.md` | Bottom Sheet паттерн для всех действий |
| `13_BUSINESS_INTERFACE.md` | AI Agent Badge на офферах, Revolut-стиль кабинета |
| `20_FLASH_MARKET_SPEC.md` | Masonry Grid, Fast Bidding, urgency таймеры |
| `21_DYNAMIC_BOTTOM_NAV_AND_MARKET_ADMIN.md` | Pill Switcher заменяет динамический BottomNav |

### 12.2 Правило AI Badge — Применение во всех документах

Везде, где в Библии упоминается AI-отклик, AI Sales Agent или автоматический оффер, должен быть визуально маркирован:

```
Текстовый маркер в wireframe: [🤖 AI · {speed}сек]
CSS-класс: .ai-agent-badge
Цвет рамки: gradient cyan→green
Пульсирующая точка: .ai-dot (green pulse)
```

---

## Changelog

| Версия | Дата | Изменение |
|---|---|---|
| v1.0 | 2026-09-26 | Начальная спецификация: Dual-Mode UX, Pill Switcher, цветовое зонирование, AI Badge, Bottom Sheets, Fast Bidding, Masonry Grid, референсы проектов |
