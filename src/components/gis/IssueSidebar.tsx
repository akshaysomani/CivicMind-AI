import React from 'react';
import { Search, MapPin, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { useMap } from '../../context/MapContext';
import type { MapIssue } from '../../services/mapService';

export const IssueSidebar: React.FC = () => {
  const {
    filteredIssues,
    selectedIssue,
    setSelectedIssue,
    searchQuery,
    setSearchQuery,
    triggerLocateMe,
    currentCoords,
  } = useMap();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'bg-rose-500/10 text-rose-500 border border-rose-500/20';
      case 'High':
        return 'bg-orange-500/10 text-orange-500 border border-orange-500/20';
      case 'Medium':
        return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
      default:
        return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Resolved':
      case 'Closed':
        return <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />;
      case 'In Progress':
        return <Clock className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />;
      default:
        return <AlertCircle className="w-3.5 h-3.5 text-primary" />;
    }
  };

  return (
    <div className="w-full md:w-80 lg:w-96 bg-slate-950/40 backdrop-blur-xl border-r border-white/10 flex flex-col h-full shrink-0">
      {/* Search Input block */}
      <div className="p-4 border-b border-white/5 space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search issues, complaint IDs, wards..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900/60 border border-white/5 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary"
          />
        </div>
        <div className="flex justify-between items-center text-[10px]">
          <span className="font-bold text-slate-500 uppercase tracking-wider">
            {filteredIssues.length} issues matching criteria
          </span>
          <button
            onClick={triggerLocateMe}
            className="text-primary hover:text-primary-light font-bold flex items-center gap-1 cursor-pointer"
          >
            <MapPin className="w-3 h-3" />
            <span>{currentCoords ? 'GPS Resolved' : 'Find Me'}</span>
          </button>
        </div>
      </div>

      {/* Issues list wrapper */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {filteredIssues.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-xs space-y-2">
            <span className="text-2xl block">🔍</span>
            <p className="font-bold">No matching complaints found.</p>
            <p className="text-[10px]">Try resetting filters or expanding search string.</p>
          </div>
        ) : (
          filteredIssues.map((issue: MapIssue) => {
            const isSelected = selectedIssue?.id === issue.id;
            return (
              <div
                key={issue.id}
                onClick={() => setSelectedIssue(issue)}
                className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col gap-2.5 ${
                  isSelected
                    ? 'bg-primary/10 border-primary shadow-lg shadow-primary/5'
                    : 'bg-slate-900/20 border-white/5 hover:border-slate-800 hover:bg-slate-900/40'
                }`}
              >
                {/* Header title & category */}
                <div className="flex justify-between items-start gap-3">
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[9px] font-extrabold text-slate-500 tracking-wider block">
                      {issue.complaint_id}
                    </span>
                    <h4 className="font-heading font-extrabold text-xs text-slate-200 truncate group-hover:text-primary transition-colors">
                      {issue.title}
                    </h4>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded text-[8px] font-bold ${getPriorityColor(issue.priority)}`}>
                    {issue.priority}
                  </span>
                </div>

                {/* Description snippet */}
                <p className="text-[10.5px] text-slate-400 leading-normal line-clamp-2">
                  {issue.description}
                </p>

                {/* Footer metadata */}
                <div className="flex justify-between items-center text-[9px] pt-1.5 border-t border-white/5">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    {getStatusIcon(issue.status)}
                    <span className="font-bold text-slate-350">{issue.status}</span>
                  </div>
                  <span className="font-bold text-slate-500">
                    {issue.ward || 'San Francisco'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
export default IssueSidebar;
