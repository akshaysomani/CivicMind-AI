import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, Info, AlertOctagon } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  showNotification: (message: string, type: NotificationType, duration?: number) => void;
  dismissNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const showNotification = useCallback((message: string, type: NotificationType, duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        dismissNotification(id);
      }, duration);
    }
  }, [dismissNotification]);

  return (
    <NotificationContext.Provider value={{ notifications, showNotification, dismissNotification }}>
      {children}
      {/* Toast Render Area */}
      <div className="fixed top-24 right-4 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none px-4 md:px-0">
        <AnimatePresence>
          {notifications.map((notification) => (
            <Toast
              key={notification.id}
              notification={notification}
              onDismiss={dismissNotification}
            />
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

const Toast: React.FC<{ notification: Notification; onDismiss: (id: string) => void }> = ({
  notification,
  onDismiss,
}) => {
  const { id, message, type } = notification;

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertOctagon className="w-5 h-5 text-rose-500 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-500 shrink-0" />,
  };

  const borderColors = {
    success: 'border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/20',
    error: 'border-rose-500/20 bg-rose-500/5 dark:bg-rose-950/20',
    warning: 'border-amber-500/20 bg-amber-500/5 dark:bg-amber-950/20',
    info: 'border-sky-500/20 bg-sky-500/5 dark:bg-sky-950/20',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-md shadow-lg ${borderColors[type]}`}
      role="alert"
    >
      {icons[type]}
      <div className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-200">
        {message}
      </div>
      <button
        onClick={() => onDismiss(id)}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
