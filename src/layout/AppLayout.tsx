import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300 bg-slate-900 text-slate-100 dark:bg-slate-900 dark:text-slate-100 light:bg-slate-50 light:text-slate-900 gradient-mesh dark:gradient-mesh light:gradient-mesh-light">
      <Navbar />
      
      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Outlet />
      </main>
      
      <Footer />
    </div>
  );
};
export default AppLayout;
