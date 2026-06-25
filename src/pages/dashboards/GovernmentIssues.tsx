import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGovernment } from '../../context/GovernmentContext';
import { SectionHeader } from '../../components/SectionHeader';
import { StatusBadge } from '../../components/government/StatusBadge';
import { PriorityBadge } from '../../components/government/PriorityBadge';
import { WorkflowTimeline } from '../../components/government/WorkflowTimeline';
import { AdvancedFilter } from '../../components/government/AdvancedFilter';
import { SearchComponent } from '../../components/dashboard/SearchComponent';
import { LoadingSkeleton } from '../../components/dashboard/LoadingSkeleton';
import { 
  ChevronLeft, ChevronRight, UserPlus, Play, 
  Download, Eye, X, CheckSquare, Square, ChevronDown, ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const GovernmentIssues: React.FC = () => {
  const { 
    issues, officers, isLoading, fetchIssues, 
    assignOfficer, updateIssueStatus, exportReport 
  } = useGovernment();
  const [searchParams] = useSearchParams();

  // Search & Filter States
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState('All');
  const [priority, setPriority] = useState('All');
  const [status, setStatus] = useState('All');
  const [ward, setWard] = useState('All');

  // Sync search state from URL query parameter
  useEffect(() => {
    const searchVal = searchParams.get('search');
    if (searchVal !== null) {
      setSearch(searchVal);
    }
  }, [searchParams]);

  // Sorting
  const [sortColumn, setSortColumn] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  // Selected row IDs for bulk actions
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Triage Drawer details state
  const [activeIssue, setActiveIssue] = useState<any | null>(null);
  const [showTriageDrawer, setShowTriageDrawer] = useState(false);

  // Form states inside triage drawer
  const [selectedOfficerId, setSelectedOfficerId] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedProgress, setSelectedProgress] = useState<number>(0);

  // Bulk operation drawers
  const [showBulkAssign, setShowBulkAssign] = useState(false);
  const [bulkOfficerId, setBulkOfficerId] = useState('');
  const [showBulkStatus, setShowBulkStatus] = useState(false);
  const [bulkStatusVal, setBulkStatusVal] = useState('');

  // Sync issues on filter changes
  useEffect(() => {
    fetchIssues({ search, status, priority, category, ward });
    setPage(1);
  }, [search, status, priority, category, ward, fetchIssues]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortOrder('desc');
    }
  };

  // Local Sort & Pagination
  const sortedIssues = [...issues].sort((a, b) => {
    let aVal = a[sortColumn as keyof typeof a];
    let bVal = b[sortColumn as keyof typeof b];

    if (aVal === undefined) return 1;
    if (bVal === undefined) return -1;

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    }
    return 0;
  });

  const totalPages = Math.ceil(sortedIssues.length / itemsPerPage);
  const paginatedIssues = sortedIssues.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const toggleSelectRow = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedIssues.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedIssues.map(i => i.id));
    }
  };

  const handleOpenTriage = (issue: any) => {
    setActiveIssue(issue);
    setSelectedOfficerId(issue.assigned_officer_id?.toString() || '');
    setSelectedStatus(issue.status);
    setSelectedProgress(issue.progress);
    setShowTriageDrawer(true);
  };

  const handleSaveTriage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeIssue) return;

    // 1. Assign Officer
    const parsedOfficerId = selectedOfficerId ? parseInt(selectedOfficerId) : null;
    if (parsedOfficerId !== activeIssue.assigned_officer_id) {
      await assignOfficer(activeIssue.id, parsedOfficerId);
    }

    // 2. Update status and progress
    if (selectedStatus !== activeIssue.status || selectedProgress !== activeIssue.progress) {
      await updateIssueStatus(activeIssue.id, selectedStatus, selectedProgress);
    }

    setShowTriageDrawer(false);
    setActiveIssue(null);
  };

  const handleBulkAssign = async () => {
    if (!bulkOfficerId || selectedIds.length === 0) return;
    const parsedId = parseInt(bulkOfficerId);
    for (const id of selectedIds) {
      await assignOfficer(id, parsedId);
    }
    setSelectedIds([]);
    setShowBulkAssign(false);
  };

  const handleBulkStatus = async () => {
    if (!bulkStatusVal || selectedIds.length === 0) return;
    for (const id of selectedIds) {
      await updateIssueStatus(id, bulkStatusVal);
    }
    setSelectedIds([]);
    setShowBulkStatus(false);
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategory('All');
    setPriority('All');
    setStatus('All');
    setWard('All');
  };

  const getOfficerName = (id?: number | null) => {
    if (!id) return 'Unassigned';
    const off = officers.find(o => o.id === id);
    return off ? `${off.first_name} ${off.last_name}` : 'Administrative Triage';
  };

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) return null;
    return sortOrder === 'asc' ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />;
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <SectionHeader
          title="Administrative Triage & incident Desk"
          subtitle="Triage incoming public safety, environment, and roads concern tickets. Update status pipelines and assign officers."
          badge="Triaging Operations"
          center={false}
        />
        
        {/* Export buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => exportReport('Daily', 'CSV')}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-700/60 light:border-slate-300 hover:border-secondary text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 text-xs font-bold rounded-xl bg-slate-950/30 hover:bg-slate-800/40 transition-colors"
          >
            <Download className="w-4 h-4 text-secondary" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Advanced Filter Drawer */}
      <AdvancedFilter
        category={category}
        setCategory={setCategory}
        priority={priority}
        setPriority={setPriority}
        status={status}
        setStatus={setStatus}
        ward={ward}
        setWard={setWard}
        onClear={handleClearFilters}
      />

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <SearchComponent
          value={search}
          onChange={setSearch}
          placeholder="Search by title, description, or reporter name..."
          className="w-full md:max-w-md"
        />

        {/* Bulk Action Controls */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 bg-slate-900/60 border border-secondary/30 rounded-xl px-4 py-2 text-xs font-bold w-full md:w-auto">
            <span className="text-secondary">{selectedIds.length} tickets selected</span>
            <div className="flex gap-2">
              <button
                onClick={() => setShowBulkAssign(!showBulkAssign)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-white/5 bg-slate-950 hover:bg-slate-900 text-slate-300"
              >
                <UserPlus className="w-3.5 h-3.5" /> Assign
              </button>
              <button
                onClick={() => setShowBulkStatus(!showBulkStatus)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-white/5 bg-slate-950 hover:bg-slate-900 text-slate-300"
              >
                <Play className="w-3.5 h-3.5" /> Status
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Assign Panel */}
      <AnimatePresence>
        {showBulkAssign && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-slate-900/40 border border-white/10 rounded-xl max-w-md flex items-end gap-4"
          >
            <div className="flex-1 space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500">Bulk Assign Officer</label>
              <select
                value={bulkOfficerId}
                onChange={(e) => setBulkOfficerId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 dark:border-white/5 light:border-slate-300 text-xs focus:ring-1 focus:ring-secondary text-slate-900 dark:text-slate-100"
              >
                <option value="">Select Officer...</option>
                {officers.map(o => (
                  <option key={o.id} value={o.id}>{o.first_name} {o.last_name} ({o.sub_role})</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleBulkAssign}
              className="px-4 py-2.5 bg-secondary text-slate-950 hover:bg-amber-500 rounded-xl text-xs font-bold"
            >
              Assign Selected
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Status Panel */}
      <AnimatePresence>
        {showBulkStatus && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-slate-900/40 border border-white/10 rounded-xl max-w-md flex items-end gap-4"
          >
            <div className="flex-1 space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500">Bulk Update Status</label>
              <select
                value={bulkStatusVal}
                onChange={(e) => setBulkStatusVal(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 dark:border-white/5 light:border-slate-300 text-xs focus:ring-1 focus:ring-secondary text-slate-900 dark:text-slate-100"
              >
                <option value="">Select Status...</option>
                {['New', 'Under Review', 'Assigned', 'In Progress', 'Waiting for Citizen', 'Resolved', 'Rejected', 'Closed'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleBulkStatus}
              className="px-4 py-2.5 bg-secondary text-slate-950 hover:bg-amber-500 rounded-xl text-xs font-bold"
            >
              Apply Status
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main issues list table */}
      {isLoading ? (
        <LoadingSkeleton type="table" count={5} />
      ) : (
        <div className="bg-slate-900/20 dark:bg-slate-900/20 light:bg-white/40 border border-white/10 dark:border-white/5 light:border-slate-200/80 rounded-2xl overflow-hidden backdrop-blur-md shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-slate-950/80 dark:bg-slate-950/80 light:bg-slate-100/80 border-b border-white/10 dark:border-white/5 light:border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider">
                <tr>
                  <th className="p-4 w-12 text-center">
                    <button onClick={toggleSelectAll} className="text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                      {selectedIds.length === paginatedIssues.length && paginatedIssues.length > 0 ? (
                        <CheckSquare className="w-4.5 h-4.5 text-secondary" />
                      ) : (
                        <Square className="w-4.5 h-4.5" />
                      )}
                    </button>
                  </th>
                  <th className="p-4 cursor-pointer select-none" onClick={() => handleSort('id')}>
                    <span className="flex items-center">ID {getSortIcon('id')}</span>
                  </th>
                  <th className="p-4 cursor-pointer select-none" onClick={() => handleSort('title')}>
                    <span className="flex items-center">Title {getSortIcon('title')}</span>
                  </th>
                  <th className="p-4 cursor-pointer select-none" onClick={() => handleSort('category')}>
                    <span className="flex items-center">Category {getSortIcon('category')}</span>
                  </th>
                  <th className="p-4 cursor-pointer select-none" onClick={() => handleSort('priority')}>
                    <span className="flex items-center">Priority {getSortIcon('priority')}</span>
                  </th>
                  <th className="p-4 cursor-pointer select-none" onClick={() => handleSort('ward')}>
                    <span className="flex items-center">Ward {getSortIcon('ward')}</span>
                  </th>
                  <th className="p-4 cursor-pointer select-none" onClick={() => handleSort('assigned_officer_id')}>
                    <span className="flex items-center">Officer {getSortIcon('assigned_officer_id')}</span>
                  </th>
                  <th className="p-4 cursor-pointer select-none" onClick={() => handleSort('status')}>
                    <span className="flex items-center">Status {getSortIcon('status')}</span>
                  </th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 dark:divide-white/5 light:divide-slate-200 text-slate-700 dark:text-slate-350">
                {paginatedIssues.map((issue) => (
                  <tr 
                    key={issue.id} 
                    className={`hover:bg-slate-900/20 dark:hover:bg-slate-900/20 light:hover:bg-slate-50 transition-colors ${
                      selectedIds.includes(issue.id) ? 'bg-secondary/5 dark:bg-secondary/5 light:bg-amber-500/5' : ''
                    }`}
                  >
                    <td className="p-4 text-center">
                      <button onClick={() => toggleSelectRow(issue.id)} className="text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                        {selectedIds.includes(issue.id) ? (
                          <CheckSquare className="w-4.5 h-4.5 text-secondary" />
                        ) : (
                          <Square className="w-4.5 h-4.5" />
                        )}
                      </button>
                    </td>
                    <td className="p-4 font-bold text-slate-500">#{issue.id}</td>
                    <td className="p-4 font-bold text-slate-900 dark:text-slate-100 max-w-xs truncate">
                      {issue.title}
                    </td>
                    <td className="p-4 font-semibold">{issue.category}</td>
                    <td className="p-4">
                      <PriorityBadge priority={issue.priority} />
                    </td>
                    <td className="p-4 font-semibold">{issue.ward || 'Unspecified'}</td>
                    <td className="p-4 font-semibold text-slate-500 truncate max-w-[120px]">
                      {getOfficerName(issue.assigned_officer_id)}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={issue.status} />
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleOpenTriage(issue)}
                        className="p-1.5 border border-slate-750 light:border-slate-300 rounded-lg hover:border-secondary text-slate-400 hover:text-secondary bg-slate-950/30 hover:bg-slate-800/40 transition-colors"
                        aria-label="Triage Ticket"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {paginatedIssues.length === 0 && (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-500 font-semibold">
                      No tickets matching operational filter queues.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table pagination wrapper */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center bg-slate-950/40 dark:bg-slate-950/40 light:bg-slate-100 border-t border-white/10 dark:border-white/5 light:border-slate-205 p-4">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Triage Page {page} of {totalPages} ({issues.length} total entries)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-xl border border-slate-705 light:border-slate-350 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 disabled:opacity-40 transition-colors"
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-xl border border-slate-705 light:border-slate-350 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 disabled:opacity-40 transition-colors"
                  aria-label="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Slide-in Triage detail Drawer (Right Sidebar Panel) */}
      <AnimatePresence>
        {showTriageDrawer && activeIssue && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowTriageDrawer(false); setActiveIssue(null); }}
              className="fixed inset-0 bg-black z-45"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 right-0 w-full sm:w-[500px] bg-slate-950 border-l border-amber-500/10 z-50 flex flex-col p-6 shadow-2xl overflow-y-auto custom-scrollbar text-xs"
            >
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Incident Triage Desk</span>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Ticket #{activeIssue.id}</h3>
                </div>
                <button 
                  onClick={() => { setShowTriageDrawer(false); setActiveIssue(null); }}
                  className="p-2 border border-slate-705 rounded-xl hover:border-secondary text-slate-400 hover:text-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Triage Info Details */}
              <div className="flex-1 py-6 space-y-6">
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Title</span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-normal">{activeIssue.title}</h4>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Citizen Description</span>
                  <p className="text-slate-400 font-semibold leading-relaxed whitespace-pre-wrap">{activeIssue.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Category</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">{activeIssue.category}</span>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Zoning Ward</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">{activeIssue.ward || 'Unspecified'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Report Priority</span>
                    <div><PriorityBadge priority={activeIssue.priority} /></div>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Status Workflow State</span>
                    <div><StatusBadge status={activeIssue.status} /></div>
                  </div>
                </div>

                {/* Workflow Timeline Track */}
                <div className="space-y-2.5 pt-2 border-t border-white/5">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Triage Workflow Timeline</span>
                  <WorkflowTimeline currentStatus={selectedStatus} />
                </div>

                {/* Edit Form */}
                <form onSubmit={handleSaveTriage} className="space-y-5 pt-4 border-t border-white/5">
                  
                  {/* Assign Officer */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-slate-500 block">Assign Government Officer</label>
                    <select
                      value={selectedOfficerId}
                      onChange={(e) => setSelectedOfficerId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 dark:border-white/5 light:border-slate-300 text-xs focus:ring-1 focus:ring-secondary text-slate-900 dark:text-slate-100"
                    >
                      <option value="">Unassigned</option>
                      {officers.map(o => (
                        <option key={o.id} value={o.id}>{o.first_name} {o.last_name} ({o.sub_role})</option>
                      ))}
                    </select>
                  </div>

                  {/* Status Selection */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-slate-500 block">Update Workflow State</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 dark:border-white/5 light:border-slate-300 text-xs focus:ring-1 focus:ring-secondary text-slate-900 dark:text-slate-100"
                    >
                      {['New', 'Under Review', 'Assigned', 'In Progress', 'Waiting for Citizen', 'Resolved', 'Rejected', 'Closed'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  {/* Progress bar slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] uppercase font-bold text-slate-500">Ticket Resolution Progress</label>
                      <span className="font-extrabold text-secondary">{selectedProgress}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={selectedProgress}
                      onChange={(e) => setSelectedProgress(parseInt(e.target.value))}
                      className="w-full accent-secondary"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-secondary hover:bg-amber-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-secondary/15 transition-all mt-4"
                  >
                    Commit Triage Updates
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GovernmentIssues;
