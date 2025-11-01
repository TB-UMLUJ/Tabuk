import React, { createContext, useContext } from 'react';
import { useToasts, ToastType } from '../hooks/useToasts';
import Toast from '../components/Toast';

interface ToastContextType {
  addToast: (title: string, message: string, type?: ToastType) => void;
  removeToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toasts, addToast, removeToast } = useToasts();

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="toast-container" aria-live="assertive" aria-atomic="true">
        {toasts.map(toast => (
          <Toast key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};