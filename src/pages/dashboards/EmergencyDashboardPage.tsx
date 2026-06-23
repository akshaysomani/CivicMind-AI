import React, { useState, useEffect } from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import { 
  AlertTriangle, Shield, Clock, Brain, Settings, Users, Radio, Check, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap as useLeafletMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Reusable Map Controller to re-center viewport dynamically
const MapViewportController: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useLeafletMap();
  useEffect(() => {
    map.setView(center, 15, { animate: true });
  }, [center, map]);
  return null;
};

// Custom icons using Leaflet divIcon
const createMarkerIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-emergency-marker',
    html: `<div class="w-8 h-8 rounded-full flex items-center justify-center bg-${color}-500/25 border-2 border-${color}-500 text-${color}-200 shadow-lg animate-pulse">
             <span class="w-2.5 h-2.5 rounded-full bg-${color}-500"></span>
           </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

const createFacilityIcon = (iconName: string, color: string) => {
  return L.divIcon({
    className: 'custom-facility-marker',
    html: `<div class="w-7 h-7 rounded-xl flex items-center justify-center bg-slate-900 border border-${color}-500/35 text-${color}-400 shadow-md">
             <span class="text-[9px] font-bold uppercase">${iconName}</span>
           </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
};

export const EmergencyDashboardPage: React.FC = () => {
  const {
    dashboardStats,
    incidents,
    activeIncident,
    timelineEvents,
    allocatedResources,
    isLoading,
    refreshDashboardStats,
    fetchIncidents,
    selectIncident,
    classifyNewIncident,
    respondToIncidentWithPlaybook,
    overrideIncidentParams
  } = useEmergency();

  // Search and triage state variables
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlaybook, setSelectedPlaybook] = useState('Flood Response');
  const [overrideSeverity, setOverrideSeverity] = useState<'Minor' | 'Moderate' | 'High' | 'Critical' | 'Catastrophic'>('Moderate');
  const [overridePriority, setOverridePriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent' | 'Emergency' | 'Critical'>('High');
  const [overrideRadius, setOverrideRadius] = useState<number>(150);
  const [overrideDepts, setOverrideDepts] = useState<string[]>([]);
  const [showOverridePanel, setShowOverridePanel] = useState(false);
  const [playbookChecklist, setPlaybookChecklist] = useState<Record<string, boolean>>({});

  // Manual classification wizard fields (for demo/testing)
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardTitle, setWizardTitle] = useState('');
  const [wizardDesc, setWizardDesc] = useState('');
  const [wizardLat, setWizardLat] = useState('12.9716');
  const [wizardLng, setWizardLng] = useState('77.5946');
  const [wizardAddress, setWizardAddress] = useState('');

  // Initial load sync
  useEffect(() => {
    fetchIncidents();
    refreshDashboardStats();
  }, [fetchIncidents, refreshDashboardStats]);

  // Sync override selectors on incident change
  useEffect(() => {
    if (activeIncident) {
      setOverrideSeverity(activeIncident.severity);
      setOverridePriority(activeIncident.priority);
      setOverrideRadius(activeIncident.affected_radius_meters);
      setOverrideDepts(activeIncident.suggested_departments || []);
      
      // Auto-select corresponding playbook
      if (activeIncident.type === 'Flood') setSelectedPlaybook('Flood Response');
      else if (activeIncident.type === 'Fire') setSelectedPlaybook('Fire Rescue');
      else if (activeIncident.type === 'Gas Leak') setSelectedPlaybook('Chemical/Gas Safety');
      else if (activeIncident.type === 'Road Accident') setSelectedPlaybook('Road Accident response');
      else setSelectedPlaybook('General SOP');
      
      setPlaybookChecklist({});
    }
  }, [activeIncident]);

  const handleManualClassify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wizardTitle || !wizardDesc) return;
    await classifyNewIncident({
      title: wizardTitle,
      description: wizardDesc,
      latitude: parseFloat(wizardLat),
      longitude: parseFloat(wizardLng),
      address: wizardAddress || 'Oakland Central',
      ward: 'Ward 4'
    });
    setWizardOpen(false);
    setWizardTitle('');
    setWizardDesc('');
  };

  const handleRespond = async () => {
    if (!activeIncident) return;
    await respondToIncidentWithPlaybook(activeIncident.id, selectedPlaybook, 1);
  };

  const handleOverrideSave = async () => {
    if (!activeIncident) return;
    await overrideIncidentParams(
      activeIncident.id,
      overrideSeverity,
      overridePriority,
      overrideRadius,
      overrideDepts
    );
    setShowOverridePanel(false);
  };

  const toggleDept = (dept: string) => {
    if (overrideDepts.includes(dept)) {
      setOverrideDepts(overrideDepts.filter(d => d !== dept));
    } else {
      setOverrideDepts([...overrideDepts, dept]);
    }
  };

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'Minor': return 'slate';
      case 'Moderate': return 'emerald';
      case 'High': return 'amber';
      case 'Critical': return 'orange';
      case 'Catastrophic': return 'rose';
      default: return 'slate';
    }
  };

  const getPriorityColor = (pri: string) => {
    switch (pri) {
      case 'Low': return 'slate';
      case 'Medium': return 'blue';
      case 'High': return 'amber';
      case 'Urgent': return 'orange';
      case 'Emergency': return 'rose';
      case 'Critical': return 'red';
      default: return 'slate';
    }
  };

  const playbooks = [
    {
      name: 'Flood Response',
      actions: [
        'Deploy disaster response boats & rafts',
        'Direct local population to safe evacuation zones',
        'Coordinate with NGOs at collection points',
        'Establish clean drinking water checkpoints'
      ],
      depts: ['Disaster Management', 'Water Department'],
      resources: 'Boats, Sandbags, Water Tanks'
    },
    {
      name: 'Fire Rescue',
      actions: [
        'Dispatch fire suppression engines immediately',
        'Establish external safe perimeter constraints',
        'Verify immediate water hydrant connection points',
        'Acknowledge gas grid shut-off protocols'
      ],
      depts: ['Fire Department', 'Police'],
      resources: 'Firetrucks, Hoses, Respirators'
    },
    {
      name: 'Chemical/Gas Safety',
      actions: [
        'Initialize broad environmental safety zones',
        'Deploy hazardous material inspection teams',
        'Contact electricity board to disable local grids',
        'Advise neighborhood air monitoring actions'
      ],
      depts: ['Fire Department', 'Environmental Department'],
      resources: 'Hazmat Suits, Scanners, Evacuation buses'
    },
    {
      name: 'Road Accident response',
      actions: [
        'Dispatch traffic police redirect teams',
        'Send ambulance units to locate injured citizens',
        'Commence road cleanup actions'
      ],
      depts: ['Traffic Police', 'Medical Services'],
      resources: 'Ambulance, Traffic Cones'
    },
    {
      name: 'General SOP',
      actions: [
        'Initiate central monitoring channels',
        'Deploy local safety inspection patrols',
        'Broadcast guidance logs to citizen portal'
      ],
      depts: ['Disaster Management'],
      resources: 'Patrol units'
    }
  ];

  const currentPlaybook = playbooks.find(p => p.name === selectedPlaybook) || playbooks[4];

  // Filter incidents queue
  const filteredIncidents = incidents.filter(i =>
    i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCenter: [number, number] = activeIncident && activeIncident.latitude && activeIncident.longitude
    ? [activeIncident.latitude, activeIncident.longitude]
    : [12.9716, 77.5946];

  // Mock nearest emergency service facilities around the active incident coordinates
  const nearestFacilities = activeIncident
    ? [
        { name: 'District Hospital', type: 'HOSP', color: 'rose', coords: [activeCenter[0] + 0.005, activeCenter[1] - 0.003] as [number, number] },
        { name: 'Police Ward 4 Station', type: 'POL', color: 'blue', coords: [activeCenter[0] - 0.004, activeCenter[1] + 0.006] as [number, number] },
        { name: 'Fire Station headquarters', type: 'FIRE', color: 'orange', coords: [activeCenter[0] + 0.003, activeCenter[1] + 0.004] as [number, number] }
      ]
    : [];

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex justify-between items-center select-none">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-amber-500">Government Portal</span>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Radio className="w-6 h-6 text-rose-500 animate-ping" />
            <span>Incident Command Center</span>
          </h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              fetchIncidents();
              refreshDashboardStats();
            }}
            className="p-2.5 bg-slate-900 border border-white/10 rounded-xl hover:bg-slate-800 text-slate-300 transition-colors"
            title="Refresh Command States"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setWizardOpen(true)}
            className="py-2.5 px-4 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 hover:shadow-lg transition-all"
          >
            <span>Trigger Alarm</span>
          </button>
        </div>
      </div>

      {/* Manual Dispatch Alarm Wizard */}
      <AnimatePresence>
        {wizardOpen && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-950 border border-rose-500/20 max-w-md w-full rounded-2xl p-6 space-y-4"
            >
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <h3 className="font-heading font-extrabold text-sm text-white uppercase flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-500" />
                  <span>Manual Emergency Alert</span>
                </h3>
                <button onClick={() => setWizardOpen(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>
              <form onSubmit={handleManualClassify} className="space-y-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-slate-400">Incident Title</label>
                  <input
                    type="text"
                    required
                    value={wizardTitle}
                    onChange={e => setWizardTitle(e.target.value)}
                    placeholder="E.g., Major fire hazard at commercial warehouse"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400">Incident Description</label>
                  <textarea
                    required
                    rows={3}
                    value={wizardDesc}
                    onChange={e => setWizardDesc(e.target.value)}
                    placeholder="Include details about active hazards, smoke, injuries..."
                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-400">Latitude</label>
                    <input
                      type="text"
                      value={wizardLat}
                      onChange={e => setWizardLat(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400">Longitude</label>
                    <input
                      type="text"
                      value={wizardLng}
                      onChange={e => setWizardLng(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white focus:outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400">Address / Location Landmark</label>
                  <input
                    type="text"
                    value={wizardAddress}
                    onChange={e => setWizardAddress(e.target.value)}
                    placeholder="E.g., Block C, Commercial Hub, Oakland"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-tr from-rose-500 to-amber-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all"
                >
                  Analyze & Classify via AI
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 select-none">
        <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/5 backdrop-blur-md">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Active Crises</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-rose-500">{dashboardStats?.active_incidents ?? 0}</span>
            <span className="text-[9px] text-slate-400">unresolved</span>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/5 backdrop-blur-md">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Critical / Catastrophic</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-amber-500">{dashboardStats?.critical_incidents ?? 0}</span>
            <span className="text-[9px] text-rose-500 font-bold">Immediate Dispatch</span>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/5 backdrop-blur-md">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Avg SLA Response</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-white">{dashboardStats?.avg_response_time ?? '25 mins'}</span>
            <span className="text-[9px] text-emerald-500 font-bold">Optimal</span>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/5 backdrop-blur-md">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Escalated Queue</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-orange-500">{dashboardStats?.escalated_count ?? 0}</span>
            <span className="text-[9px] text-slate-400">requires overrides</span>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/5 backdrop-blur-md">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">AI Triage Precision</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-emerald-400">
              {dashboardStats ? Math.round(dashboardStats.ai_average_confidence * 100) : 95}%
            </span>
            <span className="text-[9px] text-slate-400">confidence</span>
          </div>
        </div>
      </div>

      {/* Main Split Console Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left column: Incidents Queue */}
        <div className="space-y-4">
          <div className="p-4 bg-slate-900/40 border border-white/5 backdrop-blur-md rounded-2xl space-y-3 select-none">
            <h3 className="font-heading font-extrabold text-xs text-white uppercase tracking-wider">
              Emergency Incident Queue
            </h3>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search emergencies..."
              className="w-full bg-slate-950/70 border border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-slate-200 focus:outline-none"
            />
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
            {filteredIncidents.map(inc => {
              const isActive = activeIncident?.id === inc.id;
              const sevColor = getSeverityColor(inc.severity);
              return (
                <div
                  key={inc.id}
                  onClick={() => selectIncident(inc)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isActive
                      ? 'bg-rose-500/10 border-rose-500/30'
                      : 'bg-slate-900/20 border-white/5 hover:bg-slate-900/40 hover:border-white/10'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-xs font-bold text-white block truncate">{inc.title}</span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase bg-${sevColor}-500/20 border border-${sevColor}-500/30 text-${sevColor}-300 shrink-0`}>
                      {inc.severity}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-semibold line-clamp-2 mt-1">{inc.description}</p>
                  <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 mt-3 pt-2.5 border-t border-white/5 select-none">
                    <span className="font-bold uppercase tracking-wider text-rose-500">{inc.type}</span>
                    <span>{new Date(inc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              );
            })}
            {filteredIncidents.length === 0 && (
              <div className="text-center py-12 text-slate-500 italic text-xs select-none">
                No active emergency incidents queued
              </div>
            )}
          </div>
        </div>

        {/* Right 2 columns: Active Incident Command Details */}
        <div className="lg:col-span-2 space-y-6">
          {activeIncident ? (
            <div className="space-y-6">
              
              {/* Emergency Map & Header details */}
              <div className="p-4 bg-slate-900/30 border border-white/5 rounded-2xl space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-white/5 pb-3.5 gap-2 select-none">
                  <div>
                    <h2 className="text-base font-extrabold text-white">{activeIncident.title}</h2>
                    <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                      📍 {activeIncident.address} | Ward: {activeIncident.ward}
                    </span>
                  </div>
                  <div className="flex gap-2.5">
                    <span className={`px-2.5 py-1 rounded-xl text-[9px] font-extrabold uppercase bg-${getSeverityColor(activeIncident.severity)}-500/20 border border-${getSeverityColor(activeIncident.severity)}-500/30 text-${getSeverityColor(activeIncident.severity)}-300`}>
                      {activeIncident.severity} Severity
                    </span>
                    <span className={`px-2.5 py-1 rounded-xl text-[9px] font-extrabold uppercase bg-${getPriorityColor(activeIncident.priority)}-500/20 border border-${getPriorityColor(activeIncident.priority)}-500/30 text-${getPriorityColor(activeIncident.priority)}-300`}>
                      {activeIncident.priority} Priority
                    </span>
                  </div>
                </div>

                {/* Leaflet Command Map Widget */}
                <div className="h-64 rounded-xl overflow-hidden border border-white/10 relative z-10">
                  <MapContainer
                    center={activeCenter}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={false}
                  >
                    <TileLayer
                      url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />
                    
                    {/* Pulsing incident center pin */}
                    <Marker position={activeCenter} icon={createMarkerIcon('rose')}>
                      <Popup>
                        <div className="text-xs font-bold text-slate-900">
                          <h4>{activeIncident.type} Incident</h4>
                          <p className="font-normal text-slate-600">{activeIncident.title}</p>
                        </div>
                      </Popup>
                    </Marker>
                    
                    {/* Perimeter Circle radius */}
                    <Circle
                      center={activeCenter}
                      radius={activeIncident.affected_radius_meters}
                      pathOptions={{ color: '#f43f5e', fillColor: '#f43f5e', fillOpacity: 0.15, weight: 1 }}
                    />

                    {/* Nearest Hospital/Police/Fire stations markers */}
                    {nearestFacilities.map((fac, idx) => (
                      <Marker key={idx} position={fac.coords} icon={createFacilityIcon(fac.type, fac.color)}>
                        <Popup>
                          <div className="text-xs font-bold text-slate-900">
                            <h4>{fac.name}</h4>
                            <span className="text-[9px] text-slate-500 font-semibold uppercase">{fac.type} Station</span>
                          </div>
                        </Popup>
                      </Marker>
                    ))}

                    <MapViewportController center={activeCenter} />
                  </MapContainer>
                </div>
              </div>

              {/* Grid: AI reasoning and Manual Override */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none">
                
                {/* AI Reasoning Panel */}
                <div className="p-5 bg-slate-900/40 border border-white/5 backdrop-blur-md rounded-2xl space-y-4">
                  <h3 className="font-heading font-extrabold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Brain className="w-4 h-4 text-amber-500" />
                    <span>AI Reasoning Analysis</span>
                  </h3>
                  <div className="bg-slate-950 p-4 border border-white/5 rounded-xl text-xs font-semibold space-y-3 leading-relaxed text-slate-300">
                    <p>{activeIncident.ai_reasoning}</p>
                    <div className="pt-2 border-t border-white/5 space-y-2 select-none">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Suggested Agencies:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {activeIncident.suggested_departments?.map((d, dIdx) => (
                          <span key={dIdx} className="px-2 py-0.5 bg-slate-900 border border-white/5 rounded-lg text-[9px] font-bold text-slate-400">
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Overrides & Triaging panel */}
                <div className="p-5 bg-slate-900/40 border border-white/5 backdrop-blur-md rounded-2xl space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-heading font-extrabold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Settings className="w-4 h-4 text-emerald-500" />
                      <span>Command Verification</span>
                    </h3>
                    <button
                      onClick={() => setShowOverridePanel(!showOverridePanel)}
                      className="text-[10px] font-bold text-emerald-500 hover:text-emerald-400 bg-transparent border-0 cursor-pointer"
                    >
                      {showOverridePanel ? 'Cancel' : 'Triage Override'}
                    </button>
                  </div>

                  {showOverridePanel ? (
                    <div className="space-y-4 text-xs font-semibold">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-slate-400 text-[10px]">Severity</label>
                          <select
                            value={overrideSeverity}
                            onChange={e => setOverrideSeverity(e.target.value as any)}
                            className="w-full bg-slate-950 border border-white/10 rounded-xl p-2 text-white text-[11px] focus:outline-none"
                          >
                            {['Minor', 'Moderate', 'High', 'Critical', 'Catastrophic'].map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-400 text-[10px]">Priority</label>
                          <select
                            value={overridePriority}
                            onChange={e => setOverridePriority(e.target.value as any)}
                            className="w-full bg-slate-950 border border-white/10 rounded-xl p-2 text-white text-[11px] focus:outline-none"
                          >
                            {['Low', 'Medium', 'High', 'Urgent', 'Emergency', 'Critical'].map(p => (
                              <option key={p} value={p}>{p}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-400 text-[10px]">Affected Radius (meters)</label>
                        <input
                          type="number"
                          value={overrideRadius}
                          onChange={e => setOverrideRadius(Number(e.target.value))}
                          className="w-full bg-slate-950 border border-white/10 rounded-xl p-2 text-white text-[11px] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-slate-400 text-[10px]">Verify Departments</label>
                        <div className="flex flex-wrap gap-1.5">
                          {['Fire Department', 'Police', 'Disaster Management', 'Water Department', 'Environmental Department', 'Medical Services', 'Traffic Police'].map(d => {
                            const selected = overrideDepts.includes(d);
                            return (
                              <button
                                key={d}
                                onClick={() => toggleDept(d)}
                                className={`px-2 py-1 rounded-lg text-[9px] font-bold border transition-colors cursor-pointer ${
                                  selected 
                                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' 
                                    : 'bg-slate-950 border-white/5 text-slate-500'
                                }`}
                              >
                                {d}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <button
                        onClick={handleOverrideSave}
                        className="w-full py-2.5 bg-emerald-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all"
                      >
                        Override & Verify
                      </button>
                    </div>
                  ) : (
                    <div className="bg-slate-950 p-4 border border-white/5 rounded-xl space-y-3 text-xs font-semibold leading-relaxed">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Triage Verification</span>
                        <span className="text-emerald-500 font-extrabold uppercase">Verified</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Radius Perimeter</span>
                        <span className="text-white">{activeIncident.affected_radius_meters} meters</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Escalation Phase</span>
                        <span className="text-orange-500">Level {activeIncident.escalation_level}</span>
                      </div>
                      <div className="pt-2 border-t border-white/5 flex gap-2 justify-between items-center text-[10px]">
                        <span className="text-slate-500">Incident Class</span>
                        <span className="px-2 py-0.5 bg-slate-900 border border-white/5 rounded-lg text-rose-500 font-extrabold uppercase">
                          {activeIncident.type}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Playbook Dispatch Center */}
              <div className="p-5 bg-slate-900/40 border border-white/5 backdrop-blur-md rounded-2xl space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-2 border-b border-white/5 gap-2 select-none">
                  <h3 className="font-heading font-extrabold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-4.5 h-4.5 text-rose-500" />
                    <span>Emergency Playbook Dispatcher</span>
                  </h3>
                  <div className="flex gap-2">
                    <select
                      value={selectedPlaybook}
                      onChange={e => setSelectedPlaybook(e.target.value)}
                      className="bg-slate-950 border border-white/10 rounded-xl py-1 px-3 text-[10px] font-bold text-slate-300 focus:outline-none"
                    >
                      {playbooks.map(p => (
                        <option key={p.name} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                    {activeIncident.status === 'Reported' && (
                      <button
                        onClick={handleRespond}
                        className="py-1.5 px-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-[10px] uppercase tracking-wider border-0 cursor-pointer transition-colors"
                      >
                        Deploy Playbook
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Actions SOP checklist */}
                  <div className="md:col-span-2 space-y-3">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest select-none block">Immediate SOP Checklist</span>
                    <div className="space-y-2">
                      {currentPlaybook.actions.map((act) => {
                        const checked = playbookChecklist[act] || false;
                        return (
                          <div
                            key={act}
                            onClick={() => setPlaybookChecklist({ ...playbookChecklist, [act]: !checked })}
                            className="flex items-center gap-3 p-3 bg-slate-950 border border-white/5 hover:border-rose-500/25 rounded-xl cursor-pointer select-none transition-colors"
                          >
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                              checked ? 'bg-rose-500 border-rose-500 text-white' : 'border-slate-700 bg-slate-900'
                            }`}>
                              {checked && <Check className="w-3 h-3" />}
                            </div>
                            <span className="text-xs font-semibold text-slate-300 leading-none">{act}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Playbook Details */}
                  <div className="p-4 bg-slate-950 border border-white/5 rounded-xl space-y-3 select-none text-xs font-semibold">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Operational resources</span>
                    <div className="space-y-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Responsible Departments</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {currentPlaybook.depts.map(d => (
                            <span key={d} className="px-1.5 py-0.5 bg-slate-900 border border-white/5 rounded text-[8px] font-bold text-slate-400">
                              {d}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Required Assets</span>
                        <p className="text-[11px] text-rose-300 font-extrabold mt-0.5">{currentPlaybook.resources}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resources & Timeline split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none">
                
                {/* Responder Teams */}
                <div className="p-5 bg-slate-900/40 border border-white/5 backdrop-blur-md rounded-2xl space-y-4">
                  <h3 className="font-heading font-extrabold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-4.5 h-4.5 text-blue-500" />
                    <span>Allocated Responder Teams</span>
                  </h3>
                  <div className="space-y-3.5">
                    {allocatedResources.map(res => (
                      <div key={res.id} className="flex justify-between items-center p-3 bg-slate-950 border border-white/5 rounded-xl text-xs font-semibold">
                        <div>
                          <span className="font-extrabold text-white block">{res.name}</span>
                          <span className="text-[9px] text-slate-500 font-bold uppercase">{res.type}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          res.status === 'Dispatched' 
                            ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400' 
                            : res.status === 'On Site' 
                            ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400' 
                            : 'bg-slate-900 border border-white/5 text-slate-500'
                        }`}>
                          {res.status}
                        </span>
                      </div>
                    ))}
                    {allocatedResources.length === 0 && (
                      <div className="text-center py-8 text-slate-500 italic text-xs select-none">
                        No resources dispatched for this incident
                      </div>
                    )}
                  </div>
                </div>

                {/* Operations Timeline logs */}
                <div className="p-5 bg-slate-900/40 border border-white/5 backdrop-blur-md rounded-2xl space-y-4">
                  <h3 className="font-heading font-extrabold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-4.5 h-4.5 text-orange-500" />
                    <span>Incident Operational Timeline</span>
                  </h3>
                  <div className="relative pl-4 space-y-5 border-l border-white/5 ml-1">
                    {timelineEvents.map((evt) => (
                      <div key={evt.id} className="relative space-y-1">
                        <div className="absolute left-[-21px] top-[2px] w-2.5 h-2.5 rounded-full bg-slate-950 border-2 border-orange-500 shadow" />
                        <div className="flex justify-between items-baseline select-none">
                          <span className="text-xs font-extrabold text-white">{evt.event}</span>
                          <span className="text-[8px] font-mono text-slate-500">
                            {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-450 font-semibold leading-normal">{evt.note}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-slate-900/10 border border-white/5 rounded-3xl p-6 select-none">
              <Shield className="w-12 h-12 text-slate-500 mb-4 animate-pulse" />
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">No Selected incident</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1 leading-normal">
                Choose an emergency from the queue to pan the viewport, review RAG analysis, verify parameters, or dispatch response playbooks.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
export default EmergencyDashboardPage;
