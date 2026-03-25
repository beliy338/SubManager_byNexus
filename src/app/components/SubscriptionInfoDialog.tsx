import React from 'react';
import { X } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { ServiceLogo } from './ServiceLogo';

interface SubscriptionInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: any;
}

export function SubscriptionInfoDialog({ isOpen, onClose, subscription }: SubscriptionInfoDialogProps) {
  const { t, getCurrencySymbol, convertPrice } = useApp();

  if (!isOpen || !subscription) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{t('subscriptionInfo')}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Logo and Name */}
          <div className="flex items-center gap-4 pb-4 border-b border-border">
            <ServiceLogo logo={subscription.icon} name={subscription.name} size="xl" customLogo={subscription.customLogo} />
            <div>
              <p className="text-sm text-muted-foreground mb-1">{t('serviceName2')}</p>
              <div className="flex items-center gap-2">
                <p className="text-xl font-bold">{subscription.name}</p>
                {subscription.isCustom && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-green-500 to-cyan-500 text-white border-none">
                    {t('custom')}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">{t('category')}</p>
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
              {t(subscription.category)}
            </span>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">{t('cost2')}</p>
            <p className="text-2xl font-bold">
              {convertPrice(subscription.price).toFixed(2)} {getCurrencySymbol()}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">{t('billingPeriod')}</p>
            <p className="text-lg">{t(subscription.billingCycle)}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">{t('nextBillingDate')}</p>
            <p className="text-lg">{(() => {
              const date = new Date(subscription.nextBilling);
              const { settings } = useApp();
              const locale = settings.language === 'zh' ? 'zh-CN' : settings.language === 'be' ? 'be-BY' : settings.language === 'en' ? 'en-US' : 'ru-RU';
              
              return date.toLocaleDateString(locale, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });
            })()}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">{t('subscriptionStatus')}</p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm ${
              subscription.status === 'active' 
                ? 'bg-green-500/10 text-green-500' 
                : 'bg-red-500/10 text-red-500'
            }`}>
              {subscription.status === 'active' ? t('active') : t('inactive')}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 px-4 py-3 bg-muted hover:bg-muted/80 rounded-lg font-medium transition-colors"
        >
          {t('close')}
        </button>
      </div>
    </div>
  );
}