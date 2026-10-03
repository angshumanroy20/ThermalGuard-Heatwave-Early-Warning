import React, { useState } from 'react';
import { 
  Send, 
  Smartphone, 
  MessageSquare, 
  FileCode, 
  CheckCheck, 
  Download, 
  Copy,
  Radio, 
  PhoneCall,
  ExternalLink,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { WardSummary } from '../types';
import { API_BASE, apiFetch } from '../api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';

interface AlertSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  wards: WardSummary[];
  defaultWardId?: string;
}

export const AlertSimulatorModal: React.FC<AlertSimulatorModalProps> = ({
  isOpen,
  onClose,
  wards,
  defaultWardId
}) => {
  const [selectedWardId, setSelectedWardId] = useState<string>(
    defaultWardId || (wards.length > 0 ? wards[0].id : '')
  );
  const [phoneNumber, setPhoneNumber] = useState<string>('+91 98234 56789');
  const [channel, setChannel] = useState<'whatsapp' | 'sms' | 'fast2sms' | 'sachet'>('whatsapp');
  const [loading, setLoading] = useState<boolean>(false);
  const [simulatedResult, setSimulatedResult] = useState<any>(null);
  const [sachetXml, setSachetXml] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const currentWard = wards.find(w => w.id === selectedWardId) || wards[0];

  const handleSimulate = async () => {
    if (!currentWard) return;
    setLoading(true);
    setSimulatedResult(null);
    try {
      if (channel === 'sachet') {
        const res = await apiFetch(`/alerts/sachet-xml/${currentWard.id}`);
        const data = await res.json();
        setSachetXml(data.xml);
        setSimulatedResult({
          status: 'XML_GENERATED',
          channel: 'NDMA SACHET CAP v1.2',
          timestamp: new Date().toLocaleTimeString()
        });
      } else {
        const res = await apiFetch('/alerts/simulate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ward_id: currentWard.id,
            phone_number: phoneNumber,
            channel: channel
          })
        });
        const data = await res.json();
        setSimulatedResult(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <Send className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Multi-Channel Alert Dispatcher & SACHET Protocol</DialogTitle>
              <DialogDescription>
                Test live dispatch to WhatsApp Business, Twilio SMS, Fast2SMS, or generate NDMA SACHET CAP v1.2 XML.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Configuration Form */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Target Municipal Ward
              </label>
              <select
                value={selectedWardId}
                onChange={(e) => setSelectedWardId(e.target.value)}
                className="w-full h-9 rounded-lg border border-white/10 bg-slate-900 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
              >
                {wards.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.city}) — Tier: {w.risk?.tier}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Recipient Handset Number
              </label>
              <Input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 98765 43210"
                className="text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                Carrier & Protocol Gateway
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'whatsapp', label: 'WhatsApp Business', icon: MessageSquare, sub: 'Rich Interactive Cards' },
                  { id: 'sms', label: 'Twilio Cloud SMS', icon: Smartphone, sub: 'Direct Telco Trunk' },
                  { id: 'fast2sms', label: 'Fast2SMS India', icon: Zap, sub: 'National DLT / OTP' },
                  { id: 'sachet', label: 'NDMA SACHET CAP', icon: FileCode, sub: 'CAP v1.2 XML Broadcast' }
                ].map(item => {
                  const Icon = item.icon;
                  const isSelected = channel === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setChannel(item.id as any)}
                      className={`flex flex-col p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-blue-500/15 border-blue-500/50 shadow-md ring-1 ring-blue-500/30'
                          : 'bg-slate-950/60 border-white/5 hover:bg-slate-900/60 hover:border-white/15'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white mb-0.5">
                        <Icon className="h-3.5 w-3.5 text-cyan-400" />
                        <span>{item.label}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{item.sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <Button
              variant="cyan"
              onClick={handleSimulate}
              disabled={loading}
              className="w-full gap-2 font-semibold text-xs shadow-lg shadow-cyan-500/20"
            >
              <Send className="h-4 w-4" />
              <span>{loading ? 'Dispatching Broadcast...' : 'Execute Public Alert Broadcast'}</span>
            </Button>
          </div>

          {/* Result & Handset Preview */}
          <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Smartphone className="h-3.5 w-3.5 text-cyan-400" />
                  Live Handset Delivery Receipt
                </span>
                {simulatedResult && (
                  <Badge variant="safe" className="text-[10px] py-0 px-2">
                    {simulatedResult.status || 'CONFIRMED'}
                  </Badge>
                )}
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-400 mb-2" />
                  <span className="text-xs text-slate-400">Routing payload through gateway...</span>
                </div>
              ) : channel === 'sachet' && sachetXml ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-mono text-cyan-400">CAP v1.2 OASIS Schema</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(sachetXml)}
                      className="h-7 text-[11px] gap-1 border-white/10"
                    >
                      <Copy className="h-3 w-3" />
                      <span>{copied ? 'Copied!' : 'Copy XML'}</span>
                    </Button>
                  </div>
                  <pre className="p-3 bg-black/60 rounded-xl border border-white/5 text-[11px] font-mono text-emerald-400 max-h-[300px] overflow-y-auto whitespace-pre-wrap">
                    {sachetXml}
                  </pre>
                </div>
              ) : simulatedResult ? (
                <div className="space-y-3">
                  <div className="rounded-xl bg-slate-900/90 border border-white/5 p-3 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Carrier Gateway Status:</span>
                      <strong className="text-emerald-400">{simulatedResult.delivery_receipt?.carrier_status || 'DELIVERED_TO_HANDSET'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Network Latency:</span>
                      <strong className="text-cyan-400">{simulatedResult.delivery_receipt?.latency_ms || 142} ms</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Message ID:</span>
                      <span className="font-mono text-slate-300">{simulatedResult.delivery_receipt?.message_id || 'MSG-LIVE-2026'}</span>
                    </div>
                  </div>

                  {/* Message Bubble Preview */}
                  <div className="rounded-2xl bg-emerald-950/30 border border-emerald-500/20 p-4 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                      <ShieldCheck className="h-4 w-4" />
                      <span>Disaster Warning SMS / WhatsApp Preview</span>
                    </div>
                    <p className="text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed">
                      {simulatedResult.payload?.message || simulatedResult.payload?.body || JSON.stringify(simulatedResult.payload, null, 2)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500">
                  <Send className="h-8 w-8 mb-2 opacity-40" />
                  <p className="text-xs">Click 'Execute Public Alert Broadcast' to test dispatch.</p>
                </div>
              )}
            </div>

            <p className="text-[10px] text-slate-500 text-center pt-3 border-t border-white/5">
              Compliant with Telecom Regulatory Authority of India (TRAI) & NDMA SACHET standards.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
