import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { usePresentation } from '../context/PresentationContext';
import { Sun, Moon, Menu, X, User, LogOut, LayoutDashboard, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/Button';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { currentUser, isAuthenticated, logout } = useAuth();
  const { startTour } = usePresentation();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Features', path: '/features' },
    { name: 'Contact', path: '/contact' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getDashboardPath = () => {
    if (!currentUser) return '/';
    const roleRoutes = {
      Citizen: '/dashboard/citizen',
      Government: '/dashboard/government',
      NGO: '/dashboard/ngo',
      Admin: '/dashboard/admin',
    };
    return roleRoutes[currentUser.role] || '/';
  };

  return (
    <header className="sticky top-0 w-full z-40 transition-colors duration-200 glass-navbar dark:glass-navbar light:glass-navbar-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group text-decoration-none">
          <div className="w-[28px] h-[28px] bg-slate-900 dark:bg-white rounded-[6px] flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="2" y="2" width="4" height="4" fill="currentColor" className="text-white dark:text-slate-900" opacity="0.9"/>
              <rect x="8" y="2" width="4" height="4" fill="currentColor" className="text-white dark:text-slate-900" opacity="0.5"/>
              <rect x="2" y="8" width="4" height="4" fill="currentColor" className="text-white dark:text-slate-900" opacity="0.5"/>
              <rect x="8" y="8" width="4" height="4" fill="currentColor" className="text-white dark:text-slate-900" opacity="0.9"/>
            </svg>
          </div>
          <span className="font-sans font-semibold text-[15px] tracking-[-0.2px] text-slate-900 dark:text-slate-100">
            CivicMind AI
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `text-sm transition-colors duration-200 hover:text-primary ${
                  isActive
                    ? 'text-primary font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
          {/* Dashboard route (conditional) */}
          {isAuthenticated && (
            <NavLink
              to={getDashboardPath()}
              className={({ isActive }) =>
                `text-sm transition-colors duration-200 hover:text-primary flex items-center gap-1.5 ${
                  isActive
                    ? 'text-primary font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`
              }
            >
              <LayoutDashboard className="w-4.5 h-4.5" />
              <span>Dashboard</span>
            </NavLink>
          )}
        </nav>

        {/* Action Controls */}
        <div className="hidden md:flex items-center gap-4">
          {/* Hackathon Guided Tour */}
          <button
            onClick={startTour}
            className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl border border-indigo-500/35 bg-indigo-500/10 hover:bg-indigo-500/25 text-indigo-400 hover:text-indigo-300 text-sm font-semibold transition-all cursor-pointer shadow-sm shadow-indigo-500/5"
          >
            <Sparkles className="w-4 h-4 animate-pulse" />
            Guided Tour
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border border-slate-700/50 light:border-slate-300 bg-slate-900/40 dark:bg-slate-900/40 light:bg-slate-50 text-slate-700 dark:text-slate-300 hover:bg-slate-800/80 light:hover:bg-slate-100 hover:text-primary transition-all duration-200"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Conditional Profile / Login buttons */}
          {isAuthenticated && currentUser ? (
            <div className="flex items-center gap-3">
              {/* Profile Link */}
              <Link
                to="/profile"
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-700/50 light:border-slate-300/80 bg-slate-900/30 dark:bg-slate-900/30 light:bg-slate-100/40 hover:bg-slate-800/80 light:hover:bg-slate-150 transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs uppercase overflow-hidden shrink-0">
                  {currentUser.profile_image ? (
                    <img
                      src={`${import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || ''}${currentUser.profile_image}`}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{currentUser.first_name[0]}{currentUser.last_name[0]}</span>
                  )}
                </div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-305 max-w-[100px] truncate">
                  {currentUser.first_name}
                </span>
              </Link>
              {/* Logout */}
              <button
                onClick={handleLogout}
                className="p-2.5 rounded-xl border border-rose-500/20 hover:bg-rose-500/10 text-rose-500 transition-all duration-200"
                aria-label="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-semibold text-slate-655 dark:text-slate-350 hover:text-slate-905 dark:hover:text-slate-105 px-3 py-2">
                Sign In
              </Link>
              <Button variant="primary" size="sm" onClick={() => navigate('/register')}>
                Register Workspace
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Controls Hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-slate-700/30 light:border-slate-300/80 text-slate-700 dark:text-slate-300"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg border border-slate-700/30 light:border-slate-300/80 text-slate-700 dark:text-slate-300 hover:bg-slate-800/80 light:hover:bg-slate-100"
            aria-label="Toggle Navigation Menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b border-white/5 dark:border-white/5 light:border-slate-200 bg-slate-950/95 dark:bg-slate-950/95 light:bg-white/95 backdrop-blur-lg overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-4 flex flex-col">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `text-base font-medium px-3 py-2 rounded-xl transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary font-bold'
                        : 'text-slate-655 dark:text-slate-355 hover:bg-slate-900/50 light:hover:bg-slate-100'
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}

              {isAuthenticated && (
                <NavLink
                  to={getDashboardPath()}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `text-base font-medium px-3 py-2 rounded-xl transition-colors flex items-center gap-2 ${
                      isActive
                        ? 'bg-primary/10 text-primary font-bold'
                        : 'text-slate-655 dark:text-slate-355 hover:bg-slate-900/50 light:hover:bg-slate-100'
                    }`
                  }
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span>Dashboard</span>
                </NavLink>
              )}

              <div className="pt-4 border-t border-white/10 dark:border-white/10 light:border-slate-200">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    <Link
                      to="/profile"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-slate-700/50 light:border-slate-300 text-sm font-semibold text-slate-805 dark:text-slate-205 bg-slate-900/30 light:bg-slate-100/50 w-full"
                    >
                      <User className="w-4.5 h-4.5" />
                      <span>My Profile</span>
                    </Link>
                    <Button
                      variant="secondary"
                      size="md"
                      className="w-full text-rose-500 border-rose-500/20 hover:bg-rose-500/10 justify-center gap-2"
                      onClick={() => {
                        setIsOpen(false);
                        handleLogout();
                      }}
                    >
                      <LogOut className="w-4.5 h-4.5" />
                      <span>Sign Out</span>
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="text-center text-sm font-semibold text-slate-700 dark:text-slate-300 px-3 py-2.5 rounded-xl hover:bg-slate-900/30 light:hover:bg-slate-100"
                    >
                      Sign In
                    </Link>
                    <Button
                      variant="primary"
                      size="md"
                      className="w-full justify-center"
                      onClick={() => {
                        setIsOpen(false);
                        navigate('/register');
                      }}
                    >
                      Register Workspace
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
export default Navbar;
