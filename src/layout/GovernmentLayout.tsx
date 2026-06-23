import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useGovernment } from '../context/GovernmentContext';
import { 
  LayoutDashboard, FileText, Landmark, Rss, Settings, 
  HelpCircle, ChevronLeft, ChevronRight, Menu, X, Sun, Moon, 
  Bell, Search, LogOut, ShieldCheck, Users, BarChart3, 
  Building2, AlertTriangle, CheckCircle, Activity, Archive
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const GovernmentLayout: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications } = useGovernment();
  const navigate = useNavigate();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showNotiDropdown, setShowNotiDropdown] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const unreadCount = notifications.length; // Alerts are critical in gov console

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard/government', icon: LayoutDashboard },
    { name: 'Issue Management', path: '/dashboard/government/issues', icon: FileText },
    { name: 'Departments', path: '/dashboard/government/departments', icon: Building2 },
    { name: 'Ward Analytics', path: '/dashboard/government/analytics', icon: BarChart3 },
    { name: 'Reports', path: '/dashboard/government/reports', icon: Archive },
    { name: 'Announcements', path: '/dashboard/government/announcements', icon: Rss },
    { name: 'Citizens', path: '/dashboard/government/citizens', icon: Users },
    { name: 'Resources', path: '/dashboard/government/resources', icon: ShieldCheck },
    { name: 'Settings', path: '/dashboard/government/settings', icon: Settings },
    { name: 'Help Center', path: '/dashboard/government/help', icon: HelpCircle },
  ];

  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'emergency':
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case 'gov_message':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      default:
        return <Activity className="w-4 h-4 text-secondary" />;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100 light:bg-slate-50 light:text-slate-900 gradient-mesh-gov">
      
      {/* 1. Sidebar Navigation (Desktop) */}
      <aside 
        className={`hidden md:flex flex-col shrink-0 border-r border-amber-500/10 dark:border-amber-500/10 light:border-slate-200/80 bg-slate-950/80 dark:bg-slate-950/80 light:bg-white/80 backdrop-blur-xl transition-all duration-300 relative ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Logo block */}
        <div className="h-20 flex items-center px-5 border-b border-amber-500/10 dark:border-amber-500/10 light:border-slate-200/50 justify-between overflow-hidden">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-secondary to-amber-500 flex items-center justify-center text-slate-950 shadow-md shadow-secondary/20 shrink-0">
              <Landmark className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <span className="font-heading font-extrabold text-lg tracking-tight text-slate-900 dark:text-slate-100">
                Civic<span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-amber-500">Mind</span>
              </span>
            )}
          </Link>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard/government'}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-secondary text-slate-950 shadow-md shadow-secondary/25'
                    : 'text-slate-400 dark:text-slate-400 hover:bg-slate-900/50 dark:hover:bg-slate-900/50 light:hover:bg-slate-100 hover:text-secondary dark:hover:text-secondary'
                }`
              }
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span className="truncate">{item.name}</span>}
              {isCollapsed && (
                <div className="absolute left-20 bg-slate-950 dark:bg-slate-900 light:bg-white text-slate-900 dark:text-slate-100 text-xs font-bold py-1.5 px-3 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-md border border-white/10 dark:border-white/5 light:border-slate-200 whitespace-nowrap z-50">
                  {item.name}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Collapsible toggle buttons */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3.5 top-[84px] bg-slate-900 dark:bg-slate-900 light:bg-white border border-white/10 dark:border-white/5 light:border-slate-200 hover:border-secondary text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 p-1.5 rounded-full shadow-md z-45"
          aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* User Footer Profile */}
        <div className="p-4 border-t border-amber-500/10 dark:border-amber-500/10 light:border-slate-200/50 flex flex-col gap-3">
          <Link
            to="/profile"
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-900/40 dark:hover:bg-slate-900/40 light:hover:bg-slate-100 transition-colors overflow-hidden"
          >
            <div className="w-9 h-9 rounded-full bg-secondary/20 text-secondary flex items-center justify-center font-bold text-xs uppercase overflow-hidden shrink-0">
              {currentUser?.profile_image ? (
                <img
                  src={`${import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || ''}${currentUser.profile_image}`}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{currentUser?.first_name[0]}{currentUser?.last_name[0]}</span>
              )}
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate leading-tight">
                  {currentUser?.first_name} {currentUser?.last_name}
                </h5>
                <span className="text-[9px] font-bold text-amber-500 uppercase tracking-wider block">
                  {currentUser?.sub_role || currentUser?.role}
                </span>
              </div>
            )}
          </Link>
          
          {!isCollapsed && (
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-xs font-bold text-rose-500 border border-rose-500/20 hover:bg-rose-500/10 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </aside>

      {/* 2. Mobile Drawer Navigation */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black z-40 md:hidden"
            />
            {/* Menu panel */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 left-0 w-64 bg-slate-950 dark:bg-slate-950 light:bg-white z-50 md:hidden flex flex-col border-r border-white/10 dark:border-white/5 light:border-slate-200"
            >
              <div className="h-20 flex items-center justify-between px-5 border-b border-white/10 dark:border-white/5 light:border-slate-200/50">
                <Link to="/" className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-secondary to-amber-500 flex items-center justify-center text-slate-950">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <span className="font-heading font-extrabold text-base tracking-tight text-slate-900 dark:text-slate-100">
                    CivicMind Gov
                  </span>
                </Link>
                <button onClick={() => setIsMobileOpen(false)} className="text-slate-400 hover:text-slate-100">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/dashboard/government'}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-secondary text-slate-950'
                          : 'text-slate-400 dark:text-slate-400 hover:bg-slate-900/50 dark:hover:bg-slate-900/50 light:hover:bg-slate-100 hover:text-secondary'
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    <span>{item.name}</span>
                  </NavLink>
                ))}
              </nav>

              <div className="p-4 border-t border-white/10 dark:border-white/5 light:border-slate-200/50 space-y-3">
                <Link to="/profile" className="flex items-center gap-3 p-2 rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-secondary/20 text-secondary flex items-center justify-center font-bold text-xs uppercase overflow-hidden shrink-0">
                    {currentUser?.profile_image ? (
                      <img
                        src={`${import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || ''}${currentUser.profile_image}`}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{currentUser?.first_name[0]}{currentUser?.last_name[0]}</span>
                    )}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">{currentUser?.first_name} {currentUser?.last_name}</h5>
                    <span className="text-[9px] font-bold text-amber-500 uppercase tracking-wider">{currentUser?.sub_role || currentUser?.role}</span>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-xs font-bold text-rose-500 border border-rose-500/20 hover:bg-rose-500/10"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* 3. Main Workspace Container */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Navigation */}
        <header className="h-20 border-b border-amber-500/10 dark:border-amber-500/10 light:border-slate-200/80 bg-slate-950/20 dark:bg-slate-950/20 light:bg-white/40 backdrop-blur-lg flex items-center justify-between px-4 sm:px-6 lg:px-8 z-30 shrink-0">
          
          {/* Mobile hamburger & page context details */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-2 rounded-lg border border-slate-700/30 light:border-slate-300 text-slate-700 dark:text-slate-300"
              aria-label="Open navigation sidebar drawer"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:flex items-center gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Government Command Center</span>
                <h2 className="text-xs font-bold text-amber-505 dark:text-amber-505 leading-none flex items-center gap-1.5 mt-0.5">
                  <span className="px-2 py-0.5 rounded bg-secondary/15 text-secondary text-[9px] font-bold uppercase tracking-wider">
                    {currentUser?.sub_role || 'Administrative'}
                  </span>
                  <span>{currentUser?.city}, {currentUser?.state}</span>
                </h2>
              </div>
            </div>
          </div>

          {/* Global Search Bar (redirects to issues tab) */}
          <div className="flex-1 max-w-md mx-6 hidden md:block">
            <form onSubmit={(e) => {
              e.preventDefault();
              navigate(`/dashboard/government/issues?search=${encodeURIComponent(globalSearch)}`);
            }} className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Global command search (Issues, citizens, departments)..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/40 dark:bg-slate-900/40 light:bg-slate-100 border border-white/10 dark:border-white/5 light:border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-secondary text-slate-900 dark:text-slate-100"
              />
            </form>
          </div>

          {/* Controls toolbar */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-slate-700/50 light:border-slate-300 text-slate-700 dark:text-slate-300 bg-slate-900/30 light:bg-slate-100 hover:bg-slate-800/80 light:hover:bg-slate-150 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {/* In-App Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotiDropdown(!showNotiDropdown)}
                className="p-2.5 rounded-xl border border-slate-700/50 light:border-slate-300 text-slate-700 dark:text-slate-300 bg-slate-900/30 light:bg-slate-100 hover:bg-slate-800/80 light:hover:bg-slate-150 transition-colors relative"
                aria-label="Open notifications dropdown"
                aria-expanded={showNotiDropdown}
              >
                <Bell className="w-4.5 h-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white font-bold text-[9px] h-5 w-5 rounded-full flex items-center justify-center border border-slate-950 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotiDropdown && (
                  <>
                    <div className="fixed inset-0 z-45" onClick={() => setShowNotiDropdown(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 15 }}
                      className="absolute right-0 mt-2.5 w-80 sm:w-96 max-h-[450px] overflow-y-auto rounded-2xl bg-slate-950 dark:bg-slate-950 light:bg-white border border-white/10 dark:border-white/5 light:border-slate-200 shadow-2xl p-4 space-y-3 z-50 custom-scrollbar"
                    >
                      <div className="flex justify-between items-center pb-2 border-b border-white/5 dark:border-white/5 light:border-slate-200/85">
                        <h4 className="font-heading font-extrabold text-sm text-slate-900 dark:text-slate-100">
                          Critical Command Alerts
                        </h4>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          {unreadCount} Active
                        </span>
                      </div>
                      
                      {notifications.length === 0 ? (
                        <div className="text-center py-8 text-xs text-slate-500">
                          No active updates or escalations.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {notifications.map((noti) => (
                            <div key={noti.id} className="p-3 bg-slate-900/40 dark:bg-slate-900/40 light:bg-slate-50 border border-white/5 dark:border-white/5 light:border-slate-200 rounded-xl flex gap-3 text-xs">
                              <div className="p-1.5 rounded-lg border border-white/5 bg-slate-950 dark:bg-slate-950 light:bg-white shrink-0 h-fit">
                                {getStatusIcon(noti.type)}
                              </div>
                              <div className="space-y-1">
                                <h5 className="font-bold text-slate-900 dark:text-slate-100">{noti.title}</h5>
                                <p className="text-slate-500 leading-normal">{noti.message}</p>
                                <span className="text-[9px] text-slate-450 block">{new Date(noti.created_at).toLocaleTimeString()}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Avatar Widget */}
            <Link
              to="/profile"
              className="w-10 h-10 rounded-full bg-secondary/20 text-secondary flex items-center justify-center font-bold text-sm uppercase overflow-hidden border border-white/10 dark:border-white/5 light:border-slate-350 shadow-sm shrink-0"
              aria-label="View user profile details"
            >
              {currentUser?.profile_image ? (
                <img
                  src={`${import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || ''}${currentUser.profile_image}`}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{currentUser?.first_name[0]}{currentUser?.last_name[0]}</span>
              )}
            </Link>
          </div>
        </header>

        {/* Main page workspace view */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default GovernmentLayout;
