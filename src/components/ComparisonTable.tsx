import React from 'react';
import { Check, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface ComparisonRow {
  feature: string;
  traditional: string;
  traditionalCheck: boolean;
  civicMind: string;
  civicMindCheck: boolean;
}

export const ComparisonTable: React.FC = () => {
  const data: ComparisonRow[] = [
    {
      feature: 'Issue Processing',
      traditional: 'Manual triage, weeks of latency',
      traditionalCheck: false,
      civicMind: 'Real-time multi-agent classification & auto-routing',
      civicMindCheck: true,
    },
    {
      feature: 'Community Insights',
      traditional: 'Static forms, disconnected feedback',
      traditionalCheck: false,
      civicMind: 'RAG-powered conversational intelligence & knowledge bases',
      civicMindCheck: true,
    },
    {
      feature: 'Emergency Management',
      traditional: 'Reactive reporting after events occur',
      traditionalCheck: false,
      civicMind: 'Predictive risk forecasting & automated smart notifications',
      civicMindCheck: true,
    },
    {
      feature: 'Government Schemes',
      traditional: 'Citizens search through endless PDFs manually',
      traditionalCheck: false,
      civicMind: 'Personalized matching via scheme assistance agents',
      civicMindCheck: true,
    },
    {
      feature: 'GIS & Mapping',
      traditional: 'Flat list of issues, no spatial overlap',
      traditionalCheck: false,
      civicMind: 'Interactive heatmaps & emergency vector analysis',
      civicMindCheck: true,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="w-full overflow-hidden rounded-[24px] border border-white/10 dark:border-white/5 light:border-slate-200/80 shadow-2xl glass dark:glass light:glass-light"
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-white/10 dark:border-white/10 light:border-slate-250 bg-slate-900/40 dark:bg-slate-900/40 light:bg-slate-50">
              <th className="p-5 text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider w-1/3">Feature</th>
              <th className="p-5 text-sm font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wider w-1/3">Traditional Platforms</th>
              <th className="p-5 text-sm font-bold text-primary uppercase tracking-wider w-1/3 bg-primary/5">CivicMind AI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 dark:divide-white/5 light:divide-slate-200/50">
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-white/2 dark:hover:bg-slate-800/10 light:hover:bg-slate-50/50 transition-colors">
                <td className="p-5 text-sm font-semibold text-slate-900 dark:text-slate-200">
                  {row.feature}
                </td>
                <td className="p-5 text-sm text-slate-700 dark:text-slate-450">
                  <div className="flex items-start gap-2.5">
                    <X className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    <span>{row.traditional}</span>
                  </div>
                </td>
                <td className="p-5 text-sm text-slate-900 dark:text-slate-200 bg-primary/5 border-l border-r border-primary/10">
                  <div className="flex items-start gap-2.5">
                    <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="font-medium">{row.civicMind}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};
export default ComparisonTable;
