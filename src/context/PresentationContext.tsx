import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface TourStep {
  title: string;
  description: string;
  route: string;
  highlightSelector?: string;
  roleHint?: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    title: "CivicMind AI Platform Overview",
    description: "Welcome to the Guided Walkthrough! CivicMind AI integrates multi-agent collaborative intelligence with interactive GIS mapping to empower citizens and local governments.",
    route: "/"
  },
  {
    title: "Citizen Spatial Intelligence",
    description: "We are now inside the Citizen Portal. Citizens can report issues with geolocated parameters, examine ward boundaries, and analyze local safety layers in real-time.",
    route: "/dashboard/citizen/map",
    roleHint: "Citizen"
  },
  {
    title: "Gemini AI Assistant & Multi-Agent Routing",
    description: "Here, citizens interact with the AI assistant. Our context-aware router dynamically delegates prompts to specialized agents (GIS, health, schemes) backed by safety guardrails.",
    route: "/dashboard/citizen/assistant",
    roleHint: "Citizen"
  },
  {
    title: "Government Dispatch & Triage Console",
    description: "Inside the Government Portal, officers triage reports, dispatch municipal workers, track resources, compile analytics trends, and review automated briefs.",
    route: "/dashboard/government/issues",
    roleHint: "Government"
  },
  {
    title: "Enterprise Quality Assurance & Testing",
    description: "Finally, the QA Dashboard details real-time execution statistics for all 108 unit/regression tests, WCAG AA compliance markers, and platform health gauges.",
    route: "/dashboard/admin/qa",
    roleHint: "Admin"
  }
];

interface PresentationContextType {
  isDemoMode: boolean;
  isTourActive: boolean;
  currentTourStep: number;
  toggleDemoMode: () => void;
  startTour: () => void;
  endTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
}

const PresentationContext = createContext<PresentationContextType | undefined>(undefined);

export const PresentationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [isTourActive, setIsTourActive] = useState<boolean>(false);
  const [currentTourStep, setCurrentTourStep] = useState<number>(0);
  
  const navigate = useNavigate();
  const location = useLocation();

  const toggleDemoMode = useCallback(() => {
    setIsDemoMode(prev => !prev);
  }, []);

  const startTour = useCallback(() => {
    setIsTourActive(true);
    setCurrentTourStep(0);
    navigate("/");
  }, [navigate]);

  const endTour = useCallback(() => {
    setIsTourActive(false);
    setCurrentTourStep(0);
  }, []);

  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex < 0 || stepIndex >= TOUR_STEPS.length) return;
    
    setCurrentTourStep(stepIndex);
    const targetRoute = TOUR_STEPS[stepIndex].route;
    
    // Auto login/mock user context if role matches
    const role = TOUR_STEPS[stepIndex].roleHint;
    if (role && targetRoute.startsWith('/dashboard')) {
      // Set a mock user in localStorage to bypass route guards
      const mockUser = {
        id: 1,
        first_name: "Demo",
        last_name: role,
        email: `${role.toLowerCase()}@civicmind.demo`,
        role: role === 'Admin' ? 'Admin' : role,
        city: "San Francisco",
        state: "California",
        country: "USA",
        email_verified: true,
        account_status: "active"
      };
      
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', 'mock-demo-token-123');
      // Trigger session refresh (simple reload or window event if context listens to localStorage)
      window.dispatchEvent(new Event('storage'));
    }
    
    navigate(targetRoute);
  }, [navigate]);

  const nextStep = useCallback(() => {
    if (currentTourStep < TOUR_STEPS.length - 1) {
      goToStep(currentTourStep + 1);
    } else {
      endTour();
    }
  }, [currentTourStep, goToStep, endTour]);

  const prevStep = useCallback(() => {
    if (currentTourStep > 0) {
      goToStep(currentTourStep - 1);
    }
  }, [currentTourStep, goToStep]);

  // Keep tour sync if page route is changed manually
  useEffect(() => {
    if (!isTourActive) return;
    const currentRoute = TOUR_STEPS[currentTourStep].route;
    if (location.pathname !== currentRoute) {
      // Find matching step index
      const matchingStep = TOUR_STEPS.findIndex(step => step.route === location.pathname);
      if (matchingStep !== -1 && matchingStep !== currentTourStep) {
        setCurrentTourStep(matchingStep);
      }
    }
  }, [location.pathname, isTourActive, currentTourStep]);

  return (
    <PresentationContext.Provider
      value={{
        isDemoMode,
        isTourActive,
        currentTourStep,
        toggleDemoMode,
        startTour,
        endTour,
        nextStep,
        prevStep,
        goToStep
      }}
    >
      {children}
    </PresentationContext.Provider>
  );
};

export const usePresentation = () => {
  const context = useContext(PresentationContext);
  if (context === undefined) {
    throw new Error('usePresentation must be used within a PresentationProvider');
  }
  return context;
};
