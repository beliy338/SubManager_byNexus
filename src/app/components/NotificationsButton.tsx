import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NotificationsModal } from './NotificationsModal';
import { useApp } from '../contexts/AppContext';
import { supabase } from '../utils/supabase';

export function NotificationsButton() {
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useApp();

  // Load unread count whenever user changes
  useEffect(() => {
    if (!user?.id) {
      setUnreadCount(0);
      return;
    }

    loadUnreadCount();

    // Set up periodic check for new notifications (every 5 seconds)
    const intervalId = setInterval(() => {
      loadUnreadCount();
    }, 5000); // 5 seconds

    return () => {
      clearInterval(intervalId);
    };
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    // Listen for custom notification events from AppContext
    const handleNotificationAdded = () => {
      console.log('NotificationsButton: Notification added event received');
      loadUnreadCount();
    };

    const handleNotificationUpdated = () => {
      console.log('NotificationsButton: Notification updated event received');
      loadUnreadCount();
    };

    const handleNotificationDeleted = () => {
      console.log('NotificationsButton: Notification deleted event received');
      loadUnreadCount();
    };

    window.addEventListener('notification-added', handleNotificationAdded);
    window.addEventListener('notification-updated', handleNotificationUpdated);
    window.addEventListener('notification-deleted', handleNotificationDeleted);

    // Set up real-time subscription as fallback
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          loadUnreadCount();
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener('notification-added', handleNotificationAdded);
      window.removeEventListener('notification-updated', handleNotificationUpdated);
      window.removeEventListener('notification-deleted', handleNotificationDeleted);
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const loadUnreadCount = async () => {
    if (!user?.id) return;

    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (!error) {
        setUnreadCount(count || 0);
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsNotificationsModalOpen(true)}
        className="relative p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 transition-opacity shadow-lg"
      >
        <Bell className="w-5 h-5 text-white" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
            >
              {unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <NotificationsModal
        isOpen={isNotificationsModalOpen}
        onClose={() => {
          setIsNotificationsModalOpen(false);
          loadUnreadCount();
        }}
      />
    </>
  );
}