import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { KPISummary } from './components/KPISummary';
import { GisMap } from './components/GisMap';
import { WardInspector } from './components/WardInspector';
import { RoleAdvisoryPortal } from './components/RoleAdvisoryPortal';
import { RiskAnalystModal } from './components/RiskAnalystModal';
import { AlertSimulatorModal } from './components/AlertSimulatorModal';
import { MethodologyModal } from './components/MethodologyModal';
import { SettingsModal } from './components/SettingsModal';
import { HAPReportModal } from './components/HAPReportModal';
import { 
  SystemStatus, 
  WardSummary, 
  WardDetailsResponse, 
  AnalystReviewItem, 
  ApprovedBroadcastItem 
} from './types';
import { ShieldAlert, AlertTriangle, Layers, Radio, HeartPulse, RefreshCw, Server, WifiOff } from 'lucide-react';
import { apiFetch } from './api';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';

export const App: React.FC = () => {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [wards, setWards] = useState<WardSummary[]>([]);
  const [selectedWardId, setSelectedWardId] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [activeScenario, setActiveScenario] = useState<string>('MAY_2024_EXTREME_HEATWAVE');
  const [wardDetails, setWardDetails] = useState<WardDetailsResponse | null>(null);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [dispatchMode, setDispatchMode] = useState<string>('SIMULATION');
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(true);

  // Modals
  const [isAnalystOpen, setIsAnalystOpen] = useState<boolean>(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isHAPReportOpen, setIsHAPReportOpen] = useState<boolean>(false);
  const [hapWardId, setHapWardId] = useState<string>('');
  const [simulatorDefaultWard, setSimulatorDefaultWard] = useState<string>('');

  // Analyst reviews
  const [pendingReviews, setPendingReviews] = useState<AnalystReviewItem[]>([]);
  const [approvedBroadcasts, setApprovedBroadcasts] = useState<ApprovedBroadcastItem[]>([]);

  // Initial load
  const fetchData = async () => {
    setRefreshing(true);
    try {
      // 1. Status
      const statusRes = await apiFetch('/status');
      if (!statusRes.ok) throw new Error('Status endpoint failed');
      const statusData = await statusRes.json();
      setStatus(statusData);

      // 2. Settings & Dispatch Mode
      const settRes = await apiFetch('/settings');
      if (settRes.ok) {
        const settData = await settRes.json();
        if (settData.dispatch_mode) setDispatchMode(settData.dispatch_mode);
      }

      // 3. Wards
      const wardsRes = await apiFetch('/wards');
      if (wardsRes.ok) {
        const wardsData: WardSummary[] = await wardsRes.json();
        setWards(wardsData);

        // Pick highest risk ward if none selected
        if (!selectedWardId && wardsData.length > 0) {
          const sorted = [...wardsData].sort(
            (a, b) => (b.risk?.composite_risk_score ?? 0) - (a.risk?.composite_risk_score ?? 0)
          );
          setSelectedWardId(sorted[0].id);
        }
      }

      // 4. Analyst queues
      const pendingRes = await apiFetch('/analyst/pending');
      if (pendingRes.ok) {
        const pendingData = await pendingRes.json();
        setPendingReviews(pendingData);
      }

      const approvedRes = await apiFetch('/analyst/approved');
      if (approvedRes.ok) {
        const approvedData = await approvedRes.json();
        setApprovedBroadcasts(approvedData);
      }

      setIsBackendConnected(true);
    } catch (err) {
      console.warn('[ThermalGuard] API connection issue:', err);
      setIsBackendConnected(false);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch single ward details when selectedWardId changes
  useEffect(() => {
    if (!selectedWardId) return;
    setLoadingDetails(true);
    apiFetch(`/ward/${selectedWardId}`)
      .then(res => {
        if (!res.ok) throw new Error(`Ward detail fetch error: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setWardDetails(data);
        setIsBackendConnected(true);
      })
      .catch(err => {
        console.warn('Error fetching ward details:', err);
      })
      .finally(() => setLoadingDetails(false));
  }, [selectedWardId, activeScenario]);

  // Scenario Change Handler
  const handleScenarioChange = async (scenario: string) => {
    setActiveScenario(scenario);
    try {
      await apiFetch('/scenario/set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario })
      });
      await fetchData();
    } catch (err) {
      console.error('Error switching scenario:', err);
    }
  };

  // Human-in-the-loop analyst action
  const handleApproveReview = async (reviewId: string, analystName: string, calibratedTier?: string, notes?: string) => {
    try {
      const res = await apiFetch('/analyst/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          review_id: reviewId,
          analyst_name: analystName,
          calibrated_tier: calibratedTier,
          notes: notes
        })
      });
      const data = await res.json();
      setApprovedBroadcasts(prev => [data.broadcast, ...prev]);
      setPendingReviews(prev => prev.filter(r => r.id !== reviewId));
    } catch (err) {
      console.error(err);
    }
  };

  const openSimulatorForWard = (wardId: string) => {
    setSimulatorDefaultWard(wardId);
    setIsSimulatorOpen(true);
  };

  const openHAPReportForWard = (wardId: string) => {
    setHapWardId(wardId);
    setIsHAPReportOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Header */}
      <Header
        status={status}
        activeScenario={activeScenario}
        onScenarioChange={handleScenarioChange}
        pendingReviewsCount={pendingReviews.length}
        dispatchMode={dispatchMode}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAnalyst={() => setIsAnalystOpen(true)}
        onOpenSimulator={() => {
          setSimulatorDefaultWard(selectedWardId || '');
          setIsSimulatorOpen(true);
        }}
        onOpenMethodology={() => setIsMethodologyOpen(true)}
      />

      {/* Offline / Backend connection notice if server is not reachable */}
      {!isBackendConnected && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-300">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <WifiOff className="h-4 w-4 text-amber-400 shrink-0" />
              <span>
                Backend API server offline or starting up on <code className="bg-black/30 px-1 py-0.5 rounded font-mono text-white">http://127.0.0.1:8000</code>.
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={refreshing}
              className="h-7 text-xs border-amber-500/40 text-amber-200 hover:bg-amber-500/20 gap-1.5"
            >
              <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Connecting...' : 'Retry Connection'}</span>
            </Button>
          </div>
        </div>
      )}

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* KPI Analytics Strip */}
        <KPISummary wards={wards} />

        {/* 2-Column Command Center Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Left Column: Interactive GIS Map */}
          <div className="xl:col-span-7">
            <GisMap
              wards={wards}
              selectedWardId={selectedWardId}
              onSelectWard={(id) => setSelectedWardId(id)}
              selectedCity={selectedCity}
              onSelectCity={(city) => setSelectedCity(city)}
            />
          </div>

          {/* Right Column: Deep Ward Inspector */}
          <div className="xl:col-span-5">
            <WardInspector
              wardDetails={wardDetails}
              loading={loadingDetails}
              onTriggerAlert={openSimulatorForWard}
              onOpenHAPReport={openHAPReportForWard}
            />
          </div>
        </div>

        {/* Targeted Role-Specific Action Portals */}
        {wardDetails && (
          <RoleAdvisoryPortal
            advisories={wardDetails.role_advisories}
            risk={wardDetails.current_evaluation}
            wardName={wardDetails.ward.name}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-950/90 py-6 text-xs text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">ThermalGuard Control Center</span>
              <Badge variant="outline" className="text-[10px] text-slate-400 border-white/10">v2.0 Production</Badge>
            </div>
            <p className="mt-1 text-slate-500">
              Compliant with IMD Heatwave Standards • ERA5 Climate Baseline • Open-Meteo NWP • NCMRWF 4km Model • NCDC Heat Illness Surveillance
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${isBackendConnected ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-amber-500'}`} />
              <span className="text-slate-300">{isBackendConnected ? 'API Engine Connected' : 'API Connecting...'}</span>
            </div>
            <span className="text-slate-700">•</span>
            <button
              onClick={() => setIsMethodologyOpen(true)}
              className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 cursor-pointer"
            >
              Methodology Flowchart
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Dialogs */}
      <RiskAnalystModal
        isOpen={isAnalystOpen}
        onClose={() => setIsAnalystOpen(false)}
        pendingReviews={pendingReviews}
        approvedBroadcasts={approvedBroadcasts}
        onApproveReview={handleApproveReview}
      />

      <AlertSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        wards={wards}
        defaultWardId={simulatorDefaultWard}
      />

      <MethodologyModal
        isOpen={isMethodologyOpen}
        onClose={() => setIsMethodologyOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSettingsUpdated={fetchData}
      />

      <HAPReportModal
        isOpen={isHAPReportOpen}
        onClose={() => setIsHAPReportOpen(false)}
        wardId={hapWardId || selectedWardId || ''}
      />
    </div>
  );
};

export default App;
