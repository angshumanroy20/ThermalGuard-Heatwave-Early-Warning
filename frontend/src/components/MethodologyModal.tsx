import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Cpu, 
  Calculator, 
  BrainCircuit, 
  Radio, 
  ArrowRight, 
  CheckCircle,
  Sparkles,
  TrendingUp,
  RefreshCw,
  FileCheck
} from 'lucide-react';
import { API_BASE, apiFetch } from '../api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MethodologyModal: React.FC<MethodologyModalProps> = ({ isOpen, onClose }) => {
  const [feedbackLogs, setFeedbackLogs] = useState<any[]>([]);
  const [wardName, setWardName] = useState<string>('Danilimda / Ahmedabad');
  const [predictedSurge, setPredictedSurge] = useState<number>(75.0);
  const [actualSurge, setActualSurge] = useState<number>(78.2);
  const [feedbackNotes, setFeedbackNotes] = useState<string>('Surge peaked between 14:00 and 17:00 at municipal civil hospital.');
  const [submittingFeedback, setSubmittingFeedback] = useState<boolean>(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      apiFetch('/feedback/logs')
        .then(res => res.json())
        .then(data => setFeedbackLogs(data))
        .catch(console.error);
    }
  }, [isOpen]);

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    try {
      const res = await apiFetch('/feedback/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ward_name: wardName,
          predicted_surge_pct: Number(predictedSurge),
          actual_hospital_surge_pct: Number(actualSurge),
          notes: feedbackNotes
        })
      });
      const data = await res.json();
      setFeedbackLogs(prev => [data.entry, ...prev]);
      setFeedbackSuccess(true);
      setTimeout(() => setFeedbackSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const steps = [
    {
      num: 1,
      title: 'DATA ACQUISITION',
      subtitle: 'Weather, Demography & Public Health',
      icon: Database,
      color: 'text-cyan-400',
      bgGlow: 'bg-cyan-500/10 border-cyan-500/20',
      desc: 'Ingests IMD official station standards, ERA5 30-year climate reanalysis normals (1991-2020), Open-Meteo live hourly NWP, NCMRWF 4km ensemble predictions, and IMD-NCDC Heat-Related Illness registers.'
    },
    {
      num: 2,
      title: 'PRE-PROCESSING',
      subtitle: 'Clean, Align & Psychrometric Scale',
      icon: Cpu,
      color: 'text-indigo-400',
      bgGlow: 'bg-indigo-500/10 border-indigo-500/20',
      desc: 'Normalizes sensor intervals, derives psychrometric parameters via Magnus-Tetens dewpoint equations, performs spatial interpolation across ward centroids, and standardizes demographic census tracts.'
    },
    {
      num: 3,
      title: 'COMPUTATION',
      subtitle: 'WBGT, UTCI, Heat Index & Strains',
      icon: Calculator,
      color: 'text-amber-400',
      bgGlow: 'bg-amber-500/10 border-amber-500/20',
      desc: 'Solves physical heat balance: Stull (2011) Wet Bulb (Tw), Liljegren black globe equilibrium (Tg), Outdoor WBGT (0.7Tw+0.2Tg+0.1Td), Universal Thermal Climate Index (UTCI), and Excess Heat Factor (EHF).'
    },
    {
      num: 4,
      title: 'MODEL PREDICTION',
      subtitle: 'Surrogate Machine Learning Engine',
      icon: BrainCircuit,
      color: 'text-pink-400',
      bgGlow: 'bg-pink-500/10 border-pink-500/20',
      desc: 'Blends biometeorological stress with ward vulnerability weights (Elderly & Children %, Outdoor Labor %, Informal Tin-Roof Housing %, and NDVI canopy deficit) to predict hospital admission surges 3-5 days in advance.'
    },
    {
      num: 5,
      title: 'DECISION SUPPORT',
      subtitle: 'Human-in-the-Loop & Multi-Channel Action',
      icon: Radio,
      color: 'text-emerald-400',
      bgGlow: 'bg-emerald-500/10 border-emerald-500/20',
      desc: 'Provides certified meteorologists a review portal to verify and calibrate warnings before multi-channel dissemination: WhatsApp Business, SMS, Fast2SMS, NDMA SACHET CAP v1.2 XML, and Municipal HAPs.'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Methodology, Mathematical Formulations & Architecture</DialogTitle>
              <DialogDescription>
                ISO 7243 WBGT, Universal Thermal Climate Index (UTCI), and Closed-Loop Epidemiological Feedback.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* 5-Step Pipeline Flow */}
        <div className="space-y-3 pt-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
            5-Stage End-to-End Early Warning Architecture
          </span>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5">
            {steps.map(step => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className={`rounded-xl border p-3 flex flex-col justify-between ${step.bgGlow}`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold text-slate-400">0{step.num}</span>
                      <Icon className={`h-4 w-4 ${step.color}`} />
                    </div>
                    <h5 className="text-xs font-bold text-white leading-tight mb-1">{step.title}</h5>
                    <p className="text-[10px] text-slate-300 font-medium mb-2">{step.subtitle}</p>
                    <p className="text-[10px] text-slate-400 leading-normal">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mathematical Formulas Card */}
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Calculator className="h-3.5 w-3.5 text-amber-400" />
            Core Psychrometric & Biometeorological Formulations
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="rounded-xl bg-slate-900/80 border border-white/5 p-3 space-y-1">
              <span className="font-bold text-cyan-300">1. Outdoor WBGT (ISO 7243)</span>
              <p className="font-mono text-[11px] text-slate-300 bg-black/40 p-1.5 rounded border border-white/5">
                WBGT = 0.7·Tw + 0.2·Tg + 0.1·Td
              </p>
              <p className="text-[10px] text-slate-400">Where Tw is Stull natural wet bulb, Tg is black globe equilibrium, Td is dry ambient.</p>
            </div>

            <div className="rounded-xl bg-slate-900/80 border border-white/5 p-3 space-y-1">
              <span className="font-bold text-orange-300">2. UTCI Equivalent Temp</span>
              <p className="font-mono text-[11px] text-slate-300 bg-black/40 p-1.5 rounded border border-white/5">
                UTCI = Ta + Offset(Ta, Tmrt, va, pa)
              </p>
              <p className="text-[10px] text-slate-400">Multi-node human thermoregulation model quantifying physiological strain.</p>
            </div>

            <div className="rounded-xl bg-slate-900/80 border border-white/5 p-3 space-y-1">
              <span className="font-bold text-pink-300">3. Hospital ER Surge Function</span>
              <p className="font-mono text-[11px] text-slate-300 bg-black/40 p-1.5 rounded border border-white/5">
                Surge% = β₀ + β₁(WBGT-28) + β₂·Vuln
              </p>
              <p className="text-[10px] text-slate-400">Calibrated against NCDC Heat-Related Illness surveillance registers.</p>
            </div>
          </div>
        </div>

        {/* Closed-Loop Feedback Section */}
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <RefreshCw className="h-3.5 w-3.5 text-emerald-400" />
                System Feedback & Model Self-Calibration Loop
              </span>
              <p className="text-xs text-slate-400">
                Ground truth observations from municipal emergency rooms continuously train and calibrate the AI surrogate model.
              </p>
            </div>
            {feedbackSuccess && (
              <Badge variant="safe" className="gap-1 text-xs">
                <CheckCircle className="h-3.5 w-3.5" />
                <span>Calibrated into ML Pipeline!</span>
              </Badge>
            )}
          </div>

          <form onSubmit={handleSubmitFeedback} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Ward Name</label>
              <Input
                value={wardName}
                onChange={e => setWardName(e.target.value)}
                className="text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Predicted Surge %</label>
              <Input
                type="number"
                value={predictedSurge}
                onChange={e => setPredictedSurge(Number(e.target.value))}
                className="text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Actual Observed %</label>
              <Input
                type="number"
                value={actualSurge}
                onChange={e => setActualSurge(Number(e.target.value))}
                className="text-xs"
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="gradient"
                type="submit"
                disabled={submittingFeedback}
                className="w-full text-xs font-semibold"
              >
                {submittingFeedback ? 'Calibrating...' : 'Submit Calibration'}
              </Button>
            </div>
          </form>

          {/* Feedback Log Table */}
          <div className="rounded-xl border border-white/5 bg-slate-900/80 overflow-hidden">
            <div className="overflow-x-auto max-h-[160px]">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-white/5">
                  <tr>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Ward</th>
                    <th className="p-2.5">Predicted</th>
                    <th className="p-2.5">Observed</th>
                    <th className="p-2.5">Accuracy</th>
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {feedbackLogs.map((log, idx) => (
                    <tr key={idx} className="hover:bg-white/5">
                      <td className="p-2.5 font-mono text-slate-400">{log.event_date}</td>
                      <td className="p-2.5 font-semibold text-white">{log.ward_name}</td>
                      <td className="p-2.5 text-cyan-300">+{log.predicted_surge_pct}%</td>
                      <td className="p-2.5 text-rose-300">+{log.actual_hospital_surge_pct}%</td>
                      <td className="p-2.5 font-bold text-emerald-400">{log.accuracy_pct}%</td>
                      <td className="p-2.5">
                        <Badge variant="outline" className="text-[9px] border-emerald-500/30 text-emerald-300 bg-emerald-500/10">
                          {log.calibrated_status || 'CONVERGED'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
