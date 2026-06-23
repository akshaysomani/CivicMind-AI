import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { aiService } from '../services/aiService';
import type { AIAgent, AITool, AIStatus, AITelemetryMetrics, AIWorkflowResponse } from '../services/aiService';

export type AgentType = 'citizenAssistant' | 'emergencyIntelligence' | 'governmentScheme' | 'predictiveAI' | null;

export interface Message {
  id: string;
  sender: 'user' | 'agent' | 'system';
  text: string;
  timestamp: Date;
  agentName?: string;
  category?: string;
  isSafetyViolation?: boolean;
  knowledgeSources?: any[];
}

interface AIContextType {
  activeAgent: AgentType;
  setActiveAgent: (agent: AgentType) => void;
  isThinking: boolean;
  setIsThinking: (thinking: boolean) => void;
  chatHistory: Message[];
  sendChatMessage: (text: string) => Promise<void>;
  clearChat: () => void;
  
  // Enterprise Multi-Agent states
  agents: AIAgent[];
  tools: AITool[];
  status: AIStatus | null;
  metrics: AITelemetryMetrics | null;
  workflowResponse: AIWorkflowResponse | null;
  isExecutingWorkflow: boolean;
  
  // Actions
  fetchAgents: () => Promise<void>;
  fetchTools: () => Promise<void>;
  fetchStatus: () => Promise<void>;
  fetchMetrics: () => Promise<void>;
  executeWorkflow: (query: string) => Promise<void>;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  const [activeAgent, setActiveAgent] = useState<AgentType>(null);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [tools, setTools] = useState<AITool[]>([]);
  const [status, setStatus] = useState<AIStatus | null>(null);
  const [metrics, setMetrics] = useState<AITelemetryMetrics | null>(null);
  const [workflowResponse, setWorkflowResponse] = useState<AIWorkflowResponse | null>(null);
  const [isExecutingWorkflow, setIsExecutingWorkflow] = useState<boolean>(false);

  const fetchAgents = useCallback(async () => {
    if (!token) return;
    try {
      const data = await aiService.getAgents(token);
      setAgents(data);
    } catch (err) {
      console.error('Failed to fetch agents:', err);
    }
  }, [token]);

  const fetchTools = useCallback(async () => {
    if (!token) return;
    try {
      const data = await aiService.getTools(token);
      setTools(data);
    } catch (err) {
      console.error('Failed to fetch tools:', err);
    }
  }, [token]);

  const fetchStatus = useCallback(async () => {
    if (!token) return;
    try {
      const data = await aiService.getStatus(token);
      setStatus(data);
    } catch (err) {
      console.error('Failed to fetch AI status:', err);
    }
  }, [token]);

  const fetchMetrics = useCallback(async () => {
    if (!token) return;
    try {
      const data = await aiService.getMetrics(token);
      setMetrics(data);
    } catch (err) {
      console.error('Failed to fetch AI metrics:', err);
    }
  }, [token]);

  // Initial load when token is ready
  useEffect(() => {
    if (token) {
      fetchAgents();
      fetchTools();
      fetchStatus();
      fetchMetrics();
    }
  }, [token, fetchAgents, fetchTools, fetchStatus, fetchMetrics]);

  const sendChatMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Math.random().toString(36).substring(2, 9),
      sender: 'user',
      text,
      timestamp: new Date(),
    };

    setChatHistory((prev) => [...prev, userMsg]);
    setIsThinking(true);

    try {
      // Create session id tied to token prefix
      const sessionId = 'session_react_' + (token ? token.substring(0, 8) : 'anon');
      const res = await aiService.chat(text, sessionId, token);
      
      const agentMsg: Message = {
        id: Math.random().toString(36).substring(2, 9),
        sender: 'agent',
        text: res.response,
        timestamp: new Date(),
        agentName: res.agent,
        category: res.category,
        isSafetyViolation: !res.safety.safe,
        knowledgeSources: res.knowledge_sources,
      };
      
      setChatHistory((prev) => [...prev, agentMsg]);
      
      // Update telemetry records
      fetchMetrics();
    } catch (err: any) {
      const errMsg: Message = {
        id: Math.random().toString(36).substring(2, 9),
        sender: 'system',
        text: `Error contacting CivicMind AI: ${err.message}`,
        timestamp: new Date(),
      };
      setChatHistory((prev) => [...prev, errMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const executeWorkflow = async (query: string) => {
    if (!query.trim() || !token) return;
    setIsExecutingWorkflow(true);
    setWorkflowResponse(null);

    try {
      const sessionId = 'session_wf_' + token.substring(0, 8);
      const res = await aiService.executeWorkflow(query, sessionId, token);
      setWorkflowResponse(res);
      fetchMetrics();
    } catch (err) {
      console.error('Workflow execution failed:', err);
    } finally {
      setIsExecutingWorkflow(false);
    }
  };

  const clearChat = () => {
    setChatHistory([]);
    setIsThinking(false);
  };

  return (
    <AIContext.Provider
      value={{
        activeAgent,
        setActiveAgent,
        isThinking,
        setIsThinking,
        chatHistory,
        sendChatMessage,
        clearChat,
        agents,
        tools,
        status,
        metrics,
        workflowResponse,
        isExecutingWorkflow,
        fetchAgents,
        fetchTools,
        fetchStatus,
        fetchMetrics,
        executeWorkflow,
      }}
    >
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};
export default AIContext;
