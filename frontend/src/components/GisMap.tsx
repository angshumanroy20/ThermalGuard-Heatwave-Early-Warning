import React, { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, useMap } from 'react-leaflet';
import { Layers, MapPin, Eye, Zap, Flame, HeartPulse, Compass, Globe } from 'lucide-react';
import { WardSummary } from '../types';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface GisMapProps {
  wards: WardSummary[];
  selectedWardId: string | null;
  onSelectWard: (wardId: string) => void;
  selectedCity: string;
  onSelectCity: (city: string) => void;
}

// Controller to smoothly pan to selected city or ward
const MapViewController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  React.useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
};

export const GisMap: React.FC<GisMapProps> = ({
  wards,
  selectedWardId,
  onSelectWard,
  selectedCity,
  onSelectCity
}) => {
  const [activeLayer, setActiveLayer] = useState<'tier' | 'wbgt' | 'utci' | 'vuln' | 'surge'>('tier');
  const [baseMapType, setBaseMapType] = useState<'dark' | 'satellite' | 'osm'>('dark');

  // Determine center based on selection or city
  let centerLat = 24.5;
  let centerLon = 78.5;
  let zoomLevel = 5;

  const cityCoordinates: { [key: string]: { lat: number; lon: number; zoom: number } } = {
    'Delhi NCR': { lat: 28.62, lon: 77.18, zoom: 11 },
    'Mumbai': { lat: 19.06, lon: 72.86, zoom: 11 },
    'Ahmedabad': { lat: 23.02, lon: 72.58, zoom: 12 },
    'Kolkata': { lat: 22.56, lon: 88.38, zoom: 12 },
    'Nagpur (Vidarbha)': { lat: 21.14, lon: 79.08, zoom: 12 },
    'Lucknow': { lat: 26.86, lon: 80.95, zoom: 12 },
    'Jaipur': { lat: 26.88, lon: 75.80, zoom: 12 },
    'Hyderabad': { lat: 17.40, lon: 78.42, zoom: 12 },
    'Chennai': { lat: 13.08, lon: 80.26, zoom: 12 },
    'Bhubaneswar': { lat: 20.29, lon: 85.82, zoom: 12 },
    'Bhopal': { lat: 23.26, lon: 77.41, zoom: 12 }
  };

  if (cityCoordinates[selectedCity]) {
    centerLat = cityCoordinates[selectedCity].lat;
    centerLon = cityCoordinates[selectedCity].lon;
    zoomLevel = cityCoordinates[selectedCity].zoom;
  }

  // Color circles based on selected layer
  const getMarkerColor = (ward: WardSummary) => {
    if (activeLayer === 'tier') {
      return ward.risk?.tier_color || '#ef4444';
    } else if (activeLayer === 'wbgt') {
      const wbgt = ward.risk?.metrics?.wbgt_outdoor_c ?? 0;
      if (wbgt >= 32.0) return '#ef4444';
      if (wbgt >= 29.0) return '#f97316';
      if (wbgt >= 26.0) return '#eab308';
      return '#22c55e';
    } else if (activeLayer === 'utci') {
      const utci = ward.risk?.metrics?.utci_c ?? 0;
      if (utci >= 42.0) return '#ef4444';
      if (utci >= 38.0) return '#f97316';
      if (utci >= 32.0) return '#eab308';
      return '#22c55e';
    } else if (activeLayer === 'vuln') {
      const v = ward.risk?.vulnerability?.vulnerability_score ?? 0;
      if (v >= 0.65) return '#a855f7';
      if (v >= 0.45) return '#ec4899';
      if (v >= 0.3) return '#3b82f6';
      return '#06b6d4';
    } else if (activeLayer === 'surge') {
      const s = ward.risk?.expected_hospital_surge_pct ?? 0;
      if (s >= 75) return '#ef4444';
      if (s >= 40) return '#f97316';
      if (s >= 20) return '#eab308';
      return '#22c55e';
    }
    return ward.risk?.tier_color || '#ef4444';
  };

  const filteredWards = selectedCity === 'ALL' 
    ? wards 
    : wards.filter(w => w.city.toLowerCase() === selectedCity.toLowerCase());

  const citiesList = [
    'ALL', 
    'Delhi NCR', 
    'Mumbai', 
    'Ahmedabad', 
    'Kolkata', 
    'Nagpur (Vidarbha)', 
    'Lucknow', 
    'Jaipur', 
    'Hyderabad', 
    'Chennai', 
    'Bhubaneswar', 
    'Bhopal'
  ];

  return (
    <div className="relative flex flex-col rounded-2xl border border-white/10 bg-slate-900/80 shadow-2xl backdrop-blur-xl overflow-hidden min-h-[520px] h-[75vh] max-h-[820px]">
      {/* Control Bar */}
      <div className="z-10 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-slate-950/90 px-4 py-3 backdrop-blur-md">
        {/* City Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Compass className="h-3 w-3 text-cyan-400" />
            Region:
          </span>
          {citiesList.map(city => (
            <button
              key={city}
              onClick={() => onSelectCity(city)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                selectedCity === city
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'
              }`}
            >
              {city === 'ALL' ? 'Pan-India Overview' : city}
            </button>
          ))}
        </div>

        {/* GIS Metric Layer Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
            <Layers className="h-3.5 w-3.5 text-orange-400" />
            <span>Layer:</span>
          </div>
          {[
            { id: 'tier', label: 'IMD Tier' },
            { id: 'wbgt', label: 'WBGT' },
            { id: 'utci', label: 'UTCI' },
            { id: 'vuln', label: 'Vulnerability' },
            { id: 'surge', label: 'ER Surge %' }
          ].map(l => (
            <button
              key={l.id}
              onClick={() => setActiveLayer(l.id as any)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                activeLayer === l.id
                  ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40 shadow-sm'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'
              }`}
            >
              {l.label}
            </button>
          ))}

          {/* Basemap Switcher */}
          <div className="ml-2 flex items-center gap-1 border-l border-white/10 pl-2">
            {[
              { id: 'dark', label: 'Dark' },
              { id: 'satellite', label: 'Satellite' },
              { id: 'osm', label: 'Streets' }
            ].map(bm => (
              <button
                key={bm.id}
                onClick={() => setBaseMapType(bm.id as any)}
                className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition-all ${
                  baseMapType === bm.id
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {bm.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map Leaflet Container */}
      <div className="relative flex-1 w-full h-full">
        <MapContainer
          center={[centerLat, centerLon]}
          zoom={zoomLevel}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%' }}
        >
          <MapViewController center={[centerLat, centerLon]} zoom={zoomLevel} />
          
          {baseMapType === 'dark' && (
            <>
              <TileLayer
                attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
                maxNativeZoom={16}
                maxZoom={19}
              />
              <TileLayer
                attribution=""
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
                maxNativeZoom={16}
                maxZoom={19}
                opacity={0.9}
              />
            </>
          )}

          {baseMapType === 'satellite' && (
            <>
              <TileLayer
                attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                maxNativeZoom={18}
                maxZoom={19}
              />
              <TileLayer
                attribution=""
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                maxNativeZoom={16}
                maxZoom={19}
                opacity={0.8}
              />
            </>
          )}

          {baseMapType === 'osm' && (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />
          )}

          {filteredWards.map(ward => {
            const isSelected = selectedWardId === ward.id;
            const color = getMarkerColor(ward);
            const isExtreme = ward.risk?.tier === 'EXTREME';

            return (
              <CircleMarker
                key={ward.id}
                center={[ward.lat, ward.lon]}
                radius={isSelected ? 18 : isExtreme ? 14 : 10}
                pathOptions={{
                  fillColor: color,
                  fillOpacity: isSelected ? 0.95 : 0.75,
                  color: isSelected ? '#ffffff' : color,
                  weight: isSelected ? 3 : 1.5
                }}
                eventHandlers={{
                  click: () => onSelectWard(ward.id)
                }}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
                  <div className="text-xs font-semibold p-1">
                    <span className="font-bold text-white">{ward.name}</span> ({ward.city})<br />
                    Tier: <span style={{ color }}>{ward.risk?.tier}</span> | WBGT: {ward.risk?.metrics?.wbgt_outdoor_c}°C<br />
                    ER Surge: +{ward.risk?.expected_hospital_surge_pct}%
                  </div>
                </Tooltip>
                
                <Popup>
                  <div className="min-w-[230px] p-1 text-slate-100">
                    <h4 className="text-sm font-bold text-white mb-0.5">
                      {ward.name}
                    </h4>
                    <p className="text-xs text-slate-400 mb-2">
                      {ward.city} • Pop: {ward.pop_density_sqkm.toLocaleString()}/km²
                    </p>
                    
                    <div className="grid grid-cols-2 gap-2 bg-slate-900/90 border border-white/10 p-2.5 rounded-lg text-xs mb-3">
                      <div>
                        <span className="text-slate-400 text-[10px] block">WBGT:</span>
                        <strong className="text-rose-400 text-sm">{ward.risk?.metrics?.wbgt_outdoor_c}°C</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">UTCI:</span>
                        <strong className="text-orange-400 text-sm">{ward.risk?.metrics?.utci_c}°C</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Heat Index:</span>
                        <strong className="text-amber-400 text-sm">{ward.risk?.metrics?.heat_index_c}°C</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">ER Surge:</span>
                        <strong className="text-pink-400 text-sm">+{ward.risk?.expected_hospital_surge_pct}%</strong>
                      </div>
                    </div>

                    <Button
                      variant="cyan"
                      size="sm"
                      onClick={() => onSelectWard(ward.id)}
                      className="w-full text-xs font-semibold"
                    >
                      Inspect Ward & 5-Day Lead Time →
                    </Button>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {/* Floating Map Legend */}
        <div className="absolute bottom-4 right-4 z-[500] rounded-xl border border-white/10 bg-slate-950/90 p-3 text-xs text-slate-200 shadow-2xl backdrop-blur-md">
          <div className="font-bold text-white text-[11px] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            {activeLayer === 'tier' ? 'IMD Warning Tier' :
             activeLayer === 'wbgt' ? 'WBGT Heat Risk (ISO 7243)' :
             activeLayer === 'utci' ? 'UTCI Thermal Strain' :
             activeLayer === 'vuln' ? 'Vulnerability Index' : 'ER Hospital Surge'}
          </div>
          {activeLayer === 'tier' ? (
            <div className="space-y-1 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#ef4444]" />
                <span className="font-medium text-rose-300">Extreme Action (Red)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_#f97316]" />
                <span className="font-medium text-orange-300">Severe Advisory (Orange)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" />
                <span className="font-medium text-amber-300">Moderate Caution (Yellow)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                <span className="font-medium text-emerald-300">Safe Advisory (Green)</span>
              </div>
            </div>
          ) : (
            <div className="space-y-1 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                <span>High / Critical Danger</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                <span>Elevated Caution</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span>Normal / Baseline</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
