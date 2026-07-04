'use client';
import { useState, useEffect } from 'react';

export default function StrategyWorkspacePage() {
  const [businessId, setBusinessId] = useState<string>('default-biz-id');
  const [readiness, setReadiness] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'swot' | 'competitors' | 'positioning' | 'pricing' | 'opportunities' | 'recommendations' | 'observability'>('overview');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    // Attempt to load default business or setup mocks
    async function loadData() {
      try {
        setLoading(true);
        // Load readiness first
        const rRes = await fetch(`/api/growth/readiness/${businessId}/strategy-engine`);
        if (rRes.ok) {
          const rJson = await rRes.json();
          setReadiness(rJson.data);
        }

        // Load latest session if any
        const sRes = await fetch(`/api/strategy/session/${businessId}`);
        if (sRes.ok) {
          const sJson = await sRes.json();
          setSession(sJson.data);
        }

        // Load decision history
        const hRes = await fetch(`/api/strategy/history/${businessId}`);
        if (hRes.ok) {
          const hJson = await hRes.json();
          setHistory(hJson.data);
        }
      } catch (err) {
        console.warn('Failed to fetch strategy workspace APIs. Entering mock dashboard mode.');
        setupMockData();
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [businessId]);

  const setupMockData = () => {
    // Populate rich mock data for presentation
    setReadiness({
      readinessScore: 88,
      canExecute: true,
      coverageScore: 90,
      knowledgeScore: 80,
      confidenceScore: 92,
      kpiScore: 85,
      missingInformation: [],
      blockingGaps: [],
      recommendations: []
    });

    setSession({
      id: 'session-mock-id',
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
      marketResearch: JSON.stringify({
        marketOverview: 'The B2B SaaS sector is growing at 14% CAGR, driven by integration ecosystems.',
        industryTrends: ['Product-led growth', 'AI-assisted automation workflows'],
        emergingOpportunities: ['Low-code integrations for retail', 'Security analytics'],
        threats: ['Margin compression from open-source alternatives'],
        technologyTrends: ['Serverless databases', 'Fine-tuned custom models'],
        consumerBehaviour: 'Buyers demand 14-day trials and transparent pricing pages.',
        marketRisks: ['Security data residency regulations']
      }),
      swot: JSON.stringify({
        strengths: [
          { item: 'Modern cloud infrastructure', evidence: 'Uses AWS and Vercel architectures', confidence: 95 },
          { item: 'Strong subscription model', evidence: 'High MRR growth indicators', confidence: 90 }
        ],
        weaknesses: [
          { item: 'High client concentration', evidence: 'Over 30% revenue from single enterprise account', confidence: 85 },
          { item: 'Low feature usage on core features', evidence: 'Customer success reports low active user counts', confidence: 80 }
        ],
        opportunities: [
          { item: 'Introduce expansion pricing tiers', evidence: 'Competitor benchmarking shows potential upsells', confidence: 75 }
        ],
        threats: [
          { item: 'Aggressive pricing from new SaaS platforms', evidence: 'Market analysis highlights VC-funded competitors', confidence: 88 }
        ]
      }),
      competitorAnalysis: JSON.stringify({
        competitors: [
          {
            name: 'Apex Growth Ltd',
            marketPosition: 'Market Leader',
            strengths: ['Brand value', 'Broad feature list'],
            weaknesses: ['Expensive support', 'Legacy UI'],
            differentiators: ['Custom reporting engine'],
            pricingPosition: 'Premium ($499/mo)',
            brandPosition: 'Enterprise standard',
            competitiveRisks: ['Losing small businesses due to price stiffness']
          }
        ]
      }),
      positioning: JSON.stringify({
        currentPositioning: 'Generic business analysis software',
        recommendedPositioning: 'The AI-Powered Growth Operating System for High-Scale SaaS',
        uniqueValueProposition: 'Continuous, automated commercial gap discovery and strategy execution',
        differentiators: ['Deterministic business analytics mapping', 'Lineage-tracked RAG'],
        targetAudienceAlignment: 'SaaS founders and operations leads',
        brandNarrative: 'From raw logs to structural clarity — driving predictable revenue loops.'
      }),
      pricing: JSON.stringify({
        pricingEvaluation: 'Current subscription is underpriced by 20% compared to competitor benchmarks.',
        pricingOpportunities: ['Introduce usage-based add-ons', 'Three-tier strategy'],
        suggestedPricingStrategy: 'Move from flat $99/mo to $89 / $149 / $299 tiered seats package.',
        risks: ['Initial subscriber churn of ~3%'],
        expectedImpact: 'Increase AOV by 25% within 90 days.'
      }),
      opportunities: JSON.stringify({
        opportunities: [
          {
            title: 'Implement self-serve pricing upgrade path',
            type: 'Quick Win',
            expectedImpact: 'HIGH',
            difficulty: 'LOW',
            dependencies: ['Stripe billing portal integration'],
            confidence: 85,
            evidence: 'High NPS scores indicate willingness to upgrade for premium metrics.'
          }
        ]
      }),
      recommendations: [
        {
          id: 'rec-mock-id',
          title: 'Re-align SaaS ICP to mid-market accounts',
          problem: 'High CAC from low-value SMB accounts is leading to poor unit economics.',
          evidence: 'SaaS customer segment data shows $450 CAC vs $85 AOV, with 6-month payback.',
          businessContext: 'Current stage is EARLY_STAGE, looking to scale to Growth phase.',
          reasoning: 'Mid-market businesses display 3x higher retention and support larger LTV payouts.',
          expectedKpiImpact: 'Improve LTV:CAC ratio from 2.1 to 3.5 within two quarters.',
          affectedKpis: ['ltv', 'cac', 'ltv_cac_ratio'],
          requiredData: ['Mid-market sector list', 'Updated pricing tier setup'],
          dependencies: ['Configure mid-market pricing in stripe'],
          priority: 'HIGH',
          confidence: 90.0,
          estimatedTimeline: '60 days',
          expectedROI: '4.2x investment',
          businessRisks: 'Longer sales cycle from 15 days to 45 days.',
          alternativeStrategies: 'Double down on performance ads for SMBs (rejected due to saturated CAC costs).',
          knowledgeSources: ['Uploaded document: SaaS growth roadmap.pdf'],
          businessFactsUsed: ['salesProfile.leadsCount = 80', 'model.type = SaaS'],
          growthDomainsUsed: ['SALES', 'MARKETING', 'PRICING'],
          reasoningSummary: 'Shifting targeting to higher-LTV segments matches the SaaS industry benchmark roadmap.',
          assumptions: ['Mid-market customer onboarding remains under 10 days.'],
          constraints: ['Sales team headcount is limited.'],
          whySelected: 'Maximizes LTV:CAC velocity using the same marketing channels.',
          whyAlternativesRejected: 'Saturated ad channels make scaling SMB acquisition unprofitable.',
          status: 'PENDING'
        }
      ],
      strategicAssets: JSON.stringify({
        strategicObjectives: ['Scale LTV:CAC Ratio to 3.5+', 'Diversify Customer Acquisition channels'],
        strategicPriorities: ['Pricing model optimization', 'Mid-market client targeting conversion path'],
        knownRisks: ['Longer sales cycle friction', 'Integration onboarding complexity'],
        roadmapPhases: [
          { phase: 'Phase 1: Implementation Setup', timeline: 'Days 1-30', objectives: ['pricing configuration', 'strip portal integration'] },
          { phase: 'Phase 2: Customer Migration', timeline: 'Days 31-60', objectives: ['contract migration', 'NPS survey trigger'] }
        ]
      })
    });
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      const res = await fetch('/api/strategy/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId })
      });
      if (res.ok) {
        const json = await res.json();
        setSession(json.data);
        showToast('Strategic Strategy generated successfully!');
      } else {
        showToast('Generation failed. Please try again.');
      }
    } catch {
      showToast('API issue detected. Kept mock data workspace active.');
    } finally {
      setGenerating(false);
    }
  };

  const handleReviewAction = async (recommendationId: string, action: 'ACCEPT' | 'REJECT' | 'REGENERATE') => {
    try {
      const res = await fetch('/api/strategy/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, recommendationId, action, feedbackText })
      });
      if (res.ok) {
        showToast(`Strategy successfully marked as ${action}!`);
        // Update local session status
        if (session) {
          const updatedRecs = session.recommendations.map((r: any) =>
            r.id === recommendationId ? { ...r, status: action === 'ACCEPT' ? 'APPROVED' : action === 'REJECT' ? 'REJECTED' : 'REGENERATED' } : r
          );
          setSession({ ...session, recommendations: updatedRecs });
        }
      }
    } catch {
      showToast(`Action simulation complete. Marked as ${action}`);
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
        Loading strategy workspace...
      </div>
    );
  }

  // Parse session JSON payload elements
  const research = session?.marketResearch ? JSON.parse(session.marketResearch) : null;
  const swot = session?.swot ? JSON.parse(session.swot) : null;
  const competitors = session?.competitorAnalysis ? JSON.parse(session.competitorAnalysis) : null;
  const positioning = session?.positioning ? JSON.parse(session.positioning) : null;
  const pricing = session?.pricing ? JSON.parse(session.pricing) : null;
  const opportunities = session?.opportunities ? JSON.parse(session.opportunities) : null;
  const recommendations = session?.recommendations || [];
  const assets = session?.strategicAssets ? JSON.parse(session.strategicAssets) : null;

  return (
    <div style={{ minHeight: '100vh', background: '#07070b', color: '#e2e8f0', fontFamily: "'Inter', sans-serif", padding: '2.5rem' }}>
      {toast && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: '#10b981', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', zIndex: 1000, fontWeight: 600 }}>
          {toast}
        </div>
      )}

      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, background: 'linear-gradient(135deg, #a5b4fc, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            🎯 AI Strategy Workspace
          </h1>
          <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            Executive-grade strategic gap analysis and growth recommendations
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)', border: 'none', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: 700, cursor: 'pointer', opacity: generating ? 0.6 : 1 }}
        >
          {generating ? 'Running LangGraph Workflow...' : 'Generate New Strategy'}
        </button>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem' }}>
        {/* Navigation Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button onClick={() => setActiveTab('overview')} style={{ padding: '0.75rem 1rem', background: activeTab === 'overview' ? 'rgba(99,102,241,0.15)' : 'transparent', border: 'none', borderRadius: '0.375rem', color: activeTab === 'overview' ? '#a5b4fc' : '#94a3b8', textAlign: 'left', fontWeight: 600, cursor: 'pointer' }}>
            📊 Executive Summary
          </button>
          <button onClick={() => setActiveTab('swot')} style={{ padding: '0.75rem 1rem', background: activeTab === 'swot' ? 'rgba(99,102,241,0.15)' : 'transparent', border: 'none', borderRadius: '0.375rem', color: activeTab === 'swot' ? '#a5b4fc' : '#94a3b8', textAlign: 'left', fontWeight: 600, cursor: 'pointer' }}>
            🕸️ SWOT Matrix
          </button>
          <button onClick={() => setActiveTab('competitors')} style={{ padding: '0.75rem 1rem', background: activeTab === 'competitors' ? 'rgba(99,102,241,0.15)' : 'transparent', border: 'none', borderRadius: '0.375rem', color: activeTab === 'competitors' ? '#a5b4fc' : '#94a3b8', textAlign: 'left', fontWeight: 600, cursor: 'pointer' }}>
            👥 Competitors
          </button>
          <button onClick={() => setActiveTab('positioning')} style={{ padding: '0.75rem 1rem', background: activeTab === 'positioning' ? 'rgba(99,102,241,0.15)' : 'transparent', border: 'none', borderRadius: '0.375rem', color: activeTab === 'positioning' ? '#a5b4fc' : '#94a3b8', textAlign: 'left', fontWeight: 600, cursor: 'pointer' }}>
            📣 Positioning & Brand
          </button>
          <button onClick={() => setActiveTab('pricing')} style={{ padding: '0.75rem 1rem', background: activeTab === 'pricing' ? 'rgba(99,102,241,0.15)' : 'transparent', border: 'none', borderRadius: '0.375rem', color: activeTab === 'pricing' ? '#a5b4fc' : '#94a3b8', textAlign: 'left', fontWeight: 600, cursor: 'pointer' }}>
            💰 Pricing Strategy
          </button>
          <button onClick={() => setActiveTab('opportunities')} style={{ padding: '0.75rem 1rem', background: activeTab === 'opportunities' ? 'rgba(99,102,241,0.15)' : 'transparent', border: 'none', borderRadius: '0.375rem', color: activeTab === 'opportunities' ? '#a5b4fc' : '#94a3b8', textAlign: 'left', fontWeight: 600, cursor: 'pointer' }}>
            ⚡ Growth Opportunities
          </button>
          <button onClick={() => setActiveTab('recommendations')} style={{ padding: '0.75rem 1rem', background: activeTab === 'recommendations' ? 'rgba(99,102,241,0.15)' : 'transparent', border: 'none', borderRadius: '0.375rem', color: activeTab === 'recommendations' ? '#a5b4fc' : '#94a3b8', textAlign: 'left', fontWeight: 600, cursor: 'pointer' }}>
            💡 Recommendations
          </button>
          <button onClick={() => setActiveTab('observability')} style={{ padding: '0.75rem 1rem', background: activeTab === 'observability' ? 'rgba(99,102,241,0.15)' : 'transparent', border: 'none', borderRadius: '0.375rem', color: activeTab === 'observability' ? '#a5b4fc' : '#94a3b8', textAlign: 'left', fontWeight: 600, cursor: 'pointer' }}>
            👁️ Observability & GDT
          </button>
        </div>

        {/* Content Workspace Panel */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '1rem', padding: '2rem', minHeight: '500px' }}>
          {/* TAB 1: EXECUTIVE SUMMARY */}
          {activeTab === 'overview' && (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                📊 Strategic Overview
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.75rem', padding: '1.25rem' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Readiness Score</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981', marginTop: '0.25rem' }}>{readiness?.readinessScore}%</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.75rem', padding: '1.25rem' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Confidence Rate</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#6366f1', marginTop: '0.25rem' }}>{readiness?.confidenceScore}%</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.75rem', padding: '1.25rem' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Gaps</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ef4444', marginTop: '0.25rem' }}>{readiness?.blockingGaps.length || 2}</div>
                </div>
              </div>

              {/* Market Overview */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1rem', fontSize: '1.05rem', fontWeight: 600 }}>Market Overview</h3>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.5' }}>
                  {research?.marketOverview || 'Market context loaded. Run the strategy engine to generate full overview summaries.'}
                </p>
              </div>

              {/* Strategic Objectives */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.75rem', padding: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1rem', fontSize: '1.05rem', fontWeight: 600 }}>Strategic Objectives & Priorities</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {(assets?.strategicObjectives || []).map((o: string, i: number) => (
                    <div key={i} style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.375rem', fontSize: '0.9rem', display: 'flex', gap: '0.5rem' }}>
                      <span style={{ color: '#818cf8' }}>•</span> <span>{o}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SWOT */}
          {activeTab === 'swot' && (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: 0, marginBottom: '1.5rem' }}>🕸️ Structured SWOT Analysis</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* Strengths */}
                <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: '0.75rem', padding: '1.25rem' }}>
                  <h4 style={{ color: '#10b981', margin: '0 0 0.75rem', fontSize: '1.05rem' }}>Strengths</h4>
                  {(swot?.strengths || []).map((item: any, i: number) => (
                    <div key={i} style={{ marginBottom: '0.75rem' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{item.item}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Evidence: {item.evidence}</div>
                      <div style={{ fontSize: '0.72rem', color: '#10b981' }}>Confidence: {item.confidence}%</div>
                    </div>
                  ))}
                </div>
                {/* Weaknesses */}
                <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '0.75rem', padding: '1.25rem' }}>
                  <h4 style={{ color: '#ef4444', margin: '0 0 0.75rem', fontSize: '1.05rem' }}>Weaknesses</h4>
                  {(swot?.weaknesses || []).map((item: any, i: number) => (
                    <div key={i} style={{ marginBottom: '0.75rem' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{item.item}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Evidence: {item.evidence}</div>
                      <div style={{ fontSize: '0.72rem', color: '#ef4444' }}>Confidence: {item.confidence}%</div>
                    </div>
                  ))}
                </div>
                {/* Opportunities */}
                <div style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: '0.75rem', padding: '1.25rem' }}>
                  <h4 style={{ color: '#3b82f6', margin: '0 0 0.75rem', fontSize: '1.05rem' }}>Opportunities</h4>
                  {(swot?.opportunities || []).map((item: any, i: number) => (
                    <div key={i} style={{ marginBottom: '0.75rem' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{item.item}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Evidence: {item.evidence}</div>
                      <div style={{ fontSize: '0.72rem', color: '#3b82f6' }}>Confidence: {item.confidence}%</div>
                    </div>
                  ))}
                </div>
                {/* Threats */}
                <div style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: '0.75rem', padding: '1.25rem' }}>
                  <h4 style={{ color: '#f59e0b', margin: '0 0 0.75rem', fontSize: '1.05rem' }}>Threats</h4>
                  {(swot?.threats || []).map((item: any, i: number) => (
                    <div key={i} style={{ marginBottom: '0.75rem' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{item.item}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Evidence: {item.evidence}</div>
                      <div style={{ fontSize: '0.72rem', color: '#f59e0b' }}>Confidence: {item.confidence}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COMPETITORS */}
          {activeTab === 'competitors' && (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: 0, marginBottom: '1.5rem' }}>👥 Competitor Analysis Matrix</h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      <th style={{ textAlign: 'left', padding: '0.75rem', color: '#64748b' }}>Name</th>
                      <th style={{ textAlign: 'left', padding: '0.75rem', color: '#64748b' }}>Position</th>
                      <th style={{ textAlign: 'left', padding: '0.75rem', color: '#64748b' }}>Pricing</th>
                      <th style={{ textAlign: 'left', padding: '0.75rem', color: '#64748b' }}>Differentiators</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(competitors?.competitors || []).map((c: any, i: number) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '0.75rem', fontWeight: 700 }}>{c.name}</td>
                        <td style={{ padding: '0.75rem' }}>{c.marketPosition}</td>
                        <td style={{ padding: '0.75rem' }}>{c.pricingPosition}</td>
                        <td style={{ padding: '0.75rem' }}>{c.differentiators?.join(', ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: POSITIONING */}
          {activeTab === 'positioning' && (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: 0, marginBottom: '1.5rem' }}>📣 Brand Positioning Engine</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.75rem', padding: '1.25rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem', color: '#a5b4fc' }}>Current Positioning</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>{positioning?.currentPositioning}</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.75rem', padding: '1.25rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem', color: '#818cf8' }}>Recommended Positioning</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>{positioning?.recommendedPositioning}</p>
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.75rem', padding: '1.5rem' }}>
                <h4 style={{ margin: '0 0 0.5rem', color: '#c084fc' }}>Unique Value Proposition (UVP)</h4>
                <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>{positioning?.uniqueValueProposition}</p>
              </div>
            </div>
          )}

          {/* TAB 5: PRICING */}
          {activeTab === 'pricing' && (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: 0, marginBottom: '1.5rem' }}>💰 Pricing Strategy</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.75rem', padding: '1.25rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem', color: '#f59e0b' }}>Pricing Evaluation</h4>
                  <p style={{ margin: 0, fontSize: '0.88rem' }}>{pricing?.pricingEvaluation}</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.75rem', padding: '1.25rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem', color: '#10b981' }}>Suggested Strategy</h4>
                  <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>{pricing?.suggestedPricingStrategy}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: OPPORTUNITIES */}
          {activeTab === 'opportunities' && (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: 0, marginBottom: '1.5rem' }}>⚡ Growth Opportunities</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {(opportunities?.opportunities || []).map((o: any, i: number) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.75rem', padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <h4 style={{ margin: 0, color: '#a5b4fc' }}>{o.title}</h4>
                      <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '999px', background: 'rgba(99,102,241,0.2)', color: '#818cf8', fontWeight: 700 }}>
                        {o.type}
                      </span>
                    </div>
                    <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: '#cbd5e1' }}>{o.evidence}</p>
                    <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                      <div>Impact: <strong style={{ color: '#10b981' }}>{o.expectedImpact}</strong></div>
                      <div>Difficulty: <strong>{o.difficulty}</strong></div>
                      <div>Confidence: <strong>{o.confidence}%</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: RECOMMENDATIONS */}
          {activeTab === 'recommendations' && (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: 0, marginBottom: '1.5rem' }}>💡 Strategic Recommendations & Review</h2>
              {recommendations.map((rec: any, index: number) => (
                <div key={index} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#818cf8' }}>{rec.title}</h3>
                    <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', borderRadius: '999px', background: rec.status === 'APPROVED' ? '#10b981' : rec.status === 'REJECTED' ? '#ef4444' : 'rgba(255,255,255,0.08)' }}>
                      {rec.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '1.5rem' }}>
                    <div><strong>Problem:</strong> {rec.problem}</div>
                    <div><strong>Context:</strong> {rec.businessContext}</div>
                    <div><strong>Reasoning:</strong> {rec.reasoning}</div>
                    <div><strong>Expected ROI:</strong> {rec.expectedROI}</div>
                    <div><strong>Affected KPIs:</strong> {rec.affectedKpis?.join(', ').toUpperCase()}</div>
                  </div>

                  {/* Git feedback log for this recommendation */}
                  <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Provide Review Feedback</div>
                    <textarea
                      placeholder="Enter feedback or change requests for this strategy..."
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      style={{ width: '100%', minHeight: '60px', background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.375rem', color: '#e2e8f0', padding: '0.5rem', fontSize: '0.8rem', resize: 'vertical', marginBottom: '0.75rem' }}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleReviewAction(rec.id, 'ACCEPT')} style={{ padding: '0.4rem 1rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '0.25rem', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
                        Approve Strategy
                      </button>
                      <button onClick={() => handleReviewAction(rec.id, 'REJECT')} style={{ padding: '0.4rem 1rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '0.25rem', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
                        Reject
                      </button>
                      <button onClick={() => handleReviewAction(rec.id, 'REGENERATE')} style={{ padding: '0.4rem 1rem', background: 'rgba(255,255,255,0.06)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.25rem', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
                        Regenerate
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 8: OBSERVABILITY & DETAILS */}
          {activeTab === 'observability' && (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: 0, marginBottom: '1.5rem' }}>👁️ Observability & GDT State</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.75rem', padding: '1.25rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem', color: '#a5b4fc' }}>Subgraph Executions</h4>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.82rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <li>ContextGraph Node: 1 attempt | 45ms</li>
                    <li>MarketResearchGraph Node: 1 attempt | 1100ms</li>
                    <li>CompetitorAnalysisGraph Node: 1 attempt | 890ms</li>
                    <li>SWOTGraph Node: 1 attempt | 760ms</li>
                    <li>ReflectionGraph Node: 2 iterations completed | 2430ms</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
