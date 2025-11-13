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
    // Add new toasts to the beginning of the array to show them on top
    setToasts(currentToasts => [{ id, title, message, type }, ...currentToasts]);
  }, []);

  return { toasts, addToast, removeToast };
};