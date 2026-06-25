import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ShieldCheck, 
  Key, 
  Bot, 
  Settings, 
  ShieldAlert, 
  FileText, 
  Building2, 
  BookOpen, 
  TerminalSquare, 
  Activity,
  LogOut,
  Menu,
  X,
  ClipboardCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { to: '/dashboard/admin/users', icon: Users, label: 'Users' },
    { to: '/dashboard/admin/roles', icon: ShieldCheck, label: 'Roles' },
    { to: '/dashboard/admin/permissions', icon: Key, label: 'Permissions' },
    { to: '/dashboard/admin/agents', icon: Bot, label: 'AI Operations' },
    { to: '/dashboard/admin/departments', icon: Building2, label: 'Departments' },
    { to: '/dashboard/admin/knowledge', icon: BookOpen, label: 'Knowledge' },
    { to: '/dashboard/admin/api', icon: TerminalSquare, label: 'API Console' },
    { to: '/dashboard/admin/monitoring', icon: Activity, label: 'Monitoring' },
    { to: '/dashboard/admin/audit', icon: FileText, label: 'Audit Logs' },
    { to: '/dashboard/admin/security', icon: ShieldAlert, label: 'Security Center' },
    { to: '/dashboard/admin/qa', icon: ClipboardCheck, label: 'QA & Testing' },
    { to: '/dashboard/admin/settings', icon: Settings, label: 'System Settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside 
        className={clsx(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-indigo-500" />
            <span className="font-bold text-lg text-white">Admin Console</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-700">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) => clsx(
                "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-indigo-500/10 text-indigo-400" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
              <span className="font-bold text-white">{currentUser?.first_name?.charAt(0) || 'A'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{currentUser?.first_name} {currentUser?.last_name}</p>
              <p className="text-xs text-slate-500 truncate">{currentUser?.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center px-4 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-400 hover:text-white mr-4">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-indigo-500" />
            <span className="font-semibold text-white">CivicMind Enterprise</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
