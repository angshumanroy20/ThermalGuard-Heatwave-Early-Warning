import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  Sun, 
  Wind, 
  Droplets, 
  Calendar, 
  Send, 
  AlertCircle, 
  Zap,
  TrendingUp,
  FileText,
  Hospital,
  ShieldCheck,
  Activity,
  Flame
} from 'lucide-react';
import { WardDetailsResponse } from '../types';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';

interface WardInspectorProps {
  wardDetails: WardDetailsResponse | null;
  loading: boolean;
  onTriggerAlert: (wardId: string) => void;
  onOpenHAPReport: (wardId: string) => void;
}

export const WardInspector: React.FC<WardInspectorProps> = ({
  wardDetails,
  loading,
  onTriggerAlert,
  onOpenHAPReport
}) => {
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(0);

  if (loading) {
    return (
      <Card className="flex flex-col items-center justify-center p-12 text-center border-white/10 bg-slate-900/80 backdrop-blur-xl">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-400 mb-4" />
        <h4 className="text-base font-semibold text-white">Computing Multi-Metric Indices</h4>
        <p className="text-xs text-slate-400 max-w-sm mt-1">
          Evaluating Stull wet-bulb, Liljegren black globe equilibrium, and demographic heat vulnerability...
        </p>
      </Card>
    );
  }

  if (!wardDetails) {
    return (
      <Card className="flex flex-col items-center justify-center p-12 text-center border-white/10 bg-slate-900/80 backdrop-blur-xl">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-4">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-bold text-white">No Ward Selected</h3>
        <p className="text-xs text-slate-400 max-w-sm mt-1">
          Select any ward marker on the GIS map or use the search controls to inspect deep biometeorological analytics.
        </p>
      </Card>
    );
  }

  const { ward, city, region_type, current_evaluation, forecast_5days } = wardDetails;
  const metrics = current_evaluation?.metrics || {} as any;
  const vuln = current_evaluation?.vulnerability || {} as any;
  const currentForecastDay = forecast_5days?.[selectedDayIdx] || forecast_5days?.[0] || {} as any;

  // Safe Demographic Fallbacks
  const hospitalsCount = ward?.infrastructure?.hospitals_count ?? (ward as any)?.hospitals_count ?? 4;
  const coolingCentersCount = ward?.infrastructure?.cooling_centers_count ?? (ward as any)?.cooling_centers_count ?? 6;
  const powerGridZone = ward?.infrastructure?.power_grid_zone ?? (ward as any)?.power_grid_zone ?? 'City Grid Feeder';

  const outdoorWorkerPct = ward?.demographics?.outdoor_worker_pct ?? (ward as any)?.outdoor_worker_pct ?? 35;
  const informalHousingPct = ward?.demographics?.informal_housing_pct ?? (ward as any)?.informal_housing_pct ?? 30;
  const elderlyPct = ward?.demographics?.elderly_pct ?? (ward as any)?.elderly_pct ?? 12;
  const childrenPct = ward?.demographics?.children_pct ?? (ward as any)?.children_pct ?? 10;
  const ndviVegetation = ward?.demographics?.ndvi_vegetation ?? (ward as any)?.ndvi_vegetation ?? 0.15;

  // Diurnal curve SVG points
  const hourlyData = currentForecastDay?.hourly_profile || [];
  const maxTemp = Math.max(...hourlyData.map((h: any) => h.temp_c), 46);
  const minTemp = Math.min(...hourlyData.map((h: any) => h.wbgt_c), 20);
  const chartHeight = 140;
  const chartWidth = 560;

  const getSvgY = (val: number) => {
    return chartHeight - ((val - minTemp) / (maxTemp - minTemp || 1)) * (chartHeight - 30) - 15;
  };

  const tempPoints = hourlyData.map((h: any, i: number) => `${(i / Math.max(1, hourlyData.length - 1)) * chartWidth},${getSvgY(h.temp_c)}`).join(' ');
  const wbgtPoints = hourlyData.map((h: any, i: number) => `${(i / Math.max(1, hourlyData.length - 1)) * chartWidth},${getSvgY(h.wbgt_c)}`).join(' ');

  const getTierVariant = (tier?: string) => {
    switch (tier) {
      case 'EXTREME': return 'extreme';
      case 'SEVERE': return 'severe';
      case 'MODERATE': return 'moderate';
      default: return 'safe';
    }
  };

  return (
    <Card className="border-white/10 bg-slate-900/80 shadow-2xl backdrop-blur-xl overflow-hidden">
      {/* Header */}
      <div className="border-b border-white/10 bg-slate-950/70 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-2xl font-black tracking-tight text-white font-display">
                {ward?.name || 'Ward Profile'}
              </h2>
              <Badge variant={getTierVariant(current_evaluation?.tier)} className="text-xs uppercase font-extrabold px-2.5 py-0.5">
                {current_evaluation?.tier || 'ALERT'} TIER
              </Badge>
              <Badge variant="outline" className="text-xs text-slate-300 border-white/15">
                {city} • {region_type}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <span>Pop Density: <strong>{ward?.pop_density_sqkm?.toLocaleString() || 15000} /km²</strong></span>
              <span>•</span>
              <span>Centroid: {ward?.lat?.toFixed(3)}, {ward?.lon?.toFixed(3)}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenHAPReport(ward.id)}
              className="gap-1.5 text-xs border-amber-500/30 text-amber-300 hover:bg-amber-500/10 hover:border-amber-500/50"
            >
              <FileText className="h-3.5 w-3.5 text-amber-400" />
              <span>Municipal HAP Brief</span>
            </Button>
            <Button
              variant="gradient"
              size="sm"
              onClick={() => onTriggerAlert(ward.id)}
              className="gap-1.5 text-xs font-semibold"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Dispatch Alert</span>
            </Button>
          </div>
        </div>
      </div>

      <CardContent className="p-5 space-y-6">
        {/* 5-Day Lead Time Forecast Selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-300">
              <Calendar className="h-3.5 w-3.5 text-cyan-400" />
              <span>5-Day Predictive Lead Time</span>
            </div>
            <span className="text-[11px] text-cyan-400 font-medium">NCMRWF 4km + ERA5 Surrogate</span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {(forecast_5days || []).map((day, idx) => {
              const isSelected = selectedDayIdx === idx;
              const dayEval = day.risk_eval;
              const t = dayEval?.tier || 'SAFE';
              
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDayIdx(idx)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all border text-center ${
                    isSelected
                      ? 'bg-slate-800 border-cyan-500 shadow-md ring-1 ring-cyan-500/40'
                      : 'bg-slate-950/60 border-white/5 hover:bg-slate-800/60 hover:border-white/15'
                  }`}
                >
                  <span className="text-[11px] font-bold text-slate-300">
                    {idx === 0 ? 'Today' : day.day_name?.slice(0, 3)}
                  </span>
                  <span className="text-[10px] text-slate-400 mb-1">{day.date?.slice(5)}</span>
                  <Badge 
                    variant={getTierVariant(t)}
                    className="text-[9px] px-1.5 py-0 font-extrabold uppercase"
                  >
                    {t}
                  </Badge>
                  <span className="text-[11px] font-bold text-slate-200 mt-1">
                    {dayEval?.metrics?.temp_max_c?.toFixed(1) || '42.0'}°C
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Diurnal 24-Hour Profile Chart */}
        <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-cyan-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  24-Hour Diurnal Heat Profile ({currentForecastDay?.day_name || 'Day'})
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Continuous diurnal cycle correlating Dry-Bulb Air Temp (°C) and Wet-Bulb Globe Temp (WBGT °C)
              </p>
            </div>
            
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-3 rounded-full bg-rose-500" />
                <span className="text-slate-300">Dry-Bulb Ambient (°C)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-3 rounded-full bg-cyan-400" />
                <span className="text-slate-300">Outdoor WBGT (°C)</span>
              </div>
            </div>
          </div>

          {/* SVG Diurnal Curve */}
          <div className="w-full overflow-hidden">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-36">
              <defs>
                <linearGradient id="tempGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="wbgtGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              <line x1="0" y1={chartHeight - 15} x2={chartWidth} y2={chartHeight - 15} stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
              <line x1="0" y1={chartHeight / 2} x2={chartWidth} y2={chartHeight / 2} stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
              <line x1="0" y1="15" x2={chartWidth} y2="15" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />

              {/* Area Fills */}
              {tempPoints && (
                <polygon
                  points={`0,${chartHeight - 15} ${tempPoints} ${chartWidth},${chartHeight - 15}`}
                  fill="url(#tempGradient)"
                />
              )}

              {wbgtPoints && (
                <polygon
                  points={`0,${chartHeight - 15} ${wbgtPoints} ${chartWidth},${chartHeight - 15}`}
                  fill="url(#wbgtGradient)"
                />
              )}

              {/* Trend Lines */}
              {tempPoints && (
                <polyline
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  points={tempPoints}
                />
              )}

              {wbgtPoints && (
                <polyline
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  points={wbgtPoints}
                />
              )}
            </svg>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono pt-1 px-1">
              <span>00:00 (Night)</span>
              <span>06:00 (Dawn)</span>
              <span>12:00 (Noon)</span>
              <span>15:00 (Peak Heat)</span>
              <span>18:00 (Dusk)</span>
              <span>23:00 (Night)</span>
            </div>
          </div>
        </div>

        {/* 6 Key Biometeorological & Health Risk Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <div className="rounded-xl border border-white/5 bg-slate-950/60 p-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Outdoor WBGT</span>
            <div className="text-xl font-extrabold text-rose-400 mt-0.5">{metrics.wbgt_outdoor_c ?? 32.5}°C</div>
            <span className="text-[10px] text-rose-300">ISO 7243 High Risk</span>
          </div>

          <div className="rounded-xl border border-white/5 bg-slate-950/60 p-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">UTCI Stress</span>
            <div className="text-xl font-extrabold text-orange-400 mt-0.5">{metrics.utci_c ?? 42.1}°C</div>
            <span className="text-[10px] text-orange-300">Very Strong Heat</span>
          </div>

          <div className="rounded-xl border border-white/5 bg-slate-950/60 p-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Heat Index</span>
            <div className="text-xl font-extrabold text-amber-400 mt-0.5">{metrics.heat_index_c ?? 48.4}°C</div>
            <span className="text-[10px] text-amber-300">Danger Zone</span>
          </div>

          <div className="rounded-xl border border-white/5 bg-slate-950/60 p-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Humidity (RH)</span>
            <div className="text-xl font-extrabold text-cyan-400 mt-0.5">{metrics.rel_humidity_pct ?? 38}%</div>
            <span className="text-[10px] text-cyan-300">Dewpoint: {metrics.dew_point_td ?? 22}°C</span>
          </div>

          <div className="rounded-xl border border-white/5 bg-slate-950/60 p-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Solar Radiation</span>
            <div className="text-xl font-extrabold text-amber-300 mt-0.5">{metrics.solar_radiation_wm2 ?? 850} W/m²</div>
            <span className="text-[10px] text-amber-400">Peak UV Flux</span>
          </div>

          <div className="rounded-xl border border-white/5 bg-slate-950/60 p-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Expected Surge</span>
            <div className="text-xl font-extrabold text-pink-400 mt-0.5">+{current_evaluation?.expected_hospital_surge_pct ?? 45}%</div>
            <span className="text-[10px] text-pink-300">ER Admissions</span>
          </div>
        </div>

        <Separator />

        {/* Socioeconomic Vulnerability & Resilience Factors */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Ward Demographic & Urban Microclimate Vulnerabilities
              </h4>
            </div>
            <span className="text-xs font-bold text-purple-300">
              Vulnerability Index: {((vuln.vulnerability_score || 0.58) * 100).toFixed(0)}/100
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-xl border border-white/5 bg-slate-950/60 p-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Outdoor Laborers</span>
                <span className="font-bold text-amber-400">{outdoorWorkerPct}%</span>
              </div>
              <Progress value={outdoorWorkerPct} indicatorClassName="bg-amber-500" />
              <p className="text-[10px] text-slate-400">Direct solar exposure and manual metabolic load</p>
            </div>

            <div className="rounded-xl border border-white/5 bg-slate-950/60 p-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Informal / Tin Roofing</span>
                <span className="font-bold text-rose-400">{informalHousingPct}%</span>
              </div>
              <Progress value={informalHousingPct} indicatorClassName="bg-rose-500" />
              <p className="text-[10px] text-slate-400">Low thermal inertia trapping lethal indoor heat</p>
            </div>

            <div className="rounded-xl border border-white/5 bg-slate-950/60 p-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Elderly & Children</span>
                <span className="font-bold text-pink-400">{elderlyPct + childrenPct}%</span>
              </div>
              <Progress value={elderlyPct + childrenPct} indicatorClassName="bg-pink-500" />
              <p className="text-[10px] text-slate-400">High thermoregulatory physiological sensitivity</p>
            </div>

            <div className="rounded-xl border border-white/5 bg-slate-950/60 p-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">NDVI Green Canopy</span>
                <span className="font-bold text-emerald-400">{(ndviVegetation * 100).toFixed(0)}%</span>
              </div>
              <Progress value={ndviVegetation * 100} indicatorClassName="bg-emerald-500" />
              <p className="text-[10px] text-slate-400">Urban heat island mitigation & shading index</p>
            </div>
          </div>
        </div>

        {/* Municipal Infrastructure Assets */}
        <div className="rounded-xl border border-white/5 bg-slate-950/40 p-3 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Hospital className="h-4 w-4 text-cyan-400" />
            <span className="text-slate-300">Designated HRI Hospitals: <strong className="text-white">{hospitalsCount} Facilities</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-emerald-400" />
            <span className="text-slate-300">Active Cooling Centers: <strong className="text-white">{coolingCentersCount} Centers</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-400" />
            <span className="text-slate-300">Power Grid Zone: <strong className="text-white">{powerGridZone}</strong></span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
