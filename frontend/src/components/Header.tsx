import React from 'react';
import { 
  Flame, 
  BookOpen, 
  UserCheck, 
  Send, 
  Key, 
  CloudSun, 
  Activity,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { SystemStatus } from '../types';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface HeaderProps {
  status: SystemStatus | null;
  activeScenario: string;
  onScenarioChange: (scenario: string) => void;
  pendingReviewsCount: number;
  dispatchMode: string;
  onOpenSettings: () => void;
  onOpenAnalyst: () => void;
  onOpenSimulator: () => void;
  onOpenMethodology: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  activeScenario,
  onScenarioChange,
  pendingReviewsCount,
  dispatchMode,
  onOpenSettings,
  onOpenAnalyst,
  onOpenSimulator,
  onOpenMethodology
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-slate-950/85 backdrop-blur-xl shadow-lg">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* Brand & Mission Title */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 via-orange-500 to-amber-500 shadow-lg shadow-orange-500/25 ring-1 ring-white/20">
            <Flame className="h-6 w-6 text-white drop-shadow-md" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 ring-2 ring-slate-950"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-orange-400 font-display">
                ThermalGuard
              </h1>
              <Badge variant="destructive" className="text-[10px] uppercase font-bold tracking-wider py-0 px-2 border-red-500/40 bg-red-500/20 text-red-300">
                Early Warning GIS
              </Badge>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Multi-Metric Heatwave Early Warning & Human Thermal Stress (WBGT • UTCI • EHF)
            </p>
          </div>
        </div>

        {/* Data Stream Pills Bar */}
        <div className="hidden lg:flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/80 px-3.5 py-1 text-xs text-slate-300 shadow-inner">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
            <span className="font-semibold text-white">IMD</span> Normals
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_6px_#3b82f6]" />
            <span className="font-semibold text-white">ERA5</span> Baseline
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#06b6d4]" />
            <span className="font-semibold text-white">Open-Meteo</span> Hourly
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-purple-500 shadow-[0_0_6px_#a855f7]" />
            <span className="font-semibold text-white">NCMRWF</span> 4km
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_6px_#f59e0b]" />
            <span className="font-semibold text-white">NCDC</span> HRI
          </div>
        </div>

        {/* Controls & Modals Trigger Bar */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Scenario Selector */}
          <div className="relative flex items-center">
            <CloudSun className="absolute left-2.5 h-4 w-4 text-amber-400 pointer-events-none" />
            <select
              value={activeScenario}
              onChange={(e) => onScenarioChange(e.target.value)}
              className="h-9 rounded-lg border border-white/15 bg-slate-900/90 pl-8 pr-3 text-xs font-semibold text-slate-100 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors cursor-pointer hover:border-white/30"
              title="Select meteorological scenario"
            >
              <option value="MAY_2024_EXTREME_HEATWAVE">May 2024 Severe Heatwave (49.2°C)</option>
              <option value="COASTAL_HUMID_HEAT">Coastal Sultry Wet-Bulb Surge (78% RH)</option>
              <option value="LIVE_SYNC">Live Real-Time Open-Meteo Stream</option>
            </select>
          </div>

          {/* Methodology Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenMethodology}
            className="text-xs gap-1.5 border-white/10 hover:border-cyan-500/40 hover:text-cyan-300"
            title="View system architecture, psychrometric formulas and feedback loop"
          >
            <BookOpen className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden md:inline">Methodology & Architecture</span>
          </Button>

          {/* Human-in-the-Loop Risk Analyst Review */}
          <Button
            variant={pendingReviewsCount > 0 ? "destructive" : "secondary"}
            size="sm"
            onClick={onOpenAnalyst}
            className={`text-xs gap-1.5 relative ${
              pendingReviewsCount > 0 
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30 ring-1 ring-rose-500/40' 
                : 'border-white/10 hover:border-slate-500'
            }`}
            title="Human-in-the-loop Risk Analyst calibration & approval portal"
          >
            <UserCheck className={`h-3.5 w-3.5 ${pendingReviewsCount > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-400'}`} />
            <span>Analyst Review</span>
            {pendingReviewsCount > 0 && (
              <Badge variant="extreme" className="px-1.5 py-0 text-[10px] ml-1 bg-red-600 text-white">
                {pendingReviewsCount}
              </Badge>
            )}
          </Button>

          {/* Settings / API Keys */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenSettings}
            className="text-xs gap-1.5 border-white/10 hover:border-slate-500"
            title="Configure Live Twilio, WhatsApp Business, and Fast2SMS credentials"
          >
            <Key className={`h-3.5 w-3.5 ${dispatchMode === 'LIVE_PRODUCTION' ? 'text-rose-400' : 'text-emerald-400'}`} />
            <span className="hidden sm:inline">API Keys</span>
            {dispatchMode === 'LIVE_PRODUCTION' && (
              <Badge className="px-1 py-0 text-[9px] bg-red-500/30 text-red-300 border-red-500/50">
                LIVE
              </Badge>
            )}
          </Button>

          {/* Alert Dispatcher */}
          <Button
            variant="cyan"
            size="sm"
            onClick={onOpenSimulator}
            className="text-xs gap-1.5 font-semibold shadow-cyan-600/30 hover:shadow-cyan-500/40 shadow-md"
            title="Simulate multi-channel citizen alert broadcasts & CAP v1.2 XML"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Alert Dispatcher</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
