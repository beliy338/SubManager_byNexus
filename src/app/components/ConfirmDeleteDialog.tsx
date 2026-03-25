import React from 'react';
import { X } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface ConfirmDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export function ConfirmDeleteDialog({ isOpen, onClose, onConfirm, title, message }: ConfirmDeleteDialogProps) {
  const { t } = useApp();
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-muted-foreground mb-6">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
          >
            {t('cancelButton')}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 px-4 py-3 bg-white dark:bg-white text-black rounded-lg font-medium transition-colors hover:opacity-90 flex items-center justify-center gap-2"
          >
            <X className="w-5 h-5 text-black" />
            {t('yesButton')}
          </button>
        </div>
      </div>
    </div>
  );
}