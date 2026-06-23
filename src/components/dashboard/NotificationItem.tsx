import React from 'react';
import { Check, Trash2, Mail, MessageSquare, ShieldAlert, Zap, AlertTriangle } from 'lucide-react';
import type { NotificationItem as NotiType } from '../../context/CitizenContext';
import { useCitizen } from '../../context/CitizenContext';

interface NotificationItemProps {
  notification: NotiType;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
  const { markNotificationRead, deleteNotification } = useCitizen();

  const getNotiIcon = (type: string) => {
    const iconClass = 'w-4.5 h-4.5 shrink-0';
    switch (type) {
      case 'emergency':
        return <AlertTriangle className={`${iconClass} text-rose-500`} />;
      case 'issue_update':
        return <ShieldAlert className={`${iconClass} text-primary`} />;
      case 'gov_message':
        return <Mail className={`${iconClass} text-emerald-500`} />;
      case 'ai_recommendation':
        return <Zap className={`${iconClass} text-accent`} />;
      default:
        return <MessageSquare className={`${iconClass} text-slate-500`} />;
    }
  };

  return (
    <div 
      className={`p-4 rounded-xl border flex gap-3 items-start transition-all hover:bg-slate-800/10 dark:hover:bg-slate-800/10 light:hover:bg-slate-100 ${
        notification.is_read 
          ? 'bg-slate-900/10 dark:bg-slate-900/10 light:bg-slate-50/50 border-white/5 dark:border-white/5 light:border-slate-205 text-slate-500' 
          : 'bg-primary/5 border-primary/20 dark:border-primary/10 text-slate-900 dark:text-slate-100'
      }`}
    >
      <div className="mt-0.5 shrink-0">
        {getNotiIcon(notification.type)}
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex justify-between items-start gap-2">
          <h5 className="font-heading font-bold text-xs leading-tight truncate">
            {notification.title}
          </h5>
          <span className="text-[9px] text-slate-500 font-medium shrink-0">
            {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
          {notification.message}
        </p>

        {/* Action triggers */}
        <div className="flex justify-end gap-3 pt-1">
          {!notification.is_read && (
            <button
              onClick={() => markNotificationRead(notification.id)}
              className="text-[10px] font-bold text-primary hover:text-primary-dark transition-colors flex items-center gap-0.5"
              aria-label="Mark as read"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark Read</span>
            </button>
          )}
          <button
            onClick={() => deleteNotification(notification.id)}
            className="text-[10px] font-bold text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-0.5"
            aria-label="Delete notification"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
