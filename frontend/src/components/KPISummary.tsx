import React from 'react';
import { ThermometerSun, AlertTriangle, Hospital, ShieldCheck, Users, Flame, Activity } from 'lucide-react';
import { WardSummary } from '../types';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';

interface KPISummaryProps {
  wards: WardSummary[];
}

export const KPISummary: React.FC<KPISummaryProps> = ({ wards }) => {
  if (!wards.length) return null;

  // Compute summary stats
  let peakWbgt = -999;
  let peakUtci = -999;
  let peakWbgtWard = '';
  let maxHospitalSurge = 0;
  
  const tierCounts: { [key: string]: number } = {
    SAFE: 0,
    MODERATE: 0,
    SEVERE: 0,
    EXTREME: 0
  };

  wards.forEach(w => {
    const wbgt = w.risk?.metrics?.wbgt_outdoor_c ?? 0;
    const utci = w.risk?.metrics?.utci_c ?? 0;
    const surge = w.risk?.expected_hospital_surge_pct ?? 0;
    
    if (wbgt > peakWbgt) {
      peakWbgt = wbgt;
      peakWbgtWard = `${w.name} (${w.city})`;
    }
    if (utci > peakUtci) {
      peakUtci = utci;
    }
    if (surge > maxHospitalSurge) {
      maxHospitalSurge = surge;
    }
    const t = w.risk?.tier || 'SAFE';
    tierCounts[t] = (tierCounts[t] || 0) + 1;
  });

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      {/* Peak WBGT Card */}
      <Card className="relative overflow-hidden border-l-4 border-l-rose-500 bg-slate-900/80 backdrop-blur-xl border-t-white/10 border-r-white/10 border-b-white/10 shadow-xl transition-all duration-300 hover:translate-y-[-2px] hover:border-l-rose-400">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Peak Outdoor WBGT
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight text-rose-400 font-display">
                  {peakWbgt.toFixed(1)}°C
                </span>
                <Badge variant="extreme" className="text-[10px] py-0 px-1.5">
                  ISO 7243 High
                </Badge>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-[210px]" title={peakWbgtWard}>
                Ward: <span className="text-slate-200 font-medium">{peakWbgtWard}</span>
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <ThermometerSun className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Peak UTCI Card */}
      <Card className="relative overflow-hidden border-l-4 border-l-orange-500 bg-slate-900/80 backdrop-blur-xl border-t-white/10 border-r-white/10 border-b-white/10 shadow-xl transition-all duration-300 hover:translate-y-[-2px] hover:border-l-orange-400">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Peak UTCI Strain
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight text-orange-400 font-display">
                  {peakUtci.toFixed(1)}°C
                </span>
                <Badge variant="severe" className="text-[10px] py-0 px-1.5">
                  Severe Stress
                </Badge>
              </div>
              <p className="text-xs text-slate-400">
                Multi-node biometeorological load
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Peak Hospital Surge Card */}
      <Card className="relative overflow-hidden border-l-4 border-l-pink-500 bg-slate-900/80 backdrop-blur-xl border-t-white/10 border-r-white/10 border-b-white/10 shadow-xl transition-all duration-300 hover:translate-y-[-2px] hover:border-l-pink-400">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Peak Hospital ER Surge
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight text-pink-400 font-display">
                  +{maxHospitalSurge.toFixed(0)}%
                </span>
                <Badge className="text-[10px] py-0 px-1.5 bg-pink-500/15 text-pink-300 border-pink-500/30">
                  Surge Load
                </Badge>
              </div>
              <p className="text-xs text-slate-400">
                NCDC HRI epidemiological model
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400">
              <Hospital className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ward Alert Tier Distribution */}
      <Card className="relative overflow-hidden border-l-4 border-l-cyan-500 bg-slate-900/80 backdrop-blur-xl border-t-white/10 border-r-white/10 border-b-white/10 shadow-xl transition-all duration-300 hover:translate-y-[-2px] hover:border-l-cyan-400">
        <CardContent className="p-4 sm:p-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Monitored Wards Status ({wards.length})
              </span>
              <Activity className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2 text-center">
                <div className="text-lg font-bold text-emerald-400">{tierCounts.SAFE || 0}</div>
                <div className="text-[10px] text-emerald-300 font-medium">Safe</div>
              </div>
              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-2 text-center">
                <div className="text-lg font-bold text-amber-400">{tierCounts.MODERATE || 0}</div>
                <div className="text-[10px] text-amber-300 font-medium">Mod</div>
              </div>
              <div className="rounded-lg bg-orange-500/10 border border-orange-500/20 p-2 text-center">
                <div className="text-lg font-bold text-orange-400">{tierCounts.SEVERE || 0}</div>
                <div className="text-[10px] text-orange-300 font-medium">Sev</div>
              </div>
              <div className="rounded-lg bg-rose-500/15 border border-rose-500/30 p-2 text-center">
                <div className="text-lg font-bold text-rose-400">{tierCounts.EXTREME || 0}</div>
                <div className="text-[10px] text-rose-300 font-bold">Ext</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
