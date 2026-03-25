import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../contexts/AppContext';
import { Globe } from 'lucide-react';

import flagRU from 'figma:asset/1759cefbc812d725432999f481456881c8a87b80.png';
import flagBY from 'figma:asset/97976980503fcbca3c45782f1316e42143ba93d0.png';
import flagCN from 'figma:asset/d8091d777293aaf9f4df4523ab5346354a29fbb4.png';
import flagGB from 'figma:asset/a8d112cfd79c27f4c24a17a55e6e034d741cf181.png';

export function LanguageSelector() {
  const { settings, updateSettings } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'ru', name: 'Русский', flag: flagRU },
    { code: 'en', name: 'English', flag: flagGB },
    { code: 'be', name: 'Беларуская', flag: flagBY },
    { code: 'zh', name: '中文', flag: flagCN }
  ];

  const currentLanguage = languages.find(lang => lang.code === settings.language) || languages[0];

  const handleLanguageChange = async (languageCode: string) => {
    await updateSettings({ language: languageCode as any });
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 rounded-lg bg-card hover:bg-muted border border-border transition-all duration-200 shadow-lg flex items-center gap-2"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Select language"
      >
        <img 
          src={currentLanguage.flag} 
          alt={currentLanguage.name} 
          className="w-5 h-4 object-cover rounded" 
        />
        <Globe className="w-5 h-5 text-primary" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay to close dropdown when clicking outside */}
            <div 
              className="fixed inset-0 z-30" 
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-2xl overflow-hidden z-40"
            >
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors ${
                    settings.language === lang.code ? 'bg-gradient-to-r from-primary/10 to-accent/10' : ''
                  }`}
                >
                  <img 
                    src={lang.flag} 
                    alt={lang.name} 
                    className="w-8 h-6 object-cover rounded" 
                  />
                  <span className="font-medium">{lang.name}</span>
                  {settings.language === lang.code && (
                    <span className="ml-auto text-primary">✓</span>
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
