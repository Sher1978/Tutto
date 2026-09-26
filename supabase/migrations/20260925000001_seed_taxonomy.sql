-- ============================================================
-- NEEDTNOW / TUTTOMINUTTO — SERVICE TAXONOMY SEED (v1.0)
-- 7 L1 Mega-Categories, 26 L2 Categories, 50+ L3 Services
-- ============================================================

-- ============================================================
-- L1: МЕГАКАТЕГОРИИ (8 штук)
-- ============================================================
INSERT INTO categories_l1 (slug, title_ru, title_en, icon_name, sort_order) VALUES
  ('transport',  'Транспорт',        'Transport',          'bike',       1),
  ('housing',    'Жильё',            'Housing',            'home',       2),
  ('cleaning',   'Клининг',          'Cleaning',           'sparkles',   3),
  ('food',       'Еда и доставка',   'Food & Delivery',    'utensils',   4),
  ('beauty',     'Красота и здоровье','Beauty & Wellness',  'heart',      5),
  ('tours',      'Туры и активности','Tours & Activities',  'map',        6),
  ('services',   'Прочие услуги',    'Other Services',     'wrench',     7),
  ('other',      'Другое / More',    'More / Custom',      'more-horizontal', 8)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- L2 + L3: ТРАНСПОРТ
-- ============================================================
INSERT INTO categories_l2 (parent_id, slug, title_ru, title_en, icon_name, sort_order)
SELECT id, 'transport_motorbike', 'Мотобайки и скутеры', 'Motorbikes & Scooters', 'bike', 1
FROM categories_l1 WHERE slug = 'transport'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories_l2 (parent_id, slug, title_ru, title_en, icon_name, sort_order)
SELECT id, 'transport_car', 'Аренда авто', 'Car Rental', 'car', 2
FROM categories_l1 WHERE slug = 'transport'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories_l2 (parent_id, slug, title_ru, title_en, icon_name, sort_order)
SELECT id, 'transport_transfer', 'Трансферы', 'Transfers', 'navigation', 3
FROM categories_l1 WHERE slug = 'transport'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories_l2 (parent_id, slug, title_ru, title_en, icon_name, sort_order)
SELECT id, 'transport_boat', 'Аренда лодки / яхты', 'Boat & Yacht Rental', 'anchor', 4
FROM categories_l1 WHERE slug = 'transport'
ON CONFLICT (slug) DO NOTHING;

-- L3 — Мотобайки
INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'motorbike_pcx', 'Honda PCX 150', 'Honda PCX 150',
  'Укажите количество дней и желаемое место доставки',
  'Enter number of days and preferred delivery location',
  8.00, 15.00
FROM categories_l2 WHERE slug = 'transport_motorbike'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'motorbike_nmax', 'Yamaha NMAX', 'Yamaha NMAX',
  'Укажите количество дней и желаемое место доставки',
  'Enter number of days and preferred delivery location',
  10.00, 18.00
FROM categories_l2 WHERE slug = 'transport_motorbike'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'motorbike_cub', 'Honda Cub / Wave (автомат)', 'Honda Cub / Wave (Auto)',
  'Популярный выбор для поездок по городу',
  'Popular choice for city trips',
  5.00, 10.00
FROM categories_l2 WHERE slug = 'transport_motorbike'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'motorbike_big', 'Bigbike (400cc+)', 'Bigbike (400cc+)',
  'Требуется водительское удостоверение соответствующей категории',
  'Valid big bike license required',
  25.00, 60.00
FROM categories_l2 WHERE slug = 'transport_motorbike'
ON CONFLICT (slug) DO NOTHING;

-- L3 — Аренда авто
INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'car_economy', 'Эконом (Vios, City, Jazz)', 'Economy Car (Vios, City, Jazz)',
  'Авто без водителя, укажите срок аренды', 'Self-drive, specify rental period', 30.00, 50.00
FROM categories_l2 WHERE slug = 'transport_car'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'car_suv', 'SUV (Fortuner, CR-V, RAV4)', 'SUV (Fortuner, CR-V, RAV4)',
  'Идеально для семей и поездок за город', 'Great for families and upcountry trips', 60.00, 120.00
FROM categories_l2 WHERE slug = 'transport_car'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'car_van', 'Минивэн (Toyota Hiace)', 'Minivan (Toyota Hiace)',
  'До 12 мест, отлично для групп', 'Up to 12 seats, great for groups', 80.00, 150.00
FROM categories_l2 WHERE slug = 'transport_car'
ON CONFLICT (slug) DO NOTHING;

-- L3 — Трансферы
INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'transfer_airport', 'Трансфер из/в аэропорт', 'Airport Transfer',
  'Укажите рейс, количество человек и направление', 'Specify flight, pax count and direction', 15.00, 40.00
FROM categories_l2 WHERE slug = 'transport_transfer'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'transfer_day', 'Водитель на день', 'Driver for the Day',
  'Личный водитель на 8-10 часов', 'Personal driver for 8-10 hours', 50.00, 100.00
FROM categories_l2 WHERE slug = 'transport_transfer'
ON CONFLICT (slug) DO NOTHING;

-- L3 — Лодки и яхты
INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'boat_longtail', 'Лонгтейл (Longtail boat)', 'Longtail Boat',
  'Аренда на несколько часов с водителем', 'Hire by the hour with driver', 30.00, 80.00
FROM categories_l2 WHERE slug = 'transport_boat'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'boat_speedboat', 'Спидбот', 'Speedboat',
  'Для острова-хоппинга, укажите маршрут и количество мест', 'Island hopping, specify route and seats', 150.00, 400.00
FROM categories_l2 WHERE slug = 'transport_boat'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'boat_yacht', 'Яхта / Катамаран', 'Yacht / Catamaran',
  'Аренда на день или sunset cruise', 'Day charter or sunset cruise', 400.00, 2000.00
FROM categories_l2 WHERE slug = 'transport_boat'
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- L2 + L3: ЖИЛЬЁ
-- ============================================================
INSERT INTO categories_l2 (parent_id, slug, title_ru, title_en, icon_name, sort_order)
SELECT id, 'housing_villa', 'Вилла', 'Villa', 'home', 1
FROM categories_l1 WHERE slug = 'housing'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories_l2 (parent_id, slug, title_ru, title_en, icon_name, sort_order)
SELECT id, 'housing_condo', 'Кондо / Апартаменты', 'Condo / Apartment', 'building', 2
FROM categories_l1 WHERE slug = 'housing'
ON CONFLICT (slug) DO NOTHING;

-- L3 — Вилла
INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'villa_private_pool', 'Вилла с частным бассейном', 'Private Pool Villa',
  'Укажите количество спален, даты и количество гостей', 'Specify bedrooms, dates and guests', 100.00, 800.00
FROM categories_l2 WHERE slug = 'housing_villa'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'villa_beachfront', 'Вилла у пляжа (beachfront)', 'Beachfront Villa',
  'Прямой доступ к пляжу', 'Direct beach access', 200.00, 2000.00
FROM categories_l2 WHERE slug = 'housing_villa'
ON CONFLICT (slug) DO NOTHING;

-- L3 — Кондо
INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'condo_studio', 'Студия', 'Studio',
  'Один человек или пара', 'Solo or couple', 20.00, 60.00
FROM categories_l2 WHERE slug = 'housing_condo'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'condo_1br', '1 спальня', '1 Bedroom',
  'Подходит для пары или небольшой семьи', 'Good for couples or small families', 30.00, 100.00
FROM categories_l2 WHERE slug = 'housing_condo'
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- L2 + L3: КРАСОТА И ЗДОРОВЬЕ
-- ============================================================
INSERT INTO categories_l2 (parent_id, slug, title_ru, title_en, icon_name, sort_order)
SELECT id, 'beauty_massage', 'Массаж', 'Massage', 'hand', 1
FROM categories_l1 WHERE slug = 'beauty'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'massage_thai', 'Тайский массаж (1 час)', 'Thai Massage (1 hour)',
  'Укажите адрес или «Приедем к вам»', 'Specify address or "mobile service"', 10.00, 20.00
FROM categories_l2 WHERE slug = 'beauty_massage'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'massage_oil', 'Масляный / Ароматерапия (1 час)', 'Oil / Aromatherapy Massage (1 hr)',
  'Опишите предпочтения (интенсивность, масло)', 'Describe preferences (pressure, oil)', 15.00, 35.00
FROM categories_l2 WHERE slug = 'beauty_massage'
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- L2 + L3: ДРУГОЕ / MORE
-- ============================================================
INSERT INTO categories_l2 (parent_id, slug, title_ru, title_en, icon_name, sort_order)
SELECT id, 'other_moving', 'Переезд и грузчики', 'Moving & Cargo', 'truck', 1
FROM categories_l1 WHERE slug = 'other'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories_l2 (parent_id, slug, title_ru, title_en, icon_name, sort_order)
SELECT id, 'other_pets', 'Уход за питомцами', 'Pet Care', 'dog', 2
FROM categories_l1 WHERE slug = 'other'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories_l2 (parent_id, slug, title_ru, title_en, icon_name, sort_order)
SELECT id, 'other_tutoring', 'Обучение и репетиторы', 'Tutoring & Lessons', 'book-open', 3
FROM categories_l1 WHERE slug = 'other'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories_l2 (parent_id, slug, title_ru, title_en, icon_name, sort_order)
SELECT id, 'other_custom', 'Своя услуга / Запрос', 'Custom Request', 'help-circle', 4
FROM categories_l1 WHERE slug = 'other'
ON CONFLICT (slug) DO NOTHING;

-- L3 — Другое
INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'moving_help', 'Помощь при переезде и перевозка вещей', 'Moving & Freight Assistance',
  'Опишите объем вещей, откуда и куда перевозить', 'Describe cargo volume, pickup and dropoff', 30.00, 150.00
FROM categories_l2 WHERE slug = 'other_moving'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'pet_sitting', 'Выгул / Передержка животных', 'Pet Sitting / Walking',
  'Укажите вид питомца и нужные даты', 'Specify pet type and required dates', 10.00, 30.00
FROM categories_l2 WHERE slug = 'other_pets'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'tutor_lesson', 'Инструктор / Репетитор', 'Private Tutor / Instructor',
  'Укажите предмет, цель и формат занятий', 'Specify subject, goal and class format', 15.00, 50.00
FROM categories_l2 WHERE slug = 'other_tutoring'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories_l3 (parent_id, slug, title_ru, title_en, hint_ru, hint_en, price_min, price_max)
SELECT id, 'custom_request', 'Индивидуальный запрос (любая услуга)', 'Custom Service Request',
  'Опишите подробно, что именно вам требуется и желаемый бюджет', 'Describe in detail what you need and your target budget', 10.00, 500.00
FROM categories_l2 WHERE slug = 'other_custom'
ON CONFLICT (slug) DO NOTHING;
