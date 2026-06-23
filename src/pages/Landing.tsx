import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  BrainCircuit,
  FileSpreadsheet,
  Clock,
  ArrowRight,
  Sparkles,
  Bell,
  BarChart3,
  Bot,
  TrendingUp,
  Activity,
  CheckCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';

import { Button } from '../components/Button';
import { StatCard } from '../components/StatCard';
import { Timeline } from '../components/Timeline';
import { ComparisonTable } from '../components/ComparisonTable';
import { SectionHeader } from '../components/SectionHeader';
import { GlassCard } from '../components/GlassCard';
import { AIParticles } from '../components/AIParticles';
import { useNotifications } from '../context/NotificationContext';
import { useApp } from '../context/AppContext';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotifications();
  const { stats } = useApp();

  const handleLearnMore = () => {
    navigate('/features');
    showNotification('Navigated to Core Features', 'success', 2000);
  };

  const handleGetStarted = () => {
    showNotification('Connecting to CivicMind AI Hub (Simulated)...', 'info');
  };

  const premiumFeatures = [
    {
      icon: <BrainCircuit className="w-6 h-6 text-primary" />,
      title: 'Community Intelligence',
      desc: 'Connect and summarize community discussions automatically using LLM coordination agents.',
    },
    {
      icon: <Bell className="w-6 h-6 text-secondary" />,
      title: 'Emergency Alerts',
      desc: 'Predictive safety risk analytics mapping local issues directly to critical warnings.',
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-accent" />,
      title: 'Government Analytics',
      desc: 'Track service times, resolution rates, and infrastructure bottlenecks on rich spatial dashboards.',
    },
    {
      icon: <Bot className="w-6 h-6 text-amber-500" />,
      title: 'AI Citizen Assistant',
      desc: 'Conversational assistant explaining complex city documents and recommending relevant resources.',
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-rose-500" />,
      title: 'Predictive Insights',
      desc: 'Identify deteriorating assets, traffic trends, and local crime patterns before they spike.',
    },
    {
      icon: <Activity className="w-6 h-6 text-violet-500" />,
      title: 'Community Reports',
      desc: 'Export summary statistics, CSVs, and PDF briefs summarizing neighborhood resolutions.',
    },
  ];

  return (
    <div className="space-y-24 md:space-y-36 relative">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[70vh] flex flex-col items-center justify-center text-center py-12 md:py-20 overflow-hidden">
        <AIParticles />
        
        <div className="relative z-10 max-w-5xl mx-auto space-y-8 px-4">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20"
          >
            <Sparkles className="w-4 h-4 animate-spin-slow" />
            <span>Civic Decision-Support Platform</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight font-heading leading-none"
          >
            CivicMind <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">AI</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl md:text-2xl text-slate-700 dark:text-slate-350 max-w-3xl mx-auto leading-relaxed"
          >
            Transforming Community Decisions with Multi-Agent Artificial Intelligence. 
            Bridging the gap between citizens and governments with structured, actionable insights.
          </motion.p>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button variant="primary" size="lg" className="w-full sm:w-auto gap-2" onClick={handleGetStarted}>
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="glass" size="lg" className="w-full sm:w-auto" onClick={handleLearnMore}>
              Learn More
            </Button>
          </motion.div>
        </div>
      </section>

      {/* 2. STATISTICS SECTION */}
      <section className="relative py-8">
        <SectionHeader
          title="Empowering Communities at Scale"
          subtitle="Our open architecture allows real-time metric updates across thousands of municipalities."
          badge="Platform Operations"
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<Users className="w-6 h-6" />}
            value={stats.communitiesConnected}
            label="Communities Connected"
            description="Active city municipalities and neighborhoods sync'd."
          />
          <StatCard
            icon={<BrainCircuit className="w-6 h-6" />}
            value={stats.aiDecisions}
            label="AI Decisions Managed"
            description="Automatic reports categorized and routed."
            suffix="+"
          />
          <StatCard
            icon={<FileSpreadsheet className="w-6 h-6" />}
            value={stats.reportsGenerated}
            label="Reports Generated"
            description="Citizen briefs, exports, and updates generated."
          />
          <StatCard
            icon={<Clock className="w-6 h-6" />}
            value={42}
            label="Avg. Response Time"
            description="Average government action turnaround."
            prefix="< "
            suffix=" mins"
          />
        </div>
      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <section className="relative py-8">
        <SectionHeader
          title="The CivicMind Operations Flow"
          subtitle="How our platforms connect citizen observations with government decisions using advanced pipelines."
          badge="Workflow Integration"
        />
        
        <Timeline />
      </section>

      {/* 4. FEATURES SECTION */}
      <section className="relative py-8">
        <SectionHeader
          title="Next-Generation Enterprise Modules"
          subtitle="Explore the underlying framework blocks that make CivicMind AI a powerhouse SaaS solution."
          badge="Core Architecture"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {premiumFeatures.map((feat, idx) => (
            <GlassCard key={idx} className="flex flex-col h-full border-t border-t-slate-700/50 hover:border-t-primary/50 transition-all duration-300">
              <div className="mb-5 p-3 rounded-2xl bg-slate-800/40 dark:bg-slate-800/40 light:bg-slate-100 border border-slate-750 light:border-slate-200 w-fit">
                {feat.icon}
              </div>
              <h3 className="text-xl font-bold font-heading text-slate-900 dark:text-slate-100 mb-2">
                {feat.title}
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-400 leading-relaxed">
                {feat.desc}
              </p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* 5. WHY CIVICMIND AI (COMPARISON) */}
      <section className="relative py-8">
        <SectionHeader
          title="Reinventing Local Administration"
          subtitle="CivicMind AI outperforms traditional public forums by resolving coordination failures."
          badge="Competitive Advantage"
        />

        <ComparisonTable />
      </section>

      {/* 6. BOTTOM CALL-TO-ACTION */}
      <section className="relative py-8 text-center max-w-4xl mx-auto">
        <GlassCard className="text-center p-12 md:p-16 border border-primary/20 bg-gradient-to-tr from-primary/10 to-secondary/5 relative overflow-hidden">
          {/* Decorative Mesh Background */}
          <div className="absolute inset-0 bg-primary/2 opacity-20 pointer-events-none" />
          
          <h2 className="text-3xl md:text-5xl font-extrabold font-heading text-slate-900 dark:text-slate-100 mb-6">
            Ready to Upgrade Your City?
          </h2>
          <p className="text-base md:text-lg text-slate-700 dark:text-slate-350 max-w-2xl mx-auto mb-8 leading-relaxed">
            Begin with Module 1, lay the foundation, and watch the platform evolve into a fully automated GIS and multi-agent system.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button variant="primary" size="lg" className="gap-2" onClick={handleGetStarted}>
              <span>Initialize Workspace</span>
              <CheckCircle className="w-5 h-5" />
            </Button>
            <Button variant="glass" size="lg" onClick={() => navigate('/about')}>
              Meet the Architect
            </Button>
          </div>
        </GlassCard>
      </section>
    </div>
  );
};
export default Landing;
