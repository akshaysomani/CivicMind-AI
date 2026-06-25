import React, { useState, useEffect, useRef } from 'react';
import { useHealthcare } from '../../context/HealthcareContext';
import { useNotifications } from '../../context/NotificationContext';
import { 
  Heart, MapPin, AlertTriangle, Shield, Syringe, Clipboard, Phone, 
  Search, Loader2, Navigation, Compass, Info, 
  Send, BookOpen, CheckCircle, TrendingUp, RefreshCw, Activity, Map
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap as useLeafletMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default Leaflet icon paths in Vite builds
const defaultIcon = L.divIcon({
  html: `
    <div class="relative flex items-center justify-center">
      <div class="absolute w-8 h-8 bg-emerald-500/25 rounded-full animate-ping"></div>
      <div class="relative w-6 h-6 bg-emerald-600 rounded-full border-2 border-white shadow-xl flex items-center justify-center">
        <span class="text-[10px] text-white">🏥</span>
      </div>
    </div>
  `,
  className: 'custom-facility-marker-div',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const activeIcon = L.divIcon({
  html: `
    <div class="relative flex items-center justify-center">
      <div class="absolute w-10 h-10 bg-rose-500/30 rounded-full animate-ping"></div>
      <div class="relative w-8 h-8 bg-rose-600 rounded-full border-2 border-white shadow-2xl flex items-center justify-center animate-bounce">
        <span class="text-xs">🏥</span>
      </div>
    </div>
  `,
  className: 'custom-facility-marker-active',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// Leaflet Map Controller to fly to center coordinates
const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useLeafletMap();
  useEffect(() => {
    map.flyTo(center, zoom, { animate: true, duration: 1.5 });
  }, [center, zoom, map]);
  return null;
};

export const HealthcarePage: React.FC = () => {
  const { showNotification } = useNotifications();
  const {
    facilities,
    advisories,
    programs,
    resources,
    chatMessages,
    activeFacility,
    isLoading,
    analytics,
    searchFacilities,
    setActiveFacility,
    sendChatMessage,
    escalateMedicalEmergency,
    clearChat,
    recordAdvisoryView
  } = useHealthcare();

  const [activeTab, setActiveTab] = useState<'assistant' | 'map' | 'advisories' | 'programs' | 'resources' | 'analytics'>('assistant');
  const [facilitySearchType, setFacilitySearchType] = useState<string>('All');
  const [searchRadius, setSearchRadius] = useState<number>(10);
  const [chatInput, setChatInput] = useState<string>('');
  
  // Escalation state
  const [isEscalating, setIsEscalating] = useState<boolean>(false);
  const [escalationForm, setEscalationForm] = useState({
    title: '',
    description: '',
    latitude: 37.7749,
    longitude: -122.4194,
    address: '',
    ward: ''
  });

  // Checklist for advisory cards
  const [advisoryChecks, setAdvisoryChecks] = useState<Record<number, Record<string, boolean>>>({});

  // Chat window bottom anchor ref
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;
    const text = chatInput.trim();
    setChatInput('');
    await sendChatMessage(text);
  };

  const handleQuickAction = async (text: string) => {
    await sendChatMessage(text);
  };

  const triggerEscalationFlow = (title: string, desc: string) => {
    setEscalationForm({
      title: title || 'Severe Medical Request',
      description: desc || 'Citizen reported severe symptoms through health portal.',
      latitude: 37.7749,
      longitude: -122.4194,
      address: 'Market St, San Francisco, CA',
      ward: 'Ward 4 - Mission'
    });
    setIsEscalating(true);
  };

  const handleEscalationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await escalateMedicalEmergency(escalationForm);
      setIsEscalating(false);
      showNotification('Emergency ambulance request has been broadcast to disaster control.', 'success');
    } catch {
      showNotification('Could not submit emergency request.', 'error');
    }
  };

  const handleCheckAdvisoryItem = (advId: number, item: string) => {
    setAdvisoryChecks(prev => {
      const adv = prev[advId] || {};
      return {
        ...prev,
        [advId]: {
          ...adv,
          [item]: !adv[item]
        }
      };
    });
  };

  const getAdvisoryCompletion = (adv: any) => {
    const checks = advisoryChecks[adv.id] || {};
    const total = adv.checklist.length;
    const completed = adv.checklist.filter((item: string) => checks[item]).length;
    return {
      percentage: Math.round((completed / total) * 100),
      count: `${completed}/${total}`
    };
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 pb-24">
      {/* ── Title Section ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-medium mb-1">
            <Activity className="w-4 h-4 animate-pulse" />
            <span>Public Safety & Public Health Hub</span>
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-200 to-emerald-500 font-heading">
            Healthcare & Public Health Intelligence
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Triage medical inquiries, check vaccination schedules, explore local clinics and pharmacies, and monitor real-time health alerts.
          </p>
        </div>

        {/* Global Urgent Contact Trigger */}
        <div className="flex gap-2">
          <button 
            onClick={() => triggerEscalationFlow('Urgent Cardiac Distress', 'Citizen reported acute chest pressure and trouble breathing.')}
            className="px-4 py-2 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white rounded-xl shadow-lg border border-red-500/20 font-medium flex items-center gap-2 transform active:scale-95 transition-all text-sm"
          >
            <Phone className="w-4 h-4 animate-bounce" />
            <span>Request Ambulance dispatch</span>
          </button>
        </div>
      </div>

      {/* ── Tabs Navigation ────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap border-b border-white/5 gap-1 mb-6">
        {[
          { id: 'assistant', label: 'AI Health Assistant', icon: Heart },
          { id: 'map', label: 'Medical Facility Locator', icon: Map },
          { id: 'advisories', label: 'Public Health Advisories', icon: AlertTriangle },
          { id: 'programs', label: 'Vaccination & Welfare Programs', icon: Syringe },
          { id: 'resources', label: 'First Aid & Health FAQ', icon: Clipboard },
          { id: 'analytics', label: 'Public Health Analytics', icon: TrendingUp },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                if (tab.id === 'advisories') recordAdvisoryView();
              }}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-300 ${
                isActive 
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5' 
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Main Tab Contents ──────────────────────────────────────────────────── */}
      <div className="w-full">
        <AnimatePresence mode="wait">
          {/* Tab 1: AI Health Assistant (Chat) */}
          {activeTab === 'assistant' && (
            <motion.div
              key="assistant"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-4 gap-6"
            >
              {/* Left pane: Guidelines list & Disclaimer */}
              <div className="lg:col-span-1 flex flex-col gap-6">
                {/* Medical Safety Disclaimer Card */}
                <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/5 p-5 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl"></div>
                  <div className="flex items-center gap-2.5 text-rose-400 font-semibold mb-3">
                    <Shield className="w-5 h-5 flex-shrink-0" />
                    <span>Medical Safety Policy</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    This assistant uses artificial intelligence to search public health advisories, preventative schedules, and first-aid databases. 
                  </p>
                  <div className="my-3 border-t border-white/5"></div>
                  <ul className="space-y-2 text-[11px] text-slate-400">
                    <li className="flex items-start gap-1.5">
                      <span className="text-rose-500">•</span>
                      <span>Never provides chemical diagnosis or drug prescriptions.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-rose-500">•</span>
                      <span>Cannot replace certified primary care consultation.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-rose-500">•</span>
                      <span>Detects severe emergencies and unlocks immediate paramedic dispatch coordinates.</span>
                    </li>
                  </ul>
                </div>

                {/* Quick actions cards */}
                <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/5 p-5">
                  <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-emerald-400" />
                    <span>Quick Health Actions</span>
                  </h3>
                  <div className="flex flex-col gap-2">
                    {[
                      'Where is the nearest hospital?',
                      'What is the child vaccination calendar?',
                      'Give first aid tips for burns',
                      'Active heatwave hydration tips',
                      'What are maternal welfare benefits?'
                    ].map((act, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickAction(act)}
                        className="text-left w-full p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-emerald-500/30 text-xs text-slate-300 hover:text-emerald-300 hover:bg-emerald-500/5 transition-all duration-200"
                      >
                        {act}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Chat Interface Box */}
              <div className="lg:col-span-3 bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/5 p-4 flex flex-col h-[650px] shadow-2xl relative overflow-hidden">
                {/* Chat header */}
                <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-slate-200">AI Medical Advisory Agent</h2>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span className="text-[10px] text-emerald-400">Compliant Health Guardrails active</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={clearChat}
                    className="p-1.5 hover:bg-white/5 text-slate-400 hover:text-slate-200 rounded-lg text-xs flex items-center gap-1 transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Clear chat</span>
                  </button>
                </div>

                {/* Messages feed */}
                <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-sm scrollbar-thin">
                  {chatMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 max-w-md mx-auto">
                      <Heart className="w-12 h-12 text-slate-600 mb-4 animate-pulse" />
                      <p className="font-medium text-slate-200 mb-1">Begin Chat with Health Assistant</p>
                      <p className="text-xs">
                        Ask about vaccination records, first-aid steps, active public alerts, or list nearby doctors. 
                      </p>
                    </div>
                  ) : (
                    chatMessages.map(msg => (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl p-4 leading-relaxed text-xs shadow-md border ${
                            msg.sender === 'user'
                              ? 'bg-emerald-600 text-white border-emerald-500/20 rounded-tr-none'
                              : 'bg-slate-800 text-slate-200 border-white/5 rounded-tl-none'
                          }`}
                        >
                          {/* Confidence index indicator */}
                          {msg.sender === 'agent' && msg.confidence !== undefined && (
                            <div className="flex items-center justify-between gap-4 text-[9px] text-slate-400 mb-2 border-b border-white/5 pb-1">
                              <div className="flex items-center gap-1">
                                <Shield className="w-3 h-3 text-emerald-400" />
                                <span>Agent Triage confidence: <b>{Math.round(msg.confidence * 100)}%</b></span>
                              </div>
                            </div>
                          )}

                          {/* Message Content */}
                          <div className="whitespace-pre-line text-slate-200 leading-relaxed font-sans">
                            {msg.text}
                          </div>

                          {/* RAG Reference Citation list */}
                          {msg.sender === 'agent' && msg.knowledgeSources && msg.knowledgeSources.length > 0 && (
                            <div className="mt-3 border-t border-white/5 pt-2">
                              <span className="text-[9px] text-slate-400 block mb-1">Knowledge citation sources:</span>
                              <div className="flex flex-wrap gap-1.5">
                                {msg.knowledgeSources.map((s, idx) => (
                                  <span key={idx} className="px-2 py-0.5 bg-slate-900 border border-white/5 text-[9px] text-teal-300 rounded-full font-mono">
                                    📖 {s.title}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Critical Emergency Alert Banner */}
                        {msg.sender === 'agent' && msg.isEmergencyEscalated && (
                          <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="mt-3 p-4 bg-gradient-to-r from-red-950/70 to-rose-900/60 border border-red-500/30 rounded-xl max-w-[85%] shadow-lg flex items-start gap-3"
                          >
                            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 animate-bounce" />
                            <div>
                              <h4 className="text-xs font-semibold text-rose-200 mb-0.5">Critical Emergency Detected</h4>
                              <p className="text-[11px] text-rose-300 leading-relaxed mb-2.5">
                                AI triage warns of critical cardiac or respiratory hazards. Confirm request for immediate paramedic response dispatch.
                              </p>
                              <button
                                onClick={() => triggerEscalationFlow(
                                  'AI Detected Health Emergency',
                                  'Automated classification detected critical symptoms: ' + chatMessages[chatMessages.length - 2]?.text
                                )}
                                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[10px] font-semibold flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                              >
                                <Navigation className="w-3.5 h-3.5" />
                                <span>Escalate Medical Incident Now</span>
                              </button>
                            </div>
                          </motion.div>
                        )}
                        <span className="text-[9px] text-slate-500 mt-1 px-1">
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                  <div ref={chatBottomRef} />
                </div>

                {/* Input Panel */}
                <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    placeholder="Search symptoms, ask first aid guidelines, or request doctor locations..."
                    className="flex-1 bg-slate-800 border border-white/5 focus:border-emerald-500/50 rounded-xl px-4 py-3 text-xs focus:outline-none transition-all placeholder:text-slate-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg transform active:scale-95 transition-all flex items-center justify-center font-medium border border-emerald-500/20"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* Tab 2: Medical Facility Locator */}
          {activeTab === 'map' && (
            <motion.div
              key="map"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Sidebar Filters & Lists */}
              <div className="lg:col-span-4 bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/5 p-4 flex flex-col h-[650px]">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                    <Search className="w-4 h-4 text-emerald-400" />
                    <span>Search Medical Services</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">Facility Type</label>
                      <select
                        value={facilitySearchType}
                        onChange={e => {
                          setFacilitySearchType(e.target.value);
                          searchFacilities(e.target.value, searchRadius, 37.7749, -122.4194);
                        }}
                        className="w-full bg-slate-800 border border-white/5 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none"
                      >
                        <option value="All">All Facilities</option>
                        <option value="Hospital">Hospitals</option>
                        <option value="Clinic">Clinics</option>
                        <option value="Pharmacy">Pharmacies</option>
                        <option value="Blood Bank">Blood Banks</option>
                        <option value="Diagnostic Center">Diagnostic Labs</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">Search Radius</label>
                      <select
                        value={searchRadius}
                        onChange={e => {
                          setSearchRadius(parseInt(e.target.value));
                          searchFacilities(facilitySearchType, parseInt(e.target.value), 37.7749, -122.4194);
                        }}
                        className="w-full bg-slate-800 border border-white/5 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none"
                      >
                        <option value={2}>2 Kilometers</option>
                        <option value={5}>5 Kilometers</option>
                        <option value={10}>10 Kilometers</option>
                        <option value={20}>20 Kilometers</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Active geolocation reminder */}
                  <div className="flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-2.5 text-[10px] text-emerald-400">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 animate-pulse" />
                    <span>Centered around citizen coordinates (San Francisco)</span>
                  </div>
                </div>

                {/* Facilities List */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                  {isLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                    </div>
                  ) : facilities.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                      <Info className="w-8 h-8 text-slate-600 mb-2" />
                      <p className="text-xs">No facilities found matching filters.</p>
                    </div>
                  ) : (
                    facilities.map(fac => {
                      const isActive = activeFacility?.id === fac.id;
                      return (
                        <div
                          key={fac.id}
                          onClick={() => setActiveFacility(fac)}
                          className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all duration-300 ${
                            isActive
                              ? 'bg-emerald-500/10 border-emerald-500 shadow-md'
                              : 'bg-slate-800/40 border-white/5 hover:border-emerald-500/30'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1.5">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-semibold ${
                              fac.type === 'Hospital' ? 'bg-red-500/10 text-red-400 border border-red-500/10' :
                              fac.type === 'Clinic' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' :
                              fac.type === 'Pharmacy' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/10' :
                              'bg-amber-500/10 text-amber-400 border border-amber-500/10'
                            }`}>
                              {fac.type}
                            </span>
                            {fac.distance_km !== undefined && (
                              <span className="text-[10px] text-slate-400 block font-mono">
                                🚗 {fac.distance_km} km ({fac.estimated_travel_time_minutes} mins)
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-slate-200 text-sm mb-1">{fac.name}</h4>
                          <p className="text-slate-400 text-[11px] mb-2">{fac.address}</p>
                          <p className="text-[11px] text-slate-300 leading-normal italic mb-2">"{fac.details}"</p>
                          
                          {/* Services lists */}
                          <div className="flex flex-wrap gap-1.5 mt-2.5">
                            {fac.services.map((srv, idx) => (
                              <span key={idx} className="px-1.5 py-0.5 bg-slate-900 border border-white/5 text-[9px] text-slate-400 rounded">
                                {srv}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Leaflet Map Area */}
              <div className="lg:col-span-8 bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/5 h-[650px] shadow-2xl overflow-hidden relative">
                <MapContainer
                  center={[37.7749, -122.4194]}
                  zoom={12.5}
                  scrollWheelZoom={true}
                  className="w-full h-full z-0"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  />
                  {facilities.map(fac => (
                    <Marker
                      key={fac.id}
                      position={[fac.latitude, fac.longitude]}
                      icon={activeFacility?.id === fac.id ? activeIcon : defaultIcon}
                      eventHandlers={{
                        click: () => setActiveFacility(fac)
                      }}
                    >
                      <Popup className="custom-leaflet-popup">
                        <div className="text-xs p-1 text-slate-900 font-sans">
                          <h4 className="font-bold text-sm mb-0.5">{fac.name}</h4>
                          <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 font-semibold text-[8px] rounded uppercase block w-max mb-1.5">
                            {fac.type}
                          </span>
                          <p className="text-slate-600 mb-1">{fac.address}</p>
                          <p className="text-slate-800 font-medium mb-1">📞 {fac.contact}</p>
                          <div className="flex gap-1.5 flex-wrap mt-1">
                            {fac.services.slice(0, 3).map((s, i) => (
                              <span key={i} className="px-1 bg-slate-100 border border-slate-200 text-[9px] text-slate-600 rounded">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                  
                  {activeFacility && (
                    <MapController center={[activeFacility.latitude, activeFacility.longitude]} zoom={15} />
                  )}
                </MapContainer>
                
                {/* Floating Map Navigation Card overlay */}
                {activeFacility && (
                  <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-xl border border-white/10 p-4 rounded-xl shadow-2xl z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-3"
                  >
                    <div>
                      <span className="text-[9px] font-semibold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/10 uppercase mb-1.5 inline-block">
                        Navigation Coordinates Active
                      </span>
                      <h3 className="text-sm font-bold text-slate-200">{activeFacility.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{activeFacility.address}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {activeFacility.distance_km !== undefined && (
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 block">Estimated travel</span>
                          <span className="text-xs font-mono text-emerald-300 font-bold">{activeFacility.distance_km} km ({activeFacility.estimated_travel_time_minutes} mins)</span>
                        </div>
                      )}
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${activeFacility.latitude},${activeFacility.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Google Route Guide</span>
                      </a>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* Tab 3: Public Health Advisories */}
          {activeTab === 'advisories' && (
            <motion.div
              key="advisories"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {advisories.map(adv => {
                const isCritical = adv.severity === 'High' || adv.severity === 'Critical';
                const completion = getAdvisoryCompletion(adv);
                return (
                  <div
                    key={adv.id}
                    className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/5 p-5 shadow-xl relative overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      {/* Advisory title and badge */}
                      <div className="flex justify-between items-start mb-4 gap-3">
                        <div>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase mb-1.5 inline-block border ${
                            isCritical
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/10'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/10'
                          }`}>
                            {adv.severity} Severity Alert
                          </span>
                          <h3 className="text-lg font-bold text-slate-100">{adv.title}</h3>
                        </div>
                        <AlertTriangle className={`w-8 h-8 flex-shrink-0 ${
                          isCritical ? 'text-rose-500 animate-pulse' : 'text-amber-500'
                        }`} />
                      </div>
                      <p className="text-xs text-slate-300 mb-4 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
                        {adv.summary}
                      </p>

                      {/* Interactive safety checklists */}
                      <div className="mb-4">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Safety Precaution Checklist</span>
                        <div className="space-y-2">
                          {adv.checklist.map((item, idx) => {
                            const isChecked = advisoryChecks[adv.id]?.[item] || false;
                            return (
                              <div
                                key={idx}
                                onClick={() => handleCheckAdvisoryItem(adv.id, item)}
                                className={`flex items-start gap-3 p-2.5 rounded-lg border text-xs cursor-pointer transition-all duration-200 ${
                                  isChecked
                                    ? 'bg-emerald-500/5 border-emerald-500/30 text-slate-300'
                                    : 'bg-slate-800/20 border-transparent text-slate-400 hover:border-white/5'
                                }`}
                              >
                                <div className={`w-4 h-4 rounded mt-0.5 border flex items-center justify-center flex-shrink-0 ${
                                  isChecked ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-600 bg-slate-900'
                                }`}>
                                  {isChecked && <CheckCircle className="w-3.5 h-3.5" />}
                                </div>
                                <span className={isChecked ? 'line-through text-slate-500' : ''}>{item}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Progress tracking gauge */}
                    <div className="border-t border-white/5 pt-3 mt-4 flex items-center justify-between">
                      <div className="flex-1 mr-4">
                        <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                          <span>Precaution preparedness progress</span>
                          <span className="font-mono">{completion.count} completed</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${completion.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-400 font-mono">{completion.percentage}%</span>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}

          {/* Tab 4: Vaccination & Welfare Programs */}
          {activeTab === 'programs' && (
            <motion.div
              key="programs"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {programs.map(prog => (
                <div
                  key={prog.id}
                  className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/5 p-5 shadow-xl relative overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/10 text-emerald-400 text-[9px] font-semibold rounded">
                        {prog.category}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-100 mb-2">{prog.title}</h3>
                    <p className="text-xs text-slate-400 mb-4 leading-normal">{prog.description}</p>
                    
                    {/* Render vaccine schedule matrix if available */}
                    {prog.schedule && (
                      <div className="space-y-2 mt-4 bg-slate-950/60 p-3 rounded-xl border border-white/5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 border-b border-white/5 pb-1">
                          Recommended Vaccination Milestones
                        </span>
                        <div className="space-y-1.5">
                          {prog.schedule.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-xs py-1 border-b border-white/5 last:border-b-0">
                              <span className="text-slate-300 font-medium">{item.age}</span>
                              <div className="flex gap-1 flex-wrap justify-end">
                                {item.vaccines.map((v, i) => (
                                  <span key={i} className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] rounded font-mono border border-emerald-500/5">
                                    {v}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Render benefits list if available */}
                    {prog.benefits && (
                      <div className="space-y-2.5 mt-4 bg-slate-950/60 p-3.5 rounded-xl border border-white/5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 border-b border-white/5 pb-1">
                          Financial & Wellness Benefits
                        </span>
                        <ul className="space-y-2">
                          {prog.benefits.map((benefit, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-slate-300 leading-normal">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleQuickAction(`Tell me more about ${prog.title}`)}
                    className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700/60 border border-white/5 text-slate-200 text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Inquire with AI Agent</span>
                  </button>
                </div>
              ))}
            </motion.div>
          )}

          {/* Tab 5: First Aid & Health FAQ */}
          {activeTab === 'resources' && (
            <motion.div
              key="resources"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {resources.map(res => (
                <div
                  key={res.id}
                  className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/5 p-5 shadow-xl relative overflow-hidden"
                >
                  <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/10 text-emerald-400 text-[9px] font-semibold rounded mb-3 inline-block">
                    {res.category}
                  </span>
                  <h3 className="text-lg font-bold text-slate-100 mb-3">{res.title}</h3>
                  <div className="space-y-3">
                    {res.details.map((item, idx) => (
                      <div key={idx} className="bg-slate-950/60 p-3.5 rounded-xl border border-white/5">
                        {item.scenario && (
                          <>
                            <h4 className="text-xs font-bold text-emerald-400 mb-1">🚑 Scenario: {item.scenario}</h4>
                            <p className="text-xs text-slate-300 leading-normal">{item.instructions}</p>
                          </>
                        )}
                        {item.preventive_measure && (
                          <>
                            <h4 className="text-xs font-bold text-teal-400 mb-1">🛡️ Focus: {item.preventive_measure}</h4>
                            <p className="text-xs text-slate-300 leading-normal">{item.instructions}</p>
                          </>
                        )}
                        {item.resource && (
                          <div className="flex flex-col gap-1.5 md:flex-row justify-between items-start md:items-center">
                            <div>
                              <h4 className="text-xs font-bold text-slate-200">{item.resource}</h4>
                              <p className="text-[11px] text-slate-400">{item.description}</p>
                            </div>
                            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold rounded-lg whitespace-nowrap">
                              📞 {item.number}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Tab 6: Public Health Analytics */}
          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Analytics Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { title: 'Triage Query Volume', value: analytics.queriesCount, icon: Heart, desc: 'Total AI wellness queries today', color: 'text-emerald-400 bg-emerald-500/5' },
                  { title: 'Facility Searches', value: analytics.facilitySearchesCount, icon: MapPin, desc: 'Medical location lookup counts', color: 'text-blue-400 bg-blue-500/5' },
                  { title: 'Critical Escalations', value: analytics.emergencyEscalationsCount, icon: AlertTriangle, desc: 'Ambulance dispatches triggered', color: 'text-rose-400 bg-rose-500/5 animate-pulse' },
                  { title: 'Advisory Views', value: analytics.advisoryViewsCount, icon: Clipboard, desc: 'Safety precaution lookups logged', color: 'text-amber-400 bg-amber-500/5' },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-5 shadow-xl flex items-center justify-between"
                    >
                      <div>
                        <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider block mb-1">
                          {item.title}
                        </span>
                        <span className="text-3xl font-extrabold text-slate-100 font-mono">{item.value}</span>
                        <span className="text-[10px] text-slate-400 block mt-1">{item.desc}</span>
                      </div>
                      <div className={`w-12 h-12 rounded-xl border border-white/5 flex items-center justify-center ${item.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Graphical simulation widgets */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Satisfaction widget */}
                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-200 mb-1.5 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>Citizen Satisfaction Rating</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Percentage of users rating public health triage guidelines as helpful.
                    </p>
                  </div>
                  <div className="my-6 flex flex-col items-center">
                    <span className="text-5xl font-extrabold text-slate-100 font-mono mb-2">{analytics.satisfactionRate}%</span>
                    <div className="flex gap-2">
                      <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded text-[9px]">
                        Target 90%+
                      </span>
                      <span className="px-2 py-0.5 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded text-[9px]">
                        Optimal Level
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full" style={{ width: `${analytics.satisfactionRate}%` }}></div>
                  </div>
                </div>

                {/* Facility Hits Breakdown */}
                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-5 shadow-xl col-span-2">
                  <h4 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span>Discovered Facilities Categories</span>
                  </h4>
                  <div className="space-y-3.5 mt-2">
                    {[
                      { type: 'Hospitals Discovered', pct: 45, count: 22, color: 'bg-red-500' },
                      { type: 'Clinics Discovered', pct: 30, count: 14, color: 'bg-emerald-500' },
                      { type: 'Pharmacies Discovered', pct: 15, count: 8, color: 'bg-blue-500' },
                      { type: 'Blood Banks & Diagnostic Centers', pct: 10, count: 4, color: 'bg-amber-500' }
                    ].map((bar, idx) => (
                      <div key={idx} className="text-xs">
                        <div className="flex justify-between text-slate-300 mb-1">
                          <span>{bar.type}</span>
                          <span className="font-mono text-slate-400">{bar.count} hits ({bar.pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div className={`${bar.color} h-full rounded-full`} style={{ width: `${bar.pct}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Direct Escalation Modal ────────────────────────────────────────────── */}
      <AnimatePresence>
        {isEscalating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative"
            >
              <h3 className="text-lg font-bold text-rose-400 flex items-center gap-2 mb-2 font-heading">
                <AlertTriangle className="w-5 h-5 text-rose-500 animate-pulse" />
                <span>Confirm Paramedic & Emergency Dispatch</span>
              </h3>
              <p className="text-xs text-slate-400 mb-4 leading-normal">
                This triggers a priority ambulance dispatch to your coordinates. Dispatched units will be routed via the emergency response channel immediately.
              </p>

              <form onSubmit={handleEscalationSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Emergency Title</label>
                  <input
                    type="text"
                    required
                    value={escalationForm.title}
                    onChange={e => setEscalationForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-slate-800 border border-white/5 rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-rose-500/50"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Details / Symptoms Description</label>
                  <textarea
                    required
                    rows={3}
                    value={escalationForm.description}
                    onChange={e => setEscalationForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-slate-800 border border-white/5 rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-rose-500/50 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={escalationForm.latitude}
                      onChange={e => setEscalationForm(prev => ({ ...prev, latitude: parseFloat(e.target.value) }))}
                      className="w-full bg-slate-800 border border-white/5 rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-rose-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={escalationForm.longitude}
                      onChange={e => setEscalationForm(prev => ({ ...prev, longitude: parseFloat(e.target.value) }))}
                      className="w-full bg-slate-800 border border-white/5 rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-rose-500/50"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Incident Address</label>
                    <input
                      type="text"
                      required
                      value={escalationForm.address}
                      onChange={e => setEscalationForm(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full bg-slate-800 border border-white/5 rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-rose-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Ward Name</label>
                    <input
                      type="text"
                      required
                      value={escalationForm.ward}
                      onChange={e => setEscalationForm(prev => ({ ...prev, ward: e.target.value }))}
                      className="w-full bg-slate-800 border border-white/5 rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-rose-500/50"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsEscalating(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                  >
                    {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Confirm Dispatch</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HealthcarePage;
