import React, { useState } from 'react';
import { useGovernment } from '../../context/GovernmentContext';
import { SectionHeader } from '../../components/SectionHeader';
import { GlassCard } from '../../components/GlassCard';
import { FileSpreadsheet, Download, CheckCircle2 } from 'lucide-react';

export const GovernmentReports: React.FC = () => {
  const { exportReport, isLoading } = useGovernment();
  const [reportFormat, setReportFormat] = useState<'CSV' | 'Excel'>('CSV');

  const reportsList = [
    { title: 'Daily Triage Log', desc: 'Summary of incident tickets triaged in the last 24 hours.', type: 'Daily' },
    { title: 'Weekly Performance Report', desc: 'Department SLA response latencies and resolution indexes.', type: 'Weekly' },
    { title: 'Monthly District Audit', desc: 'Ward coverage metrics, citizen satisfaction surveys, and volume growth.', type: 'Monthly' },
    { title: 'Department Workload Audit', desc: 'Case distribution percentages across sanitation, water, electricity, etc.', type: 'Department' },
    { title: 'Ward Resolution Report', desc: 'Specific density clusters and resolving times for San Francisco wards.', type: 'Ward' },
    { title: 'Public Resources Log', desc: 'Personnel shift logs, fleet maintenance trackers, and budget utilization.', type: 'Performance' },
  ];

  const handleDownload = async (type: string) => {
    await exportReport(type, reportFormat);
  };

  return (
    <div className="space-y-6 pb-10">
      <SectionHeader
        title="Administrative reports & Audits"
        subtitle="Generate and download Daily, Weekly, or Monthly spreadsheet logs for administrative archiving and presentations."
        badge="Reports Center"
        center={false}
      />

      {/* Format selector */}
      <GlassCard className="p-5 border-t border-white/5 flex items-center justify-between gap-6 flex-wrap">
        <div className="space-y-1">
          <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-slate-100">Export Parameters</h4>
          <p className="text-[10px] text-slate-500 font-semibold">Select desired format for spreadsheet generation</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setReportFormat('CSV')}
            className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all ${
              reportFormat === 'CSV'
                ? 'bg-secondary text-slate-950 border-secondary'
                : 'border-slate-700/60 text-slate-400 hover:text-slate-100 hover:bg-slate-900/50'
            }`}
          >
            Comma Separated Values (.csv)
          </button>
          <button
            onClick={() => setReportFormat('Excel')}
            className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all ${
              reportFormat === 'Excel'
                ? 'bg-secondary text-slate-950 border-secondary'
                : 'border-slate-700/60 text-slate-400 hover:text-slate-100 hover:bg-slate-900/50'
            }`}
          >
            Microsoft Excel (.xlsx)
          </button>
        </div>
      </GlassCard>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportsList.map((rep) => (
          <GlassCard 
            key={rep.type} 
            className="p-5 border border-white/5 space-y-4 hover:border-secondary/20 transition-all flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex gap-3 items-center">
                <div className="p-2 bg-secondary/15 border border-secondary/20 text-secondary rounded-xl shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-slate-100">{rep.title}</h4>
              </div>
              <p className="text-xs text-slate-450 leading-relaxed font-semibold">{rep.desc}</p>
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-between items-center">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> SLA Compliant
              </span>

              <button
                disabled={isLoading}
                onClick={() => handleDownload(rep.type)}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-705 rounded-xl hover:border-secondary text-slate-400 hover:text-secondary bg-slate-950/30 hover:bg-slate-800/40 text-[10px] font-bold uppercase tracking-wider transition-all disabled:opacity-40"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

export default GovernmentReports;
