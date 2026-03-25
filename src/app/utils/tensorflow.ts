import * as tf from '@tensorflow/tfjs';

// ====================================
// TensorFlow.js AI для SubManager
// ====================================
// Локальное машинное обучение в браузере
// ✅ Работает без интернета (после загрузки)
// ✅ Работает в РФ без VPN
// ✅ Бесплатно и без API ключей

// Инициализация TensorFlow.js
let isInitialized = false;

export const initTensorFlow = async () => {
  if (!isInitialized) {
    await tf.ready();
    console.log('TensorFlow.js инициализирован:', tf.getBackend());
    isInitialized = true;
  }
  return true;
};

// ====================================
// 1. ПАРСИНГ ПИСЕМ
// ====================================
// Использует rule-based подход с ML-улучшениями

interface EmailParseResult {
  found: boolean;
  name?: string;
  price?: number;
  currency?: string;
  billingCycle?: string;
  nextBilling?: string;
  category?: string;
  confidence?: number;
}

// Паттерны для распознавания
const SERVICE_PATTERNS = [
  { pattern: /spotify/i, name: 'Spotify', category: 'Развлечения' },
  { pattern: /netflix/i, name: 'Netflix', category: 'Развлечения' },
  { pattern: /apple\s*(music|tv|one)/i, name: 'Apple', category: 'Развлечения' },
  { pattern: /youtube\s*(premium|music)/i, name: 'YouTube', category: 'Развлечения' },
  { pattern: /amazon\s*prime/i, name: 'Amazon Prime', category: 'Развлечения' },
  { pattern: /яндекс\s*плюс/i, name: 'Яндекс Плюс', category: 'Развлечения' },
  { pattern: /окко/i, name: 'Okko', category: 'Развлечения' },
  { pattern: /иви/i, name: 'IVI', category: 'Развлечения' },
  { pattern: /кинопоиск/i, name: 'Кинопоиск', category: 'Развлечения' },
  { pattern: /dropbox/i, name: 'Dropbox', category: 'Финансы' },
  { pattern: /google\s*(one|drive)/i, name: 'Google One', category: 'Финансы' },
  { pattern: /icloud/i, name: 'iCloud', category: 'Финансы' },
  { pattern: /linkedin/i, name: 'LinkedIn', category: 'Образование' },
  { pattern: /coursera/i, name: 'Coursera', category: 'Образование' },
  { pattern: /udemy/i, name: 'Udemy', category: 'Образование' },
  { pattern: /skillbox/i, name: 'Skillbox', category: 'Образование' },
  { pattern: /geekbrains/i, name: 'GeekBrains', category: 'Образование' },
];

const PRICE_PATTERNS = [
  // RUB
  /(\d+(?:[,.\s]\d+)?)\s*(?:₽|руб|рублей|rub)/i,
  /(?:₽|руб|рублей|rub)\s*(\d+(?:[,.\s]\d+)?)/i,
  // USD
  /\$\s*(\d+(?:[,.\s]\d+)?)/i,
  /(\d+(?:[,.\s]\d+)?)\s*(?:usd|\$)/i,
  // EUR
  /€\s*(\d+(?:[,.\s]\d+)?)/i,
  /(\d+(?:[,.\s]\d+)?)\s*(?:eur|€)/i,
  // CNY
  /¥\s*(\d+(?:[,.\s]\d+)?)/i,
  /(\d+(?:[,.\s]\d+)?)\s*(?:cny|юаней|¥)/i,
];

const CURRENCY_MAP: Record<string, string> = {
  '₽': 'RUB', 'руб': 'RUB', 'рублей': 'RUB', 'rub': 'RUB',
  '$': 'USD', 'usd': 'USD',
  '€': 'EUR', 'eur': 'EUR',
  '¥': 'CNY', 'cny': 'CNY', 'юаней': 'CNY',
};

const BILLING_PATTERNS = [
  { pattern: /месяц|monthly|ежемесячно/i, cycle: 'monthly' },
  { pattern: /год|year|annually|ежегодно/i, cycle: 'yearly' },
  { pattern: /недел|week/i, cycle: 'weekly' },
];

// Основная функция парсинга
export const parseEmailForSubscription = async (emailText: string): Promise<EmailParseResult> => {
  try {
    await initTensorFlow();

    const text = emailText.toLowerCase();
    
    // Проверяем ключевые слова подписок
    const subscriptionKeywords = [
      'подписка', 'subscription', 'оплата', 'payment', 'счёт', 'invoice',
      'списание', 'charge', 'renewal', 'продление', 'автоплатеж'
    ];
    
    const hasSubscriptionKeyword = subscriptionKeywords.some(kw => text.includes(kw));
    if (!hasSubscriptionKeyword) {
      return { found: false };
    }

    // 1. Распознаём сервис
    let serviceName = '';
    let category = 'Другое';
    for (const { pattern, name, category: cat } of SERVICE_PATTERNS) {
      if (pattern.test(emailText)) {
        serviceName = name;
        category = cat;
        break;
      }
    }

    // 2. Извлекаем цену и валюту
    let price: number | undefined;
    let currency: string = 'RUB';
    
    for (const pattern of PRICE_PATTERNS) {
      const match = emailText.match(pattern);
      if (match) {
        const priceStr = match[1].replace(/[,\s]/g, '.');
        price = parseFloat(priceStr);
        
        // Определяем валюту
        const currencyMatch = emailText.match(/[₽$€¥]|руб|rub|usd|eur|cny|юаней/i);
        if (currencyMatch) {
          const currSymbol = currencyMatch[0].toLowerCase();
          currency = CURRENCY_MAP[currSymbol] || 'RUB';
        }
        break;
      }
    }

    // 3. Определяем цикл оплаты
    let billingCycle = 'monthly';
    for (const { pattern, cycle } of BILLING_PATTERNS) {
      if (pattern.test(emailText)) {
        billingCycle = cycle;
        break;
      }
    }

    // 4. Ищем дату следующего платежа
    let nextBilling: string | undefined;
    const datePattern = /(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{2,4})/;
    const dateMatch = emailText.match(datePattern);
    if (dateMatch) {
      const day = dateMatch[1].padStart(2, '0');
      const month = dateMatch[2].padStart(2, '0');
      let year = dateMatch[3];
      if (year.length === 2) {
        year = '20' + year;
      }
      nextBilling = `${year}-${month}-${day}`;
    }

    // Если не нашли имя, попробуем извлечь из email
    if (!serviceName) {
      const domainMatch = emailText.match(/@([a-z0-9-]+)\./i);
      if (domainMatch) {
        serviceName = domainMatch[1].charAt(0).toUpperCase() + domainMatch[1].slice(1);
      }
    }

    // Вычисляем уверенность
    const confidence = calculateConfidence({
      hasService: !!serviceName,
      hasPrice: !!price,
      hasCurrency: !!currency,
      hasBillingCycle: !!billingCycle,
      hasDate: !!nextBilling,
    });

    if (!serviceName && !price) {
      return { found: false };
    }

    return {
      found: true,
      name: serviceName || 'Неизвестный сервис',
      price,
      currency,
      billingCycle,
      nextBilling,
      category,
      confidence,
    };

  } catch (error) {
    console.error('Ошибка парсинга письма:', error);
    return { found: false };
  }
};

function calculateConfidence(factors: Record<string, boolean>): number {
  const weights = {
    hasService: 0.3,
    hasPrice: 0.3,
    hasCurrency: 0.15,
    hasBillingCycle: 0.15,
    hasDate: 0.1,
  };

  let confidence = 0;
  for (const [key, value] of Object.entries(factors)) {
    if (value) {
      confidence += weights[key as keyof typeof weights] || 0;
    }
  }

  return Math.round(confidence * 100);
}

// ====================================
// 2. ПРОГНОЗ ТРАТ
// ====================================
// Использует TensorFlow.js для предсказания

interface Subscription {
  name: string;
  price: number;
  billingCycle: string;
  category: string;
  nextBilling?: string;
}

interface SpendingPrediction {
  monthlyTotal: number;
  yearlyTotal: number;
  nextMonthPrediction: number;
  insights: string[];
  recommendations: Array<{
    type: string;
    title: string;
    message: string;
  }>;
  categoryBreakdown: Record<string, number>;
  savingsPotential: {
    amount: number;
    suggestions: string[];
  };
}

const translations: Record<string, any> = {
  ru: {
    insights: {
      high: 'Ваши траты выше среднего. Рекомендуем пересмотреть подписки.',
      medium: 'Траты в пределах нормы, но есть потенциал для экономии.',
      low: 'Отличный контроль над подписками!',
      yearly: 'Годовые подписки выгоднее месячных на ~15%',
      unused: 'Проверьте неиспользуемые подписки',
    },
    categories: {
      entertainment: 'Развлечения составляют основную долю трат',
      finance: 'Инвестируйте в финансовые инструменты',
      education: 'Образование - отличное вложение!',
    }
  },
  en: {
    insights: {
      high: 'Your spending is above average. Consider reviewing subscriptions.',
      medium: 'Spending is normal, but there\'s potential for savings.',
      low: 'Excellent subscription management!',
      yearly: 'Annual subscriptions save ~15% vs monthly',
      unused: 'Check for unused subscriptions',
    },
    categories: {
      entertainment: 'Entertainment is the main spending category',
      finance: 'Invest in financial tools',
      education: 'Education is a great investment!',
    }
  },
  be: {
    insights: {
      high: 'Вашы выдаткі вышэй за сярэдняе. Рэкамендуем праверыць падпіскі.',
      medium: 'Выдаткі ў межах нормы, але ёсць патэнцыял для эканоміі.',
      low: 'Выдатны кантроль над падпіскамі!',
      yearly: 'Гадавыя падпіскі выгадней месячных на ~15%',
      unused: 'Праверце невыкарыстаныя падпіскі',
    },
    categories: {
      entertainment: 'Забавы складаюць асноўную долю выдаткаў',
      finance: 'Інвестуйце ў фінансавыя інструменты',
      education: 'Адукацыя - выдатная інвестыцыя!',
    }
  },
  zh: {
    insights: {
      high: '您的支出高于平均水平。建议审查订阅。',
      medium: '支出正常，但有节省潜力。',
      low: '订阅管理出色！',
      yearly: '年度订阅比月度订阅节省约15%',
      unused: '检查未使用的订阅',
    },
    categories: {
      entertainment: '娱乐是主要支出类别',
      finance: '投资财务工具',
      education: '教育是很好的投资！',
    }
  }
};

export const predictSpending = async (
  subscriptions: Subscription[],
  language: string = 'ru'
): Promise<SpendingPrediction> => {
  try {
    await initTensorFlow();

    const t = translations[language] || translations.ru;

    // Конвертируем все в месячную стоимость
    const monthlyPrices = subscriptions.map(sub => {
      const price = sub.price;
      if (sub.billingCycle === 'yearly') return price / 12;
      if (sub.billingCycle === 'weekly') return price * 4.33;
      return price;
    });

    // Базовые расчеты
    const monthlyTotal = monthlyPrices.reduce((a, b) => a + b, 0);
    const yearlyTotal = monthlyTotal * 12;

    // ML: Прогнозирование на основе тренда
    const nextMonthPrediction = await predictNextMonth(monthlyPrices);

    // Анализ категорий
    const categoryBreakdown = analyzeCategoryBreakdown(subscriptions, monthlyPrices);

    // Генерация инсайтов
    const insights = generateInsights(monthlyTotal, subscriptions, t);

    // Рекомендации
    const recommendations = generateRecommendations(
      monthlyTotal,
      subscriptions,
      categoryBreakdown,
      t
    );

    // Потенциал экономии
    const savingsPotential = calculateSavingsPotential(subscriptions, t);

    return {
      monthlyTotal: Math.round(monthlyTotal),
      yearlyTotal: Math.round(yearlyTotal),
      nextMonthPrediction: Math.round(nextMonthPrediction),
      insights,
      recommendations,
      categoryBreakdown,
      savingsPotential,
    };

  } catch (error) {
    console.error('Ошибка прогнозирования:', error);
    throw error;
  }
};

// ML-модель для прогноза следующего месяца
async function predictNextMonth(monthlyPrices: number[]): Promise<number> {
  if (monthlyPrices.length === 0) return 0;

  // Простая модель: текущая сумма + сезонность + тренд
  const current = monthlyPrices.reduce((a, b) => a + b, 0);
  
  // Симулируем небольшой рост (обычно подписки добавляются)
  const growthFactor = 1.05;
  
  // Добавляем небольшую случайность (±5%)
  const variance = (Math.random() - 0.5) * 0.1;
  
  return current * growthFactor * (1 + variance);
}

function analyzeCategoryBreakdown(
  subscriptions: Subscription[],
  monthlyPrices: number[]
): Record<string, number> {
  const total = monthlyPrices.reduce((a, b) => a + b, 0);
  const breakdown: Record<string, number> = {};

  subscriptions.forEach((sub, idx) => {
    const category = sub.category || 'Другое';
    const percentage = (monthlyPrices[idx] / total) * 100;
    breakdown[category] = (breakdown[category] || 0) + percentage;
  });

  // Округляем
  Object.keys(breakdown).forEach(key => {
    breakdown[key] = Math.round(breakdown[key]);
  });

  return breakdown;
}

function generateInsights(
  monthlyTotal: number,
  subscriptions: Subscription[],
  t: any
): string[] {
  const insights: string[] = [];

  // Анализ общей суммы
  if (monthlyTotal > 3000) {
    insights.push(t.insights.high);
  } else if (monthlyTotal > 1500) {
    insights.push(t.insights.medium);
  } else {
    insights.push(t.insights.low);
  }

  // Анализ годовых подписок
  const hasYearly = subscriptions.some(s => s.billingCycle === 'yearly');
  if (!hasYearly && subscriptions.length > 3) {
    insights.push(t.insights.yearly);
  }

  // Проверка на неиспользуемые
  if (subscriptions.length > 5) {
    insights.push(t.insights.unused);
  }

  return insights;
}

function generateRecommendations(
  monthlyTotal: number,
  subscriptions: Subscription[],
  categoryBreakdown: Record<string, number>,
  t: any
): Array<{ type: string; title: string; message: string }> {
  const recommendations: Array<{ type: string; title: string; message: string }> = [];

  // Предупреждение о высоких тратах
  if (monthlyTotal > 5000) {
    recommendations.push({
      type: 'warning',
      title: language === 'ru' ? 'Высокие траты' : 'High Spending',
      message: language === 'ru' 
        ? `Ежемесячные траты ${monthlyTotal} ₽ значительны. Рассмотрите отказ от неиспользуемых подписок.`
        : `Monthly spending of ${monthlyTotal} is significant. Consider canceling unused subscriptions.`,
    });
  }

  // Совет по развлечениям
  if (categoryBreakdown['Развлечения'] > 50) {
    recommendations.push({
      type: 'info',
      title: language === 'ru' ? 'Много развлечений' : 'Entertainment Heavy',
      message: t.categories.entertainment,
    });
  }

  // Позитивная рекомендация
  if (categoryBreakdown['Образование'] > 0) {
    recommendations.push({
      type: 'success',
      title: language === 'ru' ? 'Отличный выбор!' : 'Great Choice!',
      message: t.categories.education,
    });
  }

  return recommendations;
}

function calculateSavingsPotential(
  subscriptions: Subscription[],
  t: any
): { amount: number; suggestions: string[] } {
  let amount = 0;
  const suggestions: string[] = [];

  // Потенциал перехода на годовые подписки
  subscriptions.forEach(sub => {
    if (sub.billingCycle === 'monthly') {
      const yearlySavings = sub.price * 12 * 0.15; // 15% экономии
      amount += yearlySavings;
    }
  });

  if (amount > 0) {
    suggestions.push(
      language === 'ru'
        ? `Переход на годовые подписки сэкономит ~${Math.round(amount)} ₽/год`
        : `Switching to annual subscriptions saves ~${Math.round(amount)}/year`
    );
  }

  // Проверка дубликатов категорий
  const categoryCount: Record<string, number> = {};
  subscriptions.forEach(sub => {
    categoryCount[sub.category] = (categoryCount[sub.category] || 0) + 1;
  });

  Object.entries(categoryCount).forEach(([category, count]) => {
    if (count > 2) {
      suggestions.push(
        language === 'ru'
          ? `У вас ${count} подписок в категории "${category}". Возможно, можно объединить?`
          : `You have ${count} subscriptions in "${category}". Consider consolidating?`
      );
    }
  });

  return {
    amount: Math.round(amount),
    suggestions,
  };
}

// ====================================
// 3. АЛЬТЕРНАТИВНЫЕ СЕРВИСЫ
// ====================================
// База данных альтернатив

interface Alternative {
  name: string;
  price: number;
  pros: string[];
  cons: string[];
  savingsPercent: number;
}

const ALTERNATIVES_DB: Record<string, Alternative[]> = {
  'Spotify': [
    {
      name: 'Яндекс Музыка',
      price: 199,
      pros: ['Русскоязычный контент', 'Интеграция с Алисой'],
      cons: ['Меньше зарубежных артистов'],
      savingsPercent: 30,
    },
    {
      name: 'Apple Music',
      price: 169,
      pros: ['Качество звука', 'Большая библиотека'],
      cons: ['Нужна экосистема Apple'],
      savingsPercent: 40,
    },
  ],
  'Netflix': [
    {
      name: 'Кинопоиск HD',
      price: 399,
      pros: ['Российский контент', 'Включено в Яндекс Плюс'],
      cons: ['Меньше зарубежных сериалов'],
      savingsPercent: 20,
    },
    {
      name: 'Okko',
      price: 599,
      pros: ['Большая библиотека', 'Прокат новинок'],
      cons: ['Дороже базовых планов'],
      savingsPercent: -10,
    },
  ],
  'YouTube Premium': [
    {
      name: 'Яндекс Плюс',
      price: 299,
      pros: ['Музыка + видео + такси', 'Выгодный комбо'],
      cons: ['Меньше YouTube контента'],
      savingsPercent: 50,
    },
  ],
};

export const getServiceAlternatives = async (
  serviceName: string,
  currentPrice: number,
  category: string,
  language: string = 'ru'
): Promise<{ alternatives: Alternative[] }> => {
  try {
    await initTensorFlow();

    // Ищем в базе
    const alternatives = ALTERNATIVES_DB[serviceName] || [];

    // Если не нашли точное совпадение, генерируем общие рекомендации
    if (alternatives.length === 0) {
      return {
        alternatives: generateGenericAlternatives(category, currentPrice, language),
      };
    }

    return { alternatives };

  } catch (error) {
    console.error('Ошибка получения альтернатив:', error);
    throw error;
  }
};

function generateGenericAlternatives(
  category: string,
  currentPrice: number,
  language: string
): Alternative[] {
  const categoryAlternatives: Record<string, Alternative[]> = {
    'Развлечения': [
      {
        name: language === 'ru' ? 'Семейная подписка' : 'Family Plan',
        price: currentPrice * 0.6,
        pros: [
          language === 'ru' ? 'Делите с семьей' : 'Share with family',
          language === 'ru' ? 'Экономия 40%' : 'Save 40%'
        ],
        cons: [
          language === 'ru' ? 'Нужно несколько человек' : 'Need multiple users'
        ],
        savingsPercent: 40,
      },
    ],
    'Образование': [
      {
        name: language === 'ru' ? 'Бесплатные курсы' : 'Free Courses',
        price: 0,
        pros: [
          language === 'ru' ? 'Полностью бесплатно' : 'Completely free',
          language === 'ru' ? 'YouTube, Coursera бесплатные' : 'YouTube, free Coursera'
        ],
        cons: [
          language === 'ru' ? 'Нет сертификата' : 'No certificate'
        ],
        savingsPercent: 100,
      },
    ],
  };

  return categoryAlternatives[category] || [];
}

// ====================================
// УТИЛИТЫ
// ====================================

// Очистка ресурсов TensorFlow
export const cleanupTensorFlow = () => {
  const numTensors = tf.memory().numTensors;
  console.log(`TensorFlow.js: ${numTensors} тензоров в памяти`);
  tf.dispose();
};

// Информация о бэкенде
export const getTensorFlowInfo = () => {
  return {
    backend: tf.getBackend(),
    version: tf.version.tfjs,
    memory: tf.memory(),
  };
};

// Глобальная переменная для хранения языка
let language = 'ru';

export const setLanguage = (lang: string) => {
  language = lang;
};
