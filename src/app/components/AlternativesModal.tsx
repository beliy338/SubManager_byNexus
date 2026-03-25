import React, { useState, useEffect } from 'react';
import { X, TrendingDown } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { supabase } from '../utils/supabase';
import { ServiceLogo } from './ServiceLogo';

interface AlternativesModalProps {
  isOpen?: boolean;
  onClose: () => void;
  subscription: any;
}

interface Service {
  id: string;
  name: string;
  category: string;
  icon: string | null;
  description: string | null;
  pricing_plans: any[];
  is_popular: boolean;
}

export function AlternativesModal({ isOpen = false, onClose, subscription: currentService }: AlternativesModalProps) {
  const { t, getCurrencySymbol, convertPrice } = useApp();
  const [alternatives, setAlternatives] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && currentService) {
      loadAlternatives();
    }
  }, [isOpen, currentService]);

  const loadAlternatives = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('category', currentService.category)
        .neq('name', currentService.name)
        .order('is_popular', { ascending: false });

      if (error) throw error;
      setAlternatives(data || []);
    } catch (error) {
      console.error('Error loading alternatives:', error);
      setAlternatives([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !currentService) return null;

  const currentPrice = convertPrice(currentService.price);
  const currentBillingCycle = currentService.billingCycle;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-3xl shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <ServiceLogo logo={currentService.icon} name={currentService.name} size="lg" customLogo={currentService.customLogo} />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold">{t('alternativesFor')} {currentService.name}</h2>
                {currentService.isCustom && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-green-500 to-cyan-500 text-white border-none">
                    {t('custom')}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {t('currentPrice')}: {currentPrice.toFixed(2)} {getCurrencySymbol()}/{t(currentBillingCycle)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground">{t('loadingAlternatives')}</div>
          </div>
        ) : alternatives.length === 0 ? (
          <div className="text-center py-12 bg-muted/50 rounded-lg border border-border">
            <p className="text-muted-foreground mb-2">
              {t('noAlternativesFound')}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('moreServicesComingSoon')}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {alternatives.map((alt) => {
              // Find monthly plan or first available plan
              const plans = alt.pricing_plans || [];
              const monthlyPlan = plans.find((p: any) => p.billingCycle === 'monthly') || plans[0];
              
              if (!monthlyPlan) return null;

              const altPrice = convertPrice(monthlyPlan.price);
              const currentMonthlyPrice = currentBillingCycle === 'monthly' 
                ? currentPrice 
                : currentPrice / 12;
              
              const savings = currentMonthlyPrice - altPrice;
              const savingsPercent = currentMonthlyPrice > 0 
                ? ((savings / currentMonthlyPrice) * 100).toFixed(0) 
                : '0';

              return (
                <div
                  key={alt.id}
                  className="p-5 bg-muted/50 rounded-xl border border-border hover:bg-muted transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1">
                      <ServiceLogo logo={alt.icon || undefined} name={alt.name} size="xl" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg">{alt.name}</h3>
                          {alt.is_popular && (
                            <span className="text-yellow-500 text-sm">⭐</span>
                          )}
                        </div>
                        {alt.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {alt.description}
                          </p>
                        )}
                      </div>
                    </div>
                    {savings > 0 && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-500 rounded-full text-sm font-semibold whitespace-nowrap ml-3">
                        <TrendingDown className="w-4 h-4" />
                        {t('savings')} {savingsPercent}%
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-baseline justify-between">
                    <div>
                      <p className="text-3xl font-bold text-primary">
                        {altPrice.toFixed(2)} {getCurrencySymbol()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t('perMonthShort')} • {plans.length} {plans.length === 1 ? t('pricingPlansCount') : t('pricingPlansCount_few')}
                      </p>
                    </div>
                    
                    {savings > 0 && (
                      <div className="text-right">
                        <p className="text-sm font-semibold text-green-500">
                          ↓ {savings.toFixed(2)} {getCurrencySymbol()}/{t('perMonthShort')}
                        </p>
                        <p className="text-xs text-green-500/70">
                          {(savings * 12).toFixed(2)} {getCurrencySymbol()}/{t('perYear')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}