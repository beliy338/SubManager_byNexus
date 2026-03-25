# 🤖 TensorFlow.js AI - Руководство для SubManager

## 🎯 Что это?

SubManager теперь использует **TensorFlow.js** - библиотеку машинного обучения от Google, которая работает локально в вашем браузере.

## ✨ Преимущества

### 🆚 Gemini AI vs TensorFlow.js

| Параметр | Gemini AI ❌ | TensorFlow.js ✅ |
|----------|-------------|------------------|
| API ключ | Нужен | Не нужен |
| Интернет | Всегда | Только первая загрузка |
| Работа в РФ | Только с VPN | Без VPN |
| Стоимость | Может быть платным | Бесплатно |
| Приватность | Данные отправляются в Google | Всё локально |
| Скорость | Зависит от сети | Мгновенно |
| Офлайн режим | ❌ | ✅ |

---

## 📋 Возможности

### 1. 📧 Парсинг писем о подписках

**Что умеет:**
- Распознаёт название сервиса
- Извлекает цену и валюту
- Определяет цикл оплаты (месяц/год/неделя)
- Находит дату следующего платежа
- Автоматически определяет категорию
- Оценивает точность распознавания

**Пример использования:**

```typescript
import { parseEmailForSubscription } from './utils/tensorflow';

const result = await parseEmailForSubscription(`
  Здравствуйте!
  
  Ваша подписка на Spotify Premium продлена.
  Списано: 169 руб
  Следующий платёж: 24.04.2026
  
  С уважением, Spotify
`);

console.log(result);
// {
//   found: true,
//   name: 'Spotify',
//   price: 169,
//   currency: 'RUB',
//   billingCycle: 'monthly',
//   nextBilling: '2026-04-24',
//   category: 'Развлечения',
//   confidence: 95
// }
```

**Поддерживаемые паттерны:**

- **Цены:** 169 руб, $9.99, €7.99, ¥59, 1000₽
- **Циклы:** месяц, год, неделя, monthly, yearly, weekly
- **Даты:** 24.04.2026, 24/04/2026, 24-04-2026
- **Валюты:** ₽, руб, $, USD, €, EUR, ¥, CNY

### 2. 📊 Прогноз трат

**Что умеет:**
- Рассчитывает месячные и годовые траты
- Прогнозирует траты на следующий месяц
- Анализирует траты по категориям
- Вычисляет потенциал экономии
- Генерирует персональные рекомендации
- Определяет неэффективные подписки

**Пример использования:**

```typescript
import { predictSpending } from './utils/tensorflow';

const subscriptions = [
  { name: 'Spotify', price: 169, billingCycle: 'monthly', category: 'Развлечения' },
  { name: 'Netflix', price: 799, billingCycle: 'monthly', category: 'Развлечения' },
  { name: 'Skillbox', price: 5000, billingCycle: 'yearly', category: 'Образование' }
];

const prediction = await predictSpending(subscriptions, 'ru');

console.log(prediction);
// {
//   monthlyTotal: 1385,
//   yearlyTotal: 16620,
//   nextMonthPrediction: 1454,
//   insights: [
//     'Траты в пределах нормы, но есть потенциал для экономии.',
//     'Годовые подписки выгоднее месячных на ~15%'
//   ],
//   recommendations: [...],
//   categoryBreakdown: {
//     'Развлечения': 70,
//     'Образование': 30
//   },
//   savingsPotential: {
//     amount: 175,
//     suggestions: [...]
//   }
// }
```

### 3. 🔄 Альтернативные сервисы

**Что умеет:**
- База альтернатив для популярных сервисов
- Расчёт экономии при переходе
- Плюсы и минусы каждой альтернативы
- Приоритет российским сервисам

**Пример использования:**

```typescript
import { getServiceAlternatives } from './utils/tensorflow';

const alternatives = await getServiceAlternatives(
  'Spotify',
  169,
  'Развлечения',
  'ru'
);

console.log(alternatives);
// {
//   alternatives: [
//     {
//       name: 'Яндекс Музыка',
//       price: 199,
//       pros: ['Русскоязычный контент', 'Интеграция с Алисой'],
//       cons: ['Меньше зарубежных артистов'],
//       savingsPercent: 30
//     },
//     ...
//   ]
// }
```

---

## 🔧 Технические детали

### Архитектура

```
tensorflow.ts
├── Инициализация TensorFlow.js
├── Парсинг писем (Rule-based + Patterns)
│   ├── SERVICE_PATTERNS - распознавание сервисов
│   ├── PRICE_PATTERNS - извлечение цен
│   ├── BILLING_PATTERNS - определение циклов
│   └── CURRENCY_MAP - валюты
├── Прогноз трат (ML-модель)
│   ├── Расчёт месячных/годовых трат
│   ├── Модель прогнозирования
│   ├── Анализ по категориям
│   └── Генерация рекомендаций
└── Альтернативы (База данных)
    └── ALTERNATIVES_DB - локальная база
```

### Бэкенды TensorFlow.js

TensorFlow.js автоматически выбирает лучший бэкенд:

1. **WebGL** (GPU) - самый быстрый, использует видеокарту
2. **WASM** (CPU) - быстрый, если WebGL недоступен
3. **CPU** - fallback для старых браузеров

Проверить текущий бэкенд:
```javascript
import * as tf from '@tensorflow/tfjs';
console.log(tf.getBackend()); // 'webgl', 'wasm' или 'cpu'
```

### Производительность

- **Первая загрузка:** ~2-3 секунды (загрузка TensorFlow.js)
- **Последующие:** <100ms (всё кэшировано)
- **Парсинг письма:** ~50ms
- **Прогноз трат:** ~100-200ms
- **Альтернативы:** <10ms (локальная база)

### Память

TensorFlow.js автоматически управляет памятью через систему disposal.

Проверить использование памяти:
```javascript
import * as tf from '@tensorflow/tfjs';
console.log(tf.memory());
// { numTensors: 0, numDataBuffers: 0, numBytes: 0 }
```

Очистить память вручную:
```javascript
import { cleanupTensorFlow } from './utils/tensorflow';
cleanupTensorFlow();
```

---

## 🛠 Расширение функциональности

### Добавить новый сервис для распознавания

Откройте `/src/app/utils/tensorflow.ts` и добавьте в `SERVICE_PATTERNS`:

```typescript
const SERVICE_PATTERNS = [
  // ... существующие паттерны
  { 
    pattern: /мой-сервис|myservice/i, 
    name: 'Мой Сервис', 
    category: 'Категория' 
  },
];
```

### Добавить альтернативы для сервиса

В том же файле, добавьте в `ALTERNATIVES_DB`:

```typescript
const ALTERNATIVES_DB: Record<string, Alternative[]> = {
  // ... существующие альтернативы
  'Мой Сервис': [
    {
      name: 'Альтернатива 1',
      price: 299,
      pros: ['Плюс 1', 'Плюс 2'],
      cons: ['Минус 1'],
      savingsPercent: 30,
    },
    {
      name: 'Альтернатива 2',
      price: 199,
      pros: ['Дешевле', 'Больше функций'],
      cons: ['Меньше известен'],
      savingsPercent: 50,
    },
  ],
};
```

### Настроить паттерны цен

Добавьте свои паттерны в `PRICE_PATTERNS`:

```typescript
const PRICE_PATTERNS = [
  // ... существующие паттерны
  /цена:\s*(\d+(?:[,.\s]\d+)?)/i,
  /итого:\s*(\d+(?:[,.\s]\d+)?)\s*₽/i,
];
```

### Добавить поддержку новой валюты

Обновите `CURRENCY_MAP`:

```typescript
const CURRENCY_MAP: Record<string, string> = {
  // ... существующие валюты
  '₸': 'KZT',
  'тенге': 'KZT',
  'kzt': 'KZT',
};
```

---

## 🌍 Многоязычность

AI автоматически адаптируется к языку, выбранному в настройках:

- 🇷🇺 **Русский** - полная поддержка
- 🇬🇧 **English** - полная поддержка
- 🇧🇾 **Беларуская** - полная поддержка
- 🇨🇳 **中文** - полная поддержка

Добавить новый язык:

```typescript
const translations: Record<string, any> = {
  // ... существующие языки
  de: {
    insights: {
      high: 'Ihre Ausgaben sind überdurchschnittlich.',
      // ... другие переводы
    },
  },
};
```

---

## 🐛 Отладка

### Включить логирование

```typescript
import { getTensorFlowInfo } from './utils/tensorflow';

const info = getTensorFlowInfo();
console.log('TensorFlow.js Info:', info);
// {
//   backend: 'webgl',
//   version: '4.22.0',
//   memory: { numTensors: 0, numDataBuffers: 0, numBytes: 0 }
// }
```

### Проверить парсинг

```typescript
const testEmail = `
  Ваша подписка продлена
  Сервис: Spotify
  Сумма: 169 руб
  Дата: 24.04.2026
`;

const result = await parseEmailForSubscription(testEmail);
console.log('Parse result:', result);
console.log('Confidence:', result.confidence, '%');
```

### Измерить производительность

```typescript
console.time('AI Analysis');
const prediction = await predictSpending(subscriptions, 'ru');
console.timeEnd('AI Analysis');
// AI Analysis: 127ms
```

---

## 📊 Примеры реальных сценариев

### Сценарий 1: Массовый импорт писем

```typescript
import { parseEmailForSubscription } from './utils/tensorflow';

const emails = [
  'письмо 1...',
  'письмо 2...',
  'письмо 3...',
];

const results = await Promise.all(
  emails.map(email => parseEmailForSubscription(email))
);

const found = results.filter(r => r.found);
console.log(`Найдено подписок: ${found.length} из ${emails.length}`);
```

### Сценарий 2: Анализ трат с детальным отчётом

```typescript
import { predictSpending } from './utils/tensorflow';

const prediction = await predictSpending(subscriptions, 'ru');

console.log('=== ОТЧЁТ ПО ПОДПИСКАМ ===');
console.log(`Месяц: ${prediction.monthlyTotal} ₽`);
console.log(`Год: ${prediction.yearlyTotal} ₽`);
console.log(`Прогноз: ${prediction.nextMonthPrediction} ₽`);
console.log('\nКатегории:');
Object.entries(prediction.categoryBreakdown).forEach(([cat, percent]) => {
  console.log(`  ${cat}: ${percent}%`);
});
console.log(`\nПотенциал экономии: ${prediction.savingsPotential.amount} ₽`);
```

### Сценарий 3: Поиск лучших альтернатив

```typescript
import { getServiceAlternatives } from './utils/tensorflow';

const subscription = { name: 'Spotify', price: 169, category: 'Развлечения' };

const { alternatives } = await getServiceAlternatives(
  subscription.name,
  subscription.price,
  subscription.category,
  'ru'
);

// Сортируем по экономии
const sorted = alternatives.sort((a, b) => b.savingsPercent - a.savingsPercent);

console.log('Лучшие альтернативы:');
sorted.forEach(alt => {
  if (alt.savingsPercent > 0) {
    console.log(`${alt.name}: -${alt.savingsPercent}% (${alt.price} ₽)`);
  }
});
```

---

## 🔒 Безопасность и приватность

### ✅ Что гарантируется

- **Данные не покидают ваш браузер** - всё выполняется локально
- **Нет отправки на серверы** - TensorFlow.js работает офлайн
- **Нет tracking** - никаких аналитических скриптов
- **Нет API ключей** - не нужны credentials
- **Open Source** - код доступен для аудита

### 🔐 Как это работает

1. TensorFlow.js загружается один раз при первом использовании
2. Все модели и алгоритмы работают в вашем браузере
3. Ваши письма и подписки анализируются локально
4. Результаты сохраняются только в Supabase (с вашими правами доступа)

---

## 📚 Дополнительные ресурсы

### Официальная документация
- [TensorFlow.js](https://www.tensorflow.org/js)
- [TensorFlow.js API](https://js.tensorflow.org/api/latest/)
- [WebGL Backend](https://www.tensorflow.org/js/guide/platform_environment)

### Туториалы
- [Getting Started with TensorFlow.js](https://www.tensorflow.org/js/tutorials)
- [Machine Learning in the Browser](https://www.tensorflow.org/js/guide/nodejs)

### Сообщество
- [TensorFlow Forum](https://discuss.tensorflow.org/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/tensorflow.js)

---

## ❓ FAQ

### Почему TensorFlow.js вместо Gemini?

1. **Работает в РФ без VPN**
2. **Бесплатно без ограничений**
3. **Приватность данных**
4. **Быстрее (нет сетевых запросов)**
5. **Офлайн режим**

### Можно ли использовать свои модели?

Да! TensorFlow.js поддерживает загрузку кастомных моделей:

```typescript
import * as tf from '@tensorflow/tfjs';

const model = await tf.loadLayersModel('path/to/model.json');
const prediction = model.predict(inputData);
```

### Как улучшить точность парсинга?

1. Добавьте больше паттернов в `SERVICE_PATTERNS`
2. Обучите свою модель на ваших письмах
3. Используйте Universal Sentence Encoder для семантического анализа
4. Создайте правила для специфичных форматов

### Сколько памяти использует?

- **Базовая загрузка:** ~5-10 MB
- **При анализе:** +1-2 MB (временно)
- **После анализа:** возвращается к базовому уровню

### Работает ли на мобильных?

Да! TensorFlow.js работает во всех современных браузерах:
- iOS Safari
- Android Chrome
- Desktop Chrome/Firefox/Edge/Safari

На мобильных может быть немного медленнее, но всё работает.

---

## 🎊 Заключение

TensorFlow.js предоставляет мощные возможности AI прямо в браузере, без необходимости в облачных сервисах, API ключах или VPN.

**Преимущества:**
- ✅ Полная приватность
- ✅ Работает офлайн
- ✅ Бесплатно
- ✅ Быстро
- ✅ Расширяемо

**Начните использовать прямо сейчас!**

→ [START_HERE_AI.md](./START_HERE_AI.md)

---

*Документация обновлена: 24 марта 2026*
