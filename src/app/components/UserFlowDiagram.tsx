import { Mail, MousePointer, Layout, CreditCard, Settings, Ban, ArrowRight, Check } from 'lucide-react';

/**
 * User Flow Diagram: Email → Dashboard → Actions
 * Shows the journey from receiving email to taking action in the app
 */
export function UserFlowDiagram() {
  return (
    <div className="w-full max-w-5xl mx-auto p-8 bg-gradient-to-br from-purple-50 to-orange-50 rounded-2xl">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">
        User Journey Flow
      </h2>

      {/* Flow Container */}
      <div className="space-y-8">
        {/* Step 1: Email Received */}
        <div className="flex items-center gap-6">
          <div className="flex-shrink-0 w-16 h-16 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xl">
            1
          </div>
          <div className="flex-1 bg-white rounded-xl p-6 shadow-lg border-2 border-purple-200">
            <div className="flex items-start gap-4">
              <Mail className="w-8 h-8 text-purple-600 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Получение Email-уведомления
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>• <strong>D-3:</strong> "Напоминание: скоро списание по подписке..."</p>
                  <p>• <strong>D-1:</strong> "Завтра спишем оплату за..."</p>
                </div>
                <div className="mt-3 p-3 bg-purple-50 rounded-lg text-sm">
                  <strong className="text-purple-700">Триггер:</strong> Автоматическая отправка за 3 дня и за 1 день до даты списания
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Arrow Down */}
        <div className="flex justify-center">
          <ArrowRight className="w-8 h-8 text-gray-400 rotate-90" />
        </div>

        {/* Step 2: User Clicks CTA */}
        <div className="flex items-center gap-6">
          <div className="flex-shrink-0 w-16 h-16 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-xl">
            2
          </div>
          <div className="flex-1 bg-white rounded-xl p-6 shadow-lg border-2 border-orange-200">
            <div className="flex items-start gap-4">
              <MousePointer className="w-8 h-8 text-orange-500 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Клик по кнопке в письме
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                    <strong className="text-purple-700">D-3 CTA:</strong>
                    <div className="mt-1 inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm">
                      Управлять подпиской
                    </div>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg">
                    <strong className="text-orange-700">D-1 CTAs:</strong>
                    <div className="mt-2 space-y-2">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm">
                        Проверить карту / Пополнить баланс
                      </div>
                      <br />
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 text-red-600 rounded-lg text-sm mt-2">
                        <Ban className="w-4 h-4" /> Отменить подписку
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-orange-50 rounded-lg text-sm">
                  <strong className="text-orange-700">URL параметры:</strong> 
                  <code className="ml-2 text-xs bg-white px-2 py-1 rounded">?id={'{Subscription_ID}'}</code>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Arrow Down */}
        <div className="flex justify-center">
          <ArrowRight className="w-8 h-8 text-gray-400 rotate-90" />
        </div>

        {/* Step 3: Landing on Dashboard */}
        <div className="flex items-center gap-6">
          <div className="flex-shrink-0 w-16 h-16 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xl">
            3
          </div>
          <div className="flex-1 bg-white rounded-xl p-6 shadow-lg border-2 border-purple-200">
            <div className="flex items-start gap-4">
              <Layout className="w-8 h-8 text-purple-600 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Переход в личный кабинет
                </h3>
                <div className="text-sm text-gray-600 space-y-2">
                  <p><strong>Автоматические действия:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Проверка аутентификации пользователя (Supabase Auth)</li>
                    <li>Переход на страницу /dashboard или /subscriptions</li>
                    <li>Автоматическое выделение конкретной подписки (по ID из URL)</li>
                    <li>Показ модального окна с деталями подписки (опционально)</li>
                  </ul>
                </div>
                <div className="mt-3 p-3 bg-purple-50 rounded-lg text-sm">
                  <strong className="text-purple-700">Роуты:</strong>
                  <div className="mt-1 space-y-1 font-mono text-xs">
                    <div>• /dashboard/subscriptions?id={'{Subscription_ID}'}</div>
                    <div>• /dashboard/payment-methods?check=true</div>
                    <div>• /support?subscription={'{Subscription_ID}'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Arrow Down with Branch */}
        <div className="flex justify-center">
          <ArrowRight className="w-8 h-8 text-gray-400 rotate-90" />
        </div>

        {/* Step 4: User Actions - Split into 3 branches */}
        <div className="flex items-start gap-6">
          <div className="flex-shrink-0 w-16 h-16 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-xl">
            4
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Возможные действия пользователя
            </h3>
            
            {/* Three Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Action A: Check/Update Payment */}
              <div className="bg-white rounded-xl p-5 shadow-md border-2 border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="w-6 h-6 text-green-600" />
                  <h4 className="font-semibold text-green-700">Проверка оплаты</h4>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Просмотр платёжных методов</li>
                  <li>• Обновление данных карты</li>
                  <li>• Пополнение баланса</li>
                  <li>• Проверка лимитов</li>
                </ul>
                <div className="mt-3 pt-3 border-t border-green-100">
                  <div className="text-xs font-semibold text-green-600">
                    ✓ Списание пройдёт успешно
                  </div>
                </div>
              </div>

              {/* Action B: Manage Subscription */}
              <div className="bg-white rounded-xl p-5 shadow-md border-2 border-purple-200">
                <div className="flex items-center gap-2 mb-3">
                  <Settings className="w-6 h-6 text-purple-600" />
                  <h4 className="font-semibold text-purple-700">Управление</h4>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Изменение тарифа</li>
                  <li>• Перенос даты списания</li>
                  <li>• Просмотр истории платежей</li>
                  <li>• Настройка уведомлений</li>
                </ul>
                <div className="mt-3 pt-3 border-t border-purple-100">
                  <div className="text-xs font-semibold text-purple-600">
                    ~ Изменения сохранены
                  </div>
                </div>
              </div>

              {/* Action C: Cancel Subscription */}
              <div className="bg-white rounded-xl p-5 shadow-md border-2 border-red-200">
                <div className="flex items-center gap-2 mb-3">
                  <Ban className="w-6 h-6 text-red-600" />
                  <h4 className="font-semibold text-red-700">Отмена</h4>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Отмена подписки</li>
                  <li>• Выбор причины отмены</li>
                  <li>• Подтверждение действия</li>
                  <li>• Email-подтверждение</li>
                </ul>
                <div className="mt-3 pt-3 border-t border-red-100">
                  <div className="text-xs font-semibold text-red-600">
                    ✗ Списание отменено
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Arrow Down */}
        <div className="flex justify-center">
          <ArrowRight className="w-8 h-8 text-gray-400 rotate-90" />
        </div>

        {/* Step 5: Confirmation */}
        <div className="flex items-center gap-6">
          <div className="flex-shrink-0 w-16 h-16 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-xl">
            5
          </div>
          <div className="flex-1 bg-white rounded-xl p-6 shadow-lg border-2 border-green-200">
            <div className="flex items-start gap-4">
              <Check className="w-8 h-8 text-green-600 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Подтверждение и обратная связь
                </h3>
                <div className="text-sm text-gray-600 space-y-2">
                  <p><strong>Пользователь получает:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Уведомление в интерфейсе (toast) о выполненном действии</li>
                    <li>Email-подтверждение изменений</li>
                    <li>Обновлённые данные на дашборде</li>
                    <li>Возможность вернуться к списку подписок</li>
                  </ul>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="p-3 bg-green-50 rounded-lg text-center">
                    <div className="text-2xl mb-1">✉️</div>
                    <div className="text-xs font-semibold text-green-700">
                      Подтверждающий email
                    </div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg text-center">
                    <div className="text-2xl mb-1">📱</div>
                    <div className="text-xs font-semibold text-purple-700">
                      Push-уведомление
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Notes */}
      <div className="mt-8 p-6 bg-white rounded-xl border-2 border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📋 Технические детали интеграции
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-semibold text-purple-700 mb-2">Backend (Edge Functions):</h4>
            <ul className="space-y-1 text-gray-600 text-xs">
              <li>• Автоматический cron job для отправки писем</li>
              <li>• Проверка дат списания в БД каждый день</li>
              <li>• Фильтрация по статусу подписки (active)</li>
              <li>• Генерация персонализированных ссылок с токенами</li>
              <li>• Логирование отправок в таблицу email_logs</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-orange-700 mb-2">Frontend (React):</h4>
            <ul className="space-y-1 text-gray-600 text-xs">
              <li>• Обработка URL параметров (subscription ID)</li>
              <li>• Автоматическое открытие модалки с подпиской</li>
              <li>• Проверка авторизации через Supabase Auth</li>
              <li>• Редирект на /login если не авторизован</li>
              <li>• Сохранение redirect URL для возврата после логина</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Placeholders Reference */}
      <div className="mt-6 p-6 bg-gradient-to-r from-purple-50 to-orange-50 rounded-xl border-2 border-dashed border-purple-300">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🔖 Список плейсхолдеров для backend
        </h3>
        <div className="grid md:grid-cols-2 gap-3 text-xs font-mono">
          <div className="space-y-1">
            <div className="p-2 bg-white rounded border border-purple-200">
              <strong>{'{Имя_пользователя}'}</strong> - user.name
            </div>
            <div className="p-2 bg-white rounded border border-purple-200">
              <strong>{'{Название_сервиса}'}</strong> - subscription.name
            </div>
            <div className="p-2 bg-white rounded border border-purple-200">
              <strong>{'{Сумма}'}</strong> - subscription.amount
            </div>
            <div className="p-2 bg-white rounded border border-purple-200">
              <strong>{'{Валюта}'}</strong> - subscription.currency
            </div>
          </div>
          <div className="space-y-1">
            <div className="p-2 bg-white rounded border border-orange-200">
              <strong>{'{Дата_списания}'}</strong> - subscription.next_billing_date
            </div>
            <div className="p-2 bg-white rounded border border-orange-200">
              <strong>{'{Subscription_ID}'}</strong> - subscription.id
            </div>
            <div className="p-2 bg-white rounded border border-orange-200">
              <strong>{'{Последние_4_цифры}'}</strong> - payment_method.last4
            </div>
            <div className="p-2 bg-white rounded border border-orange-200">
              <strong>{'{User_Email}'}</strong> - user.email
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}