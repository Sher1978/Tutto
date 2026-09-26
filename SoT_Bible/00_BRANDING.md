# 📁 00_BRANDING.md
> **TuttoMinutto** — Брендинг и Дизайн-система  
> Версия: 3.0 | Дата: 2026-09-26  
> Дизайн-концепция: **Cyberpunk Dual-Mode** (Cyan + Lemon)

---

## 1. Название бренда и слоган

### Официальное написание
**`TuttoMinutto`** — одно слово, CamelCase с заглавными `T` и `M`. В логотипе визуально разделяется цветом: **TUTTO** (`#00F2FE` Neon Cyan) и **MINUTTO** (`#CCFF00` Cyber Lemon).

### Утверждённый слоган
> # «Здесь выбираешь ты!»
> **EN версия:** *Here, you choose!*

---

## 2. Дизайн-система: Cyberpunk Dual-Mode

Приложение работает в двух визуальных режимах, каждый со своим акцентным цветом. Оба режима объединяет общий тёмный фон и киберпанковая неоновая эстетика.

### 2.1 Общая палитра (сквозная для обоих режимов)

```css
/* ═══════════════════════════════════════════════════ */
/*  ОБЩИЕ ФОНЫ — одинаковые в обоих режимах           */
/* ═══════════════════════════════════════════════════ */

--bg-primary:      #0D1117;  /* Сверхтёмный графит (фон приложения) */
--bg-deep:         #060911;  /* Глубокий обсидиан (фон splash/overlay) */
--bg-card:         #161B22;  /* Карточки и плашки */
--bg-surface:      #21262D;  /* Поля ввода, вторичные элементы */
--bg-elevated:     #1A2234;  /* Поднятые элементы (Bottom Sheet, modal) */

/* ═══════════════════════════════════════════════════ */
/*  ТЕКСТ                                              */
/* ═══════════════════════════════════════════════════ */

--text-primary:    #FFFFFF;
--text-secondary:  #8B949E;
--text-tertiary:   #484F58;
--text-disabled:   #30363D;

/* ═══════════════════════════════════════════════════ */
/*  УНИВЕРСАЛЬНЫЕ АКЦЕНТЫ (не привязаны к режиму)     */
/* ═══════════════════════════════════════════════════ */

--danger:          #FF2A6D;  /* Coral — ошибки, urgency-таймеры, апелляции */
--gold:            #FFB302;  /* Золото — рейтинги ★, Featured, VIP */
--purple-glow:     #7000FF;  /* Фоновые радиальные отсветы */
--success:         #00C853;  /* Подтверждения, галочки */
```

### 2.2 Режим «Услуги» — Neon Cyan

```css
/* ═══════════════════════════════════════════════════ */
/*  РЕЖИМ УСЛУГ — «холодный» (AI, технологии, сервис) */
/* ═══════════════════════════════════════════════════ */

--cyan:            #00F2FE;  /* Основной акцент — TUTTO */
--cyan-dimmed:     #00B8D4;  /* Приглушённый — вторичные элементы */
--cyan-glow:       rgba(0, 242, 254, 0.3);  /* Свечение */
--cyan-bg:         rgba(0, 242, 254, 0.08); /* Фон для тегов */

/* Градиент (для CTA в режиме Услуг) */
--gradient-services: linear-gradient(135deg, #00F2FE 0%, #00D4E8 100%);

/* Где применяется:
   - Активные иконки BottomNav
   - Цены в карточках услуг
   - Кнопка «Разместить заказ»
   - Pill Switcher active state
   - Бордеры фокусных полей
   - AI Agent badge (совместно с lemon)
*/
```

### 2.3 Режим «Flash Market» — Cyber Lemon

```css
/* ═══════════════════════════════════════════════════ */
/*  РЕЖИМ FLASH MARKET — «тёплый» (деньги, торговля)  */
/* ═══════════════════════════════════════════════════ */

--lemon:           #CCFF00;  /* Основной акцент — MINUTTO */
--lemon-dimmed:    #A3CC00;  /* Приглушённый — вторичные элементы */
--lemon-glow:      rgba(204, 255, 0, 0.3);  /* Свечение */
--lemon-bg:        rgba(204, 255, 0, 0.08); /* Фон для тегов */

/* Градиент (для CTA в режиме Market) */
--gradient-market: linear-gradient(135deg, #CCFF00 0%, #B8E600 100%);

/* Где применяется:
   - Активные иконки BottomNav (маркет)
   - Цены и ставки на товары
   - Кнопка «Продать вещь»
   - Pill Switcher active state (маркет)
   - Buy Now badge
   - Quick Bid кнопки (+฿50, +฿200)
*/
```

### 2.4 Бренд-градиент (объединяет оба режима)

```css
/* Сквозной градиент — логотип, промо, AI badge */
--gradient-brand:  linear-gradient(135deg, #00F2FE 0%, #CCFF00 100%);

/* Применение:
   - Логотип: TUTTO(cyan) → MINUTTO(lemon)
   - AI Agent Badge border
   - Hub Selector active pill
   - Промо-баннеры
   - Splash screen
*/
```

### 2.5 Urgency-таймеры (единые для обоих режимов)

```css
/* Таймер — ВСЕГДА Coral Red, не зависит от режима */
--timer-normal:    #8B949E;  /* > 1 часа — серый, спокойный */
--timer-warning:   #FFB302;  /* < 1 часа — золотой, внимание */
--timer-urgent:    #FF2A6D;  /* < 15 минут — коралловый, пульсация */
```

---

## 3. Неоновое свечение (Glow Typography)

### 3.1 Текстовые стили

```css
/* Логотип — TUTTO (Cyan) */
.glow-tutto {
  color: #00F2FE;
  text-shadow: 0 0 10px rgba(0, 242, 254, 0.9),
               0 0 25px rgba(0, 242, 254, 0.6);
}

/* Логотип — MINUTTO (Lemon) */
.glow-minutto {
  color: #CCFF00;
  text-shadow: 0 0 10px rgba(204, 255, 0, 0.9),
               0 0 25px rgba(204, 255, 0, 0.6);
}

/* Таймер (нормальный — Cyan для услуг) */
.glow-timer-services {
  color: #00F2FE;
  font-family: 'JetBrains Mono', monospace;
  text-shadow: 0 0 20px rgba(0, 242, 254, 0.8);
}

/* Таймер (нормальный — Lemon для маркета) */
.glow-timer-market {
  color: #CCFF00;
  font-family: 'JetBrains Mono', monospace;
  text-shadow: 0 0 20px rgba(204, 255, 0, 0.8);
}

/* Таймер (urgency — красный, единый) */
.glow-timer-urgent {
  color: #FF2A6D;
  font-family: 'JetBrains Mono', monospace;
  text-shadow: 0 0 20px rgba(255, 42, 109, 0.8);
  animation: urgency-pulse 1.5s ease-in-out infinite;
}

/* Цена — режим Услуг */
.glow-price-services {
  color: #00F2FE;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  text-shadow: 0 0 20px rgba(0, 242, 254, 0.8);
}

/* Цена / Ставка — режим Market */
.glow-price-market {
  color: #CCFF00;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  text-shadow: 0 0 20px rgba(204, 255, 0, 0.8);
}

/* Пульсация urgency (< 15 мин) */
@keyframes urgency-pulse {
  0%, 100% { opacity: 1; text-shadow: 0 0 10px rgba(255, 42, 109, 0.6); }
  50%      { opacity: 0.7; text-shadow: 0 0 30px rgba(255, 42, 109, 0.9); }
}
```

---

## 4. AI Agent Badge — Сквозной элемент

AI Agent Badge использует **бренд-градиент** (Cyan → Lemon), подчёркивая что AI работает во всех режимах.

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

  box-shadow: 0 0 12px rgba(204, 255, 0, 0.15),
              inset 0 0 8px rgba(0, 242, 254, 0.05);
}

/* Пульсирующая точка ACTIVE */
.ai-dot {
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

---

## 5. Анатомия главных компонентов

### 5.1 Заголовок приложения (Header)
1. **Логотип:**
   - **TUTTO** (`#00F2FE`, 36px ExtraBold, glow) + **MINUTTO** (`#CCFF00`, 36px ExtraBold, glow)
   - Подпись: *Здесь выбираешь ты!* (`#E5E7EB`, 13px, font-medium)
2. **Status Bar (профиль + AI):**
   - Полупрозрачная плашка `#161B22` с `border-radius: 20px`
   - Слева: Avatar, имя, рейтинг `⭐ 4.9`, индикатор `Online`
   - Справа: AI Agent Badge с градиентной рамкой `#00F2FE → #CCFF00`

### 5.2 Pill Switcher (Dual-Mode)
- Фиксирован сверху, sticky
- Фон капсулы: `#161B22` с `border: 1px solid rgba(255,255,255,0.08)`
- Active Services: `background: linear-gradient(135deg, #00F2FE, #00D4E8)`, `color: #000`
- Active Market: `background: linear-gradient(135deg, #CCFF00, #B8E600)`, `color: #000`
- Inactive: `background: transparent`, `color: #8B949E`

### 5.3 Hub Selector (ASIAN HUBS)
- Активный хаб: градиентная плашка `#00F2FE → #CCFF00` с чёрным текстом
- Неактивные: прозрачные, серый текст `#8B949E`

### 5.4 Карточка обратного аукциона (Услуги)
1. **Геро-фото** с градиентным затемнением книзу
2. **Цена:** `$345` — крупный Neon Cyan `#00F2FE` с glow
3. **Таймер:** `00:04:18` — JetBrains Mono, цвет по urgency (cyan → gold → coral)
4. **CTA:** Gradient Cyan `#00F2FE → #00D4E8`, чёрный текст

### 5.5 Карточка товара Flash Market
1. **Фото товара** 1:1, Masonry Grid
2. **Цена/Ставка:** `฿15,000` — крупный Cyber Lemon `#CCFF00` с glow
3. **Таймер:** JetBrains Mono, цвет по urgency (lemon → gold → coral)
4. **Buy Now:** Gradient Lemon `#CCFF00 → #B8E600`, чёрный текст
5. **Quick Bid кнопки:** `+฿50`, `+฿200` — outline lemon

### 5.6 BottomNav (Floating Glass Bar)
- Стекло: `background: white/8%`, `backdrop-filter: blur(20px)`, `border-radius: 24px`
- Режим Услуг: активная иконка `#00F2FE` + cyan glow
- Режим Market: активная иконка `#CCFF00` + lemon glow
- Центральная CTA: **плавает** над BottomNav (Sticky FAB)

---

## 6. Типографика

```css
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');

/* Назначение */
.font-display   { font-family: 'Outfit', sans-serif; }        /* Заголовки, кнопки, цены */
.font-mono      { font-family: 'JetBrains Mono', monospace; } /* Таймеры, бейджи, коды */

/* Иерархия */
.heading-xl     { font-size: 28px; font-weight: 900; letter-spacing: -0.02em; }
.heading-lg     { font-size: 22px; font-weight: 800; }
.heading-md     { font-size: 17px; font-weight: 700; }
.body-lg        { font-size: 15px; font-weight: 500; }
.body-sm        { font-size: 13px; font-weight: 400; }
.caption        { font-size: 11px; font-weight: 600; letter-spacing: 0.05em; }
.timer          { font-family: 'JetBrains Mono'; font-size: 18px; font-weight: 700; }
.price          { font-family: 'Outfit'; font-size: 20px; font-weight: 800; }
.badge-text     { font-family: 'JetBrains Mono'; font-size: 10px; font-weight: 700; letter-spacing: 0.08em; }
```

---

## 7. Быстрая шпаргалка (Design Tokens)

| Токен | Hex | Роль |
|---|---|---|
| `--bg-primary` | `#0D1117` | Фон приложения |
| `--bg-card` | `#161B22` | Карточки |
| `--bg-surface` | `#21262D` | Поля ввода |
| `--cyan` | `#00F2FE` | **TUTTO** · Услуги · AI · Цены услуг |
| `--lemon` | `#CCFF00` | **MINUTTO** · Flash Market · Цены товаров |
| `--gradient-brand` | `#00F2FE → #CCFF00` | Логотип · AI Badge · Hub active |
| `--danger` | `#FF2A6D` | Urgency-таймеры · Ошибки · Апелляции |
| `--gold` | `#FFB302` | Рейтинги · Featured · VIP |
| `--text-primary` | `#FFFFFF` | Основной текст |
| `--text-secondary` | `#8B949E` | Второстепенный |

---

## 8. История изменений

| Версия | Дата | Описание |
|---|---|---|
| 1.0 | 2026-09-25 | Первая версия бренда TuttoMinutto |
| 2.0 | 2026-09-25 | Апдейт по мокапу: неоновые шрифты, 3D-карточки, гигантские таймеры |
| 3.0 | 2026-09-26 | **Cyberpunk Dual-Mode:** Cyan (#00F2FE) + Lemon (#CCFF00), цветовое зонирование режимов, AI Badge с бренд-градиентом, urgency-таймеры Coral |
