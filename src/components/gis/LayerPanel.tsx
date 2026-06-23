import React, { useState } from 'react';
import { Layers, Eye, EyeOff } from 'lucide-react';
import { useMap } from '../../context/MapContext';

export const LayerPanel: React.FC = () => {
  const { activeLayers, toggleLayer } = useMap();
  const [isOpen, setIsOpen] = useState(false);

  const layerItems = [
    { key: 'issues', label: 'Community Issues', icon: '📌', desc: 'Display all reported civic issues' },
    { key: 'wards', label: 'Ward Boundaries', icon: '🗺️', desc: 'Delineate municipal ward boundaries' },
    { key: 'boundaries', label: 'City Boundary', icon: '🏙️', desc: 'Render city administrative outline' },
    { key: 'healthcare', label: 'Healthcare Facilities', icon: '🏥', desc: 'Hospitals & local clinics' },
    { key: 'police', label: 'Police Stations', icon: '👮', desc: 'Precinct offices & police posts' },
    { key: 'fire', label: 'Fire Stations', icon: '🚒', desc: 'Fire department services' },
    { key: 'schools', label: 'Schools', icon: '🏫', desc: 'Schools and educational facilities' },
    { key: 'government', label: 'Government Offices', icon: '🏛️', desc: 'Municipal administrative offices' },
    { key: 'public_transport', label: 'Public Transport', icon: '🚇', desc: 'Transit routes and BART stations' },
    { key: 'water_bodies', label: 'Water Bodies', icon: '💧', desc: 'Lakes, rivers, and water resources' },
    { key: 'road_network', label: 'Road Network', icon: '🛣️', desc: 'Major city highways and lanes' },
    { key: 'flood_zones', label: 'Flood Zones', icon: '⚠️', desc: 'High-risk low-lying flood sectors' },
  ];

  return (
    <div className="absolute top-4 right-4 z-40">
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-white/10 bg-slate-950/80 backdrop-blur-md text-xs font-bold text-slate-100 hover:bg-slate-900 transition-colors shadow-lg cursor-pointer"
        aria-label="Toggle Layers Panel"
      >
        <Layers className="w-4 h-4 text-primary" />
        <span>Map Layers</span>
      </button>

      {/* Layer selector popover */}
      {isOpen && (
        <>
          {/* Backdrop close capture */}
          <div className="fixed inset-0 z-35" onClick={() => setIsOpen(false)} />
          
          <div className="absolute right-0 mt-2.5 w-72 bg-slate-950/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl z-40 space-y-3 max-h-[420px] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h4 className="font-heading font-extrabold text-xs text-slate-100 uppercase tracking-wider">GIS Map Overlays</h4>
              <span className="text-[9px] font-bold text-slate-500">{layerItems.filter(l => activeLayers[l.key]).length} Enabled</span>
            </div>
            
            <div className="space-y-1.5">
              {layerItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => toggleLayer(item.key)}
                  className="flex items-center justify-between w-full p-2 rounded-xl border transition-all text-left group cursor-pointer text-xs select-none hover:bg-white/5"
                  style={{
                    borderColor: activeLayers[item.key] ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.02)',
                    backgroundColor: activeLayers[item.key] ? 'rgba(59, 130, 246, 0.04)' : 'transparent',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base shrink-0">{item.icon}</span>
                    <div className="min-w-0">
                      <span className="font-bold text-slate-200 block truncate group-hover:text-primary transition-colors">
                        {item.label}
                      </span>
                      <span className="text-[9px] text-slate-500 block truncate leading-tight mt-0.5">
                        {item.desc}
                      </span>
                    </div>
                  </div>
                  
                  <div className="shrink-0 text-slate-400 group-hover:text-slate-200 pl-2">
                    {activeLayers[item.key] ? (
                      <Eye className="w-4 h-4 text-primary" />
                    ) : (
                      <EyeOff className="w-4 h-4 opacity-40" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
export default LayerPanel;
