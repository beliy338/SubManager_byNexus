import React from 'react';
import { useApp } from '../contexts/AppContext';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';
import { PaymentCalendar } from '../components/PaymentCalendar';
import { ServiceLogo } from '../components/ServiceLogo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card } from '../components/ui/card';
import { TrendingUp, CreditCard, Hash, DollarSign } from 'lucide-react';
import { ChartWrapper } from '../components/ChartWrapper';
import { MonthSubscriptionsModal } from '../components/MonthSubscriptionsModal';
import { AIPredictionCard } from '../components/AIPredictionCard';
import { supabase } from '../utils/supabase';

// Colors for pie chart - расширенная палитра
const COLORS = [
  '#ef4444', // red-500
  '#3b82f6', // blue-500
  '#10b981', // green-500
  '#8b5cf6', // violet-500
  '#f59e0b', // amber-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#f97316', // orange-500
  '#a855f7', // purple-500
  '#14b8a6', // teal-500
  '#f43f5e', // rose-500
  '#6366f1', // indigo-500
];

export function Analytics() {
  const { t, subscriptions, getCurrencySymbol, convertPrice, settings, user } = useApp();
  const [period, setPeriod] = React.useState<'month' | 'quarter' | 'year'>('month');
  const [viewType, setViewType] = React.useState<'category' | 'service'>('category');
  const [chartType, setChartType] = React.useState<'pie' | 'bar' | 'line'>('pie');
  const [displayMode, setDisplayMode] = React.useState<'currency' | 'percent'>('currency');
  const [selectedMonthData, setSelectedMonthData] = React.useState<any>(null);
  const [showMonthModal, setShowMonthModal] = React.useState(false);
  const [allSubscriptionsHistory, setAllSubscriptionsHistory] = React.useState<any[]>([]);
  const [userRegistrationDate, setUserRegistrationDate] = React.useState<Date | null>(null);

  // Custom Tooltip component for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div 
          className="p-3 rounded-lg shadow-lg border"
          style={{ 
            backgroundColor: 'hsl(var(--card))', 
            borderColor: 'hsl(var(--border))',
          }}
        >
          <p className={`font-medium mb-1 ${settings.theme === 'dark' ? 'text-white' : 'text-foreground'}`}>
            {label}
          </p>
          <p className="font-semibold text-orange-500">
            {t('cost')}: {payload[0].value} {displayMode === 'currency' ? getCurrencySymbol() : '%'}
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for spending trend chart
  const SpendingTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div 
          className="p-3 rounded-lg shadow-lg border"
          style={{ 
            backgroundColor: 'hsl(var(--card))', 
            borderColor: 'hsl(var(--border))',
          }}
        >
          <p className={`font-medium mb-1 ${settings.theme === 'dark' ? 'text-white' : 'text-foreground'}`}>
            {label}
          </p>
          <p className="font-semibold text-orange-500">
            {payload[0].value} {getCurrencySymbol()}
          </p>
        </div>
      );
    }
    return null;
  };

  // Load all subscriptions history (including deleted) and user registration date
  React.useEffect(() => {
    const loadHistoricalData = async () => {
      if (!user?.id) return;

      try {
        // Get user registration date
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user?.created_at) {
          setUserRegistrationDate(new Date(userData.user.created_at));
        }

        // Get all subscriptions including deleted (soft delete with deleted_at field)
        const { data: allSubs } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (allSubs) {
          setAllSubscriptionsHistory(allSubs);
        }
      } catch (error) {
        console.error('Error loading historical data:', error);
      }
    };

    loadHistoricalData();
  }, [user?.id]);

  // Calculate spending by category
  const categoryData = React.useMemo(() => {
    return subscriptions.reduce((acc, sub) => {
      const category = sub.category || 'other';
      const monthlyPrice = convertPrice(sub.billingCycle === 'monthly' ? sub.price : sub.price / 12);
      
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += monthlyPrice;
      return acc;
    }, {} as Record<string, number>);
  }, [subscriptions, convertPrice]);

  const categoryChartData = React.useMemo(() => {
    const total = Object.values(categoryData).reduce((sum, val) => sum + val, 0);
    return Object.entries(categoryData).map(([name, value], index) => ({
      id: `category_${name}_${Date.now()}_${index}`,
      name: t(name),
      value: parseFloat(value.toFixed(2)),
      percent: total > 0 ? parseFloat(((value / total) * 100).toFixed(1)) : 0,
      fill: COLORS[index % COLORS.length]
    }));
  }, [categoryData, t]);

  // Calculate spending by service
  const serviceData = React.useMemo(() =>
    subscriptions.map((sub, index) => ({
      id: sub.id || `service-${sub.name}-${index}`,
      name: sub.name,
      logo: sub.icon,
      customLogo: sub.customLogo,
      category: t(sub.category),
      monthlyPrice: parseFloat(convertPrice(sub.billingCycle === 'monthly' ? sub.price : sub.price / 12).toFixed(2)),
      totalPrice: parseFloat((convertPrice(sub.billingCycle === 'monthly' ? sub.price : sub.price / 12) * 12).toFixed(2)),
      billingCycle: sub.billingCycle,
    })).sort((a, b) => b.monthlyPrice - a.monthlyPrice), [subscriptions, t, convertPrice]);

  // Calculate period data based on selection - with historical subscriptions support
  const getPeriodData = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    // Quarters
    if (period === 'quarter') {
      const quartersCount = 4;
      
      return Array.from({ length: quartersCount }, (_, i) => {
        const quarterIndex = i; // 0-3 representing Q1-Q4
        const quarterStartMonth = quarterIndex * 3; // 0, 3, 6, 9
        const quarterEndMonth = quarterStartMonth + 2; // 2, 5, 8, 11
        
        // Use current year
        const quarterStart = new Date(currentYear, quarterStartMonth, 1);
        const quarterEnd = new Date(currentYear, quarterEndMonth + 1, 0, 23, 59, 59);
        
        let total = 0;
        
        // Check all subscriptions (including historical/deleted ones)
        for (const sub of allSubscriptionsHistory) {
          const subCreatedAt = new Date(sub.created_at);
          const subDeletedAt = sub.deleted_at ? new Date(sub.deleted_at) : null;
          
          // For each month in the quarter, check if there was a billing
          for (let monthOffset = 0; monthOffset <= 2; monthOffset++) {
            const checkMonth = quarterStartMonth + monthOffset;
            const monthStart = new Date(currentYear, checkMonth, 1);
            const monthEnd = new Date(currentYear, checkMonth + 1, 0, 23, 59, 59);
            
            // Check if subscription was active during this month
            const wasCreatedBeforeMonthEnd = subCreatedAt <= monthEnd;
            const wasNotDeletedBeforeMonthEnd = !subDeletedAt || subDeletedAt > monthEnd;
            
            if (wasCreatedBeforeMonthEnd && wasNotDeletedBeforeMonthEnd) {
              const nextBilling = new Date(sub.next_billing);
              
              if (sub.billing_cycle === 'monthly') {
                const monthsSinceCreation = (currentYear - subCreatedAt.getFullYear()) * 12 + (checkMonth - subCreatedAt.getMonth());
                
                if (monthsSinceCreation >= 0) {
                  const billingDay = nextBilling.getDate();
                  const testBillingDate = new Date(currentYear, checkMonth, billingDay);
                  
                  if (testBillingDate >= monthStart && testBillingDate <= monthEnd) {
                    const price = parseFloat(sub.price);
                    const priceInUserCurrency = convertPrice(price);
                    total += priceInUserCurrency;
                  }
                }
              } else if (sub.billing_cycle === 'yearly') {
                const anniversaryMonth = subCreatedAt.getMonth();
                if (checkMonth === anniversaryMonth && currentYear >= subCreatedAt.getFullYear()) {
                  const price = parseFloat(sub.price);
                  const priceInUserCurrency = convertPrice(price);
                  total += priceInUserCurrency;
                }
              }
            }
          }
        }
        
        const quarterKeys = ['quarter1', 'quarter2', 'quarter3', 'quarter4'] as const;
        
        return {
          id: `quarter-${i}-${currentYear}`,
          period: t(quarterKeys[quarterIndex]),
          spending: parseFloat(total.toFixed(2)),
          year: currentYear,
          month: quarterStartMonth,
          quarterIndex
        };
      });
    }
    
    // Half-years
    if (period === 'year') {
      const halfYearsCount = 2;
      
      return Array.from({ length: halfYearsCount }, (_, i) => {
        const halfYearIndex = i; // 0-1 representing H1-H2
        const halfYearStartMonth = halfYearIndex * 6; // 0, 6
        const halfYearEndMonth = halfYearStartMonth + 5; // 5, 11
        
        // Use current year
        const halfYearStart = new Date(currentYear, halfYearStartMonth, 1);
        const halfYearEnd = new Date(currentYear, halfYearEndMonth + 1, 0, 23, 59, 59);
        
        let total = 0;
        
        // Check all subscriptions (including historical/deleted ones)
        for (const sub of allSubscriptionsHistory) {
          const subCreatedAt = new Date(sub.created_at);
          const subDeletedAt = sub.deleted_at ? new Date(sub.deleted_at) : null;
          
          // For each month in the half-year, check if there was a billing
          for (let monthOffset = 0; monthOffset <= 5; monthOffset++) {
            const checkMonth = halfYearStartMonth + monthOffset;
            const monthStart = new Date(currentYear, checkMonth, 1);
            const monthEnd = new Date(currentYear, checkMonth + 1, 0, 23, 59, 59);
            
            // Check if subscription was active during this month
            const wasCreatedBeforeMonthEnd = subCreatedAt <= monthEnd;
            const wasNotDeletedBeforeMonthEnd = !subDeletedAt || subDeletedAt > monthEnd;
            
            if (wasCreatedBeforeMonthEnd && wasNotDeletedBeforeMonthEnd) {
              const nextBilling = new Date(sub.next_billing);
              
              if (sub.billing_cycle === 'monthly') {
                const monthsSinceCreation = (currentYear - subCreatedAt.getFullYear()) * 12 + (checkMonth - subCreatedAt.getMonth());
                
                if (monthsSinceCreation >= 0) {
                  const billingDay = nextBilling.getDate();
                  const testBillingDate = new Date(currentYear, checkMonth, billingDay);
                  
                  if (testBillingDate >= monthStart && testBillingDate <= monthEnd) {
                    const price = parseFloat(sub.price);
                    const priceInUserCurrency = convertPrice(price);
                    total += priceInUserCurrency;
                  }
                }
              } else if (sub.billing_cycle === 'yearly') {
                const anniversaryMonth = subCreatedAt.getMonth();
                if (checkMonth === anniversaryMonth && currentYear >= subCreatedAt.getFullYear()) {
                  const price = parseFloat(sub.price);
                  const priceInUserCurrency = convertPrice(price);
                  total += priceInUserCurrency;
                }
              }
            }
          }
        }
        
        const halfYearKeys = ['halfYear1', 'halfYear2'] as const;
        
        return {
          id: `halfyear-${i}-${currentYear}`,
          period: t(halfYearKeys[halfYearIndex]),
          spending: parseFloat(total.toFixed(2)),
          year: currentYear,
          month: halfYearStartMonth,
          halfYearIndex
        };
      });
    }
    
    // Monthly view - show current year from January to December (like forecast)
    const monthKeys = ['jan', 'feb', 'mar', 'apr', 'mayShort', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'] as const;
    
    return Array.from({ length: 12 }, (_, monthIndex) => {
      // 0 = January, 11 = December
      const month = monthIndex;
      const year = currentYear;
      
      const periodName = t(monthKeys[month]);
      
      // Check if this month is in the future
      const isFutureMonth = month > currentMonth;
      
      // If month is in the future, calculate based on current subscriptions
      if (isFutureMonth) {
        let monthlyTotal = 0;
        
        // Use current active subscriptions for future months
        for (const sub of subscriptions) {
          const subCreatedAt = new Date(sub.createdAt || Date.now());
          const nextBilling = new Date(sub.nextBilling);
          
          if (sub.billingCycle === 'monthly') {
            // For monthly subscriptions - check if billing will occur in this month
            const billingDay = nextBilling.getDate();
            const testBillingDate = new Date(year, month, billingDay);
            
            // Check if subscription already exists by this time
            if (subCreatedAt <= testBillingDate) {
              const price = parseFloat(sub.price);
              const priceInUserCurrency = convertPrice(price);
              monthlyTotal += priceInUserCurrency;
            }
          } else if (sub.billingCycle === 'yearly') {
            // For yearly subscriptions - check if anniversary month matches
            const anniversaryMonth = subCreatedAt.getMonth();
            
            if (month === anniversaryMonth) {
              const price = parseFloat(sub.price);
              const priceInUserCurrency = convertPrice(price);
              monthlyTotal += priceInUserCurrency;
            }
          }
        }
        
        return {
          id: `month-${monthIndex}-${year}-${month}`,
          period: periodName,
          spending: parseFloat(monthlyTotal.toFixed(2)),
          year,
          month
        };
      }
      
      // For past and current months, use historical data
      // Check if this month is before user registration
      if (userRegistrationDate) {
        const regYear = userRegistrationDate.getFullYear();
        const regMonth = userRegistrationDate.getMonth();
        
        // If month is before registration, return 0
        if (year < regYear || (year === regYear && month < regMonth)) {
          return {
            id: `month-${monthIndex}-${year}-${month}`,
            period: periodName,
            spending: 0,
            year,
            month
          };
        }
      }
      
      // Calculate spending for this specific month using historical data
      let total = 0;
      
      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, month + 1, 0, 23, 59, 59);
      
      // Check all subscriptions (including historical/deleted ones)
      for (const sub of allSubscriptionsHistory) {
        const subCreatedAt = new Date(sub.created_at);
        const subDeletedAt = sub.deleted_at ? new Date(sub.deleted_at) : null;
        const nextBilling = new Date(sub.next_billing);
        
        // Subscription is counted in month M if:
        // - created_at <= end of month M
        // - deleted_at is NULL OR deleted_at >= start of month M
        const wasCreatedBeforeMonthEnd = subCreatedAt <= monthEnd;
        const wasNotDeletedBeforeMonthStart = !subDeletedAt || subDeletedAt >= monthStart;
        
        if (wasCreatedBeforeMonthEnd && wasNotDeletedBeforeMonthStart) {
          if (sub.billing_cycle === 'monthly') {
            // For monthly subscriptions, check if billing occurred in this month
            const monthsSinceCreation = (year - subCreatedAt.getFullYear()) * 12 + (month - subCreatedAt.getMonth());
            
            if (monthsSinceCreation >= 0) {
              const billingDay = nextBilling.getDate();
              const testBillingDate = new Date(year, month, billingDay);
              
              // Check if billing date is in this month
              if (testBillingDate >= monthStart && testBillingDate <= monthEnd) {
                // Check if subscription was still active at billing date
                const wasActiveAtBilling = subCreatedAt <= testBillingDate && 
                                          (!subDeletedAt || subDeletedAt >= testBillingDate);
                
                if (wasActiveAtBilling) {
                  const price = parseFloat(sub.price);
                  const priceInUserCurrency = convertPrice(price);
                  total += priceInUserCurrency;
                }
              }
            }
          } else if (sub.billing_cycle === 'yearly') {
            // For yearly subscriptions, check if anniversary is in this month
            const anniversaryMonth = subCreatedAt.getMonth();
            const anniversaryDay = subCreatedAt.getDate();
            
            if (month === anniversaryMonth && year >= subCreatedAt.getFullYear()) {
              const anniversaryDate = new Date(year, month, anniversaryDay);
              
              // Check if anniversary is in this month
              if (anniversaryDate >= monthStart && anniversaryDate <= monthEnd) {
                // Check if subscription was still active at anniversary date
                const wasActiveAtAnniversary = subCreatedAt <= anniversaryDate && 
                                              (!subDeletedAt || subDeletedAt >= anniversaryDate);
                
                if (wasActiveAtAnniversary) {
                  const price = parseFloat(sub.price);
                  const priceInUserCurrency = convertPrice(price);
                  total += priceInUserCurrency;
                }
              }
            }
          }
        }
      }
      
      return {
        id: `month-${monthIndex}-${year}-${month}`,
        period: periodName,
        spending: parseFloat(total.toFixed(2)),
        year,
        month
      };
    });
  };

  const periodTrend = React.useMemo(() => getPeriodData(), [period, subscriptions, convertPrice, allSubscriptionsHistory, userRegistrationDate]);

  // Top subscriptions by price
  const topSubscriptions = [...subscriptions]
    .sort((a, b) => {
      const aMonthly = convertPrice(a.billingCycle === 'monthly' ? a.price : a.price / 12);
      const bMonthly = convertPrice(b.billingCycle === 'monthly' ? b.price : b.price / 12);
      return bMonthly - aMonthly;
    })
    .slice(0, 5)
    .map((sub, index) => ({
      id: sub.id || `sub-${index}`,
      name: sub.name,
      icon: sub.icon,
      price: parseFloat(convertPrice(sub.billingCycle === 'monthly' ? sub.price : sub.price / 12).toFixed(2)),
      isCustom: sub.isCustom,
      customLogo: sub.customLogo
    }));

  // Calculate total spending
  const totalMonthly = subscriptions.reduce((sum, sub) => {
    const monthlyPrice = convertPrice(sub.billingCycle === 'monthly' ? sub.price : sub.price / 12);
    return sum + monthlyPrice;
  }, 0);

  const totalYearly = totalMonthly * 12;

  // Custom label for pie chart
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 25;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // In currency mode show currency values, in percent mode show percentages
    const displayValue = displayMode === 'currency' 
      ? `${value.toFixed(0)} ${getCurrencySymbol()}` 
      : `${value.toFixed(1)}%`;

    return (
      <text 
        x={x} 
        y={y} 
        fill="currentColor" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-sm"
      >
        {displayValue}
      </text>
    );
  };

  // Handle month click - get subscriptions for that month
  const handleMonthClick = (data: any) => {
    if (!data || period !== 'month') return;
    
    const { year, month } = data;
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0, 23, 59, 59);
    
    const monthSubs: any[] = [];
    
    // Get all subscriptions that had billing in this month
    for (const sub of allSubscriptionsHistory) {
      const nextBillingDate = new Date(sub.next_billing);
      const subDeletedAt = sub.deleted_at ? new Date(sub.deleted_at) : null;
      
      if (sub.billing_cycle === 'monthly') {
        // Generate monthly payments starting from next_billing
        let currentBilling = new Date(nextBillingDate);
        
        while (currentBilling <= monthEnd) {
          // Stop if subscription was deleted before this billing
          if (subDeletedAt && currentBilling > subDeletedAt) break;
          
          // Check if billing is in this specific month
          if (currentBilling >= monthStart && currentBilling <= monthEnd) {
            monthSubs.push({
              id: sub.id,
              name: sub.name,
              price: convertPrice(parseFloat(sub.price)),
              billingDate: currentBilling.toISOString(),
              icon: sub.icon,
              customLogo: sub.custom_logo,
              isDeleted: !!sub.deleted_at,
              category: t(sub.category)
            });
          }
          
          // Move to next month
          currentBilling.setMonth(currentBilling.getMonth() + 1);
        }
      } else if (sub.billing_cycle === 'yearly') {
        // Generate yearly payments starting from next_billing
        let currentBilling = new Date(nextBillingDate);
        
        while (currentBilling <= monthEnd) {
          // Stop if subscription was deleted before this billing
          if (subDeletedAt && currentBilling > subDeletedAt) break;
          
          // Check if billing is in this specific month
          if (currentBilling >= monthStart && currentBilling <= monthEnd) {
            monthSubs.push({
              id: sub.id,
              name: sub.name,
              price: convertPrice(parseFloat(sub.price)),
              billingDate: currentBilling.toISOString(),
              icon: sub.icon,
              customLogo: sub.custom_logo,
              isDeleted: !!sub.deleted_at,
              category: t(sub.category)
            });
          }
          
          // Move to next year
          currentBilling.setFullYear(currentBilling.getFullYear() + 1);
        }
      }
    }
    
    setSelectedMonthData({
      month: new Date(year, month).toLocaleDateString('ru', { month: 'long', year: 'numeric' }),
      subscriptions: monthSubs
    });
    setShowMonthModal(true);
  };

  return (
    <ChartWrapper>
      <div className="p-4 md:p-8">
        <div className="mb-4 md:mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{t('analytics')}</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            {t('analyticsTitle')}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
          <Card className="p-4 md:p-6 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
            <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-muted-foreground mb-2">
              <TrendingUp className="w-4 h-4" />
              <span>{t('totalPerMonth')}</span>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-emerald-500 text-center">{totalMonthly.toFixed(2)} {getCurrencySymbol()}</div>
          </Card>
          <Card className="p-4 md:p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-muted-foreground mb-2">
              <CreditCard className="w-4 h-4" />
              <span>{t('totalPerYear')}</span>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-blue-500 text-center">{totalYearly.toFixed(2)} {getCurrencySymbol()}</div>
          </Card>
          <Card className="p-4 md:p-6 bg-gradient-to-br from-violet-500/10 to-violet-600/5 border-violet-500/20">
            <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-muted-foreground mb-2">
              <Hash className="w-4 h-4" />
              <span>{t('activeSubscriptionsCount')}</span>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-violet-500 text-center">{subscriptions.length}</div>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4 md:space-y-6">
          <TabsList className="grid w-full grid-cols-3 p-1">
            <TabsTrigger value="overview" className="text-xs md:text-sm">{t('overview')}</TabsTrigger>
            <TabsTrigger value="details" className="text-xs md:text-sm">{t('details')}</TabsTrigger>
            <TabsTrigger value="calendar" className="text-xs md:text-sm">{t('calendar')}</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* AI Prediction Card */}
            <AIPredictionCard />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Spending by Category */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card border border-border rounded-xl p-6 shadow-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">{t('spendingByCategory')}</h2>
                  <div className="flex items-center gap-2">
                    <select
                      value={chartType}
                      onChange={(e) => setChartType(e.target.value as 'pie' | 'bar' | 'line')}
                      className="px-3 py-1.5 rounded-lg bg-input border border-border text-sm"
                    >
                      <option value="pie">{t('chartTypePie')}</option>
                      <option value="bar">{t('chartTypeBar')}</option>
                      <option value="line">{t('chartTypeLine')}</option>
                    </select>
                  </div>
                </div>
                {categoryChartData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={300}>
                      {chartType === 'pie' ? (
                        <PieChart>
                          <Pie
                            data={categoryChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomLabel}
                            outerRadius={80}
                            dataKey={displayMode === 'currency' ? 'value' : 'percent'}
                            isAnimationActive={false}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend 
                            verticalAlign="bottom" 
                            height={36}
                            formatter={(value) => <span className="text-sm">{value}</span>}
                          />
                        </PieChart>
                      ) : chartType === 'bar' ? (
                        <BarChart data={categoryChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis 
                            dataKey="name" 
                            stroke={settings.theme === 'dark' ? '#ffffff' : 'hsl(var(--muted-foreground))'} 
                          />
                          <YAxis 
                            stroke={settings.theme === 'dark' ? '#ffffff' : 'hsl(var(--muted-foreground))'} 
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey={displayMode === 'currency' ? 'value' : 'percent'} radius={[8, 8, 0, 0]}>
                            {categoryChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      ) : (
                        <LineChart data={categoryChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis 
                            dataKey="name" 
                            stroke={settings.theme === 'dark' ? '#ffffff' : 'hsl(var(--muted-foreground))'} 
                          />
                          <YAxis 
                            stroke={settings.theme === 'dark' ? '#ffffff' : 'hsl(var(--muted-foreground))'} 
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Line type="monotone" dataKey={displayMode === 'currency' ? 'value' : 'percent'} stroke={settings.theme === 'dark' ? '#f97316' : '#8b5cf6'} strokeWidth={2} />
                        </LineChart>
                      )}
                    </ResponsiveContainer>
                    <div className="flex justify-end mt-4">
                      <button
                        onClick={() => setDisplayMode(displayMode === 'currency' ? 'percent' : 'currency')}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-opacity text-sm font-medium shadow-lg"
                      >
                        {displayMode === 'currency' ? (
                          <>
                            <span className="w-4 h-4 flex items-center justify-center font-bold">%</span>
                            <span>{t('togglePercent')}</span>
                          </>
                        ) : (
                          <>
                            <DollarSign className="w-4 h-4" />
                            <span>{t('togglePercent')}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No data available
                  </div>
                )}
              </motion.div>

              {/* Top Subscriptions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card border border-border rounded-xl p-6 shadow-lg"
              >
                <h2 className="text-xl font-bold mb-4">{t('topSubscriptions')}</h2>
                {topSubscriptions.length > 0 ? (
                  <div className="space-y-3">
                    {topSubscriptions.map((sub, index) => (
                      <div key={sub.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${settings.theme === 'dark' ? 'bg-purple-500 dark:bg-purple-600' : 'bg-gradient-to-r from-orange-500 to-amber-500'} text-white font-bold text-sm`}>
                            #{index + 1}
                          </div>
                          <ServiceLogo logo={sub.icon} name={sub.name} size="md" customLogo={sub.customLogo} />
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="font-medium">{sub.name}</div>
                              {sub.isCustom && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-green-500 to-cyan-500 text-white border-none">
                                  {t('custom')}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">{t('topByExpensesRanked', { rank: index + 1 })}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-orange-500">{sub.price} {getCurrencySymbol()}</div>
                          <div className="text-xs text-muted-foreground">{t('perMonth')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No data available
                  </div>
                )}
              </motion.div>
            </div>

            {/* Spending Trend */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card border border-border rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">{t('spendingTrend')}</h2>
                  <span className="px-2 py-1 text-xs font-semibold bg-gradient-to-r from-green-500 to-cyan-500 text-white rounded-md">
                    AI
                  </span>
                </div>
                <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">{t('periodMonth')}</SelectItem>
                    <SelectItem value="quarter">{t('periodQuarter')}</SelectItem>
                    <SelectItem value="year">{t('periodHalf')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {subscriptions.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={periodTrend}
                    key={`line-spending-${subscriptions.length}-${period}`}
                    margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="period"
                      stroke={settings.theme === 'dark' ? '#ffffff' : 'hsl(var(--muted-foreground))'}
                    />
                    <YAxis
                      stroke={settings.theme === 'dark' ? '#ffffff' : 'hsl(var(--muted-foreground))'}
                    />
                    <Tooltip content={<SpendingTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="spending"
                      stroke={settings.theme === 'dark' ? '#f97316' : '#8b5cf6'}
                      strokeWidth={3}
                      dot={{ fill: settings.theme === 'dark' ? '#f97316' : '#8b5cf6', r: 5 }}
                      name={t('cost')}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground">{t('noData')}</p>
              )}
            </motion.div>

            {/* Spending Forecast */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card border border-border rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xl font-bold">{t('forecastYear')}</h2>
                <span className="px-2 py-1 text-xs font-semibold bg-gradient-to-r from-green-500 to-cyan-500 text-white rounded-md">
                  AI
                </span>
              </div>
              {subscriptions.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={React.useMemo(() => {
                      const INFLATION_RATE = 0.115; // 11.5% годовая инфляция
                      const currentDate = new Date();
                      const currentYear = currentDate.getFullYear();
                      const currentMonth = currentDate.getMonth();
                      const nextYear = currentYear + 1;
                      const monthKeys = ['january', 'february', 'march', 'april', 'may', 'june',
                                         'july', 'august', 'september', 'october', 'november', 'december'] as const;

                      return Array.from({ length: 12 }, (_, monthIndex) => {
                        // 0 = Январь, 11 = Декабрь
                        const month = monthIndex;
                        const year = nextYear;

                        let monthlyTotal = 0;

                        // Суммируем стоимость всех активных подписок в этот месяц
                        for (const sub of subscriptions) {
                          const subCreatedAt = new Date(sub.createdAt || Date.now());
                          const nextBilling = new Date(sub.nextBilling);

                          if (sub.billingCycle === 'monthly') {
                            // Для месячных подписок - считаем, будет ли списание в этом месяце
                            const billingDay = nextBilling.getDate();
                            const testBillingDate = new Date(year, month, billingDay);

                            // Проверяем, что подписка уже существует к этому моменту
                            if (subCreatedAt <= testBillingDate) {
                              const price = parseFloat(sub.price);
                              const priceInUserCurrency = convertPrice(price);
                              monthlyTotal += priceInUserCurrency;
                            }
                          } else if (sub.billingCycle === 'yearly') {
                            // Для годовых подписок - проверяем, совпадает ли мсяц годовщины
                            const anniversaryMonth = subCreatedAt.getMonth();

                            if (month === anniversaryMonth) {
                              const price = parseFloat(sub.price);
                              const priceInUserCurrency = convertPrice(price);
                              monthlyTotal += priceInUserCurrency;
                            }
                          }
                        }

                        // Применяем инфляцию с учетом того, сколько месяцев прошло с текущей даты
                        const monthsFromNow = (year - currentYear) * 12 + (month - currentMonth);

                        // Применяем сложную инфляцию
                        const inflationMultiplier = Math.pow(1 + INFLATION_RATE, monthsFromNow / 12);
                        const forecastSpending = monthlyTotal * inflationMultiplier;

                        return {
                          id: `forecast-${year}-${month}`,
                          period: t(monthKeys[month]),
                          forecast: parseFloat(forecastSpending.toFixed(2)),
                          baseCost: parseFloat(monthlyTotal.toFixed(2))
                        };
                      });
                    }, [subscriptions, convertPrice])}
                    margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="period"
                      stroke={settings.theme === 'dark' ? '#ffffff' : 'hsl(var(--muted-foreground))'}
                    />
                    <YAxis
                      stroke={settings.theme === 'dark' ? '#ffffff' : 'hsl(var(--muted-foreground))'}
                    />
                    <Tooltip content={<SpendingTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="forecast"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ fill: '#10b981', r: 5 }}
                      name={t('forecastInflation')}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No data available
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">{t('detailsTitle')}</h2>
                <div className="text-sm text-muted-foreground">
                  {t('detailsTotalServices')}: {serviceData.length}
                </div>
              </div>

              {serviceData.length > 0 ? (
                <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
                  <table className="w-full min-w-[640px]">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 md:py-3 px-2 text-xs md:text-sm">{t('detailsService')}</th>
                        <th className="text-left py-2 md:py-3 px-2 text-xs md:text-sm">{t('detailsCategory')}</th>
                        <th className="text-right py-2 md:py-3 px-2 text-xs md:text-sm">{t('detailsPricePerMonth')}</th>
                        <th className="text-right py-2 md:py-3 px-2 text-xs md:text-sm">{t('detailsCycle')}</th>
                        <th className="text-right py-2 md:py-3 px-2 text-xs md:text-sm">{t('detailsFullPrice')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {serviceData.map((service) => (
                        <tr key={service.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                          <td className="py-2 md:py-3 px-2">
                            <div className="flex items-center gap-2">
                              <ServiceLogo logo={service.logo} name={service.name} size="sm" customLogo={service.customLogo} />
                              <span className="font-medium text-xs md:text-sm">{service.name}</span>
                            </div>
                          </td>
                          <td className="py-2 md:py-3 px-2 text-muted-foreground text-xs md:text-sm">{service.category}</td>
                          <td className="py-2 md:py-3 px-2 text-right font-semibold text-orange-500 text-xs md:text-sm">
                            {service.monthlyPrice} {getCurrencySymbol()}
                          </td>
                          <td className="py-2 md:py-3 px-2 text-right text-muted-foreground text-xs md:text-sm">
                            {t(service.billingCycle)}
                          </td>
                          <td className="py-2 md:py-3 px-2 text-right font-medium text-xs md:text-sm">
                            {service.totalPrice} {getCurrencySymbol()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-border font-bold">
                        <td colSpan={2} className="py-2 md:py-3 px-2 text-xs md:text-sm">Итого</td>
                        <td className="py-2 md:py-3 px-2 text-right text-orange-500 text-xs md:text-sm">
                          {totalMonthly.toFixed(2)} {getCurrencySymbol()}
                        </td>
                        <td className="py-2 md:py-3 px-2"></td>
                        <td className="py-2 md:py-3 px-2 text-right text-xs md:text-sm">
                          {totalYearly.toFixed(2)} {getCurrencySymbol()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  Нет данных ля отображения
                </div>
              )}
            </motion.div>

            {/* Category breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card border border-border rounded-xl p-6 shadow-lg"
            >
              <h2 className="text-xl font-bold mb-4">Расходы по катеориям</h2>
              <div className="space-y-3">
                {Object.entries(categoryData)
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, amount], index) => {
                    const percentage = (amount / totalMonthly) * 100;
                    return (
                      <div key={category} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{t(category)}</span>
                          <span className="text-orange-500 font-semibold">
                            {amount.toFixed(2)} {getCurrencySymbol()} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500"
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: COLORS[index % COLORS.length]
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </motion.div>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <PaymentCalendar subscriptions={subscriptions} />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Month Subscriptions Modal */}
      {selectedMonthData && (
        <MonthSubscriptionsModal
          isOpen={showMonthModal}
          onClose={() => setShowMonthModal(false)}
          month={selectedMonthData.month}
          subscriptions={selectedMonthData.subscriptions}
          currencySymbol={getCurrencySymbol()}
        />
      )}
    </ChartWrapper>
  );
}