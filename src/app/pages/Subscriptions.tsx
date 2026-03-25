import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { Pencil, Trash2, Plus, Lightbulb, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { AddSubscriptionModal } from '../components/AddSubscriptionModal';
import { EditSubscriptionModal } from '../components/EditSubscriptionModal';
import { AlternativesModal } from '../components/AlternativesModal';
import { SelectServiceModal } from '../components/SelectServiceModal';
import { AddServiceModal } from '../components/AddServiceModal';
import { EditServiceModal } from '../components/EditServiceModal';
import { ConfirmDeleteDialog } from '../components/ConfirmDeleteDialog';
import { ServiceLogo } from '../components/ServiceLogo';
import { CustomSubscriptionModal } from '../components/CustomSubscriptionModal';
import { supabase } from '../utils/supabase';
import { isOwner } from '../utils/roles';

export function Subscriptions() {
  const { t, subscriptions, deleteSubscription, getCurrencySymbol, convertPrice, user } = useApp();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<any>(null);
  const [editingCustomSubscription, setEditingCustomSubscription] = useState<any>(null);
  const [alternativesSubscription, setAlternativesSubscription] = useState<any>(null);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; id: string; name: string }>({ 
    isOpen: false, 
    id: '', 
    name: '' 
  });
  
  // For owners: service management
  const [services, setServices] = useState<any[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [serviceDeleteDialog, setServiceDeleteDialog] = useState<{ isOpen: boolean; id: string; name: string }>({ 
    isOpen: false, 
    id: '', 
    name: '' 
  });
  const [showPopularOnly, setShowPopularOnly] = useState(false);
  const userIsOwner = isOwner(user);

  useEffect(() => {
    if (userIsOwner) {
      loadServices();
    }
  }, [userIsOwner]);

  const loadServices = async () => {
    setIsLoadingServices(true);
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error loading services:', error);
      toast.error('Ошибка при загрузке сервисов');
    } finally {
      setIsLoadingServices(false);
    }
  };

  const handleDeleteService = async (id: string, name: string) => {
    setServiceDeleteDialog({ isOpen: true, id, name });
  };

  const handleServiceAdded = (newService: any) => {
    setServices([newService, ...services]);
  };

  const handleServiceUpdated = (updatedService: any) => {
    setServices(services.map(s => s.id === updatedService.id ? updatedService : s));
  };

  const handleDelete = async (id: string, name: string) => {
    setDeleteDialog({ isOpen: true, id, name });
  };

  const confirmDelete = async () => {
    try {
      await deleteSubscription(deleteDialog.id);
      toast.success(t('subscriptionDeleted'));
    } catch (error) {
      toast.error(t('error'));
    }
  };

  const confirmServiceDelete = async () => {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceDeleteDialog.id);

      if (error) throw error;

      setServices(services.filter(s => s.id !== serviceDeleteDialog.id));
      toast.success('Сервис успешно удален');
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Ошибка при уалении с��рвиса');
    }
  };

  const filteredSubscriptions = filter === 'all'
    ? subscriptions
    : subscriptions.filter(sub => sub.category === filter);

  const filteredServices = filter === 'all'
    ? services
    : services.filter(service => service.category === filter);

  const baseCategories = [
    'Кино и сериалы', 'Музыка', 'Развлечения', 'Мульти подписки', 'Здоровье',
    'Интернет и телеком', 'Бизнес и маркетинг', 'Доставка',
    'Социальные сети', 'Облачные хранилища', 'Кибербезопасность',
    'Книги', 'Игры и стриминг', 'Разработка и дизайн', 'Образование', 'Финансы', 'Шопинг'
  ];

  // Add custom categories from user's subscriptions
  const customCategories = [...new Set(
    subscriptions
      .map(sub => sub.category)
      .filter(cat => !baseCategories.includes(cat))
  )];

  const categories = ['all', ...baseCategories, ...customCategories];

  const serviceCategories = ['all', ...baseCategories];

  // Render for OWNERS - Service Management
  if (userIsOwner) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">Управление сервисами</h1>
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-green-500 to-blue-500 text-white text-sm font-bold">
                {services.length} {services.length === 1 ? 'сервис' : services.length < 5 ? 'сервиса' : 'сервисов'}
              </span>
            </div>
            <p className="text-muted-foreground">
              Создавайте и редактируйте сервисы для всех пользователей
            </p>
          </div>
          <button
            onClick={() => setIsAddServiceModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-5 h-5" />
            Добавить сервис
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-3 mb-6">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Поиск сервисов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-input-background dark:bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
            />
          </div>

          {/* Category Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-3 rounded-lg bg-input-background dark:bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Все категории</option>
            {serviceCategories.filter(c => c !== 'all').map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          {/* Popular Filter */}
          <label className="flex items-center gap-2 px-4 py-3 rounded-lg bg-input-background dark:bg-input border border-border cursor-pointer hover:bg-muted transition-colors">
            <input
              type="checkbox"
              checked={showPopularOnly}
              onChange={(e) => setShowPopularOnly(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm whitespace-nowrap">⭐ Популярное</span>
          </label>
        </div>

        {/* Services Table */}
        {isLoadingServices ? (
          <div className="bg-card border border-border rounded-xl p-12 shadow-lg text-center">
            <p className="text-muted-foreground">Загрузка сервисов...</p>
          </div>
        ) : filteredServices.filter(service => 
          (!showPopularOnly || service.is_popular) && 
          service.name.toLowerCase().includes(searchQuery.toLowerCase())
        ).length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 shadow-lg text-center">
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? `Сервисы с названием "${searchQuery}" не найдены`
                : filter === 'all' 
                  ? 'Сервисов пока нет. Добавьте первый сервис!' 
                  : `Нет сервисов в категории "${filter}".`
              }
            </p>
            <button
              onClick={() => setIsAddServiceModalOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Добавить сервис
            </button>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left p-4 font-medium">Сервис</th>
                    <th className="text-left p-4 font-medium">Категория</th>
                    <th className="text-left p-4 font-medium">Тарифы</th>
                    <th className="text-left p-4 font-medium">Популярный</th>
                    <th className="text-left p-4 font-medium">Создан</th>
                    <th className="text-left p-4 font-medium">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredServices
                    .filter(service => 
                      (!showPopularOnly || service.is_popular) && 
                      service.name.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((service, index) => (
                    <motion.tr
                      key={service.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-border hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <ServiceLogo logo={service.icon} name={service.name} size="md" />
                          <div>
                            <div className="font-medium">{service.name}</div>
                            {service.description && (
                              <div className="text-sm text-muted-foreground line-clamp-1">
                                {service.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm whitespace-nowrap">
                          {service.category}
                        </span>
                      </td>
                      <td className="p-4">
                        {service.pricing_plans?.length || 0} {service.pricing_plans?.length === 1 ? 'тариф' : 'тарифа'}
                      </td>
                      <td className="p-4">
                        {service.is_popular ? (
                          <span className="text-yellow-500">★ Да</span>
                        ) : (
                          <span className="text-muted-foreground">Нет</span>
                        )}
                      </td>
                      <td className="p-4">
                        {new Date(service.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingService(service)}
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                            title="Редактировать"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteService(service.id, service.name)}
                            className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                            title="Удалить"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <AddServiceModal 
          isOpen={isAddServiceModalOpen} 
          onClose={() => setIsAddServiceModalOpen(false)} 
          onAdd={handleServiceAdded}
        />
        {editingService && (
          <EditServiceModal
            isOpen={!!editingService}
            onClose={() => setEditingService(null)}
            service={editingService}
            onUpdate={handleServiceUpdated}
          />
        )}
        <ConfirmDeleteDialog
          isOpen={serviceDeleteDialog.isOpen}
          onClose={() => setServiceDeleteDialog({ isOpen: false, id: '', name: '' })}
          onConfirm={confirmServiceDelete}
          title="Удаление сервиса"
          message={`Вы уверены, что хотите удалить сервис "${serviceDeleteDialog.name}"? Это также удалит все подписки пользователей на этот сервис.`}
        />
      </div>
    );
  }

  // Render for REGULAR USERS - User Subscriptions
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{t('subscriptions')}</h1>
            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-green-500 to-blue-500 text-white text-sm font-bold">
              {t('subscriptionsCount').replace('{count}', subscriptions.length.toString())}
            </span>
          </div>
          <p className="text-muted-foreground">
            {t('manageAllSubscriptions')}
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5" />
          {t('addSubscription')}
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-3 mb-6">
        {/* Search Bar */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('searchByName')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-input-background dark:bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Category Filter */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-3 rounded-lg bg-input-background dark:bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">{t('allCategories')}</option>
          {categories.filter(c => c !== 'all').map((category) => (
            <option key={category} value={category}>{t(category)}</option>
          ))}
        </select>
      </div>

      {/* Subscriptions Table */}
      {filteredSubscriptions.filter(sub => 
        sub.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 shadow-lg text-center">
          <p className="text-muted-foreground mb-4">
            {searchQuery 
              ? `Подписки с названием "${searchQuery}" не найдены`
              : filter === 'all' 
                ? 'Подписок пока нет. Добавьте первую подписку!'
                : `Нет подписок в категории ${t(filter)}`
            }
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            {t('addSubscription')}
          </button>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-4 font-medium">{t('serviceName')}</th>
                  <th className="text-left p-4 font-medium">{t('category')}</th>
                  <th className="text-left p-4 font-medium">{t('price')}</th>
                  <th className="text-left p-4 font-medium">{t('billingCycle')}</th>
                  <th className="text-left p-4 font-medium">{t('nextBilling')}</th>
                  <th className="text-left p-4 font-medium">{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscriptions.filter(sub => 
                  sub.name.toLowerCase().includes(searchQuery.toLowerCase())
                ).map((sub, index) => (
                  <motion.tr
                    key={sub.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <ServiceLogo logo={sub.icon} name={sub.name} size="md" customLogo={sub.customLogo} />
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{sub.name}</span>
                          {sub.isCustom && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-green-500 to-cyan-500 text-white border-none">
                              {t('custom')}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm whitespace-nowrap">
                        {t(sub.category)}
                      </span>
                    </td>
                    <td className="p-4 font-bold">
                      {convertPrice(sub.price).toFixed(2)} {getCurrencySymbol()}
                    </td>
                    <td className="p-4">{t(sub.billingCycle)}</td>
                    <td className="p-4">{new Date(sub.nextBilling).toLocaleDateString()}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            if (sub.isCustom) {
                              setEditingCustomSubscription(sub);
                            } else {
                              setEditingSubscription(sub);
                            }
                          }}
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                          title={t('edit')}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(sub.id, sub.name)}
                          className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                          title={t('delete')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setAlternativesSubscription(sub)}
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                          title={t('alternatives')}
                        >
                          <Lightbulb className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <SelectServiceModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      {editingSubscription && (
        <EditSubscriptionModal
          subscription={editingSubscription}
          onClose={() => setEditingSubscription(null)}
        />
      )}
      <CustomSubscriptionModal
        isOpen={!!editingCustomSubscription}
        onClose={() => setEditingCustomSubscription(null)}
        editingSubscription={editingCustomSubscription}
      />
      <AlternativesModal
        isOpen={!!alternativesSubscription}
        subscription={alternativesSubscription}
        onClose={() => setAlternativesSubscription(null)}
      />
      <ConfirmDeleteDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, id: '', name: '' })}
        onConfirm={confirmDelete}
        title={t('deleteSubscription')}
        message={t('confirmDeleteSubscription')}
      />
    </div>
  );
}