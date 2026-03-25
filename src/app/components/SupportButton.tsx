import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SupportModal, getUnreadMessageCount } from './SupportModal';
import { useApp } from '../contexts/AppContext';
import { supabase } from '../utils/supabase';

export function SupportButton() {
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useApp();

  useEffect(() => {
    if (user?.id) {
      // Initial load
      loadUnreadCount();

      // Set up real-time subscription
      const channel = supabase
        .channel('support_messages_unread')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'support_messages'
          },
          () => {
            loadUnreadCount();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.id]);

  const loadUnreadCount = async () => {
    const count = await getUnreadMessageCount(user?.id);
    setUnreadCount(count);
  };

  // Only show button for authenticated users
  if (!user) {
    return null;
  }

  return (
    <>
      {/* Fixed Support Button - Bottom Right */}
      <motion.button
        onClick={() => setIsSupportModalOpen(true)}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-shadow"
        style={{ right: '1.5rem', bottom: '1.5rem', left: 'auto' }}
        aria-label="Поддержка"
      >
        <MessageCircle className="w-6 h-6" />
        
        {/* Unread Badge - Top Right Corner */}
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[24px] h-6 px-1.5 flex items-center justify-center shadow-lg ring-2 ring-background"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.div>
        )}
      </motion.button>

      {/* Support Modal */}
      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={() => {
          setIsSupportModalOpen(false);
          loadUnreadCount(); // Refresh count when closing modal
        }}
      />
    </>
  );
}