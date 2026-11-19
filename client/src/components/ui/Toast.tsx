import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertOctagon, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

export interface ToastOptions {
  title?: string;
  duration?: number;
}

export interface ToastContextValue {
  toasts: ToastItem[];
  addToast: (type: ToastType, message: string, options?: ToastOptions) => string;
  removeToast: (id: string) => void;
  toast: {
    (message: string, options?: ToastOptions): string;
    success: (message: string, options?: ToastOptions) => string;
    error: (message: string, options?: ToastOptions) => string;
    warning: (message: string, options?: ToastOptions) => string;
    info: (message: string, options?: ToastOptions) => string;
  };
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const toastConfig: Record<
  ToastType,
  {
    icon: React.ElementType;
    container: string;
    iconColor: string;
    borderColor: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    container: 'bg-white/95 text-emerald-950 border-emerald-200',
    iconColor: 'text-emerald-600',
    borderColor: 'border-l-emerald-600',
  },
  error: {
    icon: AlertOctagon,
    container: 'bg-white/95 text-crimson-950 border-crimson-200',
    iconColor: 'text-crimson-600',
    borderColor: 'border-l-crimson-600',
  },
  warning: {
    icon: AlertTriangle,
    container: 'bg-white/95 text-amber-950 border-amber-200',
    iconColor: 'text-amber-600',
    borderColor: 'border-l-amber-600',
  },
  info: {
    icon: Info,
    container: 'bg-white/95 text-burgundy-950 border-burgundy-200',
    iconColor: 'text-burgundy-600',
    borderColor: 'border-l-burgundy-600',
  },
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string, options?: ToastOptions): string => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const duration = options?.duration ?? 5000;

      const newToast: ToastItem = {
        id,
        type,
        title: options?.title,
        message,
        duration,
      };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  const toastMethods = useMemo(() => {
    const base = (message: string, options?: ToastOptions) => addToast('info', message, options);
    base.success = (message: string, options?: ToastOptions) => addToast('success', message, options);
    base.error = (message: string, options?: ToastOptions) => addToast('error', message, options);
    base.warning = (message: string, options?: ToastOptions) => addToast('warning', message, options);
    base.info = (message: string, options?: ToastOptions) => addToast('info', message, options);
    return base;
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, toast: toastMethods }}>
      {children}

      {/* Floating Toasts Viewport */}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3 sm:px-0"
      >
        <AnimatePresence>
          {toasts.map((item) => {
            const config = toastConfig[item.type];
            const Icon = config.icon;

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 24, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                className={`
                  pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border border-l-4 shadow-xl shadow-burgundy-950/10 backdrop-blur-md
                  ${config.container}
                  ${config.borderColor}
                `}
              >
                <div className={`mt-0.5 shrink-0 ${config.iconColor}`}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0 pr-1">
                  {item.title && (
                    <h5 className="text-xs font-bold leading-tight mb-0.5 tracking-tight">
                      {item.title}
                    </h5>
                  )}
                  <p className="text-xs leading-relaxed text-secondary-text">{item.message}</p>
                </div>

                <button
                  type="button"
                  onClick={() => removeToast(item.id)}
                  aria-label="Dismiss toast"
                  className="text-secondary-text hover:text-primary-text p-1 rounded-lg hover:bg-black/5 transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastProvider;
