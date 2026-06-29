const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

export interface MapReporter {
  name: string;
  phone: string;
  email: string;
}

export interface MapAttachment {
  id: number;
  filename: string;
  file_path: string;
  file_type: string;
}

export interface MapOfficer {
  name: string;
  email: string;
}

export interface MapIssue {
  id: number;
  complaint_id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  severity: string;
  status: string;
  progress: number;
  latitude: number;
  longitude: number;
  ward: string;
  assigned_department: string;
  estimated_response_hours: number | null;
  created_at: string;
  reporter: MapReporter | null;
  assigned_officer: MapOfficer | null;
  attachments: MapAttachment[];
}

export interface WardAnalytics {
  id: number;
  name: string;
  city: string;
  population: number;
  geojson_polygon: any;
  issue_count: number;
  resolved_count: number;
  pending_count: number;
  resolved_pct: number;
  pending_pct: number;
  department_performance: Record<string, number>;
  top_categories: { category: string; count: number }[];
  trend: number[];
}

export interface HeatmapPoint {
  latitude: number;
  longitude: number;
  weight: number;
  category: string;
}

export interface NearbyResult {
  issues: {
    id: number;
    title: string;
    complaint_id: string;
    category: string;
    priority: string;
    status: string;
    latitude: number;
    longitude: number;
    distance_km: number;
    reporter: MapReporter | null;
  }[];
  amenities: {
    name: string;
    type: string;
    latitude: number;
    longitude: number;
    distance_km: number;
  }[];
}

export interface ViewportStatistics {
  total_issues: number;
  resolution_rate: number;
  most_common_category: string;
  top_ward: string;
  category_distribution: Record<string, number>;
  priority_distribution: Record<string, number>;
  recent_reports: {
    id: number;
    title: string;
    category: string;
    priority: string;
    status: string;
    created_at: string;
  }[];
}

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  address: string;
  ward?: string;
}

class MapService {
  private getHeaders(token?: string | null): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  public async getIssues(token: string | null): Promise<MapIssue[]> {
    const res = await fetch(`${API_BASE}/map/issues`, {
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to fetch map issues.');
    return res.json();
  }

  public async getLayers(token: string | null): Promise<any> {
    const res = await fetch(`${API_BASE}/map/layers`, {
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to fetch map layers.');
    return res.json();
  }

  public async getWards(token: string | null): Promise<WardAnalytics[]> {
    const res = await fetch(`${API_BASE}/map/wards`, {
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to fetch municipal wards data.');
    return res.json();
  }

  public async getBoundaries(token: string | null): Promise<any> {
    const res = await fetch(`${API_BASE}/map/boundaries`, {
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to fetch city boundary.');
    return res.json();
  }

  public async getHeatmap(token: string | null): Promise<HeatmapPoint[]> {
    const res = await fetch(`${API_BASE}/map/heatmap`, {
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to fetch heatmap data.');
    return res.json();
  }

  public async geocode(address: string, token: string | null): Promise<GeocodeResult> {
    const qs = new URLSearchParams({ address });
    const res = await fetch(`${API_BASE}/map/location?${qs}`, {
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Geocoding search failed.');
    return res.json();
  }

  public async reverseGeocode(lat: number, lng: number, token: string | null): Promise<GeocodeResult> {
    const qs = new URLSearchParams({ lat: String(lat), lng: String(lng) });
    const res = await fetch(`${API_BASE}/map/location?${qs}`, {
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Reverse geocoding failed.');
    return res.json();
  }

  public async getNearby(lat: number, lng: number, radiusKm: number, token: string | null): Promise<NearbyResult> {
    const qs = new URLSearchParams({ lat: String(lat), lng: String(lng), radius: String(radiusKm) });
    const res = await fetch(`${API_BASE}/map/nearby?${qs}`, {
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to query nearby amenities.');
    return res.json();
  }

  public async getStatistics(token: string | null): Promise<ViewportStatistics> {
    const res = await fetch(`${API_BASE}/map/statistics`, {
      headers: this.getHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to fetch map statistics.');
    return res.json();
  }
}

export const mapService = new MapService();
export default mapService;
