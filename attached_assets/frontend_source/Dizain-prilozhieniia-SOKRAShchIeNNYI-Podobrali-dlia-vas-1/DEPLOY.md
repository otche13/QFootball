# Запуск Quality Football в продакшн

## Что нужно сделать — чеклист

- [ ] 1. Создать Telegram-бота у @BotFather
- [ ] 2. Прописать свой Telegram username в коде
- [ ] 3. Зарегистрироваться на Render и задеплоить
- [ ] 4. Создать базу данных на Render
- [ ] 5. Заполнить базу товарами
- [ ] 6. Привязать Mini App к боту

---

## Шаг 1. Telegram Bot — создать бота

1. Открой Telegram → найди **@BotFather**
2. Отправь `/newbot`
3. Придумай название: `Quality Football`
4. Придумай username (должен заканчиваться на `bot`): например `quality_football_shop_bot`
5. BotFather пришлёт **токен** вида `123456789:ABCdef...` — сохрани его, понадобится на Render

> ⚠️ Токен бота нигде не публикуй. Это пароль от бота.

---

## Шаг 2. Прописать свой Telegram username

В файле `.env` (локально) и на Render в переменных окружения:

```
VITE_ADMIN_TG=твой_username_без_собачки
```

Например, если ты `@Vasya_Shop`, то:
```
VITE_ADMIN_TG=Vasya_Shop
```

Это то, куда будут перенаправляться покупатели при нажатии "Купить".  
**Это твой личный username, не username бота.**

---

## Шаг 3. Деплой на Render

### 3.1 Загрузи проект на GitHub

```bash
# В папке проекта:
git init
git add .
git commit -m "Quality Football initial"
```

Зайди на [github.com/new](https://github.com/new) → создай репозиторий → следуй инструкции "push existing repository".

### 3.2 Создай Web Service на Render

1. Зайди на [render.com](https://render.com) → Sign Up (бесплатно)
2. **New → Web Service**
3. Подключи GitHub репозиторий
4. Render сам найдёт `render.yaml` и заполнит поля. Проверь:

| Поле | Значение |
|------|----------|
| Build Command | `npm install && npm run build` |
| Start Command | `npm start` |
| Region | Frankfurt (EU) |

### 3.3 Переменные окружения (Environment Variables)

На странице сервиса → **Environment** → добавь:

| Ключ | Значение |
|------|---------|
| `DATABASE_URL` | (см. Шаг 4) |
| `VITE_ADMIN_TG` | твой Telegram username без @ |
| `NODE_ENV` | `production` |

> `SESSION_SECRET` не нужен — авторизации в приложении нет.

---

## Шаг 4. База данных PostgreSQL на Render

### 4.1 Создай базу

1. На Render → **New → PostgreSQL**
2. Название: `quality-football-db`
3. Регион: Frankfurt (тот же, что и сервис)
4. Plan: **Free** (достаточно для старта)
5. Нажми **Create Database**

### 4.2 Скопируй строку подключения

На странице базы → раздел **Connections** → скопируй **Internal Database URL**  
(выглядит как `postgresql://user:password@host/dbname`)

Вставь её как значение `DATABASE_URL` в переменных Web Service (Шаг 3.3).

### 4.3 Создай таблицы

После первого деплоя зайди в **Shell** вкладку на Render (или локально с DATABASE_URL):

```bash
npm run db:push
```

Это создаст таблицы `products`, `cart_items`, `favorites`, `users`.

---

## Шаг 5. Заполнить базу товарами

Есть два способа:

### Способ А — через Render Dashboard (проще)

1. Render → твоя база → вкладка **Query**
2. Открой файл `seed.sql` из проекта
3. Скопируй содержимое и вставь в поле запроса
4. Нажми **Run**

### Способ Б — через терминал (если есть локальный psql)

```bash
psql $DATABASE_URL < seed.sql
```

### Добавить свой товар вручную

```sql
INSERT INTO products (name, brand, price, description, images, sizes, is_original, in_stock)
VALUES (
  'Nike Air Zoom Mercurial',   -- название
  'Nike',                       -- бренд
  15990,                        -- цена в рублях (целое число)
  'Описание товара...',         -- описание
  ARRAY['https://ссылка-на-фото.jpg', 'https://ссылка-на-фото-2.jpg'],
  ARRAY['39','40','41','42','43','44','45'],  -- размеры EU
  true,   -- оригинал?
  true    -- в наличии?
);
```

> 💡 Для фотографий используй любой хостинг изображений: Imgur, Cloudinary,
> или загружай напрямую в GitHub и копируй raw-ссылку.

---

## Шаг 6. Привязать Mini App к боту

После успешного деплоя у тебя будет URL вида `https://quality-football.onrender.com`.

1. Открой @BotFather → `/mybots` → выбери бота
2. **Bot Settings → Menu Button → Configure menu button**
3. Введи URL: `https://quality-football.onrender.com`
4. Введи текст кнопки: `Открыть магазин`

Теперь в боте появится кнопка **Открыть магазин** — нажатие открывает Mini App.

Также создай Web App:
1. @BotFather → `/newapp`
2. Выбери бота
3. Название: `Quality Football`
4. URL: `https://quality-football.onrender.com`
5. Получишь ссылку вида: `https://t.me/quality_football_shop_bot/app`

---

## Структура базы данных

### Таблица `products` (товары)

| Поле | Тип | Описание |
|------|-----|---------|
| `id` | integer | Автоматически |
| `name` | text | Название бутс |
| `brand` | text | Бренд (Nike, Adidas, ...) |
| `price` | integer | Цена в рублях |
| `description` | text | Описание |
| `images` | text[] | Массив URL фотографий |
| `sizes` | text[] | Массив размеров EU |
| `is_original` | boolean | Оригинал (показывает значок ✓) |
| `in_stock` | boolean | В наличии |

### Таблица `cart_items` (корзина)

Заполняется автоматически когда покупатели добавляют товары.

### Таблица `favorites` (избранное)

Заполняется автоматически.

---

## Что будет работать после деплоя

1. Покупатель открывает Mini App через бота
2. Видит каталог товаров из базы
3. Может добавить в корзину и в избранное
4. Нажимает **"Купить"** или **"Оформить заказ"**
5. Telegram открывает твой личный чат с готовым сообщением
6. Покупатель нажимает «Отправить» — ты получаешь сообщение

---

## Возможные проблемы

**Пустой каталог после деплоя**  
→ Запусти `npm run db:push`, потом выполни `seed.sql`

**"Владелец магазина не настроен"**  
→ Проверь, что `VITE_ADMIN_TG` задан в переменных окружения Render и передеплой

**Бутсы не открываются в Telegram**  
→ Убедись, что URL в @BotFather совпадает с URL на Render (без слеша в конце)

**Free план Render засыпает через 15 минут**  
→ Это нормально для бесплатного плана. Первый запрос после сна занимает ~30 сек.  
→ Для постоянной работы — перейди на план Starter ($7/мес)
