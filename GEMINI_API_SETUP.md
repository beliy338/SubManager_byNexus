# 🤖 Настройка Google Gemini AI для SubManager

## ⚠️ ВАЖНО для пользователей из России

Google Gemini API может быть заблокирован в РФ. Есть несколько решений:

### Вариант 1: Использование VPN (Рекомендуется)
1. Установите VPN (WireGuard, OpenVPN, Outline)
2. Подключитесь к серверу в Европе/США
3. Получите API ключ через VPN
4. API будет работать даже без VPN после получения ключа

### Вариант 2: Cloudflare Workers (Прокси)
Создайте прокси через Cloudflare Workers для обхода блокировок:
```javascript
// Cloudflare Worker для проксирования Gemini API
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const geminiUrl = `https://generativelanguage.googleapis.com${url.pathname}${url.search}`
  
  const newRequest = new Request(geminiUrl, {
    method: request.method,
    headers: request.headers,
    body: request.body
  })
  
  return fetch(newRequest)
}
```

### Вариант 3: Vertex AI через Google Cloud
❌ **НЕ реко��ендуется** - требует оплаты и настройки Google Cloud проекта

---

## 📋 Что вам понадобится
- Google аккаунт
- 5-10 минут времени
- Бесплатный tier Google Gemini API
- VPN (для пользователей из РФ)

---

## 🚀 Быстрая установка

### Шаг 1: Получение API ключа

1. **Перейдите на Google AI Studio**
   ```
   https://aistudio.google.com/app/apikey
   ```

2. **Войдите в Google аккаунт** (если еще не вошли)

3. **Создайте API ключ**
   - Нажмите кнопку **"Get API key"** или **"Create API key"**
   - Выберите **"Create API key in new project"** или используйте существующий проект
   - Скопируйте полученный ключ (выглядит как: `AIzaSy...`)

4. **Сохраните ключ в безопасном месте**
   ⚠️ Никому не показывайте этот ключ!

---

### Шаг 2: Добавление ключа в проект

#### Вариант 1: Локальная разработка (Development)

1. Откройте файл `/src/app/utils/gemini.ts`

2. Найдите строку:
   ```typescript
   const API_KEY = 'YOUR_GEMINI_API_KEY_HERE';
   ```

3. Замените на ваш ключ:
   ```typescript
   const API_KEY = 'AIzaSy...ваш-ключ...';
   ```

4. Сохраните файл

#### Вариант 2: Production (рекомендуется)

1. Создайте файл `.env` в корне проекта:
   ```env
   VITE_GEMINI_API_KEY=AIzaSy...ваш-ключ...
   ```

2. Обновите `/src/app/utils/gemini.ts`:
   ```typescript
   const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY_HERE';
   ```

3. Добавьте `.env` в `.gitignore`:
   ```
   .env
   .env.local
   ```

---

### Шаг 3: Обновление базы данных Supabase

1. **Откройте Supabase Dashboard**
   ```
   https://supabase.com/dashboard
   ```

2. **Перейдите в SQL Editor**
   - В левом меню найдите **SQL Editor**

3. **Выполните SQL скрипт**
   - Скопируйте содержимое файла `/ADD_AI_PERMISSION_COLUMN.sql`
   - Вставьте в SQL Editor
   - Нажмите **RUN**

4. **Проверьте таблицу**
   ```sql
   SELECT * FROM user_settings LIMIT 5;
   ```
   Должна появиться колонка `ai_permission`

---

## ✅ Проверка работы

### Тест 1: Запуск приложения

1. Запустите проект:
   ```bash
   npm run dev
   ```

2. Войдите в аккаунт

3. **Должно появиться модальное окно** с предложением активировать AI

4. Нажмите **"Да, активировать"**

### Тест 2: AI Парсинг писем

```typescript
import { parseEmailForSubscription } from './utils/gemini';

const email = `
Здравствуйте!
Ваша подписка на Яндекс Плюс продлена.
Сумма: 299 ₽
Следующее списание: 15 апреля 2026
`;

const result = await parseEmailForSubscription(email);
console.log(result);
// Ожидаемый результат:
// {
//   found: true,
//   name: "Яндекс Плюс",
//   price: 299,
//   currency: "RUB",
//   billingCycle: "monthly",
//   nextBilling: "2026-04-15",
//   category: "Развлечения"
// }
```

### Тест 3: Прогноз трат

```typescript
import { predictSpending } from './utils/gemini';

const subscriptions = [
  { name: 'Netflix', price: 990, billingCycle: 'monthly', category: 'Развлечения' },
  { name: 'Spotify', price: 199, billingCycle: 'monthly', category: 'Музыка' }
];

const prediction = await predictSpending(subscriptions, 'ru');
console.log(prediction);
// Получите прогноз трат и рекомендации
```

---

## 💰 Ограничения бесплатного tier

### Google Gemini API (бесплатно)
- ✅ **60 запросов в минуту**
- ✅ **1,500 запросов в день**
- ✅ **1 миллион токенов в месяц** (около 750,000 слов)
- ✅ Модель: Gemini 1.5 Flash

Для SubManager этого **более чем достаточно**! 🎉

### Что это означает на практике?
- **Парсинг писем**: ~100-200 писем в день
- **Прогноз трат**: ~50-100 анализов в день
- **Для одного пользователя**: практически безлимитно

---

## 🔐 Безопасность

### ⚠️ Важно!

1. **Никогда не коммитьте API ключ в Git**
   ```bash
   # Добавьте в .gitignore
   .env
   .env.local
   .env.production
   ```

2. **Используйте переменные окружения в production**
   ```typescript
   const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
   ```

3. **Ротация ключей**
   - Меняйте ключ каждые 3-6 месяцев
   - При компрометации - немедленно создавайте новый

4. **Мониторинг использования**
   - Проверяйте квоты в Google AI Studio
   - Настройте алерты при превышении лимитов

---

## 🛠️ Troubleshooting

### Ошибка: "API_KEY not set"
```typescript
// Проверьте, что ключ установлен
console.log(import.meta.env.VITE_GEMINI_API_KEY);

// Если undefined:
// 1. Проверьте .env файл
// 2. Перезапустите dev сервер
// 3. Проверьте название переменной (должно начинаться с VITE_)
```

### Ошибка: "Invalid API key"
1. Проверьте ключ в Google AI Studio
2. Убедитесь, что нет лишних пробелов
3. Проверьте, что API не заблокирован

### Ошибка: "Quota exceeded"
1. Подождите следующего дня (лимит сбросится)
2. Проверьте количество запросов
3. Оптимизируйте использование AI

---

## 📚 Дополнительные ресурсы

- [Google AI Studio](https://aistudio.google.com/)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Pricing & Quotas](https://ai.google.dev/pricing)
- [Best Practices](https://ai.google.dev/docs/best_practices)

---

## 🎯 Следующие шаги

После настройки AI вы сможете:

1. ✅ **Парсить письма** - автоматическое добавление подписок из email
2. ✅ **Прогнозировать траты** - умные рекомендации по оптимизации
3. ✅ **Получать альтернативы** - AI находит более выгодные сервисы
4. ✅ **Аналитика с insights** - персональные советы по экономии

---

**Готово!** 🎉 Теперь SubManager использует мощь AI для управления подписками!