import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Trash2, Upload, Star } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../utils/supabase';

interface Pricing {
  id: string;
  name: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
}

interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  is_popular: boolean;
  pricing_plans: Pricing[];
}

interface EditServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service | null;
  onUpdate: (service: Service) => void;
}

export function EditServiceModal({ isOpen, onClose, service, onUpdate }: EditServiceModalProps) {
  const [serviceName, setServiceName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');
  const [isPopular, setIsPopular] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pricingPlans, setPricingPlans] = useState<Pricing[]>([]);

  const categories = [
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

  useEffect(() => {
    if (service) {
      setServiceName(service.name);
      setCategory(service.category);
      setDescription(service.description || '');
      setIcon(service.icon || '');
      setIsPopular(service.is_popular || false);
      setPricingPlans(service.pricing_plans || [{
        id: '1',
        name: 'Базовый',
        price: 0,
        currency: 'RUB',
        billingCycle: 'monthly'
      }]);
    }
  }, [service]);

  const handleAddPricingPlan = () => {
    setPricingPlans([...pricingPlans, {
      id: Date.now().toString(),
      name: '',
      price: 0,
      currency: 'RUB',
      billingCycle: 'monthly'
    }]);
  };

  const handleRemovePricingPlan = (id: string) => {
    if (pricingPlans.length > 1) {
      setPricingPlans(pricingPlans.filter(plan => plan.id !== id));
    }
  };

  const handlePricingChange = (id: string, field: keyof Pricing, value: any) => {
    setPricingPlans(pricingPlans.map(plan =>
      plan.id === id ? { ...plan, [field]: value } : plan
    ));
  };

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setIcon(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!serviceName || !category || !service) {
      toast.error('Заполните обязательные поля');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Check if pricing has changed
      const oldPricingPlans = service.pricing_plans || [];
      const newPricingPlans = pricingPlans.filter(plan => plan.name && plan.price > 0);
      const priceChanged = JSON.stringify(oldPricingPlans) !== JSON.stringify(newPricingPlans);
      
      const updatedService = {
        name: serviceName,
        category,
        description,
        icon,
        is_popular: isPopular,
        pricing_plans: newPricingPlans
      };

      const { data, error } = await supabase
        .from('services')
        .update(updatedService)
        .eq('id', service.id)
        .select()
        .single();

      if (error) throw error;

      // If price changed, update user subscriptions and notify them
      if (priceChanged) {
        console.log('Price changed, updating subscriptions and creating notifications...');
        
        // Find all subscriptions using this service
        const { data: affectedSubscriptions, error: subsError } = await supabase
          .from('subscriptions')
          .select('*, user_id')
          .eq('name', service.name);
        
        if (subsError) {
          console.error('Error finding affected subscriptions:', subsError);
        } else if (affectedSubscriptions && affectedSubscriptions.length > 0) {
          console.log(`Found ${affectedSubscriptions.length} affected subscriptions`);
          
          // Update subscription prices and create notifications
          for (const sub of affectedSubscriptions) {
            // Find matching pricing plan
            const matchingPlan = newPricingPlans.find(
              plan => plan.billingCycle === sub.billing_cycle
            );
            
            if (matchingPlan && matchingPlan.price !== parseFloat(sub.price)) {
              // Update subscription price
              const { error: updateError } = await supabase
                .from('subscriptions')
                .update({ price: matchingPlan.price })
                .eq('id', sub.id);
              
              if (updateError) {
                console.error('Error updating subscription price:', updateError);
              } else {
                // Create notification for user
                const { error: notifError } = await supabase
                  .from('notifications')
                  .insert({
                    user_id: sub.user_id,
                    type: 'price_changed',
                    title: 'notification_price_changed_title',
                    message: 'notification_price_changed_message',
                    metadata: {
                      subscription_name: sub.name,
                      old_price: parseFloat(sub.price),
                      new_price: matchingPlan.price,
                      currency: matchingPlan.currency
                    },
                    is_read: false
                  });
                
                if (notifError) {
                  console.error('Error creating notification:', notifError);
                } else {
                  console.log(`Created price change notification for user ${sub.user_id}`);
                }
              }
            }
          }
        }
      }

      toast.success('Сервис успешно обновлен');
      onUpdate(data);
      handleClose();
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error('Ошибка при обновлении сервиса');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setServiceName('');
    setCategory('');
    setDescription('');
    setIcon('');
    setIsPopular(false);
    setPricingPlans([]);
    onClose();
  };

  if (!isOpen || !service) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card border border-border rounded-xl p-6 shadow-2xl max-w-3xl w-full my-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Редактировать сервис</h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            {/* Service Name */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Название сервиса <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="Netflix, Spotify, etc."
                className="w-full px-4 py-3 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Категория <span className="text-destructive">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Выберите к��тегорию</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Icon Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">Иконка сервиса</label>
              <div className="flex items-center gap-4">
                {icon && (
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-border">
                    <img src={icon} alt="Icon" className="w-full h-full object-cover" />
                  </div>
                )}
                <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-muted hover:bg-muted/70 cursor-pointer transition-colors">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {icon ? 'Изменить иконку' : 'Загрузить иконку'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleIconUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">Краткое описание</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Описание сервиса..."
                rows={3}
                className="w-full px-4 py-3 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            {/* Popular Checkbox */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPopular}
                  onChange={(e) => setIsPopular(e.target.checked)}
                  className="w-5 h-5 rounded border-border"
                />
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium">Популярный сервис</span>
                </div>
              </label>
            </div>

            {/* Pricing Plans */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium">Тарифы</label>
                <button
                  onClick={handleAddPricingPlan}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Добавить тариф
                </button>
              </div>

              <div className="space-y-4">
                {pricingPlans.map((plan, index) => (
                  <div key={plan.id} className="p-4 rounded-lg bg-muted border border-border">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium mb-2">Название тарифа</label>
                          <input
                            type="text"
                            value={plan.name}
                            onChange={(e) => handlePricingChange(plan.id, 'name', e.target.value)}
                            placeholder="Базовый, Премиум..."
                            className="w-full px-3 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-2">Цена</label>
                          <input
                            type="number"
                            value={plan.price}
                            onChange={(e) => handlePricingChange(plan.id, 'price', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            className="w-full px-3 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-2">Валюта</label>
                          <select
                            value={plan.currency}
                            onChange={(e) => handlePricingChange(plan.id, 'currency', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                          >
                            <option value="RUB">₽ RUB</option>
                            <option value="USD">$ USD</option>
                            <option value="EUR">€ EUR</option>
                            <option value="CNY">¥ CNY</option>
                            <option value="BYN">Br BYN</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-2">Период</label>
                          <select
                            value={plan.billingCycle}
                            onChange={(e) => handlePricingChange(plan.id, 'billingCycle', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                          >
                            <option value="monthly">Месяц</option>
                            <option value="yearly">Год</option>
                          </select>
                        </div>
                      </div>
                      {pricingPlans.length > 1 && (
                        <button
                          onClick={() => handleRemovePricingPlan(plan.id)}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors mt-6"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-6 pt-6 border-t border-border">
            <button
              onClick={handleClose}
              className="px-6 py-3 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}