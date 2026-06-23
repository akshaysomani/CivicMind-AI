import React from 'react';
import { SectionHeader } from '../../components/SectionHeader';
import { PlusCircle, Bot, Activity, PhoneCall, ShieldCheck } from 'lucide-react';
import { GlassCard } from '../../components/GlassCard';

export const ReportIssuePlaceholder: React.FC = () => {
  return (
    <div className="space-y-6 pb-10">
      <SectionHeader
        title="Report New Concern"
        subtitle="Initiate damage reports, traffic warnings, or pipeline malfunctions with location coordinates."
        badge="Module 5 Pending"
        center={false}
      />
      <GlassCard className="max-w-xl mx-auto p-8 text-center space-y-6 border-t-2 border-t-primary">
        <div className="p-4 bg-primary/10 rounded-2xl w-fit text-primary mx-auto border border-primary/20">
          <PlusCircle className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold font-heading text-slate-900 dark:text-slate-100">
            Issue Reporter Launching Soon
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Module 5 will implement full geospatial GPS maps, media uploads for damage reports, and auto-routing to LangGraph municipal agency nodes.
          </p>
        </div>
        <div className="pt-4 border-t border-white/5 flex justify-center gap-6 text-[10px] uppercase font-bold tracking-wider text-slate-500">
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-500" /> GPS Tagging</span>
          <span className="flex items-center gap-1.5"><Activity className="w-4 h-4 text-emerald-500" /> Auto Routing</span>
        </div>
      </GlassCard>
    </div>
  );
};

export const HelpCenterPlaceholder: React.FC = () => {
  return (
    <div className="space-y-6 pb-10">
      <SectionHeader
        title="Help & Consultations"
        subtitle="Discuss municipal guidelines, zoning permissions, and government scheme benchmarks with the AI Assistant."
        badge="Module 8 Pending"
        center={false}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* AI chat block placeholder */}
        <GlassCard className="p-6 text-center space-y-5 border-t-2 border-t-accent flex flex-col justify-between">
          <div>
            <div className="p-3.5 bg-accent/10 rounded-xl w-fit text-accent mx-auto border border-accent/20 mb-4">
              <Bot className="w-8 h-8" />
            </div>
            <h4 className="font-heading font-bold text-lg text-slate-900 dark:text-slate-100 mb-2">
              Google Gemini LLM Agent
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Unlock a real-time conversational agent capable of reviewing eligibility benchmarks, resolving legal bylaws queries, and drafting municipal reports automatically.
            </p>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 pt-4 block border-t border-white/5">
            Launches in Module 8
          </span>
        </GlassCard>

        {/* Emergency contact block */}
        <GlassCard className="p-6 text-center space-y-5 border-t-2 border-t-rose-500 flex flex-col justify-between">
          <div>
            <div className="p-3.5 bg-rose-500/10 rounded-xl w-fit text-rose-500 mx-auto border border-rose-500/20 mb-4">
              <PhoneCall className="w-8 h-8" />
            </div>
            <h4 className="font-heading font-bold text-lg text-slate-900 dark:text-slate-100 mb-2">
              Crisis Emergency Desk
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Provides direct crisis intervention coordinates, fire/medical dispatch connections, and public safety hotline numbers.
            </p>
          </div>
          <div className="pt-4 border-t border-white/5 space-y-1 text-slate-500 text-xs font-semibold">
            <div>Hotline: +1 (555) 911-CIVIC</div>
            <div>Support: dispatch@civicmind.gov</div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
