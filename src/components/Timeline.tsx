import React from 'react';
import { motion } from 'framer-motion';
import { FileText, BrainCircuit, ShieldCheck } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface TimelineStep {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export const Timeline: React.FC = () => {
  const steps: TimelineStep[] = [
    {
      number: 1,
      title: 'Citizens Report',
      description: 'Report localized issues, infrastructure problems, or community concerns. Add geo-locations and attach images directly via our citizen interface.',
      icon: <FileText className="w-6 h-6" />,
      color: 'from-primary/20 to-primary/5 border-primary/20',
    },
    {
      number: 2,
      title: 'AI Agents Analyze',
      description: 'Our decentralized multi-agent system categorizes the report, matches it to government schemes, runs emergency predictions, and determines urgency.',
      icon: <BrainCircuit className="w-6 h-6" />,
      color: 'from-secondary/20 to-secondary/5 border-secondary/20',
    },
    {
      number: 3,
      title: 'Government Resolves',
      description: 'Government personnel receive ranked, actionable intelligence. Insights route automatically, saving critical response time and taxpayer money.',
      icon: <ShieldCheck className="w-6 h-6" />,
      color: 'from-accent/20 to-accent/5 border-accent/20',
    },
  ];

  return (
    <div className="relative max-w-6xl mx-auto px-4 py-8">
      {/* Connector Line (Desktop) */}
      <div className="hidden md:block absolute top-1/2 left-12 right-12 h-1 bg-gradient-to-r from-primary via-secondary to-accent opacity-20 -translate-y-12 z-0" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        {steps.map((step, idx) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.2, duration: 0.5 }}
            className="flex flex-col items-center"
          >
            {/* Step Icon Hexagon/Circle */}
            <div className="relative mb-6">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 dark:bg-slate-900 light:bg-white border-2 border-slate-700/50 flex items-center justify-center text-primary-500 shadow-xl relative z-10 transition-transform hover:rotate-12 duration-300">
                {step.icon}
              </div>
              {/* Step Number Badge */}
              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-xs font-bold text-white shadow-md z-20">
                {step.number}
              </div>
            </div>

            {/* Step Card Content */}
            <GlassCard className="text-center flex flex-col justify-between items-center w-full h-full min-h-[220px]">
              <h3 className="text-xl font-bold font-heading text-slate-900 dark:text-slate-100 mb-3">
                {step.title}
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-400 leading-relaxed">
                {step.description}
              </p>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
export default Timeline;
