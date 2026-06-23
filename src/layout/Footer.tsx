import React from 'react';
import { Link } from 'react-router-dom';
import { Landmark, Github, FileText, ShieldAlert, BookOpen, Mail } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

export const Footer: React.FC = () => {
  const { showNotification } = useNotifications();

  const handleDocumentationTrigger = (e: React.MouseEvent) => {
    e.preventDefault();
    showNotification('System documentation will be generated in upcoming modules!', 'info');
  };

  const handleSocialTrigger = (e: React.MouseEvent, type: string) => {
    e.preventDefault();
    showNotification(`${type} connection is simulated for Module 1.`, 'success');
  };

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-white/5 pt-16 pb-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-md">
                <Landmark className="w-4 h-4" />
              </div>
              <span className="font-heading font-extrabold text-lg text-white">
                Civic<span className="text-primary">Mind</span> AI
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed mb-6">
              Empowering communities with decentralised decision-making support and collaborative intelligence. Driven by multi-agent architectures and citizen collaboration.
            </p>
            <div className="flex gap-4">
              <a
                href="#github"
                onClick={(e) => handleSocialTrigger(e, 'GitHub')}
                className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-white/5 transition-colors"
                aria-label="GitHub Repository Link"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="#docs"
                onClick={handleDocumentationTrigger}
                className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-white/5 transition-colors"
                aria-label="Developer Documentation Link"
              >
                <BookOpen className="w-5 h-5" />
              </a>
              <a
                href="#contact"
                onClick={(e) => handleSocialTrigger(e, 'Contact Email')}
                className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-white/5 transition-colors"
                aria-label="Contact Email Support Link"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-heading font-bold text-sm tracking-wider uppercase mb-5">
              Platform Links
            </h4>
            <ul className="space-y-3.5 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">About Mission</Link>
              </li>
              <li>
                <Link to="/features" className="hover:text-white transition-colors font-medium">Core Features</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* Developer Legal */}
          <div>
            <h4 className="text-white font-heading font-bold text-sm tracking-wider uppercase mb-5">
              Legal & Docs
            </h4>
            <ul className="space-y-3.5 text-sm">
              <li>
                <a href="#privacy" onClick={(e) => { e.preventDefault(); showNotification('Privacy Policy is currently static.', 'info'); }} className="hover:text-white transition-colors flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-slate-500" />
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#terms" onClick={(e) => { e.preventDefault(); showNotification('Terms of Service is currently static.', 'info'); }} className="hover:text-white transition-colors flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-500" />
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#docs" onClick={handleDocumentationTrigger} className="hover:text-white transition-colors flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-slate-500" />
                  API Reference
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} CivicMind AI. All rights reserved.</p>
          <p className="mt-4 md:mt-0">Enterprise Grade SaaS Architecture &bull; Localized Decisions</p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
