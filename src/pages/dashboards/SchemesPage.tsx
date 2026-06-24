import React, { useState, useEffect, useRef } from 'react';
import { useSchemes } from '../../context/SchemeContext';
import { useNotifications } from '../../context/NotificationContext';
import { 
  Landmark, Search, Loader2, Navigation, MapPin, 
  CheckCircle, Award, TrendingUp, RefreshCw, Compass,
  Clipboard, Shield, Send, Table, Check, Bookmark, BookmarkCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap as useLeafletMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default Leaflet icon paths in Vite builds
const defaultIcon = L.divIcon({
  html: `
    <div class="relative flex items-center justify-center">
      <div class="absolute w-8 h-8 bg-blue-500/25 rounded-full animate-ping"></div>
      <div class="relative w-6 h-6 bg-blue-600 rounded-full border-2 border-white shadow-xl flex items-center justify-center">
        <span class="text-[10px] text-white">🏛️</span>
      </div>
    </div>
  `,
  className: 'custom-office-marker-div',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const activeIcon = L.divIcon({
  html: `
    <div class="relative flex items-center justify-center">
      <div class="absolute w-10 h-10 bg-amber-500/30 rounded-full animate-ping"></div>
      <div class="relative w-8 h-8 bg-amber-600 rounded-full border-2 border-white shadow-2xl flex items-center justify-center animate-bounce">
        <span class="text-xs text-white">🏛️</span>
      </div>
    </div>
  `,
  className: 'custom-office-marker-active',
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

export const SchemesPage: React.FC = () => {
  const { showNotification } = useNotifications();
  const {
    schemes,
    eligibilityResults,
    savedSchemes,
    offices,
    chatMessages,
    compareSchemes,
    activeOffice,
    isLoading,
    analytics,
    searchSchemes,
    runEligibilityCheck,
    saveScheme,
    unsaveScheme,
    loadComparison,
    clearComparison,
    sendChatMessage,
    clearChat,
    setActiveOffice
  } = useSchemes();

  const [activeTab, setActiveTab] = useState<'assistant' | 'checker' | 'discovery' | 'compare' | 'saved' | 'offices' | 'analytics'>('assistant');
  
  // Search parameters
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('All');
  
  // Chat input
  const [chatInput, setChatInput] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Compare selection
  const [selectedToCompare, setSelectedToCompare] = useState<number[]>([]);

  // Eligibility Form parameters
  const [profileForm, setProfileForm] = useState({
    age: 24,
    occupation: 'Unemployed',
    student_status: false,
    income: 120000,
    location: 'San Francisco',
    rural_urban: 'Urban',
    gender: 'Female',
    business_owner: false,
    farmer: false,
    senior_citizen: false,
    education_level: 'High School'
  });

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

  const handleEligibilitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto populate helper flags based on user selections
    const isFarmer = profileForm.occupation === 'Farmer';
    const isBusiness = profileForm.occupation === 'Business Owner';
    const isSenior = profileForm.age >= 60;

    const payload = {
      ...profileForm,
      farmer: isFarmer,
      business_owner: isBusiness,
      senior_citizen: isSenior,
      student_status: profileForm.occupation === 'Student'
    };

    await runEligibilityCheck(payload);
  };

  const handleToggleCompare = (id: number) => {
    setSelectedToCompare(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      } else {
        if (prev.length >= 3) {
          showNotification('You can compare a maximum of 3 schemes at once.', 'info');
          return prev;
        }
        return [...prev, id];
      }
    });
  };

  const executeComparison = async () => {
    if (selectedToCompare.length < 2) {
      showNotification('Please select at least 2 schemes to compare.', 'info');
      return;
    }
    await loadComparison(selectedToCompare);
    setActiveTab('compare');
  };

  const isBookmarked = (schemeId: number) => {
    return savedSchemes.some(b => b.scheme_id === schemeId);
  };

  const getBookmarkId = (schemeId: number) => {
    return savedSchemes.find(b => b.scheme_id === schemeId)?.id;
  };

  const handleBookmarkToggle = async (scheme: any) => {
    if (isBookmarked(scheme.id)) {
      const bid = getBookmarkId(scheme.id);
      if (bid !== undefined) {
        await unsaveScheme(bid);
      }
    } else {
      await saveScheme(scheme);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 pb-24">
      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-medium mb-1">
            <Landmark className="w-4 h-4 animate-pulse" />
            <span>Welfare & Public Policy Intelligence</span>
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-200 to-emerald-500 font-heading">
            Government Scheme Intelligence
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Reason over demographics, verify criteria checklists, run side-by-side matrices, and navigate documentation instructions with the schemes agent.
          </p>
        </div>
      </div>

      {/* ── Tab Selector ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap border-b border-white/5 gap-1 mb-6">
        {[
          { id: 'assistant', label: 'AI Scheme Assistant', icon: Landmark },
          { id: 'checker', label: 'Eligibility Triage Checker', icon: Clipboard },
          { id: 'discovery', label: 'Discover & Search', icon: Search },
          { id: 'compare', label: 'Scheme Comparison', icon: Table },
          { id: 'saved', label: 'Saved Schemes', icon: Bookmark },
          { id: 'offices', label: 'Nearby Help Centers', icon: MapPin },
          { id: 'analytics', label: 'Schemes Analytics', icon: TrendingUp },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
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

      {/* ── Tab Panes ─────────────────────────────────────────────────────────── */}
      <div className="w-full">
        <AnimatePresence mode="wait">
          {/* Tab 1: AI Schemes Assistant (Chat) */}
          {activeTab === 'assistant' && (
            <motion.div
              key="assistant"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-4 gap-6"
            >
              {/* Left sidebar info & prompts */}
              <div className="lg:col-span-1 flex flex-col gap-6">
                <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/5 p-5 shadow-xl">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-3">
                    <Shield className="w-4 h-4" />
                    <span>Welfare Guidelines Agent</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    This assistant evaluates national and municipal policy rules. It uses retrieval-augmented generation to search guidelines.
                  </p>
                  <div className="my-3.5 border-t border-white/5"></div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Grounded domains</span>
                  <div className="flex flex-wrap gap-1.5">
                    {['Agriculture', 'Startups', 'Welfare', 'Housing', 'Pension', 'Skill Development'].map((d, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-800 text-[9px] text-slate-400 rounded-md border border-white/5">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/5 p-5">
                  <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-emerald-400" />
                    <span>Scheme Inquiries</span>
                  </h3>
                  <div className="flex flex-col gap-2">
                    {[
                      'Do I qualify for PM-KISAN support?',
                      'How do I apply for the Startup Seed Fund?',
                      'Compare PMAY and NPS savings',
                      'What documents are needed for housing subsidy?',
                      'Helplines for geriatric senior care benefits'
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

              {/* Chat pane */}
              <div className="lg:col-span-3 bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/5 p-4 flex flex-col h-[650px] shadow-2xl">
                <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Landmark className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-slate-200">AI Government Scheme Agent</h2>
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        Grounded on verified government guidelines
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={clearChat}
                    className="p-1.5 hover:bg-white/5 text-slate-400 hover:text-slate-200 rounded-lg text-xs flex items-center gap-1 transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Clear logs</span>
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-sm scrollbar-thin">
                  {chatMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 max-w-md mx-auto">
                      <Landmark className="w-12 h-12 text-slate-700 mb-4" />
                      <p className="font-semibold text-slate-200 mb-1">Verify eligibility coordinates</p>
                      <p className="text-xs">
                        Query about welfare, agriculture subsidies, start-up grants, housing credits, or retirement accounts.
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
                          {msg.sender === 'agent' && msg.confidence !== undefined && (
                            <div className="flex items-center justify-between gap-4 text-[9px] text-slate-400 mb-2 border-b border-white/5 pb-1">
                              <div className="flex items-center gap-1">
                                <Shield className="w-3 h-3 text-emerald-400" />
                                <span>Agent Triage confidence: <b>{Math.round(msg.confidence * 100)}%</b></span>
                              </div>
                            </div>
                          )}

                          <div className="whitespace-pre-line text-slate-200 leading-relaxed font-sans">
                            {msg.text}
                          </div>

                          {/* Render dynamic recommendations cards in chat */}
                          {msg.sender === 'agent' && msg.recommendations && msg.recommendations.length > 0 && (
                            <div className="mt-4 space-y-2 border-t border-white/5 pt-3">
                              <span className="text-[10px] text-slate-400 font-bold block mb-1.5 uppercase">Recommended Programs:</span>
                              <div className="grid grid-cols-1 gap-2">
                                {msg.recommendations.map((rec, idx) => (
                                  <div key={idx} className="bg-slate-900 border border-white/5 rounded-xl p-3 flex justify-between items-center gap-2">
                                    <div>
                                      <h4 className="font-bold text-slate-200 text-xs">{rec.title}</h4>
                                      <p className="text-[10px] text-slate-400 mt-0.5">{rec.reason}</p>
                                    </div>
                                    <button
                                      onClick={() => handleBookmarkToggle(rec)}
                                      className={`p-2 rounded-lg border ${
                                        isBookmarked(rec.id)
                                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                          : 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-200'
                                      }`}
                                    >
                                      {isBookmarked(rec.id) ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

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
                        <span className="text-[9px] text-slate-500 mt-1 px-1">
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                  <div ref={chatBottomRef} />
                </div>

                <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    placeholder="Ask about crop schemes, startup seed grants, pension interest rates, or eligibility limits..."
                    className="flex-1 bg-slate-800 border border-white/5 focus:border-emerald-500/50 rounded-xl px-4 py-3 text-xs focus:outline-none transition-all placeholder:text-slate-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg transform active:scale-95 transition-all flex items-center justify-center border border-emerald-500/20"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* Tab 2: Eligibility Triage Checker */}
          {activeTab === 'checker' && (
            <motion.div
              key="checker"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Profile setup form */}
              <form onSubmit={handleEligibilitySubmit} className="lg:col-span-4 bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/5 p-5 flex flex-col gap-4 shadow-xl">
                <h3 className="text-sm font-bold text-slate-200 border-b border-white/5 pb-2 mb-1 flex items-center gap-2">
                  <Clipboard className="w-4.5 h-4.5 text-emerald-400" />
                  <span>Demographic Profile Builder</span>
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Age</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={120}
                      value={profileForm.age}
                      onChange={e => setProfileForm(prev => ({ ...prev, age: parseInt(e.target.value) }))}
                      className="w-full bg-slate-800 border border-white/5 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Gender</label>
                    <select
                      value={profileForm.gender}
                      onChange={e => setProfileForm(prev => ({ ...prev, gender: e.target.value }))}
                      className="w-full bg-slate-800 border border-white/5 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500/50"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Occupation Status</label>
                  <select
                    value={profileForm.occupation}
                    onChange={e => setProfileForm(prev => ({ ...prev, occupation: e.target.value }))}
                    className="w-full bg-slate-800 border border-white/5 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500/50"
                  >
                    <option value="Unemployed">Unemployed / School Dropout</option>
                    <option value="Student">Student</option>
                    <option value="Farmer">Farmer (Land owner)</option>
                    <option value="Business Owner">Business Owner / Startup founder</option>
                    <option value="Corporate Professional">Salaried Corporate Professional</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Annual Income (INR)</label>
                    <input
                      type="number"
                      required
                      value={profileForm.income}
                      onChange={e => setProfileForm(prev => ({ ...prev, income: parseFloat(e.target.value) }))}
                      className="w-full bg-slate-800 border border-white/5 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500/50 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Education Level</label>
                    <select
                      value={profileForm.education_level}
                      onChange={e => setProfileForm(prev => ({ ...prev, education_level: e.target.value }))}
                      className="w-full bg-slate-800 border border-white/5 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500/50"
                    >
                      <option value="High School">Below 10th / High School</option>
                      <option value="12th Pass">12th Grade / Intermediate</option>
                      <option value="Graduate">Graduate (BSc/BCom/BTech)</option>
                      <option value="PostGraduate">Post Graduate / PhD</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Area Sector</label>
                    <select
                      value={profileForm.rural_urban}
                      onChange={e => setProfileForm(prev => ({ ...prev, rural_urban: e.target.value }))}
                      className="w-full bg-slate-800 border border-white/5 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500/50"
                    >
                      <option value="Urban">Urban</option>
                      <option value="Rural">Rural</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">State District</label>
                    <input
                      type="text"
                      required
                      value={profileForm.location}
                      onChange={e => setProfileForm(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full bg-slate-800 border border-white/5 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-2 w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-lg transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  <span>Evaluate Eligibility Checks</span>
                </button>
              </form>

              {/* Triage reasoning lists */}
              <div className="lg:col-span-8 bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/5 p-5 shadow-xl h-[530px] flex flex-col">
                <h3 className="text-sm font-bold text-slate-200 border-b border-white/5 pb-2 mb-4 flex items-center justify-between">
                  <span>Eligibility Reasoning Report</span>
                  <span className="text-[10px] text-slate-500 font-mono">Evaluation details</span>
                </h3>

                <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
                  {eligibilityResults.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center max-w-sm mx-auto">
                      <Clipboard className="w-10 h-10 text-slate-700 mb-3 animate-pulse" />
                      <p className="text-xs">Setup your profile on the left panel and click evaluate to parse matching program constraints.</p>
                    </div>
                  ) : (
                    eligibilityResults.map((res, idx) => {
                      const eligible = res.status === 'Eligible';
                      return (
                        <div
                          key={idx}
                          className={`p-4 rounded-2xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-300 bg-slate-950/40 ${
                            eligible 
                              ? 'border-emerald-500/30 bg-emerald-500/[0.02]' 
                              : 'border-white/5 hover:border-white/10'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-bold tracking-wider uppercase border ${
                                eligible 
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/15' 
                                  : 'bg-rose-500/10 text-rose-400 border-rose-500/15'
                              }`}>
                                {res.status}
                              </span>
                              <span className="text-[10px] text-slate-500">{res.scheme.category}</span>
                            </div>
                            <h4 className="font-bold text-slate-200 text-sm mb-1">{res.scheme.title}</h4>
                            <p className="text-slate-400 text-[11px] mb-2 leading-relaxed">{res.scheme.description}</p>
                            <p className={`text-xs ${eligible ? 'text-emerald-400' : 'text-rose-400'} font-medium italic mt-1.5`}>
                              💡 {res.reasoning}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 self-end md:self-center">
                            {eligible && (
                              <button
                                onClick={() => handleBookmarkToggle(res.scheme)}
                                className={`p-2.5 rounded-xl border ${
                                  isBookmarked(res.scheme.id)
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 animate-pulse'
                                    : 'bg-slate-800 border-white/5 text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                {isBookmarked(res.scheme.id) ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                              </button>
                            )}
                            <button
                              onClick={() => {
                                handleQuickAction(`What are the documents and steps for ${res.scheme.title}?`);
                                setActiveTab('assistant');
                              }}
                              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-white/5 text-slate-200 text-[11px] font-medium rounded-xl whitespace-nowrap transition-all"
                            >
                              Required Docs & Apply
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab 3: Discover & Search */}
          {activeTab === 'discovery' && (
            <motion.div
              key="discovery"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Search panel */}
              <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/5 p-4 flex flex-col md:flex-row gap-3 items-center">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-3 w-4.5 h-4.5 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => {
                      setSearchQuery(e.target.value);
                      searchSchemes(e.target.value, searchCategory);
                    }}
                    placeholder="Search schemes index..."
                    className="w-full bg-slate-800 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="w-full md:w-56">
                  <select
                    value={searchCategory}
                    onChange={e => {
                      setSearchCategory(e.target.value);
                      searchSchemes(searchQuery, e.target.value);
                    }}
                    className="w-full bg-slate-800 border border-white/5 rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-emerald-500/50"
                  >
                    <option value="All">All Categories</option>
                    <option value="Agriculture">Agriculture</option>
                    <option value="Startup Support">Startup Support</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Skill Development">Skill Development</option>
                    <option value="Housing">Housing</option>
                    <option value="Pension">Pension</option>
                  </select>
                </div>
                {selectedToCompare.length > 0 && (
                  <button
                    onClick={executeComparison}
                    className="w-full md:w-auto px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-semibold rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <Table className="w-4 h-4" />
                    Compare Selected ({selectedToCompare.length})
                  </button>
                )}
              </div>

              {/* Grid lists */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {schemes.map(scheme => {
                  const check = selectedToCompare.includes(scheme.id);
                  return (
                    <div
                      key={scheme.id}
                      className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-5 shadow-xl flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/10 text-emerald-400 text-[9px] font-semibold rounded uppercase">
                            {scheme.category}
                          </span>
                          <span className="text-[10px] text-slate-500 block font-mono">
                            ⏱️ {scheme.processing_time}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-100 mb-2">{scheme.title}</h3>
                        <p className="text-xs text-slate-400 mb-4 leading-relaxed line-clamp-3">{scheme.description}</p>
                        
                        <div className="my-3.5 border-t border-white/5"></div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Primary Benefits</span>
                        <ul className="space-y-1.5 text-xs text-slate-300">
                          {scheme.benefits.slice(0, 2).map((b, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-emerald-400 font-semibold">•</span>
                              <span className="line-clamp-2">{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between gap-3">
                        {/* Compare Selection Checkbox */}
                        <div
                          onClick={() => handleToggleCompare(scheme.id)}
                          className="flex items-center gap-2 text-xs cursor-pointer select-none text-slate-400 hover:text-slate-200"
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                            check ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-600 bg-slate-800'
                          }`}>
                            {check && <Check className="w-3.5 h-3.5" />}
                          </div>
                          <span>Compare</span>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleBookmarkToggle(scheme)}
                            className={`p-2 rounded-xl border transition-all ${
                              isBookmarked(scheme.id)
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                : 'bg-slate-800 border-white/5 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {isBookmarked(scheme.id) ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => {
                              handleQuickAction(`Provide the full application steps and required documents for ${scheme.title}`);
                              setActiveTab('assistant');
                            }}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all active:scale-95"
                          >
                            Application SOP
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Tab 4: Scheme Comparison */}
          {activeTab === 'compare' && (
            <motion.div
              key="compare"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/5 p-5 shadow-xl"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-5">
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Table className="w-5 h-5 text-emerald-400" />
                  <span>Scheme Comparison Matrix</span>
                </h3>
                <button
                  onClick={() => {
                    clearComparison();
                    setSelectedToCompare([]);
                    setActiveTab('discovery');
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs border border-white/5 transition-all"
                >
                  Clear & Search
                </button>
              </div>

              {compareSchemes.length === 0 ? (
                <div className="py-12 text-center text-slate-400 max-w-sm mx-auto">
                  <Table className="w-12 h-12 text-slate-700 mb-4 animate-pulse mx-auto" />
                  <p className="text-xs">No schemes selected for comparison. Go to 'Discover & Search' tab, check the compare box on multiple cards and click Compare.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-xs text-left">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider text-[10px]">
                        <th className="py-3.5 pr-4 font-bold w-1/5">Scheme Feature</th>
                        {compareSchemes.map(s => (
                          <th key={s.id} className="py-3.5 px-4 font-bold w-4/15 border-l border-white/5 text-slate-200">
                            {s.title}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      <tr>
                        <td className="py-3.5 pr-4 text-slate-400 font-semibold">Department</td>
                        {compareSchemes.map(s => (
                          <td key={s.id} className="py-3.5 px-4 border-l border-white/5 text-slate-300 font-mono">
                            {s.department}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-3.5 pr-4 text-slate-400 font-semibold">Key Benefits</td>
                        {compareSchemes.map(s => (
                          <td key={s.id} className="py-3.5 px-4 border-l border-white/5 text-slate-300">
                            <ul className="space-y-1.5 list-disc pl-4 leading-relaxed">
                              {s.benefits.map((b, i) => <li key={i}>{b}</li>)}
                            </ul>
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-3.5 pr-4 text-slate-400 font-semibold">Eligibility check</td>
                        {compareSchemes.map(s => (
                          <td key={s.id} className="py-3.5 px-4 border-l border-white/5 text-slate-300 leading-normal">
                            <p className="font-semibold text-emerald-400 block mb-1">Demographics check:</p>
                            <ul className="space-y-1">
                              {s.eligibility.age_min && <li>• Age: Minimum {s.eligibility.age_min} years</li>}
                              {s.eligibility.income_max && <li>• Annual income limit: under {s.eligibility.income_max} INR</li>}
                              {s.eligibility.requires_farmer && <li>• Occupation: Farmer family credentials</li>}
                              {s.eligibility.requires_business && <li>• Category: Early-stage Startup</li>}
                              {s.eligibility.requires_no_house && <li>• Housing: No pucca house owners</li>}
                            </ul>
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-3.5 pr-4 text-slate-400 font-semibold">Required Proof Documents</td>
                        {compareSchemes.map(s => (
                          <td key={s.id} className="py-3.5 px-4 border-l border-white/5 text-slate-300">
                            <div className="flex flex-wrap gap-1">
                              {s.documents.map((d, i) => (
                                <span key={i} className="px-2 py-1 bg-slate-800 text-[10px] text-slate-400 rounded-md border border-white/5 inline-block">
                                  📄 {d}
                                </span>
                              ))}
                            </div>
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-3.5 pr-4 text-slate-400 font-semibold">Processing Timeline</td>
                        {compareSchemes.map(s => (
                          <td key={s.id} className="py-3.5 px-4 border-l border-white/5 text-slate-300 font-mono">
                            {s.processing_time}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {/* Tab 5: Saved Schemes */}
          {activeTab === 'saved' && (
            <motion.div
              key="saved"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/5 p-5 shadow-xl"
            >
              <h3 className="text-lg font-bold text-slate-100 border-b border-white/5 pb-3 mb-5 flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-emerald-400" />
                <span>My Bookmarked Saved Schemes</span>
              </h3>

              {savedSchemes.length === 0 ? (
                <div className="py-12 text-center text-slate-400 max-w-sm mx-auto">
                  <Bookmark className="w-12 h-12 text-slate-700 mb-4 mx-auto" />
                  <p className="text-xs">No bookmarks saved yet. Find schemes under the 'Discover & Search' tab and click bookmark icon to save them.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedSchemes.map(bookmark => (
                    <div
                      key={bookmark.id}
                      className="bg-slate-950/40 border border-white/5 p-4 rounded-xl flex justify-between items-center gap-4 transition-all hover:border-emerald-500/30"
                    >
                      <div>
                        <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded uppercase font-semibold mb-1.5 inline-block">
                          {bookmark.scheme_category}
                        </span>
                        <h4 className="font-bold text-slate-200 text-sm">{bookmark.scheme_title}</h4>
                        <span className="text-[9px] text-slate-500 block mt-1">Bookmarked on {new Date(bookmark.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => unsaveScheme(bookmark.id)}
                          className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs font-semibold rounded-lg transition-all"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => {
                            handleQuickAction(`Give me application steps for ${bookmark.scheme_title}`);
                            setActiveTab('assistant');
                          }}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-all"
                        >
                          Application SOP
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Tab 6: Nearby Help Centers */}
          {activeTab === 'offices' && (
            <motion.div
              key="offices"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Offices Sidebar */}
              <div className="lg:col-span-4 bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/5 p-4 flex flex-col h-[600px]">
                <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                  <MapPin className="w-4.5 h-4.5 text-emerald-400" />
                  <span>Welfare Service Offices</span>
                </h3>
                
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                  {offices.map(office => {
                    const isActive = activeOffice?.id === office.id;
                    return (
                      <div
                        key={office.id}
                        onClick={() => setActiveOffice(office)}
                        className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all duration-300 ${
                          isActive
                            ? 'bg-emerald-500/10 border-emerald-500 shadow-md'
                            : 'bg-slate-800/40 border-white/5 hover:border-emerald-500/30'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1.5">
                          <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/10 text-[8px] font-semibold rounded">
                            {office.type}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-200 text-sm mb-1">{office.name}</h4>
                        <p className="text-slate-400 text-[11px] mb-2">{office.address}</p>
                        <p className="text-[10px] text-slate-500 font-medium">🕒 Hours: {office.hours}</p>
                        <p className="text-[10px] text-slate-500 font-medium mt-1">📞 Contact: {office.contact}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Map Box */}
              <div className="lg:col-span-8 bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/5 h-[600px] shadow-2xl overflow-hidden relative">
                <MapContainer
                  center={[37.7749, -122.4194]}
                  zoom={12.5}
                  className="w-full h-full z-0"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  />
                  {offices.map(off => (
                    <Marker
                      key={off.id}
                      position={[off.latitude, off.longitude]}
                      icon={activeOffice?.id === off.id ? activeIcon : defaultIcon}
                      eventHandlers={{
                        click: () => setActiveOffice(off)
                      }}
                    >
                      <Popup>
                        <div className="text-xs p-1 text-slate-900 font-sans">
                          <h4 className="font-bold text-sm mb-0.5">{off.name}</h4>
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 font-semibold text-[8px] rounded uppercase block w-max mb-1.5">
                            {off.type}
                          </span>
                          <p className="text-slate-600 mb-1">{off.address}</p>
                          <p className="text-slate-700 font-medium font-mono text-[9px] mb-1">🕒 {off.hours}</p>
                          <p className="text-slate-850 font-bold">📞 {off.contact}</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                  
                  {activeOffice && (
                    <MapController center={[activeOffice.latitude, activeOffice.longitude]} zoom={15} />
                  )}
                </MapContainer>

                {activeOffice && (
                  <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-xl border border-white/10 p-4 rounded-xl shadow-2xl z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-3"
                  >
                    <div>
                      <h3 className="text-sm font-bold text-slate-200">{activeOffice.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{activeOffice.address}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${activeOffice.latitude},${activeOffice.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
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

          {/* Tab 7: Analytics */}
          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { title: 'Search Queries', value: analytics.searchesCount, icon: Search, desc: 'Scheme search interactions today', color: 'text-emerald-400 bg-emerald-500/5' },
                  { title: 'Eligibility checks', value: analytics.eligibilityChecksCount, icon: Clipboard, desc: 'Eligibility logic runs complete', color: 'text-blue-400 bg-blue-500/5' },
                  { title: 'Personalized Matches', value: analytics.recommendationsViewedCount, icon: Award, desc: 'Personal matches parsed', color: 'text-amber-400 bg-amber-500/5' },
                  { title: 'Saved Bookmarks', value: analytics.savedSchemesCount, icon: Bookmark, desc: 'Schemes bookmarked by citizen', color: 'text-rose-400 bg-rose-500/5' },
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

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-200 mb-1.5 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>Citizen Satisfaction rating</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Percentage of users finding scheme eligibility results accurate and clear.
                    </p>
                  </div>
                  <div className="my-6 flex flex-col items-center">
                    <span className="text-5xl font-extrabold text-slate-100 font-mono mb-2">{analytics.satisfactionRate}%</span>
                    <div className="flex gap-2">
                      <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded text-[9px]">
                        Target 95%+
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full" style={{ width: `${analytics.satisfactionRate}%` }}></div>
                  </div>
                </div>

                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-5 shadow-xl col-span-2">
                  <h4 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span>Popular Scheme Categories</span>
                  </h4>
                  <div className="space-y-3.5 mt-2">
                    {[
                      { type: 'Agriculture Programs (PM-KISAN)', pct: 40, count: 18, color: 'bg-emerald-500' },
                      { type: 'Housing Subsidies (PMAY)', pct: 25, count: 11, color: 'bg-blue-500' },
                      { type: 'Startup Support (SISFS)', pct: 20, count: 9, color: 'bg-amber-500' },
                      { type: 'Pension & Savings (NPS)', pct: 15, count: 6, color: 'bg-rose-500' }
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
    </div>
  );
};

export default SchemesPage;
