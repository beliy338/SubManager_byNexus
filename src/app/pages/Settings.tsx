import React from 'react';
import { useApp } from '../contexts/AppContext';
import { motion } from 'motion/react';
import { toast } from 'sonner';

import flagRU from 'figma:asset/1759cefbc812d725432999f481456881c8a87b80.png';
import flagBY from 'figma:asset/97976980503fcbca3c45782f1316e42143ba93d0.png';
import flagCN from 'figma:asset/d8091d777293aaf9f4df4523ab5346354a29fbb4.png';
import flagGB from 'figma:asset/a8d112cfd79c27f4c24a17a55e6e034d741cf181.png';
import flagUS from 'figma:asset/0371ae61dc8e16f876b1d8c81de4d264bb4c788c.png';
import flagEU from 'figma:asset/1162ae2b5115e69bab9733fe45228f27f6805a3e.png';

export function Settings() {
  const { t, settings, updateSettings } = useApp();

  const languages = [
    { code: 'ru', name: 'Русский', flag: flagRU },
    { code: 'en', name: 'English', flag: flagGB },
    { code: 'be', name: 'Беларуская', flag: flagBY },
    { code: 'zh', name: '中文', flag: flagCN }
  ];

  const currencies = [
    { code: 'RUB', name: 'Russian Ruble (₽)', flag: flagRU },
    { code: 'USD', name: 'US Dollar ($)', flag: flagUS },
    { code: 'EUR', name: 'Euro (€)', flag: flagEU },
    { code: 'CNY', name: 'Chinese Yuan (¥)', flag: flagCN },
    { code: 'BYN', name: 'Belarusian Ruble (Br)', flag: flagBY }
  ];

  const fontSizes = [
    { value: 'small', label: t('small') },
    { value: 'medium', label: t('medium') },
    { value: 'large', label: t('large') }
  ];

  const handleLanguageChange = async (language: string) => {
    await updateSettings({ language: language as any });
    toast.success(t('settingsSaved'));
  };

  const handleCurrencyChange = async (currency: string) => {
    await updateSettings({ currency });
    toast.success(t('settingsSaved'));
  };

  const handleFontSizeChange = async (fontSize: string) => {
    await updateSettings({ fontSize: fontSize as any });
    toast.success(t('settingsSaved'));
  };

  const handleThemeChange = async (theme: string) => {
    await updateSettings({ theme: theme as any });
    toast.success(t('settingsSaved'));
  };

  const handleAIPermissionChange = async (permission: 'yes' | 'no' | 'never') => {
    await updateSettings({ ai_permission: permission });
    toast.success(t('settingsSaved'));
  };

  return (
    <div className="p-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">{t('settings')}</h1>
        <p className="text-muted-foreground">
          {t('settingsDescription')}
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Language Setting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-xl p-6 shadow-lg"
        >
          <h2 className="text-xl font-bold mb-4">{t('language')}</h2>
          <div className="grid grid-cols-2 gap-3">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`p-4 rounded-lg font-medium transition-all flex items-center gap-3 ${
                  settings.language === lang.code
                    ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground'
                    : 'bg-muted hover:bg-muted/70'
                }`}
              >
                <img src={lang.flag} alt={lang.name} className="w-8 h-6 object-cover rounded" />
                <span>{lang.name}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Currency Setting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-xl p-6 shadow-lg"
        >
          <h2 className="text-xl font-bold mb-4">{t('currency')}</h2>
          <div className="space-y-2">
            {currencies.map((curr) => (
              <button
                key={curr.code}
                onClick={() => handleCurrencyChange(curr.code)}
                className={`w-full text-left p-4 rounded-lg font-medium transition-all flex items-center gap-3 ${
                  settings.currency === curr.code
                    ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground'
                    : 'bg-muted hover:bg-muted/70'
                }`}
              >
                <img src={curr.flag} alt={curr.name} className="w-8 h-6 object-cover rounded" />
                <span>{curr.name}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Font Size Setting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-xl p-6 shadow-lg"
        >
          <h2 className="text-xl font-bold mb-4">{t('fontSize')}</h2>
          <div className="grid grid-cols-3 gap-3">
            {fontSizes.map((size) => (
              <button
                key={size.value}
                onClick={() => handleFontSizeChange(size.value)}
                className={`p-4 rounded-lg font-medium transition-all ${
                  settings.fontSize === size.value
                    ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground'
                    : 'bg-muted hover:bg-muted/70'
                }`}
              >
                {size.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Theme Setting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card border border-border rounded-xl p-6 shadow-lg"
        >
          <h2 className="text-xl font-bold mb-4">{t('theme')}</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleThemeChange('dark')}
              className={`p-4 rounded-lg font-medium transition-all ${
                settings.theme === 'dark'
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                  : 'bg-muted hover:bg-muted/70'
              }`}
            >
              {t('dark')} 🌙
            </button>
            <button
              onClick={() => handleThemeChange('light')}
              className={`p-4 rounded-lg font-medium transition-all ${
                settings.theme === 'light'
                  ? 'bg-gradient-to-r from-purple-500 to-orange-400 text-white'
                  : 'bg-muted hover:bg-muted/70'
              }`}
            >
              {t('light')} ☀️
            </button>
          </div>
        </motion.div>

        {/* AI Analytics Setting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card border border-border rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-xl font-bold">{t('ai_analytics_setting')}</h2>
            <span className="px-2 py-1 text-xs font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md">
              AI
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {t('ai_analytics_description')}
          </p>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleAIPermissionChange('yes')}
              className={`p-4 rounded-lg font-medium transition-all ${
                settings.ai_permission === 'yes'
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                  : 'bg-muted hover:bg-muted/70'
              }`}
            >
              ✅ {t('ai_permission_yes')}
            </button>
            <button
              onClick={() => handleAIPermissionChange('no')}
              className={`p-4 rounded-lg font-medium transition-all ${
                settings.ai_permission === 'no'
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white'
                  : 'bg-muted hover:bg-muted/70'
              }`}
            >
              ⏰ {t('ai_permission_later')}
            </button>
            <button
              onClick={() => handleAIPermissionChange('never')}
              className={`p-4 rounded-lg font-medium transition-all ${
                settings.ai_permission === 'never'
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                  : 'bg-muted hover:bg-muted/70'
              }`}
            >
              ❌ {t('ai_permission_never')}
            </button>
          </div>
        </motion.div>

      </div>
    </div>
  );
}