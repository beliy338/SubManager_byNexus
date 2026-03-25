import React, { useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { toast } from 'sonner';
import { supabase } from '../utils/supabase';

interface CustomSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingSubscription?: any; // Для режима редактирования
}

export function CustomSubscriptionModal({ isOpen, onClose, editingSubscription }: CustomSubscriptionModalProps) {
  const { user, getCurrencySymbol, convertToRub, convertPrice, settings, refreshData, updateSubscription, t } = useApp();
  const isEditMode = !!editingSubscription;

  const [formData, setFormData] = useState({
    name: editingSubscription?.name || '',
    category: editingSubscription?.category || 'Развлечения',
    price: editingSubscription ? convertPrice(editingSubscription.price).toFixed(2) : '',
    billingCycle: (editingSubscription?.billingCycle || 'monthly') as 'monthly' | 'yearly',
    nextBilling: editingSubscription?.nextBilling || '',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>(editingSubscription?.customLogo || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCustomCategoryInput, setShowCustomCategoryInput] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');
  
  // Reset form when subscription changes
  useEffect(() => {
    if (editingSubscription) {
      const isCustomCategory = !categories.slice(1).includes(editingSubscription.category);
      setFormData({
        name: editingSubscription.name,
        category: isCustomCategory ? 'Своя категория' : editingSubscription.category,
        price: convertPrice(editingSubscription.price).toFixed(2),
        billingCycle: editingSubscription.billingCycle,
        nextBilling: editingSubscription.nextBilling,
      });
      setLogoPreview(editingSubscription.customLogo || '');
      setLogoFile(null);
      if (isCustomCategory) {
        setShowCustomCategoryInput(true);
        setCustomCategoryName(editingSubscription.category);
      } else {
        setShowCustomCategoryInput(false);
        setCustomCategoryName('');
      }
    } else {
      setFormData({
        name: '',
        category: 'Развлечения',
        price: '',
        billingCycle: 'monthly',
        nextBilling: '',
      });
      setLogoPreview('');
      setLogoFile(null);
      setShowCustomCategoryInput(false);
      setCustomCategoryName('');
    }
  }, [editingSubscription]);

  const categories = [
    'Своя категория',
    'Кино и сериалы',
    'Музыка',
    'Развлечения',
    'Мульти подписки',
    'Здоровье',
    'Интернет и телеком',
    'Бизнес и маркетинг',
    'Доставка',
    'Социальные сети',
    'Облачные хранилища',
    'Кибербезопасность',
    'Книги',
    'Игры и стриминг',
    'Разработка и дизайн',
    'Образование',
    'Финансы',
    'Шопинг'
  ];

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t('fileSizeError'));
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error(t('uploadImageError'));
        return;
      }

      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user?.id) {
      toast.error('Вы не авторизованы');
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert price to RUB
      const priceInUserCurrency = parseFloat(formData.price);
      const priceInRub = convertToRub(priceInUserCurrency, settings.currency);
      
      // Use custom category name if custom category is selected
      const finalCategory = showCustomCategoryInput ? customCategoryName : formData.category;

      if (isEditMode) {
        // Update existing subscription
        const { data, error } = await supabase
          .from('subscriptions')
          .update({
            name: formData.name,
            category: finalCategory,
            price: priceInRub,
            billing_cycle: formData.billingCycle,
            next_billing: formData.nextBilling,
            custom_logo: logoPreview || null, // Store base64 preview instead of uploading
          })
          .eq('id', editingSubscription.id)
          .select()
          .single();

        if (error) throw error;

        // Update notification
        await supabase.from('notifications').update({
          type: 'subscription_updated',
          title: 'Подписка обновлена',
          message: `Вы обновили кастомную подписку "${formData.name}"`,
          metadata: { subscription_id: data.id },
          is_read: false
        }).eq('metadata.subscription_id', editingSubscription.id);

        toast.success('Кастомная подписка обновлена!');
        
        // Reset form
        setFormData({
          name: '',
          category: 'Развлечения',
          price: '',
          billingCycle: 'monthly',
          nextBilling: '',
        });
        setLogoFile(null);
        setLogoPreview('');
        setShowCustomCategoryInput(false);
        setCustomCategoryName('');
        onClose();

        // Reload page to show new subscription
        refreshData();
      } else {
        // Create custom subscription without logo upload for now
        const { data, error } = await supabase
          .from('subscriptions')
          .insert({
            user_id: user.id,
            name: formData.name,
            category: finalCategory,
            price: priceInRub,
            billing_cycle: formData.billingCycle,
            next_billing: formData.nextBilling,
            status: 'active',
            is_custom: true,
            custom_logo: logoPreview || null, // Store base64 preview instead of uploading
          })
          .select()
          .single();

        if (error) throw error;

        // Create notification
        await supabase.from('notifications').insert({
          user_id: user.id,
          type: 'subscription_added',
          title: 'Подпска добавлена',
          message: `Вы добавили кастомную подписку "${formData.name}"`,
          metadata: { subscription_id: data.id },
          is_read: false
        });

        toast.success('Кастомная подписка добавлена!');
        
        // Reset form
        setFormData({
          name: '',
          category: 'Развлечения',
          price: '',
          billingCycle: 'monthly',
          nextBilling: '',
        });
        setLogoFile(null);
        setLogoPreview('');
        setShowCustomCategoryInput(false);
        setCustomCategoryName('');
        onClose();

        // Reload page to show new subscription
        refreshData();
      }
    } catch (error) {
      console.error('Error creating custom subscription:', error);
      toast.error('Ошибка при создании подписки');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{t('customSubscription')}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">{t('serviceLogo')}</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-muted overflow-hidden">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <label className="flex-1 cursor-pointer">
                <div className="px-4 py-3 rounded-lg bg-muted hover:bg-muted/70 transition-colors text-center">
                  <Upload className="w-5 h-5 inline-block mr-2" />
                  {t('uploadPhoto')}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('imageRecommendation')}
            </p>
          </div>

          {/* Service Name */}
          <div>
            <label className="block text-sm font-medium mb-2">{t('serviceNameLabel')}</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-input-background dark:bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder={t('serviceNamePlaceholder')}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-2">{t('category')}</label>
            <select
              value={showCustomCategoryInput ? 'Своя категория' : formData.category}
              onChange={(e) => {
                if (e.target.value === 'Своя категория') {
                  setShowCustomCategoryInput(true);
                  setFormData({ ...formData, category: 'Своя категория' });
                  setCustomCategoryName('');
                } else {
                  setShowCustomCategoryInput(false);
                  setFormData({ ...formData, category: e.target.value });
                  setCustomCategoryName('');
                }
              }}
              className="w-full px-4 py-3 rounded-lg bg-input-background dark:bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{t(cat)}</option>
              ))}
            </select>
          </div>

          {/* Custom Category Input */}
          {showCustomCategoryInput && (
            <div>
              <label className="block text-sm font-medium mb-2">Название категории</label>
              <input
                type="text"
                required
                value={customCategoryName}
                onChange={(e) => {
                  setCustomCategoryName(e.target.value);
                  setFormData({ ...formData, category: e.target.value });
                }}
                className="w-full px-4 py-3 rounded-lg bg-input-background dark:bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Введите название категории"
              />
            </div>
          )}

          {/* Price */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('priceLabel')} ({getCurrencySymbol()})
            </label>
            <input
              type="number"
              required
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-input-background dark:bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="0.00"
            />
          </div>

          {/* Billing Cycle */}
          <div>
            <label className="block text-sm font-medium mb-2">{t('billingPeriodLabel')}</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, billingCycle: 'monthly' })}
                className={`p-3 rounded-lg font-medium transition-all ${
                  formData.billingCycle === 'monthly'
                    ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground'
                    : 'bg-muted hover:bg-muted/70'
                }`}
              >
                {t('monthlyOption')}
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, billingCycle: 'yearly' })}
                className={`p-3 rounded-lg font-medium transition-all ${
                  formData.billingCycle === 'yearly'
                    ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground'
                    : 'bg-muted hover:bg-muted/70'
                }`}
              >
                {t('yearlyOption')}
              </button>
            </div>
          </div>

          {/* Next Billing Date */}
          <div>
            <label className="block text-sm font-medium mb-2">{t('nextBillingDateLabel')}</label>
            <input
              type="date"
              required
              value={formData.nextBilling}
              onChange={(e) => setFormData({ ...formData, nextBilling: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-input-background dark:bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isSubmitting
              ? (isEditMode ? t('updating') : t('creating'))
              : (isEditMode ? t('updateSubscription') : t('createSubscription'))
            }
          </button>
        </form>
      </div>
    </div>
  );
}