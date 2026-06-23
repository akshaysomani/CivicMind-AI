import React, { useEffect, useState } from 'react';
import { useGovernment } from '../../context/GovernmentContext';
import { SectionHeader } from '../../components/SectionHeader';
import { LoadingSkeleton } from '../../components/dashboard/LoadingSkeleton';
import { Rss, Send, Megaphone, ShieldCheck, Clock } from 'lucide-react';
import { GlassCard } from '../../components/GlassCard';

export const GovernmentAnnouncements: React.FC = () => {
  const { announcements, isLoading, publishAnnouncement, refreshDashboard } = useGovernment();

  // Composer Form States
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [targetAudience, setTargetAudience] = useState('All');

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    await publishAnnouncement(title, content, priority, targetAudience);
    setTitle('');
    setContent('');
    setPriority('Medium');
    setTargetAudience('All');
  };

  const getPriorityStyle = (prio: string) => {
    switch (prio) {
      case 'Critical': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'High': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'Medium': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <SectionHeader
        title="Public Announcements & Broadcasts"
        subtitle="Publish, schedule, and archive public bulletins to warn residents or notify citizens of city improvements."
        badge="Announcements Hub"
        center={false}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns: Compose Form */}
        <div className="lg:col-span-1">
          <GlassCard className="p-6 border-t-2 border-t-secondary space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2 uppercase tracking-wider">
              <Megaphone className="w-5 h-5 text-secondary" />
              Compose Broadcast
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-500 block">Broadcast Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Scheduled Maintenance"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 dark:border-white/5 light:border-slate-300 text-xs focus:ring-1 focus:ring-secondary text-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Audience */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-500 block">Target Audience</label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 dark:border-white/5 light:border-slate-300 text-xs focus:ring-1 focus:ring-secondary text-slate-900 dark:text-slate-100"
                >
                  <option value="All">All Residents</option>
                  <option value="Ward 1 - Richmond">Ward 1 - Richmond</option>
                  <option value="Ward 2 - Marina">Ward 2 - Marina</option>
                  <option value="Ward 3 - Financial">Ward 3 - Financial</option>
                  <option value="Ward 4 - Mission">Ward 4 - Mission</option>
                  <option value="Ward 5 - Sunset">Ward 5 - Sunset</option>
                </select>
              </div>

              {/* Priority */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-500 block">Priority Level</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 dark:border-white/5 light:border-slate-300 text-xs focus:ring-1 focus:ring-secondary text-slate-900 dark:text-slate-100"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              {/* Content */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-500 block">Message Details</label>
                <textarea
                  required
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Provide details about the advisory..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 dark:border-white/5 light:border-slate-300 text-xs focus:ring-1 focus:ring-secondary text-slate-900 dark:text-slate-100 leading-normal"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-secondary hover:bg-amber-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-secondary/15 transition-all flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Broadcast Announcement</span>
              </button>

            </form>
          </GlassCard>
        </div>

        {/* Right Columns: Active Broadcasts List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2 uppercase tracking-wider">
            <Rss className="w-5 h-5 text-secondary" />
            Active Bulletins queue
          </h3>

          {isLoading ? (
            <LoadingSkeleton type="feed" count={3} />
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {announcements.map((ann) => (
                <GlassCard key={ann.id} className="p-5 border border-white/5 space-y-3">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-bold text-slate-500">Target: {ann.target_audience}</span>
                      <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-slate-100">{ann.title}</h4>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-2 py-0.5 rounded border text-[9px] font-extrabold uppercase ${getPriorityStyle(ann.priority)}`}>
                        {ann.priority}
                      </span>
                      <span className={`px-2 py-0.5 rounded border text-[9px] font-extrabold uppercase ${
                        ann.status === 'Draft' ? 'text-slate-400 bg-slate-800/20' : 'text-emerald-500 bg-emerald-500/10'
                      }`}>
                        {ann.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-400 font-semibold leading-relaxed whitespace-pre-wrap">{ann.content}</p>

                  <div className="pt-2.5 border-t border-white/5 flex justify-between items-center text-[9px] text-slate-500 font-semibold">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-secondary" /> Published on {new Date(ann.created_at).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Authorized Release</span>
                  </div>
                </GlassCard>
              ))}

              {announcements.length === 0 && (
                <div className="text-center py-12 border border-dashed border-white/5 rounded-2xl text-slate-500">
                  No active public bulletins published in the zone.
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default GovernmentAnnouncements;
