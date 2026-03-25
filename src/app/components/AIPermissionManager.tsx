import React, { useState, useEffect } from 'react';
import { AIPermissionModal } from './AIPermissionModal';
import { useApp } from '../contexts/AppContext';

export function AIPermissionManager() {
  const { settings, updateSettings, user } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [hasCheckedOnLogin, setHasCheckedOnLogin] = useState(false);

  useEffect(() => {
    // Проверяем только если пользователь авторизован
    if (!user) {
      setHasCheckedOnLogin(false);
      setShowModal(false);
      return;
    }

    // Если уже проверяли при этой сессии входа, не показываем снова
    if (hasCheckedOnLogin) {
      return;
    }

    // Логика показа модального окна:
    // 1. ai_permission === null/undefined - показываем (первый раз)
    // 2. ai_permission === 'yes' - НЕ показываем
    // 3. ai_permission === 'never' - НЕ показываем
    // 4. ai_permission === 'later' - показываем при каждом входе
    const shouldShow = 
      settings.ai_permission === null || 
      settings.ai_permission === undefined || 
      settings.ai_permission === 'later';

    if (shouldShow) {
      // Задержка для лучшего UX (даем время загрузиться приложению)
      const timer = setTimeout(() => {
        setShowModal(true);
        setHasCheckedOnLogin(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    } else {
      setHasCheckedOnLogin(true);
    }
  }, [user, settings.ai_permission, hasCheckedOnLogin]);

  const handlePermissionSet = async (permission: 'yes' | 'later' | 'never') => {
    try {
      await updateSettings({ ai_permission: permission });
      setShowModal(false);
      
      // При выборе 'yes' или 'never' окно больше не покажется
      // При выборе 'later' окно покажется при следующем входе
    } catch (error) {
      console.error('Error setting AI permission:', error);
    }
  };

  return (
    <AIPermissionModal
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      onPermissionSet={handlePermissionSet}
    />
  );
}