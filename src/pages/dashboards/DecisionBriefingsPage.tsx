import React, { useState, useEffect } from 'react';
import { useReporting } from '../../context/ReportingContext';
import { SectionHeader } from '../../components/SectionHeader';
import { 
  Activity, Award, Landmark, Users, 
  ShieldAlert, CheckSquare, Square
} from 'lucide-react';

export const DecisionBriefingsPage: React.FC = () => {
  const { briefings, loading, fetchBriefings } = useReporting();
  const [selectedRole, setSelectedRole] = useState('Mayor');
  
  // Local state to track checked urgent items
  const [checkedActions, setCheckedActions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchBriefings();
  }, [fetchBriefings]);

  const currentBrief = briefings.find(b => b.role === selectedRole);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Mayor': return <Landmark className="w-5 h-5 text-primary" />;
      case 'Ward Officer': return <Activity className="w-5 h-5 text-accent" />;
      case 'Administrator': return <Award className="w-5 h-5 text-sky-400" />;
      default: return <Users className="w-5 h-5 text-emerald-400" />;
    }
  };

  const toggleAction = (actionTitle: string) => {
    setCheckedActions(prev => ({
      ...prev,
      [actionTitle]: !prev[actionTitle]
    }));
  };

  return (
    <div className="space-y-8 pb-10">
      <SectionHeader
        title="Role-Aware Decision Briefings"
        subtitle="Role-tailored executive summaries, urgent actions checklists, and critical municipal updates compiled by AI."
        badge="Executive Briefs"
        center={false}
      />

      {/* Role Selection Tabs */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {briefings.map(brief => (
          <button
            key={brief.role}
            onClick={() => setSelectedRole(brief.role)}
            className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
              selectedRole === brief.role
                ? 'bg-primary/20 border-primary/45 text-white shadow-md'
                : 'bg-slate-900/40 border-white/5 text-slate-400 hover:border-white/10 hover:text-slate-200'
            }`}
          >
            {getRoleIcon(brief.role)}
            {brief.title}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-400">Compiling executive briefs...</div>
      ) : currentBrief ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Briefing text */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/30 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-100">{currentBrief.title}</h3>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block mt-1">
                    Audience Scope: {currentBrief.role} Access Only
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Generated At</span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    {new Date(currentBrief.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              <div className="space-y-4 text-sm text-slate-300 leading-relaxed pt-2">
                {currentBrief.briefing_text.split('. ').map((sentence, idx) => (
                  <p key={idx}>{sentence}.</p>
                ))}
              </div>
            </div>
          </div>

          {/* Urgent Actions checklist */}
          <div className="space-y-6">
            <div className="bg-slate-900/30 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-sm space-y-5">
              <h3 className="text-sm font-extrabold text-slate-100 flex items-center gap-2">
                <ShieldAlert className="w-4.5 h-4.5 text-rose-500" />
                Urgent Action Items
              </h3>

              {currentBrief.urgent_actions.length === 0 ? (
                <div className="p-4 border border-dashed border-white/10 rounded-xl text-center text-slate-500 text-xs">
                  No urgent actions mapped for this role.
                </div>
              ) : (
                <div className="space-y-3">
                  {currentBrief.urgent_actions.map((act, index) => (
                    <div
                      key={index}
                      onClick={() => toggleAction(act.title)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                        checkedActions[act.title]
                          ? 'bg-slate-900/10 border-white/5 opacity-50'
                          : 'bg-slate-950/40 border-white/5 hover:border-white/10'
                      }`}
                    >
                      <div className="shrink-0 mt-0.5">
                        {checkedActions[act.title] ? (
                          <CheckSquare className="w-4.5 h-4.5 text-emerald-400" />
                        ) : (
                          <Square className="w-4.5 h-4.5 text-slate-500" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <span className={`text-xs font-bold block ${checkedActions[act.title] ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                          {act.title}
                        </span>
                        <span className={`px-1.5 py-0.2 rounded text-[7px] font-bold uppercase tracking-wider ${
                          act.priority === 'Critical'
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        }`}>
                          {act.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      ) : (
        <div className="text-center py-10 text-slate-500">Briefing details unavailable.</div>
      )}
    </div>
  );
};

export default DecisionBriefingsPage;
