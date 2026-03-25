import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Mail, TrendingUp, X } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface AIPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPermissionSet: (permission: 'yes' | 'later' | 'never') => void;
}

export function AIPermissionModal({ isOpen, onClose, onPermissionSet }: AIPermissionModalProps) {
  const { t } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePermission = async (permission: 'yes' | 'later' | 'never') => {
    setIsProcessing(true);
    await onPermissionSet(permission);
    setIsProcessing(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-card border border-border rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden"
      >
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-r from-primary via-accent to-purple-500 p-8 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
              <Sparkles className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">{t('ai_permission_title')}</h2>
              <p className="text-white/90 mt-1">{t('ai_permission_subtitle')}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <p className="text-lg mb-6">
            {t('ai_permission_description')}
          </p>

          {/* Features */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-lg">{t('ai_feature_email_parsing')}</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('ai_feature_email_parsing_desc')}
              </p>
            </div>

            <div className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-500 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-lg">{t('ai_feature_prediction')}</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('ai_feature_prediction_desc')}
              </p>
            </div>
          </div>

          {/* Privacy notice */}
          <div className="p-4 bg-muted rounded-xl mb-6">
            <p className="text-sm text-muted-foreground">
              🔒 <strong>{t('ai_privacy_notice')}</strong> {t('ai_privacy_notice_desc')}
            </p>
          </div>

          {/* Action buttons */}
          <div className="grid md:grid-cols-3 gap-3">
            <button
              onClick={() => handlePermission('yes')}
              disabled={isProcessing}
              className="px-6 py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              {t('ai_permission_yes')}
            </button>

            <button
              onClick={() => handlePermission('later')}
              disabled={isProcessing}
              className="px-6 py-4 bg-muted hover:bg-muted/70 text-foreground rounded-xl font-bold transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              {t('ai_permission_later')}
            </button>

            <button
              onClick={() => handlePermission('never')}
              disabled={isProcessing}
              className="px-6 py-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              {t('ai_permission_never')}
            </button>
          </div>

          {/* Additional info */}
          <p className="text-xs text-muted-foreground text-center mt-4">
            {t('ai_permission_change_later')}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
