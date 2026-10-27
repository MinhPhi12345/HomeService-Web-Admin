import { createContext, useContext } from 'react';

export interface ToastItem {
  id: string;
  type: 'success' | 'error';
  message: string;
}

export interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
}

export const ToastContext = createContext<ToastContextValue | undefined>(
  undefined,
);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast phải được dùng bên trong ToastProvider');
  return ctx;
}
