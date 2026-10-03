import React, { useState, useEffect } from 'react';
import { 
  Printer, 
  Download, 
  FileText, 
  Building2, 
  ShieldAlert, 
  PhoneCall,
  CheckCircle,
  Clock,
  Landmark,
  Hospital
} from 'lucide-react';
import { API_BASE, apiFetch } from '../api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

interface HAPReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  wardId: string;
}

export const HAPReportModal: React.FC<HAPReportModalProps> = ({
  isOpen,
  onClose,
  wardId
}) => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen && wardId) {
      setLoading(true);
      apiFetch(`/reports/hap/${wardId}`)
        .then(res => res.json())
        .then(data => setReport(data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen, wardId]);

  const handlePrint = () => {
    window.print();
  };

  const getTierVariant = (tier?: string) => {
    switch (tier) {
      case 'EXTREME': return 'extreme';
      case 'SEVERE': return 'severe';
      case 'MODERATE': return 'moderate';
      default: return 'safe';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Landmark className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle>Municipal Heat Action Plan (HAP) Executive Brief</DialogTitle>
                <DialogDescription>
                  NDMA National Guidelines 2026 Compliant Action Plan for Municipal Commissioners & District Magistrates.
                </DialogDescription>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-2 text-xs border-white/10 hover:border-amber-500/50"
            >
              <Printer className="h-3.5 w-3.5 text-amber-400" />
              <span>Print Executive Brief</span>
            </Button>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-amber-400 mb-3" />
            <h4 className="text-sm font-semibold text-white">Compiling Municipal Directives</h4>
            <p className="text-xs text-slate-400">Synthesizing ward risk indices with NDMA contingency protocols...</p>
          </div>
        ) : report ? (
          <div className="space-y-6 pt-2">
            {/* Document Header Banner */}
            <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest block">
                    Government of India • National Disaster Management Authority (NDMA)
                  </span>
                  <h3 className="text-xl font-black text-white font-display mt-0.5">
                    Municipal Heatwave Emergency Directive: {report.ward?.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    City Jurisdiction: <strong className="text-slate-200">{report.city}</strong> ({report.region_type}) • Timestamp: {report.generated_at}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant={getTierVariant(report.heat_stress_evaluation?.tier)} className="text-sm px-3 py-1 uppercase font-black">
                    {report.heat_stress_evaluation?.tier} ALERT
                  </Badge>
                  <span className="text-[11px] text-slate-400 block mt-1">Status: Active Field Enforcement</span>
                </div>
              </div>

              {/* Multi-Metric Table */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                <div className="rounded-xl bg-slate-900/90 border border-white/5 p-3">
                  <span className="text-slate-400 block text-[10px] uppercase">Ambient Max Temp</span>
                  <span className="text-lg font-bold text-rose-400">{report.heat_stress_evaluation?.metrics?.temp_max_c ?? 46}°C</span>
                  <span className="text-[10px] text-slate-500 block">IMD Departure: +{report.heat_stress_evaluation?.metrics?.imd_departure_c ?? 5.2}°C</span>
                </div>
                <div className="rounded-xl bg-slate-900/90 border border-white/5 p-3">
                  <span className="text-slate-400 block text-[10px] uppercase">Outdoor WBGT</span>
                  <span className="text-lg font-bold text-amber-400">{report.heat_stress_evaluation?.metrics?.wbgt_outdoor_c ?? 33.1}°C</span>
                  <span className="text-[10px] text-slate-500 block">ISO 7243 High Risk Threshold</span>
                </div>
                <div className="rounded-xl bg-slate-900/90 border border-white/5 p-3">
                  <span className="text-slate-400 block text-[10px] uppercase">UTCI Heat Strain</span>
                  <span className="text-lg font-bold text-orange-400">{report.heat_stress_evaluation?.metrics?.utci_c ?? 44.5}°C</span>
                  <span className="text-[10px] text-slate-500 block">Strong Multi-Node Stress</span>
                </div>
                <div className="rounded-xl bg-slate-900/90 border border-white/5 p-3">
                  <span className="text-slate-400 block text-[10px] uppercase">Forecasted Hospital Surge</span>
                  <span className="text-lg font-bold text-pink-400">+{report.heat_stress_evaluation?.expected_hospital_surge_pct ?? 85}%</span>
                  <span className="text-[10px] text-slate-500 block">NCDC Surveillance Baseline</span>
                </div>
              </div>
            </div>

            {/* Emergency Directives */}
            <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-5 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-400" />
                <span>Statutory Inter-Agency Directives (NDMA Section 12 Mandate)</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="rounded-xl bg-slate-900/80 border border-white/5 p-4 space-y-2">
                  <h5 className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <Building2 className="h-4 w-4" /> 1. Municipal Administration & Public Spaces
                  </h5>
                  <ul className="list-disc pl-4 space-y-1 text-slate-300 leading-relaxed">
                    <li>Activate all designated municipal cooling shelters with potable chilled water and ORS packets.</li>
                    <li>Operate misting cannons at major transit hubs and marketplace centers from 11:30 to 16:30 IST.</li>
                    <li>Halt outdoor construction and unshaded manual labor between 12:00 PM and 4:00 PM.</li>
                  </ul>
                </div>

                <div className="rounded-xl bg-slate-900/80 border border-white/5 p-4 space-y-2">
                  <h5 className="font-bold text-pink-300 flex items-center gap-1.5">
                    <Hospital className="h-4 w-4" /> 2. Health Facilities & Hospital Surge
                  </h5>
                  <ul className="list-disc pl-4 space-y-1 text-slate-300 leading-relaxed">
                    <li>Reserve dedicated cold-water immersion tubs and ice packs in emergency casualty wards.</li>
                    <li>Mobilize ASHA and Anganwadi workers for door-to-door vulnerability checks in informal slum clusters.</li>
                    <li>Stock adequate IV Normal Saline (0.9%), Ringer's Lactate, and Oral Rehydration Salts.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Emergency Helplines */}
            <div className="rounded-xl border border-white/5 bg-slate-950/60 p-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                24x7 Emergency Inter-Agency Hotlines
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="flex items-center gap-2 rounded-lg bg-slate-900/80 border border-white/5 p-2">
                  <PhoneCall className="h-3.5 w-3.5 text-rose-400" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">Disaster Control</span>
                    <strong className="text-white font-mono">1077</strong>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-slate-900/80 border border-white/5 p-2">
                  <PhoneCall className="h-3.5 w-3.5 text-pink-400" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">Ambulance HRI</span>
                    <strong className="text-white font-mono">108</strong>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-slate-900/80 border border-white/5 p-2">
                  <PhoneCall className="h-3.5 w-3.5 text-cyan-400" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">Water Tanker Supply</span>
                    <strong className="text-white font-mono">1916</strong>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-slate-900/80 border border-white/5 p-2">
                  <PhoneCall className="h-3.5 w-3.5 text-amber-400" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">Power Discom</span>
                    <strong className="text-white font-mono">1912</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
