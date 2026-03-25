# 🚀 SubManager - Полная инструкция по установке и запуску

## 📖 Описание проекта

**SubManager** - это полнофункциональное приложение для управления подписками с интеграцией российских платежных систем, парсингом почты, аналитикой затрат, прогнозированием трат и умными уведомлениями.

### ✨ Основные возможности

- 📊 **Централизованное отображение** всех активных подписок
- 💳 **Автоматический сбор данных** через парсинг почты (TensorFlow.js & YandexGPT)
- 📈 **Аналитика и визуализация** затрат с графиками
- 🔮 **Прогнозирование трат** с помощью AI
- 🔔 **Умные уведомления** о предстоящих платежах
- 💡 **Рекомендации альтернативных** сервисов
- 🌍 **Многоязычность** (RU, EN, BE, ZH, ES, FR) с флагами стран
- 💱 **Поддержка валют** с автоматическим пересчётом курсов
- 🎨 **Оранжево-чёрный дизайн** с переключателем на светлую тему
- 👥 **Система ролей** (владельцы и обычные пользователи)
- 🔒 **Полная аутентификация** через Supabase Auth
- ☁️ **Облачное хранилище** данных в Supabase Database
- 🛡️ **Row Level Security** для защиты данных

---

## 📋 Содержание

1. [Требования](#требования)
2. [Технологии](#технологии)
3. [Установка](#установка)
4. [Настройка Supabase](#настройка-supabase)
5. [Переменные окружения](#переменные-окружения)
6. [Миграции базы данных](#миграции-базы-данных)
7. [Настройка флагов стран](#настройка-флагов-стран)
8. [Настройка AI интеграций](#настройка-ai-интеграций)
9. [Запуск проекта](#запуск-проекта)
10. [Система ролей](#система-ролей)
11. [Структура проекта](#структура-проекта)
12. [Обход блокировки Supabase в России](#обход-блокировки-supabase-в-россии)
13. [Troubleshooting](#troubleshooting)

---

## ⚙️ Требования

Перед началом установки убедитесь, что у вас установлено:

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 или **pnpm** >= 8.0.0 (рекомендуется)
- **Git**
- Аккаунт **Supabase** (бесплатный план достаточен)

---

## 🛠 Технологии

### Frontend
- **React** 18.3.1
- **TypeScript**
- **Tailwind CSS** v4.1.12
- **Vite** 6.3.5
- **React Router** 7.13.0

### UI Компоненты
- **Radix UI** - доступные компоненты
- **Lucide React** - иконки
- **Recharts** - графики и диаграммы
- **Motion** (Framer Motion) - анимации
- **Sonner** - уведомления

### Backend & Database
- **Supabase** - база данных, аутентификация, хранилище
- **PostgreSQL** - с Row Level Security

### AI & ML
- **TensorFlow.js** - парсинг почты и анализ
- **@tensorflow-models/universal-sentence-encoder** - обработка текста
- **YandexGPT** (опционально) - альтернативная AI интеграция

---

## 📦 Установка

### 1. Клонирование репозитория

```bash
git clone https://github.com/beliy338/SubManager_byNexus.git
cd submanager
```

### 2. Установка зависимостей

Рекомендуется использовать **pnpm**:

```bash
pnpm install
```

Или с **npm**:

```bash
npm install
```

---

## 🗄️ Настройка Supabase

### Шаг 1: Создание проекта

1. Перейдите на [supabase.com](https://supabase.com)
2. Войдите или зарегистрируйтесь
3. Нажмите **"New Project"**
4. Заполните данные:
   - **Name**: SubManager
   - **Database Password**: придумайте надёжный пароль
   - **Region**: выберите ближайший регион (Europe West рекомендуется)
   - **Pricing Plan**: Free (достаточно для начала)
5. Нажмите **"Create new project"** и дождитесь создания (1-2 минуты)

### Шаг 2: Получение ключей доступа

1. В левом меню выберите **"Settings"** → **"API"**
2. Скопируйте следующие данные:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Project ID**: `your-project-id` (из URL)
   - **anon public key**: начинается с `eyJ...`

### Шаг 3: Настройка аутентификации

1. В левом меню выберите **"Authentication"** → **"Providers"**
2. Включите **Email** провайдер (должен быть включен по умолчанию)
3. В разделе **"Email Auth"**:
   - Включите **"Enable email confirmations"** (опционально)
   - Настройте **Email Templates** если нужно

---

## 🔑 Переменные окружения

### Создание файлов конфигурации

#### 1. Создайте файл `/utils/supabase/info.tsx`

```tsx
// Supabase Project Configuration
export const projectId = "your-project-id"; // Замените на ваш Project ID
export const publicAnonKey = "your-anon-public-key"; // Замените на ваш anon key
```

**⚠️ Важно**: 
- Замените `your-project-id` на ваш реальный Project ID
- Замените `your-anon-public-key` на ваш реальный anon key из Supabase

#### 2. Создайте файл `.env` (опционально, для прокси)

Если вы находитесь в России и Supabase заблокирован:

```env
VITE_SUPABASE_PROXY_URL=https://your-worker.your-subdomain.workers.dev
```

> См. раздел [Обход блокировки Supabase в России](#обход-блокировки-supabase-в-россии)

#### 3. YandexGPT API (опционально)

Если хотите использовать YandexGPT:

```env
VITE_YANDEX_API_KEY=your-yandex-api-key
VITE_YANDEX_FOLDER_ID=your-yandex-folder-id
```

---

## 🗃️ Миграции базы данных

Необходимо выполнить SQL скрипты в **Supabase SQL Editor** по порядку:

### Порядок выполнения миграций

1. **Базовая схема** → `/supabase/migrations/001_initial_schema.sql`
2. **Таблица сервисов** → `/supabase-services-table.sql`
3. **Система уведомлений** → `/supabase-notifications-system.sql`
4. **Система поддержки** → `/supabase-support-complete-setup.sql`
5. **Флаги стран** → `/supabase/migrations/002_country_flags.sql`
6. **AI разрешения** → `/ADD_AI_PERMISSION_COLUMN.sql`
7. **Российские сервисы** (опционально) → `/supabase-insert-russian-universal-services.sql`

### Как выполнить миграции

1. Откройте **Supabase Dashboard**
2. Перейдите в **"SQL Editor"**
3. Нажмите **"New query"**
4. Скопируйте содержимое SQL файла
5. Нажмите **"Run"** или нажмите `Ctrl+Enter`
6. Убедитесь что запрос выполнился без ошибок
7. Повторите для всех миграций по порядку

### Проверка миграций

После выполнения всех миграций проверьте что созданы таблицы:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

Должны быть следующие таблицы:
- ✅ `subscriptions`
- ✅ `user_settings`
- ✅ `services`
- ✅ `notification_settings`
- ✅ `notification_logs`
- ✅ `support_messages`
- ✅ `country_flags`

---

## 🏴 Настройка флагов стран

Флаги стран должны быть автоматически добавлены миграцией `002_country_flags.sql`.

### Проверка флагов

Выполните в SQL Editor:

```sql
SELECT country_code, language_code, flag_emoji 
FROM country_flags 
ORDER BY country_code;
```

Должны быть флаги для: RU, GB, BY, CN, ES, FR

### Если флагов нет

Выполните вручную:

```sql
INSERT INTO country_flags (country_code, language_code, flag_url, flag_emoji) VALUES
  ('RU', 'ru', 'https://flagcdn.com/w320/ru.png', '🇷🇺'),
  ('GB', 'en', 'https://flagcdn.com/w320/gb.png', '🇬🇧'),
  ('BY', 'be', 'https://flagcdn.com/w320/by.png', '🇧🇾'),
  ('CN', 'zh', 'https://flagcdn.com/w320/cn.png', '🇨🇳'),
  ('ES', 'es', 'https://flagcdn.com/w320/es.png', '🇪🇸'),
  ('FR', 'fr', 'https://flagcdn.com/w320/fr.png', '🇫🇷')
ON CONFLICT (country_code) DO UPDATE SET
  flag_url = EXCLUDED.flag_url,
  flag_emoji = EXCLUDED.flag_emoji;
```

### Дополнительная информация

См. файлы:
- `/ИНСТРУКЦИЯ_УСТАНОВКИ_ФЛАГОВ.md` - подробная инструкция
- `/FLAGS_SETUP_GUIDE.txt` - руководство по настройке
- `/ЧЕК_ЛИСТ_ФЛАГИ.md` - чек-лист проверки

---

## 🤖 Настройка AI интеграций

### TensorFlow.js (встроен, работает автономно)

TensorFlow.js работает в браузере и не требует дополнительной настройки:

- ✅ Парсинг почты для автоматического добавления подписок
- ✅ Анализ текста и извлечение информации
- ✅ Прогнозирование трат
- ✅ **Не требует API ключей**
- ✅ **Работает офлайн**

### YandexGPT (опционально, для улучшенной AI)

#### 1. Получение API ключа

1. Перейдите на [cloud.yandex.ru](https://cloud.yandex.ru)
2. Создайте аккаунт или войдите
3. Создайте новый **Folder** (каталог)
4. В разделе **API Keys** создайте **Service Account**
5. Создайте **API Key** для этого Service Account
6. Скопируйте API Key и Folder ID

#### 2. Настройка в проекте

Добавьте в `.env`:

```env
VITE_YANDEX_API_KEY=your-api-key-here
VITE_YANDEX_FOLDER_ID=your-folder-id-here
```

#### 3. Ограничения бесплатного тарифа

- **Trial period**: 1000 запросов в день
- **После trial**: 1000 запросов в месяц бесплатно
- **Timeout**: 15 секунд на запрос

> Подробнее: `/YANDEXGPT_INTEGRATION.md`

### AI Permission Modal

При первом входе пользователь увидит модальное окно с запросом разрешения на использование AI:

- **"Да"** - AI функции будут включены
- **"Позже"** - окно появится при следующем входе
- **"Никогда"** - AI функции отключены навсегда

Выбор сохраняется в БД (`user_settings.ai_permission`) и синхронизируется между устройствами.

---

## 🚀 Запуск проекта

### Development режим

```bash
pnpm run dev
```

или

```bash
npm run dev
```

Приложение запустится на `http://localhost:5173`

### Production build

```bash
pnpm run build
```

Сгенерированные файлы будут в папке `/dist`

### Предпросмотр production build

```bash
pnpm run preview
```

---

## 👥 Система ролей

В приложении две роли:

### 🔑 Владельцы (Owners)

Email адреса:
- `max.sokolvp@gmail.com`
- `belovodvadim@gmail.com`

**Права**:
- ✅ Создание новых сервисов
- ✅ Редактирование сервисов
- ✅ Удаление сервисов
- ✅ Управление тарифными планами
- ✅ Просмотр всех сообщений в Support Chat
- ✅ Ответы на сообщения пользователей
- ✅ Все права обычных пользователей

### 👤 Обычные пользователи

**Права**:
- ✅ Просмотр созданных сервисов
- ✅ Добавление подписок из списка сервисов
- ✅ Создание кастомных подписок
- ✅ Редактирование своих подписок
- ✅ Удаление своих подписок
- ✅ Просмотр аналитики
- ✅ Настройка уведомлений
- ✅ Отправка сообщений в Support
- ❌ Создание/редактирование сервисов

### Как стать владельцем

Владельцами могут быть только аккаунты с email:
- `max.sokolvp@gmail.com`
- `belovodvadim@gmail.com`

Эти email жестко прописаны в политиках RLS базы данных.

**Для добавления нового владельца**:

1. Выполните SQL запрос в Supabase:

```sql
-- Пример добавления нового владельца
-- Замените все политики, добавив новый email

ALTER POLICY "Only owners can insert services" ON public.services
WITH CHECK (
  LOWER(auth.jwt() ->> 'email') IN (
    'max.sokolvp@gmail.com', 
    'belovodvadim@gmail.com',
    'new-owner@example.com'
  )
);

-- Повторите для всех политик с проверкой владельца
```

---

## 📁 Структура проекта

```
submanager/
├── src/
│   ├── app/
│   │   ├── components/          # React компоненты
│   │   │   ├── ui/              # UI компоненты (Radix UI)
│   │   │   ├── AddSubscriptionModal.tsx
│   │   │   ├── EditSubscriptionModal.tsx
│   │   │   ├── SupportModal.tsx
│   │   │   ├── AIPermissionModal.tsx
│   │   │   ├── NotificationsModal.tsx
│   │   │   └── ...
│   │   ├── contexts/            # React контексты
│   │   │   └── AppContext.tsx   # Глобальный стейт
│   │   ├── layouts/             # Лейауты
│   │   │   └── MainLayout.tsx
│   │   ├── pages/               # Страницы приложения
│   │   │   ├── Dashboard.tsx    # Главная страница
│   │   │   ├── Subscriptions.tsx
│   │   │   ├── Analytics.tsx
│   │   │   ├── Profile.tsx
│   │   │   ├── Settings.tsx
│   │   │   ├── Login.tsx
│   │   │   └── Signup.tsx
│   │   ├── utils/               # Утилиты
│   │   │   ├── supabase.ts      # Supabase клиент
│   │   │   ├── api.ts           # API функции
│   │   │   ├── roles.ts         # Проверка ролей
│   │   │   ├── translations.ts  # Переводы
│   │   │   ├── tensorflow.ts    # TensorFlow.js
│   │   │   ├── yandexgpt.ts     # YandexGPT
│   │   │   └── flags.ts         # Флаги стран
│   │   ├── routes.tsx           # Роутинг (React Router)
│   │   └── App.tsx              # Главный компонент
│   └── styles/
│       ├── index.css            # Глобальные стили
│       ├── theme.css            # CSS переменные темы
│       ├── tailwind.css         # Tailwind импорты
│       └── fonts.css            # Импорт шрифтов
├── supabase/
│   ├── migrations/              # SQL миграции
│   │   ├── 001_initial_schema.sql
│   │   └── 002_country_flags.sql
│   └── functions/               # Edge Functions (опционально)
├── utils/
│   └── supabase/
│       └── info.tsx             # Конфигурация Supabase
├── package.json
├── vite.config.ts
├── postcss.config.mjs
└── README_SETUP.md              # Этот файл
```

---

## 🌐 Обход блокировки Supabase в России

Если Supabase заблокирован в вашем регионе, используйте Cloudflare Workers:

### Вариант 1: Использование готового Worker (рекомендуется)

1. **Создайте Cloudflare Worker**:
   - Зарегистрируйтесь на [cloudflare.com](https://cloudflare.com)
   - Перейдите в **Workers & Pages**
   - Нажмите **Create Application** → **Create Worker**
   - Название: `supabase-proxy`

2. **Скопируйте код**:
   - Откройте файл `/cloudflare-worker-code.js`
   - Скопируйте весь код
   - Вставьте в Worker Editor
   - Замените `YOUR_SUPABASE_PROJECT_ID` на ваш Project ID

3. **Деплой**:
   - Нажмите **Save and Deploy**
   - Скопируйте URL Worker: `https://supabase-proxy.your-subdomain.workers.dev`

4. **Настройте в проекте**:
   - Создайте файл `.env` в корне проекта
   - Добавьте:
   ```env
   VITE_SUPABASE_PROXY_URL=https://supabase-proxy.your-subdomain.workers.dev
   ```

### Вариант 2: VPN

Используйте VPN для подключения к Supabase напрямую.

### Проверка подключения

После настройки прокси или VPN:

1. Запустите приложение
2. Откройте консоль браузера (F12)
3. Попробуйте войти или зарегистрироваться
4. Если нет ошибок сети - всё работает

> Подробнее: 
> - `/CLOUDFLARE_DEPLOY_GUIDE_RU.md`
> - `/ИНСТРУКЦИЯ_CLOUDFLARE_WORKER.html`
> - `/QUICK_START_PROXY.md`

---

## 🐛 Troubleshooting

### Проблема: "Failed to fetch" при входе

**Решение**: Проверьте:
1. Правильность `projectId` и `publicAnonKey` в `/utils/supabase/info.tsx`
2. Доступность Supabase (попробуйте открыть `https://your-project-id.supabase.co` в браузере)
3. Настройте Cloudflare Worker если Supabase заблокирован

### Проблема: "JWT expired" или "Invalid JWT"

**Решение**: Пользователь был разлогинен. Очистите localStorage:

```javascript
localStorage.clear()
```

Затем перезагрузите страницу и войдите снова.

### Проблема: "Row Level Security policy violation"

**Решение**: 
1. Проверьте что все миграции выполнены
2. Проверьте что RLS политики созданы
3. Убедитесь что пользователь аутентифицирован

Выполните в SQL Editor:

```sql
-- Проверка политик для subscriptions
SELECT * FROM pg_policies WHERE tablename = 'subscriptions';

-- Проверка политик для user_settings
SELECT * FROM pg_policies WHERE tablename = 'user_settings';
```

### Проблема: Флаги стран не отображаются

**Решение**: 
1. Проверьте что миграция `002_country_flags.sql` выполнена
2. Проверьте данные:
```sql
SELECT * FROM country_flags;
```
3. Если данных нет - выполните INSERT вручную (см. раздел [Настройка флагов стран](#настройка-флагов-стран))

### Проблема: AI функции не работают

**Решение**:

1. **TensorFlow.js**:
   - Откройте консоль браузера
   - Проверьте ошибки загрузки моделей
   - Модели загружаются при первом использовании (может занять время)

2. **YandexGPT**:
   - Проверьте правильность API ключа
   - Проверьте что Folder ID корректен
   - Проверьте лимиты (1000 запросов/день в trial)

### Проблема: Support Chat рекурсивное обновление

**Решение**: Обновлено в последней версии. Проверьте что у вас актуальная версия файлов:
- `/src/app/components/SupportModal.tsx`
- `/supabase-support-complete-setup.sql`

### Проблема: Ошибка при деплое на Cloudflare

**Решение**:
1. Проверьте что Workers включены в вашем плане
2. Проверьте синтаксис в Worker коде
3. См. подробную инструкцию `/CLOUDFLARE_DEPLOY_GUIDE_RU.md`

---

## 📚 Дополнительная документация

В проекте есть множество документов с подробными инструкциями:

### Быстрый старт
- `/БЫСТРЫЙ_СТАРТ.md` - краткая инструкция
- `/QUICK_START_GUIDE.md` - Quick Start на английском
- `/START_HERE.md` - начальная точка

### Cloudflare Worker
- `/CLOUDFLARE_DEPLOY_GUIDE_RU.md` - развёртывание Worker
- `/ИНСТРУКЦИЯ_CLOUDFLARE_WORKER.html` - визуальная инструкция
- `/QUICK_START_PROXY.md` - быстрая настройка прокси

### Система ролей
- `/OWNERS_GUIDE.md` - руководство для владельцев
- `/ACTIVATION_OWNERS.md` - активация системы владельцев
- `/README_OWNERS.md` - документация по ролям

### AI интеграции
- `/AI_README.md` - полное руководство по AI
- `/YANDEXGPT_INTEGRATION.md` - интеграция YandexGPT
- `/MIGRATION_GEMINI_TO_TENSORFLOW.md` - миграция с Gemini на TensorFlow

### Флаги стран
- `/ИНСТРУКЦИЯ_УСТАНОВКИ_ФЛАГОВ.md` - установка флагов
- `/COUNTRY_FLAGS_README.md` - документация по флагам
- `/ЧЕК_ЛИСТ_ФЛАГИ.md` - чек-лист проверки

### База данных
- `/QUICK_DATABASE_SETUP.md` - быстрая настройка БД
- `/supabase/SETUP_DATABASE.md` - полная настройка БД
- `/ШПАРГАЛКА_SQL.md` - SQL команды

### Email уведомления
- `/EMAIL_TEMPLATES_README.md` - шаблоны email
- `/SMART-NOTIFICATIONS-README.md` - система уведомлений
- `/SETUP-NOTIFICATIONS.md` - настройка уведомлений

### Support система
- `/UNIFIED_SUPPORT_README.md` - система поддержки
- `/SUPPORT_SETUP_INSTRUCTIONS.md` - настройка чата

---

## 🎯 Следующи�� шаги после установки

1. **Зарегистрируйте аккаунт**:
   - Откройте приложение
   - Нажмите "Регистрация"
   - Заполните данные
   - Подтвердите email (если включено)

2. **Настройте профиль**:
   - Перейдите в Settings
   - Выберите язык и валюту
   - Настройте тему (светлая/тёмная)
   - Настройте AI разрешения

3. **Добавьте первую подписку**:
   - Перейдите на Dashboard
   - Нажмите "Добавить подписку"
   - Выберите сервис или создайте кастомный

4. **Настройте уведомления**:
   - Откройте Notifications
   - Включите нужные типы уведомлений
   - Установите время напоминания

5. **Попробуйте AI функции**:
   - Используйте парсинг почты для импорта подписок
   - Посмотрите прогноз трат
   - Получите рекомендации альтернатив

6. **Для владельцев - создайте сервисы**:
   - Войдите как владелец
   - В Dashboard нажмите "+"
   - Создайте сервисы с тарифными планами
   - Добавьте описания и иконки

---

## 📞 Поддержка

Если у вас возникли проблемы:

1. **Проверьте документацию** - в проекте более 100 файлов с инструкциями
2. **Используйте Support Chat** в приложении
3. **Напишите владельцам**:
   - max.sokolvp@gmail.com
   - belovodvadim@gmail.com

---

## 📄 Лицензия

Частный проект. Все права защищены.

---

## 🙏 Благодарности

- **Supabase** - за отличный BaaS
- **Radix UI** - за доступные компоненты
- **TensorFlow.js** - за ML в браузере
- **YandexGPT** - за AI API
- **Cloudflare** - за Workers и CDN

---

**Дата обновления**: 25 марта 2026

**Версия**: 1.0.0

**Разработчики**: 
- Max Sokolov (max.sokolvp@gmail.com)
- Vadim Belovod (belovodvadim@gmail.com)

---

✨ **Готово! Приятного использования SubManager!** ✨
