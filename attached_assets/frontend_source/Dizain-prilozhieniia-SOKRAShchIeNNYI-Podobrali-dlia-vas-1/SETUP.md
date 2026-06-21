# Quality Football — Инструкция по запуску

## Что было исправлено

| # | Проблема | Решение |
|---|----------|---------|
| 1 | Бэкенд: только in-memory хранилище | Добавлен `server/db.ts` + `server/storage.pg.ts` — реальный PostgreSQL через Drizzle |
| 2 | Поиск не работал | Добавлен `useState` + `.filter()` по названию и бренду в `Catalog.tsx` |
| 3 | Корзина — статические данные | Подключена к `/api/cart/:userId` через React Query |
| 4 | Избранное — статические данные | Подключено к `/api/favorites/:userId` через React Query |
| 5 | Шрифт Gotham Pro не подключён | Заменён на **Inter** (Google Fonts, загружается автоматически) |
| 6 | Replit-плагины в vite.config | Убраны, добавлен proxy `/api → localhost:5000` для локальной разработки |

---

## Запуск локально (VS Code)

### Требования
- Node.js 20+
- PostgreSQL (или Docker)
- npm / pnpm

### 1. Установи зависимости

```bash
npm install
# или
pnpm install
```

### 2. Создай базу данных PostgreSQL

**Вариант A — PostgreSQL установлен локально:**
```bash
psql -U postgres
CREATE DATABASE quality_football;
\q
```

**Вариант B — через Docker:**
```bash
docker run -d \
  --name qf-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=quality_football \
  -p 5432:5432 \
  postgres:16
```

### 3. Создай файл .env

```bash
cp .env.example .env
```

Отредактируй `.env`:
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/quality_football
PORT=5000
NODE_ENV=development
```

### 4. Примени схему к базе данных

```bash
npm run db:push
# или
npx drizzle-kit push
```

Это создаст таблицы `products`, `cart_items`, `favorites`, `users`.
Данные (6 бутс) вставятся автоматически при первом запуске сервера.

### 5. Запусти проект

**Терминал 1 — бэкенд:**
```bash
npm run dev
# Сервер запустится на http://localhost:5000
```

**Терминал 2 — фронтенд (в dev-режиме с hot reload):**

> Примечание: в режиме разработки Vite и Express запускаются вместе через `npm run dev`.
> Открой http://localhost:5000 в браузере.

Либо для отдельного Vite dev сервера:
```bash
npx vite
# Откроется http://localhost:5173 (прокси /api → :5000 настроен)
```

### 6. Проверь API

```bash
curl http://localhost:5000/api/products
# Должен вернуть массив из 6 товаров
```

---

## Подключение к Telegram Mini App

### Шаг 1. Разверни сервер в интернет

Telegram требует **HTTPS** и публичный адрес. Варианты:

**Для тестирования (бесплатно):**
```bash
# ngrok
npx ngrok http 5000
# Получишь адрес вида: https://abc123.ngrok.io
```

**Для продакшена:**
- [Railway](https://railway.app) — бесплатный тариф, просто подключи GitHub репо
- [Render](https://render.com) — бесплатный тариф
- [VPS](https://timeweb.cloud) + nginx + pm2

### Шаг 2. Создай бота в Telegram

1. Напиши [@BotFather](https://t.me/BotFather) в Telegram
2. `/newbot` → придумай имя и username
3. Сохрани токен (вида `123456:ABC-DEF...`)

### Шаг 3. Зарегистрируй Mini App

```
/newapp
# выбери своего бота
# Menu Button URL: https://твой-домен.com
# или через /mybots → выбери бота → Bot Settings → Menu Button
```

### Шаг 4. Добавь Telegram SDK на фронтенд

В `client/index.html` уже должен быть (или добавь перед `</head>`):

```html
<script src="https://telegram.org/js/telegram-web-app.js"></script>
```

### Шаг 5. Переменные окружения на продакшене

На Railway/Render добавь:
```
DATABASE_URL=postgresql://...
NODE_ENV=production
PORT=5000
```

### Шаг 6. Билд для продакшена

```bash
npm run build
npm start
```

---

## Что можно улучшить (и где возможны проблемы)

### 🔴 Критично

**1. Нет защиты API**
- **Проблема:** Любой человек может создать корзину с чужим `telegramUserId` просто передав строку в запросе.
- **Решение:** Верифицируй `initData` от Telegram на сервере. Добавь middleware:
  ```ts
  import crypto from "crypto";
  function verifyTelegramWebAppData(initData: string, botToken: string): boolean {
    const data = Object.fromEntries(new URLSearchParams(initData));
    const hash = data.hash;
    delete data.hash;
    const dataCheckString = Object.keys(data).sort()
      .map(k => `${k}=${data[k]}`).join("\n");
    const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
    const hmac = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");
    return hmac === hash;
  }
  ```

**2. Нет обработки заказов**
- **Проблема:** Кнопка "Оформить заказ" есть, но логики нет. Пользователь не получит ни письма, ни уведомления.
- **Решение:** Создай таблицу `orders` в схеме, API `POST /api/orders`, и отправляй уведомление в Telegram боту через `sendMessage`.

### 🟡 Важно

**3. Дублирование кнопки "В корзину" без выбора размера**
- **Проблема:** Можно добавить товар в корзину не выбрав размер. На детальной странице выбор размера есть, но не обязателен.
- **Решение:** Сделать `selectedSize` обязательным для добавления в корзину — показывать ошибку если размер не выбран.

**4. Избранное не синхронизировано с сердечком на карточке**
- **Проблема:** На `Home.tsx` и `Catalog.tsx` сердечко работает через локальный `useState` — не знает, добавлен ли уже товар в избранное на сервере.
- **Решение:** На каждой карточке проверять через `useQuery(["/api/favorites", userId])`, входит ли `product.id` в список.

**5. CORS для Telegram WebApp**
- **Проблема:** Telegram открывает Mini App в iframe. При деплое на разные домены (фронт на Vercel, API на Railway) запросы упадут из-за CORS.
- **Решение:** Добавь в `server/index.ts`:
  ```ts
  import cors from "cors";
  app.use(cors({ origin: process.env.FRONTEND_URL || true, credentials: true }));
  ```
  И `npm install cors @types/cors`.

**6. Картинки товаров из `/figmaAssets/`**
- **Проблема:** Все 6 товаров используют одни и те же 4 изображения (`image-12.png` ... `image-15.png`) из дизайна. Не уникальные.
- **Решение:** Загрузи реальные фото бутс и обнови `seed.ts`, или интегрируй облачное хранилище (S3, Cloudinary).

### 🟢 Улучшения на будущее

**7. Пагинация/бесконечная прокрутка**
- При росте каталога до 50+ товаров, загружать все сразу станет медленно.
- Добавь `?limit=20&offset=0` к `GET /api/products`.

**8. Поиск на сервере**
- Сейчас поиск фильтрует уже загруженные данные на клиенте.
- При большом каталоге лучше делать `GET /api/products?q=nike` и фильтровать в SQL.

**9. Telegram `MainButton`**
- Telegram Mini App предоставляет нативную кнопку внизу экрана.
- Можно использовать `tg.MainButton` вместо кастомной кнопки оформления заказа — выглядит нативнее.

**10. Оффлайн/кэш**
- React Query уже кэширует данные, но при плохой связи лучше добавить `staleTime: 60_000` вместо `Infinity` чтобы данные периодически обновлялись.
