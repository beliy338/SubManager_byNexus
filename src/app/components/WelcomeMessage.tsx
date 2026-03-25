import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles } from 'lucide-react';

interface WelcomeMessageProps {
  userName: string;
}

export function WelcomeMessage({ userName }: WelcomeMessageProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has seen welcome message
    const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome');
    
    if (!hasSeenWelcome) {
      setIsVisible(true);
      sessionStorage.setItem('hasSeenWelcome', 'true');
    }
  }, []);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-card border border-border rounded-2xl p-8 w-full max-w-lg shadow-2xl relative overflow-hidden"
          >
            {/* Decorative gradient */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent"></div>
            
            <button
              onClick={() => setIsVisible(false)}
              className="absolute top-4 right-4 p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Добро пожаловать в SubManager!</h2>
            </div>

            <div className="space-y-4 mb-6">
              <p className="text-lg">
                Привет, <span className="font-semibold text-primary">{userName}</span>! 👋
              </p>
              
              <p className="text-muted-foreground">
                Ваш аккаунт успешно создан. Все ваши данные надёжно хранятся в облаке и синхронизируются на всех ваших устройствах.
              </p>

              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold mb-2">Начало работы:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Добавьте первую подписку с помощью кнопки «+ Добавить подписку»</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Просматривайте аналитику и прогнозы расходов во вкладке «Аналитика»</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Настройте приложение под себя в разделе «Настройки» (язык, валюта, тема)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Все изменения автоматически сохраняются в облако</span>
                  </li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setIsVisible(false)}
              className="w-full py-3 px-4 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Начать работу!
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}