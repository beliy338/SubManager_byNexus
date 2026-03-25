import { useState } from 'react';
import { EmailTemplateD3 } from '../components/EmailTemplateD3';
import { EmailTemplateD1 } from '../components/EmailTemplateD1';
import { UserFlowDiagram } from '../components/UserFlowDiagram';
import { EmailMobilePreview } from '../components/EmailMobilePreview';
import { EmailComparison } from '../components/EmailComparison';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card } from '../components/ui/card';
import { Mail, Workflow, Info, Calendar, Bell, Download, Monitor, Smartphone, GitCompare } from 'lucide-react';
import { Button } from '../components/ui/button';

/**
 * Email Templates Preview Page
 * Shows mockups of transactional emails (D-3 and D-1) and user flow diagram
 */
export function EmailTemplates() {
  const [activeTab, setActiveTab] = useState('d3');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 dark:from-gray-900 dark:via-black dark:to-gray-900">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-orange-500 flex items-center justify-center">
              <Mail className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Email Templates Mockups
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Макеты триггерных email-рассылок для менеджера подписок SubManager
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="p-4 bg-white dark:bg-gray-800 border-purple-200 dark:border-purple-800">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">D-3 Template</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Напоминание за 3 дня до списания средств
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white dark:bg-gray-800 border-orange-200 dark:border-orange-800">
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-orange-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">D-1 Template</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Срочное уведомление за 1 день до списания
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white dark:bg-gray-800 border-green-200 dark:border-green-800">
            <div className="flex items-start gap-3">
              <Workflow className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">User Flow</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Схема взаимодействия пользователя с письмом
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="d3" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>D-3 Template</span>
            </TabsTrigger>
            <TabsTrigger value="d1" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span>D-1 Template</span>
            </TabsTrigger>
            <TabsTrigger value="compare" className="flex items-center gap-2">
              <GitCompare className="w-4 h-4" />
              <span>Сравнение</span>
            </TabsTrigger>
            <TabsTrigger value="flow" className="flex items-center gap-2">
              <Workflow className="w-4 h-4" />
              <span>User Flow</span>
            </TabsTrigger>
          </TabsList>

          {/* D-3 Template Tab */}
          <TabsContent value="d3">
            <Card className="p-8 bg-white dark:bg-gray-800">
              {/* Template Info */}
              <div className="mb-8 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-l-4 border-purple-600">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">
                      Шаблон "За 3 дня до списания" (D-3)
                    </h3>
                    <ul className="text-sm text-purple-700 dark:text-purple-400 space-y-1">
                      <li>• <strong>Цель:</strong> Информировать пользователя заранее о предстоящем списании</li>
                      <li>• <strong>Тон:</strong> Дружелюбный, информативный</li>
                      <li>• <strong>CTA:</strong> "Управлять подпиской" - ведёт на страницу управления</li>
                      <li>• <strong>Дополнительно:</strong> Блок помощи для незнакомых подписок</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Email Preview */}
              <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-8 bg-gray-50 dark:bg-gray-900">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                    Preview (600px max width - email client standard)
                  </h4>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="w-4 h-4" />
                    Export HTML
                  </Button>
                </div>
                <EmailTemplateD3 preview={true} />
              </div>
            </Card>
          </TabsContent>

          {/* D-1 Template Tab */}
          <TabsContent value="d1">
            <Card className="p-8 bg-white dark:bg-gray-800">
              {/* Template Info */}
              <div className="mb-8 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-l-4 border-orange-600">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-orange-900 dark:text-orange-300 mb-2">
                      Шаблон "За 1 день до списания" (D-1)
                    </h3>
                    <ul className="text-sm text-orange-700 dark:text-orange-400 space-y-1">
                      <li>• <strong>Цель:</strong> Срочное напоминание с возможностью немедленных действий</li>
                      <li>• <strong>Тон:</strong> Срочный, но не агрессивный</li>
                      <li>• <strong>Дизайн:</strong> Акцентные цвета (оранжевый) для даты списания</li>
                      <li>• <strong>CTA:</strong> Две кнопки - "Проверить карту" и "Отменить подписку"</li>
                      <li>• <strong>Дополнительно:</strong> Предупреждение о возможной блокировке доступа</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Email Preview */}
              <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-8 bg-gray-50 dark:bg-gray-900">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                    Preview (600px max width - email client standard)
                  </h4>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="w-4 h-4" />
                    Export HTML
                  </Button>
                </div>
                <EmailTemplateD1 preview={true} />
              </div>
            </Card>
          </TabsContent>

          {/* Comparison Tab */}
          <TabsContent value="compare">
            <Card className="p-8 bg-white dark:bg-gray-800">
              {/* Comparison Info */}
              <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg border-l-4 border-gray-600">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-300 mb-2">
                      Сравнение шаблонов D-3 и D-1
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-400">
                      Визуальное сравнение двух шаблонов email-рассылок для лучшего понимания их различий.
                    </p>
                  </div>
                </div>
              </div>

              {/* Email Comparison */}
              <EmailComparison />
            </Card>
          </TabsContent>

          {/* User Flow Tab */}
          <TabsContent value="flow">
            <Card className="p-8 bg-white dark:bg-gray-800">
              {/* Flow Info */}
              <div className="mb-8 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-600">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-green-900 dark:text-green-300 mb-2">
                      User Journey: Email → Dashboard → Action
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-400">
                      Полная схема взаимодействия пользователя с email-уведомлением: от получения письма до выполнения действия в личном кабинете.
                      Включает технические детали интеграции и список плейсхолдеров для backend.
                    </p>
                  </div>
                </div>
              </div>

              {/* Flow Diagram */}
              <UserFlowDiagram />
            </Card>
          </TabsContent>
        </Tabs>

        {/* Technical Notes */}
        <Card className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-orange-50 dark:from-purple-900/20 dark:to-orange-900/20 border-2 border-dashed border-purple-300 dark:border-purple-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            📝 Рекомендации по реализации
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-purple-700 dark:text-purple-400 mb-3">Email верстка:</h4>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>✓ Использовать таблицы для layout (совместимость с старыми клиентами)</li>
                <li>✓ Inline CSS стили для гарантированного отображения</li>
                <li>✓ Максимальная ширина 600px для desktop клиентов</li>
                <li>✓ Адаптивная верстка через media queries</li>
                <li>✓ Тестировать в Outlook, Gmail, Apple Mail, Yandex Mail</li>
                <li>✓ Использовать web-safe шрифты с fallback</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-orange-700 dark:text-orange-400 mb-3">Backend интеграция:</h4>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>✓ Использовать Supabase Edge Functions для отправки</li>
                <li>✓ Cron job для ежедневной проверки подписок</li>
                <li>✓ Логирование всех отправок в таблицу email_logs</li>
                <li>✓ Персонализация через плейсхолдеры из БД</li>
                <li>✓ Генерация уникальных tracking ссылок</li>
                <li>✓ Rate limiting для защиты от спама</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              🔗 Структура URL для CTA кнопок:
            </h4>
            <div className="space-y-2 font-mono text-xs text-gray-600 dark:text-gray-400">
              <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded">
                <strong>Управление:</strong> https://your-app.com/dashboard/subscriptions?id={'{sub_id}'}
              </div>
              <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded">
                <strong>Платёж:</strong> https://your-app.com/dashboard/payment-methods?check=true
              </div>
              <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded">
                <strong>Отмена:</strong> https://your-app.com/dashboard/subscriptions/{'{sub_id}'}/cancel
              </div>
              <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded">
                <strong>Поддержка:</strong> https://your-app.com/support?subscription={'{sub_id}'}
              </div>
            </div>
          </div>
        </Card>

        {/* Footer Note */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            Эти макеты готовы для передачи backend-разработчикам для интеграции с системой отправки email.
            <br />
            Для экспорта в HTML используйте кнопку "Export HTML" в каждом шаблоне.
          </p>
        </div>
      </div>
    </div>
  );
}