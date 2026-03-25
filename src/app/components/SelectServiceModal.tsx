import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Star, ChevronRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../utils/supabase';
import { useApp } from '../contexts/AppContext';
import { CustomSubscriptionModal } from './CustomSubscriptionModal';

interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  is_popular: boolean;
  pricing_plans: Array<{
    id: string;
    name: string;
    price: number;
    currency: string;
    billingCycle: 'monthly' | 'yearly';
  }>;
}

interface SelectServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SelectServiceModal({ isOpen, onClose }: SelectServiceModalProps) {
  const { addSubscription, getCurrencySymbol, convertPrice, subscriptions, t } = useApp();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showPopularOnly, setShowPopularOnly] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [nextBilling, setNextBilling] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(isOpen);

  const baseCategories = [
    { value: 'all', label: t('Все категории') },
    { value: 'Кино и сериалы', label: t('Кино и сериалы') },
    { value: 'Музыка', label: t('Музыка') },
    { value: 'Развлечения', label: t('Развлечения') },
    { value: 'Мульти подписки', label: t('Мульти подписки') },
    { value: 'Здоровье', label: t('Здоровье') },
    { value: 'Интернет и телеком', label: t('Интернет и телеком') },
    { value: 'Бизнес и маркетинг', label: t('Бизнес и маркетинг') },
    { value: 'Доставка', label: t('Доставка') },
    { value: 'Социальные сети', label: t('Социальные сети') },
    { value: 'Облачные хранилища', label: t('Облачные хранилища') },
    { value: 'Кибербезопасность', label: t('Кибербезопасность') },
    { value: 'Книги', label: t('Книги') },
    { value: 'Игры и стриминг', label: t('Игры и стриминг') },
    { value: 'Разработка и дизайн', label: t('Разработка и дизайн') },
    { value: 'Образование', label: t('Образование') },
    { value: 'Финансы', label: t('Финансы') },
    { value: 'Шопинг', label: t('Шопинг') }
  ];

  // Add custom categories from user's subscriptions
  const baseCategoryValues = baseCategories.slice(1).map(c => c.value);
  const customCategories = [...new Set(
    subscriptions
      .map(sub => sub.category)
      .filter(cat => !baseCategoryValues.includes(cat) && cat !== 'Своя категория')
  )].map(cat => ({ value: cat, label: cat }));

  const categories = [...baseCategories, ...customCategories];

  useEffect(() => {
    if (isOpen) {
      loadServices();
    }
  }, [isOpen]);

  const loadServices = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('is_popular', { ascending: false })
        .order('name', { ascending: true });

      if (error) throw error;

      setServices(data || []);
    } catch (error) {
      console.error('Error loading services:', error);
      toast.error(t('errorLoadingServices'));
    } finally {
      setIsLoading(false);
    }
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    const matchesPopular = !showPopularOnly || service.is_popular;
    return matchesSearch && matchesCategory && matchesPopular;
  });

  const getPricingPlansText = (count: number) => {
    if (count === 1) {
      return t('pricingPlans_one').replace('{count}', count.toString());
    } else if (count >= 2 && count <= 4) {
      return t('pricingPlans_few').replace('{count}', count.toString());
    } else {
      return t('pricingPlans').replace('{count}', count.toString());
    }
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    // Auto-select first plan if only one exists
    if (service.pricing_plans && service.pricing_plans.length === 1) {
      setSelectedPlan(service.pricing_plans[0]);
    }
  };

  const handleBack = () => {
    setSelectedService(null);
    setSelectedPlan(null);
    setNextBilling('');
  };

  const handleSubmit = async () => {
    if (!selectedService || !selectedPlan || !nextBilling) {
      toast.error(t('fillAllFields'));
      return;
    }

    setIsSubmitting(true);
    try {
      // Store price in RUB (base currency) - conversion happens only on display
      await addSubscription({
        name: selectedService.name,
        category: selectedService.category,
        price: selectedPlan.price, // Keep price in RUB as stored in database
        billingCycle: selectedPlan.billingCycle,
        nextBilling,
        status: 'active',
        icon: selectedService.icon // Add icon from selected service
      });

      toast.success(t('subscriptionAddedSuccess'));
      handleClose();
    } catch (error) {
      console.error('Error adding subscription:', error);
      toast.error(t('errorAddingSubscription'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedService(null);
    setSelectedPlan(null);
    setNextBilling('');
    setSearchQuery('');
    setSelectedCategory('all');
    setShowPopularOnly(false);
    onClose();
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && !isCustomModalOpen && (
          <motion.div
            key="select-service-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-xl p-6 shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {selectedService ? t('setupSubscription') : t('selectService')}
                </h2>
                <div className="flex items-center gap-2">
                  {!selectedService && (
                    <button
                      onClick={() => {
                        setIsCustomModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      {t('customSubscription')}
                    </button>
                  )}
                  <button
                    onClick={handleClose}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Service List View */}
              {!selectedService && (
                <div className="flex-1 flex flex-col min-h-0">
                  {/* Search and Filter */}
                  <div className="space-y-4 mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('searchServices')}
                        className="w-full pl-10 pr-4 py-3 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="flex-1 px-4 py-3 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {categories.map(cat => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>

                      <label className="flex items-center gap-2 px-4 py-3 rounded-lg bg-input border border-border cursor-pointer hover:bg-muted transition-colors">
                        <input
                          type="checkbox"
                          checked={showPopularOnly}
                          onChange={(e) => setShowPopularOnly(e.target.checked)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm whitespace-nowrap">⭐ {t('popular')}</span>
                      </label>
                    </div>
                  </div>

                  {/* Services Grid */}
                  <div className="flex-1 overflow-y-auto pr-2">
                    {isLoading ? (
                      <div className="flex items-center justify-center h-64">
                        <div className="text-muted-foreground">Загрузка сервисов...</div>
                      </div>
                    ) : filteredServices.length === 0 ? (
                      <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                          <p className="text-muted-foreground mb-2">Сервисы не найдены</p>
                          <p className="text-sm text-muted-foreground">
                            Попробуйте изменить параметры поиска
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredServices.map((service) => (
                          <motion.button
                            key={service.id}
                            onClick={() => handleServiceSelect(service)}
                            whileTap={{ scale: 0.98 }}
                            className="p-4 rounded-lg bg-muted border-2 border-border hover:border-primary transition-colors text-left group"
                          >
                            <div className="flex items-start gap-3">
                              {service.icon && (
                                <div className="w-12 h-12 rounded-lg overflow-hidden border border-border flex-shrink-0">
                                  <img
                                    src={service.icon}
                                    alt={service.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold truncate">
                                    {service.name}
                                  </h3>
                                  {service.is_popular && (
                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {service.category}
                                </p>
                                {service.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {service.description}
                                  </p>
                                )}
                                {service.pricing_plans && service.pricing_plans.length > 0 && (
                                  <div className="mt-2 flex items-center gap-1 text-xs text-primary">
                                    <span>
                                      {getPricingPlansText(service.pricing_plans.length)}
                                    </span>
                                    <ChevronRight className="w-3 h-3" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Service Details View */}
              {selectedService && (
                <div className="flex-1 flex flex-col min-h-0">
                  <button
                    onClick={handleBack}
                    className="mb-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                    {t('backToList')}
                  </button>

                  <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                    {/* Service Info */}
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-muted">
                      {selectedService.icon && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden border border-border flex-shrink-0">
                          <img
                            src={selectedService.icon}
                            alt={selectedService.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-bold">{selectedService.name}</h3>
                          {selectedService.is_popular && (
                            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {selectedService.category}
                        </p>
                        {selectedService.description && (
                          <p className="text-sm">{selectedService.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Select Plan */}
                    {selectedService.pricing_plans && selectedService.pricing_plans.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium mb-3">
                          {t('selectPlan')} <span className="text-destructive">*</span>
                        </label>
                        <div className="space-y-2">
                          {selectedService.pricing_plans.map((plan) => (
                            <button
                              key={plan.id}
                              onClick={() => setSelectedPlan(plan)}
                              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                                selectedPlan?.id === plan.id
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:border-muted-foreground'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium">{plan.name}</div>
                                  <div className="text-sm text-muted-foreground mt-1">
                                    {plan.billingCycle === 'monthly' ? t('monthly') : t('yearly')}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold">
                                    {plan.price} {plan.currency === 'RUB' ? '₽' : plan.currency === 'USD' ? '$' : plan.currency === 'EUR' ? '' : plan.currency === 'CNY' ? '¥' : 'Br'}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    / {plan.billingCycle === 'monthly' ? 'мес' : 'год'}
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Next Billing Date */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t('nextBillingLabel')} <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="date"
                        value={nextBilling}
                        onChange={(e) => setNextBilling(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-3 justify-end mt-6 pt-6 border-t border-border">
                    <button
                      onClick={handleBack}
                      className="px-6 py-3 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors"
                    >
                      Назад
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting || !selectedPlan || !nextBilling}
                      className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {isSubmitting ? t('restoring') : t('createSubscription')}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Subscription Modal */}
      <CustomSubscriptionModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
      />
    </>
  );
}