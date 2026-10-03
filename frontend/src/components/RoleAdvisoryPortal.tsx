import React, { useState } from 'react';
import { 
  Users, 
  HeartHandshake, 
  Briefcase, 
  Hospital, 
  Building, 
  CheckCircle2, 
  ShieldAlert, 
  Clock, 
  Droplet, 
  AlertTriangle 
} from 'lucide-react';
import { RoleAdvisories, WardRisk } from '../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Badge } from './ui/badge';

interface RoleAdvisoryPortalProps {
  advisories: RoleAdvisories | null;
  risk: WardRisk;
  wardName: string;
}

export const RoleAdvisoryPortal: React.FC<RoleAdvisoryPortalProps> = ({
  advisories,
  risk,
  wardName
}) => {
  const [activeRole, setActiveRole] = useState<'citizens' | 'asha' | 'workers' | 'hospitals' | 'utilities'>('citizens');

  if (!advisories) return null;

  const roleConfigs = [
    {
      id: 'citizens',
      label: 'General Citizens',
      icon: Users,
      data: advisories.citizens,
      color: '#38bdf8',
      bgGlow: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
    },
    {
      id: 'asha',
      label: 'ASHA Healthcare Workers',
      icon: HeartHandshake,
      data: advisories.asha_workers,
      color: '#c084fc',
      bgGlow: 'bg-purple-500/10 text-purple-400 border-purple-500/30'
    },
    {
      id: 'workers',
      label: 'Employers & Outdoor Labor',
      icon: Briefcase,
      data: advisories.outdoor_workers,
      color: '#f59e0b',
      bgGlow: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
    },
    {
      id: 'hospitals',
      label: 'Hospitals & Emergency Care',
      icon: Hospital,
      data: advisories.hospitals,
      color: '#ec4899',
      bgGlow: 'bg-pink-500/10 text-pink-400 border-pink-500/30'
    },
    {
      id: 'utilities',
      label: 'Municipal & Power Utilities',
      icon: Building,
      data: advisories.municipal_utilities,
      color: '#10b981',
      bgGlow: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    }
  ];

  const currentRoleConfig = roleConfigs.find(r => r.id === activeRole) || roleConfigs[0];
  const roleData = currentRoleConfig.data;

  const getTierVariant = (tier?: string) => {
    switch (tier) {
      case 'EXTREME': return 'extreme';
      case 'SEVERE': return 'severe';
      case 'MODERATE': return 'moderate';
      default: return 'safe';
    }
  };

  return (
    <Card className="border-white/10 bg-slate-900/80 shadow-2xl backdrop-blur-xl mb-8">
      {/* Header */}
      <div className="border-b border-white/10 bg-slate-950/60 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-orange-400" />
              <h3 className="text-xl font-bold tracking-tight text-white font-display">
                Targeted Role-Specific Action Portals
              </h3>
              <Badge variant="outline" className="text-xs text-slate-300 border-white/15">
                NDMA HAP 2026 Guidelines
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Precision advisories and operational action directives calibrated for <strong className="text-slate-200">{wardName}</strong> under <strong className="text-rose-400">{risk.tier}</strong> warning conditions.
            </p>
          </div>

          <Badge variant={getTierVariant(risk.tier)} className="text-xs uppercase font-extrabold px-3 py-1">
            Active Warning: {risk.tier}
          </Badge>
        </div>
      </div>

      <CardContent className="p-5 space-y-6">
        {/* Role Selector Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
          {roleConfigs.map(role => {
            const Icon = role.icon;
            const isActive = activeRole === role.id;
            return (
              <button
                key={role.id}
                onClick={() => setActiveRole(role.id as any)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all border ${
                  isActive
                    ? `${role.bgGlow} shadow-lg ring-1 ring-white/10`
                    : 'bg-slate-950/60 text-slate-400 border-white/5 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{role.label}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Role Content */}
        {roleData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Directives Banner */}
            <div className="lg:col-span-1 rounded-2xl border border-white/10 bg-slate-950/70 p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${currentRoleConfig.bgGlow}`}>
                  <currentRoleConfig.icon className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">{roleData.title}</h4>
                  <Badge variant="outline" className="text-[11px] text-cyan-300 border-cyan-500/30 mt-1">
                    {roleData.badge}
                  </Badge>
                </div>
              </div>

              <div className="rounded-xl bg-slate-900/90 border border-white/5 p-4 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-amber-400 font-semibold">
                  <Clock className="h-4 w-4" />
                  <span>Mandatory Hours: 11:30 - 16:00 IST</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Peak diurnal heat strain window. Implement primary non-medical interventions (ORS distribution, shading halts, and cooling relief) immediately.
                </p>
              </div>

              <div className="rounded-xl bg-slate-900/90 border border-white/5 p-4 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-cyan-400 font-semibold">
                  <Droplet className="h-4 w-4" />
                  <span>Electrolyte & Hydration Protocol</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Consume 250ml electrolyte/salted lassi/ORS solution every 30 minutes during active periods.
                </p>
              </div>
            </div>

            {/* Checklist of Protocols */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Actionable Directives & Operational Directives ({roleData.actions?.length || 0})</span>
              </h4>

              <div className="space-y-2.5">
                {(roleData.actions || []).map((action, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 rounded-xl border border-white/5 bg-slate-950/50 p-4 transition-colors hover:border-white/15 hover:bg-slate-950/80"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/15 border border-cyan-500/30 text-xs font-bold text-cyan-400 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-sm text-slate-200 leading-relaxed">
                      {action}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
