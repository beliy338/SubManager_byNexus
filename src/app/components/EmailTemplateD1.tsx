import { AlertTriangle, Mail, CreditCard, Ban } from 'lucide-react';

interface EmailTemplateD1Props {
  preview?: boolean;
}

/**
 * Email Template: D-1 (1 day before charge)
 * Subject: "Завтра спишем оплату за {Название_сервиса}"
 */
export function EmailTemplateD1({ preview = true }: EmailTemplateD1Props) {
  return (
    <div className="w-full max-w-[600px] mx-auto bg-white">
      {/* Email Container - max 600px for email clients */}
      <table
        cellPadding="0"
        cellSpacing="0"
        role="presentation"
        className="w-full"
        style={{ 
          maxWidth: '600px', 
          margin: '0 auto',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        }}
      >
        <tbody>
          {/* Header with Logo */}
          <tr>
            <td style={{ padding: '32px 24px' }}>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-orange-500 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-semibold text-gray-900">SubManager</span>
              </div>
            </td>
          </tr>

          {/* Main Content */}
          <tr>
            <td style={{ padding: '0 24px 24px' }}>
              {/* Greeting */}
              <h1 className="text-2xl font-semibold text-gray-900 mb-6">
                <span className="text-purple-600">{'{Имя_пользователя}'}</span>, завтра списание!
              </h1>

              {/* Urgent Notice Card */}
              <div 
                className="border-2 rounded-xl p-6 mb-6"
                style={{ 
                  borderColor: '#fb923c',
                  backgroundColor: '#fff7ed'
                }}
              >
                {/* Urgent Icon */}
                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#fed7aa' }}
                  >
                    <AlertTriangle className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="text-lg font-semibold text-orange-600">
                    Списание через 24 часа
                  </div>
                </div>

                {/* Service Info */}
                <div className="bg-white rounded-lg p-5 border border-orange-200 mb-4">
                  <div className="flex items-start gap-4 mb-4">
                    <div 
                      className="w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: '#e0e7ff' }}
                    >
                      <CreditCard className="w-7 h-7 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 mb-1">Подписка</div>
                      <div className="text-xl font-semibold text-gray-900">
                        {'{Название_сервиса}'}
                      </div>
                    </div>
                  </div>

                  {/* Charge Details - Prominent */}
                  <div 
                    className="rounded-lg p-4 mb-3"
                    style={{ backgroundColor: '#fef3c7' }}
                  >
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="text-sm text-gray-700">Сумма к списанию</span>
                      <span className="text-3xl font-bold text-gray-900">
                        {'{Сумма}'} {'{Валюта}'}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm text-gray-700">Дата списания</span>
                      <div className="text-right">
                        <div 
                          className="text-xl font-bold inline-block px-3 py-1 rounded"
                          style={{ 
                            backgroundColor: '#fb923c',
                            color: '#ffffff'
                          }}
                        >
                          {'{Дата_списания}'}
                        </div>
                        <div className="text-xs text-orange-600 mt-1">Завтра!</div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <CreditCard className="w-3 h-3" />
                    Карта: •••• {'{Последние_4_цифры}'}
                  </div>
                </div>
              </div>

              {/* Action Buttons - Two CTAs */}
              <div className="space-y-3 mb-6">
                {/* Primary CTA - Top Up / Check Card */}
                <div className="text-center">
                  <a
                    href="https://your-app.com/dashboard/payment-methods?check=true"
                    className="block w-full px-6 py-4 rounded-lg font-semibold text-white no-underline text-center"
                    style={{ 
                      backgroundColor: '#9333ea',
                      textDecoration: 'none'
                    }}
                  >
                    Проверить карту / Пополнить баланс
                  </a>
                  <div className="text-xs text-gray-500 mt-2">
                    Убедитесь, что на карте достаточно средств
                  </div>
                </div>

                {/* Secondary CTA - Cancel */}
                <div className="text-center">
                  <a
                    href="https://your-app.com/dashboard/subscriptions/{Subscription_ID}/cancel"
                    className="block w-full px-6 py-3 rounded-lg font-medium border-2 no-underline text-center"
                    style={{ 
                      borderColor: '#e5e7eb',
                      color: '#ef4444',
                      backgroundColor: '#ffffff',
                      textDecoration: 'none'
                    }}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Ban className="w-4 h-4" />
                      <span>Отменить подписку</span>
                    </div>
                  </a>
                </div>
              </div>

              {/* Warning Notice */}
              <div 
                className="rounded-lg p-4 mb-6"
                style={{ backgroundColor: '#fef2f2' }}
              >
                <div className="text-sm text-gray-700">
                  <strong className="text-red-600">⚠️ Важно:</strong> Если списание не пройдёт из-за недостатка средств,
                  доступ к сервису {'{Название_сервиса}'} может быть приостановлен.
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 my-6"></div>

              {/* Footer Text */}
              <div className="text-sm text-gray-500 text-center">
                <p className="mb-2">
                  Это срочное уведомление о списании завтра.
                </p>
                <p className="mb-4">
                  Если вам не нужна эта подписка, отмените её прямо сейчас, чтобы избежать списания.
                </p>
                <a
                  href="https://your-app.com/dashboard"
                  className="text-purple-600 font-medium hover:underline"
                >
                  Перейти в личный кабинет →
                </a>
              </div>
            </td>
          </tr>

          {/* Footer */}
          <tr>
            <td style={{ padding: '24px', backgroundColor: '#f9fafb' }}>
              <div className="text-xs text-gray-500 text-center">
                <p className="mb-2">© 2026 SubManager. Все права защищены.</p>
                <p className="mb-3">
                  <a href="https://your-app.com/settings" className="text-purple-600 hover:underline">
                    Настройки уведомлений
                  </a>
                  {' | '}
                  <a href="https://your-app.com/settings/subscriptions/{Subscription_ID}" className="text-purple-600 hover:underline">
                    Управление подпиской
                  </a>
                  {' | '}
                  <a href="https://your-app.com/privacy" className="text-purple-600 hover:underline">
                    Политика конфиденциальности
                  </a>
                </p>
                <p className="text-gray-400">
                  SubManager - менеджер подписок<br />
                  Россия
                </p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Preview Mode Label */}
      {preview && (
        <div className="mt-6 p-4 bg-orange-50 border border-orange-300 rounded-lg">
          <h3 className="font-semibold text-orange-900 mb-2">📧 Тема письма:</h3>
          <p className="text-orange-700">
            "Завтра спишем оплату за {'{Название_сервиса}'}"
          </p>
        </div>
      )}
    </div>
  );
}
