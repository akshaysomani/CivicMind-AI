import React from 'react';
import { Link } from 'react-router-dom';
import { Landmark, Github, FileText, ShieldAlert, BookOpen, Mail, Twitter, Linkedin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 dark:bg-slate-955 light:bg-[#FAFAF8] text-slate-400 dark:text-slate-400 light:text-[#6B6B66] border-t border-white/5 dark:border-white/5 light:border-[#E8E8E4] pt-16 pb-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-md">
                <Landmark className="w-4 h-4" />
              </div>
              <span className="font-heading font-extrabold text-lg text-white dark:text-white light:text-[#1A1A18]">
                Civic<span className="text-primary">Mind</span> AI
              </span>
            </Link>
            <p className="text-sm text-slate-400 dark:text-slate-400 light:text-[#6B6B66] max-w-sm leading-relaxed mb-6">
              Empowering communities with decentralised decision-making support and collaborative intelligence. Driven by multi-agent architectures and citizen collaboration.
            </p>
            <div className="flex gap-4">
              <a
                href="https://github.com/akshaysomani/CivicMind-AI.git"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-slate-900 dark:bg-slate-900 light:bg-[#FAFAF8] hover:bg-slate-800 dark:hover:bg-slate-800 light:hover:bg-[#F0EFEB] text-slate-400 dark:text-slate-400 light:text-[#6B6B66] hover:text-white dark:hover:text-white light:hover:text-[#1A1A18] rounded-xl border border-white/5 dark:border-white/5 light:border-[#E8E8E4] transition-colors"
                aria-label="GitHub Repository"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-slate-900 dark:bg-slate-900 light:bg-[#FAFAF8] hover:bg-slate-800 dark:hover:bg-slate-800 light:hover:bg-[#F0EFEB] text-slate-400 dark:text-slate-400 light:text-[#6B6B66] hover:text-white dark:hover:text-white light:hover:text-[#1A1A18] rounded-xl border border-white/5 dark:border-white/5 light:border-[#E8E8E4] transition-colors"
                aria-label="Twitter / X Profile"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-slate-900 dark:bg-slate-900 light:bg-[#FAFAF8] hover:bg-slate-800 dark:hover:bg-slate-800 light:hover:bg-[#F0EFEB] text-slate-400 dark:text-slate-400 light:text-[#6B6B66] hover:text-white dark:hover:text-white light:hover:text-[#1A1A18] rounded-xl border border-white/5 dark:border-white/5 light:border-[#E8E8E4] transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="mailto:support@civicmind.ai"
                className="p-2 bg-slate-900 dark:bg-slate-900 light:bg-[#FAFAF8] hover:bg-slate-800 dark:hover:bg-slate-800 light:hover:bg-[#F0EFEB] text-slate-400 dark:text-slate-400 light:text-[#6B6B66] hover:text-white dark:hover:text-white light:hover:text-[#1A1A18] rounded-xl border border-white/5 dark:border-white/5 light:border-[#E8E8E4] transition-colors"
                aria-label="Email Support"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white dark:text-white light:text-[#1A1A18] font-heading font-bold text-sm tracking-wider uppercase mb-5">
              Platform Links
            </h4>
            <ul className="space-y-3.5 text-sm">
              <li>
                <Link to="/" className="hover:text-white dark:hover:text-white light:hover:text-[#1A1A18] transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white dark:hover:text-white light:hover:text-[#1A1A18] transition-colors">About Mission</Link>
              </li>
              <li>
                <Link to="/features" className="hover:text-white dark:hover:text-white light:hover:text-[#1A1A18] transition-colors font-medium">Core Features</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white dark:hover:text-white light:hover:text-[#1A1A18] transition-colors">Contact Us</Link>
              </li>
              <li>
                <a href="mailto:support@civicmind.ai" className="hover:text-white dark:hover:text-white light:hover:text-[#1A1A18] transition-colors">
                  support@civicmind.ai
                </a>
              </li>
            </ul>
          </div>

          {/* Developer Legal */}
          <div>
            <h4 className="text-white dark:text-white light:text-[#1A1A18] font-heading font-bold text-sm tracking-wider uppercase mb-5">
              Legal & Docs
            </h4>
            <ul className="space-y-3.5 text-sm">
              <li>
                <Link to="/about" className="hover:text-white dark:hover:text-white light:hover:text-[#1A1A18] transition-colors flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-slate-500" />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white dark:hover:text-white light:hover:text-[#1A1A18] transition-colors flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-500" />
                  Terms of Service
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/akshaysomani/CivicMind-AI.git"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white dark:hover:text-white light:hover:text-[#1A1A18] transition-colors flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4 text-slate-500" />
                  System Documentation
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/akshaysomani/CivicMind-AI.git"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white dark:hover:text-white light:hover:text-[#1A1A18] transition-colors flex items-center gap-2"
                >
                  <Github className="w-4 h-4 text-slate-500" />
                  API Reference
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="border-t border-white/5 dark:border-white/5 light:border-[#E8E8E4] pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 dark:text-slate-500 light:text-[#ABABAB]">
          <p>&copy; {new Date().getFullYear()} CivicMind AI. All rights reserved.</p>
          <p className="mt-4 md:mt-0">Enterprise Grade SaaS Architecture &bull; Localized Decisions</p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
