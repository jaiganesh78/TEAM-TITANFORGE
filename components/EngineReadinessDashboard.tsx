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
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#e2e8f0', fontFamily: "'Inter', sans-serif", padding: '0' }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${config.gradient})`, padding: '3rem 2.5rem 2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: '2.5rem' }}>{config.icon}</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>{config.displayName}</h1>
                <span style={{ background: statusColor, color: '#fff', padding: '0.2rem 0.8rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                  {statusLabel}
                </span>
              </div>
              <p style={{ margin: '0.25rem 0 0', color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem' }}>{config.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 2.5rem' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: '#64748b' }}>Loading engine contract...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Readiness Score Card */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Engine Readiness Score</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ width: 90, height: 90, borderRadius: '50%', background: `conic-gradient(${statusColor} ${readinessScore * 3.6}deg, rgba(255,255,255,0.08) 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <div style={{ width: 70, height: 70, borderRadius: '50%', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 800, color: statusColor }}>
                    {readinessScore}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: statusColor, marginBottom: '0.25rem' }}>{statusLabel}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Min required: {contract?.confidenceRequirements?.minimum ?? 40}%</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Recommended: {contract?.confidenceRequirements?.recommended ?? 65}%</div>
                </div>
              </div>
              {!canExecute && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.5rem', padding: '0.75rem', fontSize: '0.8rem', color: '#fca5a5' }}>
                  ⚠️ Complete knowledge gaps below to unlock this engine
                </div>
              )}
            </div>

            {/* Required KPIs Card */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1.25rem', fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Required KPIs</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {(contract?.requiredKpis ?? []).map((kpi: string) => {
                  const hasKpi = readiness?.kpiScore > 0;
                  return (
                    <div key={kpi} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.375rem' }}>
                      <span style={{ fontSize: '0.75rem', color: hasKpi ? '#10b981' : '#ef4444' }}>{hasKpi ? '✓' : '○'}</span>
                      <span style={{ fontSize: '0.85rem', color: '#e2e8f0', textTransform: 'uppercase', fontWeight: 600 }}>{kpi.toUpperCase()}</span>
                    </div>
                  );
                })}
                {(contract?.requiredKpis ?? []).length === 0 && (
                  <div style={{ color: '#64748b', fontSize: '0.85rem' }}>No specific KPIs required.</div>
                )}
              </div>
            </div>

            {/* Knowledge Dependencies Card */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1.25rem', fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Knowledge Domain Dependencies</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {(contract?.knowledgeDependencies ?? []).map((domain: string) => (
                  <span key={domain} style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>
                    {domain.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>

            {/* Engine Responsibilities Card */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1.25rem', fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Engine Responsibilities</h3>
              <ul style={{ margin: 0, padding: '0 0 0 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {(contract?.responsibilities ?? []).map((r: string, i: number) => (
                  <li key={i} style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>{r}</li>
                ))}
              </ul>
            </div>

            {/* Failure Conditions */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1.25rem', fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Failure Conditions</h3>
              <ul style={{ margin: 0, padding: '0 0 0 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {(contract?.failureConditions ?? []).map((f: string, i: number) => (
                  <li key={i} style={{ fontSize: '0.82rem', color: '#fca5a5' }}>{f}</li>
                ))}
              </ul>
            </div>

            {/* AI Provider Info */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1.25rem', fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>AI Configuration</h3>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Future AI Provider</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#c084fc' }}>{contract?.futureAIProvider ?? '—'}</div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Debate Participants</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {(contract?.futureDebateParticipants ?? []).map((p: string) => (
                    <span key={p} style={{ background: 'rgba(192,132,252,0.1)', border: '1px solid rgba(192,132,252,0.2)', color: '#c084fc', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.72rem' }}>{p}</span>
                  ))}
                </div>
              </div>
              <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '0.5rem', padding: '0.75rem', fontSize: '0.8rem', color: '#6ee7b7' }}>
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
