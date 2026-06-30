const API_BASE = localStorage.getItem('VITE_API_BASE_URL') || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export interface Scheme {
  id: number;
  title: string;
  category: string;
  description: string;
  benefits: string[];
  eligibility: {
    age_min?: number;
    age_max?: number;
    income_max?: number;
    requires_farmer?: boolean;
    requires_landowner?: boolean;
    requires_student?: boolean;
    requires_business?: boolean;
    requires_senior?: boolean;
    requires_no_house?: boolean;
    gender_restriction?: string;
    business_max_age_years?: number;
  };
  documents: string[];
  application_steps: string[];
  department: string;
  processing_time: string;
}

export interface EligibilityResult {
  scheme: Scheme;
  status: 'Eligible' | 'Ineligible';
  reasoning: string;
}

export interface SavedSchemeBookmark {
  id: number;
  user_id: number;
  scheme_id: number;
  scheme_title: string;
  scheme_category: string;
  created_at: string;
}

export interface GovernmentOffice {
  id: number;
  name: string;
  type: string;
  address: string;
  latitude: number;
  longitude: number;
  contact: string;
  hours: string;
  distance_km?: number;
  estimated_travel_time_minutes?: number;
}

export interface SchemeResourceFAQ {
  id: number;
  question: string;
  answer: string;
}

export interface SchemeChatResponse {
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
    intent: string;
    confidence_score: number;
    reasoning_summary: string;
    recommendations: { id: number; title: string; category: string; reason: string }[];
    guidance: string;
  };
  knowledge_sources?: any[];
}

class SchemeService {
  private getHeaders(token?: string | null): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  public async chat(query: string, sessionId: string, token: string | null): Promise<SchemeChatResponse> {
    const res = await fetch(`${API_BASE}/ai/schemes/chat`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({ query, session_id: sessionId }),
    });
    if (!res.ok) throw new Error('Schemes AI Agent chat request failed.');
    return res.json();
  }

  public async search(query: string, category: string, token: string | null): Promise<Scheme[]> {
    let url = `${API_BASE}/ai/schemes/search`;
    const params: string[] = [];
    if (query) params.push(`query=${encodeURIComponent(query)}`);
    if (category && category !== 'All') params.push(`category=${encodeURIComponent(category)}`);
    if (params.length > 0) url += `?${params.join('&')}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Schemes search request failed.');
    return res.json();
  }

  public async checkEligibility(
    profile: {
      age: number;
      occupation: string;
      student_status: boolean;
      income: number;
      location: string;
      rural_urban: string;
      gender?: string;
      business_owner: boolean;
      farmer: boolean;
      senior_citizen: boolean;
      education_level: string;
    },
    token: string | null
  ): Promise<EligibilityResult[]> {
    const res = await fetch(`${API_BASE}/ai/schemes/eligibility`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify(profile),
    });
    if (!res.ok) throw new Error('Eligibility validation request failed.');
    return res.json();
  }

  public async getRecommendations(category: string | null, token: string | null): Promise<Scheme[]> {
    let url = `${API_BASE}/ai/schemes/recommendations`;
    if (category && category !== 'All') {
      url += `?category=${encodeURIComponent(category)}`;
    }
    const res = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to retrieve scheme recommendations.');
    return res.json();
  }

  public async compare(ids: number[], token: string | null): Promise<Scheme[]> {
    const idParams = ids.map(id => `ids=${id}`).join('&');
    const res = await fetch(`${API_BASE}/ai/schemes/compare?${idParams}`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Schemes comparison request failed.');
    return res.json();
  }

  public async getOffices(
    params: { lat?: number; lng?: number; radius_km?: number },
    token: string | null
  ): Promise<GovernmentOffice[]> {
    let url = `${API_BASE}/ai/schemes/offices`;
    const queryParams: string[] = [];
    if (params.lat !== undefined && params.lng !== undefined) {
      queryParams.push(`lat=${params.lat}`);
      queryParams.push(`lng=${params.lng}`);
    }
    if (params.radius_km !== undefined) {
      queryParams.push(`radius_km=${params.radius_km}`);
    }
    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    }

    const res = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to query government service centers.');
    return res.json();
  }

  public async getResources(token: string | null): Promise<SchemeResourceFAQ[]> {
    const res = await fetch(`${API_BASE}/ai/schemes/resources`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to query scheme resources.');
    return res.json();
  }

  public async saveBookmark(
    payload: { scheme_id: number; scheme_title: string; scheme_category: string },
    token: string | null
  ): Promise<any> {
    const res = await fetch(`${API_BASE}/ai/schemes/save`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to bookmark scheme.');
    return res.json();
  }

  public async getSavedBookmarks(token: string | null): Promise<SavedSchemeBookmark[]> {
    const res = await fetch(`${API_BASE}/ai/schemes/saved`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to retrieve bookmarked schemes.');
    return res.json();
  }

  public async deleteBookmark(id: number, token: string | null): Promise<any> {
    const res = await fetch(`${API_BASE}/ai/schemes/saved/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to delete scheme bookmark.');
    return res.json();
  }
}

export const schemeService = new SchemeService();
export default schemeService;
