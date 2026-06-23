import { Bookmark, Clock, ArrowUpDown, ShieldAlert } from 'lucide-react';
import type { Report } from '../../context/CitizenContext';
import { useCitizen } from '../../context/CitizenContext';

interface ReportTableProps {
  reports: Report[];
  onSort: (column: string) => void;
  sortColumn: string;
  sortOrder: 'asc' | 'desc';
}

export const ReportTable: React.FC<ReportTableProps> = ({
  reports,
  onSort,
  sortColumn,
  sortOrder
}) => {
  const { toggleSaveReport } = useCitizen();

  const getStatusStyles = (status: string) => {
    const styles: Record<string, string> = {
      'Open': 'bg-sky-500/10 text-sky-500 border-sky-500/25',
      'In Progress': 'bg-amber-500/10 text-amber-500 border-amber-500/25',
      'Resolved': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25',
      'Rejected': 'bg-rose-500/10 text-rose-500 border-rose-500/25'
    };
    return styles[status] || 'bg-slate-500/10 text-slate-500 border-slate-500/25';
  };

  const getPriorityStyles = (priority: string) => {
    const styles: Record<string, string> = {
      'Critical': 'text-rose-500 font-bold',
      'High': 'text-orange-500 font-bold',
      'Medium': 'text-amber-500 font-semibold',
      'Low': 'text-slate-500 dark:text-slate-400 font-medium'
    };
    return styles[priority] || 'text-slate-500';
  };

  const SortHeader = ({ column, label }: { column: string; label: string }) => {
    const isActive = sortColumn === column;
    return (
      <button 
        type="button"
        onClick={() => onSort(column)}
        className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-slate-100 font-bold tracking-wider uppercase text-[10px] text-slate-505 dark:text-slate-400 focus:outline-none transition-colors"
      >
        <span>{label}</span>
        <ArrowUpDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isActive ? 'text-primary' : 'text-slate-600'} ${isActive && sortOrder === 'asc' ? 'rotate-180' : ''}`} />
      </button>
    );
  };

  if (reports.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-900/10 dark:bg-slate-900/10 light:bg-white/20 border border-dashed border-white/10 dark:border-white/5 light:border-slate-300 rounded-2xl">
        <ShieldAlert className="w-12 h-12 text-slate-500 mx-auto mb-3" />
        <h4 className="font-heading font-semibold text-slate-705 dark:text-slate-305">No Reports Found</h4>
        <p className="text-xs text-slate-500 mt-1">Refine your active search parameters or report a new issue.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-white/10 dark:border-white/5 light:border-slate-205 bg-slate-900/20 dark:bg-slate-900/20 light:bg-white/30 backdrop-blur-md shadow-sm">
      <table className="w-full border-collapse text-left text-sm text-slate-700 dark:text-slate-300">
        <thead>
          <tr className="border-b border-white/10 dark:border-white/5 light:border-slate-200/80 bg-slate-950/20 dark:bg-slate-950/20 light:bg-slate-50/50">
            <th className="px-6 py-4.5"><SortHeader column="title" label="Issue Details" /></th>
            <th className="px-6 py-4.5"><SortHeader column="category" label="Category" /></th>
            <th className="px-6 py-4.5"><SortHeader column="priority" label="Priority" /></th>
            <th className="px-6 py-4.5"><SortHeader column="status" label="Status" /></th>
            <th className="px-6 py-4.5"><SortHeader column="progress" label="Progress" /></th>
            <th className="px-6 py-4.5"><SortHeader column="created_at" label="Timeline" /></th>
            <th className="px-6 py-4.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 dark:divide-white/5 light:divide-slate-200/50">
          {reports.map((report) => (
            <tr 
              key={report.id}
              className="hover:bg-slate-800/10 dark:hover:bg-slate-800/10 light:hover:bg-slate-100/50 transition-colors"
            >
              {/* Issue title & desc */}
              <td className="px-6 py-4 max-w-[280px]">
                <div className="space-y-1">
                  <span className="font-bold text-slate-900 dark:text-slate-100 leading-tight block truncate">
                    {report.title}
                  </span>
                  <span className="text-xs text-slate-500 line-clamp-1">
                    {report.description}
                  </span>
                </div>
              </td>

              {/* Category */}
              <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">
                {report.category}
              </td>

              {/* Priority */}
              <td className="px-6 py-4 text-xs">
                <span className={getPriorityStyles(report.priority)}>
                  {report.priority}
                </span>
              </td>

              {/* Status */}
              <td className="px-6 py-4 text-xs">
                <span className={`px-2.5 py-0.5 rounded-full border font-bold uppercase tracking-wider ${getStatusStyles(report.status)}`}>
                  {report.status}
                </span>
              </td>

              {/* Progress */}
              <td className="px-6 py-4 max-w-[150px]">
                <div className="flex items-center gap-2">
                  <div className="w-full bg-slate-800 dark:bg-slate-800 light:bg-slate-200 h-1.5 rounded-full overflow-hidden shrink-0">
                    <div 
                      className="bg-gradient-to-r from-primary to-secondary h-full rounded-full transition-all duration-500"
                      style={{ width: `${report.progress}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 w-8">{report.progress}%</span>
                </div>
              </td>

              {/* Timeline (Submitted / Updated dates) */}
              <td className="px-6 py-4 text-xs font-semibold text-slate-500 space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 shrink-0 text-primary" />
                  <span>Sub: {new Date(report.created_at).toLocaleDateString()}</span>
                </div>
                {report.assigned_department && (
                  <div className="text-[10px] text-slate-600 block italic leading-tight">
                    Dept: {report.assigned_department}
                  </div>
                )}
              </td>

              {/* Save / Invalidate */}
              <td className="px-6 py-4 text-right">
                <button
                  onClick={() => toggleSaveReport(report.id)}
                  className={`p-2 rounded-xl transition-all border border-slate-700/50 light:border-slate-300 hover:bg-slate-800/80 light:hover:bg-slate-100 ${
                    report.is_saved 
                      ? 'text-accent border-accent/20 bg-accent/5' 
                      : 'text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                  aria-label={report.is_saved ? "Remove Bookmark" : "Save Report"}
                >
                  <Bookmark className={`w-4 h-4 ${report.is_saved ? 'fill-current' : ''}`} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReportTable;
