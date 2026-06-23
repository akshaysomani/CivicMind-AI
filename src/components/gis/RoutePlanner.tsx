import React from 'react';
import { Navigation, X, Clock, MapPin } from 'lucide-react';
import { useMap } from '../../context/MapContext';

export const RoutePlanner: React.FC = () => {
  const { routeInfo, clearRouting } = useMap();

  if (!routeInfo || !routeInfo.active) return null;

  return (
    <div className="absolute top-4 left-4 z-40 w-72 sm:w-80 bg-slate-950/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl space-y-3.5 text-xs text-slate-100">
      {/* Header */}
      <div className="flex justify-between items-center pb-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-primary animate-pulse" />
          <span className="font-heading font-extrabold text-xs uppercase tracking-wider">Route Planner</span>
        </div>
        <button
          onClick={clearRouting}
          className="p-1 rounded hover:bg-white/5 text-slate-400 hover:text-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Origin/Dest layout */}
      <div className="space-y-2">
        <div className="flex items-start gap-2.5">
          <div className="w-5 h-5 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center font-bold text-[9px] text-slate-400 shrink-0">
            A
          </div>
          <div>
            <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block">Start Point</span>
            <span className="text-slate-300 font-bold block truncate max-w-[200px]">Current Location GPS</span>
          </div>
        </div>
        
        <div className="h-4 w-px bg-white/10 ml-2.5" />

        <div className="flex items-start gap-2.5">
          <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary flex items-center justify-center font-bold text-[9px] text-primary shrink-0">
            B
          </div>
          <div>
            <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block">End Point</span>
            <span className="text-slate-200 font-bold block truncate max-w-[200px]">Target Complaint Marker</span>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 pt-1 border-t border-white/5">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary shrink-0" />
          <div>
            <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-widest leading-none">Distance</span>
            <span className="font-heading font-extrabold text-slate-200">{routeInfo.distanceKm} km</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-500 shrink-0" />
          <div>
            <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-widest leading-none">ETA</span>
            <span className="font-heading font-extrabold text-emerald-400">{routeInfo.durationMins} mins</span>
          </div>
        </div>
      </div>

      {/* Travel style indicator */}
      <div className="p-2 rounded-xl bg-slate-900/60 border border-white/3 text-[9px] font-bold text-slate-400 text-center">
        Route generated for: <span className="text-slate-200 capitalize">{routeInfo.mode === 'officer' ? '🚗 Dispatch Vehicle' : '🚶 Citizen Walking'}</span>
      </div>
    </div>
  );
};
export default RoutePlanner;
