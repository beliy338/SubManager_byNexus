import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageCircle, Check, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../contexts/AppContext';
import { isOwner } from '../utils/roles';
import { supabase } from '../utils/supabase';
import { toast } from 'sonner';
import { ScrollArea } from './ui/scroll-area';

interface Message {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  message: string;
  created_at: string;
  is_admin_reply: boolean;
  parent_message_id?: string;
  is_read?: boolean;
}

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Export function to get unread message count
export async function getUnreadMessageCount(userId: string | undefined): Promise<number> {
  if (!userId) return 0;
  
  try {
    const { data, error } = await supabase
      .from('support_messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (error || !data) return 0;

    const userIsOwnerRole = isOwner({ id: userId });

    if (userIsOwnerRole) {
      // For owners: count unread messages from all users (non-admin messages)
      const unreadCount = data.filter(msg => 
        !msg.is_admin_reply && 
        !msg.is_read
      ).length;
      return unreadCount;
    } else {
      // For users: count unread admin replies to their messages
      const userMsgIds = data.filter(m => m.user_id === userId).map(m => m.id);
      const unreadCount = data.filter(msg => 
        msg.is_admin_reply && 
        msg.parent_message_id && 
        userMsgIds.includes(msg.parent_message_id) &&
        !msg.is_read
      ).length;
      return unreadCount;
    }
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
}

export function SupportModal({ isOpen, onClose }: SupportModalProps) {
  const { user, t } = useApp();
  const [step, setStep] = useState<'choice' | 'chat'>('choice');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUserMessages, setSelectedUserMessages] = useState<Message[]>([]);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userIsOwner = isOwner(user);

  useEffect(() => {
    if (isOpen && (step === 'chat' || userIsOwner)) {
      loadMessages();
      
      // Set up real-time subscription
      const channel = supabase
        .channel('support_messages')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'support_messages'
          },
          () => {
            loadMessages();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isOpen, step, userIsOwner]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedUserMessages]);

  // Update selected user messages when messages change
  useEffect(() => {
    if (selectedUserMessages.length > 0 && userIsOwner) {
      const userId = selectedUserMessages[0].user_id;
      const userMsgIds = messages.filter(m => m.user_id === userId).map(m => m.id);
      const updatedUserMsgs = messages.filter(msg => 
        msg.user_id === userId || 
        (msg.is_admin_reply && msg.parent_message_id && userMsgIds.includes(msg.parent_message_id))
      );
      if (updatedUserMsgs.length !== selectedUserMessages.length) {
        setSelectedUserMessages(updatedUserMsgs);
      }
    }
  }, [messages, userIsOwner]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('support_messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
        // If table doesn't exist, just show empty messages
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          console.warn('support_messages table does not exist yet');
          setMessages([]);
          return;
        }
        // If permission denied for users table, it means wrong foreign key
        if (error.code === '42501' && error.message?.includes('table users')) {
          console.error('Permission denied for table users - foreign key issue detected');
          toast.error('Ошибка настройки базы данных. Выполните supabase-support-complete-setup.sql в Supabase Dashboard.');
          setMessages([]);
          return;
        }
        // If infinite recursion in RLS policy
        if (error.code === '42P17' || error.message?.includes('infinite recursion')) {
          console.error('Infinite recursion in RLS policy detected');
          toast.error('Ошибка политик безопасности. Выполните supabase-support-complete-setup.sql в Supabase Dashboard.', {
            duration: 8000
          });
          setMessages([]);
          return;
        }
        throw error;
      }

      if (userIsOwner) {
        // Owners see all messages
        setMessages(data || []);
      } else {
        // Users see their own messages AND replies from owners to their messages
        const userMessages = (data || []).filter(msg => {
          // Show if user is the sender
          if (msg.user_id === user?.id) {
            return true;
          }
          
          // Show if this is an admin reply
          if (msg.is_admin_reply) {
            // Check if this reply is for any of user's messages
            const userMsgIds = (data || [])
              .filter(m => m.user_id === user?.id)
              .map(m => m.id);
            
            // If parent_message_id matches any user message, or if no parent but admin is replying
            return msg.parent_message_id && userMsgIds.includes(msg.parent_message_id);
          }
          
          return false;
        });
        setMessages(userMessages);
      }
    } catch (error: any) {
      console.error('Error loading messages:', error);
      console.error('Error details:', {
        code: error?.code,
        message: error?.message,
        details: error?.details
      });

      // Don't show error toast if table doesn't exist or already handled
      if (error?.code !== '42P01' && !(error?.code === '42501' && error?.message?.includes('table users'))) {
        toast.error(`Ошибка загруки сообщений: ${error?.message || 'Неизвестная ошибка'}`)
      }
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    if (!user?.id) {
      toast.error('Вы не авторизованы');
      return;
    }

    try {
      const messageData = {
        user_id: user.id,
        user_email: user.email || '',
        user_name: user?.user_metadata?.name || user?.email?.split('@')[0] || 'Пользователь',
        message: newMessage.trim(),
        is_admin_reply: userIsOwner && replyingTo !== null, // Owner messages are admin replies only when replying
        parent_message_id: replyingTo?.id || null,
        is_read: false // Explicitly set is_read to false for new messages
      };

      console.log('Sending message:', messageData);

      const { data, error } = await supabase
        .from('support_messages')
        .insert([messageData])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });

        if (error.code === '42P01') {
          toast.error('Таблица сообщений не создана. Выполните SQL скрипт в Supabase Dashboard.');
        } else if (error.code === '42501' && error.message?.includes('table users')) {
          toast.error('Ошибка настройки базы данных. Выполните recreate-support-messages-table.sql в Supabase Dashboard.');
        } else if (error.code === '42501') {
          toast.error('Нет прав доступа. Проверьте RLS политики.');
        } else {
          toast.error(`Ошибка: ${error.message}`);
        }
        throw error;
      }

      console.log('Message sent successfully:', data);
      setNewMessage('');
      setReplyingTo(null);
      loadMessages();
      toast.success('Сообщение отправлено');
    } catch (error: any) {
      console.error('Error sending message:', error);
      // Error already handled above
    }
  };

  const handleTelegramChoice = () => {
    window.open('https://t.me/NexSubscriptions_bot', '_blank');
    onClose();
  };

  const handleChatChoice = () => {
    setStep('chat');
  };

  const handleBackToChoice = () => {
    setStep('choice');
    setReplyingTo(null);
    setSelectedUserMessages([]);
  };

  const handleUserClick = (userId: string) => {
    // Get all messages related to this user:
    // 1. Messages from the user
    // 2. Admin replies where parent is user's message
    const userMsgIds = messages.filter(m => m.user_id === userId).map(m => m.id);
    const userMsgs = messages.filter(msg => 
      msg.user_id === userId || 
      (msg.is_admin_reply && msg.parent_message_id && userMsgIds.includes(msg.parent_message_id))
    );
    setSelectedUserMessages(userMsgs);
    
    // Automatically set replyingTo to the last user message for context
    const lastUserMsg = userMsgs.filter(m => !m.is_admin_reply).slice(-1)[0];
    if (lastUserMsg) {
      setReplyingTo(lastUserMsg);
    }
    
    // Mark unread messages from this user as read (for owners)
    markMessagesAsRead(userId);
  };

  const markMessagesAsRead = async (userId?: string) => {
    if (!user?.id) return;

    try {
      if (userIsOwner && userId) {
        // Owner marks user messages as read
        const messagesToMark = messages.filter(msg => 
          msg.user_id === userId && 
          !msg.is_admin_reply && 
          !msg.is_read
        ).map(m => m.id);

        if (messagesToMark.length > 0) {
          await supabase
            .from('support_messages')
            .update({ is_read: true })
            .in('id', messagesToMark);
        }
      } else if (!userIsOwner) {
        // User marks admin replies as read
        const userMsgIds = messages.filter(m => m.user_id === user.id).map(m => m.id);
        const messagesToMark = messages.filter(msg => 
          msg.is_admin_reply && 
          msg.parent_message_id && 
          userMsgIds.includes(msg.parent_message_id) &&
          !msg.is_read
        ).map(m => m.id);

        if (messagesToMark.length > 0) {
          await supabase
            .from('support_messages')
            .update({ is_read: true })
            .in('id', messagesToMark);
        }
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Mark messages as read when user opens chat
  useEffect(() => {
    if (isOpen && step === 'chat' && !userIsOwner && messages.length > 0) {
      markMessagesAsRead();
    }
  }, [isOpen, step, messages.length]);

  const handleReply = (message: Message) => {
    setReplyingTo(message);
  };

  // Get unique users for owner view
  const uniqueUsers = userIsOwner
    ? Array.from(new Set(messages.map(msg => msg.user_id)))
        .filter(userId => {
          const userMsg = messages.find(m => m.user_id === userId);
          // Exclude owners - check if user_email exists before calling isOwner
          if (!userMsg?.user_email) return false;
          return !isOwner({ id: userId, email: userMsg.user_email });
        })
        .map(userId => {
          const userMsg = messages.find(msg => msg.user_id === userId);
          const userMessages = messages.filter(m => m.user_id === userId && !m.is_admin_reply);
          const unreadCount = userMessages.filter(m => !m.is_read).length;
          return {
            id: userId,
            email: userMsg?.user_email || '',
            name: userMsg?.user_name || '',
            lastMessage: messages.filter(msg => msg.user_id === userId).slice(-1)[0],
            unreadCount
          };
        })
    : [];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">
                {userIsOwner ? t('supportTitleOwner') : t('supportTitle')}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {step === 'choice' && !userIsOwner ? (
              /* Choice View for Regular Users */
              <div className="p-6 flex flex-col items-center justify-center h-full space-y-6">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold mb-2">{t('howToContact')}</h3>
                  <p className="text-muted-foreground">
                    {t('chooseContactMethod')}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg">
                  <button
                    onClick={handleChatChoice}
                    className="p-6 border-2 border-border rounded-xl hover:border-primary transition-all hover:bg-muted/50 text-center"
                  >
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 text-primary" />
                    <h4 className="font-bold text-lg mb-2">{t('siteChat')}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t('siteChatDescription')}
                    </p>
                  </button>

                  <button
                    onClick={handleTelegramChoice}
                    className="p-6 rounded-xl border-2 border-border hover:border-primary bg-muted/50 hover:bg-primary/10 transition-all group"
                  >
                    <div className="w-12 h-12 mx-auto mb-3 text-4xl">📱</div>
                    <h4 className="font-bold text-lg mb-2">{t('telegramBot')}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t('telegramBotDescription')}
                    </p>
                  </button>
                </div>
              </div>
            ) : step === 'chat' && !userIsOwner ? (
              /* Chat View for Regular Users */
              <div className="flex flex-col h-full">
                {/* Welcome Message */}
                {messages.length === 0 && !isLoading && (
                  <div className="p-6 bg-primary/10 border-b border-border">
                    <p className="text-center">
                      <span className="text-2xl">👋</span> {t('helloMessage')}
                    </p>
                  </div>
                )}

                {/* Messages with custom scrollbar */}
                <div className="flex-1 overflow-y-auto p-6 pr-2 custom-scrollbar" style={{ overscrollBehavior: 'contain' }}>
                  {isLoading ? (
                    <div className="text-center text-muted-foreground">
                      {t('loadingMessages')}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.is_admin_reply ? 'justify-start' : 'justify-end'}`}
                        >
                          <div
                            className={`max-w-[70%] p-4 rounded-lg relative ${
                              msg.is_admin_reply
                                ? 'bg-muted text-foreground'
                                : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                            }`}
                          >
                            {/* Show sender name */}
                            <p className="text-xs font-bold mb-1">
                              {msg.is_admin_reply ? 'Поддержка' : msg.user_name}
                            </p>
                            <p className="whitespace-pre-wrap">{msg.message}</p>
                            <div className="flex items-center justify-between gap-2 mt-1">
                              <p className="text-xs opacity-70">
                                {new Date(msg.created_at).toLocaleString('ru-RU')}
                              </p>
                              {/* Read status checkmarks for own messages */}
                              {!msg.is_admin_reply && (
                                <div className="flex items-center">
                                  {msg.is_read ? (
                                    <CheckCheck className="w-3 h-3 opacity-70" />
                                  ) : (
                                    <Check className="w-3 h-3 opacity-70" />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-border">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder={t('enterMessage')}
                      className="flex-1 px-4 py-3 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                  <button
                    onClick={handleBackToChoice}
                    className="mt-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t('backToChoice')}
                  </button>
                </div>
              </div>
            ) : userIsOwner ? (
              /* Owner View - Support Dashboard */
              <div className="flex h-full">
                {/* User List */}
                <div className="w-1/3 border-r border-border overflow-y-auto custom-scrollbar" style={{ overscrollBehavior: 'contain' }}>
                  <div className="p-4 border-b border-border bg-muted/50 sticky top-0 z-10">
                    <h3 className="font-bold">{t('users')} ({uniqueUsers.length})</h3>
                  </div>
                  <div className="divide-y divide-border">
                    {uniqueUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => handleUserClick(u.id)}
                        className={`w-full p-4 text-left hover:bg-muted transition-colors ${
                          selectedUserMessages.length > 0 && selectedUserMessages[0].user_id === u.id
                            ? 'bg-primary/10'
                            : ''
                        }`}
                      >
                        <p className="font-medium truncate">{u.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                        {u.lastMessage && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {u.lastMessage.message}
                          </p>
                        )}
                        {u.unreadCount > 0 && (
                          <p className="text-xs text-red-500 mt-1 font-medium">
                            {t('unreadMessages')}: {u.unreadCount}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col">
                  {selectedUserMessages.length > 0 ? (
                    <>
                      {/* Messages with custom scrollbar */}
                      <div className="flex-1 overflow-y-auto p-6 pr-2 custom-scrollbar" style={{ overscrollBehavior: 'contain' }}>
                        <div className="space-y-4">
                          {selectedUserMessages.map((msg) => (
                            <div
                              key={msg.id}
                              className={`flex ${msg.is_admin_reply ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[70%] p-4 rounded-lg relative ${
                                  msg.is_admin_reply
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                                    : 'bg-muted text-foreground'
                                }`}
                              >
                                {/* Show sender name */}
                                <p className="text-xs font-bold mb-1">
                                  {msg.is_admin_reply ? t('supportLabel') : msg.user_name}
                                </p>
                                <p className="whitespace-pre-wrap">{msg.message}</p>
                                <div className="flex items-center justify-between gap-2 mt-1">
                                  <p className="text-xs opacity-70">
                                    {new Date(msg.created_at).toLocaleString('ru-RU')}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    {/* Read status checkmarks for admin messages */}
                                    {msg.is_admin_reply && (
                                      <div className="flex items-center">
                                        {msg.is_read ? (
                                          <CheckCheck className="w-3 h-3 opacity-70" />
                                        ) : (
                                          <Check className="w-3 h-3 opacity-70" />
                                        )}
                                      </div>
                                    )}
                                    {!msg.is_admin_reply && (
                                      <button
                                        onClick={() => handleReply(msg)}
                                        className="text-xs hover:underline"
                                      >
                                        {t('reply')}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                          <div ref={messagesEndRef} />
                        </div>
                      </div>

                      {/* Reply Input */}
                      <div className="p-4 border-t border-border">
                        {replyingTo && (
                          <div className="mb-2 p-2 bg-muted rounded-lg text-sm">
                            <div className="flex items-center justify-between">
                              <span>{t('replyingTo')}: {replyingTo.message.substring(0, 50)}...</span>
                              <button
                                onClick={() => setReplyingTo(null)}
                                className="text-xs hover:underline"
                              >
                                {t('cancelReply')}
                              </button>
                            </div>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder={t('enterReply')}
                            className="flex-1 px-4 py-3 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          <button
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim()}
                            className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                          >
                            <Send className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                      {t('selectUserToView')}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}