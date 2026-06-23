import React, { createContext, useContext, useState } from 'react';

export type AgentType = 'citizenAssistant' | 'emergencyIntelligence' | 'governmentScheme' | 'predictiveAI' | null;

export interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: Date;
  agentName?: string;
}

interface AIContextType {
  activeAgent: AgentType;
  setActiveAgent: (agent: AgentType) => void;
  isThinking: boolean;
  setIsThinking: (thinking: boolean) => void;
  chatHistory: Message[];
  sendChatMessage: (text: string) => Promise<void>;
  clearChat: () => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeAgent, setActiveAgent] = useState<AgentType>(null);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);

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

    // Mock thinking timeout for Module 1
    setTimeout(() => {
      const agentMsg: Message = {
        id: Math.random().toString(36).substring(2, 9),
        sender: 'agent',
        text: `CivicMind AI Agents are currently offline for development (Module 1 Foundation). We will activate full LangGraph multi-agent capabilities in Module 7! You asked: "${text}"`,
        timestamp: new Date(),
        agentName: activeAgent ? activeAgent.replace(/([A-Z])/g, ' $1').trim() : 'Central AI Coordinator',
      };
      setChatHistory((prev) => [...prev, agentMsg]);
      setIsThinking(false);
    }, 1500);
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
