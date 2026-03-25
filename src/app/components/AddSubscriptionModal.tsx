import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { toast } from 'sonner';

interface AddSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddSubscriptionModal({ isOpen, onClose }: AddSubscriptionModalProps) {
  const { t, addSubscription, getCurrencySymbol, convertToRub, settings } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    category: 'streaming',
    price: '',
    billingCycle: 'monthly' as 'monthly' | 'yearly',
    nextBilling: '',
    status: 'active'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Convert price from user's currency to RUB for storage
      const priceInUserCurrency = parseFloat(formData.price);
      const priceInRub = convertToRub(priceInUserCurrency, settings.currency);
      
      await addSubscription({
        ...formData,
        price: priceInRub
      });
      
      toast.success(t('subscriptionAdded'));
      setFormData({
        name: '',
        category: 'streaming',
        price: '',
        billingCycle: 'monthly',
        nextBilling: '',
        status: 'active'
      });
      onClose();
    } catch (error) {
      toast.error(t('error'));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{t('addSubscription')}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">{t('serviceName')}</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-input-background dark:bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Netflix, Spotify, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('category')}</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-input-background dark:bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="Кино и сериалы">Кино и сериалы</option>
              <option value="Музыка">Музыка</option>
              <option value="Развлечения">Развлечения</option>
              <option value="Мульти подписки">Мульти подписки</option>
              <option value="Здоровье">Здоровье</option>
              <option value="Интернет и телеком">Интернет и телеком</option>
              <option value="Бизнес и маркетинг">Бизнес и маркетинг</option>
              <option value="Доставка">Доставка</option>
              <option value="Социальные сети">Социальные сети</option>
              <option value="Облачные хранилища">Облачные хранилища</option>
              <option value="Кибербезопасность">Кибербезопасность</option>
              <option value="Книги">Книги</option>
              <option value="Игры и стриминг">Игры и стриминг</option>
              <option value="Разработка и дизайн">Разработка и дизайн</option>
              <option value="Образование">Образование</option>
              <option value="Финансы">Финансы</option>
              <option value="Шопинг">Шопинг</option>
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
              className="w-full px-4 py-3 rounded-lg bg-input-background dark:bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="9.99"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('billingCycle')}</label>
            <select
              value={formData.billingCycle}
              onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value as 'monthly' | 'yearly' })}
              className="w-full px-4 py-3 rounded-lg bg-input-background dark:bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary"
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