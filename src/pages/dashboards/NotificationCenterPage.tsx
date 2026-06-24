import React, { useState, useEffect } from 'react';
import { useNotificationCenter } from '../../context/NotificationCenterContext';
import { SectionHeader } from '../../components/SectionHeader';
import { 
  Bell, Mail, Phone, ShieldAlert, CheckCircle, 
  Trash2, Clock, Sliders, Search, AlertOctagon,
  Eye, RefreshCw, Smartphone
} from 'lucide-react';

export const NotificationCenterPage: React.FC = () => {
  const {
    notifications,
    unreadCount,
    preferences,
    metrics,
    loading,
    fetchNotifications,
    fetchPreferences,
    fetchMetrics,
    markNotificationsRead,
    archiveNotifications,
    savePreferences
  } = useNotificationCenter();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all'); // all, unread, read

  // Local preferences state for form inputs
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [inAppEnabled, setInAppEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [quietStart, setQuietStart] = useState('');
  const [quietEnd, setQuietEnd] = useState('');

  useEffect(() => {
    if (preferences) {
      setEmailEnabled(preferences.email_enabled);
      setSmsEnabled(preferences.sms_enabled);
      setInAppEnabled(preferences.in_app_enabled);
      setPushEnabled(preferences.push_enabled);
      setQuietStart(preferences.quiet_hours_start || '');
      setQuietEnd(preferences.quiet_hours_end || '');
    }
  }, [preferences]);

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    await savePreferences({
      email_enabled: emailEnabled,
      sms_enabled: smsEnabled,
      in_app_enabled: inAppEnabled,
      push_enabled: pushEnabled,
      quiet_hours_start: quietStart || null,
      quiet_hours_end: quietEnd || null
    });
  };

  const handleRefresh = async () => {
    await Promise.all([fetchNotifications(), fetchPreferences(), fetchMetrics()]);
  };

  // Filter & Search Logic
  const filteredNotifications = notifications.filter(notif => {
    const matchesSearch = 
      notif.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      notif.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || notif.type === filterType;
    
    let matchesStatus = true;
    if (filterStatus === 'unread') matchesStatus = !notif.is_read;
    if (filterStatus === 'read') matchesStatus = notif.is_read;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getIconForType = (type: string) => {
    switch (type) {
      case 'emergency':
      case 'emergency_triggered':
        return <ShieldAlert className="w-5 h-5 text-rose-500" />;
      case 'issue_created':
      case 'issue_updated':
        return <AlertOctagon className="w-5 h-5 text-amber-500" />;
      case 'health_advisory_published':
        return <AlertOctagon className="w-5 h-5 text-emerald-500" />;
      default:
        return <Bell className="w-5 h-5 text-sky-500" />;
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center">
        <SectionHeader
          title="Notification Inbox & Preferences"
          subtitle="Manage your alert delivery channels, quiet hours, and view platform broadcast notifications."
          badge="Communications Hub"
          center={false}
        />
        <button
          onClick={handleRefresh}
          className="p-3 bg-slate-800/60 hover:bg-slate-700/60 border border-white/10 text-slate-300 hover:text-white rounded-xl transition-all flex items-center gap-2"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Metrics Row */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-slate-900/30 border border-white/10 rounded-2xl p-5 backdrop-blur-md shadow-sm">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Total Alerts Received</span>
            <span className="text-3xl font-extrabold text-slate-100 block mt-1">{metrics.total_sent}</span>
          </div>
          <div className="bg-slate-900/30 border border-white/10 rounded-2xl p-5 backdrop-blur-md shadow-sm">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Unread Alerts</span>
            <span className="text-3xl font-extrabold text-amber-500 block mt-1">{unreadCount}</span>
          </div>
          <div className="bg-slate-900/30 border border-white/10 rounded-2xl p-5 backdrop-blur-md shadow-sm">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Active Automation Rules</span>
            <span className="text-3xl font-extrabold text-emerald-400 block mt-1">{metrics.active_rules_count}</span>
          </div>
          <div className="bg-slate-900/30 border border-white/10 rounded-2xl p-5 backdrop-blur-md shadow-sm">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Workflow Success Rate</span>
            <span className="text-3xl font-extrabold text-sky-400 block mt-1">
              {metrics.success_runs_count + metrics.failed_runs_count > 0
                ? `${Math.round((metrics.success_runs_count / (metrics.success_runs_count + metrics.failed_runs_count)) * 100)}%`
                : '100%'}
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left/Middle Columns: Inbox Notifications List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/30 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-sm space-y-4">
            
            {/* Header controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Alerts Inbox ({filteredNotifications.length})
              </h3>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => markNotificationsRead(null)}
                  className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 rounded-lg text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Mark All Read
                </button>
                <button
                  onClick={() => archiveNotifications(null)}
                  className="px-3 py-1.5 bg-slate-800/80 hover:bg-rose-950/40 border border-white/10 hover:border-rose-500/30 rounded-lg text-xs font-semibold text-slate-300 hover:text-rose-400 transition-all flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Archive All
                </button>
              </div>
            </div>

            {/* Filter controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/40 p-4 rounded-xl border border-white/5">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search notification messages..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-900/60 border border-white/10 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary/50"
                />
              </div>

              <div>
                <select
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900/60 border border-white/10 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-primary/50"
                >
                  <option value="all">All Types</option>
                  <option value="emergency_triggered">Emergencies</option>
                  <option value="issue_created">Issue Created</option>
                  <option value="issue_updated">Issue Updated</option>
                  <option value="health_advisory_published">Health Advisories</option>
                  <option value="scheme_recommended">Scheme Recommends</option>
                </select>
              </div>

              <div>
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900/60 border border-white/10 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-primary/50"
                >
                  <option value="all">All Status</option>
                  <option value="unread">Unread Only</option>
                  <option value="read">Read Only</option>
                </select>
              </div>
            </div>

            {/* Notification items list */}
            {loading ? (
              <div className="text-center py-10 text-slate-400">Loading notifications...</div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-white/10 rounded-xl text-slate-500 flex flex-col items-center gap-2">
                <Bell className="w-10 h-10 text-slate-600" />
                <span>No notifications in this folder.</span>
              </div>
            ) : (
              <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
                {filteredNotifications.map(notif => (
                  <div
                    key={notif.id}
                    className={`p-4 rounded-xl border transition-all flex items-start gap-4 ${
                      notif.is_read 
                        ? 'bg-slate-900/10 border-white/5 opacity-75' 
                        : 'bg-slate-900/60 border-primary/20 shadow-md hover:border-primary/30'
                    }`}
                  >
                    <div className="p-2.5 bg-slate-800/80 border border-white/5 rounded-lg shrink-0">
                      {getIconForType(notif.type)}
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-200">{notif.title}</span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(notif.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{notif.message}</p>
                      
                      <div className="flex items-center gap-3 pt-2">
                        {!notif.is_read && (
                          <button
                            onClick={() => markNotificationsRead([notif.id])}
                            className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
                          >
                            <CheckCircle className="w-3 h-3" />
                            Mark Read
                          </button>
                        )}
                        <button
                          onClick={() => archiveNotifications([notif.id])}
                          className="text-[10px] font-bold text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Archive
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>

        {/* Right Column: Preferences Settings Panel */}
        <div className="space-y-6">
          <div className="bg-slate-900/30 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-accent" />
              Delivery Options
            </h3>

            <form onSubmit={handleSavePreferences} className="space-y-6">
              
              {/* Toggles */}
              <div className="space-y-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Channels</span>
                
                <label className="flex items-center justify-between p-3 bg-slate-900/50 border border-white/5 rounded-xl cursor-pointer hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">In-App Notifications</span>
                      <span className="text-[10px] text-slate-500">Persist notifications in local center</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={inAppEnabled}
                    onChange={e => setInAppEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary/40 bg-slate-900 border-white/10"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-slate-900/50 border border-white/5 rounded-xl cursor-pointer hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">Email Alerts</span>
                      <span className="text-[10px] text-slate-500">Send digests and emergency updates</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailEnabled}
                    onChange={e => setEmailEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary/40 bg-slate-900 border-white/10"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-slate-900/50 border border-white/5 rounded-xl cursor-pointer hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">SMS Updates</span>
                      <span className="text-[10px] text-slate-500">Immediate SMS alerts for emergency ward info</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={smsEnabled}
                    onChange={e => setSmsEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary/40 bg-slate-900 border-white/10"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-slate-900/50 border border-white/5 rounded-xl cursor-pointer hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">Push Notifications</span>
                      <span className="text-[10px] text-slate-500">Simulate device push payloads</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={pushEnabled}
                    onChange={e => setPushEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary/40 bg-slate-900 border-white/10"
                  />
                </label>
              </div>

              {/* Quiet Hours */}
              <div className="space-y-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-accent" />
                  Quiet Hours Settings
                </span>
                <p className="text-[10px] text-slate-500">
                  During quiet hours, SMS, Email, and Push alerts are queued/suppressed. Only in-app alerts are updated.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Starts At</label>
                    <input
                      type="time"
                      value={quietStart}
                      onChange={e => setQuietStart(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900/60 border border-white/10 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-primary/50"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Ends At</label>
                    <input
                      type="time"
                      value={quietEnd}
                      onChange={e => setQuietEnd(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900/60 border border-white/10 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-primary/50"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary hover:text-white rounded-xl font-bold text-xs transition-all shadow-md"
              >
                Save Preferences
              </button>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default NotificationCenterPage;
