import { EmailTemplateD3 } from './EmailTemplateD3';
import { EmailTemplateD1 } from './EmailTemplateD1';
import { Card } from './ui/card';
import { ArrowRight } from 'lucide-react';

/**
 * Side-by-side comparison of D-3 and D-1 email templates
 */
export function EmailComparison() {
  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Сравнение шаблонов
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Визуальное сравнение двух типов уведомлений
        </p>
      </div>

      {/* Comparison Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* D-3 Template */}
        <div>
          <Card className="p-6 bg-purple-50 dark:bg-purple-900/20 mb-4 border-2 border-purple-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-300">
                  D-3: За 3 дня
                </h3>
                <p className="text-sm text-purple-700 dark:text-purple-400">
                  Информативное напоминание
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">-3</div>
                <div className="text-xs text-purple-600">дня</div>
              </div>
            </div>
          </Card>
          
          <div className="border-2 border-purple-200 dark:border-purple-800 rounded-lg p-4 bg-gray-50 dark:bg-gray-900 max-h-[800px] overflow-y-auto">
            <EmailTemplateD3 preview={false} />
          </div>

          {/* Key Features D-3 */}
          <Card className="mt-4 p-4 border-purple-200">
            <h4 className="font-semibold text-sm text-purple-900 dark:text-purple-300 mb-2">
              Особенности D-3:
            </h4>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li>✓ Спокойный тон, дружелюбный дизайн</li>
              <li>✓ Одна основная CTA: "Управлять подпиской"</li>
              <li>✓ Блок помощи для незнакомых подписок</li>
              <li>✓ Акцент на информировании, а не срочности</li>
            </ul>
          </Card>
        </div>

        {/* Arrow (visible on desktop) */}
        <div className="hidden lg:flex absolute left-1/2 top-1/3 -translate-x-1/2 z-10">
          <div className="bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg border-2 border-orange-300">
            <ArrowRight className="w-6 h-6 text-orange-500" />
          </div>
        </div>

        {/* D-1 Template */}
        <div>
          <Card className="p-6 bg-orange-50 dark:bg-orange-900/20 mb-4 border-2 border-orange-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-300">
                  D-1: За 1 день
                </h3>
                <p className="text-sm text-orange-700 dark:text-orange-400">
                  Срочное уведомление
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-orange-600">-1</div>
                <div className="text-xs text-orange-600">день</div>
              </div>
            </div>
          </Card>
          
          <div className="border-2 border-orange-200 dark:border-orange-800 rounded-lg p-4 bg-gray-50 dark:bg-gray-900 max-h-[800px] overflow-y-auto">
            <EmailTemplateD1 preview={false} />
          </div>

          {/* Key Features D-1 */}
          <Card className="mt-4 p-4 border-orange-200">
            <h4 className="font-semibold text-sm text-orange-900 dark:text-orange-300 mb-2">
              Особенности D-1:
            </h4>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li>⚠️ Срочный тон, акцентные цвета</li>
              <li>⚠️ Две CTA: "Проверить карту" + "Отменить"</li>
              <li>⚠️ Предупреждение о блокировке доступа</li>
              <li>⚠️ Дата в оранжевом блоке (подчёркивает срочность)</li>
            </ul>
          </Card>
        </div>
      </div>

      {/* Timeline Visualization */}
      <Card className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-orange-50 dark:from-purple-900/20 dark:to-orange-900/20">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
          Временная шкала отправки уведомлений
        </h3>
        
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute top-8 left-0 right-0 h-1 bg-gradient-to-r from-purple-300 via-orange-300 to-red-300 rounded"></div>
          
          {/* Timeline Points */}
          <div className="grid grid-cols-3 gap-4 relative z-10">
            {/* D-3 Point */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-purple-600 flex items-center justify-center text-white font-bold mb-2 shadow-lg">
                D-3
              </div>
              <div className="text-sm font-semibold text-purple-700 dark:text-purple-400">
                За 3 дня
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                📧 Email D-3 отправлен
              </div>
            </div>

            {/* D-1 Point */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-orange-500 flex items-center justify-center text-white font-bold mb-2 shadow-lg">
                D-1
              </div>
              <div className="text-sm font-semibold text-orange-700 dark:text-orange-400">
                За 1 день
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                📧 Email D-1 отправлен
              </div>
            </div>

            {/* Billing Day */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-red-600 flex items-center justify-center text-white font-bold mb-2 shadow-lg">
                D-0
              </div>
              <div className="text-sm font-semibold text-red-700 dark:text-red-400">
                День списания
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                💳 Списание средств
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-8 pt-6 border-t border-gray-300 dark:border-gray-700">
          <div className="grid md:grid-cols-3 gap-4 text-xs">
            <div className="flex items-start gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-600 mt-0.5 flex-shrink-0"></div>
              <div>
                <strong className="text-purple-700 dark:text-purple-400">D-3:</strong> Мягкое напоминание, пользователь имеет время
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500 mt-0.5 flex-shrink-0"></div>
              <div>
                <strong className="text-orange-700 dark:text-orange-400">D-1:</strong> Срочное действие требуется
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-3 h-3 rounded-full bg-red-600 mt-0.5 flex-shrink-0"></div>
              <div>
                <strong className="text-red-700 dark:text-red-400">D-0:</strong> Списание происходит автоматически
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
