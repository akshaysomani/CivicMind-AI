const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

export interface AIAgent {
  name: string;
  role: string;
  description: string;
  version: string;
  tools: string[];
  dependencies: string[];
  status: 'Optimal' | 'Degraded' | 'Offline';
}

export interface AITool {
  name: string;
  description: string;
  input_schema: Record<string, any>;
  output_schema: Record<string, any>;
  permissions: string[];
  timeout: number;
  retry_policy: Record<string, any>;
}

export interface AIChatResponse {
  response: string;
  category: string;
  agent: string;
  safety: {
    safe: boolean;
    reason: string;
  };
  session_id: string;
  duration_ms: number;
  knowledge_sources?: {
    doc_id: string;
    title: string;
    content: string;
    category: string;
    score: number;
  }[];
}

export interface AITelemetryMetrics {
  total_queries: number;
  success_rate: number;
  average_latency_ms: number;
  total_tokens: number;
  status_breakdown: Record<string, number>;
}

export interface AIStatus {
  status: string;
  agent_count: number;
  tool_count: number;
  active_models: string[];
  fallback_langgraph_enabled: boolean;
}

export interface TaskTrace {
  task_id: string;
  type: string;
  target: string;
  status: 'completed' | 'failed' | 'running' | 'pending';
  duration_ms: number;
  output: any;
}

export interface AIWorkflowResponse {
  query: string;
  status: 'success' | 'failure' | 'blocked';
  plan: {
    task_id: string;
    type: string;
    target: string;
    input_args: Record<string, any>;
    dependencies: string[];
    status: string;
  }[];
  workflow_results: {
    status: string;
    trace: TaskTrace[];
    duration_ms: number;
    completed: string[];
    failed: string[];
    context: Record<string, any>;
  };
}

export interface AIConversation {
  id: number;
  title: string;
  category: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  message_count?: number;
}

export interface AIMessage {
  id: number;
  sender: 'user' | 'agent' | 'system';
  text: string;
  timestamp: string;
  agent_name?: string;
  category?: string;
  confidence?: number;
  tokens_used?: number;
  is_safety_violation: boolean;
  knowledge_sources?: any[];
  feedback?: 'like' | 'dislike' | null;
}

export interface ConversationDetailResponse extends AIConversation {
  messages: AIMessage[];
}

export interface MessageSendResponse {
  conversation_id: number;
  user_message: AIMessage;
  agent_message: AIMessage;
}

class AIService {
  private getHeaders(token?: string | null): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  public async chat(query: string, sessionId: string, token: string | null): Promise<AIChatResponse> {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({ query, session_id: sessionId }),
    });
    if (!res.ok) throw new Error('AI Chat interaction failed.');
    return res.json();
  }

  public async getAgents(token: string | null): Promise<AIAgent[]> {
    const res = await fetch(`${API_BASE}/ai/agents`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to fetch AI agents.');
    return res.json();
  }

  public async getTools(token: string | null): Promise<AITool[]> {
    const res = await fetch(`${API_BASE}/ai/tools`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to fetch AI tools.');
    return res.json();
  }

  public async getStatus(token: string | null): Promise<AIStatus> {
    const res = await fetch(`${API_BASE}/ai/status`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to fetch AI orchestrator status.');
    return res.json();
  }

  public async getMetrics(token: string | null): Promise<AITelemetryMetrics> {
    const res = await fetch(`${API_BASE}/ai/metrics`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to fetch AI telemetry metrics.');
    return res.json();
  }

  public async executeWorkflow(query: string, sessionId: string, token: string | null): Promise<AIWorkflowResponse> {
    const res = await fetch(`${API_BASE}/ai/workflow`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({ query, session_id: sessionId }),
    });
    if (!res.ok) throw new Error('Workflow execution failed.');
    return res.json();
  }

  // Persistent Multi-Turn Client Helpers
  public async createConversation(title: string, token: string | null): Promise<AIConversation> {
    const res = await fetch(`${API_BASE}/ai/conversation`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({ title }),
    });
    if (!res.ok) throw new Error('Failed to initialize a new conversation.');
    return res.json();
  }

  public async getHistory(token: string | null): Promise<AIConversation[]> {
    const res = await fetch(`${API_BASE}/ai/history`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to load conversation logs history.');
    return res.json();
  }

  public async getConversationDetails(id: number, token: string | null): Promise<ConversationDetailResponse> {
    const res = await fetch(`${API_BASE}/ai/conversation/${id}`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to load chat details.');
    return res.json();
  }

  public async sendMessage(conversationId: number, text: string, token: string | null): Promise<MessageSendResponse> {
    const res = await fetch(`${API_BASE}/ai/message`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({ conversation_id: conversationId, text }),
    });
    if (!res.ok) throw new Error('Failed to transmit message payload.');
    return res.json();
  }

  public async togglePinConversation(id: number, token: string | null): Promise<{ id: number; is_pinned: boolean }> {
    const res = await fetch(`${API_BASE}/ai/conversation/${id}/pin`, {
      method: 'POST',
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to pin active thread.');
    return res.json();
  }

  public async deleteConversation(id: number, token: string | null): Promise<{ status: string; id: number }> {
    const res = await fetch(`${API_BASE}/ai/conversation/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to delete thread record.');
    return res.json();
  }

  public async submitFeedback(messageId: number, feedback: 'like' | 'dislike', token: string | null): Promise<{ message_id: number; feedback: string }> {
    const res = await fetch(`${API_BASE}/ai/feedback`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({ message_id: messageId, feedback }),
    });
    if (!res.ok) throw new Error('Failed to post message feedback.');
    return res.json();
  }

  public async getSuggestions(token: string | null): Promise<string[]> {
    const res = await fetch(`${API_BASE}/ai/suggestions`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to query dynamic suggestion query lists.');
    return res.json();
  }
}

export const aiService = new AIService();
export default aiService;
