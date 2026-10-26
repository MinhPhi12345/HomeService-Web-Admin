import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { ToastContext, type ToastItem } from './useToast';

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: 'success' | 'error', message: string) => {
      const id = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => {
        removeToast(id);
      }, 3000);
    },
    [removeToast],
  );

  const success = useCallback(
    (message: string) => {
      addToast('success', message);
    },
    [addToast],
  );

  const error = useCallback(
    (message: string) => {
      addToast('error', message);
    },
    [addToast],
  );

  useEffect(() => {
    function handleAppToast(event: Event) {
      const customEvent = event as CustomEvent<{
        type?: 'success' | 'error';
        message?: string;
      }>;
      if (customEvent.detail?.message) {
        if (customEvent.detail.type === 'error') {
          error(customEvent.detail.message);
        } else {
          success(customEvent.detail.message);
        }
      }
    }

    window.addEventListener('app:toast', handleAppToast);
    return () => window.removeEventListener('app:toast', handleAppToast);
  }, [error, success]);

  return (
    <ToastContext.Provider value={{ success, error }}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast-item toast-item-${toast.type}`}
            role="status"
          >
            <div className="toast-icon">
              {toast.type === 'success' ? (
                <CheckCircle2 size={18} />
              ) : (
                <AlertCircle size={18} />
              )}
            </div>
            <div className="toast-message">{toast.message}</div>
            <button
              type="button"
              className="toast-close"
              onClick={() => removeToast(toast.id)}
              aria-label="Đóng thông báo"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
