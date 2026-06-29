import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
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

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { stats } = useApp();

  const handleGetStarted = () => {
    navigate('/login');
  };

  const handleFileGrievance = () => {
    navigate('/login'); // Redirects to login/auth flow before filing
  };

  return (
    <div className="relative overflow-hidden w-full max-w-full">
      {/* ============ HERO SECTION ============ */}
      <section className="py-20 px-4 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start border-b border-border-default">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-text-secondary uppercase tracking-widest">
            <span className="w-5 h-[1px] bg-text-secondary"></span>
            Citizen engagement platform
          </div>
          <h1 className="font-heading font-normal text-5xl md:text-6xl text-text-primary tracking-tight leading-[1.08]">
            Your complaint.<br />
            <em className="text-secondary font-heading italic not-italic">Heard. Tracked.<br />Resolved.</em>
          </h1>
          <p className="text-base text-text-secondary max-w-md leading-relaxed font-normal">
            CivicMind AI connects citizens with local governments — routing grievances to the right department, tracking every step, and measuring accountability in the open.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={handleFileGrievance}
              className="btn-primary px-6 py-3.5 text-sm font-semibold flex items-center gap-2 cursor-pointer transition-all duration-200"
            >
              Report an issue
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/about')}
              className="px-6 py-3.5 border border-border-strong rounded-xl text-text-primary hover:border-text-primary text-sm font-medium transition-all cursor-pointer bg-transparent"
            >
              See how it works
            </button>
          </div>
        </motion.div>

        {/* Complaint Card Redesign mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full space-y-4"
        >
          <div className="bg-bg-surface border border-border-default rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-border-default flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-text-primary tracking-wide">GRV-2024-04817</span>
                <span className="text-[11px] font-semibold text-emerald-850 dark:text-emerald-300 bg-emerald-500/10 dark:bg-emerald-500/20 px-2.5 py-0.5 rounded-full">
                  In progress
                </span>
              </div>
              <span className="text-xs text-text-muted">2 hrs ago</span>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
                  Roads & Infrastructure
                </div>
                <div className="text-base font-semibold text-text-primary mb-2">
                  Large pothole blocking lane near school crossing
                </div>
                <div className="text-xs text-text-secondary flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0">
                    <path d="M6 1C4.3 1 3 2.3 3 4C3 6.5 6 11 6 11C6 11 9 6.5 9 4C9 2.3 7.7 1 6 1Z" stroke="currentColor" className="text-text-muted" strokeWidth="1.2" />
                    <circle cx="6" cy="4" r="1" fill="currentColor" className="text-text-muted" />
                  </svg>
                  Navrangpura, Ahmedabad — 380009
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5 pt-2 border-t border-border-subtle">
                <div className="flex justify-between text-xs text-text-muted">
                  <span>Progress</span>
                  <span className="font-semibold text-text-primary">68%</span>
                </div>
                <div className="h-1 bg-border-subtle rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '68%' }} />
                </div>
              </div>

              {/* Step indicator */}
              <div className="grid grid-cols-4 gap-2 text-center pt-2 text-[10px]">
                <div className="space-y-1">
                  <div className="w-2 h-2 rounded-full bg-primary mx-auto" />
                  <span className="text-text-secondary font-medium block">Filed</span>
                </div>
                <div className="space-y-1">
                  <div className="w-2 h-2 rounded-full bg-primary mx-auto" />
                  <span className="text-text-secondary font-medium block">Classified</span>
                </div>
                <div className="space-y-1">
                  <div className="w-2 h-2 rounded-full bg-secondary mx-auto" />
                  <span className="text-secondary font-bold block">Assigned</span>
                </div>
                <div className="space-y-1">
                  <div className="w-2 h-2 rounded-full bg-border-strong mx-auto" />
                  <span className="text-text-muted block">Resolved</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mini Info Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-bg-surface border border-border-default rounded-xl p-4.5">
              <div className="text-2xl font-semibold font-sans text-text-primary tracking-tight leading-none mb-1">
                24,817
              </div>
              <div className="text-[11px] text-text-muted font-medium mb-2">Issues resolved this year</div>
              <div className="text-[10px] font-semibold text-emerald-650 dark:text-emerald-400">↑ 31% vs last year</div>
            </div>
            <div className="bg-bg-surface border border-border-default rounded-xl p-4.5">
              <div className="text-2xl font-semibold font-sans text-text-primary tracking-tight leading-none mb-1">
                2.4 hrs
              </div>
              <div className="text-[11px] text-text-muted font-medium mb-2">Average response time</div>
              <div className="text-[10px] font-semibold text-emerald-655 dark:text-emerald-400">↓ 38% improvement</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ============ STATS STRIP SECTION ============ */}
      <section className="grid grid-cols-2 md:grid-cols-4 border-b border-border-default bg-bg-surface/50">
        <div className="p-8 border-r border-border-default flex flex-col justify-center">
          <div className="font-heading font-normal text-3xl md:text-4xl text-text-primary tracking-tight">
            {stats.communitiesConnected || 12}
          </div>
          <div className="text-xs md:text-sm text-text-secondary mt-1">Cities currently live</div>
        </div>
        <div className="p-8 border-r border-border-default flex flex-col justify-center">
          <div className="font-heading font-normal text-3xl md:text-4xl text-text-primary tracking-tight">
            94%
          </div>
          <div className="text-xs md:text-sm text-text-secondary mt-1">AI classification accuracy</div>
        </div>
        <div className="p-8 border-r md:border-r border-border-default flex flex-col justify-center">
          <div className="font-heading font-normal text-3xl md:text-4xl text-text-primary tracking-tight">
            {(stats.aiDecisions ? (stats.aiDecisions / 100000).toFixed(2) + 'L' : '1.02L')}
          </div>
          <div className="text-xs md:text-sm text-text-secondary mt-1">Citizens registered</div>
        </div>
        <div className="p-8 flex flex-col justify-center">
          <div className="font-heading font-normal text-3xl md:text-4xl text-text-primary tracking-tight">
            7
          </div>
          <div className="text-xs md:text-sm text-text-secondary mt-1">Languages supported</div>
        </div>
      </section>

      {/* ============ FEATURES SECTION ============ */}
      <section className="py-20 px-4 md:px-12 bg-bg-surface/10">
        <div className="flex flex-wrap items-baseline gap-4 mb-12">
          <span className="text-xs font-bold text-text-muted tracking-widest uppercase">01 — Features</span>
          <h2 className="font-heading font-normal text-3xl md:text-4xl text-text-primary tracking-tight leading-tight">
            Built for real governance,<br className="hidden md:block" /> not just reports
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border border-border-default rounded-xl overflow-hidden bg-border-default">
          <div className="bg-bg-surface p-8 space-y-4 hover:bg-bg-card-hover transition-colors">
            <div className="text-xs font-bold text-text-muted">01</div>
            <h3 className="text-base font-semibold text-text-primary">Smart grievance filing</h3>
            <p className="text-xs md:text-sm text-text-secondary leading-relaxed">
              File via text, voice, or photo. AI reads your complaint and pre-fills category, department, and priority — no form-filling expertise needed.
            </p>
          </div>
          <div className="bg-bg-surface p-8 space-y-4 hover:bg-bg-card-hover transition-colors">
            <div className="text-xs font-bold text-text-muted">02</div>
            <h3 className="text-base font-semibold text-text-primary">Automatic classification</h3>
            <p className="text-xs md:text-sm text-text-secondary leading-relaxed">
              Natural Language Processing routes each issue to the right department with an SLA assigned. Escalation is automatic when deadlines slip.
            </p>
          </div>
          <div className="bg-bg-surface p-8 space-y-4 hover:bg-bg-card-hover transition-colors">
            <div className="text-xs font-bold text-text-muted">03</div>
            <h3 className="text-base font-semibold text-text-primary">Live status tracking</h3>
            <p className="text-xs md:text-sm text-text-secondary leading-relaxed">
              Every status change is timestamped and visible. Citizens see exactly where their complaint stands — no follow-up calls needed.
            </p>
          </div>
          <div className="bg-bg-surface p-8 space-y-4 hover:bg-bg-card-hover transition-colors">
            <div className="text-xs font-bold text-text-muted">04</div>
            <h3 className="text-base font-semibold text-text-primary">Governance analytics</h3>
            <p className="text-xs md:text-sm text-text-secondary leading-relaxed">
              Heatmaps, resolution rates, and SLA compliance dashboards help officials spot patterns and manage workloads.
            </p>
          </div>
          <div className="bg-bg-surface p-8 space-y-4 hover:bg-bg-card-hover transition-colors">
            <div className="text-xs font-bold text-text-muted">05</div>
            <h3 className="text-base font-semibold text-text-primary">Multilingual interface</h3>
            <p className="text-xs md:text-sm text-text-secondary leading-relaxed">
              File in Hindi, Gujarati, Tamil, Telugu, Marathi, Bengali, or English. Responses arrive translated in the same language.
            </p>
          </div>
          <div className="bg-bg-surface p-8 space-y-4 hover:bg-bg-card-hover transition-colors">
            <div className="text-xs font-bold text-text-muted">06</div>
            <h3 className="text-base font-semibold text-text-primary">Full audit trail</h3>
            <p className="text-xs md:text-sm text-text-secondary leading-relaxed">
              Every action — who assigned, who updated, when — is logged and exportable. Accountability is built in, not bolted on.
            </p>
          </div>
        </div>
      </section>

      {/* ============ PROCESS & LANGUAGES GRID ============ */}
      <section className="py-20 px-4 md:px-12 bg-bg-surface border-y border-border-default">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="flex flex-wrap items-baseline gap-4 mb-8">
              <span className="text-xs font-bold text-text-muted tracking-widest uppercase">02 — Process</span>
              <h2 className="font-heading font-normal text-3xl md:text-4xl text-text-primary tracking-tight leading-tight">
                From street to<br /><em className="text-secondary font-heading italic not-italic">resolution</em>
              </h2>
            </div>

            <div className="divide-y divide-border-subtle">
              <div className="py-4.5 flex gap-5">
                <span className="text-xs md:text-sm font-bold text-text-muted w-6">1</span>
                <div>
                  <h4 className="text-sm md:text-base font-semibold text-text-primary mb-1">Citizen files an issue</h4>
                  <p className="text-xs md:text-sm text-text-secondary">Via web, app, or WhatsApp. Text, voice note, or photo. Available in 7 languages, no account needed to start.</p>
                </div>
              </div>
              <div className="py-4.5 flex gap-5">
                <span className="text-xs md:text-sm font-bold text-text-muted w-6">2</span>
                <div>
                  <h4 className="text-sm md:text-base font-semibold text-text-primary mb-1">AI classifies and routes</h4>
                  <p className="text-xs md:text-sm text-text-secondary">Department, priority, and response deadline are assigned in under 3 seconds. No manual triage queue.</p>
                </div>
              </div>
              <div className="py-4.5 flex gap-5">
                <span className="text-xs md:text-sm font-bold text-text-muted w-6">3</span>
                <div>
                  <h4 className="text-sm md:text-base font-semibold text-text-primary mb-1">Officer takes ownership</h4>
                  <p className="text-xs md:text-sm text-text-secondary">The assigned official receives a task with full context. Updates flow back to the citizen automatically.</p>
                </div>
              </div>
              <div className="py-4.5 flex gap-5">
                <span className="text-xs md:text-sm font-bold text-text-muted w-6">4</span>
                <div>
                  <h4 className="text-sm md:text-base font-semibold text-text-primary mb-1">Citizen confirms resolution</h4>
                  <p className="text-xs md:text-sm text-text-secondary">Once marked resolved, the citizen verifies. Disputes trigger an escalation path — not a dead end.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Languages Aside Block */}
          <div className="bg-slate-950 text-white rounded-xl p-8 shadow-md">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6">
              Languages supported
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-semibold text-slate-200">Hindi</span>
                  <span className="text-slate-500">38,400</span>
                </div>
                <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-secondary rounded-full" style={{ width: '100%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-semibold text-slate-200">Gujarati</span>
                  <span className="text-slate-500">27,600</span>
                </div>
                <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-secondary rounded-full" style={{ width: '72%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-semibold text-slate-200">Tamil</span>
                  <span className="text-slate-500">19,800</span>
                </div>
                <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-secondary rounded-full" style={{ width: '52%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-semibold text-slate-200">Marathi</span>
                  <span className="text-slate-500">16,900</span>
                </div>
                <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-secondary rounded-full" style={{ width: '44%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-semibold text-slate-200">Telugu</span>
                  <span className="text-slate-500">13,700</span>
                </div>
                <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-secondary rounded-full" style={{ width: '36%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-semibold text-slate-200">Bengali</span>
                  <span className="text-slate-500">10,600</span>
                </div>
                <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-secondary rounded-full" style={{ width: '28%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-semibold text-slate-200">English</span>
                  <span className="text-slate-500">7,840</span>
                </div>
                <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-secondary rounded-full" style={{ width: '20%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="py-20 px-4 md:px-12 bg-bg-surface border-b border-border-default">
        <div className="flex flex-wrap items-baseline gap-4 mb-12">
          <span className="text-xs font-bold text-text-muted tracking-widest uppercase">03 — Trusted by</span>
          <h2 className="font-heading font-normal text-3xl md:text-4xl text-text-primary tracking-tight leading-tight">
            What people are saying
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-bg-surface border border-border-default rounded-xl p-6 flex flex-col justify-between">
            <p className="text-xs md:text-sm font-medium text-text-primary italic leading-relaxed mb-6">
              "Filed a complaint about a broken streetlight at 9 pm. By next morning it was assigned to the electrical department and fixed within two days. First time I actually saw my complaint go somewhere."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-border-default flex items-center justify-center font-bold text-[11px] text-text-secondary shrink-0">
                RK
              </div>
              <div>
                <div className="text-xs font-semibold text-text-primary">Rakesh Kumar</div>
                <div className="text-[10px] text-text-muted">Resident, Surat</div>
              </div>
            </div>
          </div>
          <div className="bg-bg-surface border border-border-default rounded-xl p-6 flex flex-col justify-between">
            <p className="text-xs md:text-sm font-medium text-text-primary italic leading-relaxed mb-6">
              "The analytics dashboard changed how we manage our ward. We can see which categories spike, who is overloaded, and where SLAs are slipping — all in one place. We've cut average resolution time by 40%."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-border-default flex items-center justify-center font-bold text-[11px] text-text-secondary shrink-0">
                PS
              </div>
              <div>
                <div className="text-xs font-semibold text-text-primary">Priya Sharma</div>
                <div className="text-[10px] text-text-muted">Deputy Commissioner, AMC</div>
              </div>
            </div>
          </div>
          <div className="bg-bg-surface border border-border-default rounded-xl p-6 flex flex-col justify-between">
            <p className="text-xs md:text-sm font-medium text-text-primary italic leading-relaxed mb-6">
              "I used to write letters and wait months. Now I file in Gujarati on my phone, get updates by SMS, and can escalate if nothing happens. It finally feels like someone is responsible."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-border-default flex items-center justify-center font-bold text-[11px] text-text-secondary shrink-0">
                MV
              </div>
              <div>
                <div className="text-xs font-semibold text-text-primary">Meena Vasava</div>
                <div className="text-[10px] text-text-muted">Citizen, Ahmedabad</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ BOTTOM CTA ============ */}
      <section className="py-20 px-4 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="font-heading font-normal text-4xl md:text-5xl text-text-primary tracking-tight leading-[1.1] mb-6">
            Ready to bring<br /><em className="text-secondary font-heading italic not-italic">accountability</em><br />to your city?
          </h2>
          <p className="text-sm md:text-base text-text-secondary leading-relaxed max-w-sm mb-8">
            Whether you're a citizen with a complaint or a government body looking to deploy CivicMind — the path in is straightforward.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={handleFileGrievance}
              className="btn-primary px-6 py-3.5 text-sm font-semibold flex items-center gap-2 cursor-pointer transition-all duration-200"
            >
              File a grievance
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleGetStarted}
              className="px-6 py-3.5 border border-border-strong rounded-xl text-text-primary hover:border-text-primary text-sm font-medium transition-all cursor-pointer bg-transparent"
            >
              Request a city demo
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-4 p-4.5 bg-bg-surface border border-border-default rounded-xl hover:border-border-strong transition-colors">
            <div className="w-9 h-9 bg-border-subtle rounded-lg flex items-center justify-center shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div>
              <h5 className="text-xs md:text-sm font-semibold text-text-primary mb-0.5">For citizens</h5>
              <p className="text-[11px] text-text-muted">File, track, and escalate your complaint — no login required to start</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4.5 bg-bg-surface border border-border-default rounded-xl hover:border-border-strong transition-colors">
            <div className="w-9 h-9 bg-border-subtle rounded-lg flex items-center justify-center shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="22" x2="9" y2="16"/><line x1="15" y1="22" x2="15" y2="16"/><line x1="12" y1="16" x2="12" y2="10"/><path d="M12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/></svg>
            </div>
            <div>
              <h5 className="text-xs md:text-sm font-semibold text-text-primary mb-0.5">For government bodies</h5>
              <p className="text-[11px] text-text-muted">Deploy CivicMind in your municipality — setup takes under a week</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4.5 bg-bg-surface border border-border-default rounded-xl hover:border-border-strong transition-colors">
            <div className="w-9 h-9 bg-border-subtle rounded-lg flex items-center justify-center shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            </div>
            <div>
              <h5 className="text-xs md:text-sm font-semibold text-text-primary mb-0.5">For administrators</h5>
              <p className="text-[11px] text-text-muted">Full analytics, SLA tracking, and department management tools</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
