import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
import { useApp } from '../contexts/AppContext';
import { Menu, X, Home, CreditCard, TrendingUp, Settings, User, LogOut, Plus, Mail } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { AddServiceModal } from './AddServiceModal';
import { NotificationsButton } from './NotificationsButton';
import { motion, AnimatePresence } from 'motion/react';
import { isOwner } from '../utils/roles';

export function TopBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, settings, user, t } = useApp();
  const [showProfileLabel, setShowProfileLabel] = useState(false);
  const [showSettingsLabel, setShowSettingsLabel] = useState(false);
  const [showLogoutLabel, setShowLogoutLabel] = useState(false);
  const [showEmailTemplatesLabel, setShowEmailTemplatesLabel] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Пользователь';
  const isDark = settings.theme === 'dark';
  const userIsOwner = isOwner(user);

  const navItems = [
    { path: '/', icon: Home, label: t('dashboard') },
    { path: '/subscriptions', icon: CreditCard, label: t('subscriptions') },
    { path: '/analytics', icon: TrendingUp, label: t('analytics') },
  ];

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border shadow-lg">
        <div className="px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center gap-4 md:gap-6">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Меню"
            >
              {showMobileMenu ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

            <Link
              to="/"
              className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hover:opacity-80 transition-opacity cursor-pointer"
            >
              SubManager
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right side - Profile, Settings, Notifications, Theme, Logout */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Add Service Button (Owner Only) - Hidden on mobile */}
            {userIsOwner && (
              <button
                onClick={() => setShowAddServiceModal(true)}
                className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">Добавить подписку</span>
              </button>
            )}

            {/* Add Service Button Icon Only (Owner Only) - Mobile */}
            {userIsOwner && (
              <button
                onClick={() => setShowAddServiceModal(true)}
                className="lg:hidden p-2 md:p-3 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-opacity"
                aria-label="Добавить подписку"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}

            {/* Profile Button - Desktop */}
            <div className="relative hidden md:block">
              <motion.button
                onClick={handleProfile}
                onMouseEnter={() => setShowProfileLabel(true)}
                onMouseLeave={() => setShowProfileLabel(false)}
                className="flex items-center gap-2 p-3 rounded-lg bg-card hover:bg-muted border border-border transition-all duration-200 shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Профиль"
              >
                <User className="w-5 h-5 text-foreground" />
                <span className="text-sm font-medium">{userName}</span>
              </motion.button>

              <AnimatePresence>
                {showProfileLabel && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-2 whitespace-nowrap px-3 py-1.5 bg-card border border-border rounded-lg shadow-lg text-sm"
                  >
                    {t('profileTooltip')}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Settings Button - Desktop */}
            <div className="relative hidden md:block">
              <motion.button
                onClick={handleSettings}
                onMouseEnter={() => setShowSettingsLabel(true)}
                onMouseLeave={() => setShowSettingsLabel(false)}
                className="p-3 rounded-lg bg-card hover:bg-muted border border-border transition-all duration-200 shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Настройки"
              >
                <Settings className="w-5 h-5 text-foreground" />
              </motion.button>

              <AnimatePresence>
                {showSettingsLabel && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-2 whitespace-nowrap px-3 py-1.5 bg-card border border-border rounded-lg shadow-lg text-sm"
                  >
                    {t('settingsTooltip')}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme Toggle */}
            <div className="hidden md:block">
              <ThemeToggle />
            </div>

            {/* Notifications Button */}
            <NotificationsButton />

            {/* Logout Button - Desktop */}
            <div className="relative hidden md:block">
              <motion.button
                onClick={handleLogoutClick}
                onMouseEnter={() => setShowLogoutLabel(true)}
                onMouseLeave={() => setShowLogoutLabel(false)}
                className={`p-3 rounded-lg transition-all duration-200 shadow-lg border border-border ${
                  isDark
                    ? 'bg-destructive/90 text-white hover:bg-destructive'
                    : 'bg-destructive text-white hover:opacity-90'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Выйти"
              >
                <LogOut className="w-5 h-5" />
              </motion.button>

              <AnimatePresence>
                {showLogoutLabel && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-2 whitespace-nowrap px-3 py-1.5 bg-card border border-border rounded-lg shadow-lg text-sm"
                  >
                    {t('logoutTooltip')}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-border overflow-hidden"
            >
              <div className="px-4 py-3 space-y-2">
                {/* Mobile Navigation */}
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setShowMobileMenu(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground'
                          : 'text-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}

                {/* Mobile Profile */}
                <button
                  onClick={() => {
                    handleProfile();
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-muted transition-all"
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">Профиль</span>
                </button>

                {/* Mobile Settings */}
                <button
                  onClick={() => {
                    handleSettings();
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-muted transition-all"
                >
                  <Settings className="w-5 h-5" />
                  <span className="font-medium">Настройки</span>
                </button>

                {/* Mobile Theme Toggle */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <span className="font-medium">Тема</span>
                  <ThemeToggle />
                </div>

                {/* Mobile Logout */}
                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                    handleLogoutClick();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-destructive text-white hover:opacity-90 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Выйти</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Service Modal */}
      <AddServiceModal
        isOpen={showAddServiceModal}
        onClose={() => setShowAddServiceModal(false)}
        onAdd={(service) => {
          console.log('Service added:', service);
          setShowAddServiceModal(false);
        }}
      />

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowLogoutConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-xl p-6 shadow-2xl max-w-md w-full"
            >
              <h2 className="text-xl font-bold mb-4">{t('confirmLogout')}</h2>
              <p className="text-muted-foreground mb-6">
                {t('confirmLogoutMessage')}
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-4 py-2 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors"
                >
                  {t('cancelLogout')}
                </button>
                <button
                  onClick={handleLogout}
                  className={`px-4 py-2 rounded-lg font-medium transition-opacity ${
                    isDark
                      ? 'bg-destructive text-white hover:bg-destructive/90'
                      : 'bg-destructive text-white hover:opacity-90'
                  }`}
                >
                  {t('logoutButton')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}