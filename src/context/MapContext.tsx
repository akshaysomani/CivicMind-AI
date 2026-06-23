import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import { mapService } from '../services/mapService';
import type { MapIssue, WardAnalytics, HeatmapPoint, NearbyResult, ViewportStatistics } from '../services/mapService';

export interface MapFilters {
  category: string;
  status: string;
  priority: string;
  severity: string;
  department: string;
  ward: string;
  dateFrom: string;
  dateTo: string;
  distanceRadius: number; // in km
  myReportsOnly: boolean;
  resolvedOnly: boolean;
  openOnly: boolean;
}

const DEFAULT_FILTERS: MapFilters = {
  category: '',
  status: '',
  priority: '',
  severity: '',
  department: '',
  ward: '',
  dateFrom: '',
  dateTo: '',
  distanceRadius: 5,
  myReportsOnly: false,
  resolvedOnly: false,
  openOnly: false,
};

interface RouteInfo {
  origin: [number, number];
  destination: [number, number];
  distanceKm: number;
  durationMins: number;
  mode: 'citizen' | 'officer';
  active: boolean;
}

interface MapContextType {
  // Data State
  mapIssues: MapIssue[];
  filteredIssues: MapIssue[];
  wards: WardAnalytics[];
  boundaryGeoJson: any;
  heatmapPoints: HeatmapPoint[];
  nearbyData: NearbyResult | null;
  statistics: ViewportStatistics | null;
  isLoading: boolean;
  
  // Selection / Interaction State
  selectedIssue: MapIssue | null;
  selectedWard: WardAnalytics | null;
  setSelectedIssue: (issue: MapIssue | null) => void;
  setSelectedWard: (ward: WardAnalytics | null) => void;
  
  // Layers State
  activeLayers: Record<string, boolean>;
  toggleLayer: (layerName: string) => void;
  
  // Heatmap State
  heatmapMode: boolean;
  setHeatmapMode: (active: boolean) => void;
  heatmapIntensity: number;
  setHeatmapIntensity: (intensity: number) => void;
  
  // Filters State
  filters: MapFilters;
  setFilters: (filters: Partial<MapFilters>) => void;
  resetFilters: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Location / Geolocation State
  currentCoords: [number, number] | null;
  isTracking: boolean;
  triggerLocateMe: () => void;
  
  // Routing State
  routeInfo: RouteInfo | null;
  startRouting: (destination: [number, number], mode?: 'citizen' | 'officer') => void;
  clearRouting: () => void;
  
  // Preferences
  mapProvider: 'google' | 'leaflet';
  setMapProvider: (p: 'google' | 'leaflet') => void;
  mapStyle: 'streets' | 'satellite' | 'terrain' | 'dark';
  setMapStyle: (s: 'streets' | 'satellite' | 'terrain' | 'dark') => void;
  
  // Actions
  refreshMapData: () => Promise<void>;
  geocodeAddress: (address: string) => Promise<[number, number] | null>;
  reverseGeocodeCoords: (lat: number, lng: number) => Promise<string>;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

export const MapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, currentUser } = useAuth();
  const { showNotification } = useNotifications();

  // State definitions
  const [mapIssues, setMapIssues] = useState<MapIssue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<MapIssue[]>([]);
  const [wards, setWards] = useState<WardAnalytics[]>([]);
  const [boundaryGeoJson, setBoundaryGeoJson] = useState<any>(null);
  const [heatmapPoints, setHeatmapPoints] = useState<HeatmapPoint[]>([]);
  const [nearbyData, setNearbyData] = useState<NearbyResult | null>(null);
  const [statistics, setStatistics] = useState<ViewportStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedIssue, setSelectedIssue] = useState<MapIssue | null>(null);
  const [selectedWard, setSelectedWard] = useState<WardAnalytics | null>(null);

  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
    issues: true,
    wards: true,
    boundaries: true,
    healthcare: false,
    police: false,
    fire: false,
    schools: false,
    government: false,
    water_bodies: true,
    flood_zones: false,
    road_network: false,
  });

  const [heatmapMode, setHeatmapMode] = useState(false);
  const [heatmapIntensity, setHeatmapIntensity] = useState(3);
  
  const [filters, setFiltersState] = useState<MapFilters>(DEFAULT_FILTERS);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [currentCoords, setCurrentCoords] = useState<[number, number] | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  
  const [mapProvider, setMapProvider] = useState<'google' | 'leaflet'>('leaflet');
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite' | 'terrain' | 'dark'>('dark');

  // Load and refresh core data
  const refreshMapData = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const [issuesRes, wardsRes, boundaryRes, heatmapRes, statsRes] = await Promise.all([
        mapService.getIssues(token),
        mapService.getWards(token),
        mapService.getBoundaries(token).catch(() => null),
        mapService.getHeatmap(token),
        mapService.getStatistics(token),
      ]);
      
      setMapIssues(issuesRes);
      setWards(wardsRes);
      if (boundaryRes) setBoundaryGeoJson(boundaryRes);
      setHeatmapPoints(heatmapRes);
      setStatistics(statsRes);
    } catch (err: any) {
      showNotification(err.message || 'Error fetching GIS map services.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [token, showNotification]);

  // Load initial data on mount/token change
  useEffect(() => {
    if (token) {
      refreshMapData();
    }
  }, [token, refreshMapData]);

  // Reactively filter issues based on search and selected map filters
  useEffect(() => {
    let result = [...mapIssues];
    
    // 1. Text Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        i =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.complaint_id.toLowerCase().includes(q) ||
          (i.ward && i.ward.toLowerCase().includes(q))
      );
    }
    
    // 2. Filters Drawer fields
    if (filters.category) {
      result = result.filter(i => i.category === filters.category);
    }
    if (filters.status) {
      result = result.filter(i => i.status === filters.status);
    }
    if (filters.priority) {
      result = result.filter(i => i.priority === filters.priority);
    }
    if (filters.severity) {
      result = result.filter(i => i.severity === filters.severity);
    }
    if (filters.department) {
      result = result.filter(i => i.assigned_department === filters.department);
    }
    if (filters.ward) {
      result = result.filter(i => i.ward === filters.ward);
    }
    
    // Date ranges
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom).getTime();
      result = result.filter(i => new Date(i.created_at).getTime() >= from);
    }
    if (filters.dateTo) {
      const to = new Date(filters.dateTo).getTime();
      result = result.filter(i => new Date(i.created_at).getTime() <= to);
    }
    
    // Quick toggles
    if (filters.myReportsOnly && currentUser) {
      // Map issues payload reporter check (if they are the author)
      result = result.filter(i => i.reporter?.email === currentUser.email);
    }
    if (filters.resolvedOnly) {
      result = result.filter(i => i.status === 'Resolved' || i.status === 'Closed');
    }
    if (filters.openOnly) {
      result = result.filter(i => i.status === 'Open' || i.status === 'Submitted' || i.status === 'In Progress');
    }
    
    // Distance filter from current geolocation coords
    if (currentCoords && filters.distanceRadius) {
      const [userLat, userLng] = currentCoords;
      result = result.filter(i => {
        // Haversine calc
        const R = 6371; // km
        const dLat = ((i.latitude - userLat) * Math.PI) / 180;
        const dLon = ((i.longitude - userLng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((userLat * Math.PI) / 180) *
            Math.cos((i.latitude * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const dist = R * c;
        return dist <= filters.distanceRadius;
      });
    }

    setFilteredIssues(result);
  }, [mapIssues, filters, searchQuery, currentCoords, currentUser]);

  // Toggle single layer overlay
  const toggleLayer = useCallback((layerName: string) => {
    setActiveLayers(prev => ({
      ...prev,
      [layerName]: !prev[layerName],
    }));
  }, []);

  const setFilters = useCallback((partial: Partial<MapFilters>) => {
    setFiltersState(prev => ({ ...prev, ...partial }));
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
    setSearchQuery('');
  }, []);

  // HTML Geolocation locator
  const triggerLocateMe = useCallback(() => {
    if (!navigator.geolocation) {
      showNotification('Geolocation is not supported by your browser.', 'warning');
      return;
    }
    
    setIsTracking(true);
    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setCurrentCoords([latitude, longitude]);
        setIsTracking(false);
        showNotification('Location resolved successfully.', 'success');
        
        // Also call mapService.getNearby to populate nearby entities
        if (token) {
          mapService.getNearby(latitude, longitude, filters.distanceRadius, token)
            .then(res => setNearbyData(res))
            .catch(() => null);
        }
      },
      () => {
        setIsTracking(false);
        showNotification('Location access denied. Using downtown SF default.', 'info');
        // Set Default SF Coordinates
        setCurrentCoords([37.7749, -122.4194]);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }, [filters.distanceRadius, token, showNotification]);

  // Geocoding and Reverse Geocoding action handlers
  const geocodeAddress = useCallback(async (address: string): Promise<[number, number] | null> => {
    try {
      const res = await mapService.geocode(address, token);
      return [res.latitude, res.longitude];
    } catch {
      return null;
    }
  }, [token]);

  const reverseGeocodeCoords = useCallback(async (lat: number, lng: number): Promise<string> => {
    try {
      const res = await mapService.reverseGeocode(lat, lng, token);
      return res.address;
    } catch {
      return 'San Francisco, CA';
    }
  }, [token]);

  // Routing operations
  const startRouting = useCallback((destination: [number, number], mode: 'citizen' | 'officer' = 'citizen') => {
    const origin: [number, number] = currentCoords || [37.7749, -122.4194];
    
    // Estimate route (simple straight-line scale for mock purposes)
    const R = 6371; // km
    const dLat = ((destination[0] - origin[0]) * Math.PI) / 180;
    const dLon = ((destination[1] - origin[1]) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((origin[0] * Math.PI) / 180) *
        Math.cos((destination[0] * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = R * c;
    const speedKmh = mode === 'officer' ? 50 : 4; // Driving vs Walking
    const durationMins = (distanceKm / speedKmh) * 60;

    setRouteInfo({
      origin,
      destination,
      distanceKm: parseFloat(distanceKm.toFixed(2)),
      durationMins: Math.ceil(durationMins),
      mode,
      active: true,
    });
    
    showNotification(`Route calculated: ${distanceKm.toFixed(2)} km, ETA ${Math.ceil(durationMins)} mins`, 'info');
  }, [currentCoords, showNotification]);

  const clearRouting = useCallback(() => {
    setRouteInfo(null);
  }, []);

  return (
    <MapContext.Provider
      value={{
        mapIssues,
        filteredIssues,
        wards,
        boundaryGeoJson,
        heatmapPoints,
        nearbyData,
        statistics,
        isLoading,
        selectedIssue,
        selectedWard,
        setSelectedIssue,
        setSelectedWard,
        activeLayers,
        toggleLayer,
        heatmapMode,
        setHeatmapMode,
        heatmapIntensity,
        setHeatmapIntensity,
        filters,
        setFilters,
        resetFilters,
        searchQuery,
        setSearchQuery,
        currentCoords,
        isTracking,
        triggerLocateMe,
        routeInfo,
        startRouting,
        clearRouting,
        mapProvider,
        setMapProvider,
        mapStyle,
        setMapStyle,
        refreshMapData,
        geocodeAddress,
        reverseGeocodeCoords,
      }}
    >
      {children}
    </MapContext.Provider>
  );
};

export const useMap = () => {
  const ctx = useContext(MapContext);
  if (!ctx) throw new Error('useMap must be used within MapProvider');
  return ctx;
};
export default MapContext;
