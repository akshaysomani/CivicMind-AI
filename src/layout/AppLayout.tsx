import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useTheme } from '../context/ThemeContext';

export const AppLayout: React.FC = () => {
  const { theme } = useTheme();
  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 gradient-mesh`}
      style={{
        color: theme === 'light' ? '#1e293b' : '#e2e8f0',
      }}
    >
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
