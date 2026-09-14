'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed inset-x-4 top-4 z-50 space-y-2 sm:left-auto sm:right-4 sm:w-[min(calc(100vw-2rem),24rem)]">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

interface ToastItemProps {
  toast: Toast;
  onClose: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
  const icons = {
    success: <CheckCircle className="text-olive" size={20} />,
    error: <AlertCircle className="text-clay" size={20} />,
    warning: <AlertTriangle className="text-amber-600" size={20} />,
    info: <Info className="text-sky-700" size={20} />,
  };

  const styles = {
    success: 'bg-[#eef3ec] border-[#cbd8c8]',
    error: 'bg-[#fbefeb] border-[#e8c9bd]',
    warning: 'bg-[#fbf5e5] border-[#ead9a8]',
    info: 'bg-[#edf4f7] border-[#c6dce4]',
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 min-w-0 p-4 border shadow-lg',
        'animate-toast-in',
        styles[toast.type]
      )}
    >
      <div className="flex-shrink-0">{icons[toast.type]}</div>
      <p className="flex-1 text-sm text-gray-900">{toast.message}</p>
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={onClose}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition"
      >
        <X size={16} />
      </button>
    </div>
  );
};