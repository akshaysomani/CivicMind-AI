import React, { useEffect, useState } from 'react';
import { useCitizen } from '../../context/CitizenContext';
import { AlertCard } from '../../components/dashboard/AlertCard';
import { LoadingSkeleton } from '../../components/dashboard/LoadingSkeleton';
import { SectionHeader } from '../../components/SectionHeader';
import { SearchComponent } from '../../components/dashboard/SearchComponent';
import { FilterComponent } from '../../components/dashboard/FilterComponent';
import { BellRing } from 'lucide-react';

export const NearbyAlerts: React.FC = () => {
  const { alerts, refreshDashboard, isLoading } = useCitizen();
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('All');

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  // Filtering nearby alerts in memory
  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch = 
      alert.title.toLowerCase().includes(search.toLowerCase()) || 
      alert.message.toLowerCase().includes(search.toLowerCase()) ||
      alert.location.toLowerCase().includes(search.toLowerCase());
      
    const matchesSeverity = severity === 'All' || alert.severity === severity;
    
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="space-y-6 pb-10">
      <SectionHeader
        title="Local Hazard & Outage Feed"
        subtitle="Monitor active municipal emergency alerts, flooding coordinates, and road closures in your zoning area."
        badge="Nearby Alerts"
        center={false}
      />

      {/* Searching & Filtering */}
      <div className="bg-slate-900/20 dark:bg-slate-900/20 light:bg-white/40 border border-white/10 dark:border-white/5 light:border-slate-200/80 rounded-2xl p-5 backdrop-blur-md shadow-sm flex flex-col md:flex-row gap-5 items-end justify-between">
        
        <SearchComponent 
          value={search} 
          onChange={setSearch} 
          placeholder="Search by alert title, street location, outage..." 
          className="flex-1"
        />

        <FilterComponent
          label="Severity Level"
          value={severity}
          onChange={setSeverity}
          options={['All', 'Low', 'Medium', 'High', 'Critical']}
        />
      </div>

      {/* Grid of AlertCards */}
      {isLoading ? (
        <LoadingSkeleton type="card" count={3} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {filteredAlerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}

          {filteredAlerts.length === 0 && (
            <div className="text-center py-12 md:col-span-2 bg-slate-900/10 dark:bg-slate-900/10 light:bg-white/20 border border-dashed border-white/10 dark:border-white/5 light:border-slate-300 rounded-2xl">
              <BellRing className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <h4 className="font-heading font-semibold text-slate-705 dark:text-slate-305">No Active Alerts</h4>
              <p className="text-xs text-slate-500 mt-1">There are no active municipal alerts registered in your coordinates.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NearbyAlerts;
