import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/Button';
import { motion } from 'framer-motion';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 relative">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="mb-8 p-6 bg-rose-500/10 rounded-full border border-rose-500/20 text-rose-500 animate-bounce"
      >
        <ShieldAlert className="w-16 h-16" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-4xl sm:text-6xl font-extrabold font-heading text-slate-900 dark:text-slate-100 tracking-tight leading-none mb-4"
      >
        404 &bull; Page Not Found
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-base sm:text-lg text-slate-700 dark:text-slate-400 max-w-md mx-auto mb-8 leading-relaxed"
      >
        The decision space or route you are searching for is outside current municipal boundaries or still in development.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto"
      >
        <Button variant="primary" onClick={() => navigate('/')} className="gap-2 justify-center">
          <Home className="w-4 h-4" />
          <span>Back to Landing</span>
        </Button>
        <Button variant="secondary" onClick={() => navigate(-1)} className="gap-2 justify-center">
          <ArrowLeft className="w-4 h-4" />
          <span>Go Back</span>
        </Button>
      </motion.div>
    </div>
  );
};
export default NotFound;
