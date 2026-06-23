import React, { useEffect } from 'react';
import { useCitizen } from '../../context/CitizenContext';
import { ReportTable } from '../../components/dashboard/ReportTable';
import { LoadingSkeleton } from '../../components/dashboard/LoadingSkeleton';
import { SectionHeader } from '../../components/SectionHeader';
import { Bookmark } from 'lucide-react';

export const SavedReports: React.FC = () => {
  const { savedReports, refreshDashboard, isLoading } = useCitizen();

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  return (
    <div className="space-y-6 pb-10">
      <SectionHeader
        title="Saved Community Log"
        subtitle="Access and track municipal reports you have bookmarked for follow-ups."
        badge="Saved Reports"
        center={false}
      />

      {isLoading ? (
        <LoadingSkeleton type="table" count={3} />
      ) : (
        <div className="space-y-4">
          <ReportTable
            reports={savedReports}
            onSort={() => {}}
            sortColumn="created_at"
            sortOrder="desc"
          />

          {savedReports.length === 0 && (
            <div className="text-center py-12 bg-slate-900/10 dark:bg-slate-900/10 light:bg-white/20 border border-dashed border-white/10 dark:border-white/5 light:border-slate-300 rounded-2xl">
              <Bookmark className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <h4 className="font-heading font-semibold text-slate-705 dark:text-slate-305">No Bookmarked Reports</h4>
              <p className="text-xs text-slate-500 mt-1">Bookmark community reports inside My Reports or feed to track them here.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SavedReports;
