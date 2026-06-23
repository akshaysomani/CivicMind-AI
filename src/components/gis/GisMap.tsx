import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Polyline, Circle, useMap as useLeafletMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useMap } from '../../context/MapContext';
import { createIssueIcon, createAmenityIcon } from './MapMarker';
import { Link } from 'react-router-dom';
import Button from '../Button';

// Component to dynamically pan and zoom leaflet viewport
const MapController: React.FC = () => {
  const map = useLeafletMap();
  const { selectedIssue, selectedWard, currentCoords, routeInfo } = useMap();

  useEffect(() => {
    if (selectedIssue) {
      map.setView([selectedIssue.latitude, selectedIssue.longitude], 16, { animate: true });
    }
  }, [selectedIssue, map]);

  useEffect(() => {
    if (selectedWard && selectedWard.geojson_polygon) {
      // Find center of ward polygon roughly (using first coordinate ring)
      try {
        const polyCoords = selectedWard.geojson_polygon.coordinates[0];
        // Average coordinates
        let sumLat = 0;
        let sumLng = 0;
        polyCoords.forEach((coord: [number, number]) => {
          sumLng += coord[0];
          sumLat += coord[1];
        });
        const centerLat = sumLat / polyCoords.length;
        const centerLng = sumLng / polyCoords.length;
        map.setView([centerLat, centerLng], 14, { animate: true });
      } catch {
        // Fallback
      }
    }
  }, [selectedWard, map]);

  useEffect(() => {
    if (currentCoords) {
      map.setView(currentCoords, 14, { animate: true });
    }
  }, [currentCoords, map]);

  useEffect(() => {
    if (routeInfo && routeInfo.active) {
      // Fit bounds to show both origin and destination
      map.fitBounds([routeInfo.origin, routeInfo.destination], { padding: [50, 50] });
    }
  }, [routeInfo, map]);

  return null;
};

export const GisMap: React.FC = () => {
  const {
    filteredIssues,
    wards,
    boundaryGeoJson,
    heatmapPoints,
    activeLayers,
    selectedIssue,
    setSelectedIssue,
    selectedWard,
    setSelectedWard,
    heatmapMode,
    heatmapIntensity,
    routeInfo,
    startRouting,
    mapStyle,
    mapProvider,
    setMapProvider,
  } = useMap();

  const defaultCenter: [number, number] = [37.7749, -122.4194];

  // Map box tile provider layer URLs
  const getTileLayerUrl = () => {
    switch (mapStyle) {
      case 'satellite':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      case 'terrain':
        return 'https://{s}.tile.opentopomap.org/{z}/{y}/{x}.png';
      default:
        // Dark theme GIS default
        return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{y}/{x}{r}.png';
    }
  };

  const getTileLayerAttribution = () => {
    switch (mapStyle) {
      case 'satellite':
        return 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
      case 'terrain':
        return 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)';
      default:
        return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
    }
  };

  const formatBoundaryCoordinates = (geojson: any): [number, number][] => {
    try {
      if (geojson.type === 'Polygon') {
        return geojson.coordinates[0].map((coord: [number, number]) => [coord[1], coord[0]]);
      }
    } catch {
      // Empty fallback
    }
    return [];
  };

  if (mapProvider === 'google') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 border border-white/5 rounded-2xl relative text-center px-6">
        <div className="absolute top-4 left-4 z-40 bg-slate-900/90 border border-white/10 px-3 py-1.5 rounded-xl text-[10px] font-bold text-slate-350">
          GOOGLE MAPS ACTIVE (SANDBOX SIMULATION)
        </div>
        <div className="max-w-md space-y-4">
          <span className="text-4xl">🗺️</span>
          <h4 className="font-heading font-extrabold text-base text-slate-100">Google Maps Platform Integration</h4>
          <p className="text-slate-400 text-xs leading-relaxed">
            Google Maps API initialized successfully. In compliance with developer sandboxes, coordinates boundaries and satellite tile overlays have been synchronized under the service abstraction layer.
          </p>
          <Button
            variant="glass"
            onClick={() => setMapProvider('leaflet')}
            className="text-xs px-4 py-2"
          >
            ← Switch to Leaflet/OSM
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-white/5 relative bg-slate-950">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        zoomControl={false}
        className="w-full h-full"
        style={{ background: '#090d16' }}
      >
        {/* Layer Tiles */}
        <TileLayer url={getTileLayerUrl()} attribution={getTileLayerAttribution()} />

        {/* Controller */}
        <MapController />

        {/* 1. Administrative Boundary */}
        {activeLayers.boundaries && boundaryGeoJson && (
          <Polygon
            positions={formatBoundaryCoordinates(boundaryGeoJson.geojson_polygon)}
            pathOptions={{
              color: '#3b82f6',
              weight: 2,
              fillColor: 'transparent',
              dashArray: '8, 8',
            }}
          />
        )}

        {/* 2. Ward Boundaries */}
        {activeLayers.wards &&
          wards.map((ward) => (
            <Polygon
              key={ward.id}
              positions={formatBoundaryCoordinates(ward.geojson_polygon)}
              eventHandlers={{
                click: () => {
                  setSelectedWard(ward);
                  setSelectedIssue(null);
                },
              }}
              pathOptions={{
                color: selectedWard?.id === ward.id ? '#10b981' : '#f59e0b',
                weight: selectedWard?.id === ward.id ? 3 : 1.5,
                fillColor: selectedWard?.id === ward.id ? '#10b981' : '#f59e0b',
                fillOpacity: selectedWard?.id === ward.id ? 0.08 : 0.02,
              }}
            />
          ))}

        {/* 3. Heatmap Layer */}
        {heatmapMode &&
          heatmapPoints.map((pt, idx) => (
            <Circle
              key={`hm-${idx}`}
              center={[pt.latitude, pt.longitude]}
              radius={180 + pt.weight * 40}
              pathOptions={{
                fillColor: pt.weight >= 4 ? '#ef4444' : pt.weight >= 3 ? '#f97316' : '#f59e0b',
                fillOpacity: 0.12 * (heatmapIntensity / 3),
                stroke: false,
              }}
            />
          ))}

        {/* 4. Infrastructure/Amenities Layers */}
        {activeLayers.police && activeLayers.police !== undefined && (
          <Marker position={[37.7799, -122.4644]} icon={createAmenityIcon('Police Station', 'Richmond')} />
        )}
        {activeLayers.police && activeLayers.police !== undefined && (
          <Marker position={[37.7628, -122.4219]} icon={createAmenityIcon('Police Station', 'Mission')} />
        )}
        {activeLayers.fire && activeLayers.fire !== undefined && (
          <Marker position={[37.7865, -122.4054]} icon={createAmenityIcon('Fire Station', 'Station 1')} />
        )}
        {activeLayers.healthcare && activeLayers.healthcare !== undefined && (
          <Marker position={[37.7631, -122.4578]} icon={createAmenityIcon('Healthcare', 'UCSF Medical')} />
        )}
        {activeLayers.government && activeLayers.government !== undefined && (
          <Marker position={[37.7793, -122.4192]} icon={createAmenityIcon('Government', 'SF City Hall')} />
        )}

        {/* 5. Issue Markers */}
        {activeLayers.issues &&
          filteredIssues.map((issue) => (
            <Marker
              key={issue.id}
              position={[issue.latitude, issue.longitude]}
              icon={createIssueIcon(issue, selectedIssue?.id === issue.id)}
              eventHandlers={{
                click: () => {
                  setSelectedIssue(issue);
                  setSelectedWard(null);
                },
              }}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-3 text-xs w-64 space-y-2.5 text-slate-100 bg-slate-950 rounded-xl">
                  {/* Title and ID */}
                  <div>
                    <span className="text-[9px] font-extrabold text-slate-500 uppercase block tracking-wider leading-none">
                      {issue.complaint_id}
                    </span>
                    <h4 className="font-heading font-extrabold text-sm text-slate-100 leading-tight mt-0.5">
                      {issue.title}
                    </h4>
                  </div>

                  {/* Priority and Status info */}
                  <div className="flex gap-2 text-[9px] font-bold">
                    <span
                      className="px-2 py-0.5 rounded"
                      style={{
                        backgroundColor:
                          issue.priority === 'Critical'
                            ? 'rgba(239, 68, 68, 0.15)'
                            : issue.priority === 'High'
                            ? 'rgba(249, 115, 22, 0.15)'
                            : 'rgba(245, 158, 11, 0.15)',
                        color:
                          issue.priority === 'Critical'
                            ? '#ef4444'
                            : issue.priority === 'High'
                            ? '#f97316'
                            : '#f59e0b',
                      }}
                    >
                      {issue.priority}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-white/5 text-slate-350">
                      {issue.status}
                    </span>
                  </div>

                  {/* Reporter & Ward Details */}
                  <div className="space-y-1 text-[10px] text-slate-400 leading-normal border-t border-white/5 pt-1.5">
                    <p>
                      <strong className="text-slate-500">Ward:</strong> {issue.ward || 'San Francisco'}
                    </p>
                    <p>
                      <strong className="text-slate-500">Department:</strong> {issue.assigned_department}
                    </p>
                    <p>
                      <strong className="text-slate-500">Reporter:</strong> {issue.reporter?.name || 'Anonymous'}
                    </p>
                    {issue.reporter?.phone && issue.reporter.phone !== 'Masked' && (
                      <p>
                        <strong className="text-slate-500">Phone:</strong> {issue.reporter.phone}
                      </p>
                    )}
                  </div>

                  {/* Attachments preview */}
                  {issue.attachments.length > 0 && (
                    <div className="flex gap-1.5 overflow-x-auto py-1">
                      {issue.attachments.slice(0, 3).map((a) => (
                        <div
                          key={a.id}
                          className="w-10 h-10 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center shrink-0 text-lg overflow-hidden"
                        >
                          {a.file_type === 'image' ? '🖼️' : '📄'}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Popup Actions */}
                  <div className="flex gap-2 pt-1.5 border-t border-white/5">
                    <button
                      onClick={() => startRouting([issue.latitude, issue.longitude])}
                      className="flex-1 py-1.5 bg-primary rounded-lg text-center text-[10px] font-bold text-white hover:bg-primary-light transition-all cursor-pointer"
                    >
                      Directions
                    </button>
                    <Link
                      to={`/dashboard/citizen/reports/${issue.id}`}
                      className="flex-1 py-1.5 bg-slate-900 border border-white/5 rounded-lg text-center text-[10px] font-bold text-slate-350 hover:bg-slate-850 hover:text-slate-100 transition-all block"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* 6. Active Polyline Route */}
        {routeInfo && routeInfo.active && (
          <>
            <Polyline
              positions={[routeInfo.origin, routeInfo.destination]}
              pathOptions={{
                color: '#3b82f6',
                weight: 4,
                opacity: 0.85,
                dashArray: '8, 8',
              }}
            />
          </>
        )}
      </MapContainer>
    </div>
  );
};
export default GisMap;
