import React, { useState } from 'react';
import { 
  UserCheck, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  Send, 
  History,
  Activity,
  Sparkles,
  Layers,
  ThermometerSun
} from 'lucide-react';
import { AnalystReviewItem, ApprovedBroadcastItem } from '../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';

interface RiskAnalystModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingReviews: AnalystReviewItem[];
  approvedBroadcasts: ApprovedBroadcastItem[];
  onApproveReview: (reviewId: string, analystName: string, calibratedTier?: string, notes?: string) => Promise<void>;
}

export const RiskAnalystModal: React.FC<RiskAnalystModalProps> = ({
  isOpen,
  onClose,
  pendingReviews,
  approvedBroadcasts,
  onApproveReview
}) => {
  const [selectedReviewId, setSelectedReviewId] = useState<string>(
    pendingReviews.length > 0 ? pendingReviews[0].id : ''
  );
  const [analystName, setAnalystName] = useState<string>('Dr. V. K. Nair (Senior Agrometeorologist)');
  const [calibratedTier, setCalibratedTier] = useState<string>('');
  const [analystNotes, setAnalystNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

  const currentReview = pendingReviews.find(r => r.id === selectedReviewId) || pendingReviews[0];

  const handleApprove = async () => {
    if (!currentReview) return;
    setSubmitting(true);
    try {
      await onApproveReview(
        currentReview.id,
        analystName,
        calibratedTier || currentReview.ai_tier,
        analystNotes
      );
      setCalibratedTier('');
      setAnalystNotes('');
      const remaining = pendingReviews.filter(r => r.id !== currentReview.id);
      if (remaining.length > 0) {
        setSelectedReviewId(remaining[0].id);
      }
    } finally {
      setSubmitting(false);
    }
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Human-in-the-Loop Risk Analyst Review Portal</DialogTitle>
              <DialogDescription>
                Verification queue where certified meteorologists review AI Risk Engine assessments before alerts are dispatched.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <Button
            variant={activeTab === 'pending' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('pending')}
            className="gap-2 text-xs"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Pending Approvals ({pendingReviews.length})</span>
          </Button>
          <Button
            variant={activeTab === 'history' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('history')}
            className="gap-2 text-xs"
          >
            <History className="h-3.5 w-3.5" />
            <span>Broadcast Audit Log ({approvedBroadcasts.length})</span>
          </Button>
        </div>

        {activeTab === 'pending' ? (
          pendingReviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 mb-3 border border-emerald-500/20">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h4 className="text-base font-bold text-white">All Clear! No Reviews Pending</h4>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                The surrogate AI risk engine queue is currently clear. Any high-risk forecasts automatically populate this queue.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Queue sidebar */}
              <div className="md:col-span-1 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Queue Items ({pendingReviews.length})
                </span>
                <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                  {pendingReviews.map(review => {
                    const isSelected = (currentReview && currentReview.id === review.id) || selectedReviewId === review.id;
                    return (
                      <button
                        key={review.id}
                        onClick={() => setSelectedReviewId(review.id)}
                        className={`w-full text-left p-3 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-slate-900 border-purple-500 shadow-lg ring-1 ring-purple-500/30'
                            : 'bg-slate-950/60 border-white/5 hover:bg-slate-900/60 hover:border-white/15'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white truncate max-w-[130px]">{review.ward_name}</span>
                          <Badge variant={getTierVariant(review.ai_tier)} className="text-[9px] py-0 px-1.5 uppercase">
                            {review.ai_tier}
                          </Badge>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                          <span>{review.city}</span>
                          <span className="font-semibold text-rose-400">Score: {review.ai_risk_score}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Review Workspace */}
              {currentReview && (
                <div className="md:col-span-2 rounded-2xl border border-white/10 bg-slate-950/70 p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                    <div>
                      <h3 className="text-lg font-bold text-white">{currentReview.ward_name}</h3>
                      <p className="text-xs text-slate-400">{currentReview.city} • Queue ID: <span className="font-mono text-cyan-400">{currentReview.id}</span></p>
                    </div>
                    <Badge variant={getTierVariant(currentReview.ai_tier)} className="text-xs font-bold uppercase px-2.5 py-0.5">
                      AI Tier: {currentReview.ai_tier}
                    </Badge>
                  </div>

                  {/* AI Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="rounded-xl border border-white/5 bg-slate-900/80 p-2.5">
                      <span className="text-[10px] text-slate-400 block">Ambient Temp</span>
                      <strong className="text-base text-rose-400">{currentReview.metrics?.temp_max_c ?? 46.5}°C</strong>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-slate-900/80 p-2.5">
                      <span className="text-[10px] text-slate-400 block">Outdoor WBGT</span>
                      <strong className="text-base text-amber-400">{currentReview.metrics?.wbgt_outdoor_c ?? 33.2}°C</strong>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-slate-900/80 p-2.5">
                      <span className="text-[10px] text-slate-400 block">UTCI Stress</span>
                      <strong className="text-base text-orange-400">{currentReview.metrics?.utci_c ?? 44.8}°C</strong>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-slate-900/80 p-2.5">
                      <span className="text-[10px] text-slate-400 block">Surge Forecast</span>
                      <strong className="text-base text-pink-400">+{currentReview.predicted_surge_pct ?? 102}%</strong>
                    </div>
                  </div>

                  {/* Surrogate AI notes */}
                  <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-3 text-xs text-purple-200">
                    <span className="font-bold flex items-center gap-1.5 mb-1 text-purple-300">
                      <Sparkles className="h-3.5 w-3.5" /> AI Engine Decision Rationale:
                    </span>
                    {currentReview.analyst_notes || 'High outdoor workforce exposure combined with severe tin-roof microclimates requires immediate operational verification.'}
                  </div>

                  {/* Analyst Input Form */}
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Authorizing Meteorologist Name
                      </label>
                      <Input
                        value={analystName}
                        onChange={(e) => setAnalystName(e.target.value)}
                        placeholder="e.g. Dr. V. K. Nair"
                        className="text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Calibration Tier Override (Optional)
                      </label>
                      <select
                        value={calibratedTier}
                        onChange={(e) => setCalibratedTier(e.target.value)}
                        className="w-full h-9 rounded-lg border border-white/10 bg-slate-900 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-400 cursor-pointer"
                      >
                        <option value="">Keep AI Predicted Tier ({currentReview.ai_tier})</option>
                        <option value="EXTREME">Override to EXTREME (Red Alert)</option>
                        <option value="SEVERE">Override to SEVERE (Orange Alert)</option>
                        <option value="MODERATE">Override to MODERATE (Yellow Alert)</option>
                        <option value="SAFE">Override to SAFE (Green Advisory)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Operational Directives & Validation Notes
                      </label>
                      <textarea
                        value={analystNotes}
                        onChange={(e) => setAnalystNotes(e.target.value)}
                        placeholder="Add verified meteorological remarks, cooling center orders, or field directives..."
                        rows={3}
                        className="w-full rounded-lg border border-white/10 bg-slate-900 p-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-400"
                      />
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={onClose} className="text-xs border-white/10">
                        Cancel
                      </Button>
                      <Button
                        variant="gradient"
                        size="sm"
                        onClick={handleApprove}
                        disabled={submitting}
                        className="gap-2 text-xs font-semibold"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        <span>{submitting ? 'Authenticating & Dispatching...' : 'Approve & Dispatch Public Broadcast'}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        ) : (
          /* History Audit Log */
          <div className="space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Verified Broadcast Records
            </span>
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {approvedBroadcasts.map(bc => (
                <div key={bc.id} className="rounded-xl border border-white/10 bg-slate-950/70 p-4 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{bc.ward_name}</span>
                      <Badge variant={getTierVariant(bc.tier)} className="text-[10px] uppercase font-bold px-2 py-0">
                        {bc.tier}
                      </Badge>
                      <span className="text-xs text-slate-400">({bc.city})</span>
                    </div>
                    <span className="text-[11px] font-mono text-cyan-400">{bc.approved_at}</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Approved By: <strong className="text-slate-100">{bc.approved_by}</strong>
                  </p>
                  {bc.analyst_notes && (
                    <p className="text-xs text-slate-400 italic bg-black/30 p-2 rounded-lg border border-white/5">
                      "{bc.analyst_notes}"
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-slate-400">Channels Dispatched:</span>
                    {(bc.channels_used || []).map((ch, i) => (
                      <Badge key={i} variant="outline" className="text-[10px] border-white/10 text-cyan-300 bg-cyan-500/10">
                        {ch}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
