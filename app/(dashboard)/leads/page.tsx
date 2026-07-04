'use client';
import { useState, useEffect } from 'react';

export default function LeadsWorkspacePage() {
  const [businessId, setBusinessId] = useState<string>('default-biz-id');
  const [readiness, setReadiness] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [pipelineHealth, setPipelineHealth] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'icp' | 'sources' | 'scoring' | 'segmentation' | 'journey' | 'forecast' | 'recommendations' | 'playbook' | 'pipeline' | 'execution'>('overview');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Load readiness
        const rRes = await fetch(`/api/growth/readiness/${businessId}/lead-generation-engine`);
        if (rRes.ok) {
          const rJson = await rRes.json();
          setReadiness(rJson.data);
        }

        // Load latest session (use fallback routes if session retrieval throws)
        const sRes = await fetch(`/api/lead/session/latest?businessId=${businessId}`);
        if (sRes.ok) {
          const sJson = await sRes.json();
          setSession(sJson.session);
        }

        // Load pipeline health
        const pRes = await fetch(`/api/lead/pipeline/health?businessId=${businessId}`);
        if (pRes.ok) {
          const pJson = await pRes.json();
          setPipelineHealth(pJson.health);
        }

        // Load history logs
        const hRes = await fetch(`/api/lead/history?businessId=${businessId}`);
        if (hRes.ok) {
          const hJson = await hRes.json();
          setHistory(hJson.histories);
        }
      } catch (err) {
        console.warn('Failed to fetch lead workspace APIs. Entering mock dashboard mode.');
        setupMockData();
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [businessId]);

  const setupMockData = () => {
    setReadiness({
      readinessScore: 92,
      canExecute: true
    });

    setSession({
      id: 'lead-mock-session-id',
      status: 'SUCCESS',
      createdAt: new Date().toISOString(),
      icpAnalysis: JSON.stringify({
        industry: 'Software & Technology',
        companySize: '100-500 employees',
        revenueRange: '$10M-$50M ARR',
        decisionMakers: ['VP of Sales', 'Chief Revenue Officer', 'Head of Growth'],
        painPoints: ['High customer acquisition cost (CAC)', 'Low pipeline conversion velocity', 'Siloed sales data'],
        techStack: ['Salesforce CRM', 'HubSpot Marketing Hub', 'ZoomInfo', 'LinkedIn Sales Navigator'],
        buyingIntent: 'HIGH',
        budgetLevel: 25000,
        growthStage: 'Scaleup / Expansion',
        expectedLtv: 75000,
        expectedCac: 18000,
        confidence: 90.0,
        evidence: 'Industry database reports indicate high tooling churn in mid-market CRM segments, leaving gaps for our product.'
      }),
      leadSources: JSON.stringify({
        sources: [
          { sourceName: 'LinkedIn Sales Outbound', rank: 1, expectedRoi: '4.2x', difficulty: 'MEDIUM', requiredBudget: 3000, expectedLeads: 120, confidence: 92, evidence: 'LinkedIn ads retargeting provides 3.5% CTR on core persona matches' },
          { sourceName: 'Google Search Ads & SEO', rank: 2, expectedRoi: '3.0x', difficulty: 'HIGH', requiredBudget: 5000, expectedLeads: 80, confidence: 85, evidence: 'Search intent volume for growth software keywords is high' }
        ]
      }),
      leads: [
        {
          id: 'lead-1',
          companyName: 'Apex Data Corp',
          industry: 'Software',
          companySize: '150 employees',
          revenueRange: '$15M ARR',
          decisionMakers: '["VP Sales"]',
          painPoints: '["High rep ramp time"]',
          techStack: '["Hubspot"]',
          buyingIntent: 'HIGH',
          budgetLevel: 30000,
          growthStage: 'Series B',
          expectedLtv: 85000,
          expectedCac: 20000,
          confidence: 94.0,
          evidence: 'Recent hiring spikes for account execs',
          scores: [
            {
              fitScore: 90,
              intentScore: 88,
              budgetScore: 80,
              authorityScore: 92,
              needScore: 85,
              timingScore: 90,
              overallQualification: 88,
              qualityScore: 92,
              valueScore: 86,
              conversionProbability: 80,
              revenuePotential: 60000,
              riskScore: 15,
              urgencyScore: 85,
              priorityTier: 'Tier 1',
              explainability: 'Perfect fit matching ICP parameters.'
            }
          ]
        }
      ],
      qualificationRules: JSON.stringify({
        fitScore: 85,
        intentScore: 80,
        budgetScore: 75,
        authorityScore: 90,
        needScore: 85,
        timingScore: 80,
        overallQualification: 82
      }),
      scoringModel: JSON.stringify({
        qualityScore: 88,
        valueScore: 82,
        conversionProbability: 76,
        revenuePotential: 45000,
        riskScore: 20,
        urgencyScore: 85,
        priorityTier: 'Tier 1',
        explainability: 'Matches criteria with premium conversion probability threshold.'
      }),
      segmentation: JSON.stringify({
        segments: [
          { segmentName: 'Enterprise SaaS Software', industry: 'Software', companySize: '100-500', expectedDealSize: 50000, leadsCount: 12 },
          { segmentName: 'Mid-Market Retail Solutions', industry: 'Retail Technology', companySize: '50-200', expectedDealSize: 25000, leadsCount: 8 }
        ]
      }),
      nurtureJourneys: JSON.stringify({
        journeys: [
          { journeyType: 'Enterprise', touchpoints: ['LinkedIn Connection request', 'Value deck email', 'Custom gap audit call'], messages: ['Introducing OS value model', 'How we solved enterprise CAC bottlenecks'], waitingPeriods: ['2 days', '4 days'], successKpis: ['Open rate > 45%', 'Demo booking rate > 15%'] }
        ]
      }),
      forecasts: JSON.stringify({
        expectedLeads: 200,
        qualifiedLeads: 75,
        sqlCount: 30,
        conversionRate: 15.0,
        revenue: 120000,
        pipelineValue: 350000,
        confidenceMin: 95000,
        confidenceMax: 145000
      }),
      recommendations: [
        {
          id: 'rec-1',
          title: 'Implement Multi-Touch LinkedIn Inbound Pipeline for Mid-Market B2B',
          nextBestAction: 'Deploy custom lead magnet mapping Digital Twin insights.',
          expectedCloseProb: 75.0,
          expectedTimeline: '30 days',
          riskFactors: '["Ad cost bidding inflation"]',
          dependencies: '["Approve product messaging deck"]',
          alternativeActions: '["Cold email sequences to ZoomInfo list"]',
          status: 'PENDING'
        }
      ],
      playbooks: [
        {
          name: 'The VP of Growth ICP Playbook',
          playRules: 'Deploy when lead scoring fits Tier 1 criteria.',
          targetAudience: 'VP Sales in Enterprise Tech',
          triggerCondition: 'Reverse IP visit to pricing page',
          recommendedSteps: '["Send LinkedIn connection request", "Email custom gap audit case study"]'
        }
      ]
    });

    setPipelineHealth({
      healthScore: 82,
      totalLeads: 25,
      conversionRate: 16.0,
      bottlenecks: [
        { stageName: 'SQL', leadCount: 10, severity: 'HIGH' }
      ],
      stuckOpportunities: [
        { companyName: 'Apex Data Corp', stageName: 'SQL', daysInStage: 22, limitDays: 15 }
      ],
      stages: [
        { stageName: 'Prospect', leadCount: 5, probability: 0.10, averageTimeDays: 7, responsibleEngine: 'lead-engine' },
        { stageName: 'Engaged', leadCount: 6, probability: 0.20, averageTimeDays: 14, responsibleEngine: 'marketing-engine' },
        { stageName: 'MQL', leadCount: 3, probability: 0.35, averageTimeDays: 10, responsibleEngine: 'marketing-engine' },
        { stageName: 'SQL', leadCount: 10, probability: 0.50, averageTimeDays: 15, responsibleEngine: 'lead-engine' },
        { stageName: 'Discovery', leadCount: 1, probability: 0.65, averageTimeDays: 14, responsibleEngine: 'sales-engine' }
      ]
    });
  };

  const handleGenerate = async () => {
    setGenerating(true);
    showToast('Running Master Lead Graph. VP of Growth strategy mapping started...');
    try {
      const res = await fetch('/api/lead/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId })
      });
      if (res.ok) {
        const json = await res.json();
        // Load session
        const sRes = await fetch(`/api/lead/session/${json.sessionId}`);
        if (sRes.ok) {
          const sJson = await sRes.json();
          setSession(sJson.session);
          showToast('Lead engine analysis completed successfully.');
        }
      } else {
        throw new Error('API failed');
      }
    } catch {
      showToast('Offline Mode. Running mock generator workflow...');
      setTimeout(() => {
        setupMockData();
        setGenerating(false);
      }, 1500);
      return;
    }
    setGenerating(false);
  };

  const handleAction = async (action: 'ACCEPT' | 'REJECT') => {
    if (!session) return;
    try {
      const res = await fetch('/api/lead/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          sessionId: session.id,
          action,
          feedbackText
        } as any)
      });
      if (res.ok) {
        showToast(`Lead recommendation strategy ${action === 'ACCEPT' ? 'approved & synced to AI Operating Context' : 'rejected'}`);
        // Reload history
        const hRes = await fetch(`/api/lead/history?businessId=${businessId}`);
        if (hRes.ok) {
          const hJson = await hRes.json();
          setHistory(hJson.histories);
        }
      } else {
        throw new Error('API failed');
      }
    } catch {
      // Mock action response
      showToast(`Mock Action Registered: ${action}`);
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  // Safe parsing helper
  const tryParse = (str: string | null | undefined, fallback: any = {}) => {
    if (!str) return fallback;
    try {
      return JSON.parse(str);
    } catch {
      return fallback;
    }
  };

  const icp = tryParse(session?.icpAnalysis);
  const sources = tryParse(session?.leadSources)?.sources || [];
  const qualRules = tryParse(session?.qualificationRules);
  const scoreModel = tryParse(session?.scoringModel);
  const segments = tryParse(session?.segmentation)?.segments || [];
  const journeys = tryParse(session?.nurtureJourneys)?.journeys || [];
  const forecasts = tryParse(session?.forecasts);
  const rec = session?.recommendations?.[0];
  const playbook = session?.playbooks?.[0];

  return (
    <div style={{ minHeight: '100vh', background: '#09090e', color: '#f1f5f9', fontFamily: "'Outfit', sans-serif" }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: '#10b981', color: '#fff', padding: '1rem 2rem', borderRadius: '0.5rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)', zIndex: 1000, fontWeight: 600 }}>
          {toast}
        </div>
      )}

      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, #451a03 0%, #78350f 100%)', padding: '3rem 2rem 2.5rem', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', background: 'linear-gradient(to right, #fbbf24, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Lead Intelligence Workspace
              </h1>
            </div>
            <p style={{ margin: 0, color: '#d97706', fontSize: '0.95rem', fontWeight: 500 }}>
              VP of Growth layer targeting ideal profiles, ranking sources, scoring intent, and forecasting pipeline velocity.
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            style={{ background: generating ? '#6b7280' : 'linear-gradient(to right, #f59e0b, #d97706)', border: 'none', color: '#fff', padding: '0.75rem 1.75rem', borderRadius: '0.5rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 10px rgba(245,158,11,0.3)' }}
          >
            {generating ? 'Running Subgraphs...' : 'Execute Lead Engine'}
          </button>
        </div>
      </div>

      {/* Tab Menu */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#0e0e17' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', overflowX: 'auto', padding: '0 1rem' }}>
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'icp', label: 'ICP Library' },
            { id: 'sources', label: 'Lead Sources' },
            { id: 'scoring', label: 'Lead Scoring' },
            { id: 'segmentation', label: 'Lead Segmentation' },
            { id: 'journey', label: 'Nurture Journeys' },
            { id: 'forecast', label: 'Forecasts' },
            { id: 'recommendations', label: 'Recommendations' },
            { id: 'playbook', label: 'Playbooks' },
            { id: 'pipeline', label: 'Revenue Pipeline' },
            { id: 'execution', label: 'Execution Plan' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              style={{
                background: 'none',
                border: 'none',
                color: activeTab === t.id ? '#fbbf24' : '#94a3b8',
                borderBottom: activeTab === t.id ? '2px solid #fbbf24' : 'none',
                padding: '1.25rem 1.5rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Workspace Area */}
      <div style={{ maxWidth: '1280px', margin: '2rem auto', padding: '0 1rem' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', color: '#94a3b8' }}>
            Reading lead sessions and pipeline health...
          </div>
        ) : (
          <div>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {/* Pipeline Health Score Card */}
                  <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '1rem', padding: '1.75rem' }}>
                    <h3 style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pipeline Health</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'conic-gradient(#f59e0b 80%, rgba(255,255,255,0.06) 0deg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 800, color: '#fbbf24' }}>
                          {pipelineHealth?.healthScore ?? 80}%
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#e2e8f0' }}>Healthy Pipeline</div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Active opportunity conversion check: {pipelineHealth?.conversionRate ?? 16}%</div>
                      </div>
                    </div>
                  </div>

                  {/* Bottlenecks Card */}
                  <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '1rem', padding: '1.75rem' }}>
                    <h3 style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Stuck / Bottleneck stages</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {(pipelineHealth?.bottlenecks || []).map((b: any, idx: number) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.5rem' }}>
                          <span style={{ fontWeight: 600, color: '#fca5a5' }}>{b.stageName} Stage</span>
                          <span style={{ fontSize: '0.85rem', color: '#fca5a5' }}>Severity: {b.severity} ({b.leadCount} leads)</span>
                        </div>
                      ))}
                      {(pipelineHealth?.bottlenecks || []).length === 0 && (
                        <div style={{ color: '#64748b', fontSize: '0.85rem' }}>No pipeline bottlenecks detected.</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Session Summary Info */}
                <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '1rem', padding: '1.75rem' }}>
                  <h3 style={{ margin: '0 0 1.25rem', fontSize: '0.9rem', color: '#f59e0b', textTransform: 'uppercase' }}>VP of Growth Executive Summary</h3>
                  {forecasts ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '0.5rem' }}>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Expected Lead Count</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#e2e8f0' }}>{forecasts.expectedLeads}</div>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '0.5rem' }}>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Pipeline Value</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>${forecasts.pipelineValue?.toLocaleString()}</div>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '0.5rem' }}>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>SQL Target Count</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#3b82f6' }}>{forecasts.sqlCount}</div>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '0.5rem' }}>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Conversion Probability</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fbbf24' }}>{forecasts.conversionRate}%</div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Run Lead Engine to view forecasting data summary.</div>
                  )}
                </div>
              </div>
            )}

            {/* ICP Tab */}
            {activeTab === 'icp' && icp && (
              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '1rem', padding: '2rem' }}>
                <h3 style={{ margin: '0 0 1.5rem', color: '#fbbf24' }}>Ideal Customer Profile (ICP) Parameters</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                  <div>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ fontSize: '0.75rem', color: '#64748b' }}>Target Industry</label>
                      <div style={{ fontSize: '1rem', fontWeight: 600 }}>{icp.industry}</div>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ fontSize: '0.75rem', color: '#64748b' }}>Company Size Scope</label>
                      <div style={{ fontSize: '1rem', fontWeight: 600 }}>{icp.companySize}</div>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ fontSize: '0.75rem', color: '#64748b' }}>Revenue Range</label>
                      <div style={{ fontSize: '1rem', fontWeight: 600 }}>{icp.revenueRange}</div>
                    </div>
                  </div>
                  <div>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ fontSize: '0.75rem', color: '#64748b' }}>Expected LTV</label>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981' }}>${icp.expectedLtv?.toLocaleString()}</div>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ fontSize: '0.75rem', color: '#64748b' }}>Expected CAC</label>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ef4444' }}>${icp.expectedCac?.toLocaleString()}</div>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ fontSize: '0.75rem', color: '#64748b' }}>ICP Model Confidence</label>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fbbf24' }}>{icp.confidence}%</div>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontSize: '0.75rem', color: '#64748b' }}>Key Decision Makers</label>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                    {(icp.decisionMakers || []).map((dm: string, i: number) => (
                      <span key={i} style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', color: '#fbbf24', padding: '0.25rem 0.75rem', borderRadius: '0.25rem', fontSize: '0.8rem' }}>{dm}</span>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontSize: '0.75rem', color: '#64748b' }}>Core Pain Points</label>
                  <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
                    {(icp.painPoints || []).map((p: string, i: number) => (
                      <li key={i} style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>{p}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: '#64748b' }}>Evidence Grounding Fact</label>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '0.5rem', marginTop: '0.25rem', fontStyle: 'italic' }}>
                    "{icp.evidence}"
                  </div>
                </div>
              </div>
            )}

            {/* Sources Tab */}
            {activeTab === 'sources' && (
              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '1rem', padding: '2rem' }}>
                <h3 style={{ margin: '0 0 1.5rem', color: '#fbbf24' }}>Lead Source Ranks & Channel Performance</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {sources.map((s: any, idx: number) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '0.75rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ background: '#fbbf24', color: '#000', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>{s.rank}</span>
                          <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{s.sourceName}</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>Difficulty: {s.difficulty} | Expected ROI: {s.expectedRoi}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, color: '#fbbf24' }}>{s.expectedLeads} Leads expected</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Budget needed: ${s.requiredBudget}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Scoring Tab */}
            {activeTab === 'scoring' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Qualification Thresholds */}
                {qualRules && (
                  <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '1rem', padding: '2rem' }}>
                    <h3 style={{ margin: '0 0 1.5rem', color: '#fbbf24' }}>Qualification Thresholds</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {[
                        { label: 'Fit Score', val: qualRules.fitScore },
                        { label: 'Intent Score', val: qualRules.intentScore },
                        { label: 'Budget Score', val: qualRules.budgetScore },
                        { label: 'Authority Score', val: qualRules.authorityScore },
                        { label: 'Need Score', val: qualRules.needScore },
                        { label: 'Timing Score', val: qualRules.timingScore }
                      ].map((q) => (
                        <div key={q.label}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                            <span>{q.label}</span>
                            <span style={{ fontWeight: 700 }}>{q.val}%</span>
                          </div>
                          <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px' }}>
                            <div style={{ height: '100%', background: '#fbbf24', width: `${q.val}%`, borderRadius: '999px' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Scoring Model outputs */}
                {scoreModel && (
                  <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '1rem', padding: '2rem' }}>
                    <h3 style={{ margin: '0 0 1.5rem', color: '#fbbf24' }}>Scoring Strategy Model</h3>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Priority Tier assignment</div>
                      <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981' }}>{scoreModel.priorityTier}</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Quality Score</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{scoreModel.qualityScore}%</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Urgency Index</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{scoreModel.urgencyScore}%</div>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Explainability rationale</div>
                      <div style={{ fontSize: '0.85rem', color: '#94a3b8', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '0.5rem', marginTop: '0.25rem' }}>
                        {scoreModel.explainability}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Segmentation Tab */}
            {activeTab === 'segmentation' && (
              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '1rem', padding: '2rem' }}>
                <h3 style={{ margin: '0 0 1.5rem', color: '#fbbf24' }}>Lead Segments</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', color: '#64748b', fontSize: '0.85rem', textAlign: 'left' }}>
                      <th style={{ padding: '0.75rem' }}>Segment Name</th>
                      <th style={{ padding: '0.75rem' }}>Industry</th>
                      <th style={{ padding: '0.75rem' }}>Company Size</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right' }}>Expected Deal size</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right' }}>Leads Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {segments.map((seg: any, idx: number) => (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.9rem' }}>
                        <td style={{ padding: '1rem 0.75rem', fontWeight: 700 }}>{seg.segmentName}</td>
                        <td style={{ padding: '1rem 0.75rem' }}>{seg.industry}</td>
                        <td style={{ padding: '1rem 0.75rem' }}>{seg.companySize}</td>
                        <td style={{ padding: '1rem 0.75rem', textAlign: 'right', color: '#10b981', fontWeight: 600 }}>${seg.expectedDealSize?.toLocaleString()}</td>
                        <td style={{ padding: '1rem 0.75rem', textAlign: 'right', fontWeight: 700 }}>{seg.leadsCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Journey Tab */}
            {activeTab === 'journey' && (
              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '1rem', padding: '2rem' }}>
                <h3 style={{ margin: '0 0 1.5rem', color: '#fbbf24' }}>Multi-Channel Nurturing Journeys</h3>
                {journeys.map((j: any, idx: number) => (
                  <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fbbf24', marginBottom: '1rem' }}>{j.journeyType} Journey</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>Touchpoint sequences</div>
                        <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
                          {(j.touchpoints || []).map((tp: string, i: number) => (
                            <li key={i} style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{tp}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>Sample Messages</div>
                        <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
                          {(j.messages || []).map((msg: string, i: number) => (
                            <li key={i} style={{ fontSize: '0.85rem', color: '#94a3b8' }}>"{msg}"</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Forecast Tab */}
            {activeTab === 'forecast' && forecasts && (
              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '1rem', padding: '2rem' }}>
                <h3 style={{ margin: '0 0 1.5rem', color: '#fbbf24' }}>Growth Forecast Models</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '0.5rem' }}>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Expected Leads Count</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{forecasts.expectedLeads}</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '0.5rem' }}>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Pipeline MQLs</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fbbf24' }}>{forecasts.qualifiedLeads}</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '0.5rem' }}>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Sales Qualified Leads (SQL)</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#3b82f6' }}>{forecasts.sqlCount}</div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>Revenue Range bounds</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 700 }}>
                    <span style={{ color: '#ef4444' }}>Min: ${forecasts.confidenceMin?.toLocaleString()}</span>
                    <span style={{ color: '#10b981' }}>Max: ${forecasts.confidenceMax?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Recommendations Tab */}
            {activeTab === 'recommendations' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                {rec ? (
                  <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '1rem', padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#fbbf24' }}>{rec.title}</h3>
                      <span style={{ background: '#fbbf24', color: '#000', padding: '0.2rem 0.6rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 800 }}>
                        {rec.expectedCloseProb}% Closing Probability
                      </span>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                      <div style={{ fontWeight: 600, color: '#cbd5e1' }}>Next Best Action</div>
                      <p style={{ margin: '0.25rem 0 0', color: '#94a3b8', fontSize: '0.95rem' }}>{rec.nextBestAction}</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: '#cbd5e1', fontSize: '0.85rem' }}>Dependencies</div>
                        <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#64748b' }}>
                          {tryParse(rec.dependencies, []).map((d: string, i: number) => (
                            <li key={i}>{d}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#cbd5e1', fontSize: '0.85rem' }}>Mitigations / Risk factors</div>
                        <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#64748b' }}>
                          {tryParse(rec.riskFactors, []).map((rf: string, i: number) => (
                            <li key={i}>{rf}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Run Lead Engine to view strategy suggestions.</div>
                )}

                {/* Review Panel */}
                {rec && rec.status === 'PENDING' && (
                  <div style={{ background: '#1e1b4b', border: '1px solid #312e81', borderRadius: '1rem', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <h3 style={{ margin: 0, color: '#e2e8f0' }}>Pending VP Review</h3>
                    <textarea
                      placeholder="Add human strategy audit feedback guidelines or comments here..."
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      style={{ width: '100%', height: '100px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.5rem', padding: '0.75rem', color: '#fff', fontSize: '0.9rem' }}
                    />
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button
                        onClick={() => handleAction('ACCEPT')}
                        style={{ flex: 1, padding: '0.75rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '0.25rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Accept Strategy
                      </button>
                      <button
                        onClick={() => handleAction('REJECT')}
                        style={{ flex: 1, padding: '0.75rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '0.25rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Reject Strategy
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Playbook Tab */}
            {activeTab === 'playbook' && playbook && (
              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '1rem', padding: '2rem' }}>
                <h3 style={{ margin: '0 0 0.5rem', color: '#fbbf24' }}>{playbook.name}</h3>
                <div style={{ color: '#d97706', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Trigger rule: {playbook.triggerCondition}</div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#cbd5e1', marginBottom: '0.25rem' }}>Target Audience scope</div>
                    <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{playbook.targetAudience}</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>Step-by-step play actions</div>
                    <ol style={{ paddingLeft: '1.25rem', margin: 0 }}>
                      {tryParse(playbook.recommendedSteps, []).map((step: string, i: number) => (
                        <li key={i} style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '0.4rem' }}>{step}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            )}

            {/* Revenue Pipeline Tab */}
            {activeTab === 'pipeline' && (
              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '1rem', padding: '2rem' }}>
                <h3 style={{ margin: '0 0 1.5rem', color: '#fbbf24' }}>B2B Enterprise Revenue Pipeline Stages</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {(pipelineHealth?.stages || []).map((st: any, idx: number) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderLeft: `4px solid ${st.leadCount > 0 ? '#10b981' : 'rgba(255,255,255,0.1)'}`, borderRadius: '0.25rem' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{st.stageName} ({st.leadCount} leads)</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                          Responsible Engine: <strong style={{ color: '#fbbf24' }}>{st.responsibleEngine}</strong> | Prob: {st.probability * 100}%
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', alignSelf: 'center', fontSize: '0.85rem', color: '#cbd5e1' }}>
                        Avg stay: {st.averageTimeDays} days
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Execution Plan Tab */}
            {activeTab === 'execution' && (
              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '1rem', padding: '2rem' }}>
                <h3 style={{ margin: '0 0 1.5rem', color: '#fbbf24' }}>Execution Plan Checklist</h3>
                {session?.executionPlans?.[0] ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {tryParse(session.executionPlans[0].steps, []).map((step: any, i: number) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'rgba(255,255,255,0.01)', borderRadius: '0.25rem' }}>
                        <span style={{ color: '#10b981', fontWeight: 800 }}>✓</span>
                        <span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>{step.task}</span>
                        <span style={{ marginLeft: 'auto', background: 'rgba(16,185,129,0.15)', color: '#6ee7b7', padding: '0.15rem 0.5rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700 }}>{step.status}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Accept the generated strategy recommendation above to build the execution task checklist.</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
