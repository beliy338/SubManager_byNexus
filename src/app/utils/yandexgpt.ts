/**
 * YandexGPT API Integration
 * 
 * Бесплатный тариф YandexGPT (Yandex Cloud):
 * - 1000 запросов в день (бесплатно в рамках trial)
 * - После trial: первые 1000 запросов в месяц бесплатно
 * - Лимит токенов: до 8000 токенов на запрос
 * 
 * Документация: https://cloud.yandex.ru/docs/yandexgpt/
 */

export interface YandexGPTConfig {
  apiKey: string;
  folderId: string;
  modelUri?: string;
}

export interface YandexGPTMessage {
  role: 'system' | 'user' | 'assistant';
  text: string;
}

export interface YandexGPTRequest {
  modelUri: string;
  completionOptions: {
    stream: boolean;
    temperature: number;
    maxTokens: string;
  };
  messages: YandexGPTMessage[];
}

export interface YandexGPTResponse {
  result: {
    alternatives: Array<{
      message: {
        role: string;
        text: string;
      };
      status: string;
    }>;
    usage: {
      inputTextTokens: string;
      completionTokens: string;
      totalTokens: string;
    };
    modelVersion: string;
  };
}

export class YandexGPT {
  private apiKey: string;
  private folderId: string;
  private modelUri: string;
  private endpoint = 'https://llm.api.cloud.yandex.net/foundationModels/v1/completion';

  constructor(config: YandexGPTConfig) {
    this.apiKey = config.apiKey;
    this.folderId = config.folderId;
    this.modelUri = config.modelUri || `gpt://${config.folderId}/yandexgpt-lite/latest`;
  }

  /**
   * Отправка запроса к YandexGPT
   */
  async complete(
    messages: YandexGPTMessage[],
    options: {
      temperature?: number;
      maxTokens?: number;
    } = {}
  ): Promise<string> {
    const requestBody: YandexGPTRequest = {
      modelUri: this.modelUri,
      completionOptions: {
        stream: false,
        temperature: options.temperature || 0.6,
        maxTokens: String(options.maxTokens || 2000),
      },
      messages,
    };

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Api-Key ${this.apiKey}`,
          'x-folder-id': this.folderId,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`YandexGPT API Error: ${response.status} - ${errorText}`);
      }

      const data: YandexGPTResponse = await response.json();
      
      if (!data.result?.alternatives?.[0]?.message?.text) {
        throw new Error('Invalid response format from YandexGPT');
      }

      return data.result.alternatives[0].message.text;
    } catch (error) {
      console.error('YandexGPT API Error:', error);
      throw error;
    }
  }

  /**
   * Парсинг письма с информацией о подписке
   */
  async parseSubscriptionEmail(emailContent: string): Promise<any> {
    const systemPrompt = `Ты — AI-помощник для анализа писем о подписках. 
Твоя задача — извлечь из письма информацию о подписке и вернуть её в формате JSON.

Верни JSON объект со следующими полями:
{
  "name": "название сервиса",
  "price": число (цена в валюте письма),
  "currency": "валюта (RUB, USD, EUR, CNY)",
  "billingCycle": "monthly" или "yearly",
  "nextBilling": "дата следующего платежа в формате YYYY-MM-DD",
  "category": "одна из: streaming, software, delivery, cloud, entertainment, other"
}

Если информация не найдена, верни null.`;

    const messages: YandexGPTMessage[] = [
      { role: 'system', text: systemPrompt },
      { role: 'user', text: `Проанализируй это письмо:\n\n${emailContent}` },
    ];

    try {
      const response = await this.complete(messages, { temperature: 0.3, maxTokens: 500 });
      
      // Извлекаем JSON из ответа
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing email with YandexGPT:', error);
      return null;
    }
  }

  /**
   * Про��нозирование трат на основе истории подписок
   */
  async predictSpending(subscriptions: any[]): Promise<{
    nextMonthSpending: number;
    insights: string[];
    recommendations: string[];
  }> {
    const subscriptionsData = JSON.stringify(subscriptions.map(sub => ({
      name: sub.name,
      price: sub.price,
      billingCycle: sub.billingCycle,
      category: sub.category,
    })));

    const systemPrompt = `Ты — финансовый аналитик для управления подписками.
Проанализируй подписки пользователя и дай прогноз трат, инсайты и рекомендации.

Верни JSON объект:
{
  "nextMonthSpending": число (прогноз трат на следующий месяц),
  "insights": ["инсайт 1", "инсайт 2", "инсайт 3"],
  "recommendations": ["рекомендация 1", "рекомендация 2"]
}`;

    const messages: YandexGPTMessage[] = [
      { role: 'system', text: systemPrompt },
      { role: 'user', text: `Подписки пользователя:\n${subscriptionsData}` },
    ];

    try {
      const response = await this.complete(messages, { temperature: 0.5, maxTokens: 1000 });
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return {
        nextMonthSpending: 0,
        insights: ['Недостаточно данных для анализа'],
        recommendations: [],
      };
    } catch (error) {
      console.error('Error predicting spending with YandexGPT:', error);
      return {
        nextMonthSpending: 0,
        insights: ['Ошибка анализа'],
        recommendations: [],
      };
    }
  }

  /**
   * Поиск альтернативных сервисов
   */
  async findAlternatives(subscriptionName: string, category: string): Promise<string[]> {
    const systemPrompt = `Ты — эксперт по цифровым сервисам и подпискам.
Предложи 3-5 альтернативных сервисов для замены указанного сервиса.
Верни только массив названий сервисов в формате JSON: ["сервис 1", "сервис 2", "сервис 3"]`;

    const messages: YandexGPTMessage[] = [
      { role: 'system', text: systemPrompt },
      { 
        role: 'user', 
        text: `Найди альтернативы для: ${subscriptionName} (категория: ${category})` 
      },
    ];

    try {
      const response = await this.complete(messages, { temperature: 0.7, maxTokens: 500 });
      
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return [];
    } catch (error) {
      console.error('Error finding alternatives with YandexGPT:', error);
      return [];
    }
  }

  /**
   * Генерация персональных рекомендаций
   */
  async generateInsights(subscriptions: any[], spendingData: any): Promise<string[]> {
    const data = {
      subscriptions: subscriptions.map(sub => ({
        name: sub.name,
        price: sub.price,
        category: sub.category,
      })),
      totalMonthly: spendingData.totalMonthly,
      totalYearly: spendingData.totalYearly,
    };

    const systemPrompt = `Ты — персональный финансовый советник.
На основе данных о подписках пользователя дай 3-5 персональных рекомендаций.
Верни массив строк в формате JSON: ["совет 1", "совет 2", "совет 3"]`;

    const messages: YandexGPTMessage[] = [
      { role: 'system', text: systemPrompt },
      { role: 'user', text: `Данные:\n${JSON.stringify(data, null, 2)}` },
    ];

    try {
      const response = await this.complete(messages, { temperature: 0.6, maxTokens: 800 });
      
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return ['Продолжайте отслеживать свои подписки'];
    } catch (error) {
      console.error('Error generating insights with YandexGPT:', error);
      return [];
    }
  }
}

/**
 * Создание экземпляра YandexGPT
 * 
 * Для получения API ключа:
 * 1. Зарегистрируйтесь в Yandex Cloud: https://cloud.yandex.ru
 * 2. Создайте сервисный аккаунт
 * 3. Выдайте роль ai.languageModels.user
 * 4. Создайте API-ключ
 * 5. Получите folder-id из консоли Yandex Cloud
 */
export function createYandexGPT(apiKey: string, folderId: string): YandexGPT {
  return new YandexGPT({ apiKey, folderId });
}

// Mock для разработки (если нет API ключа)
export class MockYandexGPT extends YandexGPT {
  constructor() {
    super({ apiKey: 'mock', folderId: 'mock' });
  }

  async complete(messages: YandexGPTMessage[]): Promise<string> {
    console.log('Mock YandexGPT:', messages);
    return 'Mock response from YandexGPT';
  }

  async parseSubscriptionEmail(emailContent: string): Promise<any> {
    // Простой парсинг для демонстрации
    if (emailContent.toLowerCase().includes('netflix')) {
      return {
        name: 'Netflix',
        price: 799,
        currency: 'RUB',
        billingCycle: 'monthly',
        nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'streaming',
      };
    }
    return null;
  }

  async predictSpending(subscriptions: any[]): Promise<any> {
    const total = subscriptions.reduce((sum, sub) => {
      const monthlyPrice = sub.billingCycle === 'yearly' ? sub.price / 12 : sub.price;
      return sum + monthlyPrice;
    }, 0);

    return {
      nextMonthSpending: Math.round(total * 1.05),
      insights: [
        '💡 Ваши расходы на подписки стабильны',
        '📊 Рекомендуем проверить неиспользуемые сервисы',
        '💰 Возможна экономия до 15% при переходе на годовые планы',
      ],
      recommendations: [
        'Рассмотрите семейные тарифы для экономии',
        'Проверьте альтернативные сервисы с лучшими условиями',
      ],
    };
  }

  async findAlternatives(subscriptionName: string, category: string): Promise<string[]> {
    const alternatives: Record<string, string[]> = {
      streaming: ['Кинопоиск', 'Okko', 'more.tv', 'START', 'Premier'],
      software: ['Яндекс 360', 'МойОфис', 'P7-Office'],
      delivery: ['Яндекс Плюс', 'СберПрайм', 'Ozon Premium'],
    };

    return alternatives[category] || ['Альтернатив не найдено'];
  }

  async generateInsights(subscriptions: any[], spendingData: any): Promise<string[]> {
    return [
      '💡 У вас активно ' + subscriptions.length + ' подписок',
      '📊 Средняя стоимость подписки: ' + Math.round(spendingData.totalMonthly / subscriptions.length) + ' ₽',
      '💰 При переходе на годовые планы можно сэкономить до 20%',
      '🎯 Рекомендуем использовать семейные тарифы',
    ];
  }
}
