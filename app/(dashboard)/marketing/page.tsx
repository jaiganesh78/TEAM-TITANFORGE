'use client';
import { useState, useEffect } from 'react';

export default function MarketingWorkspacePage() {
  const [businessId, setBusinessId] = useState<string>('default-biz-id');
  const [readiness, setReadiness] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'audience' | 'channels' | 'campaigns' | 'budgets' | 'content' | 'calendar' | 'risks' | 'recommendations'>('overview');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Load readiness first
        const rRes = await fetch(`/api/growth/readiness/${businessId}/marketing-engine`);
        if (rRes.ok) {
          const rJson = await rRes.json();
          setReadiness(rJson.data);
        }

        // Load latest session if any
        const sRes = await fetch(`/api/marketing/session/${businessId}`);
        if (sRes.ok) {
          const sJson = await sRes.json();
          setSession(sJson.data);
        }

        // Load history logs
        const hRes = await fetch(`/api/marketing/history/${businessId}`);
        if (hRes.ok) {
          const hJson = await hRes.json();
          setHistory(hJson.data);
        }
      } catch (err) {
        console.warn('Failed to fetch marketing workspace APIs. Entering mock dashboard mode.');
        setupMockData();
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [businessId]);

  const setupMockData = () => {
    setReadiness({
      readinessScore: 90,
      canExecute: true,
      coverageScore: 92,
      knowledgeScore: 88,
      confidenceScore: 95
    });

    setSession({
      id: 'marketing-mock-session-id',
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
      executiveScores: JSON.stringify({
        marketingReadiness: 90.0,
        brandReadiness: 85.0,
        channelReadiness: 88.0,
        campaignReadiness: 80.0,
        creativeReadiness: 92.0,
        audienceReadiness: 95.0,
        overallMarketingScore: 88.0
      }),
      audienceAnalysis: JSON.stringify({
        primaryAudience: 'SaaS Business Founders & VP Growth',
        secondaryAudience: 'Growth Marketing Managers & Operations Leads',
        buyingMotivations: ['Predictable pipeline scaling', 'Continuous commercial gap discovery', 'Unified GDT visibility'],
        painPoints: ['High CAC saturation', 'Siloed marketing channels', 'No multi-engine alignment'],
        buyingBarriers: ['Implementation runway overhead', 'Data security concerns', 'Budget lock restrictions'],
        preferredChannels: ['LinkedIn', 'SEO', 'Email Marketing', 'B2B Newsletters'],
        decisionDrivers: ['Expected ROI metrics', 'Deterministic RAG lineage proof', 'Integration ease'],
        confidence: 92.0,
        evidence: 'Segment analysis of uploaded SaaS growth roadmap indicates high founder buying intent for automation.'
      }),
      customerJourney: JSON.stringify({
        awareness: {
          objectives: ['Acquire prospects attention', 'Highlight CRM inefficiencies'],
          painPoints: ['CAC is rising globally', 'Lead lists are low intent'],
          recommendedChannels: ['LinkedIn Organic', 'B2B Podcasts'],
          recommendedContent: ['Interactive KPI Audit Templates', 'CMO Guide to Growth OS'],
          expectedKPIs: ['CTR', 'CPM', 'Impression Share'],
          risks: ['Ad fatigue', 'Channel saturation'],
          opportunities: ['Co-branding templates with niche partners']
        },
        interest: {
          objectives: ['Nurture with case studies'],
          painPoints: ['Evaluation fatigue'],
          recommendedChannels: ['Retargeting Ads', 'Blog articles'],
          recommendedContent: ['Success case study logs'],
          expectedKPIs: ['Session duration', 'Pages visited'],
          risks: ['High dropoffs on long articles'],
          opportunities: ['Interactive video tours']
        },
        consideration: {
          objectives: ['Provide interactive calculators'],
          painPoints: ['ROI uncertainty'],
          recommendedChannels: ['Email sequences', 'Webinars'],
          recommendedContent: ['Interactive ROI spreadsheet model'],
          expectedKPIs: ['Calculator submissions'],
          risks: ['Complex steps drop-offs'],
          opportunities: ['1-on-1 demo scheduling']
        },
        purchase: {
          objectives: ['Frictionless checkout'],
          painPoints: ['Contract onboarding locks'],
          recommendedChannels: ['Direct sales', 'Stripe checkout page'],
          recommendedContent: ['Setup guides'],
          expectedKPIs: ['Paying subscribers'],
          risks: ['Payment processing errors'],
          opportunities: ['Quarterly promo tiers']
        },
        onboarding: { objectives: [], painPoints: [], recommendedChannels: [], recommendedContent: [], expectedKPIs: [], risks: [], opportunities: [] },
        retention: { objectives: [], painPoints: [], recommendedChannels: [], recommendedContent: [], expectedKPIs: [], risks: [], opportunities: [] },
        advocacy: { objectives: [], painPoints: [], recommendedChannels: [], recommendedContent: [], expectedKPIs: [], risks: [], opportunities: [] }
      }),
      funnelAnalysis: JSON.stringify({
        tofu: { objectives: ['Brand awareness expansion', 'Impression velocity'], kpis: ['CTR', 'Traffic'] },
        mofu: { objectives: ['Lead capturing', 'Demo registrations'], kpis: ['Conversion rate', 'Opt-ins'] },
        bofu: { objectives: ['Closing accounts', 'Migrating seats'], kpis: ['CAC', 'New trials count'] },
        conversionPoints: ['Pricing page CTA click', 'Interactive ROI Calculator submission'],
        dropOffRisks: ['Pricing opacity', 'Too many fields in signup form'],
        leadQualityExpectations: ['MQL to SQL ratio of 40%+', 'LTV estimation above $3,000'],
        kpis: ['LTV:CAC', 'Payback Period']
      }),
      creativeStrategy: JSON.stringify({
        messagingThemes: ['Scale predictable SaaS pipelines', 'Say goodbye to fragmented CRM analytics'],
        toneOfVoice: 'Authoritative, analytical, direct, premium-grade consultative',
        creativeAngles: ['CMO dashboard side-by-side comparison', 'ROI calculator screenshot interactive visual'],
        visualDirection: 'Sleek dark mode interfaces, neon highlight borders, clean data charts',
        campaignHooks: ['Stop guessing your LTV paybacks.', 'Your BDT has gaps. Fix them inside 14 days.'],
        offerStrategy: 'Free Growth Readiness Audit report',
        ctaStrategy: 'Build your growth twin free'
      }),
      channelReadiness: JSON.stringify({
        channels: [
          {
            channelName: 'LinkedIn Ads',
            priority: 'HIGH',
            expectedROI: '3.5x',
            difficulty: 'MEDIUM',
            requiredBudget: 5000,
            expectedLeads: 45,
            supportingEvidence: 'LinkedIn displays SaaS buyer profile concentration above 70%.',
            confidence: 88.0,
            readinessScore: 95.0,
            readinessReason: 'LinkedIn Pixel installed, target list matching upload ready.'
          },
          {
            channelName: 'SEO & Content',
            priority: 'HIGH',
            expectedROI: '5.2x',
            difficulty: 'HIGH',
            requiredBudget: 3000,
            expectedLeads: 60,
            supportingEvidence: 'Keyword list research confirms high intent search volume for B2B dashboards.',
            confidence: 90.0,
            readinessScore: 85.0,
            readinessReason: 'Sitemap indexing complete, initial content topics outline drafted.'
          }
        ]
      }),
      campaigns: [
        {
          id: 'camp-mock-id',
          name: 'Predictable SaaS scaling LinkedIn Lead Gen',
          objective: 'MQL demographic pipeline acquisition',
          targetAudience: 'SaaS Founders & Operations Leads',
          channel: 'LinkedIn Ads',
          coreMessage: 'Scale predictable SaaS pipelines with continuous automated strategy.',
          offer: 'Free Growth Twin Readiness Audit Report',
          callToAction: 'Generate Audit Report',
          expectedKpis: '["CPA under $120", "Sales Qualified Leads count > 20"]',
          duration: '30 days',
          estimatedBudget: 4000.0,
          expectedROI: '3.8x',
          dependencies: ['Stripe pricing setup configurations', 'Landing page setup'],
          priority: 'HIGH',
          journeyStage: 'Consideration',
          funnelStage: 'MOFU'
        }
      ],
      budgetOptimizer: JSON.stringify({
        budgets: [
          {
            category: 'Paid Ads',
            minAmount: 3000,
            recommendedAmount: 6000,
            aggressiveAmount: 12000,
            reasoning: 'LinkedIn CPC bids require higher recommended volume floor to reach stat significance.'
          },
          {
            category: 'SEO & Content',
            minAmount: 1500,
            recommendedAmount: 3000,
            aggressiveAmount: 6000,
            reasoning: 'Hiring quality content writers requires a standard retainer for backlink placements.'
          }
        ],
        sensitivityAnalysis: 'A 20% drop in CPC increases ROI to 4.5x, while a 20% increase drops ROI to 2.8x.',
        breakEvenPoint: 'Acquiring 4 enterprise clients pays back the aggregate Aggressive spend tier.'
      }),
      experimentPortfolio: JSON.stringify({
        experiments: [
          {
            hypothesis: 'Interactive ROI calculator landing page increases signup conversion by 30% relative to standard copy page.',
            expectedKPI: 'conversionRate',
            duration: '21 days',
            successCriteria: 'P-value < 0.05 with minimum 500 visitors per variant.',
            requiredBudget: 800.0,
            confidence: 85.0,
            businessRisk: 'Slight brand mismatch if copy is too aggressive.',
            dependencies: ['Vercel split analytics setup'],
            priority: 'MEDIUM',
            status: 'PENDING'
          }
        ]
      }),
      contentPlan: JSON.stringify({
        contentPillars: ['Predictable Pipelines', 'Automated Strategy', 'KPI Benchmarking'],
        brandThemes: ['Consultative strategy accuracy', 'Deterministic facts versus assumptions'],
        educationalTopics: ['How to calculate LTV payload payloads', 'Why static business templates fail'],
        authorityTopics: ['SaaS benchmark averages 2026', 'CMO Strategy guides'],
        conversionContent: ['ROI calculator checklist', 'Interactive twin setups'],
        retentionContent: ['Expansion seat upgrades guides', 'Product release logs'],
        seasonalCampaignIdeas: ['End of fiscal year SaaS audit checkups']
      }),
      calendar: JSON.stringify({
        calendar: [
          {
            timeFrame: 'WEEKLY',
            label: 'Week 1',
            activities: ['Draft LinkedIn ad copies', 'Set up Vercel tracking routes'],
            dependencies: ['Stripe billing config approvals']
          },
          {
            timeFrame: 'MONTHLY',
            label: 'Month 1',
            activities: ['Publish 4 educational content articles', 'Launch paid LinkedIn ads campaign'],
            dependencies: []
          }
        ]
      }),
      recommendations: [
        {
          id: 'rec-mock-id',
          title: 'Implement Multi-Tier Acquisition Funnel for Mid-Market',
          problem: 'High customer churn in low-tier plans is slowing net revenue expansion.',
          opportunity: 'Focus inbound content on mid-market profiles wanting seat-based licensing plans.',
          evidence: 'Digital twin model segments outline 3x higher retention on mid-market tiers.',
          affectedKpis: ['churn', 'ltv', 'mrr'],
          expectedROI: 4.5,
          expectedLeads: 80,
          budget: 5000,
          timeline: '45 days',
          priority: 'HIGH',
          confidence: 90.0,
          dependencies: ['Update mid-market pricing configurations'],
          alternativeApproaches: ['Increase direct outbound cold calling lists']
        }
      ]
    });
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      const res = await fetch('/api/marketing/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId })
      });
      if (res.ok) {
        const json = await res.json();
        setSession(json.data);
        showToast('CMO Marketing Strategy generated successfully!');
      } else {
        showToast('Generation failed. Keep using mockup view.');
      }
    } catch {
      showToast('API issue detected. Kept mock data active.');
    } finally {
      setGenerating(false);
    }
  };

  const handleReviewAction = async (campaignId: string, action: 'ACCEPT' | 'REJECT' | 'REGENERATE') => {
    try {
      const res = await fetch('/api/marketing/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, campaignId, action, feedbackText })
      });
      if (res.ok) {
        showToast(`Campaign successfully marked as ${action}!`);
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
        Loading marketing workspace...
      </div>
    );
  }

  // Parse details
  const scores = session?.executiveScores ? JSON.parse(session.executiveScores) : null;
  const audience = session?.audienceAnalysis ? JSON.parse(session.audienceAnalysis) : null;
  const journey = session?.customerJourney ? JSON.parse(session.customerJourney) : null;
  const funnel = session?.funnelAnalysis ? JSON.parse(session.funnelAnalysis) : null;
  const creative = session?.creativeStrategy ? JSON.parse(session.creativeStrategy) : null;
  const channels = session?.channelReadiness ? JSON.parse(session.channelReadiness) : null;
  const campaigns = session?.campaigns || [];
  const budgets = session?.budgetOptimizer ? JSON.parse(session.budgetOptimizer) : null;
  const experiments = session?.experimentPortfolio ? JSON.parse(session.experimentPortfolio) : null;
  const content = session?.contentPlan ? JSON.parse(session.contentPlan) : null;
  const calendar = session?.calendar ? JSON.parse(session.calendar) : null;
  const recommendations = session?.recommendations || [];

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
            Marketing Strategy HUD
          </h1>
          <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            Approved CMO campaigns, budgets, customer journey maps, and content plans
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)', border: 'none', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: 700, cursor: 'pointer', opacity: generating ? 0.6 : 1 }}
        >
          {generating ? 'Running Marketing Graph...' : 'Generate Marketing Plan'}
        </button>
      </div>

      {/* Scorecards HUD */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Overall CMO Score', val: scores?.overallMarketingScore || 88, color: '#10b981' },
          { label: 'Marketing Readiness', val: scores?.marketingReadiness || 90, color: '#6366f1' },
          { label: 'Brand Readiness', val: scores?.brandReadiness || 85, color: '#818cf8' },
          { label: 'Channel Readiness', val: scores?.channelReadiness || 88, color: '#f59e0b' },
          { label: 'Campaign Readiness', val: scores?.campaignReadiness || 80, color: '#ef4444' },
          { label: 'Creative Readiness', val: scores?.creativeReadiness || 92, color: '#10b981' },
          { label: 'Audience Readiness', val: scores?.audienceReadiness || 95, color: '#a5b4fc' }
        ].map((item, i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.5rem', padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', height: '30px' }}>{item.label}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: item.color, marginTop: '0.25rem' }}>{item.val}%</div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem' }}>
        {/* Navigation Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button onClick={() => setActiveTab('overview')} style={{ padding: '0.75rem 1rem', background: activeTab === 'overview' ? 'rgba(99,102,241,0.15)' : 'transparent', border: 'none', borderRadius: '0.375rem', color: activeTab === 'overview' ? '#a5b4fc' : '#94a3b8', textAlign: 'left', fontWeight: 600, cursor: 'pointer' }}>
            Customer Journey Map
          </button>
          <button onClick={() => setActiveTab('audience')} style={{ padding: '0.75rem 1rem', background: activeTab === 'audience' ? 'rgba(99,102,241,0.15)' : 'transparent', border: 'none', borderRadius: '0.375rem', color: activeTab === 'audience' ? '#a5b4fc' : '#94a3b8', textAlign: 'left', fontWeight: 600, cursor: 'pointer' }}>
            Audience & Personas
          </button>
          <button onClick={() => setActiveTab('channels')} style={{ padding: '0.75rem 1rem', background: activeTab === 'channels' ? 'rgba(99,102,241,0.15)' : 'transparent', border: 'none', borderRadius: '0.375rem', color: activeTab === 'channels' ? '#a5b4fc' : '#94a3b8', textAlign: 'left', fontWeight: 600, cursor: 'pointer' }}>
            Channel Readiness
          </button>
          <button onClick={() => setActiveTab('campaigns')} style={{ padding: '0.75rem 1rem', background: activeTab === 'campaigns' ? 'rgba(99,102,241,0.15)' : 'transparent', border: 'none', borderRadius: '0.375rem', color: activeTab === 'campaigns' ? '#a5b4fc' : '#94a3b8', textAlign: 'left', fontWeight: 600, cursor: 'pointer' }}>
            Campaign Planner
          </button>
          <button onClick={() => setActiveTab('budgets')} style={{ padding: '0.75rem 1rem', background: activeTab === 'budgets' ? 'rgba(99,102,241,0.15)' : 'transparent', border: 'none', borderRadius: '0.375rem', color: activeTab === 'budgets' ? '#a5b4fc' : '#94a3b8', textAlign: 'left', fontWeight: 600, cursor: 'pointer' }}>
            Budget Optimizer
          </button>
          <button onClick={() => setActiveTab('content')} style={{ padding: '0.75rem 1rem', background: activeTab === 'content' ? 'rgba(99,102,241,0.15)' : 'transparent', border: 'none', borderRadius: '0.375rem', color: activeTab === 'content' ? '#a5b4fc' : '#94a3b8', textAlign: 'left', fontWeight: 600, cursor: 'pointer' }}>
            Content Pillars
          </button>
          <button onClick={() => setActiveTab('calendar')} style={{ padding: '0.75rem 1rem', background: activeTab === 'calendar' ? 'rgba(99,102,241,0.15)' : 'transparent', border: 'none', borderRadius: '0.375rem', color: activeTab === 'calendar' ? '#a5b4fc' : '#94a3b8', textAlign: 'left', fontWeight: 600, cursor: 'pointer' }}>
            Marketing Calendar
          </button>
          <button onClick={() => setActiveTab('risks')} style={{ padding: '0.75rem 1rem', background: activeTab === 'risks' ? 'rgba(99,102,241,0.15)' : 'transparent', border: 'none', borderRadius: '0.375rem', color: activeTab === 'risks' ? '#a5b4fc' : '#94a3b8', textAlign: 'left', fontWeight: 600, cursor: 'pointer' }}>
            Marketing Risks
          </button>
          <button onClick={() => setActiveTab('recommendations')} style={{ padding: '0.75rem 1rem', background: activeTab === 'recommendations' ? 'rgba(99,102,241,0.15)' : 'transparent', border: 'none', borderRadius: '0.375rem', color: activeTab === 'recommendations' ? '#a5b4fc' : '#94a3b8', textAlign: 'left', fontWeight: 600, cursor: 'pointer' }}>
            Recommendations Review
          </button>
        </div>

        {/* Content Workspace Panel */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '1rem', padding: '2rem', minHeight: '500px' }}>
          {/* TAB 1: CUSTOMER JOURNEY */}
          {activeTab === 'overview' && (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: 0, marginBottom: '1.5rem' }}>Seven-Stage Customer Journey Map</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {journey && Object.keys(journey).map((stage, i) => {
                  const data = journey[stage];
                  if (!data.objectives || data.objectives.length === 0) return null;
                  return (
                    <div key={i} style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.75rem' }}>
                      <h4 style={{ textTransform: 'uppercase', margin: '0 0 0.5rem', color: '#818cf8', fontSize: '0.95rem' }}>Stage: {stage}</h4>
                      <div style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div><strong>Objectives:</strong> {data.objectives.join(', ')}</div>
                        <div><strong>Pain Points:</strong> {data.painPoints.join(', ')}</div>
                        <div><strong>Channels:</strong> {data.recommendedChannels.join(', ')}</div>
                        <div><strong>Content:</strong> {data.recommendedContent.join(', ')}</div>
                        <div><strong>Expected KPIs:</strong> {data.expectedKPIs.join(', ')}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: AUDIENCE & PERSONAS */}
          {activeTab === 'audience' && (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: 0, marginBottom: '1.5rem' }}>Audience Profiles & Persona Library</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.75rem', padding: '1.25rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem', color: '#a5b4fc' }}>Primary Audience Segment</h4>
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>{audience?.primaryAudience}</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.75rem', padding: '1.25rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem', color: '#a5b4fc' }}>Secondary Audience Segment</h4>
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>{audience?.secondaryAudience}</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.75rem', padding: '1.25rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem', color: '#a5b4fc' }}>Key Motivations & Drivers</h4>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem' }}>
                    {(audience?.buyingMotivations || []).map((m: string, idx: number) => <li key={idx}>{m}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CHANNEL READINESS */}
          {activeTab === 'channels' && (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: 0, marginBottom: '1.5rem' }}>Channel Evaluation & Asset Readiness</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {(channels?.channels || []).map((c: any, i: number) => (
                  <div key={i} style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: 0, color: '#a5b4fc' }}>{c.channelName}</h4>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: c.readinessScore > 90 ? '#10b981' : '#f59e0b' }}>
                        Readiness: {c.readinessScore}%
                      </span>
                    </div>
                    <p style={{ margin: '0.5rem 0', fontSize: '0.85rem', color: '#cbd5e1' }}>Reason: {c.readinessReason}</p>
                    <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                      <div>Expected ROI: <strong>{c.expectedROI}</strong></div>
                      <div>Required Budget: <strong>${c.requiredBudget}</strong></div>
                      <div>Expected Leads: <strong>{c.expectedLeads}</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CAMPAIGN PLANNER */}
          {activeTab === 'campaigns' && (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: 0, marginBottom: '1.5rem' }}>Campaign Strategy Planner</h2>
              {campaigns.map((camp: any, idx: number) => (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#818cf8' }}>{camp.name}</h3>
                    <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '999px', background: 'rgba(99,102,241,0.2)', color: '#818cf8', fontWeight: 700 }}>
                      {camp.priority}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '1rem' }}>
                    <div><strong>Objective:</strong> {camp.objective}</div>
                    <div><strong>Channel:</strong> {camp.channel}</div>
                    <div><strong>Core Message:</strong> {camp.coreMessage}</div>
                    <div><strong>Offer & CTA:</strong> {camp.offer} — {camp.callToAction}</div>
                    <div><strong>Journey/Funnel Stage:</strong> {camp.journeyStage} / {camp.funnelStage}</div>
                    <div><strong>Estimated Budget / ROI:</strong> ${camp.estimatedBudget} / {camp.expectedROI}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handleReviewAction(camp.id, 'ACCEPT')} style={{ padding: '0.35rem 0.75rem', background: '#10b981', border: 'none', borderRadius: '0.25rem', color: '#fff', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
                      Approve Campaign
                    </button>
                    <button onClick={() => handleReviewAction(camp.id, 'REJECT')} style={{ padding: '0.35rem 0.75rem', background: '#ef4444', border: 'none', borderRadius: '0.25rem', color: '#fff', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 5: BUDGET OPTIMIZER */}
          {activeTab === 'budgets' && (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: 0, marginBottom: '1.5rem' }}>Multi-Tier Budget Optimizer</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>
                {(budgets?.budgets || []).map((b: any, i: number) => (
                  <div key={i} style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.75rem' }}>
                    <h4 style={{ margin: '0 0 0.5rem', color: '#a5b4fc' }}>Category: {b.category}</h4>
                    <div style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                      <div>Min: <strong style={{ color: '#ef4444' }}>${b.minAmount}</strong></div>
                      <div>Recommended: <strong style={{ color: '#6366f1' }}>${b.recommendedAmount}</strong></div>
                      <div>Aggressive: <strong style={{ color: '#10b981' }}>${b.aggressiveAmount}</strong></div>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Reasoning: {b.reasoning}</p>
                  </div>
                ))}
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.75rem', padding: '1.25rem' }}>
                <h4 style={{ margin: '0 0 0.5rem', color: '#f59e0b' }}>Sensitivity Analysis & Break Even</h4>
                <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem' }}>{budgets?.sensitivityAnalysis}</p>
                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700 }}>Break-even: {budgets?.breakEvenPoint}</p>
              </div>
            </div>
          )}

          {/* TAB 6: CONTENT PILLARS */}
          {activeTab === 'content' && (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: 0, marginBottom: '1.5rem' }}>✍️ Content Strategy & Pillars</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.75rem', padding: '1.25rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem', color: '#a5b4fc' }}>Content Pillars</h4>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {(content?.contentPillars || []).map((p: string, idx: number) => (
                      <span key={idx} style={{ padding: '0.25rem 0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.25rem', fontSize: '0.8rem' }}>{p}</span>
                    ))}
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.75rem', padding: '1.25rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem', color: '#a5b4fc' }}>Authority & Educational Topics</h4>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem' }}>
                    {(content?.educationalTopics || []).map((topic: string, i: number) => <li key={i}>{topic}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: CALENDAR */}
          {activeTab === 'calendar' && (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: 0, marginBottom: '1.5rem' }}>Marketing execution calendar</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {(calendar?.calendar || []).map((item: any, i: number) => (
                  <div key={i} style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.75rem' }}>
                    <h4 style={{ margin: '0 0 0.5rem', color: '#818cf8' }}>{item.label} ({item.timeFrame})</h4>
                    <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem' }}>
                      {item.activities?.map((act: string, idx: number) => <li key={idx}>{act}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: RISKS */}
          {activeTab === 'risks' && (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: 0, marginBottom: '1.5rem' }}>⚠️ Marketing Risks</h2>
              <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '0.75rem', padding: '1.25rem' }}>
                <h4 style={{ color: '#ef4444', margin: '0 0 0.5rem' }}>Brand & Execution Risks</h4>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
                  <li>Ad budget dissipation risk due to fast CPC bidding spikes on LinkedIn.</li>
                  <li>Inability to trace landing page pixel triggers under target analytics parameters.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 9: RECOMMENDATIONS */}
          {activeTab === 'recommendations' && (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: 0, marginBottom: '1.5rem' }}>CMO Strategy Recommendations</h2>
              {recommendations.map((rec: any, i: number) => (
                <div key={i} style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.75rem', marginBottom: '1rem' }}>
                  <h3 style={{ margin: '0 0 0.5rem', color: '#818cf8', fontSize: '1.1rem' }}>{rec.title}</h3>
                  <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem' }}><strong>Problem:</strong> {rec.problem}</p>
                  <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem' }}><strong>Opportunity:</strong> {rec.opportunity}</p>
                  <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem' }}><strong>Evidence:</strong> {rec.evidence}</p>
                  <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                    <div>ROI: <strong>{rec.expectedROI}x</strong></div>
                    <div>Leads: <strong>{rec.expectedLeads}</strong></div>
                    <div>Budget: <strong>${rec.budget}</strong></div>
                    <div>Confidence: <strong>{rec.confidence}%</strong></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
