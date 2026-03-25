import { GoogleGenerativeAI } from '@google/generative-ai';

// API Key - Используйте переменные окружения для production
// Для локальной разработки можете указать ключ напрямую
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY_HERE';

// ⚠️ Для пользователей из России: 
// 1. Используйте VPN для получения API ключа
// 2. После получения ключа VPN не нужен - API будет работать
// 3. Альтернатива: настройте прокси через Cloudflare Workers
// Подробнее: /GEMINI_RUSSIA_SETUP.md

let genAI: GoogleGenerativeAI | null = null;

// Инициализация Gemini API
export const initGemini = () => {
  if (!genAI && API_KEY !== 'YOUR_GEMINI_API_KEY_HERE') {
    genAI = new GoogleGenerativeAI(API_KEY);
  }
  return genAI;
};

// Парсинг письма с подпиской
export const parseEmailForSubscription = async (emailText: string) => {
  try {
    const ai = initGemini();
    if (!ai) {
      throw new Error('Gemini API не инициализирован. Добавьте API ключ.');
    }

    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
Проанализируй это письмо и извлеки информацию о подписке/платеже.
Верни ответ СТРОГО в JSON формате без дополнительного текста:

{
  "found": true/false,
  "name": "название сервиса",
  "price": числовое значение,
  "currency": "RUB/USD/EUR/CNY",
  "billingCycle": "monthly/yearly/weekly",
  "nextBilling": "дата в формате YYYY-MM-DD",
  "category": "Развлечения/Финансы/Образование/Здоровье/Шопинг/Транспорт/Коммунальные/Другое"
}

Письмо:
${emailText}

Если это не письмо о подписке или платеже, верни {"found": false}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Извлекаем JSON из ответа (удаляем markdown и лишний текст)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { found: false };
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return parsed;
  } catch (error) {
    console.error('Ошибка парсинга письма:', error);
    return { found: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Прогноз трат на основе истории подписок
export const predictSpending = async (
  subscriptions: any[],
  language: string = 'ru'
) => {
  try {
    const ai = initGemini();
    if (!ai) {
      throw new Error('Gemini API не инициализирован. Добавьте API ключ.');
    }

    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const subsData = subscriptions.map(sub => ({
      name: sub.name,
      price: sub.price,
      billingCycle: sub.billingCycle,
      category: sub.category
    }));

    const languageMap: Record<string, string> = {
      ru: 'русском',
      en: 'английском',
      be: 'белорусском',
      zh: 'китайском'
    };

    const prompt = `
Ты финансовый аналитик. Проанализируй подписки пользователя и создай прогноз трат.

Данные подписок:
${JSON.stringify(subsData, null, 2)}

Создай детальный анализ на ${languageMap[language] || 'русском'} языке и верни в JSON формате:

{
  "monthlyTotal": общая сумма в месяц (число),
  "yearlyTotal": общая сумма в год (число),
  "nextMonthPrediction": прогноз на следующий месяц (число),
  "insights": [
    "совет 1",
    "совет 2",
    "совет 3"
  ],
  "recommendations": [
    {
      "type": "warning/info/success",
      "title": "заголовок",
      "message": "описание"
    }
  ],
  "categoryBreakdown": {
    "Развлечения": процент (число),
    "Финансы": процент (число),
    // и т.д.
  },
  "savingsPotential": {
    "amount": сумма возможной экономии (число),
    "suggestions": ["предложение 1", "предложение 2"]
  }
}

Анализируй реальные цены, сравнивай с рынком, предлагай альтернативы.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Извлекаем JSON из ответа
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Не удалось получить валидный JSON ответ');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return parsed;
  } catch (error) {
    console.error('Ошибка прогнозирования:', error);
    throw error;
  }
};

// Получение рекомендаций альт��рнативных сервисов
export const getServiceAlternatives = async (
  serviceName: string,
  currentPrice: number,
  category: string,
  language: string = 'ru'
) => {
  try {
    const ai = initGemini();
    if (!ai) {
      throw new Error('Gemini API не инициализирован. Добавьте API ключ.');
    }

    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const languageMap: Record<string, string> = {
      ru: 'русском',
      en: 'английском',
      be: 'белорусском',
      zh: 'китайском'
    };

    const prompt = `
Найди альтернативы для сервиса "${serviceName}" (категория: ${category}, цена: ${currentPrice}).

Верни в JSON формате на ${languageMap[language] || 'русском'} языке:

{
  "alternatives": [
    {
      "name": "название сервиса",
      "price": примерная цена (число),
      "pros": ["плюс 1", "плюс 2"],
      "cons": ["минус 1", "минус 2"],
      "savingsPercent": процент экономии (число)
    }
  ]
}

Подбери реальные альтернативы с актуальными ценами.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Не удалось получить валидный JSON ответ');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return parsed;
  } catch (error) {
    console.error('Ошибка получения альтернатив:', error);
    throw error;
  }
};