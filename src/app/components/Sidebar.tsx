import React from 'react';
import { Link, useLocation } from 'react-router';
import { LayoutDashboard, BarChart3, CreditCard, Cloud, CloudOff, Loader2 } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export function Sidebar() {
  const location = useLocation();
  const { t, accessToken, user, isSyncing } = useApp();

  // Check if user is using cloud sync or local storage
  const isCloudSync = accessToken && accessToken !== 'test-token';

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: t('dashboard') },
    { path: '/analytics', icon: BarChart3, label: t('analytics') },
    { path: '/subscriptions', icon: CreditCard, label: t('subscriptions') },
  ];

  return (
    <div className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          SubManager
        </h1>
      </div>

      <nav className="px-4">
        <div className="flex gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center gap-1 px-3 py-3 rounded-lg transition-all flex-1 ${
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-white hover:text-primary dark:hover:bg-sidebar-accent dark:hover:text-sidebar-accent-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
