# 📁 03_SERVICE_TAXONOMY.md
> **NeedTnow / TuttoMinutto** — Рубрикатор услуг: 3 уровня глубины  
> L1 → L2 → L3 (Мегакатегория → Категория → Конкретная услуга)

---

## Архитектурные правила матрицы услуг

1. **Обязательная карточка «Другое / More»**:
   - В каждом списке выбора на 2-м уровне (L2) и глубже (L3) **последним элементом всегда располагается карточка «Другое / More»** (`+ СВОЙ ЗАПРОС`).
   - Это позволяет пользователю оформить уникальную заявку в свободной форме, даже если нужной услуги ещё нет в стандартной матрице.
2. **Шаблоны предзаполнения текстов услуг**:
   - При выборе любой существующей услуги из матрицы поле описания автоматически заполняется дружественным, подробным шаблоном заказа.
3. **Динамическое расширение матрицы через Telegram-бот Суперадмина**:
   - При отправке заявки из категории «Другое» суперадмин получает уведомление в Telegram с инлайн-кнопкой `🏷️ Создать подкатегорию`.
   - В 2 шага (выбор L1 -> ввод названия L2/L3) новая услуга создаётся и навсегда сохраняется в единой матрице каталога для всех пользователей.

---

## Структура рубрикатора

```
L1 (Мегакатегория: 1 слово, ≤7 букв, по частоте запросов)
  └── L2 (Категория)
        └── L3 (Конкретная услуга / подкатегория)
              └── Карточка «Другое / More» (всегда последняя в списке)
```

---

## Seed SQL — Полные данные для заполнения БД

```sql
-- ============================================================
-- NEEDTNOW — SERVICE TAXONOMY SEED (RU + EN)
-- ============================================================

-- ============================================================
-- L1: МЕГАКАТЕГОРИИ (Отсортировано по частоте запросов экспатов/туристов)
-- Названия: ровно 1 слово, до 7 букв
-- ============================================================
INSERT INTO categories_l1 (slug, title_ru, title_en, icon_name, sort_order) VALUES
  ('transport', 'Прокат',   'Rentals',    'bike',            1),  -- #1: Байки, авто, трансферы (~35% всех запросов)
  ('housing',   'Жильё',    'Housing',    'home',            2),  -- #2: Виллы, кондо, апартаменты (~25%)
  ('finance',   'Деньги',   'Money',      'banknote',        3),  -- #3: Обмен валют, USDT, наличные в отель (~15%)
  ('services',  'Услуги',   'Services',   'scale',           4),  -- #4: Визаран, страховки, юристы, нотариус
  ('food',      'Еда',      'Food',       'utensils',        5),  -- #5: Доставка еды, продуктов, личный повар
  ('cleaning',  'Клининг',  'Cleaning',   'sparkles',        6),  -- #6: Уборка вилл, бассейн, прачечная
  ('beauty',    'Красота',  'Beauty',     'heart',           7),  -- #7: Массаж на дом, СПА, ногти, стрижки
  ('kids',      'Дети',     'Kids',       'baby',            8),  -- #8: Няни, садики, прокат детских товаров
  ('tours',     'Туры',     'Tours',      'map',             9),  -- #9: Экскурсии на острова, сёрфинг, развлечения
  ('health',    'Врачи',    'Health',     'heart-pulse',     10), -- #10: Вызов врача, IV-капельницы, детокс
  ('courier',   'Курьер',   'Courier',    'package',         11), -- #11: Срочная доставка за 1 час, выкуп лекарств
  ('events',    'Ивенты',   'Events',     'party-popper',    12), -- #12: Праздники, ведущий, диджей, декор
  ('other',     'Другое',   'More',       'more-horizontal', 13); -- #13: Любой свой запрос

-- ============================================================
-- L2 + L3: ТРАНСПОРТ
-- ============================================================
INSERT INTO categories_l2 (parent_id, slug, title_ru, title_en, icon_name, sort_order)
SELECT id, 'transport_motorbike', 'Мотобайки и скутеры', 'Motorbikes & Scooters', 'bike', 1
FROM categories_l1 WHERE slug = 'transport';

INSERT INTO categories_l2 (parent_id, slug, title_ru, title_en, icon_name, sort_order)
SELECT id, 'transport_car', 'Аренда авто', 'Car Rental', 'car', 2
FROM categories_l1 WHERE slug = 'transport';

INSERT INTO categories_l2 (parent_id, slug, title_ru, title_en, icon_name, sort_order)
SELECT id, 'transport_transfer', 'Трансферы', 'Transfers', 'navigation', 3
FROM categories_l1 WHERE slug = 'transport';

INSERT INTO categories_l2 (parent_id, slug, title_ru, title_en, icon_name, sort_order)
SELECT id, 'transport_boat', 'Аренда лодки / яхты', 'Boat & Yacht Rental', 'anchor', 4
FROM categories_l1 WHERE slug = 'transport';

-- L3 — Мотобайки
INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'motorbike_pcx', 'Honda PCX 150', 'Honda PCX 150',
  'Укажите количество дней и желаемое место доставки',
  'Enter number of days and preferred delivery location',
  8.00, 15.00
FROM categories_l2 WHERE slug = 'transport_motorbike';

INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'motorbike_nmax', 'Yamaha NMAX', 'Yamaha NMAX',
  'Укажите количество дней и желаемое место доставки',
  'Enter number of days and preferred delivery location',
  10.00, 18.00
FROM categories_l2 WHERE slug = 'transport_motorbike';

INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'motorbike_cub', 'Honda Cub / Wave (автомат)', 'Honda Cub / Wave (Auto)',
  'Популярный выбор для поездок по городу',
  'Popular choice for city trips',
  5.00, 10.00
FROM categories_l2 WHERE slug = 'transport_motorbike';

INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'motorbike_big', 'Bigbike (400cc+)', 'Bigbike (400cc+)',
  'Требуется водительское удостоверение соответствующей категории',
  'Valid big bike license required',
  25.00, 60.00
FROM categories_l2 WHERE slug = 'transport_motorbike';

-- L3 — Аренда авто
INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'car_economy', 'Эконом (Vios, City, Jazz)', 'Economy Car (Vios, City, Jazz)',
  'Авто без водителя, укажите срок аренды', 'Self-drive, specify rental period', 30.00, 50.00
FROM categories_l2 WHERE slug = 'transport_car';

INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'car_suv', 'SUV (Fortuner, CR-V, RAV4)', 'SUV (Fortuner, CR-V, RAV4)',
  'Идеально для семей и поездок за город', 'Great for families and upcountry trips', 60.00, 120.00
FROM categories_l2 WHERE slug = 'transport_car';

INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'car_van', 'Минивэн (Toyota Hiace)', 'Minivan (Toyota Hiace)',
  'До 12 мест, отлично для групп', 'Up to 12 seats, great for groups', 80.00, 150.00
FROM categories_l2 WHERE slug = 'transport_car';

-- L3 — Трансферы
INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'transfer_airport', 'Трансфер из/в аэропорт', 'Airport Transfer',
  'Укажите рейс, количество человек и направление', 'Specify flight, pax count and direction', 15.00, 40.00
FROM categories_l2 WHERE slug = 'transport_transfer';

INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'transfer_day', 'Водитель на день', 'Driver for the Day',
  'Личный водитель на 8-10 часов', 'Personal driver for 8-10 hours', 50.00, 100.00
FROM categories_l2 WHERE slug = 'transport_transfer';

-- L3 — Лодки и яхты
INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'boat_longtail', 'Лонгтейл (Longtail boat)', 'Longtail Boat',
  'Аренда на несколько часов с водителем', 'Hire by the hour with driver', 30.00, 80.00
FROM categories_l2 WHERE slug = 'transport_boat';

INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'boat_speedboat', 'Спидбот', 'Speedboat',
  'Для острова-хоппинга, укажите маршрут и количество мест', 'Island hopping, specify route and seats', 150.00, 400.00
FROM categories_l2 WHERE slug = 'transport_boat';

INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'boat_yacht', 'Яхта / Катамаран', 'Yacht / Catamaran',
  'Аренда на день или sunset cruise', 'Day charter or sunset cruise', 400.00, 2000.00
FROM categories_l2 WHERE slug = 'transport_boat';

-- ============================================================
-- L2 + L3: ЖИЛЬЁ
-- ============================================================
INSERT INTO categories_l2 (parent_id, slug, title_ru, title_en, icon_name, sort_order)
SELECT id, 'housing_villa', 'Вилла', 'Villa', 'home', 1
FROM categories_l1 WHERE slug = 'housing';

INSERT INTO categories_l2 (parent_id, slug, title_ru, title_en, icon_name, sort_order)
SELECT id, 'housing_condo', 'Кондо / Апартаменты', 'Condo / Apartment', 'building', 2
FROM categories_l1 WHERE slug = 'housing';

INSERT INTO categories_l2 (parent_id, slug, title_ru, title_en, icon_name, sort_order)
SELECT id, 'housing_hotel', 'Гостиница / Бутик', 'Hotel / Boutique', 'hotel', 3
FROM categories_l1 WHERE slug = 'housing';

INSERT INTO categories_l2 (parent_id, slug, title_ru, title_en, icon_name, sort_order)
SELECT id, 'housing_room', 'Комната / Хостел', 'Room / Hostel', 'bed', 4
FROM categories_l1 WHERE slug = 'housing';

-- L3 — Вилла
INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'villa_private_pool', 'Вилла с частным бассейном', 'Private Pool Villa',
  'Укажите количество спален, даты и количество гостей', 'Specify bedrooms, dates and guests', 100.00, 800.00
FROM categories_l2 WHERE slug = 'housing_villa';

INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'villa_beachfront', 'Вилла у пляжа (beachfront)', 'Beachfront Villa',
  'Прямой доступ к пляжу', 'Direct beach access', 200.00, 2000.00
FROM categories_l2 WHERE slug = 'housing_villa';

-- L3 — Кондо
INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'condo_studio', 'Студия', 'Studio',
  'Один человек или пара', 'Solo or couple', 20.00, 60.00
FROM categories_l2 WHERE slug = 'housing_condo';

INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'condo_1br', '1 спальня', '1 Bedroom',
  'Подходит для пары или небольшой семьи', 'Good for couples or small families', 30.00, 100.00
FROM categories_l2 WHERE slug = 'housing_condo';

INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'condo_2br', '2 спальни', '2 Bedrooms',
  'Для семьи или небольшой группы', 'For families or small groups', 50.00, 200.00
FROM categories_l2 WHERE slug = 'housing_condo';

INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'condo_longterm', 'Долгосрочная аренда (1+ мес)', 'Long-Term Rental (1+ month)',
  'Укажите желаемый срок и бюджет в месяц', 'Specify desired term and monthly budget', 400.00, 2000.00
FROM categories_l2 WHERE slug = 'housing_condo';

-- ============================================================
-- L2 + L3: КЛИНИНГ
-- ============================================================
INSERT INTO categories_l2 (parent_id, slug, title_ru, title_en, icon_name, sort_order)
SELECT id, 'cleaning_regular', 'Регулярная уборка', 'Regular Cleaning', 'sparkles', 1
FROM categories_l1 WHERE slug = 'cleaning';

INSERT INTO categories_l2 (parent_id, slug, title_ru, title_en, icon_name, sort_order)
SELECT id, 'cleaning_deep', 'Генеральная уборка', 'Deep Cleaning', 'zap', 2
FROM categories_l1 WHERE slug = 'cleaning';

INSERT INTO categories_l2 (parent_id, slug, title_ru, title_en, icon_name, sort_order)
SELECT id, 'cleaning_pool', 'Уборка бассейна', 'Pool Cleaning', 'droplets', 3
FROM categories_l1 WHERE slug = 'cleaning';

INSERT INTO categories_l2 (parent_id, slug, title_ru, title_en, icon_name, sort_order)
SELECT id, 'cleaning_laundry', 'Стирка и глажка', 'Laundry & Ironing', 'shirt', 4
FROM categories_l1 WHERE slug = 'cleaning';

-- L3 — Регулярная уборка
INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'clean_studio_once', 'Уборка студии / 1BR (разово)', 'Studio / 1BR One-Time Cleaning',
  'Стандартная уборка: пыль, полы, сантехника', 'Standard cleaning: dusting, floors, bathroom', 15.00, 30.00
FROM categories_l2 WHERE slug = 'cleaning_regular';

INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'clean_villa_once', 'Уборка виллы (разово)', 'Villa One-Time Cleaning',
  'Укажите количество спален', 'Specify number of bedrooms', 30.00, 80.00
FROM categories_l2 WHERE slug = 'cleaning_regular';

INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'clean_subscription', 'Подписка (2-3 раза в неделю)', 'Subscription (2-3x per week)',
  'Регулярная уборка по расписанию', 'Regular scheduled cleaning', 100.00, 300.00
FROM categories_l2 WHERE slug = 'cleaning_regular';

-- L3 — Генеральная уборка
INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'deep_condo', 'Генеральная — Кондо', 'Deep Clean — Condo',
  'Полная генеральная, включая кухню и сантехнику', 'Full deep clean including kitchen and bathrooms', 40.00, 80.00
FROM categories_l2 WHERE slug = 'cleaning_deep';

INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'deep_villa', 'Генеральная — Вилла', 'Deep Clean — Villa',
  'Укажите площадь и количество спален', 'Specify area and number of bedrooms', 80.00, 200.00
FROM categories_l2 WHERE slug = 'cleaning_deep';

-- L3 — Бассейн
INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'pool_weekly', 'Обслуживание бассейна (еженедельно)', 'Pool Maintenance (Weekly)',
  'Чистка, химия, проверка фильтров', 'Cleaning, chemicals, filter check', 20.00, 50.00
FROM categories_l2 WHERE slug = 'cleaning_pool';

-- L3 — Стирка
INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'laundry_kg', 'Прачечная (за кг)', 'Laundry (per kg)',
  'Сдача и получение в течение 24 часов', 'Drop-off and pick-up within 24 hours', 1.00, 3.00
FROM categories_l2 WHERE slug = 'cleaning_laundry';

INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'laundry_ironing', 'Глажка рубашек / брюк', 'Ironing — Shirts / Trousers',
  'Укажите количество вещей', 'Specify item count', 1.00, 2.00
FROM categories_l2 WHERE slug = 'cleaning_laundry';

-- ============================================================
-- L2 + L3: ЕДА И ДОСТАВКА
-- ============================================================
INSERT INTO categories_l2 (parent_id, slug, title_ru, title_en, icon_name, sort_order)
SELECT id, 'food_delivery', 'Доставка еды', 'Food Delivery', 'package', 1
FROM categories_l1 WHERE slug = 'food';

INSERT INTO categories_l2 (parent_id, slug, title_ru, title_en, icon_name, sort_order)
SELECT id, 'food_chef', 'Личный повар', 'Private Chef', 'chef-hat', 2
FROM categories_l1 WHERE slug = 'food';

INSERT INTO categories_l2 (parent_id, slug, title_ru, title_en, icon_name, sort_order)
SELECT id, 'food_catering', 'Кейтеринг', 'Catering', 'utensils', 3
FROM categories_l1 WHERE slug = 'food';

-- L3 — Доставка
INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'delivery_groceries', 'Продукты из магазина', 'Grocery Shopping',
  'Список продуктов и адрес доставки', 'Shopping list and delivery address', 5.00, 15.00
FROM categories_l2 WHERE slug = 'food_delivery';

INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'delivery_restaurant', 'Доставка из ресторана', 'Restaurant Delivery',
  'Название ресторана или кухня на выбор', 'Restaurant name or preferred cuisine', 3.00, 10.00
FROM categories_l2 WHERE slug = 'food_delivery';

-- L3 — Личный повар
INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'chef_dinner', 'Ужин на вилле (повар)', 'Villa Dinner (Private Chef)',
  'Количество гостей, кухня и дата', 'Guest count, cuisine type and date', 50.00, 200.00
FROM categories_l2 WHERE slug = 'food_chef';

INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'chef_weekly', 'Повар на неделю (3 раза в день)', 'Weekly Chef (3 meals/day)',
  'Постоянный личный повар на период проживания', 'Resident chef for your stay', 300.00, 800.00
FROM categories_l2 WHERE slug = 'food_chef';

-- ============================================================
-- L2 + L3: КРАСОТА И ЗДОРОВЬЕ
-- ============================================================
INSERT INTO categories_l2 (parent_id, slug, title_ru, title_en, icon_name, sort_order)
SELECT id, 'beauty_massage', 'Массаж', 'Massage', 'hand', 1
FROM categories_l1 WHERE slug = 'beauty';

INSERT INTO categories_l2 (parent_id, slug, title_ru, title_en, icon_name, sort_order)
SELECT id, 'beauty_nails', 'Ногти / Маникюр', 'Nails / Manicure', 'scissors', 2
FROM categories_l1 WHERE slug = 'beauty';

INSERT INTO categories_l2 (parent_id, slug, title_ru, title_en, icon_name, sort_order)
SELECT id, 'beauty_hair', 'Волосы / Парикмахерская', 'Hair / Barbershop', 'scissors', 3
FROM categories_l1 WHERE slug = 'beauty';

INSERT INTO categories_l2 (parent_id, slug, title_ru, title_en, icon_name, sort_order)
SELECT id, 'beauty_fitness', 'Фитнес / Йога', 'Fitness / Yoga', 'activity', 4
FROM categories_l1 WHERE slug = 'beauty';

-- L3 — Массаж
INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'massage_thai', 'Тайский массаж (1 час)', 'Thai Massage (1 hour)',
  'Укажите адрес или «Приедем к вам»', 'Specify address or "mobile service"', 10.00, 20.00
FROM categories_l2 WHERE slug = 'beauty_massage';

INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'massage_oil', 'Масляный / Ароматерапия (1 час)', 'Oil / Aromatherapy Massage (1 hr)',
  'Опишите предпочтения (интенсивность, масло)', 'Describe preferences (pressure, oil)', 15.00, 35.00
FROM categories_l2 WHERE slug = 'beauty_massage';

INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'massage_mobile', 'Мобильный массаж (на дому)', 'Mobile Massage (In-Home)',
  'Мастер приедет с оборудованием', 'Therapist comes with equipment', 25.00, 60.00
FROM categories_l2 WHERE slug = 'beauty_massage';

-- L3 — Ногти
INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'nails_gel_manicure', 'Гель-маникюр', 'Gel Manicure',
  'Укажите желаемый дизайн', 'Specify desired design', 12.00, 30.00
FROM categories_l2 WHERE slug = 'beauty_nails';

INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'nails_pedicure', 'Педикюр', 'Pedicure',
  'Классический или SPA педикюр', 'Classic or SPA pedicure', 10.00, 25.00
FROM categories_l2 WHERE slug = 'beauty_nails';

-- L3 — Волосы
INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'hair_cut_woman', 'Женская стрижка', 'Women Haircut',
  'Опишите желаемую длину и стиль', 'Describe desired length and style', 15.00, 50.00
FROM categories_l2 WHERE slug = 'beauty_hair';

INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'hair_cut_man', 'Мужская стрижка / Барбершоп', 'Men Haircut / Barbershop',
  'Стрижка + укладка', 'Cut + styling', 8.00, 20.00
FROM categories_l2 WHERE slug = 'beauty_hair';

-- L3 — Фитнес
INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'fitness_personal', 'Персональная тренировка', 'Personal Training',
  'Укажите уровень подготовки и цели', 'Specify fitness level and goals', 20.00, 60.00
FROM categories_l2 WHERE slug = 'beauty_fitness';

INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'fitness_yoga', 'Йога (индивидуально / группа)', 'Yoga (Private / Group)',
  'Укажите количество человек и уровень', 'Specify people count and level', 15.00, 40.00
FROM categories_l2 WHERE slug = 'beauty_fitness';

-- ============================================================
-- L2 + L3: ТУРЫ И АКТИВНОСТИ
-- ============================================================
INSERT INTO categories_l2 (parent_id, slug, title_ru, title_en, icon_name, sort_order)
SELECT id, 'tours_island', 'Острова и острова', 'Island Hopping', 'map-pin', 1
FROM categories_l1 WHERE slug = 'tours';

INSERT INTO categories_l2 (parent_id, slug, title_ru, title_en, icon_name, sort_order)
SELECT id, 'tours_excursions', 'Экскурсии и туры', 'Excursions & Tours', 'compass', 2
FROM categories_l1 WHERE slug = 'tours';

INSERT INTO categories_l2 (parent_id, slug, title_ru, title_en, icon_name, sort_order)
SELECT id, 'tours_water', 'Водные активности', 'Water Sports', 'waves', 3
FROM categories_l1 WHERE slug = 'tours';

-- L3 — Острова
INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'island_phi_phi', 'Острова Пхи-Пхи (Пхукет)', 'Phi-Phi Islands (Phuket)',
  'Дата, количество человек и тип лодки', 'Date, pax count and boat type', 30.00, 80.00
FROM categories_l2 WHERE slug = 'tours_island';

INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'island_james_bond', 'Остров Джеймса Бонда (Пхангнга)', 'James Bond Island (Phang Nga)',
  'Дата и количество человек', 'Date and pax count', 35.00, 90.00
FROM categories_l2 WHERE slug = 'tours_island';

-- L3 — Экскурсии
INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'tour_temples', 'Экскурсия по храмам', 'Temple Tour',
  'Количество человек и дата', 'Pax count and date', 25.00, 60.00
FROM categories_l2 WHERE slug = 'tours_excursions';

INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'tour_elephant', 'Слоновий лагерь / Sanctuary', 'Elephant Sanctuary',
  'Этичный санктуарий без катания', 'Ethical sanctuary, no riding', 40.00, 100.00
FROM categories_l2 WHERE slug = 'tours_excursions';

-- L3 — Водные активности
INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'water_diving', 'Дайвинг (с инструктором)', 'Scuba Diving (with instructor)',
  'Уровень опыта, количество человек', 'Experience level, pax count', 50.00, 150.00
FROM categories_l2 WHERE slug = 'tours_water';

INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'water_surf', 'Серфинг (урок)', 'Surf Lesson',
  'Для начинающих или опытных', 'Beginner or intermediate level', 20.00, 50.00
FROM categories_l2 WHERE slug = 'tours_water';

INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'water_kayak', 'Аренда каяка / SUP', 'Kayak / SUP Rental',
  'На несколько часов или весь день', 'Hourly or full-day rental', 5.00, 20.00
FROM categories_l2 WHERE slug = 'tours_water';

-- ============================================================
-- L2 + L3: ПРОЧИЕ УСЛУГИ
-- ============================================================
INSERT INTO categories_l2 (parent_id, slug, title_ru, title_en, icon_name, sort_order)
SELECT id, 'services_repair', 'Ремонт и мастер', 'Repair & Handyman', 'wrench', 1
FROM categories_l1 WHERE slug = 'services';

INSERT INTO categories_l2 (parent_id, slug, title_ru, title_en, icon_name, sort_order)
SELECT id, 'services_photo', 'Фото и видео', 'Photo & Video', 'camera', 2
FROM categories_l1 WHERE slug = 'services';

INSERT INTO categories_l2 (parent_id, slug, title_ru, title_en, icon_name, sort_order)
SELECT id, 'services_assist', 'Ассистент / Concierge', 'Assistant / Concierge', 'user-check', 3
FROM categories_l1 WHERE slug = 'services';

INSERT INTO categories_l2 (parent_id, slug, title_ru, title_en, icon_name, sort_order)
SELECT id, 'services_medical', 'Медицина', 'Medical', 'heart-pulse', 4
FROM categories_l1 WHERE slug = 'services';

-- L3 — Ремонт
INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'repair_ac', 'Ремонт / чистка кондиционера', 'AC Repair / Cleaning',
  'Опишите проблему и модель кондиционера', 'Describe issue and AC model', 15.00, 60.00
FROM categories_l2 WHERE slug = 'services_repair';

INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'repair_plumbing', 'Сантехника', 'Plumbing',
  'Опишите проблему', 'Describe the issue', 20.00, 100.00
FROM categories_l2 WHERE slug = 'services_repair';

INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'repair_electric', 'Электрика', 'Electrical',
  'Опишите проблему', 'Describe the issue', 20.00, 100.00
FROM categories_l2 WHERE slug = 'services_repair';

-- L3 — Фото и видео
INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'photo_portrait', 'Фотосессия (портрет / lifestyle)', 'Portrait / Lifestyle Shoot',
  'Длительность, количество человек и локация', 'Duration, pax count and location', 50.00, 200.00
FROM categories_l2 WHERE slug = 'services_photo';

INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'photo_drone', 'Аэросъёмка (дрон)', 'Aerial Photography (Drone)',
  'Локация и желаемый результат', 'Location and expected output', 80.00, 300.00
FROM categories_l2 WHERE slug = 'services_photo';

-- L3 — Ассистент
INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'assist_translator', 'Переводчик (русский/тайский)', 'Translator (Russian/Thai)',
  'Задача: сопровождение, больница, переговоры', 'Task: escort, hospital, negotiations', 20.00, 80.00
FROM categories_l2 WHERE slug = 'services_assist';

INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'assist_concierge', 'Консьерж (решение задач)', 'Concierge (Task Solver)',
  'Любая задача: документы, покупки, бронирования', 'Any task: docs, shopping, bookings', 15.00, 50.00
FROM categories_l2 WHERE slug = 'services_assist';

-- L3 — Медицина
INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'medical_doctor_home', 'Врач на дом', 'Doctor Home Visit',
  'Симптомы и адрес', 'Symptoms and address', 60.00, 150.00
FROM categories_l2 WHERE slug = 'services_medical';

INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'medical_pcr', 'ПЦР-тест / экспресс-тест', 'PCR / Rapid Test',
  'Укажите тип теста и адрес', 'Specify test type and address', 15.00, 60.00
FROM categories_l2 WHERE slug = 'services_medical';

-- ============================================================
-- L2 + L3: ДРУГОЕ / MORE
-- ============================================================
INSERT INTO categories_l2 (parent_id, slug, title_ru, title_en, icon_name, sort_order)
SELECT id, 'other_moving', 'Переезд и грузчики', 'Moving & Cargo', 'truck', 1
FROM categories_l1 WHERE slug = 'other';

INSERT INTO categories_l2 (parent_id, slug, title_ru, title_en, icon_name, sort_order)
SELECT id, 'other_pets', 'Уход за питомцами', 'Pet Care', 'dog', 2
FROM categories_l1 WHERE slug = 'other';

INSERT INTO categories_l2 (parent_id, slug, title_ru, title_en, icon_name, sort_order)
SELECT id, 'other_tutoring', 'Обучение и репетиторы', 'Tutoring & Lessons', 'book-open', 3
FROM categories_l1 WHERE slug = 'other';

INSERT INTO categories_l2 (parent_id, slug, title_ru, title_en, icon_name, sort_order)
SELECT id, 'other_custom', 'Своя услуга / Запрос', 'Custom Request', 'help-circle', 4
FROM categories_l1 WHERE slug = 'other';

-- L3 — Другое
INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'moving_help', 'Помощь при переезде и перевозка вещей', 'Moving & Freight Assistance',
  'Опишите объем вещей, откуда и куда перевозить', 'Describe cargo volume, pickup and dropoff', 30.00, 150.00
FROM categories_l2 WHERE slug = 'other_moving';

INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'pet_sitting', 'Выгул / Передержка животных', 'Pet Sitting / Walking',
  'Укажите вид питомца и нужные даты', 'Specify pet type and required dates', 10.00, 30.00
FROM categories_l2 WHERE slug = 'other_pets';

INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'tutor_lesson', 'Инструктор / Репетитор', 'Private Tutor / Instructor',
  'Укажите предмет, цель и формат занятий', 'Specify subject, goal and class format', 15.00, 50.00
FROM categories_l2 WHERE slug = 'other_tutoring';

INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'custom_request', 'Индивидуальный запрос (любая услуга)', 'Custom Service Request',
  'Опишите подробно, что именно вам требуется и желаемый бюджет', 'Describe in detail what you need and your target budget', 10.00, 500.00
FROM categories_l2 WHERE slug = 'other_custom';
```

---

## Сводная таблица рубрикатора

| L1 (Мегакатегория) | L2 (Категория) | Кол-во L3 |
|---|---|---|
| 🚗 **Транспорт** | Мотобайки | 4 |
| | Аренда авто | 3 |
| | Трансферы | 2 |
| | Лодки / Яхты | 3 |
| 🏡 **Жильё** | Вилла | 2 |
| | Кондо | 4 |
| | Отель / Хостел | 2 |
| 🧹 **Клининг** | Регулярная | 3 |
| | Генеральная | 2 |
| | Бассейн | 1 |
| | Стирка | 2 |
| 🍽️ **Еда** | Доставка | 2 |
| | Личный повар | 2 |
| | Кейтеринг | 1 |
| 💆 **Красота** | Массаж | 3 |
| | Ногти | 2 |
| | Волосы | 2 |
| | Фитнес / Йога | 2 |
| 🗺️ **Туры** | Острова | 2 |
| | Экскурсии | 2 |
| | Водные активности | 3 |
| 🔧 **Прочие** | Ремонт | 3 |
| | Фото / Видео | 2 |
| | Ассистент | 2 |
| | Медицина | 2 |
| 🌀 **Другое / More** | Переезд и грузчики | 1 |
| | Уход за питомцами | 1 |
| | Обучение и репетиторы | 1 |
| | Своя услуга / Запрос | 1 |
| **ИТОГО (8 мегакатегорий)** | **30 L2** | **~60 L3** |
