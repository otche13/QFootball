-- Запускай это ПОСЛЕ npm run db:push
-- Команда: psql $DATABASE_URL < seed.sql
-- Или вставь прямо в Render → Database → Query

-- Удаляем старые данные (если повторный запуск)
TRUNCATE products RESTART IDENTITY CASCADE;

INSERT INTO products (name, brand, price, description, images, sizes, is_original, in_stock) VALUES

(
  'Nike Phantom GX Elite FG',
  'Nike',
  18990,
  'Профессиональные бутсы с технологией Ghost Lace для точного удара. Подошва FG оптимальна для натурального газона.',
  ARRAY[
    'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/phantom-gx-elite-fg.png',
    'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/phantom-gx-elite-fg-2.png'
  ],
  ARRAY['39','40','40.5','41','42','42.5','43','44','44.5','45'],
  true,
  true
),

(
  'Adidas Predator Accuracy+ FG',
  'Adidas',
  16490,
  'Зоны Precision Zone с резиновыми вставками для максимального контроля мяча. Верх Primeknit обеспечивает идеальную посадку.',
  ARRAY[
    'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/predator-accuracy-fg.jpg',
    'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/predator-accuracy-fg-2.jpg'
  ],
  ARRAY['39','40','40.5','41','42','42.5','43','44','44.5','45','46'],
  true,
  true
),

(
  'Nike Mercurial Superfly 9 Elite FG',
  'Nike',
  21490,
  'Легчайшая модель для скоростных игроков. Технология Flyknit и подошва с шипами AG обеспечивают молниеносный старт.',
  ARRAY[
    'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/mercurial-superfly-9-elite-fg.png',
    'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/mercurial-superfly-9-elite-fg-2.png'
  ],
  ARRAY['38.5','39','40','40.5','41','42','42.5','43','44','45'],
  true,
  true
),

(
  'Puma King Platinum FG/AG',
  'Puma',
  12990,
  'Классические бутсы с натуральной кожей. Мягкий верх kangaroo leather для непревзойдённого ощущения мяча.',
  ARRAY[
    'https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa/global/king-platinum-fg-ag.jpg',
    'https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa/global/king-platinum-fg-ag-2.jpg'
  ],
  ARRAY['40','40.5','41','42','42.5','43','44','44.5','45','46'],
  true,
  true
),

(
  'Adidas Copa Pure+ FG',
  'Adidas',
  14990,
  'Верх Leather touch из натуральной кожи обеспечивает исключительный контакт с мячом. Идеал для технических игроков.',
  ARRAY[
    'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/copa-pure-plus-fg.jpg'
  ],
  ARRAY['39','40','41','42','43','44','45'],
  true,
  true
),

(
  'Nike Tiempo Legend 10 Elite FG',
  'Nike',
  19490,
  'Легендарные бутсы с верхом Kanga-Lite для лучшего контроля. Внутренняя стелька ACC улучшает контакт в любую погоду.',
  ARRAY[
    'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/tiempo-legend-10-elite-fg.png'
  ],
  ARRAY['40','40.5','41','42','42.5','43','44','45'],
  true,
  true
),

(
  'New Balance Furon v7+ Pro FG',
  'New Balance',
  11490,
  'Революционный верх Pearlized Kangaroo для точности паса и удара. Подошва Hypoknit обеспечивает поддержку стопы.',
  ARRAY[
    'https://nb.scene7.com/is/image/NB/furon-v7-pro-fg.jpg'
  ],
  ARRAY['40','41','42','43','44','45'],
  true,
  true
),

(
  'Mizuno Morelia Neo IV Beta Japan FG',
  'Mizuno',
  24990,
  'Флагманская модель ручной работы. Верх из кожи кенгуру Super K обеспечивает невероятную мягкость и точность.',
  ARRAY[
    'https://images.mizuno.jp/images/morelia-neo-iv-beta-japan-fg.jpg'
  ],
  ARRAY['39','40','41','42','43','44','45'],
  true,
  true
);
