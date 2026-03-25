import { Bell, Mail, AlertCircle } from 'lucide-react';

interface EmailTemplateD3Props {
  preview?: boolean;
}

/**
 * Email Template: D-3 (3 days before charge)
 * Subject: "Напоминание: скоро списание по подписке {Название_сервиса}"
 */
export function EmailTemplateD3({ preview = true }: EmailTemplateD3Props) {
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
                Привет, <span className="text-purple-600">{'{Имя_пользователя}'}</span>!
              </h1>

              {/* Info Card */}
              <div 
                className="border border-gray-200 rounded-xl p-6 mb-6"
                style={{ backgroundColor: '#f9fafb' }}
              >
                {/* Service Icon & Name */}
                <div className="flex items-start gap-4 mb-4">
                  <div 
                    className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#e0e7ff' }}
                  >
                    <Bell className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-500 mb-1">Подписка</div>
                    <div className="text-xl font-semibold text-gray-900 mb-2">
                      {'{Название_сервиса}'}
                    </div>
                  </div>
                </div>

                {/* Charge Details */}
                <div className="bg-white rounded-lg p-4 border border-gray-100">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-600">Сумма списания</span>
                    <span className="text-2xl font-semibold text-gray-900">
                      {'{Сумма}'} {'{Валюта}'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Дата списания</span>
                    <span className="text-lg font-medium text-purple-600">
                      {'{Дата_списания}'} (через 3 дня)
                    </span>
                  </div>
                </div>
              </div>

              {/* Call to Action Button */}
              <div className="text-center mb-6">
                <a
                  href="https://your-app.com/dashboard/subscriptions?id={Subscription_ID}"
                  className="inline-block px-8 py-4 rounded-lg font-semibold text-white no-underline"
                  style={{ 
                    backgroundColor: '#9333ea',
                    textDecoration: 'none'
                  }}
                >
                  Управлять подпиской
                </a>
              </div>

              {/* Help Section */}
              <div 
                className="border-l-4 rounded-r-lg p-4 mb-6"
                style={{ 
                  borderColor: '#fb923c',
                  backgroundColor: '#fff7ed'
                }}
              >
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900 mb-1">
                      Не узнаёте этот сервис?
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      Если вы не оформляли эту подписку или хотите её отменить, нажмите кнопку ниже.
                    </div>
                    <a
                      href="https://your-app.com/support?subscription={Subscription_ID}"
                      className="text-orange-500 font-medium text-sm hover:underline"
                    >
                      Сообщить о проблеме →
                    </a>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 my-6"></div>

              {/* Footer Text */}
              <div className="text-sm text-gray-500 text-center">
                <p className="mb-2">
                  Это автоматическое напоминание о предстоящем списании по вашей подписке.
                </p>
                <p className="mb-4">
                  Вы получили это письмо, потому что у вас активна подписка на {'{Название_сервиса}'}.
                </p>
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
        <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h3 className="font-semibold text-purple-900 mb-2">📧 Тема письма:</h3>
          <p className="text-purple-700">
            "Напоминание: скоро списание по подписке {'{Название_сервиса}'}"
          </p>
        </div>
      )}
    </div>
  );
}
