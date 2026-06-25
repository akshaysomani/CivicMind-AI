import React, { useEffect } from 'react';
import { useReporting } from '../../context/ReportingContext';
import { SectionHeader } from '../../components/SectionHeader';
import { Link } from 'react-router-dom';
import { 
  Bookmark, FileText, Download, Eye, Trash2, 
  RefreshCw, BarChart3, Clock
} from 'lucide-react';

export const SavedReports: React.FC = () => {
  const { savedReports, loading, fetchSavedReports, deleteReport, exportReport } = useReporting();

  useEffect(() => {
    fetchSavedReports();
  }, [fetchSavedReports]);

  return (
    <div className="space-y-6 pb-10">
      <SectionHeader
        title="Saved Executive Reports"
        subtitle="Access and manage your AI-generated executive reports and strategic briefs."
        badge="Saved Reports"
        center={false}
      />

      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">
          {savedReports.length} report{savedReports.length !== 1 ? 's' : ''} saved
        </span>
        <button
          onClick={fetchSavedReports}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-700/60 border border-white/10 rounded-lg transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-slate-900/40 border border-white/5 rounded-xl h-24" />
          ))}
        </div>
      ) : savedReports.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/20 border border-dashed border-white/10 rounded-2xl">
          <Bookmark className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h4 className="font-semibold text-slate-300 text-lg mb-2">No Reports Saved Yet</h4>
          <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
            Use the AI Report Builder to generate executive reports. They will automatically appear here.
          </p>
          <Link
            to="/dashboard/citizen/report-builder"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-all"
          >
            <FileText className="w-4 h-4" />
            Build a Report
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {savedReports.map(report => (
            <div
              key={report.id}
              className="bg-slate-900/30 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="p-3 bg-primary/10 rounded-xl shrink-0">
                    <BarChart3 className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-100 text-sm truncate">{report.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      <span className="font-medium text-slate-300">{report.report_type}</span>
                    </p>
                    <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span>Generated {new Date(report.created_at).toLocaleDateString('en-IN', { 
                        day: 'numeric', month: 'short', year: 'numeric', 
                        hour: '2-digit', minute: '2-digit' 
                      })}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <Link
                    to={`/dashboard/citizen/report-viewer/${report.id}`}
                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-100 transition-colors"
                    title="View Report"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => exportReport(report.id, 'pdf')}
                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-primary transition-colors"
                    title="Export as PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteReport(report.id)}
                    className="p-2 hover:bg-rose-500/10 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                    title="Delete Report"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Confidence score */}
              {report.content?.confidence_score && (
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-3">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">AI Confidence</span>
                  <div className="flex-1 bg-slate-800/60 rounded-full h-1.5 max-w-24">
                    <div 
                      className="h-1.5 rounded-full bg-gradient-to-r from-primary to-secondary"
                      style={{ width: `${Math.round(report.content.confidence_score * 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-300">
                    {Math.round(report.content.confidence_score * 100)}%
                  </span>
                  <Link
                    to={`/dashboard/citizen/report-viewer/${report.id}`}
                    className="ml-auto text-[10px] font-bold text-primary hover:text-primary/80 transition-colors"
                  >
                    View Full Report →
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedReports;
