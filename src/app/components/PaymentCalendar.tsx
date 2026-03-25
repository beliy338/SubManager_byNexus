import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../contexts/AppContext';
import { ServiceLogo } from './ServiceLogo';

interface PaymentCalendarProps {
  subscriptions: any[];
}

interface DayPayment {
  date: Date;
  subscriptions: any[];
  totalAmount: number;
}

export function PaymentCalendar({ subscriptions }: PaymentCalendarProps) {
  const { getCurrencySymbol, convertPrice, t } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<DayPayment | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  // Adjust to start week on Monday (0 = Sunday, 1 = Monday, etc.)
  // Convert Sunday (0) to 6, Monday (1) to 0, Tuesday (2) to 1, etc.
  let startingDayOfWeek = firstDayOfMonth.getDay();
  startingDayOfWeek = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;

  // Get month names from translations
  const monthNames = [
    t('month_january'), t('month_february'), t('month_march'), t('month_april'),
    t('month_may'), t('month_june'), t('month_july'), t('month_august'),
    t('month_september'), t('month_october'), t('month_november'), t('month_december')
  ];

  // Day names - starting with Monday
  const dayNames = [
    t('day_mon'), t('day_tue'), t('day_wed'), t('day_thu'),
    t('day_fri'), t('day_sat'), t('day_sun')
  ];

  // Calculate payments for each day
  const getPaymentsForDay = (day: number): DayPayment => {
    const date = new Date(year, month, day);
    const daySubscriptions = subscriptions.filter(sub => {
      const nextBilling = new Date(sub.nextBilling);
      const matchesNextBilling = nextBilling.getDate() === day &&
             nextBilling.getMonth() === month &&
             nextBilling.getFullYear() === year;
      
      // Also check if this day matches the previous billing date (for overdue subscriptions)
      if (sub.previousBilling) {
        const previousBilling = new Date(sub.previousBilling);
        const matchesPreviousBilling = previousBilling.getDate() === day &&
               previousBilling.getMonth() === month &&
               previousBilling.getFullYear() === year;
        
        return matchesNextBilling || matchesPreviousBilling;
      }
      
      return matchesNextBilling;
    });

    const totalAmount = daySubscriptions.reduce((sum, sub) => sum + convertPrice(sub.price), 0);

    return {
      date,
      subscriptions: daySubscriptions,
      totalAmount
    };
  };

  // Previous month
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  // Next month
  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Go to today
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Year navigation
  const goToPreviousYear = () => {
    setCurrentDate(new Date(year - 1, month, 1));
  };

  const goToNextYear = () => {
    setCurrentDate(new Date(year + 1, month, 1));
  };

  // Generate calendar days
  const calendarDays = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of day
  
  // Add empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="aspect-square" />);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayPayment = getPaymentsForDay(day);
    const hasPayments = dayPayment.subscriptions.length > 0;
    const dayDate = new Date(year, month, day);
    dayDate.setHours(0, 0, 0, 0);
    
    const isToday = dayDate.getTime() === today.getTime();
    const isPast = dayDate < today;
    const hasSinglePayment = dayPayment.subscriptions.length === 1;
    const hasMultiplePayments = dayPayment.subscriptions.length > 1;

    calendarDays.push(
      <button
        key={day}
        onClick={() => hasPayments && setSelectedDay(dayPayment)}
        className={`aspect-square p-1 rounded-md relative transition-all text-xs overflow-hidden ${
          hasPayments
            ? 'hover:opacity-80 cursor-pointer'
            : 'hover:bg-muted cursor-default'
        } ${
          isToday ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''
        }`}
      >
        {/* Background for single subscription - show logo */}
        {hasSinglePayment && (
          <div className={`absolute inset-0 flex items-center justify-center ${isPast ? 'opacity-40' : ''}`}>
            <ServiceLogo
              logo={dayPayment.subscriptions[0].icon}
              name={dayPayment.subscriptions[0].name}
              size="sm"
              variant="square"
              customLogo={dayPayment.subscriptions[0].customLogo}
              className="!w-full !h-full !rounded-md"
            />
          </div>
        )}
        
        {/* Background for multiple subscriptions - show gradient */}
        {hasMultiplePayments && (
          <div className={`absolute inset-0 ${
            isPast
              ? 'bg-gray-400'
              : 'bg-gradient-to-br from-blue-500 to-purple-600'
          }`} />
        )}
        
        {/* Red diagonal line for overdue payments */}
        {isPast && hasPayments && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <line 
                  x1="0" 
                  y1="0" 
                  x2="100" 
                  y2="100" 
                  stroke="red" 
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        )}
        
        {/* Day number */}
        <span className={`relative z-10 ${
          hasPayments
            ? hasMultiplePayments || (hasSinglePayment && !isPast) ? 'font-bold text-white' : 'font-bold'
            : ''
        }`}>
          {day}
        </span>
        
        {/* Payment indicator dot */}
        {hasPayments && (
          <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 z-10">
            <div className={`w-1 h-1 rounded-full ${
              hasMultiplePayments || (hasSinglePayment && !isPast) ? 'bg-white' : 'bg-foreground'
            }`} />
          </div>
        )}
      </button>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg md:text-xl font-bold">{t('paymentCalendar')}</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm bg-muted hover:bg-muted/80 rounded-lg transition-colors"
          >
            {t('calendar_today')}
          </button>
        </div>
      </div>

      {/* Year Navigation */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={goToPreviousYear}
          className="p-1.5 md:p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
        </button>
        <h4 className="text-base md:text-lg font-semibold">
          {year}
        </h4>
        <button
          onClick={goToNextYear}
          className="p-1.5 md:p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={goToPreviousMonth}
          className="p-1.5 md:p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
        </button>
        <h4 className="text-base md:text-lg font-semibold">
          {monthNames[month]}
        </h4>
        <button
          onClick={goToNextMonth}
          className="p-1.5 md:p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-0.5 md:gap-1 mb-1 md:mb-2">
        {dayNames.map(name => (
          <div key={name} className="text-center text-xs md:text-sm font-medium text-muted-foreground">
            {name}
          </div>
        ))}
      </div>

      {/* Calendar grid - уменьшенные размеры и расстояния */}
      <div className="grid grid-cols-7 gap-0.5 md:gap-1">
        {calendarDays}
      </div>

      {/* Legend */}
      <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-border">
        <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 md:w-4 md:h-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded" />
            <span>{t('calendar_legend_payments')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 md:w-4 md:h-4 bg-gray-400 rounded" />
            <span>{t('calendar_legend_past')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-primary rounded" />
            <span>{t('calendar_legend_today')}</span>
          </div>
        </div>
      </div>

      {/* Payment Details Modal */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedDay(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md p-6"
            >
              <h3 className="text-xl font-bold mb-2">
                {t('calendar_payments_on')} {selectedDay.date.getDate()} {monthNames[selectedDay.date.getMonth()]}
              </h3>
              <p className="text-muted-foreground mb-4">
                {t('calendar_total')}: <span className="font-bold text-foreground">
                  {selectedDay.totalAmount.toFixed(2)} {getCurrencySymbol()}
                </span>
              </p>

              <div className="space-y-3">
                {selectedDay.subscriptions.map(sub => (
                  <div
                    key={sub.id}
                    className="p-4 bg-muted rounded-lg border border-border"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{sub.name}</span>
                      <span className="font-bold text-primary">
                        {convertPrice(sub.price).toFixed(2)} {getCurrencySymbol()}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t(sub.billingCycle)}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setSelectedDay(null)}
                className="mt-6 w-full px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
              >
                {t('calendar_close')}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}