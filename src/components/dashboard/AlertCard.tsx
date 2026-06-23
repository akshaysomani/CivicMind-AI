import React from 'react';
import { AlertCircle, Droplet, Wind, ShieldAlert, Clock, MapPin, CheckCircle } from 'lucide-react';
import type { Alert } from '../../context/CitizenContext';

interface AlertCardProps {
  alert: Alert;
}

export const AlertCard: React.FC<AlertCardProps> = ({ alert }) => {
  const getSeverityStyles = (severity: string) => {
    const styles: Record<string, { badge: string; border: string; bg: string; icon: string }> = {
      Critical: {
        badge: 'bg-rose-500/20 text-rose-500 border-rose-500/30',
        border: 'border-rose-500/30',
        bg: 'bg-rose-500/5 dark:bg-rose-950/20',
        icon: 'text-rose-500'
      },
      High: {
        badge: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
        border: 'border-amber-500/30',
        bg: 'bg-amber-500/5 dark:bg-amber-950/10',
        icon: 'text-amber-500'
      },
      Medium: {
        badge: 'bg-orange-500/20 text-orange-500 border-orange-500/30',
        border: 'border-orange-500/20',
        bg: 'bg-orange-500/5 dark:bg-orange-950/5',
        icon: 'text-orange-500'
      },
      Low: {
        badge: 'bg-sky-500/20 text-sky-500 border-sky-500/30',
        border: 'border-sky-500/20',
        bg: 'bg-sky-500/5 dark:bg-sky-950/5',
        icon: 'text-sky-500'
      }
    };
    return styles[severity] || styles.Medium;
  };

  const getAlertIcon = (alertType: string, severity: string) => {
    const iconClass = `w-6 h-6 ${getSeverityStyles(severity).icon}`;
    
    switch (alertType) {
      case 'Flood':
        return <Droplet className={iconClass} />;
      case 'Weather':
        return <Wind className={iconClass} />;
      case 'Road Closure':
        return <ShieldAlert className={iconClass} />;
      case 'Power Outage':
        return <Clock className={iconClass} />;
      default:
        return <AlertCircle className={iconClass} />;
    }
  };

  const styles = getSeverityStyles(alert.severity);

  return (
    <div className={`border rounded-2xl p-5 backdrop-blur-md transition-all hover:shadow-md ${styles.border} ${styles.bg}`}>
      <div className="flex gap-4 items-start">
        <div className="p-3 bg-slate-900/40 dark:bg-slate-900/40 light:bg-white/60 border border-white/5 dark:border-white/5 light:border-slate-200/50 rounded-xl shrink-0">
          {getAlertIcon(alert.alert_type, alert.severity)}
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${styles.badge}`}>
              {alert.severity} Alert
            </span>
            <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* Title & Desc */}
          <div className="space-y-1">
            <h4 className="font-heading font-bold text-base text-slate-900 dark:text-slate-100 truncate">
              {alert.title}
            </h4>
            <p className="text-xs text-slate-655 dark:text-slate-400 leading-relaxed">
              {alert.message}
            </p>
          </div>

          {/* Footer location & coordinates */}
          <div className="flex justify-between items-center pt-2 border-t border-white/5 dark:border-white/5 light:border-slate-200/50 text-[10px] font-semibold text-slate-505 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="truncate">{alert.location} ({alert.distance})</span>
            </span>
            <span className="flex items-center gap-1 text-emerald-500 uppercase tracking-wider">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{alert.status}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertCard;
