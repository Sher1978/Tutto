# 📁 12_USER_INTERFACE_COMPLETE.md
> **TuttoMinutto** — Полная техническая спецификация интерфейса  
> Версия: 3.0 | Спецификация Шаблонов Услуг & Личных Сохраненных Запросов

---

## 1. Структура Данных Шаблона Услуги (Service Template DTO)

```typescript
export interface ServiceTemplate {
  id: string
  categoryL1Id: string
  title: string
  subtitle: string
  description: string
  defaultBudget: number | null
  currency: string
  coverImageUrl: string
  isCustomUserTemplate?: boolean
}
```

---

## 2. Компонент Карточки Шаблона (`TemplateCard.tsx`)

```tsx
<div className="mockup-card p-5 flex flex-col justify-between relative overflow-hidden">
  {/* Обложка шаблона */}
  <div className="mb-3 rounded-2xl overflow-hidden h-40 w-full relative">
    <img src={template.coverImageUrl} className="w-full h-full object-cover" />
    <div className="absolute inset-0 bg-gradient-to-t from-[#060911] via-transparent to-transparent" />
  </div>

  {/* Заголовок и описание */}
  <h3 className="font-display font-black text-base text-white mb-1">
    {template.title}
  </h3>
  <p className="text-xs text-gray-300 mb-4 line-clamp-2">
    {template.description}
  </p>

  {/* Кнопки Запуска и Сохранения в шаблоны */}
  <div className="flex items-center gap-2">
    <button onClick={() => onLaunchTemplate(template)} className="mockup-btn-primary flex-1 py-3 text-xs">
      ⚡ ЗАЯВКА В 1 КЛИК
    </button>
    <button onClick={() => onSaveToUserTemplates(template)} className="p-3 bg-[#161B22] border border-white/10 rounded-xl text-amber-400">
      📌
    </button>
  </div>
</div>
```

---

## 3. Чеклист реализованного функционала

- [x] Главный экран оптимизирован под JTBD заказчика (выбор хаба ➔ пиктограмма рубрики ➔ предсозданный шаблон).
- [x] Кнопка `⚡ ЗАЯВКА В 1 КЛИК` на каждом шаблоне мгновенно запускает аукцион.
- [x] Кнопка `📌 Сохранить как мой шаблон` сохраняет любой запрос в личные шаблоны пользователя.
- [x] Нижнее меню пересобрано для Заказчика: **Главная**, **Мои заявки**, **➕ Заказ**, **⭐ Избранное & Архив**, **👤 Профиль**.
