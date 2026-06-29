const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

export interface ForecastDashboard {
  overall_forecast_index: number;
  total_warnings_active: number;
  avg_forecast_confidence: number;
  department_readiness: number;
  freshness: string;
  top_risks: {
    domain: string;
    likelihood: number;
    severity: string;
    impact_score: number;
    affected_population_estimate: number;
    readiness: number;
  }[];
}

export interface ForecastTrends {
  range: string;
  labels: string[];
  infrastructure_forecast: number[];
  emergency_forecast: number[];
  healthcare_demand_forecast: number[];
  schemes_demand_forecast: number[];
}

export interface ForecastRisk {
  domain: string;
  likelihood: number;
  severity: string;
  impact_score: number;
  affected_population_estimate: number;
  readiness: number;
}

export interface EarlyWarning {
  id: number;
  pattern: string;
  evidence: string;
  confidence: number;
  affected_locations: string[];
  preventive_action: string;
}

export interface PreventiveRecommendation {
  id: number;
  title: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  confidence: number;
  impact: string;
  evidence: string;
  responsible_departments: string[];
  triggered?: boolean; // local visual status tracking
}

export interface SimulationResult {
  simulated_complaints_reduction_percent: number;
  readiness_boost_percent: number;
  estimated_response_reduction_minutes: number;
  impact_rationale: string;
}

export interface ForecastConfidenceProfile {
  overall_accuracy_score: number;
  historical_match_rate: number;
  data_freshness_seconds: number;
  total_grounded_signals: number;
  limitations: string;
}

export interface GeospatialHeatmapPin {
  id: number;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  risk_score: number;
  confidence_level: number;
  estimated_impacted_citizens: number;
}

class ForecastService {
  private getHeaders(token?: string | null): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  public async getDashboard(token: string | null): Promise<ForecastDashboard> {
    const res = await fetch(`${API_BASE}/forecast/dashboard`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to fetch forecasting dashboard summaries.');
    return res.json();
  }

  public async getTrends(range: string, token: string | null): Promise<ForecastTrends> {
    const res = await fetch(`${API_BASE}/forecast/trends?range=${encodeURIComponent(range)}`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to fetch forecasting time series trends.');
    return res.json();
  }

  public async getRisks(token: string | null): Promise<ForecastRisk[]> {
    const res = await fetch(`${API_BASE}/forecast/risks`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to fetch risk assessment data.');
    return res.json();
  }

  public async getWarnings(token: string | null): Promise<EarlyWarning[]> {
    const res = await fetch(`${API_BASE}/forecast/warnings`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to fetch early warnings.');
    return res.json();
  }

  public async getRecommendations(token: string | null): Promise<PreventiveRecommendation[]> {
    const res = await fetch(`${API_BASE}/forecast/recommendations`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to fetch preventive recommendations.');
    return res.json();
  }

  public async runSimulation(
    inputs: { staff_increase: number; maintenance_teams: number; awareness_campaigns: boolean },
    token: string | null
  ): Promise<SimulationResult> {
    const res = await fetch(`${API_BASE}/forecast/scenario`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify(inputs),
    });
    if (!res.ok) throw new Error('Failed to execute policy scenario simulation.');
    return res.json();
  }

  public async getConfidence(token: string | null): Promise<ForecastConfidenceProfile> {
    const res = await fetch(`${API_BASE}/forecast/confidence`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to fetch forecasting confidence parameters.');
    return res.json();
  }

  public async getGeospatial(token: string | null): Promise<GeospatialHeatmapPin[]> {
    const res = await fetch(`${API_BASE}/forecast/geospatial`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to fetch geospatial forecast coordinates.');
    return res.json();
  }
}

export const forecastService = new ForecastService();
