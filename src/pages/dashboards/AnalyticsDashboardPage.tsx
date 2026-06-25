import React, { useState, useEffect } from 'react';
import { useAnalytics } from '../../context/AnalyticsContext';
import { useNotifications } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, Award, Activity, Shield, RefreshCw, BarChart2, 
  MapPin, AlertTriangle, FileText, CheckCircle2, Play, Users, Landmark, Navigation
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Radar, Cell, LineChart, Line
} from 'recharts';
import { MapContainer, TileLayer, Marker, Popup, useMap as useLeafletMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icons
const defaultIcon = L.divIcon({
  html: `
    <div class="relative flex items-center justify-center">
      <div class="absolute w-8 h-8 bg-red-500/25 rounded-full animate-ping"></div>
      <div class="relative w-6 h-6 bg-red-600 rounded-full border-2 border-white shadow-xl flex items-center justify-center">
        <span class="text-[10px] text-white">⚠️</span>
      </div>
    </div>
  `,
  className: 'custom-emergency-marker',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useLeafletMap();
  useEffect(() => {
    map.flyTo(center, zoom, { animate: true, duration: 1.5 });
  }, [center, zoom, map]);
  return null;
};

export const AnalyticsDashboardPage: React.FC = () => {
  const { showNotification } = useNotifications();
  const {
    dashboardIndex,
    kpis,
    trends,
    insights,
    recommendations,
    scorecards,
    citySummary,
    isLoading,
    activeWard,
    setActiveWard,
    refreshAll,
    implementRecommendation
  } = useAnalytics();

  const [activeTab, setActiveTab] = useState<'kpis' | 'trends' | 'insights' | 'decisions' | 'scorecards' | 'gis'>('kpis');
  const navigate = useNavigate();
  // Default center: New Delhi, India
  const mapCenter: [number, number] = [28.6139, 77.2090];
  const mapZoom = 11;

  // Dynamic colors for index metrics
  const getScoreColor = (val: number) => {
    if (val >= 85) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (val >= 70) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
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
    Reports: trends.reports_trend[idx],
    Emergencies: trends.emergencies_trend[idx],
    Healthcare: trends.healthcare_trend[idx],
    Schemes: trends.schemes_trend[idx],
    Resolved: trends.resolution_trend[idx],
  })) : [];

  const categoryData = trends ? trends.categories.map((cat, idx) => ({
    name: cat,
    value: trends.category_counts[idx]
  })) : [];

  const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const radarData = dashboardIndex ? [
    { subject: 'Health', A: dashboardIndex.community_health_score, fullMark: 100 },
    { subject: 'Infrastructure', A: dashboardIndex.infrastructure_health_score, fullMark: 100 },
    { subject: 'Safety', A: dashboardIndex.public_safety_score, fullMark: 100 },
    { subject: 'Government', A: dashboardIndex.government_response_score, fullMark: 100 },
    { subject: 'Participation', A: dashboardIndex.community_participation, fullMark: 100 },
    { subject: 'Readiness', A: dashboardIndex.emergency_readiness_score, fullMark: 100 }
  ] : [];

  // GIS coordinates lists — India-centered locations
  const emergencyHotspots = [
    { id: 1, name: 'Water Pipe Leakage', type: 'Infrastructure', lat: 28.6280, lng: 77.2090, ward: 'Ward 4 - Chandni Chowk', severity: 'Medium' },
    { id: 2, name: 'Main Road Blockage', type: 'Zoning & Roads', lat: 28.5355, lng: 77.3910, ward: 'Ward 2 - Noida Border', severity: 'High' },
    { id: 3, name: 'Fire Incident Alarm', type: 'Emergency', lat: 28.6692, lng: 77.2370, ward: 'Ward 8 - Civil Lines', severity: 'Critical' },
    { id: 4, name: 'Sewage Line Anomaly', type: 'Sanitation', lat: 28.6129, lng: 77.2295, ward: 'Ward 12 - Connaught Place', severity: 'High' }
  ];

  return (
    <div className="space-y-8 p-1">
      {/* 1. Header with dynamic ward filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="font-heading text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Landmark className="w-8 h-8 text-primary animate-pulse" />
            Decision Analytics Platform
          </h1>
          <p className="text-slate-400 mt-1">
            Executive command dashboard transforming platform interactions into real decision intelligence.
          </p>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          <select
            value={activeWard}
            onChange={(e) => {
              setActiveWard(e.target.value);
              showNotification(`Switching scope to ${e.target.value}`, 'info');
            }}
            className="px-4 py-2.5 rounded-xl border border-white/10 bg-slate-900/60 backdrop-blur-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary font-semibold text-sm"
          >
            <option value="All">All Wards (San Francisco)</option>
            <option value="Ward 4 - Mission">Ward 4 - Mission</option>
            <option value="Ward 2 - Richmond">Ward 2 - Richmond</option>
            <option value="Ward 8 - Financial">Ward 8 - Financial</option>
            <option value="Ward 12 - Civic Center">Ward 12 - Civic Center</option>
          </select>

          <button
            onClick={() => refreshAll()}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all active:scale-95 disabled:opacity-50"
            title="Refresh analytics data"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Civic Indexes Section */}
      {dashboardIndex && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Civic Intelligence', val: dashboardIndex.overall_civic_intelligence_index, icon: Award },
            { label: 'Community Health', val: dashboardIndex.community_health_score, icon: Activity },
            { label: 'Infrastructure Health', val: dashboardIndex.infrastructure_health_score, icon: TrendingUp },
            { label: 'Public Safety', val: dashboardIndex.public_safety_score, icon: Shield },
            { label: 'Gov Response', val: dashboardIndex.government_response_score, icon: CheckCircle2 }
          ].map((score, i) => (
            <motion.div
              key={score.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`p-4 rounded-2xl border backdrop-blur-xl flex flex-col justify-between h-36 ${getScoreColor(score.val)}`}
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{score.label}</span>
                <score.icon className="w-5 h-5 opacity-70" />
              </div>
              <div className="flex items-baseline gap-1 mt-4">
                <span className="text-4xl font-extrabold tracking-tight">{score.val}</span>
                <span className="text-xs opacity-70">/100</span>
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

      {/* 3. AI Generated Executive Summary Box */}
      {citySummary && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-5 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-purple-500/5 to-slate-900/40 backdrop-blur-xl shadow-lg relative overflow-hidden"
        >
          <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none translate-x-10 translate-y-10">
            <Landmark className="w-64 h-64 text-white" />
          </div>
          <div className="flex items-center gap-3.5 border-b border-white/5 pb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/25 border border-primary/40 flex items-center justify-center text-primary">
              ✨
            </div>
            <div>
              <h3 className="font-heading font-bold text-white">AI-Generated Executive Summary</h3>
              <span className="text-[10px] text-slate-500">Generated: {new Date(citySummary.timestamp).toLocaleString()}</span>
            </div>
          </div>
          <p className="text-slate-350 text-sm leading-relaxed mt-4">
            {citySummary.summary}
          </p>
        </motion.div>
      )}

      {/* 4. Tab selection */}
      <div className="flex border-b border-white/5 overflow-x-auto whitespace-nowrap scrollbar-none gap-2">
        {[
          { id: 'kpis', label: 'Executive KPIs', icon: BarChart2 },
          { id: 'trends', label: 'Trend Analytics', icon: TrendingUp },
          { id: 'insights', label: 'AI Insights', icon: FileText },
          { id: 'decisions', label: 'Decision Support', icon: AlertTriangle },
          { id: 'scorecards', label: 'Scorecards', icon: Award },
          { id: 'gis', label: 'Geospatial Insights', icon: MapPin }
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

      {/* 5. Dynamic Tab View workspaces */}
      <div className="min-h-[450px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-96">
            <RefreshCw className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-slate-400 text-sm font-semibold">Updating community intelligence state...</p>
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
              {/* Executive KPIs Tab */}
              {activeTab === 'kpis' && kpis && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { title: 'Total Reports', value: kpis.total_reports, desc: 'Total community complaints logged', icon: FileText, color: 'text-blue-400' },
                    { title: 'Open Reports', value: kpis.open_reports, desc: 'Reports awaiting completion', icon: AlertTriangle, color: 'text-amber-400' },
                    { title: 'Resolved Reports', value: kpis.resolved_reports, desc: 'Completed and closed issues', icon: CheckCircle2, color: 'text-emerald-400' },
                    { title: 'Resolution Speed', value: kpis.avg_resolution_time, desc: 'Avg turnaround per issue', icon: Activity, color: 'text-indigo-400' },
                    { title: 'Emergency Incidents', value: kpis.critical_incidents, desc: 'Total hazards detected by AI', icon: AlertTriangle, color: 'text-red-400' },
                    { title: 'Active Emergencies', value: kpis.active_emergencies, desc: 'Urgent incidents in progress', icon: Play, color: 'text-rose-400' },
                    { title: 'Healthcare Requests', value: kpis.healthcare_requests, desc: 'Inquiries via healthcare advisor', icon: Users, color: 'text-teal-400' },
                    { title: 'Scheme Requests', value: kpis.government_scheme_requests, desc: 'Inquiries routed to Scheme advisor', icon: Landmark, color: 'text-purple-400' }
                  ].map((card) => (
                    <div key={card.title} className="p-5 rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-xl shadow-md flex justify-between items-start">
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{card.title}</span>
                        <div className="text-3xl font-extrabold text-white tracking-tight">{card.value}</div>
                        <p className="text-[11px] text-slate-500">{card.desc}</p>
                      </div>
                      <div className={`p-2.5 rounded-xl bg-white/5 border border-white/10 ${card.color}`}>
                        <card.icon className="w-5 h-5" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Trend Analytics Tab */}
              {activeTab === 'trends' && trends && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Chart 1: Daily/Monthly general trends */}
                  <div className="p-5 rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-xl">
                    <h3 className="text-white font-bold mb-4 font-heading">Monthly Complaint & Resolution Trends</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData}>
                          <defs>
                            <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" />
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                          <YAxis stroke="#94a3b8" fontSize={11} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff1a', color: '#fff' }} />
                          <Legend />
                          <Area type="monotone" dataKey="Reports" stroke="#3b82f6" fillOpacity={1} fill="url(#colorReports)" />
                          <Area type="monotone" dataKey="Resolved" stroke="#10b981" fillOpacity={1} fill="url(#colorResolved)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Chart 2: Category Breakdown */}
                  <div className="p-5 rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-xl">
                    <h3 className="text-white font-bold mb-4 font-heading">Report Volume by Category</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={categoryData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" />
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                          <YAxis stroke="#94a3b8" fontSize={11} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff1a', color: '#fff' }} />
                          <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                            {categoryData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Chart 3: Radar Score Comparison */}
                  <div className="p-5 rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-xl">
                    <h3 className="text-white font-bold mb-4 font-heading">Civic Performance Radar</h3>
                    <div className="h-80 flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                          <PolarGrid stroke="#ffffff1a" />
                          <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={11} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94a3b8" fontSize={9} />
                          <Radar name="City Score" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                          <Legend />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Chart 4: Ward volume distribution */}
                  <div className="p-5 rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-xl">
                    <h3 className="text-white font-bold mb-4 font-heading">Reports Trend by Ward</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={
                          trends.labels.map((lbl, idx) => ({
                            name: lbl,
                            "Ward 4": trends.ward_trends["Ward 4 - Mission"][idx],
                            "Ward 2": trends.ward_trends["Ward 2 - Richmond"][idx],
                            "Ward 8": trends.ward_trends["Ward 8 - Financial"][idx],
                            "Ward 12": trends.ward_trends["Ward 12 - Civic Center"][idx],
                          }))
                        }>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" />
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                          <YAxis stroke="#94a3b8" fontSize={11} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff1a', color: '#fff' }} />
                          <Legend />
                          <Line type="monotone" dataKey="Ward 4" stroke="#ec4899" strokeWidth={2} activeDot={{ r: 6 }} />
                          <Line type="monotone" dataKey="Ward 2" stroke="#3b82f6" strokeWidth={2} />
                          <Line type="monotone" dataKey="Ward 8" stroke="#10b981" strokeWidth={2} />
                          <Line type="monotone" dataKey="Ward 12" stroke="#f59e0b" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Insights Tab */}
              {activeTab === 'insights' && (
                <div className="space-y-4">
                  {insights.map((insight) => (
                    <div key={insight.id} className="p-5 rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-xl flex flex-col md:flex-row justify-between md:items-center gap-4 hover:border-white/10 transition-all">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            insight.trend === 'up' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            Trend: {insight.trend.toUpperCase()}
                          </span>
                          <span className="text-xs text-slate-500">{insight.category}</span>
                        </div>
                        <h4 className="text-white font-bold text-lg">{insight.title}</h4>
                        <p className="text-slate-300 text-sm">{insight.description}</p>
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {insight.suggested_actions.map((act) => (
                            <span key={act} className="text-[11px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-white/5">
                              💡 Action: {act}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col items-end shrink-0 justify-between self-end md:self-auto gap-2">
                        <div className="text-right">
                          <span className="text-xs text-slate-400">Confidence</span>
                          <div className="text-lg font-bold text-primary">{Math.round(insight.confidence * 100)}%</div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500">Affected: {insight.affected_wards.join(', ')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Decision Support Tab */}
              {activeTab === 'decisions' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {recommendations.map((rec) => (
                    <div 
                      key={rec.id} 
                      className={`p-5 rounded-2xl border bg-slate-900/50 backdrop-blur-xl shadow-lg flex flex-col justify-between transition-all h-[340px] ${
                        rec.implemented ? 'border-emerald-500/30 ring-1 ring-emerald-500/20' : 'border-white/5'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityColor(rec.priority)}`}>
                            {rec.priority} Priority
                          </span>
                          <span className="text-xs text-primary font-bold">Conf: {Math.round(rec.confidence_score * 100)}%</span>
                        </div>
                        <h4 className="text-white font-heading font-bold text-base leading-snug">{rec.title}</h4>
                        <p className="text-slate-400 text-xs line-clamp-3">{rec.description}</p>
                        <div className="border-t border-white/5 pt-2 mt-2">
                          <p className="text-[11px] text-slate-350 italic">Impact: {rec.impact}</p>
                          <p className="text-[10px] text-slate-500 mt-1">Agency: {rec.affected_departments.join(', ')}</p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/5 mt-4">
                        {rec.implemented ? (
                          <div className="w-full text-center py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl flex items-center justify-center gap-2">
                            ✓ Campaign Dispatched
                          </div>
                        ) : (
                          <button
                            onClick={() => implementRecommendation(rec.id)}
                            className="w-full py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl active:scale-95 transition-all flex items-center justify-center gap-1.5"
                          >
                            🚀 Trigger Policy Action
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Scorecards Tab */}
              {activeTab === 'scorecards' && (
                <div className="space-y-6">
                  {scorecards.map((score) => (
                    <div key={score.scope} className="p-5 rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-xl hover:border-white/10 transition-all">
                      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-4 mb-4 gap-4">
                        <div>
                          <h4 className="text-white font-heading font-bold text-lg">{score.scope}</h4>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            score.trend === 'excellent' ? 'bg-emerald-500/25 text-emerald-400 border-emerald-500/40' :
                            score.trend === 'improving' ? 'bg-blue-500/25 text-blue-400 border-blue-500/40' :
                            score.trend === 'stable' ? 'bg-slate-500/25 text-slate-400 border-slate-500/40' :
                            'bg-red-500/25 text-red-400 border-red-500/40 border'
                          }`}>
                            Trend: {score.trend}
                          </span>
                        </div>
                        <div className="flex items-center gap-6 self-start md:self-auto">
                          <div className="text-center">
                            <span className="text-[10px] text-slate-500 block">Total Reports</span>
                            <span className="text-base font-bold text-white">{score.kpis.total_reports}</span>
                          </div>
                          <div className="text-center">
                            <span className="text-[10px] text-slate-500 block">Resolution</span>
                            <span className="text-base font-bold text-emerald-400">{score.kpis.resolved_rate}</span>
                          </div>
                          <div className="text-center">
                            <span className="text-[10px] text-slate-500 block">Satisfaction</span>
                            <span className="text-base font-bold text-primary">{score.kpis.satisfaction}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Strengths</span>
                          <ul className="list-disc pl-4 text-slate-350 text-xs space-y-1">
                            {score.strengths.map(s => <li key={s}>{s}</li>)}
                          </ul>
                        </div>
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider">Weaknesses / Risks</span>
                          <ul className="list-disc pl-4 text-slate-350 text-xs space-y-1">
                            {score.weaknesses.map(w => <li key={w}>{w}</li>)}
                          </ul>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/5 text-xs bg-primary/5 p-3 rounded-xl border border-primary/10">
                        <span className="font-bold text-primary block">AI Guidance Recommendation:</span>
                        <p className="text-slate-300 mt-1">{score.ai_recommendation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* GIS Hotspots Map Tab */}
              {activeTab === 'gis' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-white/5 bg-slate-900/40 text-xs text-slate-400 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>Displaying live geospatial insights and critical issue hotspots. Click a pin popup and use <strong className="text-white">Route Dispatcher</strong> to navigate to the full GIS Map.</span>
                  </div>
                  <div className="h-[450px] w-full rounded-2xl overflow-hidden border border-white/10 shadow-lg relative z-10">
                    <MapContainer
                      center={mapCenter}
                      zoom={mapZoom}
                      className="h-full w-full"
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <MapController center={mapCenter} zoom={mapZoom} />
                      
                      {emergencyHotspots.map((item) => (
                        <Marker
                          key={item.id}
                          position={[item.lat, item.lng]}
                          icon={defaultIcon}
                        >
                          <Popup>
                            <div className="p-1 min-w-[200px] text-slate-900 font-sans">
                              <div className="flex justify-between items-center border-b pb-1 mb-2">
                                <span className="font-bold text-sm">{item.name}</span>
                                <span className="text-[9px] bg-red-100 text-red-800 font-bold px-1.5 py-0.5 rounded-full">{item.severity}</span>
                              </div>
                              <p className="text-xs mb-1"><strong>Ward:</strong> {item.ward}</p>
                              <p className="text-xs mb-1"><strong>Category:</strong> {item.type}</p>
                              <p className="text-xs mb-2"><strong>Coordinates:</strong> {item.lat.toFixed(4)}, {item.lng.toFixed(4)}</p>
                              <button
                                onClick={() => {
                                  navigate('/dashboard/citizen/map');
                                  showNotification(`Routing dispatcher activated for ${item.name} in ${item.ward}`, 'success');
                                }}
                                className="w-full text-center bg-blue-600 text-white font-bold py-1 text-[10px] rounded hover:bg-blue-700 flex items-center justify-center gap-1"
                              >
                                <Navigation className="w-3 h-3" />
                                Route Dispatcher
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
