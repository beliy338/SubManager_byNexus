import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../utils/supabase';
import { translations, Language, currencyRates } from '../utils/translations';

interface Settings {
  language: Language;
  currency: string;
  fontSize: 'small' | 'medium' | 'large';
  theme: 'dark' | 'light';
  ai_permission?: 'yes' | 'later' | 'never' | null;
}

interface Subscription {
  id: string;
  name: string;
  category: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  nextBilling: string;
  previousBilling?: string; // For overdue subscriptions, stores the old billing date
  status: string;
  icon?: string; // Icon/emoji/logo for the service
  isCustom?: boolean; // Indicates if this is a custom user-created subscription
  customLogo?: string; // Base64 logo for custom subscriptions
  createdAt: string;
  updatedAt: string;
}

interface AppContextType {
  user: any;
  accessToken: string | null;
  settings: Settings;
  subscriptions: Subscription[];
  isLoading: boolean;
  isSyncing: boolean;
  t: (key: string, params?: Record<string, any>) => string;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
  addSubscription: (subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateSubscription: (id: string, updates: Partial<Subscription>) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
  convertPrice: (price: number, fromCurrency?: string) => number;
  convertToRub: (price: number, fromCurrency?: string) => number;
  getCurrencySymbol: () => string;
  signOut: () => Promise<void>;
  refreshData: () => Promise<void>;
  loginWithTestAccount: (testUser: any) => void;
  updateUserProfile: (profile: { name?: string; phone?: string; country?: string }) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings>({
    language: 'ru',
    currency: 'RUB',
    fontSize: 'medium',
    theme: 'dark'
  });
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const t = (key: string, params?: Record<string, any>): string => {
    const keys = key.split('.');
    let value: any = translations[settings.language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    // If no translation found, return key
    if (!value) return key;
    
    // Replace placeholders like {rank} with actual values
    if (params) {
      Object.keys(params).forEach(param => {
        value = value.replace(new RegExp(`\\{${param}\\}`, 'g'), params[param]);
      });
    }
    
    return value;
  };

  const getCurrencySymbol = () => {
    const symbols: Record<string, string> = {
      RUB: '₽',
      USD: '$',
      EUR: '€',
      CNY: '¥',
      BYN: 'Br'
    };
    return symbols[settings.currency] || settings.currency;
  };

  const convertPrice = (price: number, fromCurrency: string = 'RUB'): number => {
    if (fromCurrency === settings.currency) return price;
    
    // Convert to RUB first, then to target currency
    const priceInRub = price * currencyRates[fromCurrency];
    return priceInRub / currencyRates[settings.currency];
  };

  const convertToRub = (price: number, fromCurrency: string = 'RUB'): number => {
    if (fromCurrency === 'RUB') return price;
    
    // Convert to RUB
    return price * currencyRates[fromCurrency];
  };

  // Helper function to send notifications
  const sendNotification = async (
    notificationType: 'subscription_added' | 'subscription_deleted' | 'subscription_updated',
    subscriptionData: any,
    changes?: Record<string, { old: any; new: any }>
  ) => {
    if (!user?.id || !user?.email || accessToken === 'test-token') return;
    
    try {
      const metadata: any = {
        subscription_name: subscriptionData.name,
        price: subscriptionData.price,
        billing_cycle: subscriptionData.billingCycle,
        currency: settings.currency,
      };
      
      if (subscriptionData.nextBilling) {
        metadata.next_billing = subscriptionData.nextBilling;
      }
      
      if (changes) {
        metadata.changes = changes;
      }
      
      const subject = 
        notificationType === 'subscription_added' ? t('subscriptionAdded_email_subject') :
        notificationType === 'subscription_deleted' ? t('subscriptionDeleted_email_subject') :
        t('subscriptionUpdated_email_subject');
      
      await supabase.from('notification_logs').insert({
        user_id: user.id,
        subscription_id: subscriptionData.id,
        notification_type: notificationType,
        email: user.email,
        subject,
        metadata,
        language: settings.language
      });
      
      console.log(`Notification ${notificationType} queued for sending`);
    } catch (error) {
      console.error('Error queuing notification:', error);
    }
  };

  // Helper function to create in-app notifications
  const createInAppNotification = async (
    type: string,
    titleKey: string,
    messageKey: string,
    metadata?: any
  ) => {
    console.log('createInAppNotification called:', { type, titleKey, messageKey, metadata, userId: user?.id, accessToken: accessToken?.substring(0, 10) + '...' });
    
    if (!user?.id || accessToken === 'test-token') {
      console.log('Skipping in-app notification (test user or no user)');
      return;
    }
    
    try {
      const { data, error } = await supabase.from('notifications').insert({
        user_id: user.id,
        type,
        title: titleKey, // Store key instead of translated text
        message: messageKey, // Store key instead of translated text
        metadata,
        is_read: false
      }).select();
      
      if (error) {
        console.error('Error creating in-app notification:', error);
        throw error;
      }
      
      console.log(`In-app notification ${type} created successfully:`, data);
    } catch (error) {
      console.error('Error creating in-app notification:', error);
    }
  };

  // Convert snake_case from DB to camelCase for app
  const dbToAppSubscription = (dbSub: any): Subscription => ({
    id: dbSub.id,
    name: dbSub.name,
    category: dbSub.category,
    price: parseFloat(dbSub.price),
    billingCycle: dbSub.billing_cycle,
    nextBilling: dbSub.next_billing,
    previousBilling: dbSub.previous_billing, // Add previous billing date
    status: dbSub.status,
    icon: dbSub.icon, // Add icon to subscription
    isCustom: dbSub.is_custom,
    customLogo: dbSub.custom_logo,
    createdAt: dbSub.created_at,
    updatedAt: dbSub.updated_at
  });

  // Convert camelCase from app to snake_case for DB
  const appToDbSubscription = (appSub: Partial<Subscription>): any => {
    const dbSub: any = {};
    if (appSub.name !== undefined) dbSub.name = appSub.name;
    if (appSub.category !== undefined) dbSub.category = appSub.category;
    if (appSub.price !== undefined) dbSub.price = appSub.price;
    if (appSub.billingCycle !== undefined) dbSub.billing_cycle = appSub.billingCycle;
    if (appSub.nextBilling !== undefined) dbSub.next_billing = appSub.nextBilling;
    if (appSub.previousBilling !== undefined) dbSub.previous_billing = appSub.previousBilling; // Add previous billing date
    if (appSub.status !== undefined) dbSub.status = appSub.status;
    if (appSub.icon !== undefined) dbSub.icon = appSub.icon; // Add icon to subscription
    if (appSub.isCustom !== undefined) dbSub.is_custom = appSub.isCustom;
    if (appSub.customLogo !== undefined) dbSub.custom_logo = appSub.customLogo;
    return dbSub;
  };

  // Convert DB settings to app settings
  const dbToAppSettings = (dbSettings: any): Settings => ({
    language: dbSettings.language as Language,
    currency: dbSettings.currency,
    fontSize: dbSettings.font_size as 'small' | 'medium' | 'large',
    theme: dbSettings.theme as 'dark' | 'light',
    ai_permission: dbSettings.ai_permission as 'yes' | 'later' | 'never' | null
  });

  // Convert app settings to DB settings
  const appToDbSettings = (appSettings: Partial<Settings>): any => {
    const dbSettings: any = {};
    if (appSettings.language !== undefined) dbSettings.language = appSettings.language;
    if (appSettings.currency !== undefined) dbSettings.currency = appSettings.currency;
    if (appSettings.fontSize !== undefined) dbSettings.font_size = appSettings.fontSize;
    if (appSettings.theme !== undefined) dbSettings.theme = appSettings.theme;
    if (appSettings.ai_permission !== undefined) dbSettings.ai_permission = appSettings.ai_permission;
    return dbSettings;
  };

  const loadUserData = async (userId: string) => {
    try {
      console.log('Loading user data from Supabase...');
      setIsSyncing(true);

      // Load subscriptions from Supabase
      const { data: subsData, error: subsError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (subsError) {
        console.error('Error loading subscriptions:', subsError);
      } else {
        const appSubs = (subsData || []).map(dbToAppSubscription);
        
        // Handle overdue subscriptions - move billing date 30 days forward
        await handleOverdueSubscriptions(userId, appSubs);
        
        // Reload subscriptions after handling overdue ones
        const { data: updatedSubsData } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        
        const updatedAppSubs = (updatedSubsData || []).map(dbToAppSubscription);
        setSubscriptions(updatedAppSubs);
        console.log('Loaded subscriptions:', updatedAppSubs.length);
        
        // Check upcoming payments and create notifications
        await checkUpcomingPayments(userId, updatedAppSubs);
      }

      // Load settings from Supabase
      const { data: settingsData, error: settingsError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (settingsError) {
        if (settingsError.code === 'PGRST116') {
          // No settings found, create default settings
          console.log('Creating default settings...');
          const defaultSettings = {
            user_id: userId,
            language: 'ru',
            currency: 'RUB',
            font_size: 'medium',
            theme: 'dark'
          };
          
          const { error: insertError } = await supabase
            .from('user_settings')
            .insert(defaultSettings);
            
          if (insertError) {
            console.error('Error creating default settings:', insertError);
          } else {
            setSettings({
              language: 'ru',
              currency: 'RUB',
              fontSize: 'medium',
              theme: 'dark'
            });
          }
        } else {
          console.error('Error loading settings:', settingsError);
        }
      } else if (settingsData) {
        const appSettings = dbToAppSettings(settingsData);
        setSettings(appSettings);
        
        // Apply theme
        if (appSettings.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        
        // Apply font size
        document.documentElement.className = document.documentElement.className
          .replace(/text-(small|medium|large)/g, '')
          .trim();
        document.documentElement.classList.add(`text-${appSettings.fontSize}`);
        
        console.log('Loaded settings:', appSettings);
      }

      setIsSyncing(false);
    } catch (error) {
      console.error('Error loading user data:', error);
      setIsSyncing(false);
    }
  };

  // Handle overdue subscriptions - move billing date to same day next month
  const handleOverdueSubscriptions = async (userId: string, subs: Subscription[]) => {
    if (!userId || subs.length === 0) return;

    try {
      const now = new Date();
      // Set to start of day to compare dates without time
      now.setHours(0, 0, 0, 0);

      for (const sub of subs) {
        const nextBillingDate = new Date(sub.nextBilling);
        // Set to start of day for fair comparison
        nextBillingDate.setHours(0, 0, 0, 0);

        // Calculate days until billing (using full days, not fractional)
        const daysUntilBilling = Math.ceil((nextBillingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        console.log(`Checking subscription ${sub.name}: next billing ${sub.nextBilling}, days until: ${daysUntilBilling}`);

        // If subscription is overdue, move billing date to same day next month
        if (daysUntilBilling < 0) {
          const originalDay = nextBillingDate.getDate();
          const newNextBillingDate = new Date(nextBillingDate.getFullYear(), nextBillingDate.getMonth() + 1, 1);

          // Get last day of the new month
          const lastDayOfNewMonth = new Date(newNextBillingDate.getFullYear(), newNextBillingDate.getMonth() + 1, 0).getDate();

          // Use original day if it exists in new month, otherwise use last day
          const targetDay = Math.min(originalDay, lastDayOfNewMonth);
          newNextBillingDate.setDate(targetDay);

          const newNextBilling = newNextBillingDate.toISOString().split('T')[0];

          console.log(`Subscription ${sub.name} is overdue. Moving next billing to ${newNextBilling}`);

          // Update subscription in Supabase
          const { error } = await supabase
            .from('subscriptions')
            .update({ next_billing: newNextBilling, previous_billing: sub.nextBilling })
            .eq('id', sub.id)
            .eq('user_id', userId);

          if (error) {
            console.error('Error updating subscription:', error);
          } else {
            console.log(`Subscription ${sub.name} updated successfully`);
          }
        }
      }
    } catch (error) {
      console.error('Error handling overdue subscriptions:', error);
    }
  };

  // Check upcoming payments and create notifications
  const checkUpcomingPayments = async (userId: string, subs: Subscription[]) => {
    if (!userId || subs.length === 0) return;

    try {
      const now = new Date();
      // Set to start of day to compare dates without time
      now.setHours(0, 0, 0, 0);
      
      for (const sub of subs) {
        const nextBillingDate = new Date(sub.nextBilling);
        // Set to start of day for fair comparison
        nextBillingDate.setHours(0, 0, 0, 0);
        
        // Calculate days until billing (using full days, not fractional)
        const daysUntilBilling = Math.ceil((nextBillingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        console.log(`Checking subscription ${sub.name}: next billing ${sub.nextBilling}, days until: ${daysUntilBilling}`);
        
        // Check if we need to create notifications for 1 or 3 days before billing
        if (daysUntilBilling === 1 || daysUntilBilling === 3) {
          const notificationType = daysUntilBilling === 1 ? 'billing_1day' : 'billing_3day';
          
          // Check if notification already exists for today
          const todayStart = new Date();
          todayStart.setHours(0, 0, 0, 0);
          
          const { data: existingNotifs } = await supabase
            .from('notifications')
            .select('id')
            .eq('user_id', userId)
            .eq('type', notificationType)
            .eq('metadata->>subscription_id', sub.id)
            .gte('created_at', todayStart.toISOString());
          
          if (!existingNotifs || existingNotifs.length === 0) {
            // Create notification
            await createInAppNotification(
              notificationType,
              notificationType === 'billing_1day' 
                ? 'notification_billing_1day_title' 
                : 'notification_billing_3day_title',
              notificationType === 'billing_1day' 
                ? 'notification_billing_1day_message' 
                : 'notification_billing_3day_message',
              {
                subscription_id: sub.id,
                subscription_name: sub.name,
                price: sub.price,
                billing_date: sub.nextBilling,
                days_until: daysUntilBilling
              }
            );
            console.log(`Created ${notificationType} notification for subscription ${sub.name} (${daysUntilBilling} days until billing)`);
          } else {
            console.log(`Notification ${notificationType} for subscription ${sub.name} already exists for today`);
          }
        }
      }
    } catch (error) {
      console.error('Error checking upcoming payments:', error);
    }
  };

  const refreshData = async () => {
    if (user?.id) {
      await loadUserData(user.id);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check for test user in sessionStorage first
        const testUserStr = sessionStorage.getItem('testUser');
        if (testUserStr) {
          const testUser = JSON.parse(testUserStr);
          setUser(testUser);
          setAccessToken('test-token');
          
          // Load local subscriptions for test users
          const localSubs = JSON.parse(localStorage.getItem(`subscriptions_${testUser.userId}`) || '[]');
          setSubscriptions(localSubs);
          
          // Load local settings for test users
          const localSettings = JSON.parse(localStorage.getItem(`settings_${testUser.userId}`) || 'null');
          if (localSettings) {
            setSettings(localSettings);
            // Apply theme
            if (localSettings.theme === 'dark') {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
            // Apply font size
            document.documentElement.className = document.documentElement.className
              .replace(/text-(small|medium|large)/g, '')
              .trim();
            document.documentElement.classList.add(`text-${localSettings.fontSize}`);
          } else {
            // Apply default theme for test users
            document.documentElement.classList.add('dark');
            document.documentElement.classList.add('text-medium');
          }
          
          setIsLoading(false);
          return;
        }

        // Otherwise check Supabase auth
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && session?.access_token) {
          setUser(session.user);
          setAccessToken(session.access_token);
          await loadUserData(session.user.id);
        } else {
          // Apply default dark theme for non-authenticated users
          document.documentElement.classList.add('dark');
          document.documentElement.classList.add('text-medium');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Apply default dark theme on error
        document.documentElement.classList.add('dark');
        document.documentElement.classList.add('text-medium');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Track previous user ID to prevent unnecessary reloads
    let previousUserId: string | null = null;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      
      if (session?.user && session?.access_token) {
        // Only reload data if user changed (not just session refresh)
        if (previousUserId !== session.user.id) {
          console.log('User changed, loading data...');
          setUser(session.user);
          setAccessToken(session.access_token);
          await loadUserData(session.user.id);
          previousUserId = session.user.id;
        } else {
          // Just update the session without reloading everything
          setUser(session.user);
          setAccessToken(session.access_token);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        setUser(null);
        setAccessToken(null);
        setSubscriptions([]);
        previousUserId = null;
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Realtime subscription for database changes
  useEffect(() => {
    if (!user?.id || accessToken === 'test-token') return;

    console.log('Setting up realtime subscriptions for user:', user.id);

    // Subscribe to subscription changes
    const subscriptionsChannel = supabase
      .channel('subscriptions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Subscription changed:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newSub = dbToAppSubscription(payload.new);
            setSubscriptions(prev => {
              // Avoid duplicates
              if (prev.some(s => s.id === newSub.id)) return prev;
              return [...prev, newSub];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedSub = dbToAppSubscription(payload.new);
            setSubscriptions(prev => 
              prev.map(sub => sub.id === updatedSub.id ? updatedSub : sub)
            );
          } else if (payload.eventType === 'DELETE') {
            setSubscriptions(prev => 
              prev.filter(sub => sub.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    // Subscribe to settings changes
    const settingsChannel = supabase
      .channel('settings-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_settings',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Settings changed:', payload);
          const updatedSettings = dbToAppSettings(payload.new);
          setSettings(updatedSettings);
          
          // Apply theme
          if (updatedSettings.theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          
          // Apply font size
          document.documentElement.className = document.documentElement.className
            .replace(/text-(small|medium|large)/g, '')
            .trim();
          document.documentElement.classList.add(`text-${updatedSettings.fontSize}`);
        }
      )
      .subscribe();

    // Subscribe to notifications changes
    const notificationsChannel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Notification changed:', payload);
          
          if (payload.eventType === 'INSERT') {
            // Trigger reload of notifications by dispatching custom event
            window.dispatchEvent(new CustomEvent('notification-added'));
          } else if (payload.eventType === 'UPDATE') {
            window.dispatchEvent(new CustomEvent('notification-updated'));
          } else if (payload.eventType === 'DELETE') {
            window.dispatchEvent(new CustomEvent('notification-deleted'));
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Unsubscribing from realtime channels');
      subscriptionsChannel.unsubscribe();
      settingsChannel.unsubscribe();
      notificationsChannel.unsubscribe();
    };
  }, [user?.id, accessToken]);

  // Periodic check for upcoming payments (every hour)
  useEffect(() => {
    if (!user?.id || accessToken === 'test-token' || subscriptions.length === 0) return;

    console.log('Setting up periodic check for upcoming payments');

    // Check immediately
    checkUpcomingPayments(user.id, subscriptions);

    // Then check every hour
    const intervalId = setInterval(() => {
      console.log('Running periodic check for upcoming payments');
      checkUpcomingPayments(user.id, subscriptions);
    }, 60 * 60 * 1000); // 1 hour

    return () => {
      clearInterval(intervalId);
    };
  }, [user?.id, accessToken, subscriptions]);

  const updateSettings = async (newSettings: Partial<Settings>) => {
    const oldSettings = { ...settings };
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    // Apply theme
    if (newSettings.theme) {
      if (newSettings.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

    // Apply font size
    if (newSettings.fontSize) {
      document.documentElement.className = document.documentElement.className
        .replace(/text-(small|medium|large)/g, '')
        .trim();
      document.documentElement.classList.add(`text-${newSettings.fontSize}`);
    }

    // Check if test user
    if (accessToken === 'test-token' && user?.userId) {
      // Save to localStorage for test users
      localStorage.setItem(`settings_${user.userId}`, JSON.stringify(updatedSettings));
      return;
    }

    // Save to Supabase for real users
    if (!user?.id) return;

    try {
      setIsSyncing(true);
      const dbSettings = appToDbSettings(newSettings);
      
      const { error } = await supabase
        .from('user_settings')
        .update(dbSettings)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating settings:', error);
        throw error;
      }
      
      // Create in-app notification for settings change
      await createInAppNotification(
        'settings_updated',
        'notification_settings_updated_title',
        'notification_settings_updated_message',
        { 
          old_settings: oldSettings,
          new_settings: updatedSettings 
        }
      );
      
      console.log('Settings updated successfully');
      setIsSyncing(false);
    } catch (error) {
      console.error('Error updating settings:', error);
      setIsSyncing(false);
      throw error;
    }
  };

  const addSubscription = async (subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!accessToken) return;

    // Check if test user
    if (accessToken === 'test-token' && user?.userId) {
      const newSub: Subscription = {
        ...subscription,
        id: `sub-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const updatedSubs = [...subscriptions, newSub];
      setSubscriptions(updatedSubs);
      localStorage.setItem(`subscriptions_${user.userId}`, JSON.stringify(updatedSubs));
      return;
    }

    // Save to Supabase for real users
    if (!user?.id) return;

    try {
      setIsSyncing(true);
      const dbSub = {
        ...appToDbSubscription(subscription),
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('subscriptions')
        .insert(dbSub)
        .select()
        .single();

      if (error) {
        console.error('Error adding subscription:', error);
        throw error;
      }

      const newSub = dbToAppSubscription(data);
      setSubscriptions([...subscriptions, newSub]);
      console.log('Subscription added successfully');
      
      // Send email notification
      await sendNotification('subscription_added', newSub);
      
      // Create in-app notification
      await createInAppNotification(
        'subscription_added',
        'notification_subscription_added_title',
        'notification_subscription_added_message',
        { subscription_name: newSub.name, subscription_id: newSub.id }
      );
      
      setIsSyncing(false);
    } catch (error) {
      console.error('Error adding subscription:', error);
      setIsSyncing(false);
      throw error;
    }
  };

  const updateSubscription = async (id: string, updates: Partial<Subscription>) => {
    if (!accessToken) return;

    // Check if test user
    if (accessToken === 'test-token' && user?.userId) {
      const updatedSubs = subscriptions.map(sub =>
        sub.id === id ? { ...sub, ...updates, updatedAt: new Date().toISOString() } : sub
      );
      setSubscriptions(updatedSubs);
      localStorage.setItem(`subscriptions_${user.userId}`, JSON.stringify(updatedSubs));
      return;
    }

    // Update in Supabase for real users
    if (!user?.id) return;

    try {
      setIsSyncing(true);
      const dbUpdates = appToDbSubscription(updates);

      const { data, error } = await supabase
        .from('subscriptions')
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating subscription:', error);
        throw error;
      }

      const updatedSub = dbToAppSubscription(data);
      setSubscriptions(subscriptions.map(sub => sub.id === id ? updatedSub : sub));
      console.log('Subscription updated successfully');
      
      // Send email notification
      await sendNotification('subscription_updated', updatedSub, dbUpdates);
      
      // Create in-app notification
      await createInAppNotification(
        'subscription_updated',
        'notification_subscription_updated_title',
        'notification_subscription_updated_message',
        { subscription_name: updatedSub.name, subscription_id: updatedSub.id, changes: dbUpdates }
      );
      
      setIsSyncing(false);
    } catch (error) {
      console.error('Error updating subscription:', error);
      setIsSyncing(false);
      throw error;
    }
  };

  const deleteSubscription = async (id: string) => {
    if (!accessToken) return;

    // Check if test user
    if (accessToken === 'test-token' && user?.userId) {
      const updatedSubs = subscriptions.filter(sub => sub.id !== id);
      setSubscriptions(updatedSubs);
      localStorage.setItem(`subscriptions_${user.userId}`, JSON.stringify(updatedSubs));
      return;
    }

    // Delete from Supabase for real users
    if (!user?.id) return;

    try {
      setIsSyncing(true);

      // Get subscription data before deleting for notification
      const deletedSub = subscriptions.find(sub => sub.id === id);

      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting subscription:', error);
        throw error;
      }

      setSubscriptions(subscriptions.filter(sub => sub.id !== id));
      console.log('Subscription deleted successfully');
      
      // Send email notification
      if (deletedSub) {
        await sendNotification('subscription_deleted', deletedSub);
        
        // Create in-app notification with subscription data for restore
        await createInAppNotification(
          'subscription_deleted',
          'notification_subscription_deleted_title',
          'notification_subscription_deleted_message',
          { 
            subscription_name: deletedSub.name,
            deleted_subscription: deletedSub  // Save full subscription data for restore
          }
        );
      }
      
      setIsSyncing(false);
    } catch (error) {
      console.error('Error deleting subscription:', error);
      setIsSyncing(false);
      throw error;
    }
  };

  const signOut = async () => {
    // Clear test user
    sessionStorage.removeItem('testUser');
    
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    setUser(null);
    setAccessToken(null);
    setSubscriptions([]);
  };

  const loginWithTestAccount = (testUser: any) => {
    sessionStorage.setItem('testUser', JSON.stringify(testUser));
    setUser(testUser);
    setAccessToken('test-token');

    // Load subscriptions
    const localSubs = JSON.parse(localStorage.getItem(`subscriptions_${testUser.userId}`) || '[]');
    setSubscriptions(localSubs);

    // Load settings
    const localSettings = JSON.parse(localStorage.getItem(`settings_${testUser.userId}`) || 'null');
    if (localSettings) {
      setSettings(localSettings);
      if (localSettings.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.add('text-medium');
    }
  };

  const updateUserProfile = async (profile: { name?: string; phone?: string; country?: string }) => {
    if (!user) return;

    // Check if test user
    if (accessToken === 'test-token' && user?.userId) {
      // Update test user in sessionStorage
      const updatedUser = {
        ...user,
        user_metadata: {
          ...user.user_metadata,
          ...profile
        }
      };
      sessionStorage.setItem('testUser', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return;
    }

    // Update Supabase user for real users
    try {
      setIsSyncing(true);

      // Save old values for comparison
      const oldName = user?.user_metadata?.name;
      const oldPhone = user?.user_metadata?.phone;
      const oldEmail = user?.email;

      const { error } = await supabase.auth.updateUser({
        data: {
          name: profile.name,
          phone: profile.phone,
          country: profile.country
        }
      });

      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }

      // Update local user state
      const { data: { user: updatedUser } } = await supabase.auth.getUser();
      if (updatedUser) {
        setUser(updatedUser);
      }

      // Create notifications for changed fields
      const changes: string[] = [];
      if (profile.name && profile.name !== oldName) {
        changes.push(`Имя изменено с "${oldName || 'не указано'}" на "${profile.name}"`);
      }
      if (profile.phone && profile.phone !== oldPhone) {
        changes.push(`Номер телефона изменен с "${oldPhone || 'не указано'}" на "${profile.phone}"`);
      }

      // Create notification if there are any changes
      if (changes.length > 0) {
        await createInAppNotification(
          'profile_updated',
          'notification_profile_updated_title',
          'notification_profile_updated_message',
          {
            changes: changes.join('; ')
          }
        );
      }

      setIsSyncing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setIsSyncing(false);
      throw error;
    }
  };

  return (
    <AppContext.Provider value={{
      user,
      accessToken,
      settings,
      subscriptions,
      isLoading,
      isSyncing,
      t,
      updateSettings,
      addSubscription,
      updateSubscription,
      deleteSubscription,
      convertPrice,
      convertToRub,
      getCurrencySymbol,
      signOut,
      refreshData,
      loginWithTestAccount,
      updateUserProfile
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}