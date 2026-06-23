import React from 'react';
import { Target, Heart, Award, Users2, Building2, Globe2 } from 'lucide-react';
import { SectionHeader } from '../components/SectionHeader';
import { GlassCard } from '../components/GlassCard';
import { motion } from 'framer-motion';

export const About: React.FC = () => {
  const stakeholders = [
    {
      icon: <Users2 className="w-8 h-8 text-primary" />,
      title: 'For Citizens',
      desc: 'Submit localized concerns easily, check on issue resolutions, and receive real-time, personalized emergency alerts.',
    },
    {
      icon: <Building2 className="w-8 h-8 text-secondary" />,
      title: 'For Governments',
      desc: 'Access ranked dashboards. Save critical response times and manage taxpayer resource allocation with predictive risks.',
    },
    {
      icon: <Globe2 className="w-8 h-8 text-accent" />,
      title: 'For Communities & NGOs',
      desc: 'Coordinate environmental programs, review scheme matching agents, and analyze geographic metrics.',
    },
  ];

  const values = [
    {
      icon: <Target className="w-5 h-5 text-primary" />,
      title: 'Transparency first',
      text: 'Every AI routing decision is explainable. Citizen data is hashed, and government resolution times are publicly auditable.',
    },
    {
      icon: <Heart className="w-5 h-5 text-secondary" />,
      title: 'Community Inclusivity',
      text: 'Built with accessibility standards to ensure citizens of all abilities and backgrounds can make their voices heard.',
    },
    {
      icon: <Award className="w-5 h-5 text-accent" />,
      title: 'Enterprise Standard',
      text: 'Engineered with FastAPI backend speed, Redis caching layers, pgvector storage, and Firebase Auth guarantees.',
    },
  ];

  return (
    <div className="space-y-16 md:space-y-24 py-8">
      {/* 1. MISSION */}
      <section className="text-center max-w-4xl mx-auto space-y-6">
        <SectionHeader
          title="Our Mission & Purpose"
          subtitle="CivicMind AI bridges coordinate gaps in local administration through secure, open-source multi-agent workflows."
          badge="Platform Vision"
        />
        
        <GlassCard className="p-8 md:p-12 text-center border-l-4 border-l-primary relative overflow-hidden">
          <blockquote className="text-lg md:text-2xl font-medium font-heading italic text-slate-800 dark:text-slate-200 leading-relaxed mb-6">
            "We build systems that turn citizen noise into structural signals. By automating the triage and analytics pipeline, we help cities resolve failures before they escalate."
          </blockquote>
          <cite className="text-sm font-semibold uppercase tracking-wider text-primary not-italic">
            &mdash; The CivicMind Architect Team
          </cite>
        </GlassCard>
      </section>

      {/* 2. STAKEHOLDERS */}
      <section className="space-y-12">
        <SectionHeader
          title="Bridging the Civic Gap"
          subtitle="A unified workspace connecting all local participants under a single visual GIS system."
          badge="Platform Stakeholders"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stakeholders.map((s, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15 }}
            >
              <GlassCard className="h-full flex flex-col justify-between items-start text-left border border-white/5 p-8">
                <div className="p-3 bg-slate-800/40 dark:bg-slate-800/40 light:bg-slate-100 rounded-2xl border border-slate-700/50 light:border-slate-250 mb-6">
                  {s.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold font-heading text-slate-900 dark:text-slate-100 mb-3">
                    {s.title}
                  </h3>
                  <p className="text-sm text-slate-700 dark:text-slate-400 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. VALUE PROPOSITION */}
      <section className="space-y-12 max-w-5xl mx-auto">
        <SectionHeader
          title="What We Stand For"
          subtitle="Three architectural principles guide our development towards production-ready, startup quality software."
          badge="Core Values"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((v, idx) => (
            <div key={idx} className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary border border-primary/20">
                  {v.icon}
                </div>
                <h4 className="text-lg font-bold font-heading text-slate-900 dark:text-slate-100">
                  {v.title}
                </h4>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-400 leading-relaxed">
                {v.text}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
export default About;
