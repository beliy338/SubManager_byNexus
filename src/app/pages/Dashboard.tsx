import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Calendar, DollarSign, TrendingUp, TrendingDown, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { SelectServiceModal } from '../components/SelectServiceModal';
import { SubscriptionInfoDialog } from '../components/SubscriptionInfoDialog';
import { ServiceLogo } from '../components/ServiceLogo';
import { isOwner } from '../utils/roles';

export function Dashboard() {
  const { t, subscriptions, getCurrencySymbol, convertPrice, user } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null);
  
  // Check if user is owner
  const userIsOwner = isOwner(user);

  // Calculate monthly total
  const monthlyTotal = subscriptions.reduce((total, sub) => {
    const price = convertPrice(sub.price);
    return total + (sub.billingCycle === 'monthly' ? price : price / 12);
  }, 0);

  // Calculate yearly forecast
  const yearlyForecast = monthlyTotal * 12;

  // Get upcoming billings (next 7 days)
  const upcomingBillings = subscriptions
    .filter(sub => {
      const nextBillingDate = new Date(sub.nextBilling);
      const today = new Date();
      const diffDays = Math.ceil((nextBillingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7;
    })
    .sort((a, b) => new Date(a.nextBilling).getTime() - new Date(b.nextBilling).getTime());

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{t('dashboard')}</h1>
          <p className="text-muted-foreground">
            {t('activeSubscriptions')}: {subscriptions.length}
          </p>
        </div>
        {!userIsOwner && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity w-full md:w-auto"
          >
            <Plus className="w-5 h-5" />
            <span className="text-sm md:text-base">{t('addSubscription')}</span>
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('monthlyTotal')}</p>
              <p className="text-2xl font-bold">
                {monthlyTotal.toFixed(2)} {getCurrencySymbol()}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('yearlyForecast')}</p>
              <p className="text-2xl font-bold">
                {yearlyForecast.toFixed(2)} {getCurrencySymbol()}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-secondary/10 rounded-lg">
              <Calendar className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('upcomingBilling')}</p>
              <p className="text-2xl font-bold">{upcomingBillings.length}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Subscriptions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card border border-border rounded-xl p-6 shadow-lg mb-8"
      >
        <h2 className="text-xl font-bold mb-4">{t('subscriptions')}</h2>
        {subscriptions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No subscriptions yet. Add your first subscription to get started!
            </p>
            {!userIsOwner && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                {t('addSubscription')}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {subscriptions.slice(0, 5).map((sub) => (
              <div
                key={sub.id}
                className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                onClick={() => setSelectedSubscription(sub)}
              >
                <div className="flex items-center gap-3 flex-1">
                  <ServiceLogo logo={sub.icon} name={sub.name} size="lg" customLogo={sub.customLogo} />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{sub.name}</p>
                      {sub.isCustom && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-green-500 to-cyan-500 text-white border-none">
                          {t('custom')}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t(sub.category)} • {t(sub.billingCycle)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">
                    {convertPrice(sub.price).toFixed(2)} {getCurrencySymbol()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(sub.nextBilling).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Upcoming Billings */}
      {upcomingBillings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card border border-border rounded-xl p-6 shadow-lg"
        >
          <h2 className="text-xl font-bold mb-4">{t('upcomingBillings')}</h2>
          <div className="space-y-3">
            {upcomingBillings.map((sub) => {
              const daysUntil = Math.ceil(
                (new Date(sub.nextBilling).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              );
              
              let daysText = '';
              if (daysUntil === 0) {
                daysText = t('today');
              } else if (daysUntil === 1) {
                daysText = t('in1day');
              } else if (daysUntil === 2) {
                daysText = t('in2days');
              } else if (daysUntil === 3) {
                daysText = t('in3days');
              } else {
                daysText = t('inXdays').replace('{X}', daysUntil.toString());
              }
              
              return (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <ServiceLogo logo={sub.icon} name={sub.name} size="md" customLogo={sub.customLogo} />
                    <div>
                      <p className="font-medium">{sub.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {daysText}
                      </p>
                    </div>
                  </div>
                  <p className="font-bold text-orange-500">
                    {convertPrice(sub.price).toFixed(2)} {getCurrencySymbol()}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      <SelectServiceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <SubscriptionInfoDialog 
        isOpen={!!selectedSubscription} 
        subscription={selectedSubscription} 
        onClose={() => setSelectedSubscription(null)} 
      />
    </div>
  );
}