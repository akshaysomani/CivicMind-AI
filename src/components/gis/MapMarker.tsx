import L from 'leaflet';
import type { MapIssue } from '../../services/mapService';

// Priority Colors mapping
export const PRIORITY_COLORS = {
  Critical: '#ef4444', // Red
  High: '#f97316',     // Orange
  Medium: '#f59e0b',   // Amber
  Low: '#3b82f6',      // Blue
};

// Category Icon SVGs or labels
export const getCategoryIconChar = (category: string): string => {
  const c = category.toLowerCase();
  if (c.includes('water') || c.includes('drain')) return '💧';
  if (c.includes('light') || c.includes('electric')) return '⚡';
  if (c.includes('garbage') || c.includes('sanitat')) return '🗑️';
  if (c.includes('road') || c.includes('pothole')) return '🛣️';
  if (c.includes('traffic') || c.includes('park')) return '🚗';
  if (c.includes('pollution')) return '💨';
  if (c.includes('tree') || c.includes('forest')) return '🌳';
  if (c.includes('hazard') || c.includes('fire')) return '🔥';
  if (c.includes('safety') || c.includes('police')) return '🛡️';
  if (c.includes('health') || c.includes('clinic')) return '⚕️';
  return '📌';
};

export const createIssueIcon = (issue: MapIssue, isSelected: boolean) => {
  const color = PRIORITY_COLORS[issue.priority as keyof typeof PRIORITY_COLORS] || '#64748b';
  const iconChar = getCategoryIconChar(issue.category);
  
  // Custom HTML containing styling for glassmorphic coordinate pins with hover animation
  const html = `
    <div class="relative flex items-center justify-center transition-all duration-300 ${
      isSelected ? 'scale-125 z-50' : 'hover:scale-110 z-10'
    }" style="width: 42px; height: 42px;">
      <!-- Pulsing ripple for Critical priorities -->
      ${
        issue.priority === 'Critical' && issue.status !== 'Resolved'
          ? `<div class="absolute inset-0 rounded-full animate-ping opacity-35" style="background-color: ${color};"></div>`
          : ''
      }
      
      <!-- Marker Pin container -->
      <div class="w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-lg backdrop-blur-md transition-colors"
           style="
             background-color: rgba(15, 23, 42, 0.8);
             border-color: ${color};
             box-shadow: 0 4px 14px 0 ${color}40;
           ">
        <span class="text-lg leading-none">${iconChar}</span>
      </div>
      
      <!-- Status Badge Dot -->
      <div class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border border-slate-900 flex items-center justify-center text-[8px] font-bold"
           style="
             background-color: ${
               issue.status === 'Resolved' || issue.status === 'Closed' ? '#10b981' : '#f59e0b'
             };
             color: white;
           ">
        ${issue.status === 'Resolved' || issue.status === 'Closed' ? '✓' : '●'}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-marker-icon',
    iconSize: [42, 42],
    iconAnchor: [21, 21],
  });
};

export const createAmenityIcon = (type: string, _name?: string) => {
  let icon = '📌';
  let color = '#3b82f6';
  
  const t = type.toLowerCase();
  if (t.includes('police')) {
    icon = '👮';
    color = '#1d4ed8';
  } else if (t.includes('fire')) {
    icon = '🚒';
    color = '#dc2626';
  } else if (t.includes('health') || t.includes('hospital')) {
    icon = '🏥';
    color = '#059669';
  } else if (t.includes('school')) {
    icon = '🏫';
    color = '#8b5cf6';
  } else if (t.includes('government')) {
    icon = '🏛️';
    color = '#4b5563';
  }

  const html = `
    <div class="relative flex items-center justify-center hover:scale-110 transition-transform duration-200" style="width: 36px; height: 36px;">
      <div class="w-8 h-8 rounded-full flex items-center justify-center border shadow-md bg-slate-900/90"
           style="border-color: ${color}; box-shadow: 0 2px 8px 0 ${color}30;">
        <span class="text-sm leading-none">${icon}</span>
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-amenity-icon',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};
