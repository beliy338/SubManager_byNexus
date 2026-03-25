import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ServiceLogo } from './ServiceLogo';

interface MonthSubscription {
  id: string;
  name: string;
  price: number;
  billingDate: string;
  icon?: string;
  customLogo?: string;
  isDeleted?: boolean;
  category: string;
}

interface MonthSubscriptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  month: string;
  subscriptions: MonthSubscription[];
  currencySymbol: string;
}

export function MonthSubscriptionsModal({ 
  isOpen, 
  onClose, 
  month, 
  subscriptions,
  currencySymbol 
}: MonthSubscriptionsModalProps) {
  if (!isOpen) return null;

  const total = subscriptions.reduce((sum, sub) => sum + sub.price, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card border border-border rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Подписки за {month}</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {subscriptions.length > 0 ? (
              <>
                <div className="space-y-3 mb-6">
                  {subscriptions.map((sub) => (
                    <div
                      key={sub.id}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                        sub.isDeleted
                          ? 'bg-destructive/10 border-destructive/30'
                          : 'bg-muted/50 border-border hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <ServiceLogo 
                          logo={sub.icon} 
                          name={sub.name} 
                          size="md" 
                          customLogo={sub.customLogo}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="font-medium">{sub.name}</div>
                            {sub.isDeleted && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-destructive text-white">
                                уже удалена
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {sub.category} • Списание: {new Date(sub.billingDate).toLocaleDateString('ru')}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-orange-500">
                          {sub.price.toFixed(2)} {currencySymbol}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4 flex items-center justify-between">
                  <div className="text-lg font-semibold">Итого за месяц:</div>
                  <div className="text-2xl font-bold text-orange-500">
                    {total.toFixed(2)} {currencySymbol}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                Нет подписок за этот период
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
