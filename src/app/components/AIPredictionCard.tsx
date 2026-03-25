import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, TrendingUp, AlertCircle, Lightbulb, DollarSign } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { predictSpending } from '../utils/tensorflow';
import { toast } from 'sonner';

export function AIPredictionCard() {
  const { subscriptions, t, settings, getCurrencySymbol } = useApp();
  const [prediction, setPrediction] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeSpending = async () => {
    if (settings.ai_permission !== 'yes') {
      toast.error('AI функции недоступны. Активируйте AI в настройках.');
      return;
    }

    if (subscriptions.length === 0) {
      toast.error('Добавьте хотя бы одну подписку для анализа');
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await predictSpending(subscriptions, settings.language);
      setPrediction(result);
      toast.success(t('ai_email_parsed'));
    } catch (error) {
      console.error('Error analyzing spending:', error);
      toast.error('Ошибка AI анализа. Проверьте API ключ.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (settings.ai_permission !== 'yes') {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold">{t('ai_prediction_title')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('ai_insights_title')}
          </p>
        </div>
        {!prediction && (
          <button
            onClick={analyzeSpending}
            disabled={isAnalyzing}
            className="ml-auto px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isAnalyzing ? t('ai_analyzing') : t('ai_analyze_button')}
          </button>
        )}
      </div>

      {isAnalyzing && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          <p className="ml-3 text-muted-foreground">{t('ai_analyzing')}</p>
        </div>
      )}

      {prediction && !isAnalyzing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Statistics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">След. месяц</span>
              </div>
              <p className="text-2xl font-bold">
                {prediction.nextMonthPrediction} {getCurrencySymbol()}
              </p>
            </div>

            {prediction.savingsPotential && (
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">Экономия</span>
                </div>
                <p className="text-2xl font-bold text-blue-500">
                  {prediction.savingsPotential.amount} {getCurrencySymbol()}
                </p>
              </div>
            )}
          </div>

          {/* Insights */}
          {prediction.insights && prediction.insights.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                <h4 className="font-bold">Рекомендации AI:</h4>
              </div>
              {prediction.insights.map((insight: string, index: number) => (
                <div
                  key={index}
                  className="p-3 bg-muted rounded-lg text-sm"
                >
                  {insight}
                </div>
              ))}
            </div>
          )}

          {/* Recommendations */}
          {prediction.recommendations && prediction.recommendations.length > 0 && (
            <div className="space-y-2">
              {prediction.recommendations.map((rec: any, index: number) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    rec.type === 'warning'
                      ? 'bg-orange-500/10 border-orange-500/20'
                      : rec.type === 'success'
                      ? 'bg-green-500/10 border-green-500/20'
                      : 'bg-blue-500/10 border-blue-500/20'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-bold text-sm">{rec.title}</h5>
                      <p className="text-sm opacity-90 mt-1">{rec.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={analyzeSpending}
            className="w-full py-2 text-sm text-purple-500 hover:text-purple-600 transition-colors"
          >
            {t('ai_update_analysis')}
          </button>
        </motion.div>
      )}
    </div>
  );
}