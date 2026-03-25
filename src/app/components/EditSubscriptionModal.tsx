import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { toast } from 'sonner';

interface EditSubscriptionModalProps {
  subscription: any;
  onClose: () => void;
}

export function EditSubscriptionModal({ subscription, onClose }: EditSubscriptionModalProps) {
  const { t, updateSubscription, getCurrencySymbol, convertPrice, convertToRub, settings } = useApp();
  
  // Convert price from RUB (stored) to user's currency for display
  const displayPrice = convertPrice(subscription.price);
  
  // Check if user can edit all fields (only for custom subscriptions)
  const canEditAllFields = subscription.isCustom === true;
  
  const [formData, setFormData] = useState({
    name: subscription.name,
    category: subscription.category,
    price: displayPrice.toFixed(2),
    billingCycle: subscription.billingCycle,
    nextBilling: subscription.nextBilling,
    status: subscription.status
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Convert price from user's currency back to RUB for storage
      const priceInUserCurrency = parseFloat(formData.price);
      const priceInRub = convertToRub(priceInUserCurrency, settings.currency);
      
      // For non-custom subscriptions, only update the nextBilling field
      const updateData = canEditAllFields 
        ? {
            name: formData.name,
            category: formData.category,
            price: priceInRub,
            billingCycle: formData.billingCycle,
            nextBilling: formData.nextBilling,
            status: formData.status
          }
        : {
            nextBilling: formData.nextBilling
          };
      
      await updateSubscription(subscription.id, updateData);

      toast.success(`✅ ${t('subscriptionUpdated')}`, {
        style: {
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: '#ffffff',
          border: '1px solid #059669',
        },
      });
      onClose();
    } catch (error) {
      toast.error(t('error'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{t('edit')} {subscription.name}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!canEditAllFields && (
            <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-sm">
              <p className="text-blue-400">
                ℹ️ {t('catalogSubscriptionTip')}
              </p>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-2">{t('serviceName')}</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={!canEditAllFields}
              className="w-full px-4 py-3 rounded-lg bg-input-background dark:bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('category')}</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              disabled={!canEditAllFields}
              className="w-full px-4 py-3 rounded-lg bg-input-background dark:bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="streaming">{t('streaming')}</option>
              <option value="software">{t('software')}</option>
              <option value="delivery">{t('delivery')}</option>
              <option value="cloud">{t('cloud')}</option>
              <option value="other">{t('other')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t('price')} ({getCurrencySymbol()})
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              disabled={!canEditAllFields}
              className="w-full px-4 py-3 rounded-lg bg-input-background dark:bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('billingCycle')}</label>
            <select
              value={formData.billingCycle}
              onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
              disabled={!canEditAllFields}
              className="w-full px-4 py-3 rounded-lg bg-input-background dark:bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="monthly">{t('monthly')}</option>
              <option value="yearly">{t('yearly')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('nextBilling')}</label>
            <input
              type="date"
              required
              value={formData.nextBilling}
              onChange={(e) => setFormData({ ...formData, nextBilling: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-input-background dark:bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              {t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}