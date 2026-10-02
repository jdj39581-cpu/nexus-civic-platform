import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { CommunityIssue, Report } from '../types';
import { getPriorityBadgeColor, getStatusBadgeColor } from '../utils/helpers';
import { AlertCircle, ExternalLink, Users, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface MapComponentProps {
  issues?: CommunityIssue[];
  reports?: Report[];
  center?: [number, number];
  zoom?: number;
  interactiveSelect?: boolean;
  onLocationSelect?: (lat: number, lon: number) => void;
  selectedLocation?: { lat: number; lon: number } | null;
  onSelectIssue?: (issueId: number) => void;
  height?: string;
}

// Marker Pin Factory using Leaflet divIcon
function createCustomPin(item: { priority_score?: number; priority_level?: string; category_id?: number; status?: string; affected_reports_count?: number }) {
  const score = item.priority_score || 50;
  let pinColor = '#3b82f6'; // blue
  let glowColor = 'rgba(59, 130, 246, 0.4)';

  if (score >= 80 || item.priority_level === 'Critical') {
    pinColor = '#f43f5e'; // rose
    glowColor = 'rgba(244, 63, 94, 0.6)';
  } else if (score >= 65 || item.priority_level === 'High') {
    pinColor = '#f59e0b'; // amber
    glowColor = 'rgba(245, 158, 11, 0.5)';
  } else if (item.status === 'Resolved' || item.status === 'Citizen Verified') {
    pinColor = '#10b981'; // emerald
    glowColor = 'rgba(16, 185, 129, 0.4)';
  }

  const reportsBadge = item.affected_reports_count && item.affected_reports_count > 1 ? `
    <span style="
      position: absolute;
      top: -6px;
      right: -6px;
      background: #0f172a;
      border: 1.5px solid ${pinColor};
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      border-radius: 999px;
      padding: 0 4px;
      line-height: 14px;
    ">${item.affected_reports_count}</span>
  ` : '';

  const html = `
    <div style="
      position: relative;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: ${pinColor};
      border: 2.5px solid #0f172a;
      box-shadow: 0 0 12px ${glowColor};
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: transform 0.2s ease;
    ">
      <div style="width: 8px; height: 8px; border-radius: 50%; background: #ffffff;"></div>
      ${reportsBadge}
    </div>
  `;

  return L.divIcon({
    html,
    className: 'nexus-map-marker',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
}

// Picker Pin for Step 2 location selection
const pickerPin = L.divIcon({
  html: `
    <div style="
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #06b6d4;
      border: 3px solid #ffffff;
      box-shadow: 0 0 16px rgba(6, 182, 212, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: pulse 2s infinite;
    ">
      <div style="width: 10px; height: 10px; border-radius: 50%; background: #0f172a;"></div>
    </div>
  `,
  className: 'nexus-picker-marker',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Map click handler helper component
function LocationSelector({ onSelect }: { onSelect: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Map recentering controller
function RecenterController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  issues = [],
  reports = [],
  center = [12.9248, 77.4988], // Bangalore RVCE coordinates default
  zoom = 13,
  interactiveSelect = false,
  onLocationSelect,
  selectedLocation,
  onSelectIssue,
  height = '420px',
}) => {
  return (
    <div style={{ height }} className="relative w-full rounded-xl overflow-hidden border border-slate-800 shadow-xl">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
      >
        <RecenterController center={center} zoom={zoom} />

        {/* Clean CartoDB Dark Matter tiles (free, reliable OpenStreetMap layer) */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {/* Click to select location in report wizard */}
        {interactiveSelect && onLocationSelect && (
          <LocationSelector onSelect={onLocationSelect} />
        )}

        {/* Picked location marker */}
        {selectedLocation && (
          <Marker position={[selectedLocation.lat, selectedLocation.lon]} icon={pickerPin}>
            <Popup>
              <div className="text-xs font-semibold text-slate-800">
                Selected Coordinates:
                <br />
                {selectedLocation.lat.toFixed(5)}, {selectedLocation.lon.toFixed(5)}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Community Issues Markers */}
        {issues.map((issue) => {
          if (!issue.latitude || !issue.longitude) return null;
          const priorityBadge = getPriorityBadgeColor(issue.priority_level, issue.priority_score);
          const statusBadge = getStatusBadgeColor(issue.status);

          return (
            <Marker
              key={`issue-${issue.id}`}
              position={[issue.latitude, issue.longitude]}
              icon={createCustomPin(issue)}
            >
              <Popup>
                <div className="p-1 max-w-[260px] text-slate-100">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-mono text-cyan-400 font-semibold">{issue.issue_code}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${priorityBadge.bg} ${priorityBadge.text} border ${priorityBadge.border}`}>
                      Score {issue.priority_score}/100
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-100 leading-snug mb-1">{issue.title}</h4>

                  <p className="text-[11px] text-slate-400 line-clamp-2 mb-2">{issue.address}</p>

                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-700/60 text-[10px] text-slate-300">
                    <div className="flex items-center gap-1 text-slate-400">
                      <Users className="w-3 h-3 text-cyan-400" />
                      <span>{issue.affected_reports_count} reports linked</span>
                    </div>

                    {onSelectIssue && (
                      <button
                        onClick={() => onSelectIssue(issue.id)}
                        className="text-cyan-400 font-medium hover:underline flex items-center gap-0.5"
                      >
                        Details <ArrowUpRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Standalone Reports Markers (if provided) */}
        {reports.map((report) => {
          if (!report.latitude || !report.longitude) return null;
          return (
            <Marker
              key={`report-${report.id}`}
              position={[report.latitude, report.longitude]}
              icon={createCustomPin(report)}
            >
              <Popup>
                <div className="p-1 max-w-[240px] text-slate-100">
                  <div className="text-[10px] font-mono text-cyan-400 mb-1">{report.report_code}</div>
                  <h4 className="text-xs font-semibold text-slate-100 mb-1">{report.title}</h4>
                  <div className="text-[10px] text-slate-400">{report.address}</div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
