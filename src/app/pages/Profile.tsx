import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { User, Mail, Phone, MapPin, Save, RefreshCw, Calendar, Cloud, CloudOff, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { isOwner } from '../utils/roles';

export function Profile() {
  const { user, accessToken, updateUserProfile, refreshData, isSyncing, t } = useApp();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isCloudSync = accessToken && accessToken !== 'test-token';
  const userIsOwner = isOwner(user);

  useEffect(() => {
    if (user) {
      setName(user?.user_metadata?.name || user?.email?.split('@')[0] || '');
      setPhone(user?.user_metadata?.phone || '');
      setCountry(user?.user_metadata?.country || '');
    }
  }, [user]);

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await updateUserProfile({
        name,
        phone,
        country
      });
      toast.success('Профиль успешно обновлен');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Ошибка при обновлении профиля');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefresh = async () => {
    setIsSubmitting(true);
    try {
      await refreshData();
      toast.success('Данные успешно обновлены');
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Ошибка при обновлении данных');
    } finally {
      setIsSubmitting(false);
    }
  };

  const registrationDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : 'Неизвестно';

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t('profile')}</h1>
            <p className="text-muted-foreground">
              {t('manageAccountInfo')}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={isSubmitting}
              className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              {t('refresh')}
            </button>
            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {t('saveProfile')}
            </button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-xl p-8 shadow-lg"
        >
          {/* Avatar Section */}
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-border">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl font-bold text-primary-foreground">
              {name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold">{name}</h2>
                {userIsOwner && (
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-primary to-accent text-primary-foreground">
                    Владелец
                  </span>
                )}
              </div>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          {/* Profile Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <User className="w-4 h-4" />
                {t('nameField')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <Mail className="w-4 h-4" />
                {t('emailField')}
              </label>
              <input
                type="email"
                value={user?.email}
                disabled
                className="w-full px-4 py-3 rounded-lg bg-input border border-border opacity-50 cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {t('emailCannotChange')}
              </p>
            </div>

            {/* Phone */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <Phone className="w-4 h-4" />
                {t('phoneField')}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+7 (___) ___-__-__"
                className="w-full px-4 py-3 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Country */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <MapPin className="w-4 h-4" />
                {t('countryField')}
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Россия"
                className="w-full px-4 py-3 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Registration Date (read-only) */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <Calendar className="w-4 h-4" />
                {t('registrationDate')}
              </label>
              <input
                type="text"
                value={registrationDate}
                disabled
                className="w-full px-4 py-3 rounded-lg bg-input border border-border opacity-50 cursor-not-allowed"
              />
            </div>
          </div>
        </motion.div>

        {/* Cloud Sync Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 bg-card border border-border rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center gap-3">
            {isSyncing ? (
              <>
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                <div>
                  <p className="font-medium">Синхронизация...</p>
                  <p className="text-sm text-muted-foreground">Обновление данных</p>
                </div>
              </>
            ) : isCloudSync ? (
              <>
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <Cloud className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="font-medium">{t('cloudSyncActive')}</p>
                  <p className="text-sm text-muted-foreground">{t('dataSyncedWithCloud')}</p>
                </div>
              </>
            ) : (
              <>
                <div className="p-3 bg-orange-500/10 rounded-lg">
                  <CloudOff className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="font-medium">Локальное хранилище</p>
                  <p className="text-sm text-muted-foreground">Данные хранятся только на этом устройстве</p>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}