import React, { useEffect, useState } from 'react';
import { useGovernment } from '../../context/GovernmentContext';
import { SectionHeader } from '../../components/SectionHeader';
import { SearchComponent } from '../../components/dashboard/SearchComponent';
import { LoadingSkeleton } from '../../components/dashboard/LoadingSkeleton';
import { Users, Award, Mail, Phone, Calendar, MapPin } from 'lucide-react';
import { GlassCard } from '../../components/GlassCard';

export const GovernmentCitizens: React.FC = () => {
  const { citizens, isLoading, fetchCitizens } = useGovernment();
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCitizens(search);
  }, [search, fetchCitizens]);

  return (
    <div className="space-y-6 pb-10">
      <SectionHeader
        title="Municipal Citizen Directory"
        subtitle="Access profiles, contact details, and contribution achievements for registered residents in the municipal coordinates."
        badge="Citizen Registry"
        center={false}
      />

      <div className="flex justify-between items-center gap-4">
        <SearchComponent
          value={search}
          onChange={setSearch}
          placeholder="Search citizens by name, email..."
          className="w-full md:max-w-md"
        />
      </div>

      {isLoading && citizens.length === 0 ? (
        <LoadingSkeleton type="card" count={3} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {citizens.map((cit) => (
            <GlassCard 
              key={cit.id}
              className="p-5 border-t border-white/5 space-y-4 hover:border-secondary/20 transition-all flex flex-col justify-between"
            >
              {/* Profile Card Header */}
              <div className="flex justify-between items-start">
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-secondary to-amber-500 text-slate-950 flex items-center justify-center font-bold text-sm uppercase shrink-0 shadow-sm">
                    {cit.first_name[0]}{cit.last_name[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{cit.first_name} {cit.last_name}</h4>
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-secondary" /> {cit.city}, {cit.state}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <span className="text-[9px] uppercase font-bold text-slate-550 block">Score Rank</span>
                  <span className="text-secondary font-extrabold flex items-center gap-0.5 text-xs">
                    <Award className="w-3.5 h-3.5 fill-current" /> {cit.community_score} pts
                  </span>
                </div>
              </div>

              {/* Contact Details */}
              <div className="space-y-1.5 pt-3 border-t border-white/5 text-[11px] text-slate-550 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{cit.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{cit.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>Registered: {new Date(cit.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Issues Count */}
              <div className="pt-3 border-t border-white/5 flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase">
                <span>Issues Reported</span>
                <span className="text-blue-500">{cit.reported_issues_count} Tickets</span>
              </div>

            </GlassCard>
          ))}

          {citizens.length === 0 && (
            <div className="text-center py-12 md:col-span-3 border border-dashed border-white/5 rounded-2xl">
              <Users className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <h4 className="font-heading font-semibold text-slate-705 dark:text-slate-305">Citizen Registry Empty</h4>
              <p className="text-xs text-slate-500 mt-1">No residents registered match the search query.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GovernmentCitizens;
