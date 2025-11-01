import { useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'deleted';

export interface ToastMessage {
  id: number;
  title: string;
  message: string;
  type: ToastType;
}

export const useToasts = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id));
  }, []);

  const addToast = useCallback((title: string, message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts(currentToasts => [...currentToasts, { id, title, message, type }]);
    
    setTimeout(() => {
      removeToast(id);
    }, 5000); // Auto-dismiss after 5 seconds
  }, [removeToast]);

  return { toasts, addToast, removeToast };
};