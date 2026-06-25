import React, { useEffect, useState } from 'react';
import { useReporting } from '../../context/ReportingContext';
import { SectionHeader } from '../../components/SectionHeader';
import { useNavigate, Link } from 'react-router-dom';
import { 
  BarChart3, FileText, ShieldAlert, CheckCircle, 
  Users, Activity, Clock, RefreshCw, ChevronRight, Play, Download
} from 'lucide-react';

export const ExecutiveDashboardPage: React.FC = () => {
  const {
    dashboardMetrics,
    savedReports,
    loading,
    fetchDashboardMetrics,
    fetchSavedReports,
    exportReport
  } = useReporting();
  const navigate = useNavigate();
  const [activeDropdownReportId, setActiveDropdownReportId] = useState<number | null>(null);

  const handleRefresh = async () => {
    await Promise.all([fetchDashboardMetrics(), fetchSavedReports()]);
  };

  useEffect(() => {
    handleRefresh();
  }, []);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center">
        <SectionHeader
          title="Executive Reporting Command Dashboard"
          subtitle="Real-time municipal KPIs, active emergency risk assessment, and AI-powered operational digests."
          badge="City Executive View"
          center={false}
        />
        <button
          onClick={handleRefresh}
          className="p-3 bg-slate-800/60 hover:bg-slate-700/60 border border-white/10 text-slate-300 hover:text-white rounded-xl transition-all flex items-center gap-2"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Command
        </button>
      </div>

      {dashboardMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* KPI 1 */}
          <div className="bg-slate-900/30 border border-white/10 rounded-2xl p-5 backdrop-blur-md shadow-sm flex items-center gap-4">
            <div className="p-3.5 bg-primary/10 border border-primary/20 text-primary rounded-xl shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Citizen Reports</span>
              <span className="text-2xl font-extrabold text-slate-100 block">{dashboardMetrics.latest_reports_count}</span>
            </div>
          </div>

          {/* KPI 2 */}
          <div className="bg-slate-900/30 border border-white/10 rounded-2xl p-5 backdrop-blur-md shadow-sm flex items-center gap-4">
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl shrink-0">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Resolution Speed</span>
              <span className="text-2xl font-extrabold text-emerald-400 block">{dashboardMetrics.executive_kpis.resolution_rate}</span>
            </div>
          </div>

          {/* KPI 3 */}
          <div className="bg-slate-900/30 border border-white/10 rounded-2xl p-5 backdrop-blur-md shadow-sm flex items-center gap-4">
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Active Emergencies</span>
              <span className="text-2xl font-extrabold text-rose-400 block">{dashboardMetrics.active_emergencies_count}</span>
            </div>
          </div>

          {/* KPI 4 */}
          <div className="bg-slate-900/30 border border-white/10 rounded-2xl p-5 backdrop-blur-md shadow-sm flex items-center gap-4">
            <div className="p-3.5 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-xl shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Registered Citizens</span>
              <span className="text-2xl font-extrabold text-slate-100 block">{dashboardMetrics.executive_kpis.system_users}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Span: Command links, risks, performance */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Quick Command links bar */}
          <div className="grid grid-cols-3 gap-4">
            <Link
              to="/dashboard/citizen/report-builder"
              className="p-4 bg-slate-900/40 border border-white/10 hover:border-primary/30 rounded-xl text-center backdrop-blur-md hover:bg-slate-900/60 transition-all flex flex-col items-center gap-2 group"
            >
              <FileText className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-200">AI Report Builder</span>
            </Link>
            <Link
              to="/dashboard/citizen/decision-briefings"
              className="p-4 bg-slate-900/40 border border-white/10 hover:border-accent/30 rounded-xl text-center backdrop-blur-md hover:bg-slate-900/60 transition-all flex flex-col items-center gap-2 group"
            >
              <Activity className="w-5 h-5 text-accent group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-200">Decision Briefs</span>
            </Link>
            <Link
              to="/dashboard/citizen/scheduled-reports"
              className="p-4 bg-slate-900/40 border border-white/10 hover:border-sky-500/30 rounded-xl text-center backdrop-blur-md hover:bg-slate-900/60 transition-all flex flex-col items-center gap-2 group"
            >
              <Clock className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-200">Recurring Schedules</span>
            </Link>
          </div>

          {/* Active Risk monitors */}
          <div className="bg-slate-900/30 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              Critical Risk Assessments
            </h3>

            {dashboardMetrics && dashboardMetrics.critical_risks.length === 0 ? (
              <div className="p-4 text-center border border-dashed border-white/10 rounded-xl text-slate-500 text-xs">
                No immediate high or catastrophic risks detected.
              </div>
            ) : (
              <div className="space-y-4">
                {dashboardMetrics?.critical_risks.map((risk, index) => (
                  <div key={index} className="p-4 bg-slate-950/40 border border-rose-500/20 rounded-xl flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 rounded text-[9px] font-bold text-rose-400 uppercase tracking-wider">
                        {risk.severity} Severity
                      </span>
                      <h4 className="font-extrabold text-sm text-slate-200 pt-1">{risk.domain}</h4>
                      <p className="text-xs text-slate-400 leading-normal">{risk.description}</p>
                    </div>
                    <div className="p-2.5 bg-rose-950/20 border border-rose-500/30 text-rose-400 rounded-lg animate-pulse shrink-0">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Latest Generated Reports */}
          <div className="bg-slate-900/30 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Latest Generated Reports
              </h3>
              <Link to="/dashboard/citizen/scheduled-reports" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                View History Log
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {savedReports.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-white/10 rounded-xl text-slate-500 text-xs">
                No generated report documents. Run the AI Report Builder to create your first brief.
              </div>
            ) : (
              <div className="space-y-3">
                {savedReports.slice(0, 3).map(report => (
                  <div
                    key={report.id}
                    className="p-4 bg-slate-950/40 border border-white/5 hover:border-white/10 rounded-xl flex items-center justify-between gap-4 transition-all"
                  >
                    <div className="space-y-1">
                      <span className="font-extrabold text-sm text-slate-200 block">{report.title}</span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                        Type: {report.report_type} | Created {new Date(report.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 relative">
                      <button
                        onClick={() => navigate(`/dashboard/citizen/report-viewer/${report.id}`)}
                        className="px-3.5 py-1.5 bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary hover:text-white rounded-lg font-bold text-xs transition-all flex items-center gap-1"
                      >
                        <Play className="w-3.5 h-3.5" />
                        View
                      </button>

                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdownReportId(activeDropdownReportId === report.id ? null : report.id);
                          }}
                          className="p-1.5 bg-slate-800/60 hover:bg-slate-700 border border-white/10 text-slate-350 hover:text-white rounded-lg transition-all flex items-center justify-center"
                          title="Download Report"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        {activeDropdownReportId === report.id && (
                          <>
                            {/* Backdrop overlay to close dropdown */}
                            <div 
                              className="fixed inset-0 z-10" 
                              onClick={() => setActiveDropdownReportId(null)}
                            />
                            <div className="absolute right-0 mt-1.5 w-36 bg-slate-900 border border-white/10 rounded-lg shadow-xl py-1 z-20">
                              {[
                                { label: 'PDF Document', format: 'pdf' },
                                { label: 'Excel Sheet', format: 'excel' },
                                { label: 'CSV Spreadsheet', format: 'csv' },
                                { label: 'PowerPoint', format: 'pptx' },
                                { label: 'JSON Data', format: 'json' },
                              ].map((opt) => (
                                <button
                                  key={opt.format}
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    setActiveDropdownReportId(null);
                                    await exportReport(report.id, opt.format);
                                  }}
                                  className="w-full text-left px-3 py-1.5 text-xs text-slate-350 hover:bg-slate-800 hover:text-white transition-all block font-medium"
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Span: Department Performance & KPI indices */}
        <div className="space-y-8">
          
          {/* Department Performance Panel */}
          <div className="bg-slate-900/30 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-sm space-y-5">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-accent" />
              Agencies Performance Indicators
            </h3>

            <div className="space-y-4">
              {dashboardMetrics?.department_performance.map((dept, index) => (
                <div key={index} className="p-4 bg-slate-950/40 border border-white/5 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-200">{dept.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                      dept.status === 'High Workload' 
                        ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' 
                        : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                    }`}>
                      {dept.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-accent h-full rounded-full transition-all duration-500"
                        style={{ width: `${dept.score}%` }}
                      />
                    </div>
                    <span className="text-xs font-extrabold text-slate-100 shrink-0">{dept.score}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ExecutiveDashboardPage;
