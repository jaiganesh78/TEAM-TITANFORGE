'use client';
import { useState, useEffect } from 'react';

export default function SalesWorkspacePage() {
  const [businessId, setBusinessId] = useState<string>('default-biz-id');
  const [readiness, setReadiness] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [revIntel, setRevIntel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'opportunities' | 'health' | 'committee' | 'playbook' | 'negotiation' | 'objections' | 'proposals' | 'forecast' | 'insights' | 'revenue-intelligence'>('overview');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Load readiness
        const rRes = await fetch(`/api/growth/readiness/${businessId}/sales-engine`);
        if (rRes.ok) {
          const rJson = await rRes.json();
          setReadiness(rJson.data);
        }

        // Load latest session history
        const sRes = await fetch(`/api/sales/revenue-intelligence/${businessId}`);
        if (sRes.ok) {
          const sJson = await sRes.json();
          setRevIntel(sJson);
        }

        // Load latest sales session details
        const sessionHistoryRes = await fetch(`/api/sales/sessions/latest?businessId=${businessId}`);
        if (sessionHistoryRes.ok) {
          const sessJson = await sessionHistoryRes.json();
          setSession(sessJson.session);
        }
      } catch (err) {
        console.warn('Failed to fetch sales workspace APIs. Entering mock dashboard mode.');
        setupMockData();
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [businessId]);

  const setupMockData = () => {
    setReadiness({
      readinessScore: 95,
      canExecute: true
    });

    const mockSession = {
      id: 'sales-mock-session-id',
      status: 'SUCCESS',
      createdAt: new Date().toISOString(),
      opportunityAnalysis: JSON.stringify({
        opportunities: [
          {
            opportunityName: 'Global Logistics Expansion',
            businessValue: 'Enterprise predictive routing contract extension',
            revenuePotential: 120000.0,
            strategicImportance: 'HIGH',
            expansionOpportunity: 'Upsell to tier 2 global dispatch API',
            crossSellOpportunity: 'Cross-sell telemetry integrations',
            upsellOpportunity: 'Telemetry advanced package',
            competitiveRisk: 'Competitor RouteGenie submitting lower bid',
            confidence: 85.0,
            evidence: 'Active expansion email inquiry from Director of IT'
          }
        ]
      }),
      dealQualification: JSON.stringify({
        dealHealths: [
          {
            opportunityName: 'Global Logistics Expansion',
            needScore: 90,
            authorityScore: 85,
            budgetScore: 80,
            timelineScore: 85,
            urgencyScore: 75,
            competitivePosition: 80,
            relationshipStrength: 85,
            buyingSignals: 90,
            riskLevel: 25,
            overallHealthScore: 84,
            explainability: 'Strong BANT validation metrics'
          }
        ]
      }),
      buyingCommittee: JSON.stringify({
        stakeholders: [
          {
            name: 'Sarah Jenkins',
            role: 'Director of IT',
            influenceLevel: 'HIGH',
            decisionPower: 'DECISION_MAKER',
            objections: ['Integration downtime risk', 'Pricing fits current CapEx but needs OpEx justification'],
            motivations: ['System stability', 'Scalability'],
            preferredCommunicationStyle: 'Direct, analytical',
            risk: 'Loves current legacy provider',
            recommendedSalesStrategy: 'Share architectural validation whitepaper'
          }
        ]
      }),
      negotiationStrategy: JSON.stringify({
        negotiationObjectives: ['Achieve $120k ACV', 'Secure 3-year term commitment'],
        pricingFlexibility: 'Up to 15% discount for 3-year upfront payment',
        concessions: ['Waive initial setup fee', 'Add premium 24/7 SLA tier for first year'],
        walkAwayConditions: ['Deal value below $95k ACV', 'No direct developer support clauses'],
        riskAnalysis: 'Competitor offering lower setup cost',
        winStrategy: 'Focus on total cost of ownership (TCO) efficiency',
        alternativeApproaches: 'Pilot implementation with month-to-month terms'
      }),
      objectionHandling: JSON.stringify({
        objections: [
          {
            category: 'Price',
            objection: 'The solution is 20% more expensive than competitor routing platforms.',
            recommendedResponse: 'Highlight that our automated routes reduce fuel overhead by 30%, compensating price diff in 3 months.',
            supportingEvidence: 'Logistics case study showing 32% fuel cost reduction within 90 days',
            businessCase: 'Fuel savings represent $45k monthly vs $5k price difference'
          }
        ]
      }),
      proposalStrategy: JSON.stringify({
        proposalStructure: ['Executive Summary', 'Value Realization', 'Scope & Deliverables', 'ROI Analysis', 'Investment & SLA'],
        valueNarrative: 'Transforming routing logistics into a predictable driver of profit.',
        roiStory: 'Payback period less than 100 days.',
        caseStudySuggestions: ['DHL Route Efficiency Partner Case Study'],
        proofPoints: ['Zero downtime routing migrations executed for 15 logistics clients'],
        successMetrics: ['30% reduction in route planning hours', '15% lower vehicle emissions'],
        recommendedTimeline: 'Onboarding starting within 14 days, pilot live in 30 days'
      }),
      revenueOptimization: JSON.stringify({
        upsellOpportunities: ['Premium support SLA', 'Advanced API analytics dashboard addon'],
        crossSellOpportunities: ['Supply chain compliance validation suite'],
        bundleOpportunities: ['Predictive routing + Compliance validation bundle'],
        renewalOpportunities: ['Global Dispatch core API annual renewal'],
        expansionAccounts: ['Global Logistics Ltd APAC division'],
        revenueRisks: ['Churn risk on legacy dispatch modules']
      }),
      salesForecast: JSON.stringify({
        bestCase: 150000.0,
        expectedCase: 120000.0,
        worstCase: 90000.0,
        expectedRevenue: 120000.0,
        pipelineValue: 240000.0,
        closeProbability: 80.0,
        forecastConfidence: 85.0
      }),
      nextBestAction: JSON.stringify({
        actions: [
          {
            opportunityName: 'Global Logistics Expansion',
            immediateAction: 'Send architectural validation whitepaper',
            followUpAction: 'Schedule technical integration call with dev leads',
            escalation: 'Request CRO join call if pricing objections persist',
            requiredResources: ['Principal Architect hours', 'Objection responses script'],
            expectedOutcome: 'Obtain security sign-off',
            successKPI: 'Security audit signoff timestamp',
            deadline: '2026-07-15',
            priority: 'HIGH'
          }
        ]
      }),
      playbooks: [
        {
          name: 'Enterprise Logistics Expansion Playbook',
          playRules: 'Trigger on logistics sector prospects exceeding $100k ARR',
          targetAudience: 'Logistics directors and IT executives',
          triggerCondition: 'Prospect requests routing API documentation',
          recommendedSteps: '["Perform discovery call verifying active fleets", "Conduct custom ROI calculation workshop"]',
          objectionLibrary: '["Integration risk answers", "Pricing concessions policy"]',
          negotiationFramework: '{"discountMax": 15, "termRequirement": 12}',
          proposalTemplate: '{"layout": "enterprise-dual-column", "style": "navy-gold"}'
        }
      ],
      recommendations: [
        {
          id: 'rec-sales-1',
          opportunityName: 'Global Logistics Expansion',
          title: 'Execute TCO-driven Negotiation',
          nextBestAction: 'Deliver fuel-efficiency business case document',
          expectedCloseProb: 82.0,
          expectedTimeline: '15 days',
          riskFactors: '["Competitor price war", "Slow legal redlining"]',
          dependencies: '["IT director approval of SLA parameters"]',
          alternativeActions: '["Offer a pilot tier at 10% lower cost with limited API volume"]',
          status: 'PENDING'
        }
      ]
    };

    setSession(mockSession);

    setRevIntel({
      benchmarks: {
        averageDealSize: 120000,
        averageSalesCycleDays: 32,
        averageWinRatePercent: 28.5,
        pipelineVelocity: 107.14,
        revenueConcentrationPercent: 45.0,
        forecastAccuracyPercent: 88.0,
        pipelineHealthScore: 84,
        averageStageDurations: {
          Prospect: 6,
          Engaged: 11,
          MQL: 8,
          SQL: 12,
          Discovery: 14,
          Proposal: 9,
          Negotiation: 5
        }
      },
      scores: {
        pipelineHealth: 84.0,
        forecastReliability: 88.0,
        revenueStability: 85.0,
        expansionPotential: 75.0,
        revenueRisk: 20.0,
        growthMomentum: 80.0,
        overallExecutiveRevenueScore: 82.0
      },
      snapshots: [
        {
          id: 'snap-1',
          version: 1,
          createdAt: new Date().toISOString(),
          pipelineSummary: JSON.stringify({ totalLeads: 12, totalPipelineValue: 450000, openVelocity: 107.14 }),
          dealDistribution: JSON.stringify({ Prospect: 3, MQL: 4, SQL: 3, Discovery: 2 }),
          revenueForecast: JSON.stringify({ expectedRevenue: 120000, averageDealSize: 120000, averageSalesCycleDays: 32 }),
          dealHealthDistribution: JSON.stringify({ averageHealthScore: 84, highHealthCount: 8 }),
          relationshipHealth: JSON.stringify({ averageRelationshipScore: 84, topCustomerStability: 85 }),
          revenueRisks: JSON.stringify(['High concentration on logistics portfolio']),
          revenueOpportunities: JSON.stringify(['Cross-sell compliance APIs to mid-market retail portfolio']),
          executiveScores: JSON.stringify({ overallExecutiveRevenueScore: 82.0 })
        }
      ],
      assets: [
        {
          id: 'asset-1',
          assetType: 'OPPORTUNITY_LIBRARY',
          version: 1,
          payload: JSON.stringify({ upsellOpportunities: ['Asia-Pac logistics expansion core route optimization modules'] }),
          createdAt: new Date().toISOString()
        }
      ]
    });
  };

  const handleGenerate = async () => {
    setGenerating(true);
    showToast('Running Master Sales Graph. Chief Revenue Officer deal structure evaluations started...');
    try {
      const res = await fetch(`/api/sales/run/${businessId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const json = await res.json();
        // Load session
        const sRes = await fetch(`/api/sales/sessions/${json.sessionId}`);
        if (sRes.ok) {
          const sJson = await sRes.json();
          setSession(sJson.session);
          showToast('Sales engine analysis completed successfully.');
        }

        // Load revenue intelligence
        const riRes = await fetch(`/api/sales/revenue-intelligence/${businessId}`);
        if (riRes.ok) {
          const riJson = await riRes.json();
          setRevIntel(riJson);
        }
      } else {
        throw new Error('API failed');
      }
    } catch {
      showToast('Offline Mode. Running mock sales generator workflow...');
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
      const res = await fetch(`/api/sales/feedback/${session.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          action,
          feedbackText
        })
      });
      if (res.ok) {
        showToast(`Sales recommendation strategy ${action === 'ACCEPT' ? 'approved & synced to AI Operating Context' : 'rejected'}`);
        // Reload session
        const sRes = await fetch(`/api/sales/sessions/${session.id}`);
        if (sRes.ok) {
          const sJson = await sRes.json();
          setSession(sJson.session);
        }
      } else {
        throw new Error('API failed');
      }
    } catch {
      showToast(`Mock Feedback registered: ${action}`);
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

  const opportunities = tryParse(session?.opportunityAnalysis)?.opportunities || [];
  const dealHealths = tryParse(session?.dealQualification)?.dealHealths || [];
  const committee = tryParse(session?.buyingCommittee)?.stakeholders || [];
  const negotiation = tryParse(session?.negotiationStrategy);
  const objections = tryParse(session?.objectionHandling)?.objections || [];
  const proposals = tryParse(session?.proposalStrategy);
  const optimization = tryParse(session?.revenueOptimization);
  const forecasts = tryParse(session?.salesForecast);
  const nextActions = tryParse(session?.nextBestAction)?.actions || [];
  const playbooks = session?.playbooks || [];
  const rec = session?.recommendations?.[0];

  const benchmarks = revIntel?.benchmarks;
  const execScores = revIntel?.scores;
  const snapshots = revIntel?.snapshots || [];
  const assets = revIntel?.assets || [];

  return (
    <div style={{ minHeight: '100vh', background: '#07070d', color: '#f8fafc', fontFamily: "'Outfit', sans-serif" }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: '#10b981', color: '#fff', padding: '1rem 2rem', borderRadius: '0.5rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)', zIndex: 1000, fontWeight: 600 }}>
          {toast}
        </div>
      )}

      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', padding: '3rem 2rem 2.5rem', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', background: 'linear-gradient(to right, #6366f1, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Sales & Revenue Intelligence HUD
              </h1>
            </div>
            <p style={{ margin: 0, color: '#a5b4fc', fontSize: '1rem', fontWeight: 500 }}>
              Chief Revenue Officer layer generating negotiation playbooks, qualification logs, and persistent Revenue Intelligence.
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            style={{ background: generating ? '#4b5563' : 'linear-gradient(to right, #6366f1, #4f46e5)', border: 'none', color: '#fff', padding: '0.85rem 2rem', borderRadius: '0.5rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(99,102,241,0.35)' }}
          >
            {generating ? 'Aggregating Subgraphs...' : 'Execute Sales Engine'}
          </button>
        </div>
      </div>

      {/* Tab Menu */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#090912' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', overflowX: 'auto', padding: '0 1rem' }}>
          {[
            { id: 'overview', label: 'Executive HUD' },
            { id: 'opportunities', label: 'Deals & Opportunities' },
            { id: 'health', label: 'Deal Health' },
            { id: 'committee', label: 'Buying Committee' },
            { id: 'playbook', label: 'Sales Playbooks' },
            { id: 'negotiation', label: 'Negotiation Strategy' },
            { id: 'objections', label: 'Objection Handler' },
            { id: 'proposals', label: 'Proposal Builder' },
            { id: 'forecast', label: 'Pipeline Forecasts' },
            { id: 'insights', label: 'Revenue Optimization' },
            { id: 'revenue-intelligence', label: 'Revenue Intelligence' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              style={{
                background: 'none',
                border: 'none',
                color: activeTab === t.id ? '#818cf8' : '#94a3b8',
                borderBottom: activeTab === t.id ? '2px solid #818cf8' : 'none',
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
      <div style={{ maxWidth: '1280px', margin: '2.5rem auto', padding: '0 1rem' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', color: '#94a3b8' }}>
            Compiling Sales Engine models and pipelines...
          </div>
        ) : (
          <div>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                  {/* Overall Exec Score Card */}
                  {execScores && (
                    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '1rem', padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
                      <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'conic-gradient(#6366f1 82%, rgba(255,255,255,0.06) 0deg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, color: '#818cf8' }}>
                          {execScores.overallExecutiveRevenueScore}%
                        </div>
                      </div>
                      <div>
                        <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase' }}>Executive Score</h4>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>Revenue Security Rating</div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.15rem' }}>Reliability: {execScores.forecastReliability}%</div>
                      </div>
                    </div>
                  )}

                  {/* Revenue Benchmarks Summary Card */}
                  {benchmarks && (
                    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '1rem', padding: '2rem' }}>
                      <h4 style={{ margin: '0 0 1.25rem', fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase' }}>Revenue Benchmarks</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.5rem' }}>
                          <span style={{ color: '#94a3b8' }}>Avg Deal Size</span>
                          <span style={{ fontWeight: 700 }}>${benchmarks.averageDealSize?.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.5rem' }}>
                          <span style={{ color: '#94a3b8' }}>Avg Sales Cycle</span>
                          <span style={{ fontWeight: 700 }}>{benchmarks.averageSalesCycleDays} Days</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.5rem' }}>
                          <span style={{ color: '#94a3b8' }}>Win Rate Percent</span>
                          <span style={{ fontWeight: 700 }}>{benchmarks.averageWinRatePercent}%</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#94a3b8' }}>Pipeline Velocity</span>
                          <span style={{ fontWeight: 700, color: '#10b981' }}>${benchmarks.pipelineVelocity?.toLocaleString()}/day</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Recommendations Panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {rec ? (
                    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '1rem', padding: '2rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <span style={{ background: '#818cf8', color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 800 }}>PENDING STRATEGY AUDIT</span>
                        <span style={{ fontSize: '0.9rem', color: '#10b981', fontWeight: 700 }}>{rec.expectedCloseProb}% Close Prob</span>
                      </div>
                      <h3 style={{ margin: '0 0 0.5rem', color: '#818cf8' }}>{rec.title}</h3>
                      <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '1rem' }}>Target: {rec.opportunityName}</div>
                      <div style={{ fontSize: '0.95rem', color: '#94a3b8', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '0.5rem', fontStyle: 'italic', marginBottom: '1.5rem' }}>
                        "Next Best Action: {rec.nextBestAction}"
                      </div>

                      {rec.status === 'PENDING' && (
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem', display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                          <textarea
                            placeholder="Add strategic adjustments or feedback..."
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                            style={{ width: '100%', height: '80px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.5rem', padding: '0.75rem', color: '#fff', fontSize: '0.9rem' }}
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
                  ) : (
                    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '1rem', padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                      No recommendation active. Execute Sales Engine to evaluate deal pipeline.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Opportunities Tab */}
            {activeTab === 'opportunities' && (
              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '1rem', padding: '2rem' }}>
                <h3 style={{ margin: '0 0 1.5rem', color: '#818cf8' }}>Active Pipeline Deals & Opportunity Twins</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {opportunities.map((o: any, idx: number) => (
                    <div key={idx} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', padding: '1.75rem', borderRadius: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                        <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>{o.opportunityName}</h4>
                        <span style={{ background: 'rgba(16,185,129,0.15)', color: '#6ee7b7', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 700 }}>
                          Potential: ${o.revenuePotential?.toLocaleString()}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '1.25rem' }}>Value Narrative: {o.businessValue}</div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.25rem' }}>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Strategic Importance</div>
                          <div style={{ fontWeight: 700, marginTop: '0.15rem', color: '#818cf8' }}>{o.strategicImportance}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Expansion / Cross-sell Options</div>
                          <div style={{ fontWeight: 600, marginTop: '0.15rem' }}>{o.crossSellOpportunity || 'None'}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Competitive Risks</div>
                          <div style={{ fontWeight: 600, marginTop: '0.15rem', color: '#f87171' }}>{o.competitiveRisk || 'None'}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {opportunities.length === 0 && (
                    <div style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center' }}>No active opportunities. Execute the Sales Engine to build opportunity twins.</div>
                  )}
                </div>
              </div>
            )}

            {/* Health Tab */}
            {activeTab === 'health' && (
              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '1rem', padding: '2rem' }}>
                <h3 style={{ margin: '0 0 1.5rem', color: '#818cf8' }}>Deal Health Qualification Radar</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {dealHealths.map((h: any, idx: number) => (
                    <div key={idx} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', padding: '1.75rem', borderRadius: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                        <h4 style={{ margin: 0, fontWeight: 700 }}>{h.opportunityName}</h4>
                        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#818cf8' }}>Health Index: {h.overallHealthScore}%</span>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        {[
                          { label: 'Need Score', val: h.needScore },
                          { label: 'Authority Score', val: h.authorityScore },
                          { label: 'Budget Score', val: h.budgetScore },
                          { label: 'Timeline Score', val: h.timelineScore },
                          { label: 'Urgency Score', val: h.urgencyScore },
                          { label: 'Competitive Pos', val: h.competitivePosition },
                          { label: 'Relationship Strength', val: h.relationshipStrength },
                          { label: 'Buying Signals', val: h.buyingSignals }
                        ].map((m) => (
                          <div key={m.label} style={{ background: 'rgba(0,0,0,0.15)', padding: '0.85rem', borderRadius: '0.5rem' }}>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>{m.label}</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{m.val}%</div>
                          </div>
                        ))}
                      </div>

                      <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                        <strong>Qualification Rationale:</strong> {h.explainability}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Committee Tab */}
            {activeTab === 'committee' && (
              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '1rem', padding: '2rem' }}>
                <h3 style={{ margin: '0 0 1.5rem', color: '#818cf8' }}>Buying Committee Stakeholder Matrix</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {committee.map((c: any, idx: number) => (
                    <div key={idx} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', padding: '1.75rem', borderRadius: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                        <div>
                          <h4 style={{ margin: 0, fontWeight: 700, fontSize: '1.15rem' }}>{c.name}</h4>
                          <span style={{ fontSize: '0.85rem', color: '#818cf8' }}>Role: {c.role}</span>
                        </div>
                        <div style={{ textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 800, background: 'rgba(129,140,248,0.15)', color: '#818cf8', padding: '0.25rem 0.60rem', borderRadius: '0.25rem' }}>
                          Influence: {c.influenceLevel}
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.25rem' }}>
                        <div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Objections / Concerns</div>
                          <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
                            {c.objections?.map((o: string, i: number) => (
                              <li key={i}>{o}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Motivations / Drivers</div>
                          <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
                            {c.motivations?.map((m: string, i: number) => (
                              <li key={i}>{m}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Communication Style preference</div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>{c.preferredCommunicationStyle}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Recommended Strategy</div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#10b981' }}>{c.recommendedSalesStrategy}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Playbook Tab */}
            {activeTab === 'playbook' && (
              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '1rem', padding: '2rem' }}>
                <h3 style={{ margin: '0 0 1.5rem', color: '#818cf8' }}>CRO Guided Sales Playbooks</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {playbooks.map((p: any, idx: number) => (
                    <div key={idx} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', padding: '1.75rem', borderRadius: '0.75rem' }}>
                      <h4 style={{ margin: '0 0 0.5rem', color: '#818cf8', fontWeight: 800 }}>{p.name}</h4>
                      <div style={{ fontSize: '0.85rem', color: '#a5b4fc', marginBottom: '1.25rem' }}>Trigger condition: {p.triggerCondition}</div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.5rem' }}>Recommended Step-by-Step Plays</div>
                          <ol style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.9rem', color: '#cbd5e1' }}>
                            {tryParse(p.recommendedSteps, []).map((step: string, i: number) => (
                              <li key={i} style={{ marginBottom: '0.4rem' }}>{step}</li>
                            ))}
                          </ol>
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.5rem' }}>Play rules</div>
                          <div style={{ fontSize: '0.85rem', color: '#94a3b8', background: 'rgba(0,0,0,0.15)', padding: '1rem', borderRadius: '0.5rem' }}>
                            {p.playRules}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Negotiation Tab */}
            {activeTab === 'negotiation' && negotiation && (
              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '1rem', padding: '2rem' }}>
                <h3 style={{ margin: '0 0 1.5rem', color: '#818cf8' }}>Negotiation Parameters & Concessions</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                  <div>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Pricing Flexibility policy</label>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.25rem' }}>{negotiation.pricingFlexibility}</div>
                    </div>
                    
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Active Win Strategy</label>
                      <div style={{ fontSize: '0.9rem', color: '#cbd5e1', marginTop: '0.25rem' }}>{negotiation.winStrategy}</div>
                    </div>
                  </div>
                  
                  <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', padding: '1.5rem', borderRadius: '0.5rem' }}>
                    <label style={{ fontSize: '0.75rem', color: '#fca5a5', fontWeight: 700, textTransform: 'uppercase' }}>Walk-away Conditions</label>
                    <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#fca5a5' }}>
                      {negotiation.walkAwayConditions?.map((c: string, i: number) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Approved Negotiation objectives</label>
                    <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
                      {negotiation.negotiationObjectives?.map((obj: string, i: number) => (
                        <li key={i}>{obj}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Planned Concessions checklist</label>
                    <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
                      {negotiation.concessions?.map((conc: string, i: number) => (
                        <li key={i}>{conc}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Objections Tab */}
            {activeTab === 'objections' && (
              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '1rem', padding: '2rem' }}>
                <h3 style={{ margin: '0 0 1.5rem', color: '#818cf8' }}>Objections Script Library</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {objections.map((o: any, idx: number) => (
                    <div key={idx} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', padding: '1.5rem', borderRadius: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#ef4444' }}>Objection: {o.objection}</span>
                        <span style={{ textTransform: 'uppercase', fontSize: '0.75rem', color: '#818cf8', fontWeight: 700 }}>Category: {o.category}</span>
                      </div>
                      
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Recommended script response</div>
                        <div style={{ fontSize: '0.9rem', color: '#cbd5e1', marginTop: '0.2rem' }}>{o.recommendedResponse}</div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '0.75rem' }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Supporting Evidence</span>
                          <p style={{ margin: '0.15rem 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>{o.supportingEvidence}</p>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Financial Business Case</span>
                          <p style={{ margin: '0.15rem 0 0', fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>{o.businessCase}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Proposal Tab */}
            {activeTab === 'proposals' && proposals && (
              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '1rem', padding: '2rem' }}>
                <h3 style={{ margin: '0 0 1.5rem', color: '#818cf8' }}>Proposal Narrative & ROI builder</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                  <div>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Value Narrative sequence</label>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.25rem' }}>{proposals.valueNarrative}</div>
                    </div>
                    
                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Expected ROI Story</label>
                      <div style={{ fontSize: '0.9rem', color: '#cbd5e1', marginTop: '0.25rem' }}>{proposals.roiStory}</div>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Case study suggestions</label>
                    <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
                      {proposals.caseStudySuggestions?.map((s: string, i: number) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Key Proof points</label>
                    <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
                      {proposals.proofPoints?.map((p: string, i: number) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Success metrics agreement</label>
                    <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
                      {proposals.successMetrics?.map((m: string, i: number) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Forecasts Tab */}
            {activeTab === 'forecast' && forecasts && (
              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '1rem', padding: '2rem' }}>
                <h3 style={{ margin: '0 0 1.5rem', color: '#818cf8' }}>Revenue Pipeline forecasts</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '0.5rem' }}>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Expected Case Revenue</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#818cf8' }}>${forecasts.expectedCase?.toLocaleString()}</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '0.5rem' }}>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Best Case Target</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981' }}>${forecasts.bestCase?.toLocaleString()}</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '0.5rem' }}>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Worst Case Floor</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ef4444' }}>${forecasts.worstCase?.toLocaleString()}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Expected pipeline value</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>${forecasts.pipelineValue?.toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Forecast Confidence Index</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fbbf24' }}>{forecasts.forecastConfidence}%</div>
                  </div>
                </div>
              </div>
            )}

            {/* Insights Tab */}
            {activeTab === 'insights' && optimization && (
              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '1rem', padding: '2rem' }}>
                <h3 style={{ margin: '0 0 1.5rem', color: '#818cf8' }}>Upsell & Renewal expansion insights</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <span style={{ fontWeight: 700, color: '#cbd5e1' }}>Upsell opportunities catalog</span>
                      <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                        {optimization.upsellOpportunities?.map((o: string, i: number) => (
                          <li key={i} style={{ marginBottom: '0.25rem' }}>{o}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span style={{ fontWeight: 700, color: '#cbd5e1' }}>Cross-sell pathways</span>
                      <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                        {optimization.crossSellOpportunities?.map((c: string, i: number) => (
                          <li key={i} style={{ marginBottom: '0.25rem' }}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <span style={{ fontWeight: 700, color: '#cbd5e1' }}>Bundle configurations</span>
                      <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                        {optimization.bundleOpportunities?.map((b: string, i: number) => (
                          <li key={i} style={{ marginBottom: '0.25rem' }}>{b}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span style={{ fontWeight: 700, color: '#ef4444' }}>Identified churn risks</span>
                      <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#fca5a5' }}>
                        {optimization.revenueRisks?.map((r: string, i: number) => (
                          <li key={i} style={{ marginBottom: '0.25rem' }}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Revenue Intelligence Tab */}
            {activeTab === 'revenue-intelligence' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Snapshots log */}
                <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '1rem', padding: '2rem' }}>
                  <h3 style={{ margin: '0 0 1.25rem', color: '#818cf8' }}>Immutable Performance snapshots</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {snapshots.map((snap: any, idx: number) => {
                      const summary = tryParse(snap.pipelineSummary);
                      const fcast = tryParse(snap.revenueForecast);
                      const health = tryParse(snap.dealHealthDistribution);
                      return (
                        <div key={idx} style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 700, color: '#f8fafc' }}>Snapshot version {snap.version}</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>Captured: {new Date(snap.createdAt).toLocaleString()}</div>
                          </div>
                          <div style={{ display: 'flex', gap: '2rem', textAlign: 'right' }}>
                            <div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Total pipeline</div>
                              <div style={{ fontWeight: 700 }}>${summary.totalPipelineValue?.toLocaleString()}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Forecasted Revenue</div>
                              <div style={{ fontWeight: 700, color: '#10b981' }}>${fcast.expectedRevenue?.toLocaleString()}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Avg deal health</div>
                              <div style={{ fontWeight: 700, color: '#818cf8' }}>{health.averageHealthScore}%</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Assets library */}
                <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '1rem', padding: '2rem' }}>
                  <h3 style={{ margin: '0 0 1.25rem', color: '#818cf8' }}>Active reusable Revenue Assets</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {assets.map((asset: any, idx: number) => {
                      const payload = tryParse(asset.payload);
                      return (
                        <div key={idx} style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '0.5rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'center' }}>
                            <span style={{ fontWeight: 800, color: '#818cf8' }}>{asset.assetType}</span>
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Version: {asset.version}</span>
                          </div>
                          <pre style={{ margin: 0, padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '0.25rem', overflowX: 'auto', fontSize: '0.8rem', color: '#a5b4fc' }}>
                            {JSON.stringify(payload, null, 2)}
                          </pre>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
