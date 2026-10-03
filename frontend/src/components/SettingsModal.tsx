import React, { useState, useEffect } from 'react';
import { 
  Key, 
  ShieldCheck, 
  Smartphone, 
  MessageSquare, 
  PhoneCall, 
  CheckCircle2, 
  Save,
  Zap,
  Radio
} from 'lucide-react';
import { API_BASE, apiFetch } from '../api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsUpdated: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSettingsUpdated
}) => {
  const [dispatchMode, setDispatchMode] = useState<string>('SIMULATION');
  const [twilioSid, setTwilioSid] = useState<string>('');
  const [twilioToken, setTwilioToken] = useState<string>('');
  const [twilioFrom, setTwilioFrom] = useState<string>('+1844HEATGRD');
  const [whatsappToken, setWhatsappToken] = useState<string>('');
  const [whatsappPhoneId, setWhatsappPhoneId] = useState<string>('');
  const [fast2smsKey, setFast2smsKey] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      apiFetch('/settings')
        .then(res => res.json())
        .then(data => {
          setDispatchMode(data.dispatch_mode || 'SIMULATION');
          if (data.twilio?.from_phone) setTwilioFrom(data.twilio.from_phone);
        })
        .catch(console.error);
    }
  }, [isOpen]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: any = {
        dispatch_mode: dispatchMode,
        twilio_from_phone: twilioFrom
      };
      if (twilioSid) payload.twilio_account_sid = twilioSid;
      if (twilioToken) payload.twilio_auth_token = twilioToken;
      if (whatsappToken) payload.whatsapp_token = whatsappToken;
      if (whatsappPhoneId) payload.whatsapp_phone_number_id = whatsappPhoneId;
      if (fast2smsKey) payload.fast2sms_api_key = fast2smsKey;

      await apiFetch('/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setSuccessMsg('API credentials & dispatch routing saved successfully!');
      onSettingsUpdated();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>API Gateways & Production Dispatch Credentials</DialogTitle>
              <DialogDescription>
                Configure live telecom providers for citizen notifications or run in zero-cost high-fidelity simulation.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {successMsg && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 p-3 text-xs text-emerald-300 font-semibold">
            <CheckCircle2 className="h-4 w-4" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5 pt-2">
          {/* Dispatch Mode Toggle */}
          <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Carrier Routing Mode
                </span>
                <p className="text-xs text-slate-400">
                  Switch between local sandbox simulation and live telecommunication carrier dispatch.
                </p>
              </div>
              <Badge variant={dispatchMode === 'LIVE_PRODUCTION' ? 'extreme' : 'safe'} className="text-xs font-extrabold px-3 py-1">
                {dispatchMode}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setDispatchMode('SIMULATION')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  dispatchMode === 'SIMULATION'
                    ? 'bg-emerald-500/15 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30'
                    : 'bg-slate-900/60 border-white/5 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white">Simulation Mode</span>
                  {dispatchMode === 'SIMULATION' && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                </div>
                <p className="text-[11px] text-slate-400">
                  Zero-cost test delivery receipts & exact payload inspection without charging SMS/WhatsApp credits.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setDispatchMode('LIVE_PRODUCTION')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  dispatchMode === 'LIVE_PRODUCTION'
                    ? 'bg-rose-500/15 border-rose-500/50 shadow-md ring-1 ring-rose-500/30'
                    : 'bg-slate-900/60 border-white/5 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white">Live Production Mode</span>
                  {dispatchMode === 'LIVE_PRODUCTION' && <CheckCircle2 className="h-4 w-4 text-rose-400" />}
                </div>
                <p className="text-[11px] text-slate-400">
                  Dispatches actual SMS & WhatsApp alerts to live citizen handsets through configured carrier gateways.
                </p>
              </button>
            </div>
          </div>

          {/* Twilio SMS API */}
          <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-cyan-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Twilio Cloud SMS Gateway
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Account SID</label>
                <Input
                  type="password"
                  value={twilioSid}
                  onChange={e => setTwilioSid(e.target.value)}
                  placeholder="ACxxxxxxxxxxxxxxxx"
                  className="text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Auth Token</label>
                <Input
                  type="password"
                  value={twilioToken}
                  onChange={e => setTwilioToken(e.target.value)}
                  placeholder="••••••••••••••••"
                  className="text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">From Sender ID / Number</label>
                <Input
                  value={twilioFrom}
                  onChange={e => setTwilioFrom(e.target.value)}
                  placeholder="+1844HEATGRD"
                  className="text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* WhatsApp Cloud API */}
          <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Meta WhatsApp Business Cloud API
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">System User Access Token</label>
                <Input
                  type="password"
                  value={whatsappToken}
                  onChange={e => setWhatsappToken(e.target.value)}
                  placeholder="EAAGxxxxxxxxxxxxxxxx"
                  className="text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Phone Number ID</label>
                <Input
                  value={whatsappPhoneId}
                  onChange={e => setWhatsappPhoneId(e.target.value)}
                  placeholder="104928374619283"
                  className="text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Fast2SMS India */}
          <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Fast2SMS India (National DLT / Direct SMS)
              </h4>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Authorization API Key</label>
              <Input
                type="password"
                value={fast2smsKey}
                onChange={e => setFast2smsKey(e.target.value)}
                placeholder="5b0K9UZaq86exHrNPOyWDkfwt2scg7MSoFi..."
                className="text-xs font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={onClose} className="text-xs border-white/10">
              Cancel
            </Button>
            <Button
              variant="cyan"
              size="sm"
              type="submit"
              disabled={loading}
              className="gap-2 text-xs font-semibold"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Saving...' : 'Save Configuration'}</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
