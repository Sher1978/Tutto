# 📁 12_USER_INTERFACE_COMPLETE.md
> **TuttoMinutto** — Полная техническая спецификация интерфейса  
> Версия: 2.0 | Полная синхронизация с дизайн-системы мокапа `tuttominutto_ui_brand_1790351781661.png`

---

## 1. Сводная архитектура интерфейса

Интерфейс **TuttoMinutto** построен на принципах **Cyber Resort Glassmorphism**:
- Глубокие обсидиановые фоны `#060911` с многослойными радиальными неон-отсветами.
- Высококонтрастная типографика со свечением `glow-tutto` (`#00F2FE`) и `glow-minutto` (`#00FF87`).
- Гигантские цифры таймеров обратного аукциона (`JetBrains Mono` `#00FF87`).
- 3D-глянцевые плитки категорий с иконками.

---

## 2. Спецификация CSS-токенов

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@600;700;800;900&family=JetBrains+Mono:wght@700;800&display=swap');

:root {
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-display: 'Outfit', 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Фоны */
  --bg-primary: #060911;
  --bg-card: rgba(18, 24, 38, 0.85);
  --bg-surface: #1A2234;

  /* Акценты */
  --cyan: #00F2FE;
  --green: #00FF87;
  --gradient-brand: linear-gradient(135deg, #00F2FE 0%, #00FF87 100%);
  --gradient-card: linear-gradient(160deg, rgba(22, 29, 45, 0.85) 0%, rgba(13, 18, 30, 0.95) 100%);
}
```

---

## 3. Карточка аукциона (Live Reverse Auction Component)

```tsx
<div className="mockup-card p-5 flex flex-col justify-between relative overflow-hidden group">
  {/* Геро-картинка категории или фото клиента */}
  <div className="mb-4 rounded-2xl overflow-hidden h-44 w-full relative">
    <img src={displayImage} className="w-full h-full object-cover" />
    <div className="absolute inset-0 bg-gradient-to-t from-[#060911] via-[#060911]/40 to-transparent" />
    
    {/* Бейдж локации */}
    <div className="absolute top-3 left-3">
      <span className="px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-[#00F2FE]/40 text-[#00F2FE] font-extrabold text-xs uppercase">
        {request.hub.toUpperCase()}: {request.district}
      </span>
    </div>
  </div>

  {/* Заголовок заказа */}
  <h3 className="font-display font-extrabold text-lg text-white mb-2">
    {request.title}
  </h3>

  {/* Блок откликов и низкой цены */}
  <div className="bg-[#121826]/90 p-3.5 rounded-2xl border border-white/10 mb-4 flex justify-between">
    <div>
      <span className="text-xs text-gray-400 font-medium">{request.bidsCount} Bidders</span>
      <span className="text-xs text-gray-300 block">Current Low Bid:</span>
    </div>
    <span className="text-2xl font-black glow-price font-display">${request.budget}</span>
  </div>

  {/* Гигантский неоновый таймер */}
  <div className="flex justify-between items-center mb-4">
    <span className="text-xs text-gray-400 font-bold uppercase">Auction Timer:</span>
    <span className="text-2xl font-black text-[#00FF87] font-mono glow-timer">{timeLeft}</span>
  </div>

  {/* Кнопка отклика во всю ширину */}
  <button className="mockup-btn-primary w-full py-3.5 text-sm">
    VIEW OFFER / BID NOW
  </button>
</div>
```

---

## 4. Чеклист соответствия дизайну мокапа

- [x] Огромный центрированный логотип **TUTTO** (`#00F2FE`) **MINUTTO** (`#00FF87`) со слоганом *Here, you choose!*.
- [x] Плашка статуса юзера и `AI SALES AGENT ACTIVE • Response <1m`.
- [x] Строка выбора регионов `ASIAN HUBS` (`BALI`, `PHUKET`, `BANGKOK`, `SEOUL`, `TOKYO`).
- [x] Квадратные 3D-глянцевые кнопки категорий (`🌴 RESORTS`, `✈️ TOURS`, `🥂 EXPERIENCES`, `⛵ YACHTS`, `🏎️ STAY!`).
- [x] Карточка аукциона с блоком `Current Low Bid: $345` и гигантским зеленым таймером `00:04:18`.
- [x] Полноширинная градиентная кнопка `VIEW OFFER / BID NOW`.
- [x] Никаких лишних верхних кнопок (предоставляются Telegram TMA нативно).
