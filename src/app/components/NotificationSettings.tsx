import React, { useState, useEffect } from 'react';
import { Bell, Mail, AlertCircle, Settings2 } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { supabase } from '../utils/supabase';
import { useApp } from '../contexts/AppContext';

interface NotificationSettingsData {
  notify_before_payment: boolean;
  notify_days_before: number;
  notify_service_changes: boolean;
  notify_service_discontinued: boolean;
}

export function NotificationSettings() {
  const { user } = useApp();
  const [settings, setSettings] = useState<NotificationSettingsData>({
    notify_before_payment: true,
    notify_days_before: 1,
    notify_service_changes: true,
    notify_service_discontinued: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // If settings don't exist, create them
        if (error.code === 'PGRST116') {
          await createDefaultSettings();
        } else {
          console.error('Error loading notification settings:', error);
        }
      } else if (data) {
        setSettings({
          notify_before_payment: data.notify_before_payment,
          notify_days_before: data.notify_days_before,
          notify_service_changes: data.notify_service_changes,
          notify_service_discontinued: data.notify_service_discontinued,
        });
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createDefaultSettings = async () => {
    if (!user?.id || !user?.email) return;

    try {
      const { error } = await supabase
        .from('notification_settings')
        .insert([
          {
            user_id: user.id,
            email: user.email,
            ...settings,
          },
        ]);

      if (error) {
        console.error('Error creating default settings:', error);
        // Table might not exist yet
        if (error.code === '42P01') {
          toast.error('Таблица настроек не создана. Выполните SQL скрипт supabase-notifications-system.sql');
        }
      }
    } catch (error) {
      console.error('Error creating default settings:', error);
    }
  };

  const handleSave = async () => {
    if (!user?.id || !user?.email) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('notification_settings')
        .upsert(
          {
            user_id: user.id,
            email: user.email,
            ...settings,
          },
          { onConflict: 'user_id' }
        );

      if (error) throw error;

      toast.success('Настройки уведомлений сохранены');
    } catch (error: any) {
      console.error('Error saving notification settings:', error);

      if (error.code === '42P01') {
        toast.error('Таблица настроек не создана. Выполните SQL скрипт в Supabase Dashboard.');
      } else {
        toast.error('Ошибка при сохранении настроек');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-xl p-8 shadow-lg"
      >
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Загрузка настроек...</div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-8 shadow-lg mt-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary/10 rounded-lg">
          <Bell className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Уведомления на почту</h2>
          <p className="text-sm text-muted-foreground">
            Настройте email-уведомления о ваших подписках
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Payment Reminders */}
        <div className="p-6 bg-muted/50 rounded-lg border border-border">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold">Напоминания о списании</h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notify_before_payment}
                    onChange={(e) =>
                      setSettings({ ...settings, notify_before_payment: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Получайте напоминания о предстоящих списаниях средств по подпискам
              </p>

              {settings.notify_before_payment && (
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">
                    За сколько дней до списания отправлять уведомление:
                  </label>
                  <select
                    value={settings.notify_days_before}
                    onChange={(e) =>
                      setSettings({ ...settings, notify_days_before: parseInt(e.target.value) })
                    }
                    className="px-4 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value={1}>За 1 день</option>
                    <option value={2}>За 2 дня</option>
                    <option value={3}>За 3 дня</option>
                    <option value={7}>За неделю</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Service Changes */}
        <div className="p-6 bg-muted/50 rounded-lg border border-border">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
              <Settings2 className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold">Изменения в сервисах</h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notify_service_changes}
                    onChange={(e) =>
                      setSettings({ ...settings, notify_service_changes: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              <p className="text-sm text-muted-foreground">
                Уведомления об изменении цен, тарифов и условий подписок
              </p>
            </div>
          </div>
        </div>

        {/* Service Discontinued */}
        <div className="p-6 bg-muted/50 rounded-lg border border-border">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
              <AlertCircle className="w-5 h-5 text-destructive" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold">Прекращение работы сервиса</h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notify_service_discontinued}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        notify_service_discontinued: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              <p className="text-sm text-muted-foreground">
                Получайте уведомления, если сервис прекращает свою работу
              </p>
            </div>
          </div>
        </div>

        {/* Info Note */}
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex gap-3">
            <Mail className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-blue-700 dark:text-blue-400 font-medium mb-1">
                Уведомления отправляются на: {user?.email}
              </p>
              <p className="text-blue-600 dark:text-blue-500">
                Все email-уведомления будут приходить на эту почту, указанную при регистрации.
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
          >
            <Bell className="w-4 h-4" />
            {isSaving ? 'Сохранение...' : 'Сохранить настройки'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
