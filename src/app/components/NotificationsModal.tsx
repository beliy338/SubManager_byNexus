import React, { useState, useEffect } from 'react';
import { X, Bell, Calendar, Settings as SettingsIcon, UserCircle, CreditCard, Check, Trash2, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../contexts/AppContext';
import { supabase } from '../utils/supabase';
import { toast } from 'sonner';
import { ScrollArea } from './ui/scroll-area';

interface Notification {
  id: string;
  user_id: string;
  type: 'billing_1day' | 'billing_3day' | 'subscription_added' | 'subscription_deleted' | 'subscription_updated' | 'settings_updated' | 'price_changed' | 'profile_updated' | 'settings_updated';
  title: string;
  message: string;
  metadata?: any;
  is_read: boolean;
  created_at: string;
}

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
  const { user, t, settings, addSubscription } = useApp();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user?.id) {
      loadNotifications();
    }
  }, [isOpen, user?.id]);

  // Listen for real-time notification events
  useEffect(() => {
    const handleNotificationAdded = () => {
      console.log('Notification added event received');
      loadNotifications();
    };

    const handleNotificationUpdated = () => {
      console.log('Notification updated event received');
      loadNotifications();
    };

    const handleNotificationDeleted = () => {
      console.log('Notification deleted event received');
      loadNotifications();
    };

    window.addEventListener('notification-added', handleNotificationAdded);
    window.addEventListener('notification-updated', handleNotificationUpdated);
    window.addEventListener('notification-deleted', handleNotificationDeleted);

    return () => {
      window.removeEventListener('notification-added', handleNotificationAdded);
      window.removeEventListener('notification-updated', handleNotificationUpdated);
      window.removeEventListener('notification-deleted', handleNotificationDeleted);
    };
  }, [user?.id]);

  const loadNotifications = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast.error('Ошибка при загрузке уведомлений');
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      toast.success('Все уведомления прочитаны');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Ошибка');
    }
  };

  const deleteAllNotifications = async () => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setNotifications([]);
      toast.success(t('allNotificationsDeleted') || 'Все уведомления удалены');
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      toast.error('Ошибка при удалении уведомлений');
    }
  };

  const restoreSubscription = async (notification: Notification) => {
    if (!notification.metadata?.deleted_subscription) {
      toast.error('Данные подписки не найдены');
      return;
    }

    try {
      setRestoringId(notification.id);
      const deletedSub = notification.metadata.deleted_subscription;
      
      // Restore subscription
      await addSubscription({
        name: deletedSub.name,
        category: deletedSub.category,
        price: deletedSub.price,
        billingCycle: deletedSub.billingCycle,
        nextBilling: deletedSub.nextBilling,
        status: deletedSub.status,
        icon: deletedSub.icon,
        isCustom: deletedSub.isCustom,
        customLogo: deletedSub.customLogo
      });

      toast.success(`${t('subscriptionRestored')} "${deletedSub.name}"`);
      
      // Remove notification after restore
      await supabase
        .from('notifications')
        .delete()
        .eq('id', notification.id);
      
      setNotifications(notifications.filter(n => n.id !== notification.id));
    } catch (error) {
      console.error('Error restoring subscription:', error);
      toast.error('Ошибка при восстановлении подписки');
    } finally {
      setRestoringId(null);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'billing_1day':
      case 'billing_3day':
        return <CreditCard className="w-5 h-5" />;
      case 'subscription_added':
      case 'subscription_updated':
        return <Bell className="w-5 h-5" />;
      case 'subscription_deleted':
        return <X className="w-5 h-5 text-black" />;
      case 'profile_updated':
        return <UserCircle className="w-5 h-5" />;
      case 'settings_updated':
      case 'price_changed':
        return <SettingsIcon className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'billing_1day':
        return 'from-red-500 to-orange-500';
      case 'billing_3day':
        return 'from-yellow-500 to-orange-500';
      case 'subscription_added':
        return 'from-green-500 to-emerald-500';
      case 'subscription_deleted':
      case 'subscription_updated':
        return 'from-white to-white';
      case 'profile_updated':
      case 'settings_updated':
      case 'price_changed':
        return 'from-blue-500 to-cyan-500';
      default:
        return 'from-primary to-accent';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return t('justNow');
    if (diffMins < 60) return `${diffMins} ${t('minutesAgo')}`;
    if (diffHours < 24) return `${diffHours} ${t('hoursAgo')}`;
    if (diffDays < 7) return `${diffDays} ${t('daysAgo')}`;
    
    return date.toLocaleDateString(settings.language === 'ru' ? 'ru-RU' : settings.language === 'en' ? 'en-US' : settings.language === 'by' ? 'ru-RU' : 'zh-CN', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card border border-border rounded-2xl w-full max-w-2xl shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-accent">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{t('notifications')}</h2>
              <p className="text-sm text-muted-foreground">
                {notifications.filter(n => !n.is_read).length} {t('unreadNotifications')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {notifications.some(n => !n.is_read) && (
              <button
                onClick={markAllAsRead}
                className={`px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/70 transition-colors flex items-center gap-2 ${
                  settings.language === 'be' ? 'text-xs' : 'text-sm'
                }`}
              >
                <Check className="w-4 h-4" />
                {t('markAllAsRead')}
              </button>
            )}
            <button
              onClick={deleteAllNotifications}
              className="px-3 py-1.5 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {t('deleteAllNotifications')}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-[500px] p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="w-16 h-16 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium text-muted-foreground">{t('noNotifications')}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {t('noNotificationsDescription')}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl border transition-all ${
                    notification.is_read
                      ? 'bg-card border-border opacity-60'
                      : 'bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20 hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${getNotificationColor(notification.type)} flex-shrink-0`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div 
                        className="cursor-pointer"
                        onClick={() => !notification.is_read && markAsRead(notification.id)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-sm">{t(notification.title)}</h3>
                          {!notification.is_read && (
                            <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1"></span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {t(notification.message)}
                          {notification.metadata?.subscription_name && ` "${notification.metadata.subscription_name}"`}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDate(notification.created_at)}
                        </p>
                      </div>
                      
                      {/* Restore button for deleted subscriptions */}
                      {notification.type === 'subscription_deleted' && notification.metadata?.deleted_subscription && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            restoreSubscription(notification);
                          }}
                          disabled={restoringId === notification.id}
                          className="mt-3 px-3 py-1.5 text-sm rounded-lg bg-green-500 hover:bg-green-600 transition-colors flex items-center gap-2 disabled:opacity-50 text-white"
                        >
                          {restoringId === notification.id ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                              {t('restoring')}
                            </>
                          ) : (
                            <>
                              <RotateCcw className="w-4 h-4" />
                              {t('restore')}
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>
      </motion.div>
    </div>
  );
}