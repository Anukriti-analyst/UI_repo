import {
  createContext, useCallback, useContext,
  useEffect, useRef, useState, type ReactNode,
} from 'react';

import type { ToastEventDetail } from '@/api/client';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface NotificationContextValue {
  toasts: Toast[];
  showToast: (type: Toast['type'], message: string) => void;
  removeToast: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

const TOAST_DURATION_MS = 4_000;

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timerRefs = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    timerRefs.current.delete(id);
  }, []);

  const showToast = useCallback((type: Toast['type'], message: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev.slice(-4), { id, type, message }]); // max 5
    const timer = setTimeout(() => removeToast(id), TOAST_DURATION_MS);
    timerRefs.current.set(id, timer);
  }, [removeToast]);

  /* Listen for fm:toast events dispatched by the API interceptor */
  useEffect(() => {
    const handler = (e: Event) => {
      const { type, message } = (e as CustomEvent<ToastEventDetail>).detail;
      showToast(type, message);
    };
    window.addEventListener('fm:toast', handler);
    return () => window.removeEventListener('fm:toast', handler);
  }, [showToast]);

  return (
    <NotificationContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used within <NotificationProvider>');
  return ctx;
}

