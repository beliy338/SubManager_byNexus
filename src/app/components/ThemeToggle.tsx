import React from 'react';
import { motion } from 'motion/react';
import { useApp } from '../contexts/AppContext';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const { settings, updateSettings } = useApp();
  const isDark = settings.theme === 'dark';

  const toggleTheme = () => {
    updateSettings({ theme: isDark ? 'light' : 'dark' });
  };

  return (
    <motion.button
      onClick={toggleTheme}
      className="p-3 rounded-lg bg-card hover:bg-muted border border-border transition-all duration-200 shadow-lg"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 0 : 180 }}
        transition={{ duration: 0.3 }}
      >
        {isDark ? (
          <Moon className="w-5 h-5 text-primary" />
        ) : (
          <Sun className="w-5 h-5 text-accent" />
        )}
      </motion.div>
    </motion.button>
  );
}
