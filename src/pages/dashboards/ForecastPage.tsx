import React, { useState, useEffect } from 'react';
import { useForecast } from '../../context/ForecastContext';
import { useNotifications } from '../../context/NotificationContext';
import { 
  TrendingUp, ShieldAlert, Award, Compass, RefreshCw, BarChart2, 
  MapPin, AlertTriangle, Play, HelpCircle, Activity, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, LineChart, Line, ScatterChart, Scatter
} from 'recharts';
import { MapContainer, TileLayer, Marker, Popup, useMap as useLeafletMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet Icons
const hotspotIcon = L.divIcon({
  html: `
    <div class="relative flex items-center justify-center">
      <div class="absolute w-10 h-10 bg-red-500/25 rounded-full animate-ping"></div>
      <div class="relative w-8 h-8 bg-red-700 rounded-full border-2 border-white shadow-2xl flex items-center justify-center">
        <span class="text-xs text-white">🔥</span>
      </div>
    </div>
  `,
  className: 'custom-predictive-hotspot',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useLeafletMap();
  useEffect(() => {
    map.flyTo(center, zoom, { animate: true, duration: 1.5 });
  }, [center, zoom, map]);
  return null;
};

export const ForecastPage: React.FC = () => {
  const { showNotification } = useNotifications();
  const {
    dashboard,
    trends,
    risks,
    warnings,
    recommendations,
    simulation,
    confidence,
    geospatial,
    isLoading,
    activeRange,
    setActiveRange,
    refreshAll,
    triggerSimulation,
    dispatchPreventiveAction
  } = useForecast();

  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'risks' | 'warnings' | 'scenario' | 'gis'>('overview');

  // Simulation state variables
  const [staffIncrease, setStaffIncrease] = useState(5);
  const [maintenanceTeams, setMaintenanceTeams] = useState(2);
  const [awarenessCampaigns, setAwarenessCampaigns] = useState(false);

  // Dynamic colors helper
  const getIndexColor = (val: number) => {
    if (val >= 80) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (val >= 60) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-red-400 border-red-500/30 bg-red-500/10';
  };

  const getPriorityColor = (pri: string) => {
    switch (pri) {
      case 'Critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'High': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Medium': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const trendData = trends ? trends.labels.map((lbl, idx) => ({
    name: lbl,
    Infrastructure: trends.infrastructure_forecast[idx],
    Emergency: trends.emergency_forecast[idx],
    Healthcare: trends.healthcare_demand_forecast[idx],
    Schemes: trends.schemes_demand_forecast[idx],
  })) : [];

  const scatterData = risks.map((r) => ({
    name: r.domain,
    x: Math.round(r.likelihood * 100),
    y: r.impact_score,
    size: r.affected_population_estimate / 100
  }));

  const triggerLocalSimulation = () => {
    triggerSimulation(staffIncrease, maintenanceTeams, awarenessCampaigns);
  };

  return (
    <div className="space-y-8 p-1">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="font-heading text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Compass className="w-8 h-8 text-primary animate-spin-slow" />
            Predictive Intelligence & Forecasting
          </h1>
          <p className="text-slate-400 mt-1">
            Proactive decision-support platform assessing municipal risks, workload estimation, and early warnings.
          </p>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          <select
            value={activeRange}
            onChange={(e) => {
              setActiveRange(e.target.value);
              showNotification(`Forecasting range updated to ${e.target.value}`, 'info');
            }}
            className="px-4 py-2.5 rounded-xl border border-white/10 bg-slate-900/60 backdrop-blur-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary font-semibold text-sm"
          >
            <option value="24hours">Next 24 Hours</option>
            <option value="7days">Next 7 Days</option>
            <option value="30days">Next 30 Days</option>
            <option value="quarter">Next Quarter</option>
          </select>

          <button
            onClick={() => refreshAll()}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all active:scale-95 disabled:opacity-50"
            title="Reload forecasting models"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Ring Index Scores */}
      {dashboard && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Forecast Index', val: dashboard.overall_forecast_index, icon: Compass },
            { label: 'Active Warnings', val: dashboard.total_warnings_active, icon: ShieldAlert },
            { label: 'Readiness Index', val: dashboard.department_readiness, icon: Activity },
            { label: 'Model Confidence', val: Math.round(dashboard.avg_forecast_confidence * 100), icon: Award, suffix: '%' }
          ].map((score, i) => (
            <motion.div
              key={score.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`p-4 rounded-2xl border backdrop-blur-xl flex flex-col justify-between h-32 ${getIndexColor(score.val)}`}
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none">{score.label}</span>
                <score.icon className="w-5 h-5 opacity-70" />
              </div>
              <div className="flex items-baseline gap-0.5 mt-2">
                <span className="text-3xl font-extrabold tracking-tight">{score.val}</span>
                <span className="text-xs opacity-75">{score.suffix || '/100'}</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                <div 
                  className="bg-current h-full transition-all duration-1000"
                  style={{ width: `${score.val}%` }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* 3. explainable AI warning card banner */}
      {confidence && (
        <div className="p-4 rounded-2xl border border-amber-500/25 bg-amber-500/5 text-xs text-amber-300 space-y-2 relative overflow-hidden backdrop-blur-lg">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0 text-amber-400" />
            <span className="font-bold text-amber-400">Explainable Forecasting Note & Calibration Signal</span>
          </div>
          <p className="leading-relaxed">
            {confidence.limitations} Grounded signals cataloged: <strong>{confidence.total_grounded_signals}</strong>. Match accuracy rate: <strong>{Math.round(confidence.historical_match_rate * 100)}%</strong>. All predictions are generated probabilistically. Human validation is recommended.
          </p>
        </div>
      )}

      {/* 4. Tab Workspace triggers */}
      <div className="flex border-b border-white/5 overflow-x-auto whitespace-nowrap scrollbar-none gap-2">
        {[
          { id: 'overview', label: 'Overview Risks', icon: BarChart2 },
          { id: 'trends', label: 'Forecast Explorer', icon: TrendingUp },
          { id: 'risks', label: 'Risk Matrix', icon: AlertTriangle },
          { id: 'warnings', label: 'Early Warnings', icon: ShieldAlert },
          { id: 'scenario', label: 'Scenario Simulator', icon: Play },
          { id: 'gis', label: 'Predictive Heatmaps', icon: MapPin }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-3.5 border-b-2 font-bold text-sm transition-all duration-200 ${
              activeTab === tab.id
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* 5. Tab view panels */}
      <div className="min-h-[450px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-96">
            <RefreshCw className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-slate-400 text-sm font-semibold">Running scenario simulation engine...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left: Top Risks cards */}
                  <div className="space-y-4">
                    <h3 className="text-white font-heading font-bold text-lg">Estimated Domain Risks</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {risks.map((risk) => (
                        <div key={risk.domain} className="p-4 rounded-xl border border-white/5 bg-slate-900/50 backdrop-blur-xl flex justify-between items-center">
                          <div className="space-y-1">
                            <h4 className="text-white font-semibold text-sm">{risk.domain}</h4>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-500">Likelihood: {Math.round(risk.likelihood * 100)}%</span>
                              <span className="text-[10px] text-slate-500">Readiness: {risk.readiness}%</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-500 block">Severity</span>
                            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                              risk.severity === 'High' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                            }`}>{risk.severity}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Preventive Recommendations */}
                  <div className="space-y-4">
                    <h3 className="text-white font-heading font-bold text-lg">Actionable Recommendations</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {recommendations.slice(0, 3).map((rec) => (
                        <div key={rec.id} className="p-4 rounded-xl border border-white/5 bg-slate-900/50 backdrop-blur-xl flex flex-col justify-between h-40">
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getPriorityColor(rec.priority)}`}>
                                {rec.priority} Priority
                              </span>
                              <span className="text-[10px] text-primary font-bold">Conf: {Math.round(rec.confidence * 100)}%</span>
                            </div>
                            <h4 className="text-white font-bold text-sm leading-tight">{rec.title}</h4>
                            <p className="text-slate-400 text-[11px] mt-1 line-clamp-2">{rec.evidence}</p>
                          </div>
                          <div className="mt-3 flex justify-between items-center border-t border-white/5 pt-2">
                            <span className="text-[9px] text-slate-500 truncate max-w-[200px]">{rec.responsible_departments.join(', ')}</span>
                            {rec.triggered ? (
                              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded">Dispatched</span>
                            ) : (
                              <button
                                onClick={() => dispatchPreventiveAction(rec.id)}
                                className="text-[10px] bg-primary text-text-on-primary font-bold px-3 py-1 rounded hover:bg-primary-hover active:scale-95 transition-all"
                              >
                                Dispatch Action
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Forecast Explorer Tab */}
              {activeTab === 'trends' && trends && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-5 rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-xl">
                    <h3 className="text-white font-bold mb-4 font-heading">Infrastructure & Public Safety Workload Projection</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData}>
                          <defs>
                            <linearGradient id="colorInf" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorEm" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" />
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                          <YAxis stroke="#94a3b8" fontSize={11} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff1a', color: '#fff' }} />
                          <Legend />
                          <Area type="monotone" dataKey="Infrastructure" stroke="#3b82f6" fillOpacity={1} fill="url(#colorInf)" />
                          <Area type="monotone" dataKey="Emergency" stroke="#f43f5e" fillOpacity={1} fill="url(#colorEm)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-xl">
                    <h3 className="text-white font-bold mb-4 font-heading">Healthcare & Scheme Demand Forecast</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" />
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                          <YAxis stroke="#94a3b8" fontSize={11} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff1a', color: '#fff' }} />
                          <Legend />
                          <Line type="monotone" dataKey="Healthcare" stroke="#10b981" strokeWidth={2} activeDot={{ r: 6 }} />
                          <Line type="monotone" dataKey="Schemes" stroke="#8b5cf6" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {/* Risk Matrix Tab */}
              {activeTab === 'risks' && (
                <div className="p-5 rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-xl">
                  <h3 className="text-white font-heading font-bold mb-2">Likelihood vs Severity Matrix</h3>
                  <p className="text-xs text-slate-400 mb-6">Scatter plot comparing estimated impact severity (Y-axis) with likelihood of occurrence (X-axis).</p>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" />
                        <XAxis type="number" dataKey="x" name="Likelihood" unit="%" stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                        <YAxis type="number" dataKey="y" name="Severity" unit="/100" stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff1a', color: '#fff' }} />
                        <Legend />
                        <Scatter name="Risk Domains" data={scatterData} fill="#f43f5e" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Early Warning Center Tab */}
              {activeTab === 'warnings' && (
                <div className="space-y-4">
                  {warnings.map((warn) => (
                    <div key={warn.id} className="p-5 rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">Emerging Risk</span>
                          <span className="text-[10px] text-slate-500">Location: {warn.affected_locations.join(', ')}</span>
                        </div>
                        <h4 className="text-white font-bold text-base mt-1">{warn.pattern}</h4>
                        <p className="text-slate-350 text-xs">{warn.evidence}</p>
                        <p className="text-xs text-primary font-semibold mt-2">💡 Preventive step: {warn.preventive_action}</p>
                      </div>
                      <div className="text-right shrink-0 self-end md:self-auto">
                        <span className="text-[10px] text-slate-500 block">Trigger Confidence</span>
                        <span className="text-base font-bold text-rose-400">{Math.round(warn.confidence * 100)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Scenario Simulator Tab */}
              {activeTab === 'scenario' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left: Input sliders panel */}
                  <div className="p-5 rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-xl space-y-6">
                    <h3 className="text-white font-heading font-bold text-base border-b border-white/5 pb-2">Simulation Parameters</h3>
                    
                    <div className="space-y-2">
                      <label className="text-xs text-slate-400 flex justify-between">
                        <span>Sanitation Staff Addition</span>
                        <span className="font-bold text-white">+{staffIncrease}</span>
                      </label>
                      <input 
                        type="range" 
                        min="0" 
                        max="20" 
                        value={staffIncrease} 
                        onChange={(e) => setStaffIncrease(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary" 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs text-slate-400 flex justify-between">
                        <span>Road Patching Teams</span>
                        <span className="font-bold text-white">+{maintenanceTeams}</span>
                      </label>
                      <input 
                        type="range" 
                        min="0" 
                        max="10" 
                        value={maintenanceTeams} 
                        onChange={(e) => setMaintenanceTeams(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary" 
                      />
                    </div>

                    <div className="flex items-center justify-between border-t border-white/5 pt-4">
                      <span className="text-xs text-slate-400">Launch Awareness Campaign</span>
                      <input 
                        type="checkbox" 
                        checked={awarenessCampaigns} 
                        onChange={(e) => setAwarenessCampaigns(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-primary focus:ring-primary focus:ring-offset-slate-900 focus:ring-2"
                      />
                    </div>

                    <button
                      onClick={triggerLocalSimulation}
                      className="w-full py-2.5 bg-primary hover:bg-primary-hover text-text-on-primary text-xs font-bold rounded-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Run Simulation Impact
                    </button>
                  </div>

                  {/* Right: Simulation results charts */}
                  <div className="col-span-2 p-5 rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-xl">
                    <h3 className="text-white font-heading font-bold text-base mb-4">Estimated Simulation Outcomes</h3>
                    
                    {simulation ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div className="space-y-6">
                          <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                            <span className="text-[10px] text-emerald-400 block uppercase tracking-wider font-bold">Complaint Reduction</span>
                            <span className="text-3xl font-extrabold text-white">-{simulation.simulated_complaints_reduction_percent}%</span>
                          </div>
                          
                          <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
                            <span className="text-[10px] text-blue-400 block uppercase tracking-wider font-bold">Readiness Boost</span>
                            <span className="text-3xl font-extrabold text-white">+{simulation.readiness_boost_percent}%</span>
                          </div>

                          <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/5">
                            <span className="text-[10px] text-purple-400 block uppercase tracking-wider font-bold">Response Speed Reduction</span>
                            <span className="text-3xl font-extrabold text-white">-{simulation.estimated_response_reduction_minutes} mins</span>
                          </div>
                        </div>

                        <div className="p-4 rounded-xl border border-white/5 bg-slate-950/40 text-xs text-slate-350 leading-relaxed">
                          <span className="font-bold text-primary block mb-2">Simulated Outcome Rationale:</span>
                          {simulation.impact_rationale}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-64 border border-dashed border-white/10 rounded-xl">
                        <HelpCircle className="w-10 h-10 text-slate-500 mb-2" />
                        <p className="text-slate-400 text-xs font-semibold">Adjust parameters and click Run to load simulated outcomes</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Predictive Heatmaps Tab */}
              {activeTab === 'gis' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-white/5 bg-slate-900/40 text-xs text-slate-400 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>Displaying geospatial predictions and infrastructure stress maps for San Francisco boundaries. Click a hotspot to view forecasted impact metrics.</span>
                  </div>
                  <div className="h-[450px] w-full rounded-2xl overflow-hidden border border-white/10 shadow-lg relative z-10">
                    <MapContainer
                      center={[37.7749, -122.4194]}
                      zoom={12}
                      className="h-full w-full"
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <MapController center={[37.7749, -122.4194]} zoom={12} />
                      
                      {geospatial.map((pin) => (
                        <Marker
                          key={pin.id}
                          position={[pin.latitude, pin.longitude]}
                          icon={hotspotIcon}
                        >
                          <Popup>
                            <div className="p-1 min-w-[200px] text-slate-900 font-sans">
                              <div className="flex justify-between items-center border-b pb-1 mb-2">
                                <span className="font-bold text-sm">{pin.name}</span>
                                <span className="text-[10px] bg-red-100 text-red-800 font-bold px-1.5 py-0.5 rounded-full">{pin.risk_score} Risk</span>
                              </div>
                              <p className="text-xs mb-1"><strong>Type:</strong> {pin.type}</p>
                              <p className="text-xs mb-1"><strong>Model Confidence:</strong> {Math.round(pin.confidence_level * 100)}%</p>
                              <p className="text-xs mb-2"><strong>Estimated Affected Citizens:</strong> {pin.estimated_impacted_citizens.toLocaleString()}</p>
                              <button
                                onClick={() => {
                                  showNotification(`Triggering preemptive team coordinates dispatch to ${pin.name}`, 'success');
                                }}
                                className="w-full text-center bg-red-600 text-white font-bold py-1 text-[10px] rounded hover:bg-red-700"
                              >
                                Preemptive Dispatch
                              </button>
                            </div>
                          </Popup>
                        </Marker>
                      ))}
                    </MapContainer>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
