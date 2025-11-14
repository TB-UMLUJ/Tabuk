import { useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'deleted' | 'scan_success';

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
    const id = Date.now() + Math.random();
    // Append new toasts to the list, allowing multiple to be displayed.
    setToasts(prevToasts => [...prevToasts, { id, title, message, type }]);
  }, []);

  return { toasts, addToast, removeToast };
};
