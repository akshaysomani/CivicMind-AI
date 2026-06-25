import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users, BrainCircuit, FileSpreadsheet, Clock, ArrowRight,
  Sparkles, Bell, BarChart3, Bot, Activity,
  CheckCircle, MapPin, Zap, Globe
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useApp } from '../context/AppContext';


const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 }
  },
};

const StatCard = ({ icon, value, label, suffix = '', prefix = '' }: any) => (
  <motion.div
    variants={fadeUp}
    whileHover={{ y: -4, scale: 1.02 }}
    className="relative group p-6 rounded-2xl border border-white/8 bg-slate-900/50 backdrop-blur-sm overflow-hidden"
  >
    <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary/0 via-primary to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="flex items-start justify-between mb-4">
      <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/15 text-primary">
        {icon}
      </div>
    </div>
    <div className="text-3xl font-extrabold font-heading text-slate-900 dark:text-white mb-1 tracking-tight">
      {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
    </div>
    <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">{label}</div>
  </motion.div>
);

const FeatureCard = ({ icon, title, desc, color }: any) => (
  <motion.div
    variants={fadeUp}
    whileHover={{ y: -5 }}
    className="group relative p-6 rounded-2xl bg-slate-900/40 border border-white/6 hover:border-white/12 backdrop-blur-sm transition-all duration-300 overflow-hidden"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-transparent group-hover:from-primary/3 transition-all duration-500" />
    <div className={`relative mb-5 inline-flex p-3 rounded-xl ${color} border`}>
      {icon}
    </div>
    <h3 className="relative text-lg font-bold font-heading text-slate-900 dark:text-white mb-2 group-hover:text-primary transition-colors duration-300">
      {title}
    </h3>
    <p className="relative text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
      {desc}
    </p>
  </motion.div>
);

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { stats } = useApp();

  const handleGetStarted = () => {
    navigate('/login');
  };

  const features = [
    {
      icon: <BrainCircuit className="w-5 h-5 text-blue-400" />,
      title: 'Multi-Agent AI Core',
      desc: 'Intelligent agent network automatically categorizes, routes, and resolves community complaints using LLM coordination.',
      color: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    },
    {
      icon: <Bell className="w-5 h-5 text-rose-400" />,
      title: 'Smart Emergency Alerts',
      desc: 'Real-time safety risk analytics map local hazards to critical warnings before they escalate.',
      color: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
    },
    {
      icon: <BarChart3 className="w-5 h-5 text-violet-400" />,
      title: 'Government Analytics',
      desc: 'Track service times, resolution rates, and infrastructure bottlenecks on rich spatial dashboards.',
      color: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
    },
    {
      icon: <Bot className="w-5 h-5 text-cyan-400" />,
      title: 'AI Citizen Assistant',
      desc: 'Conversational assistant powered by Gemini AI — explains city documents, recommends resources, answers questions.',
      color: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
    },
    {
      icon: <MapPin className="w-5 h-5 text-emerald-400" />,
      title: 'GIS Interactive Maps',
      desc: 'Live geospatial maps with ward boundaries, issue heatmaps, and route dispatching to field teams.',
      color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    },
    {
      icon: <Activity className="w-5 h-5 text-amber-400" />,
      title: 'Predictive Insights',
      desc: 'Identify infrastructure deterioration, traffic trends, and at-risk zones before they become crises.',
      color: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    },
  ];

  const steps = [
    { number: '01', title: 'Citizens Report Issues', desc: 'Submit via AI-guided form with photos, GPS, and category tagging.' },
    { number: '02', title: 'AI Agents Analyze', desc: 'Multi-agent network classifies severity, routes to department, and notifies stakeholders.' },
    { number: '03', title: 'Government Responds', desc: 'Officers receive dispatch, update status in real-time, citizens get automated SMS/app updates.' },
    { number: '04', title: 'Data Drives Policy', desc: 'Executive dashboards surface patterns for city leaders to make evidence-based budget decisions.' },
  ];

  const trustedBy = ['Municipal Corporation', 'State Government', 'NGO Alliance', 'Smart City Mission', 'Urban Development'];

  return (
    <div className="relative overflow-hidden">

      {/* ============ HERO SECTION ============ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 py-24">
        {/* Decorative background orbs */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute top-1/3 -right-24 w-80 h-80 rounded-full bg-secondary/8 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-64 bg-gradient-to-t from-primary/5 to-transparent" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '60px 60px'
            }}
          />
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto space-y-8"
        >
          {/* Badge */}
          <motion.div custom={0} variants={fadeUp} className="inline-flex">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              India's Premier Civic AI Platform
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={fadeUp}
            className="text-5xl sm:text-6xl md:text-7xl font-extrabold font-heading tracking-tight text-slate-900 dark:text-white leading-[1.05]"
          >
            Smarter Cities Start with
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300 bg-clip-text text-transparent">
              CivicMind AI
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            Connect citizens with government. Turn complaints into action.
            Build a transparent, data-driven city with multi-agent AI working 24/7 for your community.
          </motion.p>

          {/* CTAs */}
          <motion.div
            custom={0.3}
            variants={fadeUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
          >
            <button
              onClick={handleGetStarted}
              className="group flex items-center gap-2.5 px-8 py-4 bg-primary hover:bg-primary-dark text-white font-bold text-sm rounded-2xl transition-all duration-200 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 hover:-translate-y-0.5"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/features')}
              className="flex items-center gap-2 px-8 py-4 border border-white/12 text-slate-300 hover:text-white hover:border-white/25 font-semibold text-sm rounded-2xl transition-all duration-200 hover:-translate-y-0.5 backdrop-blur-sm"
            >
              Explore Features
            </button>
          </motion.div>

          {/* Social proof */}
          <motion.div custom={0.4} variants={fadeUp} className="flex flex-wrap items-center justify-center gap-6 pt-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              <span>Free to use</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              <span>No credit card needed</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              <span>Trusted by 50+ municipalities</span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ============ STATS SECTION ============ */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="text-center mb-14"
          >
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-slate-800/60 text-slate-400 border border-white/8 mb-4">
              Platform Operations
            </motion.span>
            <motion.h2 variants={fadeUp} custom={0.1} className="text-3xl md:text-4xl font-extrabold text-white font-heading mb-3">
              Trusted at Scale
            </motion.h2>
            <motion.p variants={fadeUp} custom={0.2} className="text-slate-400 max-w-xl mx-auto">
              Real-time metrics from communities actively using CivicMind AI to improve their cities.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-5"
          >
            <StatCard icon={<Users className="w-5 h-5" />} value={stats.communitiesConnected} label="Communities Connected" />
            <StatCard icon={<BrainCircuit className="w-5 h-5" />} value={stats.aiDecisions} label="AI Decisions Made" suffix="+" />
            <StatCard icon={<FileSpreadsheet className="w-5 h-5" />} value={stats.reportsGenerated} label="Reports Generated" />
            <StatCard icon={<Clock className="w-5 h-5" />} value={42} label="Avg. Response Time" prefix="<" suffix=" min" />
          </motion.div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="py-20 px-4 relative">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
        </div>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-slate-800/60 text-slate-400 border border-white/8 mb-4">
              How It Works
            </motion.span>
            <motion.h2 variants={fadeUp} custom={0.1} className="text-3xl md:text-4xl font-extrabold text-white font-heading mb-3">
              From Report to Resolution
            </motion.h2>
            <motion.p variants={fadeUp} custom={0.2} className="text-slate-400 max-w-xl mx-auto">
              Our AI pipeline ensures every citizen complaint reaches the right department and gets resolved — faster than ever before.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                variants={fadeUp}
                custom={i * 0.1}
                className="relative group"
              >
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-7 left-full w-full h-px bg-gradient-to-r from-primary/30 to-transparent z-10" />
                )}
                <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/6 hover:border-primary/20 transition-all duration-300">
                  <div className="text-4xl font-black font-heading text-primary/20 group-hover:text-primary/40 transition-colors mb-4 leading-none">
                    {step.number}
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2 text-sm">{step.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============ FEATURES SECTION ============ */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-slate-800/60 text-slate-400 border border-white/8 mb-4">
              Platform Features
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white font-heading mb-3">
              Everything Your City Needs
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
              A comprehensive enterprise platform built for modern civic governance.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feat, i) => (
              <motion.div key={i} custom={i * 0.08} variants={fadeUp}>
                <FeatureCard {...feat} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============ TRUSTED BY ============ */}
      <section className="py-16 px-4 border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-500 mb-8">
            Trusted by Government Bodies & Organizations
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {trustedBy.map((org) => (
              <div key={org} className="px-5 py-2.5 rounded-xl bg-slate-900/40 border border-white/6 text-xs font-semibold text-slate-400 flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-slate-600" />
                {org}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ BOTTOM CTA ============ */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="relative p-12 md:p-16 rounded-3xl overflow-hidden border border-primary/20"
          >
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-secondary/5" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

            <motion.div variants={fadeUp} className="relative space-y-6">
              <div className="inline-flex items-center gap-2 p-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-2">
                <Zap className="w-6 h-6" />
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white font-heading">
                Ready to Transform Your City?
              </h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
                Join hundreds of municipalities using CivicMind AI to deliver faster services,
                better infrastructure, and transparent governance to their citizens.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <button
                  onClick={handleGetStarted}
                  className="group flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary-dark text-white font-bold text-sm rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 hover:-translate-y-0.5 transition-all duration-200"
                >
                  Start for Free Today
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <Link
                  to="/about"
                  className="px-8 py-4 border border-white/12 hover:border-white/25 text-slate-300 hover:text-white font-semibold text-sm rounded-2xl hover:-translate-y-0.5 transition-all duration-200"
                >
                  Learn More
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

    </div>
  );
};
export default Landing;
