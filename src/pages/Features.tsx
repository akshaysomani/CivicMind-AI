import React from 'react';
import { SectionHeader } from '../components/SectionHeader';
import { GlassCard } from '../components/GlassCard';
import { CheckSquare, ShieldCheck, MapPin, Database, Info } from 'lucide-react';
import { motion } from 'framer-motion';

export const Features: React.FC = () => {
  const categories = [
    {
      title: 'Decentralized GIS Systems',
      icon: <MapPin className="w-5 h-5 text-secondary" />,
      items: [
        'Geographic cluster tracking: overlay water line issues with power blackouts.',
        'Heatmap representation: view hot zones of citizen requests instantly.',
        'Custom Leaflet map layers displaying municipal boundaries and zoning grids.',
      ],
    },
    {
      title: 'LangGraph Coordination',
      icon: <Database className="w-5 h-5 text-primary" />,
      items: [
        'Multi-agent state machines routing complaints to targeted agency categories.',
        'Conversational scheme assistance scanning active state benefits databases.',
        'Predictive flood and emergency forecasting using localized risk profiles.',
      ],
    },
  ];

  const modules = [
    { num: '01', title: 'Enterprise Project Foundation', desc: 'React v19 + TS + Tailwind v4 + routing and contexts initialized.', active: true },
    { num: '02', title: 'Authentication', desc: 'Firebase Auth integration with custom citizen & official RBAC roles.', active: false },
    { num: '03-04', title: 'Interactive Dashboards', desc: 'Custom portals for citizens to report issues and government to resolve.', active: false },
    { num: '05-06', title: 'GIS Map & Issue Reports', desc: 'Leaflet geospatial rendering and offline issue logging support.', active: false },
    { num: '07-11', title: 'Multi-Agent AI Systems', desc: 'Google Gemini integration with LangGraph agent coordination workflows.', active: false },
    { num: '12-15', title: 'Analytics & Risk Forecasting', desc: 'Recharts visualizations and predictive ML forecasting pipelines.', active: false },
    { num: '16-20', title: 'Admin panel & Production', desc: 'Admin controls, end-to-end testing, and production deployment scripts.', active: false },
  ];

  return (
    <div className="space-y-16 md:space-y-24 py-8">
      {/* 1. FEATURES INTRO */}
      <section>
        <SectionHeader
          title="Core Capabilities"
          subtitle="Explore the structural blocks powering our decision support and coordination platforms."
          badge="Product Details"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {categories.map((cat, idx) => (
            <GlassCard key={idx} className="p-8 border border-white/5 relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3.5 mb-6">
                  <div className="p-2.5 bg-slate-800/60 dark:bg-slate-800/60 light:bg-slate-100 rounded-xl border border-slate-700/50 light:border-slate-350 text-primary">
                    {cat.icon}
                  </div>
                  <h3 className="text-xl font-bold font-heading text-slate-900 dark:text-slate-100">
                    {cat.title}
                  </h3>
                </div>
                <ul className="space-y-4">
                  {cat.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-455">
                      <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* 2. ROADMAP ARCHITECTURE */}
      <section className="space-y-12">
        <SectionHeader
          title="The 20-Module Enterprise Roadmap"
          subtitle="A systematic build strategy delivering production-ready, startup quality software module-by-module."
          badge="Development Architecture"
        />

        <div className="max-w-4xl mx-auto space-y-4">
          {modules.map((m, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                m.active
                  ? 'bg-primary/10 border-primary text-slate-100 shadow-md shadow-primary/5'
                  : 'bg-slate-900/40 dark:bg-slate-900/40 light:bg-white border-white/10 dark:border-white/5 light:border-slate-200 text-slate-500'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className={`font-heading font-extrabold text-2xl ${m.active ? 'text-primary' : 'text-slate-600 dark:text-slate-700'}`}>
                  {m.num}
                </span>
                <div>
                  <h4 className={`text-base font-bold font-heading ${m.active ? 'text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-400'}`}>
                    {m.title}
                  </h4>
                  <p className="text-xs text-slate-650 dark:text-slate-450 mt-0.5">{m.desc}</p>
                </div>
              </div>

              {m.active ? (
                <span className="self-start sm:self-auto px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/20 text-primary border border-primary/20 flex items-center gap-1.5 animate-pulse-slow">
                  <CheckSquare className="w-3.5 h-3.5" />
                  Active Module
                </span>
              ) : (
                <span className="self-start sm:self-auto px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-slate-800 dark:bg-slate-800 light:bg-slate-100 text-slate-500 border border-slate-700/50 light:border-slate-200/50 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  Future Phase
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};
export default Features;
