'use client';
import { useState, useEffect } from 'react';

// Shared Engine Dashboard Shell — renders knowledge readiness panel for any engine
export interface EnginePageConfig {
  engineId: string;
  displayName: string;
  icon: string;
  description: string;
  color: string;
  gradient: string;
}

function EngineReadinessDashboard({ config }: { config: EnginePageConfig }) {
  const [readiness, setReadiness] = useState<any>(null);
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // Load engine contract
        const cRes = await fetch(`/api/growth/engines/${config.engineId}`);
        if (cRes.ok) {
          const { data } = await cRes.json();
          setContract(data);
        }
        // Note: readiness requires businessId — handled by parent page
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [config.engineId]);

  const readinessScore = readiness?.readinessScore ?? 0;
  const canExecute = readiness?.canExecute ?? false;
  const statusLabel = canExecute ? 'READY' : readinessScore >= 40 ? 'PARTIALLY READY' : 'NOT READY';
  const statusColor = canExecute ? '#10b981' : readinessScore >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className="min-h-screen text-slate-200" style={{ background: '#0a0a0f', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${config.gradient})`, position: 'relative', overflow: 'hidden' }} className="px-5 py-8 md:px-10 md:py-12">
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} />
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="flex items-start gap-4">
            <div className="text-4xl shrink-0 mt-1">{config.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white m-0">{config.displayName}</h1>
                <span
                  className="text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-full shrink-0"
                  style={{ background: statusColor, color: '#fff' }}
                >
                  {statusLabel}
                </span>
              </div>
              <p className="text-sm text-white/70 leading-relaxed m-0">{config.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 md:px-8 md:py-8">
        {loading ? (
          <div className="flex justify-center items-center py-20 text-slate-500 text-sm">Loading engine contract...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Readiness Score Card */}
            <div className="rounded-2xl p-5 md:p-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: '#94a3b8' }}>Engine Readiness Score</h3>
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="shrink-0 flex items-center justify-center"
                  style={{ width: 80, height: 80, borderRadius: '50%', background: `conic-gradient(${statusColor} ${readinessScore * 3.6}deg, rgba(255,255,255,0.08) 0deg)` }}
                >
                  <div
                    className="flex items-center justify-center text-xl font-extrabold"
                    style={{ width: 60, height: 60, borderRadius: '50%', background: '#0a0a0f', color: statusColor }}
                  >
                    {readinessScore}
                  </div>
                </div>
                <div>
                  <div className="text-base font-bold mb-1" style={{ color: statusColor }}>{statusLabel}</div>
                  <div className="text-xs text-slate-500">Min required: {contract?.confidenceRequirements?.minimum ?? 40}%</div>
                  <div className="text-xs text-slate-500">Recommended: {contract?.confidenceRequirements?.recommended ?? 65}%</div>
                </div>
              </div>
              {!canExecute && (
                <div className="rounded-lg p-3 text-xs" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
                  ⚠️ Complete knowledge gaps below to unlock this engine
                </div>
              )}
            </div>

            {/* Required KPIs Card */}
            <div className="rounded-2xl p-5 md:p-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#94a3b8' }}>Required KPIs</h3>
              <div className="flex flex-col gap-2">
                {(contract?.requiredKpis ?? []).map((kpi: string) => {
                  const hasKpi = readiness?.kpiScore > 0;
                  return (
                    <div key={kpi} className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <span className="text-xs shrink-0" style={{ color: hasKpi ? '#10b981' : '#ef4444' }}>{hasKpi ? '✓' : '○'}</span>
                      <span className="text-sm font-semibold uppercase tracking-wide text-slate-200">{kpi}</span>
                    </div>
                  );
                })}
                {(contract?.requiredKpis ?? []).length === 0 && (
                  <div className="text-sm text-slate-500">No specific KPIs required.</div>
                )}
              </div>
            </div>

            {/* Knowledge Dependencies Card */}
            <div className="rounded-2xl p-5 md:p-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#94a3b8' }}>Knowledge Domain Dependencies</h3>
              <div className="flex flex-wrap gap-2">
                {(contract?.knowledgeDependencies ?? []).map((domain: string) => (
                  <span
                    key={domain}
                    className="text-xs font-semibold px-3 py-1 rounded-full"
                    style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc' }}
                  >
                    {domain.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>

            {/* Engine Responsibilities Card */}
            <div className="rounded-2xl p-5 md:p-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#94a3b8' }}>Engine Responsibilities</h3>
              <ul className="m-0 pl-5 flex flex-col gap-1.5">
                {(contract?.responsibilities ?? []).map((r: string, i: number) => (
                  <li key={i} className="text-sm text-slate-300 leading-relaxed">{r}</li>
                ))}
              </ul>
            </div>

            {/* Failure Conditions */}
            <div className="rounded-2xl p-5 md:p-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#94a3b8' }}>Failure Conditions</h3>
              <ul className="m-0 pl-5 flex flex-col gap-1.5">
                {(contract?.failureConditions ?? []).map((f: string, i: number) => (
                  <li key={i} className="text-sm leading-relaxed" style={{ color: '#fca5a5' }}>{f}</li>
                ))}
              </ul>
            </div>

            {/* AI Provider Info */}
            <div className="rounded-2xl p-5 md:p-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#94a3b8' }}>AI Configuration</h3>
              <div className="mb-4">
                <div className="text-xs text-slate-500 mb-1">Future AI Provider</div>
                <div className="text-base font-bold" style={{ color: '#c084fc' }}>{contract?.futureAIProvider ?? '—'}</div>
              </div>
              <div className="mb-4">
                <div className="text-xs text-slate-500 mb-2">Debate Participants</div>
                <div className="flex flex-wrap gap-1.5">
                  {(contract?.futureDebateParticipants ?? []).map((p: string) => (
                    <span
                      key={p}
                      className="text-[11px] px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(192,132,252,0.1)', border: '1px solid rgba(192,132,252,0.2)', color: '#c084fc' }}
                    >{p}</span>
                  ))}
                </div>
              </div>
              <div className="rounded-lg p-3 text-xs" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#6ee7b7' }}>
                🚀 AI engine implementation coming in Sprint 8
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

// ================================================================
// INDIVIDUAL ENGINE PAGES
// ================================================================

export function StrategyEnginePage() {
  return <EngineReadinessDashboard config={{
    engineId: 'strategy-engine',
    displayName: 'Strategy Engine',
    icon: '🎯',
    description: 'Synthesises all business knowledge to generate strategic priorities and growth roadmaps.',
    color: '#6366f1',
    gradient: '#1e1b4b, #312e81'
  }} />;
}

export function MarketingEnginePage() {
  return <EngineReadinessDashboard config={{
    engineId: 'marketing-engine',
    displayName: 'Marketing Engine',
    icon: '📣',
    description: 'Optimises channel mix, messaging, positioning, and brand strategy.',
    color: '#ec4899',
    gradient: '#4a044e, #831843'
  }} />;
}

export function LeadGenEnginePage() {
  return <EngineReadinessDashboard config={{
    engineId: 'lead-generation-engine',
    displayName: 'Lead Generation Engine',
    icon: '🎣',
    description: 'Designs ICP targeting, lead scoring frameworks, and funnel architecture.',
    color: '#f59e0b',
    gradient: '#451a03, #78350f'
  }} />;
}

export function SalesEnginePage() {
  return <EngineReadinessDashboard config={{
    engineId: 'sales-engine',
    displayName: 'Sales Engine',
    icon: '💰',
    description: 'Optimises pipeline health, win rate, deal velocity, and pricing strategy.',
    color: '#10b981',
    gradient: '#022c22, #064e3b'
  }} />;
}

export function AnalyticsEnginePage() {
  return <EngineReadinessDashboard config={{
    engineId: 'analytics-engine',
    displayName: 'Analytics Engine',
    icon: '📊',
    description: 'Calculates all Growth KPIs, tracks trends, and identifies metric correlations.',
    color: '#3b82f6',
    gradient: '#0c1445, #1e3a8a'
  }} />;
}

export function CustomerSuccessEnginePage() {
  return <EngineReadinessDashboard config={{
    engineId: 'customer-success-engine',
    displayName: 'Customer Success Engine',
    icon: '🤝',
    description: 'Drives retention, expansion revenue, NPS improvement, and churn reduction.',
    color: '#14b8a6',
    gradient: '#0f2623, #134e4a'
  }} />;
}
