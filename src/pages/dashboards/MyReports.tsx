import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIssues } from '../../context/IssueContext';
import { ISSUE_CATEGORIES } from '../../types/issue';
import IssueCard from '../../components/issues/IssueCard';
import { IssueStatusBadge } from '../../components/issues/IssueBadges';

const STATUS_OPTIONS = ['Submitted', 'Verified', 'Assigned', 'In Progress', 'Under Inspection', 'Resolved', 'Closed', 'Rejected'];
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Critical'];

const MyReports: React.FC = () => {
  const navigate = useNavigate();
  const { issues, isLoading, fetchIssues, deleteIssue, toggleSaveIssue, filters, setFilters, resetFilters } = useIssues();
  const [page, setPage] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const LIMIT = 12;

  const load = useCallback((pageNum = 0) => {
    fetchIssues({ limit: LIMIT, offset: pageNum * LIMIT });
  }, [fetchIssues]);

  useEffect(() => {
    load(0);
    setPage(0);
  }, [filters, load]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Withdraw this report?')) return;
    await deleteIssue(id);
    load(page);
  };

  const handleSave = async (id: number) => {
    await toggleSaveIssue(id);
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white font-heading">My Reports</h1>
          <p className="text-slate-400 text-sm mt-0.5">Track, audit and print all your submitted civic issues</p>
        </div>
        <button
          id="btn-new-report"
          onClick={() => navigate('/dashboard/citizen/report-issue')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-500/20"
        >
          ➕ Report Issue
        </button>
      </div>

      {/* Quick Search and Filter triggers */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[220px] relative">
          <input
            id="search-reports"
            type="text"
            value={filters.search}
            onChange={e => setFilters({ search: e.target.value })}
            placeholder="Search by title, description, complaint ID…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm transition-all"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
        </div>
        <button
          id="btn-toggle-filters"
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
            showFilters
              ? 'bg-blue-500/20 border-blue-500/40 text-blue-400 font-bold'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
          }`}
        >
          🎛️ Advanced Filters
        </button>
        {(filters.status || filters.priority || filters.category || filters.search || filters.ward || filters.date_from || filters.date_to) && (
          <button
            id="btn-reset-filters"
            onClick={resetFilters}
            className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm hover:bg-red-500/20 transition-all font-semibold"
          >
            ✕ Reset
          </button>
        )}
      </div>

      {/* Expanded Filter Panel */}
      {showFilters && (
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 grid grid-cols-2 md:grid-cols-4 gap-4 animate-fadeIn">
          <div>
            <label htmlFor="filter-status" className="block text-xs text-slate-400 mb-1.5 font-medium">Status</label>
            <select
              id="filter-status"
              value={filters.status}
              onChange={e => setFilters({ status: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-sm focus:outline-none focus:border-blue-500 transition-all"
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          
          <div>
            <label htmlFor="filter-priority" className="block text-xs text-slate-400 mb-1.5 font-medium">Priority</label>
            <select
              id="filter-priority"
              value={filters.priority}
              onChange={e => setFilters({ priority: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-sm focus:outline-none focus:border-blue-500 transition-all"
            >
              <option value="">All Priorities</option>
              {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="filter-category" className="block text-xs text-slate-400 mb-1.5 font-medium">Category</label>
            <select
              id="filter-category"
              value={filters.category}
              onChange={e => setFilters({ category: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-sm focus:outline-none focus:border-blue-500 transition-all"
            >
              <option value="">All Categories</option>
              {ISSUE_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="filter-sort" className="block text-xs text-slate-400 mb-1.5 font-medium">Sort By</label>
            <select
              id="filter-sort"
              value={`${filters.sort_by}_${filters.sort_order}`}
              onChange={e => {
                const [sort_by, sort_order] = e.target.value.split('_');
                setFilters({ sort_by, sort_order: sort_order as 'asc' | 'desc' });
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-sm focus:outline-none focus:border-blue-500 transition-all"
            >
              <option value="created_at_desc">Newest First</option>
              <option value="created_at_asc">Oldest First</option>
              <option value="updated_at_desc">Recently Updated</option>
              <option value="priority_desc">Priority (High First)</option>
              <option value="status_asc">Status (A-Z)</option>
            </select>
          </div>

          <div>
            <label htmlFor="filter-ward" className="block text-xs text-slate-400 mb-1.5 font-medium">Ward / Sector</label>
            <input
              id="filter-ward"
              type="text"
              value={filters.ward}
              onChange={e => setFilters({ ward: e.target.value })}
              placeholder="e.g. Ward 5"
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-650 text-sm focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>

          <div>
            <label htmlFor="filter-date-from" className="block text-xs text-slate-400 mb-1.5 font-medium">Reported From</label>
            <input
              id="filter-date-from"
              type="date"
              value={filters.date_from}
              onChange={e => setFilters({ date_from: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-sm focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>

          <div>
            <label htmlFor="filter-date-to" className="block text-xs text-slate-400 mb-1.5 font-medium">Reported To</label>
            <input
              id="filter-date-to"
              type="date"
              value={filters.date_to}
              onChange={e => setFilters({ date_to: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-sm focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>
        </div>
      )}

      {/* Active filter pills */}
      {(filters.status || filters.priority || filters.category || filters.ward || filters.date_from || filters.date_to) && (
        <div className="flex gap-2 flex-wrap">
          {filters.status && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs">
              <IssueStatusBadge status={filters.status} size="sm" />
              <button onClick={() => setFilters({ status: '' })} className="text-blue-400 hover:text-white ml-1 text-[10px] font-bold">✕</button>
            </span>
          )}
          {filters.priority && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-700 border border-slate-600 text-slate-300 text-xs">
              Priority: {filters.priority}
              <button onClick={() => setFilters({ priority: '' })} className="text-slate-400 hover:text-white ml-1 text-[10px] font-bold">✕</button>
            </span>
          )}
          {filters.category && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-700 border border-slate-600 text-slate-300 text-xs">
              {ISSUE_CATEGORIES.find(c => c.id === filters.category)?.icon} {filters.category}
              <button onClick={() => setFilters({ category: '' })} className="text-slate-400 hover:text-white ml-1 text-[10px] font-bold">✕</button>
            </span>
          )}
          {filters.ward && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-700 border border-slate-600 text-slate-300 text-xs">
              Ward: {filters.ward}
              <button onClick={() => setFilters({ ward: '' })} className="text-slate-400 hover:text-white ml-1 text-[10px] font-bold">✕</button>
            </span>
          )}
          {(filters.date_from || filters.date_to) && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-700 border border-slate-600 text-slate-300 text-xs">
              📅 {filters.date_from || 'Any'} to {filters.date_to || 'Any'}
              <button onClick={() => setFilters({ date_from: '', date_to: '' })} className="text-slate-400 hover:text-white ml-1 text-[10px] font-bold">✕</button>
            </span>
          )}
        </div>
      )}

      {/* Grid of Issue Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-52 bg-slate-800/60 rounded-2xl animate-pulse border border-slate-700" />
          ))}
        </div>
      ) : issues.length === 0 ? (
        <div className="text-center py-16 bg-slate-800/40 rounded-2xl border border-dashed border-slate-700">
          <span className="text-5xl mb-4 block">📋</span>
          <h3 className="text-lg font-semibold text-white mb-2 font-heading">No reports found</h3>
          <p className="text-slate-400 text-sm mb-6">
            {filters.search || filters.status || filters.category || filters.ward || filters.date_from || filters.date_to
              ? 'Try modifying your search or reset filters.'
              : "You haven't reported any issues yet."}
          </p>
          <button
            id="btn-empty-report"
            onClick={() => navigate('/dashboard/citizen/report-issue')}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all"
          >
            Submit First Complaint
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {issues.map(issue => (
            <IssueCard
              key={issue.id}
              issue={issue}
              onSave={handleSave}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {issues.length >= LIMIT && (
        <div className="flex justify-center gap-3">
          <button
            id="btn-prev-page"
            onClick={() => { const p = Math.max(0, page - 1); setPage(p); load(p); }}
            disabled={page === 0}
            className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 text-xs font-semibold disabled:opacity-40 hover:border-slate-500 transition-all"
          >
            ← Prev
          </button>
          <span className="px-4 py-2 text-slate-400 text-xs font-medium">Page {page + 1}</span>
          <button
            id="btn-next-page"
            onClick={() => { const p = page + 1; setPage(p); load(p); }}
            className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 text-xs font-semibold hover:border-slate-500 transition-all"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default MyReports;
