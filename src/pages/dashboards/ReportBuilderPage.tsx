import React, { useState } from 'react';
import { useReporting } from '../../context/ReportingContext';
import { SectionHeader } from '../../components/SectionHeader';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Play, Sliders, Calendar, 
  MapPin, ShieldAlert, RefreshCw
} from 'lucide-react';

export const ReportBuilderPage: React.FC = () => {
  const { templates, generateReport, loading } = useReporting();
  const navigate = useNavigate();

  // Form States
  const [selectedTemplate, setSelectedTemplate] = useState('daily_brief');
  const [department, setDepartment] = useState('all');
  const [ward, setWard] = useState('all');
  const [category, setCategory] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const getTemplateName = (id: string) => {
    switch (id) {
      case 'daily_brief': return 'Daily Executive Brief';
      case 'weekly_report': return 'Weekly Executive Report';
      case 'monthly_perf': return 'Monthly Performance Report';
      case 'health_summary': return 'Healthcare Summary';
      case 'emergency_sitrep': return 'Emergency Situation Report';
      case 'dept_perf': return 'Department Performance Report';
      case 'ward_perf': return 'Ward Performance Report';
      default: return 'Custom Report';
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const typeName = getTemplateName(selectedTemplate);
    const report = await generateReport({
      report_type: typeName,
      category: category !== 'all' ? category : undefined,
      ward: ward !== 'all' ? ward : undefined
    });
    
    if (report && report.id) {
      navigate(`/dashboard/citizen/report-viewer/${report.id}`);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <SectionHeader
        title="AI Executive Report Builder"
        subtitle="Select templates, apply custom administrative scopes, and run the Gemini AI reporting agent to construct strategic briefs."
        badge="Strategic Analytics"
        center={false}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Form parameters */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/30 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-primary" />
              Configure Scope Parameters
            </h3>

            <form onSubmit={handleGenerate} className="space-y-6">
              
              {/* Template selector */}
              <div className="p-4 bg-slate-950/40 border border-white/5 rounded-xl space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-primary" />
                  Select Report Template
                </span>
                
                <select
                  value={selectedTemplate}
                  onChange={e => setSelectedTemplate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900/60 border border-white/10 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-primary/50"
                >
                  <option value="daily_brief">Daily Executive Brief</option>
                  <option value="weekly_report">Weekly Executive Report</option>
                  <option value="monthly_perf">Monthly Performance Report</option>
                  <option value="health_summary">Healthcare Summary</option>
                  <option value="emergency_sitrep">Emergency Situation Report</option>
                  <option value="dept_perf">Department Performance Report</option>
                  <option value="ward_perf">Ward Performance Report</option>
                </select>
              </div>

              {/* Geographic and Categorical Filters */}
              <div className="p-4 bg-slate-950/40 border border-white/5 rounded-xl space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-accent" />
                  Apply Scope Filters
                </span>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Ward Selection</label>
                    <select
                      value={ward}
                      onChange={e => setWard(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900/60 border border-white/10 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-primary/50"
                    >
                      <option value="all">All Wards</option>
                      <option value="Ward 1">Ward 1 (Downtown)</option>
                      <option value="Ward 2">Ward 2 (North)</option>
                      <option value="Ward 3">Ward 3 (East)</option>
                      <option value="Ward 4">Ward 4 (Metro Central)</option>
                      <option value="Ward 7">Ward 7 (Suburbs)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Department</label>
                    <select
                      value={department}
                      onChange={e => setDepartment(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900/60 border border-white/10 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-primary/50"
                    >
                      <option value="all">All Departments</option>
                      <option value="Water Works">Water Works</option>
                      <option value="Public Works">Public Works</option>
                      <option value="Emergency Command">Emergency Command</option>
                      <option value="Sanitation">Sanitation</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Category</label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900/60 border border-white/10 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-primary/50"
                    >
                      <option value="all">All Categories</option>
                      <option value="Water">Water & Leaks</option>
                      <option value="Roads">Roads & Hazards</option>
                      <option value="Sanitation">Sanitation</option>
                      <option value="Emergency">Emergency</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Timeframes */}
              <div className="p-4 bg-slate-950/40 border border-white/5 rounded-xl space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-sky-400" />
                  Date Range Scoping
                </span>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900/60 border border-white/10 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-primary/50"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900/60 border border-white/10 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-primary/50"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary hover:text-white rounded-xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Querying aggregates & running AI reporting agent...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Trigger AI Compilation
                  </>
                )}
              </button>

            </form>
          </div>
        </div>

        {/* Right Side: Quick template summaries */}
        <div className="space-y-6">
          <div className="bg-slate-900/30 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-4.5 h-4.5 text-accent" />
              Template Directory
            </h3>

            {templates.map(t => (
              <div
                key={t.id}
                onClick={() => setSelectedTemplate(t.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all space-y-1 ${
                  selectedTemplate === t.id
                    ? 'bg-primary/10 border-primary/35 shadow-sm'
                    : 'bg-slate-950/40 border-white/5 hover:border-white/10'
                }`}
              >
                <span className="font-bold text-xs text-slate-200 block">{t.name}</span>
                <p className="text-[10px] text-slate-500 leading-normal">{t.description}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReportBuilderPage;
