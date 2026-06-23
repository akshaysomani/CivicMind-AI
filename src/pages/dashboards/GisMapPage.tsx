import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, Flame, MapPin, Plus, Map, RefreshCw, BarChart2 } from 'lucide-react';
import { useMap } from '../../context/MapContext';
import { useAuth } from '../../context/AuthContext';
import { GisMap } from '../../components/gis/GisMap';
import { IssueSidebar } from '../../components/gis/IssueSidebar';
import { FilterDrawer } from '../../components/gis/FilterDrawer';
import { LayerPanel } from '../../components/gis/LayerPanel';
import { WardCard } from '../../components/gis/WardCard';
import { RoutePlanner } from '../../components/gis/RoutePlanner';
import { AnalyticsPanel } from '../../components/gis/AnalyticsPanel';
import { Link } from 'react-router-dom';

export const GisMapPage: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    refreshMapData,
    selectedWard,
    setSelectedWard,
    heatmapMode,
    setHeatmapMode,
    heatmapIntensity,
    setHeatmapIntensity,
    mapProvider,
    setMapProvider,
    mapStyle,
    setMapStyle,
    currentCoords,
    triggerLocateMe,
    isLoading,
  } = useMap();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Trigger geolocation lookups on page load to anchor viewport
  useEffect(() => {
    triggerLocateMe();
  }, [triggerLocateMe]);

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col md:flex-row relative overflow-hidden bg-slate-950 text-slate-100 rounded-2xl border border-white/5 shadow-2xl">
      {/* 1. Sidebar list pane */}
      <AnimatePresence>
        {!isSidebarCollapsed && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 'auto', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="h-full shrink-0 flex overflow-hidden z-20"
          >
            <IssueSidebar />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Main interactive map workspace */}
      <div className="flex-1 h-full relative flex flex-col min-w-0">
        
        {/* Top Control Bar overlay */}
        <div className="absolute top-4 left-4 z-40 flex items-center gap-3">
          {/* Sidebar collapse button */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-2.5 rounded-xl border border-white/10 bg-slate-950/80 backdrop-blur-md text-slate-350 hover:text-slate-100 transition-colors shadow-lg cursor-pointer"
            aria-label="Collapse Issues list sidebar"
          >
            <BarChart2 className="w-4.5 h-4.5 rotate-90" />
          </button>

          {/* Filter Drawer toggle */}
          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-white/10 bg-slate-950/80 backdrop-blur-md text-xs font-bold text-slate-100 hover:bg-slate-900 transition-colors shadow-lg cursor-pointer"
            aria-label="Open Map Filters Drawer"
          >
            <SlidersHorizontal className="w-4 h-4 text-primary" />
            <span>Filters</span>
          </button>

          {/* Refresh Action */}
          <button
            onClick={refreshMapData}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-white/10 bg-slate-950/80 backdrop-blur-md text-slate-350 hover:text-slate-100 transition-colors shadow-lg disabled:opacity-50 cursor-pointer"
            aria-label="Refresh GIS Data"
          >
            <RefreshCw className={`w-4.5 h-4.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Layer Selection popover */}
        <LayerPanel />

        {/* Main Map Component */}
        <GisMap />

        {/* Route Planner Overlay */}
        <RoutePlanner />

        {/* Ward Demographics Card */}
        {selectedWard && (
          <WardCard ward={selectedWard} onClose={() => setSelectedWard(null)} />
        )}

        {/* Bottom Floating Control Bar (Heatmap, Map Provider, Locator) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 bg-slate-950/80 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3 shadow-2xl flex items-center gap-4 text-xs font-semibold select-none flex-wrap max-w-[90%] sm:max-w-max justify-center">
          
          {/* Map style dropdown selector */}
          <div className="flex items-center gap-2 border-r border-white/10 pr-4">
            <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Style</span>
            <select
              value={mapStyle}
              onChange={(e: any) => setMapStyle(e.target.value)}
              className="bg-slate-900 border border-white/5 rounded-lg px-2 py-1 text-xs text-slate-350 focus:outline-none"
            >
              <option value="dark">Dark Canvas</option>
              <option value="streets">Streets Map</option>
              <option value="satellite">Satellite View</option>
              <option value="terrain">Terrain View</option>
            </select>
          </div>

          {/* Heatmap density toggle */}
          <button
            onClick={() => setHeatmapMode(!heatmapMode)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              heatmapMode
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                : 'bg-slate-900/50 border-white/5 text-slate-400 hover:border-slate-800'
            }`}
          >
            <Flame className={`w-4 h-4 ${heatmapMode ? 'animate-pulse' : ''}`} />
            <span>Heatmap</span>
          </button>

          {/* Heatmap intensity scaler */}
          {heatmapMode && (
            <div className="flex items-center gap-2 border-r border-white/10 pr-4">
              <span className="text-[10px] text-slate-500 font-extrabold uppercase">Intensity</span>
              <input
                type="range"
                min="1"
                max="5"
                value={heatmapIntensity}
                onChange={(e) => setHeatmapIntensity(parseInt(e.target.value))}
                className="w-16 h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>
          )}

          {/* Map provider hot swap */}
          <button
            onClick={() => setMapProvider(mapProvider === 'leaflet' ? 'google' : 'leaflet')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/50 border border-white/5 text-slate-400 hover:border-slate-800 transition-all cursor-pointer"
          >
            <Map className="w-4 h-4 text-primary" />
            <span>{mapProvider === 'leaflet' ? 'Google Maps' : 'Leaflet/OSM'}</span>
          </button>

          {/* Geolocation trigger */}
          <button
            onClick={triggerLocateMe}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              currentCoords
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-slate-900/50 border-white/5 text-slate-400 hover:border-slate-800'
            }`}
            aria-label="Track My Location"
          >
            <MapPin className="w-4 h-4" />
          </button>
        </div>

        {/* Viewport Analytics Panel widget */}
        <AnalyticsPanel />

        {/* Citizen Floating Action Button to report issues */}
        {currentUser?.role === 'Citizen' && (
          <Link
            to="/dashboard/citizen/report-issue"
            className="absolute bottom-20 right-4 z-40 w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-lg shadow-primary/20 hover:scale-110 active:scale-95 transition-transform duration-200"
            aria-label="Report New Issue"
          >
            <Plus className="w-6 h-6" />
          </Link>
        )}
      </div>

      {/* Slide-out Advanced Filter Drawer */}
      <FilterDrawer isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
    </div>
  );
};
export default GisMapPage;
