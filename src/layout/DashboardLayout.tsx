import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useCitizen } from '../context/CitizenContext';
import { 
  LayoutDashboard, PlusCircle, FileText, Rss, Bookmark, 
  BellRing, Award, Settings, HelpCircle, ChevronLeft, ChevronRight, 
  Menu, X, Sun, Moon, Bell, Search, LogOut, Landmark, Map, Bot, Heart, TrendingUp, Compass, GitBranch, BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NotificationItem } from '../components/dashboard/NotificationItem';

export const DashboardLayout: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications } = useCitizen();
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

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard/citizen', icon: LayoutDashboard },
    { name: 'Report Issue', path: '/dashboard/citizen/report-issue', icon: PlusCircle },
    { name: 'Interactive Map', path: '/dashboard/citizen/map', icon: Map },
    { name: 'AI Assistant', path: '/dashboard/citizen/assistant', icon: Bot },
    { name: 'Healthcare Intelligence', path: '/dashboard/citizen/healthcare', icon: Heart },
    { name: 'Government Schemes', path: '/dashboard/citizen/schemes', icon: Landmark },
    { name: 'Decision Analytics', path: '/dashboard/citizen/analytics', icon: TrendingUp },
    { name: 'Predictive Engine', path: '/dashboard/citizen/forecast', icon: Compass },
    { name: 'Executive Dashboard', path: '/dashboard/citizen/executive-dashboard', icon: BarChart3 },
    { name: 'Report Builder', path: '/dashboard/citizen/report-builder', icon: FileText },
    { name: 'My Reports', path: '/dashboard/citizen/reports', icon: FileText },
    { name: 'Community Feed', path: '/dashboard/citizen/feed', icon: Rss },
    { name: 'Saved Reports', path: '/dashboard/citizen/saved', icon: Bookmark },
    { name: 'Nearby Alerts', path: '/dashboard/citizen/alerts', icon: BellRing },
    { name: 'Inbox Alerts', path: '/dashboard/citizen/notifications', icon: Bell },
    { name: 'Workflow Builder', path: '/dashboard/citizen/workflows', icon: GitBranch },
    { name: 'Achievements', path: '/dashboard/citizen/achievements', icon: Award },
    { name: 'Settings', path: '/dashboard/citizen/settings', icon: Settings },
    { name: 'Help Center', path: '/dashboard/citizen/help', icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen flex gradient-mesh text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* 1. Sidebar Navigation (Desktop) */}
      <aside 
        className={`hidden md:flex flex-col shrink-0 border-r border-white/10 dark:border-white/5 light:border-slate-200/80 bg-slate-950/70 dark:bg-slate-950/70 light:bg-white/80 backdrop-blur-xl transition-all duration-300 relative ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Logo block */}
        <div className="h-20 flex items-center px-5 border-b border-white/10 dark:border-white/5 light:border-slate-200/50 justify-between overflow-hidden">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-md shadow-primary/20 shrink-0">
              <Landmark className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <span className="font-heading font-extrabold text-lg tracking-tight text-slate-900 dark:text-slate-100">
                Civic<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Mind</span>
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
              end={item.path === '/dashboard/citizen'}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/25'
                    : 'text-slate-655 dark:text-slate-350 hover:bg-slate-900/50 dark:hover:bg-slate-900/50 light:hover:bg-slate-100 hover:text-primary dark:hover:text-primary'
                }`
              }
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span className="truncate">{item.name}</span>}
              {isCollapsed && (
                <div className="absolute left-20 bg-slate-950 dark:bg-slate-905 light:bg-white text-slate-900 dark:text-slate-100 text-xs font-bold py-1.5 px-3 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-md border border-white/10 dark:border-white/5 light:border-slate-200 whitespace-nowrap z-50">
                  {item.name}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Collapsible toggle buttons */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3.5 top-[84px] bg-slate-900 dark:bg-slate-900 light:bg-white border border-white/10 dark:border-white/5 light:border-slate-250 hover:border-primary text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 p-1.5 rounded-full shadow-md z-45"
          aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* User Footer Profile */}
        <div className="p-4 border-t border-white/10 dark:border-white/5 light:border-slate-200/50 flex flex-col gap-3">
          <Link
            to="/profile"
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-900/40 dark:hover:bg-slate-900/40 light:hover:bg-slate-100 transition-colors overflow-hidden"
          >
            <div className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs uppercase overflow-hidden shrink-0">
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
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                  {currentUser?.role}
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
              className="fixed inset-y-0 left-0 w-64 bg-slate-950 dark:bg-slate-955 light:bg-white z-50 md:hidden flex flex-col border-r border-white/10 dark:border-white/5 light:border-slate-200"
            >
              <div className="h-20 flex items-center justify-between px-5 border-b border-white/10 dark:border-white/5 light:border-slate-200/50">
                <Link to="/" className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <span className="font-heading font-extrabold text-base tracking-tight text-slate-900 dark:text-slate-100">
                    CivicMind
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
                    end={item.path === '/dashboard/citizen'}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-primary text-white'
                          : 'text-slate-655 dark:text-slate-350 hover:bg-slate-900/50 dark:hover:bg-slate-900/50 light:hover:bg-slate-100 hover:text-primary'
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
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs uppercase overflow-hidden shrink-0">
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
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{currentUser?.role}</span>
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
        <header className="h-20 border-b border-white/10 dark:border-white/5 light:border-slate-200/80 bg-slate-950/20 dark:bg-slate-950/20 light:bg-white/40 backdrop-blur-lg flex items-center justify-between px-4 sm:px-6 lg:px-8 z-30 shrink-0">
          
          {/* Mobile hamburger & page context details */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-2 rounded-lg border border-slate-700/30 light:border-slate-300 text-slate-700 dark:text-slate-300"
              aria-label="Open navigation sidebar drawer"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:block">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Workspace</span>
              <h2 className="text-sm font-bold text-slate-805 dark:text-slate-205 leading-none">
                {currentUser?.city}, {currentUser?.state}
              </h2>
            </div>
          </div>

          {/* Global Search Bar */}
          <div className="flex-1 max-w-md mx-6 hidden md:block">
            <form onSubmit={(e) => {
              e.preventDefault();
              navigate(`/dashboard/citizen/reports?search=${encodeURIComponent(globalSearch)}`);
            }} className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Global workspace search (reports, schemes, news)..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/40 dark:bg-slate-900/40 light:bg-slate-100 border border-white/10 dark:border-white/5 light:border-slate-205 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-slate-900 dark:text-slate-100"
              />
            </form>
          </div>

          {/* Controls toolbar */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-slate-700/50 light:border-slate-300 text-slate-700 dark:text-slate-305 bg-slate-900/30 light:bg-slate-100 hover:bg-slate-800/80 light:hover:bg-slate-150 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {/* In-App Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotiDropdown(!showNotiDropdown)}
                className="p-2.5 rounded-xl border border-slate-700/50 light:border-slate-300 text-slate-700 dark:text-slate-305 bg-slate-900/30 light:bg-slate-100 hover:bg-slate-800/80 light:hover:bg-slate-150 transition-colors relative"
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
                      className="absolute right-0 mt-2.5 w-80 sm:w-96 max-h-[450px] overflow-y-auto rounded-2xl bg-slate-950 dark:bg-slate-950 light:bg-white border border-white/10 dark:border-white/5 light:border-slate-205 shadow-2xl p-4 space-y-3 z-50 custom-scrollbar"
                    >
                      <div className="flex justify-between items-center pb-2 border-b border-white/5 dark:border-white/5 light:border-slate-200/85">
                        <h4 className="font-heading font-extrabold text-sm text-slate-900 dark:text-slate-100">
                          Workspace Logs
                        </h4>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          {unreadCount} Unread
                        </span>
                      </div>
                      
                      {notifications.length === 0 ? (
                        <div className="text-center py-8 text-xs text-slate-500">
                          No active updates or messages.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {notifications.map((noti) => (
                            <NotificationItem key={noti.id} notification={noti} />
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
              className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm uppercase overflow-hidden border border-white/10 dark:border-white/5 light:border-slate-300 shadow-sm shrink-0"
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

export default DashboardLayout;
