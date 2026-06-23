import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { aiService } from '../services/aiService';
import type { 
  AIAgent, AITool, AIStatus, AITelemetryMetrics, 
  AIWorkflowResponse, AIConversation, AIMessage 
} from '../services/aiService';


export type AgentType = 'citizenAssistant' | 'emergencyIntelligence' | 'governmentScheme' | 'predictiveAI' | null;

export interface Message {
  id: string;
  sender: 'user' | 'agent' | 'system';
  text: string;
  timestamp: Date;
  agentName?: string;
  category?: string;
  isSafetyViolation?: boolean;
  confidence?: number;
  knowledgeSources?: any[];
  feedback?: 'like' | 'dislike' | null;
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
  
  // Persistent Multi-turn Chat States
  conversations: AIConversation[];
  activeConversationId: number | null;
  activeMessages: AIMessage[];
  suggestions: string[];
  
  // Persistent Actions
  fetchAgents: () => Promise<void>;
  fetchTools: () => Promise<void>;
  fetchStatus: () => Promise<void>;
  fetchMetrics: () => Promise<void>;
  executeWorkflow: (query: string) => Promise<void>;
  
  fetchHistory: () => Promise<void>;
  selectConversation: (id: number) => Promise<void>;
  createConversation: (title?: string) => Promise<number>;
  deleteConversation: (id: number) => Promise<void>;
  togglePinConversation: (id: number) => Promise<void>;
  sendThreadMessage: (text: string) => Promise<void>;
  submitMessageFeedback: (messageId: number, feedback: 'like' | 'dislike') => Promise<void>;
  fetchSuggestions: () => Promise<void>;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  
  // Legacy backward compatible states
  const [activeAgent, setActiveAgent] = useState<AgentType>(null);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  
  // Enterprise states
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [tools, setTools] = useState<AITool[]>([]);
  const [status, setStatus] = useState<AIStatus | null>(null);
  const [metrics, setMetrics] = useState<AITelemetryMetrics | null>(null);
  const [workflowResponse, setWorkflowResponse] = useState<AIWorkflowResponse | null>(null);
  const [isExecutingWorkflow, setIsExecutingWorkflow] = useState<boolean>(false);

  // Persistent Multi-turn States
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [activeMessages, setActiveMessages] = useState<AIMessage[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

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

  const fetchHistory = useCallback(async () => {
    if (!token) return;
    try {
      const data = await aiService.getHistory(token);
      setConversations(data);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  }, [token]);

  const fetchSuggestions = useCallback(async () => {
    if (!token) return;
    try {
      const data = await aiService.getSuggestions(token);
      setSuggestions(data);
    } catch (err) {
      console.error('Failed to fetch suggestions:', err);
    }
  }, [token]);

  // Initial load when token is ready
  useEffect(() => {
    if (token) {
      fetchAgents();
      fetchTools();
      fetchStatus();
      fetchMetrics();
      fetchHistory();
      fetchSuggestions();
    }
  }, [token, fetchAgents, fetchTools, fetchStatus, fetchMetrics, fetchHistory, fetchSuggestions]);

  const selectConversation = async (id: number) => {
    if (!token) return;
    try {
      const data = await aiService.getConversationDetails(id, token);
      setActiveConversationId(data.id);
      setActiveMessages(data.messages);
    } catch (err) {
      console.error('Failed to select conversation:', err);
    }
  };

  const createConversation = async (title = 'New AI Assistant Chat'): Promise<number> => {
    if (!token) return 0;
    try {
      const data = await aiService.createConversation(title, token);
      setConversations((prev) => [data, ...prev]);
      setActiveConversationId(data.id);
      setActiveMessages([]);
      return data.id;
    } catch (err) {
      console.error('Failed to create conversation:', err);
      return 0;
    }
  };

  const deleteConversation = async (id: number) => {
    if (!token) return;
    try {
      await aiService.deleteConversation(id, token);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConversationId === id) {
        setActiveConversationId(null);
        setActiveMessages([]);
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  const togglePinConversation = async (id: number) => {
    if (!token) return;
    try {
      const data = await aiService.togglePinConversation(id, token);
      setConversations((prev) =>
        prev
          .map((c) => (c.id === id ? { ...c, is_pinned: data.is_pinned } : c))
          .sort((a, b) => {
            if (a.is_pinned && !b.is_pinned) return -1;
            if (!a.is_pinned && b.is_pinned) return 1;
            return b.id - a.id;
          })
      );
    } catch (err) {
      console.error('Failed to pin conversation:', err);
    }
  };

  const sendThreadMessage = async (text: string) => {
    if (!text.trim() || !token) return;

    let currentConvId = activeConversationId;
    if (!currentConvId) {
      currentConvId = await createConversation(text.substring(0, 30));
      if (!currentConvId) return;
    }

    setIsThinking(true);
    // Add user message optimistically
    const tempUserMsg: AIMessage = {
      id: Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
      is_safety_violation: false,
    };
    setActiveMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await aiService.sendMessage(currentConvId, text, token);
      
      // Update with exact values from server
      setActiveMessages((prev) =>
        prev.map((m) => (m.id === tempUserMsg.id ? res.user_message : m)).concat(res.agent_message)
      );
      
      // Update history catalog titles
      fetchHistory();
      fetchMetrics();
    } catch (err: any) {
      const errorMsg: AIMessage = {
        id: Date.now() + 1,
        sender: 'system',
        text: `Message delivery error: ${err.message}`,
        timestamp: new Date().toISOString(),
        is_safety_violation: false,
      };
      setActiveMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const submitMessageFeedback = async (messageId: number, feedback: 'like' | 'dislike') => {
    if (!token) return;
    try {
      await aiService.submitFeedback(messageId, feedback, token);
      setActiveMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, feedback } : m))
      );
    } catch (err) {
      console.error('Failed to submit message feedback:', err);
    }
  };

  // Legacy Adapter: map activeMessages list to backward compatible chatHistory Message[] format
  const chatHistory: Message[] = activeMessages.map((msg) => ({
    id: String(msg.id),
    sender: msg.sender,
    text: msg.text,
    timestamp: new Date(msg.timestamp),
    agentName: msg.agent_name,
    category: msg.category,
    isSafetyViolation: msg.is_safety_violation,
    knowledgeSources: msg.knowledge_sources,
    feedback: msg.feedback,
  }));

  const sendChatMessage = async (text: string) => {
    // legacy adapter maps straight to sending message on active or default thread
    await sendThreadMessage(text);
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
    setActiveMessages([]);
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
        conversations,
        activeConversationId,
        activeMessages,
        suggestions,
        fetchAgents,
        fetchTools,
        fetchStatus,
        fetchMetrics,
        executeWorkflow,
        fetchHistory,
        selectConversation,
        createConversation,
        deleteConversation,
        togglePinConversation,
        sendThreadMessage,
        submitMessageFeedback,
        fetchSuggestions,
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
