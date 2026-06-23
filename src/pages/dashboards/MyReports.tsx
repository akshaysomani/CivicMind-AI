import React, { useEffect, useState } from 'react';
import { useCitizen } from '../../context/CitizenContext';
import { ReportTable } from '../../components/dashboard/ReportTable';
import { SearchComponent } from '../../components/dashboard/SearchComponent';
import { FilterComponent } from '../../components/dashboard/FilterComponent';
import { LoadingSkeleton } from '../../components/dashboard/LoadingSkeleton';
import { SectionHeader } from '../../components/SectionHeader';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const MyReports: React.FC = () => {
  const { reports, fetchReports, isLoading } = useCitizen();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [priority, setPriority] = useState('All');
  const [category, setCategory] = useState('All');
  
  const [sortColumn, setSortColumn] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  // Fetch reports on filter change
  useEffect(() => {
    fetchReports({ search, status, priority, category });
    setPage(1);
  }, [search, status, priority, category, fetchReports]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortOrder('desc');
    }
  };

  // Local sorting in addition to API filters to make interaction extremely snappy
  const sortedReports = [...reports].sort((a, b) => {
    let aVal = a[sortColumn as keyof typeof a];
    let bVal = b[sortColumn as keyof typeof b];

    if (aVal === undefined) return 1;
    if (bVal === undefined) return -1;

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortOrder === 'asc' 
        ? aVal.localeCompare(bVal) 
        : bVal.localeCompare(aVal);
    }

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    }

    return 0;
  });

  // Local Pagination
  const totalPages = Math.ceil(sortedReports.length / itemsPerPage);
  const paginatedReports = sortedReports.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <div className="space-y-6 pb-10">
      <SectionHeader
        title="Personal Issue Workspace"
        subtitle="Manage and track progress on all your reported community concerns in real-time."
        badge="Citizen Reports"
        center={false}
      />

      {/* Searching & Filtering Panel */}
      <div className="bg-slate-900/20 dark:bg-slate-900/20 light:bg-white/40 border border-white/10 dark:border-white/5 light:border-slate-200/80 rounded-2xl p-5 backdrop-blur-md shadow-sm flex flex-col md:flex-row gap-5 items-end justify-between">
        
        {/* Search */}
        <SearchComponent 
          value={search} 
          onChange={setSearch} 
          placeholder="Search by title, description, department..." 
          className="flex-1"
        />

        {/* Filters */}
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          <FilterComponent
            label="Category"
            value={category}
            onChange={setCategory}
            options={['All', 'Infrastructure', 'Waste', 'Safety', 'Water', 'Utilities']}
          />
          <FilterComponent
            label="Priority"
            value={priority}
            onChange={setPriority}
            options={['All', 'Low', 'Medium', 'High', 'Critical']}
          />
          <FilterComponent
            label="Status"
            value={status}
            onChange={setStatus}
            options={['All', 'Open', 'In Progress', 'Resolved', 'Rejected']}
          />
        </div>
      </div>

      {/* Reports Table container */}
      {isLoading ? (
        <LoadingSkeleton type="table" count={5} />
      ) : (
        <div className="space-y-4">
          <ReportTable
            reports={paginatedReports}
            onSort={handleSort}
            sortColumn={sortColumn}
            sortOrder={sortOrder}
          />

          {/* Table Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center bg-slate-900/20 dark:bg-slate-900/20 light:bg-white/40 border border-white/10 dark:border-white/5 light:border-slate-200 rounded-2xl p-4 backdrop-blur-md">
              <span className="text-xs text-slate-500 font-semibold">
                Showing Page {page} of {totalPages} ({sortedReports.length} total entries)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-xl border border-slate-700/50 light:border-slate-350 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 disabled:opacity-40 disabled:hover:text-slate-400 transition-colors"
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="w-4.5 h-4.5" />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-xl border border-slate-700/50 light:border-slate-350 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 disabled:opacity-40 disabled:hover:text-slate-400 transition-colors"
                  aria-label="Next Page"
                >
                  <ChevronRight className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyReports;
