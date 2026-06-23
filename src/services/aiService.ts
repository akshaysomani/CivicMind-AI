const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

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
}

export const aiService = new AIService();
export default aiService;
