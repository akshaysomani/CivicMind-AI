export interface QASummary {
  total: number;
  passed: number;
  failed: number;
  errors: number;
  skipped: number;
  duration_seconds: number;
  success_rate: number;
}

export interface QAWebSuite {
  name: string;
  tests: number;
  passed: number;
  failed: number;
  status: string;
}

export interface QAResults {
  status: string;
  summary: QASummary;
  suites: QAWebSuite[];
}

export interface QACoverage {
  overall_coverage: number;
  by_module: {
    [key: string]: number;
  };
}

export interface QAAccessibilityRule {
  id: string;
  name: string;
  status: string;
  score: number;
}

export interface QAAccessibility {
  score: number;
  wcag_level: string;
  readiness: string;
  rules: QAAccessibilityRule[];
}

export interface QAPerformanceHistory {
  timestamp: string;
  latency: number;
  ai_time: number;
}

export interface QAPerformance {
  dashboard_load_time_ms: number;
  ai_response_time_ms: number;
  api_latency_ms: number;
  map_render_time_ms: number;
  bundle_size_kb: number;
  memory_usage_mb: number;
  history: QAPerformanceHistory[];
}

export interface QAReleaseItem {
  id: string;
  name: string;
  status: string;
  category: string;
}

export interface QARelease {
  score: number;
  status: string;
  checklist: QAReleaseItem[];
}

export interface QAComponentHealth {
  status: string;
  latency_ms: number;
  details: string;
}

export interface QAHealth {
  status: string;
  timestamp: string;
  components: {
    database: QAComponentHealth;
    redis_cache: QAComponentHealth;
    gemini_api: QAComponentHealth;
    ai_agents: {
      status: string;
      count: number;
      details: string;
    };
  };
}

const API_BASE = (localStorage.getItem('VITE_API_BASE_URL') || 'http://localhost:8000/api/v1') + '/qa';

async function fetchQAAPI(endpoint: string, method: string = "GET", body?: any): Promise<any> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authorization token present.");
  
  const headers: HeadersInit = {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  };
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  
  if (!response.ok) {
    throw new Error(`QA API Error: ${response.statusText}`);
  }
  return await response.ok ? await response.json() : null;
}

export const qaService = {
  getResults: async (): Promise<QAResults> => {
    return await fetchQAAPI("/results");
  },
  getCoverage: async (): Promise<QACoverage> => {
    return await fetchQAAPI("/coverage");
  },
  getAccessibility: async (): Promise<QAAccessibility> => {
    return await fetchQAAPI("/accessibility");
  },
  getPerformance: async (): Promise<QAPerformance> => {
    return await fetchQAAPI("/performance");
  },
  getRelease: async (): Promise<QARelease> => {
    return await fetchQAAPI("/release");
  },
  getHealth: async (): Promise<QAHealth> => {
    return await fetchQAAPI("/health");
  },
  triggerTestRun: async (): Promise<{ status: string; message: string }> => {
    return await fetchQAAPI("/run-tests", "POST");
  }
};
