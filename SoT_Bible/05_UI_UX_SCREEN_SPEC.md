# 📁 05_UI_UX_SCREEN_SPEC.md
> **TuttoMinutto** — Полная спецификация экранов и UI/UX интерфейса  
> Версия: 2.0 | Согласовано по мокапу `tuttominutto_ui_brand_1790351781661.png`

---

## 1. Сетка и Иерархия Главного Экрана (Main Feed Screen Specification)

```text
┌──────────────────────────────────────────────────────────┐
│                    TUTTO MINUTTO                         │  <- 36px Glow Cyan + Green Logo
│                  Here, you choose!                       │  <- Subtitle (white/gray)
│ ┌──────────────────────────────────────────────────────┐ │
│ │ [Avatar] Kaitlyn L. | @kaitlyn.l  AI SALES AGENT     │ │  <- Profile & AI Status Bar
│ │ 4.9 ★ • Online                    ACTIVE • <1m       │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ ASIAN HUBS                                               │  <- Section Header (Outfit Bold)
│ [BALI]  [PHUKET]  [BANGKOK]  [SEOUL]  [TOKYO]            │  <- Glowing Tab Selector
│                                                          │
│ CATEGORIES (3D Glossy Cards)                             │
│ [🌴 RESORTS] [✈️ TOURS] [🥂 EXPERIENCES] [⛵ YACHTS]     │  <- Square 3D Glossy Buttons
│                                                          │
│ LIVE REVERSE AUCTIONS                                    │  <- Live Auction Header
│ ┌──────────────────────────────────────────────────────┐ │
│ │ [ 📸 Hero Photo Banner: Ayana Resort / Scooter ]     │ │  <- Full-width image banner
│ │ 📍 BALI: AYANA Resort - Ocean View Suite             │ │  <- Subtitle location badge
│ │                                                      │ │
│ │ 👥 12 Bidders          Current Low Bid: $345         │ │  <- Low bid price block
│ │                        Original Price: $980          │ │
│ │                                                      │ │
│ │ ⏱️ AUCTION TIMER:      00:04:18                      │ │  <- Giant Glowing Green Timer
│ │                                                      │ │
│ │ [ ⚡ VIEW OFFER / BID NOW                          ] │ │  <- Full-width Gradient Button
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌──────────────────────────────────────────────────────┐ │
│ │  🏠  (Аукцион)    💬 (Отклики)   [➕]   💼 (AI)  👤 │ │  <- Floating Glass Bottom Bar
│ └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

---

## 2. Детальная спецификация элементов дизайна

### 2.1 Хедер и Статус профиля (Header & Status Pill)
- **Контейнер:** Закругленная темная плашка `#121826` с бордером `rgba(255,255,255,0.12)`.
- **Профиль юзера:** Изображение 32x32px, имя `Kaitlyn L.`, ник `@kaitlyn.l`, рейтинг `4.9 ★`, индикатор статуса `Online`.
- **Бейдж AI Sales Agent:** Неоновый градиентный фон с текстом `ACTIVE • Online`, пульсирующая зеленая точка и скорость отклика `Response Time: <1m`.

### 2.2 Таб-бар регионов (ASIAN HUBS)
- **Контекст:** Быстрый переключатель курортных хабов Азии.
- **Стилизация:** Горизонтальный скролл с неоновой подсветкой выбранного города.

### 2.3 Сетка категорий (3D Glossy Category Tiles)
- **Размер:** 72x72px закругленные квадратные 3D-кнопки.
- **Градиент:** Диагональный градиент с верхним белым отсветом.
- **Эмодзи/Иконки:** Крупные визуальные маркеры (`🌴 RESORTS`, `✈️ TOURS`, `🥂 EXPERIENCES`, `⛵ YACHTS`, `🏎️ STAY!`).

### 2.4 Карточка обратного аукциона (Live Reverse Auction Card)
- **Фон карточки:** Темный градиент `#161D2D` → `#0D121E` с скруглением 24px и неоновой тенью `shadow-[0_0_25px_rgba(0,242,254,0.15)]`.
- **Геро-фото:** Высота 176px, полный охват по ширине, плавный нижний градиентный срез `#060911`.
- **Блок цены:** `Current Low Bid: $345` крупным шрифтом `glow-price` (`#00F2FE`), старая цена `$980` зачеркнута.
- **Гигантский таймер:** `00:04:18` высотой 28px, шрифт `JetBrains Mono`, неоновый зеленый цвет `#00FF87` с подсветом.
- **Кнопка:** `VIEW OFFER / BID NOW` во всю ширину карточки, фон `linear-gradient(135deg, #00F2FE 0%, #00FF87 100%)`.

### 2.5 Нижняя навигация (Floating Bottom Bar)
- **Высота:** 64px, плавающий над низом экрана с отступом 12px.
- **Размытие:** `backdrop-filter: blur(20px)`, бордер `rgba(255,255,255,0.15)`.
- **Центральная кнопка:** Круглая кнопка 52x52px с выносом наверх и неоновым кольцом свечения.
