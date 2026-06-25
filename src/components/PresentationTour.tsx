import React from 'react';
import { usePresentation, TOUR_STEPS } from '../context/PresentationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, X, Rocket, Award, UserCheck, Sparkles } from 'lucide-react';

export const PresentationTour: React.FC = () => {
  const {
    isTourActive,
    currentTourStep,
    nextStep,
    prevStep,
    endTour
  } = usePresentation();

  if (!isTourActive) return null;

  const currentStep = TOUR_STEPS[currentTourStep];
  const isFirstStep = currentTourStep === 0;
  const isLastStep = currentTourStep === TOUR_STEPS.length - 1;

  return (
    <AnimatePresence>
      {/* Top Presentation Mode Alert Banner */}
      <motion.div 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-indigo-600/90 backdrop-blur-md text-white py-2 text-center text-xs font-bold shadow-lg flex items-center justify-center gap-3 border-b border-indigo-500/20"
      >
        <Sparkles className="w-4 h-4 animate-pulse text-indigo-300" />
        <span>CivicMind AI Hackathon Presentation Mode Active — Step {currentTourStep + 1} of {TOUR_STEPS.length}</span>
        <button 
          onClick={endTour}
          className="px-2.5 py-0.5 bg-white/10 hover:bg-white/20 text-3xs font-black uppercase tracking-wider rounded-md border border-white/25 transition-colors cursor-pointer"
        >
          Exit Guided Tour
        </button>
      </motion.div>

      <div className="fixed bottom-6 right-6 z-55 w-96 max-w-[calc(100vw-3rem)]">

        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="p-6 bg-slate-950/90 backdrop-blur-xl border border-indigo-500/40 rounded-2xl shadow-2xl shadow-indigo-500/10 space-y-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
                <Rocket className="w-4.5 h-4.5 animate-pulse" />
              </span>
              <span className="text-2xs font-semibold uppercase tracking-wider text-slate-400">
                Hackathon Guided Tour
              </span>
            </div>
            <button 
              onClick={endTour}
              className="text-slate-500 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Body content */}
          <div className="space-y-2">
            <span className="text-2xs font-bold text-indigo-400 uppercase tracking-widest">
              Step {currentTourStep + 1} of {TOUR_STEPS.length}
            </span>
            <h3 className="text-base font-extrabold text-white leading-tight">
              {currentStep.title}
            </h3>
            <p className="text-xs text-slate-350 leading-relaxed">
              {currentStep.description}
            </p>
          </div>

          {/* Role simulation helper */}
          {currentStep.roleHint && (
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-2.5">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <div className="text-left">
                <p className="text-3xs uppercase tracking-wider text-slate-500 font-bold">Simulated Persona</p>
                <p className="text-xs font-semibold text-white">{currentStep.roleHint} Profile Mode</p>
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-900">
            {/* Dots indicator */}
            <div className="flex gap-1.5">
              {TOUR_STEPS.map((_, i) => (
                <div 
                  key={i} 
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === currentTourStep 
                      ? 'bg-indigo-500 w-4' 
                      : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center gap-2">
              {!isFirstStep && (
                <button
                  onClick={prevStep}
                  className="p-1.5 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all cursor-pointer"
                  aria-label="Previous step"
                >
                  <ChevronLeft className="w-4.5 h-4.5" />
                </button>
              )}
              
              <button
                onClick={nextStep}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/25 transition-all cursor-pointer"
              >
                {isLastStep ? (
                  <>
                    Finish
                    <Award className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
export default PresentationTour;
