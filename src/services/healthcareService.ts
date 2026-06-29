const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

export interface MedicalFacility {
  id: number;
  name: string;
  type: 'Hospital' | 'Clinic' | 'Pharmacy' | 'Blood Bank' | 'Diagnostic Center' | 'Government Health Center';
  address: string;
  latitude: number;
  longitude: number;
  contact: string;
  details: string;
  services: string[];
  distance_km?: number;
  estimated_travel_time_minutes?: number;
}

export interface HealthAdvisory {
  id: number;
  title: string;
  type: string;
  severity: 'Low' | 'Moderate' | 'High' | 'Critical';
  issued_at: string;
  summary: string;
  checklist: string[];
}

export interface VaccinationScheduleItem {
  age: string;
  vaccines: string[];
}

export interface HealthProgram {
  id: number;
  title: string;
  category: string;
  description: string;
  schedule?: VaccinationScheduleItem[];
  benefits?: string[];
}

export interface HealthResource {
  id: number;
  title: string;
  category: string;
  details: any[];
}

export interface HealthChatResponse {
  response: string;
  category: string;
  agent: string;
  safety: {
    safe: boolean;
    reason: string;
  };
  session_id: string;
  confidence: number;
  analysis: {
    is_emergency: boolean;
    emergency_type: string;
    severity: string;
    intent: string;
    confidence_score: number;
    guidance: string;
    suggested_action: string;
  };
  knowledge_sources?: any[];
}

class HealthcareService {
  private getHeaders(token?: string | null): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  public async chat(query: string, sessionId: string, token: string | null): Promise<HealthChatResponse> {
    const res = await fetch(`${API_BASE}/ai/health/chat`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({ query, session_id: sessionId }),
    });
    if (!res.ok) throw new Error('Healthcare AI chat request failed.');
    return res.json();
  }

  public async getFacilities(
    params: { lat?: number; lng?: number; radius_km?: number; type?: string },
    token: string | null
  ): Promise<MedicalFacility[]> {
    let url = `${API_BASE}/ai/health/facilities`;
    const queryParams: string[] = [];
    if (params.lat !== undefined && params.lng !== undefined) {
      queryParams.push(`lat=${params.lat}`);
      queryParams.push(`lng=${params.lng}`);
    }
    if (params.radius_km !== undefined) {
      queryParams.push(`radius_km=${params.radius_km}`);
    }
    if (params.type !== undefined) {
      queryParams.push(`type=${encodeURIComponent(params.type)}`);
    }
    
    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    }

    const res = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to retrieve medical facilities.');
    return res.json();
  }

  public async getHospitals(lat: number | null, lng: number | null, token: string | null): Promise<MedicalFacility[]> {
    let url = `${API_BASE}/ai/health/hospitals`;
    if (lat !== null && lng !== null) {
      url += `?lat=${lat}&lng=${lng}&radius_km=10`;
    }
    const res = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to query hospitals list.');
    return res.json();
  }

  public async getPharmacies(lat: number | null, lng: number | null, token: string | null): Promise<MedicalFacility[]> {
    let url = `${API_BASE}/ai/health/pharmacies`;
    if (lat !== null && lng !== null) {
      url += `?lat=${lat}&lng=${lng}&radius_km=5`;
    }
    const res = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to query pharmacies list.');
    return res.json();
  }

  public async getAdvisories(token: string | null): Promise<HealthAdvisory[]> {
    const res = await fetch(`${API_BASE}/ai/health/advisories`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to fetch public health advisories.');
    return res.json();
  }

  public async getPrograms(token: string | null): Promise<HealthProgram[]> {
    const res = await fetch(`${API_BASE}/ai/health/programs`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to fetch public health programs.');
    return res.json();
  }

  public async getResources(token: string | null): Promise<HealthResource[]> {
    const res = await fetch(`${API_BASE}/ai/health/resources`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to fetch preventive health guides.');
    return res.json();
  }

  public async escalateEmergency(
    payload: { title: string; description: string; latitude: number; longitude: number; address?: string; ward?: string },
    token: string | null
  ): Promise<any> {
    const res = await fetch(`${API_BASE}/ai/health/escalate`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Medical emergency escalation failed.');
    return res.json();
  }
}

export const healthcareService = new HealthcareService();
export default healthcareService;
