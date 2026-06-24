import React, { useState } from 'react';
import { useReporting } from '../../context/ReportingContext';
import { SectionHeader } from '../../components/SectionHeader';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, Trash2, Calendar, Plus, 
  Eye
} from 'lucide-react';

export const ScheduledReportsPage: React.FC = () => {
  const {
    scheduledReports,
    savedReports,
    scheduleReport,
    deleteScheduledReport,
    deleteReport
  } = useReporting();
  const navigate = useNavigate();

  // Schedule Form States
  const [scheduleName, setScheduleName] = useState('');
  const [reportType, setReportType] = useState('Daily Executive Brief');
  const [frequency, setFrequency] = useState('daily');
  
  // Recipient checkboxes
  const [recipCitizen, setRecipCitizen] = useState(false);
  const [recipGov, setRecipGov] = useState(true);
  const [recipNgo, setRecipNgo] = useState(false);
  const [recipAdmin, setRecipAdmin] = useState(false);

  const handleSubmitSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleName) return;

    const recipients: string[] = [];
    if (recipCitizen) recipients.push('Citizen');
    if (recipGov) recipients.push('Government');
    if (recipNgo) recipients.push('NGO');
    if (recipAdmin) recipients.push('Admin');

    await scheduleReport({
      name: scheduleName,
      report_type: reportType,
      frequency,
      recipients
    });

    // Reset
    setScheduleName('');
  };

  return (
    <div className="space-y-8 pb-10">
      <SectionHeader
        title="Report Scheduling & History Archive"
        subtitle="Manage recurring automated city briefs and browse the complete historical archive of AI-generated strategic documents."
        badge="Schedules & History"
        center={false}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Column 1: Config Form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Create Schedule form */}
          <div className="bg-slate-900/30 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Register Automated Report Schedule
            </h3>

            <form onSubmit={handleSubmitSchedule} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/40 p-4 border border-white/5 rounded-xl">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Schedule Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Mayor's Monday Morning Digest"
                    value={scheduleName}
                    onChange={e => setScheduleName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900/60 border border-white/10 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-primary/50"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Frequency</label>
                  <select
                    value={frequency}
                    onChange={e => setFrequency(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900/60 border border-white/10 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-primary/50"
                  >
                    <option value="daily">Daily Broadcast</option>
                    <option value="weekly">Weekly (Every Monday)</option>
                    <option value="monthly">Monthly (1st Day)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/40 p-4 border border-white/5 rounded-xl">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Report Type Template</label>
                  <select
                    value={reportType}
                    onChange={e => setReportType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900/60 border border-white/10 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-primary/50"
                  >
                    <option value="Daily Executive Brief">Daily Executive Brief</option>
                    <option value="Weekly Executive Report">Weekly Executive Report</option>
                    <option value="Monthly Performance Report">Monthly Performance Report</option>
                    <option value="Healthcare Summary">Healthcare Summary</option>
                    <option value="Emergency Situation Report">Emergency Situation Report</option>
                    <option value="Department Performance Report">Department Performance Report</option>
                    <option value="Ward Performance Report">Ward Performance Report</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Recipient Roles</span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <label className="flex items-center gap-2 text-slate-300">
                      <input type="checkbox" checked={recipCitizen} onChange={e => setRecipCitizen(e.target.checked)} />
                      Citizen
                    </label>
                    <label className="flex items-center gap-2 text-slate-300">
                      <input type="checkbox" checked={recipGov} onChange={e => setRecipGov(e.target.checked)} />
                      Government
                    </label>
                    <label className="flex items-center gap-2 text-slate-300">
                      <input type="checkbox" checked={recipNgo} onChange={e => setRecipNgo(e.target.checked)} />
                      NGO
                    </label>
                    <label className="flex items-center gap-2 text-slate-300">
                      <input type="checkbox" checked={recipAdmin} onChange={e => setRecipAdmin(e.target.checked)} />
                      Admin
                    </label>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary hover:text-white rounded-xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Activate Schedule
              </button>

            </form>
          </div>

          {/* Report History Logs */}
          <div className="bg-slate-900/30 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-accent" />
              Generated Report Archives
            </h3>

            {savedReports.length === 0 ? (
              <div className="p-8 border border-dashed border-white/10 rounded-xl text-center text-slate-500 text-xs">
                No archived reports available.
              </div>
            ) : (
              <div className="space-y-3">
                {savedReports.map(report => (
                  <div
                    key={report.id}
                    className="p-4 bg-slate-950/40 border border-white/5 rounded-xl flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <span className="font-bold text-sm text-slate-200 block">{report.title}</span>
                      <span className="text-[10px] text-slate-500">
                        Generated: {new Date(report.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/dashboard/citizen/report-viewer/${report.id}`)}
                        className="p-2 bg-slate-800 hover:bg-slate-700 border border-white/5 rounded-lg text-slate-300 hover:text-white transition-colors"
                        title="View Report"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteReport(report.id)}
                        className="p-2 bg-slate-800 hover:bg-rose-950/40 border border-white/5 hover:border-rose-500/30 rounded-lg text-slate-300 hover:text-rose-400 transition-colors"
                        title="Delete Report"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Column 2: Active Scheduled reports list */}
        <div className="space-y-6">
          <div className="bg-slate-900/30 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-100 flex items-center gap-2">
              <Clock className="w-4.5 h-4.5 text-accent" />
              Active automated schedules ({scheduledReports.length})
            </h3>

            {scheduledReports.length === 0 ? (
              <div className="p-4 border border-dashed border-white/10 rounded-xl text-center text-slate-500 text-xs">
                No active recurring schedules configured.
              </div>
            ) : (
              <div className="space-y-3">
                {scheduledReports.map(sched => (
                  <div key={sched.id} className="p-4 bg-slate-950/40 border border-white/5 rounded-xl space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-xs text-slate-200 block">{sched.name}</span>
                        <span className="text-[9px] text-slate-500 uppercase tracking-wider block mt-0.5">
                          {sched.report_type} | {sched.frequency}
                        </span>
                      </div>
                      <button
                        onClick={() => deleteScheduledReport(sched.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 rounded transition-all"
                        title="Delete Schedule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {sched.recipients.map(r => (
                        <span key={r} className="px-1.5 py-0.5 bg-slate-800 border border-white/5 rounded text-[8px] font-bold text-slate-400 uppercase">
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ScheduledReportsPage;
