'use client';
import { useState, useEffect } from 'react';
import { 
  TrendingUp, Award, BarChart3, ShieldAlert, Cpu, Sparkles, Activity, Target, 
  MapPin, AlertTriangle, Lightbulb, Compass, BarChart, RefreshCw, Layers, Calendar, 
  Users, CheckCircle2, ChevronRight, FileText, ArrowRightLeft, Clock
} from 'lucide-react';

export default function AnalyticsWorkspacePage() {
  const [businessId, setBusinessId] = useState<string>('default-biz-id');
  const [readiness, setReadiness] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [evolution, setEvolution] = useState<any>([]);
  const [decisions, setDecisions] = useState<any>([]);
  const [story, setStory] = useState<string>('');
  
  // Time Machine States
  const [sourceSnapshotId, setSourceSnapshotId] = useState<string>('');
  const [targetSnapshotId, setTargetSnapshotId] = useState<string>('');
  const [comparison, setComparison] = useState<any>(null);
  const [comparing, setComparing] = useState(false);

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'health' | 'trends' | 'forecast' | 'competitive' | 'risks' | 'opportunities' | 'predictions' | 'story' | 'timemachine' | 'decisions'>('overview');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Load readiness
        const rRes = await fetch(`/api/growth/readiness/${businessId}/analytics-engine`);
        if (rRes.ok) {
          const rJson = await rRes.json();
          setReadiness(rJson.data);
        }

        // Load latest session (if any exists in DB)
        const sessionHistoryRes = await fetch(`/api/analytics/sessions/latest?businessId=${businessId}`);
        if (sessionHistoryRes.ok) {
          const sessJson = await sessionHistoryRes.json();
          if (sessJson.session) {
            setSession(sessJson.session);
          }
        }

        // Load Evolution Snapshot Timeline
        const evRes = await fetch(`/api/analytics/evolution/${businessId}`);
        if (evRes.ok) {
          const evJson = await evRes.json();
          setEvolution(evJson);
          if (evJson.length >= 2) {
            setSourceSnapshotId(evJson[1].id);
            setTargetSnapshotId(evJson[0].id);
          }
        }

        // Load Decisions Timeline
        const decRes = await fetch(`/api/analytics/decisions/${businessId}`);
        if (decRes.ok) {
          const decJson = await decRes.json();
          setDecisions(decJson);
        }

        // Load Quarterly Narrative
        const storyRes = await fetch(`/api/analytics/story/${businessId}`);
        if (storyRes.ok) {
          const storyJson = await storyRes.json();
          setStory(storyJson.story);
        }
      } catch (err) {
        console.warn('Failed to fetch analytics workspace APIs. Entering mock dashboard mode.');
        setupMockData();
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [businessId]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleRunAnalytics = async () => {
    try {
      setGenerating(true);
      showToast('Executing Master Analytics Graph... compiling 18 subgraphs.');
      const res = await fetch(`/api/analytics/run/${businessId}`, { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        // Load session results
        const sessRes = await fetch(`/api/analytics/sessions/${json.sessionId}`);
        if (sessRes.ok) {
          const sessionData = await sessRes.json();
          setSession(sessionData);
          showToast('Analytics Graph completed. Performance snapshots compiled.');
          
          // Reload timeline snapshot lists & narrative
          const evRes = await fetch(`/api/analytics/evolution/${businessId}`);
          if (evRes.ok) setEvolution(await evRes.json());

          const decRes = await fetch(`/api/analytics/decisions/${businessId}`);
          if (decRes.ok) setDecisions(await decRes.json());

          const storyRes = await fetch(`/api/analytics/story/${businessId}`);
          if (storyRes.ok) {
            const storyJson = await storyRes.json();
            setStory(storyJson.story);
          }
        }
      } else {
        showToast('Execution error. Interceptors active.');
        setupMockData();
      }
    } catch (err) {
      setupMockData();
    } finally {
      setGenerating(false);
    }
  };

  const handleCompare = async () => {
    if (!sourceSnapshotId || !targetSnapshotId) return;
    try {
      setComparing(true);
      const res = await fetch(`/api/analytics/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          sessionId: session?.id || 'mock-id',
          sourceSnapshotId,
          targetSnapshotId
        })
      });
      if (res.ok) {
        const json = await res.json();
        setComparison(json);
      } else {
        setupMockComparison();
      }
    } catch (err) {
      setupMockComparison();
    } finally {
      setComparing(false);
    }
  };

  const handleFeedback = async (action: 'ACCEPT' | 'REJECT') => {
    if (!session) return;
    try {
      const res = await fetch(`/api/analytics/feedback/${session.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          action,
          feedbackText
        })
      });
      if (res.ok) {
        showToast(`Recommendation ${action === 'ACCEPT' ? 'approved and logged to Decision Timeline' : 'rejected'}`);
        // Reload decisions
        const decRes = await fetch(`/api/analytics/decisions/${businessId}`);
        if (decRes.ok) setDecisions(await decRes.json());
      }
    } catch {
      showToast(`Mock Action Logged: ${action}`);
    }
  };

  const setupMockComparison = () => {
    setComparison({
      whatChanged: 'Global Executive Health index optimized from 82% to 86% overall. Sales health index expanded +5%.',
      whyItChanged: 'LTV/CAC ratio rose from 3.5x to 4.2x due to cached API compute COGS optimizations.',
      causativeEngine: 'Marketing Engine and Analytics Cache recommendation',
      positiveImpact: 'Calculations cost declined 15%, enhancing Gross Margin index by 3.5%.',
      negativeImpact: 'Stale cached payloads risk rose slightly.',
      metricsAffected: JSON.stringify(['cac', 'ltv', 'overallExecutiveHealth']),
      forecastDiff: '30-day forecast expectations increased +$3,000 Expected ARR.',
      confidenceDiff: 'Confidence parameters stabilized at 90%.',
      riskDiff: 'Revenue leakage down 4.5%.',
      opportunityDiff: 'Quick win candidate list expanded.',
      executiveSummary: 'Outbound sales channel optimizations and caching policies successfully lifted overall metrics trajectory.'
    });
  };

  const setupMockData = () => {
    setReadiness({
      readinessScore: 94,
      canExecute: true
    });

    setSession({
      id: 'analytics-mock-session-id',
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
      businessHealth: JSON.stringify({
        operationalHealth: 88,
        salesHealth: 82,
        marketingHealth: 85,
        leadHealth: 79,
        customerHealth: 92,
        innovationHealth: 75,
        overallExecutiveHealth: 86,
        confidence: 90,
        evidence: 'High retention and robust product pipeline offsets slight sales conversion delays',
        trendDirection: 'UP',
        expectedDirection: 'IMPROVING'
      }),
      growthHealth: JSON.stringify({
        growthScore: 84,
        velocityIndex: 82,
        confidence: 88
      }),
      revenueHealth: JSON.stringify({
        pipelineValue: 350000.0,
        leakagePoints: ['Long contract redlining phase', 'MQL-to-SQL drop-offs'],
        stabilityScore: 87.0
      }),
      marketReadiness: JSON.stringify({
        productReadiness: 90,
        salesReadiness: 80,
        marketingReadiness: 85,
        expansionReadiness: 75,
        investmentReadiness: 82,
        internationalReadiness: 65
      }),
      competitiveAnalysis: JSON.stringify({
        competitivePosition: 'CHALLENGER',
        marketPosition: 'MEDIUM',
        differentiators: ['AI-driven scheduling algorithms', 'Lower TCO compared to legacy systems'],
        weaknesses: ['Limited custom SLA integrations', 'No direct offline SDK support'],
        threats: ['Established legacy carriers releasing SaaS wrappers', 'Aggressive venture-backed pricing cuts'],
        opportunities: ['Enterprise logistics optimization', 'Cold-chain routing expansion'],
        competitiveConfidence: 85
      }),
      forecastAnalysis: JSON.stringify({
        forecasts: [
          { horizonDays: 30, revenueForecast: 45000, pipelineForecast: 90000, growthForecast: 3.5, riskForecast: 2.0, expansionForecast: 5000, confidenceMin: 85, confidenceMax: 95, bestCase: 50000, expectedCase: 45000, worstCase: 38000 },
          { horizonDays: 90, revenueForecast: 135000, pipelineForecast: 270000, growthForecast: 11.2, riskForecast: 5.5, expansionForecast: 15000, confidenceMin: 80, confidenceMax: 90, bestCase: 150000, expectedCase: 135000, worstCase: 110000 },
          { horizonDays: 180, revenueForecast: 280000, pipelineForecast: 560000, growthForecast: 24.5, riskForecast: 12.0, expansionForecast: 35000, confidenceMin: 75, confidenceMax: 88, bestCase: 320000, expectedCase: 280000, worstCase: 220000 }
        ]
      }),
      riskAnalysis: JSON.stringify({
        risks: [
          { category: 'REVENUE', severity: 'HIGH', probability: 25, businessImpact: 'Renewal failure of top 2 enterprise accounts due to SLA disputes', mitigation: 'CS check-ins 90 days prior to renewal' },
          { category: 'COMPETITIVE', severity: 'MEDIUM', probability: 40, businessImpact: 'Competitor matching primary route features at lower price', mitigation: 'Develop TCO comparisons and bundle dispatch features' }
        ]
      }),
      opportunityAnalysis: JSON.stringify({
        opportunities: [
          { type: 'QUICK_WIN', priority: 'HIGH', expectedImpact: 'Reduce route calculation cost 15% via API caching' },
          { type: 'EXPANSION', priority: 'MEDIUM', expectedImpact: 'Expand into cold-chain temperature integrations segment' }
        ]
      }),
      executiveInsight: JSON.stringify({
        ceoSummary: 'Performance remains strong with overall executive health index at 86/100. Pipeline values grew 12% quarter-on-quarter.',
        boardSummary: 'Enterprise outbound operations yield stable expansion. Churn remains within thresholds at 5%. High investment readiness score of 82/100 facilitates Series-A positioning.',
        criticalFind: ['MQL quality scores are improving', 'Contract redlining represents the primary pipeline leakage bottleneck'],
        topOpp: ['Cold-chain segment integration', 'Route calculator caching quick win'],
        topRisk: ['Top 2 account renewal disputes', 'Aggressive competitor feature-matching'],
        narrative: 'The business demonstrates healthy operational momentum. Outbound expansion projects yield strong conversion indicators.'
      }),
      recommendations: JSON.stringify([
        {
          title: 'Implement API Caching to Reduce COGS',
          nextBestAction: 'Deploy edge cache rule frameworks for route API calculations',
          expectedOutcome: '15% reduction in route calculation compute costs within 30 days',
          expectedTimeline: '30 days',
          riskFactors: ['Stale API payload delivery', 'Complex header validation logic'],
          dependencies: ['DevOps infrastructure sign-off on cache duration parameters'],
          alternativeActions: ['Limit API volume request quotas on low-tier developer keys']
        }
      ]),
      prediction: JSON.stringify({
        predictions: [
          { metricName: 'LTV Expansion Rate', predictedVal: 22.5, confidence: 85, horizonDays: 90, horizonDate: '2026-10-05T00:00:00Z', evidence: 'Upsell adoptive cycles' },
          { metricName: 'Qualified Outbound Leads Count', predictedVal: 145, confidence: 90, horizonDays: 30, horizonDate: '2026-08-05T00:00:00Z', evidence: 'Outbound campaign metrics' }
        ]
      }),
      trendAnalysis: JSON.stringify([
        { trendName: 'Revenue Growth Trend', trendDirection: 'UP', confidence: 85, expectedFuture: 'Expansion in Enterprise segment' },
        { trendName: 'Sales Conversion Velocity', trendDirection: 'STABLE', confidence: 90, expectedFuture: 'Consistent stage duration ratios' }
      ]),
      businessBenchmark: JSON.stringify({
        performanceRating: 'AVERAGE',
        gapAnalysis: '["Sales lifecycle duration exceeds sector average by 5 days"]',
        priorityImprove: '["Optimize MQL to SQL qualification rules"]'
      })
    });

    setEvolution([
      { id: 'snap-1', version: 2, createdAt: new Date().toISOString(), businessHealth: JSON.stringify({ overallExecutiveHealth: 86 }), growthScore: JSON.stringify({ growthScore: 84 }), revenueHealth: JSON.stringify({ pipelineValue: 350000 }) },
      { id: 'snap-2', version: 1, createdAt: new Date(Date.now() - 86400000 * 7).toISOString(), businessHealth: JSON.stringify({ overallExecutiveHealth: 82 }), growthScore: JSON.stringify({ growthScore: 81 }), revenueHealth: JSON.stringify({ pipelineValue: 310000 }) }
    ]);

    setSourceSnapshotId('snap-2');
    setTargetSnapshotId('snap-1');

    setDecisions([
      { id: 'dec-1', decision: 'API Caching Strategy', reason: 'High calculations compute cost', engine: 'analytics-engine', confidence: 95, status: 'APPROVED', createdAt: new Date().toISOString() }
    ]);

    setStory('The business V2 snapshot exhibits substantial optimization across unit economic vectors. Outbound sales pipeline velocity was elevated due to systematic marketing alignment.');
  };

  // Helper parsers
  const parseJson = (str: string, fallback: any = {}) => {
    try { return str ? JSON.parse(str) : fallback; } catch { return fallback; }
  };

  const sHealth = parseJson(session?.businessHealth, {});
  const sGrowth = parseJson(session?.growthHealth, {});
  const sRev = parseJson(session?.revenueHealth, {});
  const sReadiness = parseJson(session?.marketReadiness, {});
  const sCompetitive = parseJson(session?.competitiveAnalysis, {});
  const sForecast = parseJson(session?.forecastAnalysis, { forecasts: [] });
  const sRisks = parseJson(session?.riskAnalysis, { risks: [] });
  const sOpportunities = parseJson(session?.opportunityAnalysis, { opportunities: [] });
  const sInsight = parseJson(session?.executiveInsight, {});
  const sRecommendations = parseJson(session?.recommendations, []);
  const sPrediction = parseJson(session?.prediction, { predictions: [] });
  const sTrends = parseJson(session?.trendAnalysis, []);
  const sBenchmark = parseJson(session?.businessBenchmark, {});

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-6">
      
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-blue-600 border border-blue-500 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 animate-bounce">
          <Sparkles className="h-5 w-5" />
          <span className="text-sm font-semibold">{toast}</span>
        </div>
      )}

      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
        <div>
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Cpu className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex flex-wrap items-center gap-2">
                Executive Intelligence Workspace
                <span className="text-xs font-semibold px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full shrink-0 whitespace-nowrap">
                  Sprint 11 CBIO
                </span>
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">Continuous business health scores, multi-horizon forecasts, competitive analyses, and time-machine snapshot comparisons.</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRunAnalytics}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${generating ? 'animate-spin' : ''}`} />
            {generating ? 'Executing Graph...' : 'Run Analytics Engine'}
          </button>
        </div>
      </div>

      {/* Nav Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1.5 border-b border-slate-800/80">
        {[
          { id: 'overview', name: 'Dashboard', icon: BarChart3 },
          { id: 'health', name: 'Business Health', icon: Activity },
          { id: 'trends', name: 'Trend Explorer', icon: TrendingUp },
          { id: 'forecast', name: 'Forecast Center', icon: Calendar },
          { id: 'competitive', name: 'Competitive Intel', icon: Compass },
          { id: 'risks', name: 'Risk Center', icon: ShieldAlert },
          { id: 'opportunities', name: 'Opportunities', icon: Lightbulb },
          { id: 'predictions', name: 'Predictions', icon: Target },
          { id: 'story', name: 'Executive Story', icon: FileText },
          { id: 'timemachine', name: 'Business Time Machine', icon: ArrowRightLeft },
          { id: 'decisions', name: 'Decision Timeline', icon: Clock }
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                activeTab === t.id 
                  ? 'bg-blue-600/15 border-blue-500/30 text-blue-400' 
                  : 'border-transparent text-slate-400 hover:bg-slate-900/50 hover:text-slate-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.name}
            </button>
          );
        })}
      </div>

      {/* Workspace Tab Contents */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4 bg-slate-900/25 border border-slate-900 rounded-2xl">
          <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
          <p className="text-sm text-slate-400">Loading Business Intelligence records...</p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
              
              {/* Executive Summary */}
              <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-5">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-400" />
                  CEO Executive Insight
                </h2>
                <div className="p-4 bg-slate-950/50 border border-slate-850 rounded-xl space-y-3">
                  <p className="text-xs font-medium text-slate-300 leading-relaxed">{sInsight.ceoSummary || 'No summary compiled. Run Analytics Engine to generate.'}</p>
                  <p className="text-xs text-slate-400 leading-relaxed italic">"{sInsight.narrative}"</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-2">
                    <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-full">Top Opportunity</span>
                    <p className="text-xs font-bold text-white mt-1">{sInsight.topOpp?.[0] || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-2">
                    <span className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider bg-rose-500/10 px-2 py-0.5 rounded-full">Top Risk</span>
                    <p className="text-xs font-bold text-white mt-1">{sInsight.topRisk?.[0] || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Health Score Overview */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
                    <Activity className="h-4 w-4 text-blue-400" />
                    Overall Executive Health
                  </h2>
                  <div className="flex flex-col items-center justify-center py-6 space-y-2">
                    <div className="relative h-28 w-28 flex items-center justify-center">
                      <svg className="absolute inset-0 h-full w-full transform -rotate-90">
                        <circle cx="56" cy="56" r="48" stroke="#1e293b" strokeWidth="8" fill="transparent" />
                        <circle 
                          cx="56" cy="56" r="48" 
                          stroke="#3b82f6" strokeWidth="8" fill="transparent" 
                          strokeDasharray="301" 
                          strokeDashoffset={301 - (301 * (sHealth.overallExecutiveHealth || 85)) / 100}
                        />
                      </svg>
                      <span className="text-2xl font-black text-white">{sHealth.overallExecutiveHealth || 85}%</span>
                    </div>
                    <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {sHealth.trendDirection || 'UP'}
                    </span>
                  </div>
                </div>
                <div className="p-3.5 bg-slate-950/45 border border-slate-850 rounded-xl space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Grounding Evidence</span>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">{sHealth.evidence || 'Run engine calculation to process context evidence.'}</p>
                </div>
              </div>

              {/* KPIs & Benchmark */}
              <div className="lg:col-span-3 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-850">
                  <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Award className="h-4 w-4 text-blue-400" />
                    Calculated KPIs & Benchmarks
                  </h2>
                  <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 border border-blue-500/20 rounded-full">
                    Rating: {sBenchmark.performanceRating || 'AVERAGE'}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { label: 'CAC Efficiency', val: `${session?.kpis ? parseJson(session.kpis).cac : 1200} USD`, status: 'OPTIMAL', color: 'text-emerald-400' },
                    { label: 'LTV Value', val: `${session?.kpis ? parseJson(session.kpis).ltv : 4200} USD`, status: 'HEALTHY', color: 'text-blue-400' },
                    { label: 'Growth Score', val: `${sGrowth.growthScore || 84}%`, status: 'STABLE', color: 'text-purple-400' },
                    { label: 'Sales Health', val: `${sHealth.salesHealth || 82}%`, status: 'CRITICAL', color: 'text-amber-400' },
                    { label: 'Pipeline Stability', val: `${sRev.stabilityScore || 87}%`, status: 'OPTIMAL', color: 'text-emerald-400' }
                  ].map((kpi, idx) => (
                    <div key={idx} className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-1.5">
                      <span className="text-[10px] text-slate-400 font-semibold">{kpi.label}</span>
                      <p className={`text-lg font-black ${kpi.color}`}>{kpi.val}</p>
                      <span className="text-[9px] text-slate-500 font-semibold uppercase">{kpi.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations Drawer */}
              <div className="lg:col-span-3 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-blue-400" />
                  Primary Strategic Recommendation
                </h2>
                {sRecommendations.map((rec: any, idx: number) => (
                  <div key={idx} className="bg-slate-950/40 border border-slate-850 rounded-xl p-5 space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="text-sm font-bold text-white">{rec.title}</h3>
                        <p className="text-xs text-slate-400 mt-1">Timeline: <span className="font-semibold text-slate-200">{rec.expectedTimeline}</span> | Expected Outcome: <span className="font-semibold text-slate-200">{rec.expectedOutcome}</span></p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleFeedback('ACCEPT')}
                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer"
                        >
                          Approve Decision
                        </button>
                        <button 
                          onClick={() => handleFeedback('REJECT')}
                          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                    <div className="p-3.5 bg-slate-900/30 border border-slate-850 rounded-lg">
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Next Best Action</span>
                      <p className="text-xs text-slate-200 mt-1 font-medium">{rec.nextBestAction}</p>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 2: HEALTH */}
          {activeTab === 'health' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-5">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2 pb-3 border-b border-slate-850">
                  <Activity className="h-4 w-4 text-blue-400" />
                  Domain Health Breakdown
                </h2>
                <div className="space-y-4">
                  {[
                    { label: 'Operational Health', val: sHealth.operationalHealth || 88 },
                    { label: 'Sales Health', val: sHealth.salesHealth || 82 },
                    { label: 'Marketing Health', val: sHealth.marketingHealth || 85 },
                    { label: 'Lead Intelligence Health', val: sHealth.leadHealth || 79 },
                    { label: 'Customer Retention Health', val: sHealth.customerHealth || 92 },
                    { label: 'Innovation Index', val: sHealth.innovationHealth || 75 }
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-300">{item.label}</span>
                        <span className="text-blue-400">{item.val}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${item.val}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-5">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2 pb-3 border-b border-slate-850">
                  <Layers className="h-4 w-4 text-blue-400" />
                  Growth & Revenue Stability
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl text-center space-y-1.5">
                    <span className="text-xs text-slate-400 font-semibold">Growth Score</span>
                    <p className="text-2xl font-black text-white">{sGrowth.growthScore || 84}%</p>
                    <span className="text-[10px] text-slate-500">Confidence: {sGrowth.confidence || 88}%</span>
                  </div>
                  <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl text-center space-y-1.5">
                    <span className="text-xs text-slate-400 font-semibold">Velocity Index</span>
                    <p className="text-2xl font-black text-blue-400">{sGrowth.velocityIndex || 82}</p>
                    <span className="text-[10px] text-slate-500">Index Score</span>
                  </div>
                </div>
                <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-3">
                  <div className="flex justify-between text-xs font-semibold border-b border-slate-850 pb-2">
                    <span className="text-slate-300">Revenue Stability Rating</span>
                    <span className="text-emerald-400">{sRev.stabilityScore || 87}%</span>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Revenue Leakage Bottlenecks</span>
                    {parseJson(session?.revenueHealth, {}).leakagePoints?.map((pt: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                        <AlertTriangle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                        {pt}
                      </div>
                    )) || <span className="text-xs text-slate-500">No leakage flags detected.</span>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TRENDS */}
          {activeTab === 'trends' && (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-5 animate-fade-in">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2 pb-3 border-b border-slate-850">
                <TrendingUp className="h-4 w-4 text-blue-400" />
                Directional Trend Analyses
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sTrends.map((tr: any, idx: number) => (
                  <div key={idx} className="p-5 bg-slate-950/40 border border-slate-850 rounded-xl space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xs font-bold text-white">{tr.trendName}</h3>
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        {tr.trendDirection}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">{tr.expectedFuture}</p>
                    <div className="flex justify-between text-[10px] text-slate-500 font-semibold border-t border-slate-900 pt-2">
                      <span>Statistical Confidence</span>
                      <span>{tr.confidence}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: FORECAST */}
          {activeTab === 'forecast' && (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-5 animate-fade-in">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2 pb-3 border-b border-slate-850">
                <Calendar className="h-4 w-4 text-blue-400" />
                Multi-Horizon Forecast Projections
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {sForecast.forecasts.map((f: any, idx: number) => (
                  <div key={idx} className="p-5 bg-slate-950/40 border border-slate-850 rounded-xl space-y-4">
                    <div className="pb-2 border-b border-slate-900 flex justify-between items-center">
                      <span className="text-xs font-black text-white">{f.horizonDays} Day Horizon</span>
                      <span className="text-[10px] text-slate-400">Conf: {f.confidenceMin}-{f.confidenceMax}%</span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold">Expected Case Revenue</span>
                        <p className="text-lg font-black text-white">${f.expectedCase.toLocaleString()}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 bg-emerald-500/5 border border-emerald-500/15 rounded-lg text-emerald-400">
                          <span className="text-[9px] text-slate-500 font-bold block uppercase">Best Case</span>
                          <span className="font-extrabold">${f.bestCase.toLocaleString()}</span>
                        </div>
                        <div className="p-2 bg-rose-500/5 border border-rose-500/15 rounded-lg text-rose-400">
                          <span className="text-[9px] text-slate-500 font-bold block uppercase">Worst Case</span>
                          <span className="font-extrabold">${f.worstCase.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="pt-2.5 border-t border-slate-900 grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                        <div>
                          <span>Pipeline Forecast</span>
                          <span className="block font-bold text-slate-200">${f.pipelineForecast.toLocaleString()}</span>
                        </div>
                        <div>
                          <span>Growth Forecast</span>
                          <span className="block font-bold text-slate-200">+{f.growthForecast}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: COMPETITIVE */}
          {activeTab === 'competitive' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
              <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-5">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2 pb-3 border-b border-slate-850">
                  <Compass className="h-4 w-4 text-blue-400" />
                  Differentiators & Market Position
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Competitive Position</span>
                    <p className="text-base font-black text-white">{sCompetitive.competitivePosition}</p>
                  </div>
                  <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Market Power Index</span>
                    <p className="text-base font-black text-blue-400">{sCompetitive.marketPosition}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <span className="text-xs font-bold text-white block">Key Differentiators</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {sCompetitive.differentiators?.map((df: string, idx: number) => (
                      <div key={idx} className="p-3 bg-slate-950/30 border border-slate-850 rounded-lg text-xs text-slate-300 font-semibold flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        {df}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-5">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2 pb-3 border-b border-slate-850">
                  <Users className="h-4 w-4 text-blue-400" />
                  SWOT Matrix
                </h2>
                <div className="space-y-4 text-xs">
                  <div>
                    <span className="font-bold text-amber-400">Weaknesses</span>
                    <ul className="list-disc pl-4 space-y-1 text-slate-400 mt-1 font-medium">
                      {sCompetitive.weaknesses?.map((w: string, idx: number) => <li key={idx}>{w}</li>)}
                    </ul>
                  </div>
                  <div>
                    <span className="font-bold text-rose-400">Threats</span>
                    <ul className="list-disc pl-4 space-y-1 text-slate-400 mt-1 font-medium">
                      {sCompetitive.threats?.map((t: string, idx: number) => <li key={idx}>{t}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: RISKS */}
          {activeTab === 'risks' && (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-5 animate-fade-in">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2 pb-3 border-b border-slate-850">
                <ShieldAlert className="h-4 w-4 text-blue-400" />
                Risks Matrix
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sRisks.risks.map((rk: any, idx: number) => (
                  <div key={idx} className="p-5 bg-slate-950/40 border border-slate-850 rounded-xl space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 border border-rose-500/20 rounded-full">{rk.category}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${rk.severity === 'HIGH' ? 'bg-rose-600/20 text-rose-400' : 'bg-amber-600/20 text-amber-400'}`}>
                        {rk.severity} Severity
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] font-semibold text-slate-400 uppercase">Impact Description</span>
                      <p className="text-xs text-slate-300 font-semibold mt-0.5 leading-relaxed">{rk.businessImpact}</p>
                    </div>
                    <div className="p-3 bg-slate-900/30 border border-slate-850 rounded-lg">
                      <span className="text-[9px] font-bold text-blue-400 uppercase tracking-wider">Mitigation Policy</span>
                      <p className="text-xs text-slate-300 mt-1 font-semibold leading-relaxed">{rk.mitigation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: OPPORTUNITIES */}
          {activeTab === 'opportunities' && (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-5 animate-fade-in">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2 pb-3 border-b border-slate-850">
                <Lightbulb className="h-4 w-4 text-blue-400" />
                Quick Wins & Optimization Pipelines
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sOpportunities.opportunities.map((op: any, idx: number) => (
                  <div key={idx} className="p-5 bg-slate-950/40 border border-slate-850 rounded-xl space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 border border-emerald-500/20 rounded-full">{op.type}</span>
                      <span className="text-xs font-bold text-slate-400">Priority: {op.priority}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-semibold text-slate-400 uppercase">Expected Impact</span>
                      <p className="text-xs text-slate-300 font-semibold mt-0.5 leading-relaxed">{op.expectedImpact}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: PREDICTIONS */}
          {activeTab === 'predictions' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-5">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2 pb-3 border-b border-slate-850">
                  <Compass className="h-4 w-4 text-blue-400" />
                  Expansion Readiness
                </h2>
                <div className="space-y-4">
                  {[
                    { label: 'Product Readiness', val: sReadiness.productReadiness || 90 },
                    { label: 'Sales Readiness', val: sReadiness.salesReadiness || 80 },
                    { label: 'Marketing Readiness', val: sReadiness.marketingReadiness || 85 },
                    { label: 'Expansion Readiness', val: sReadiness.expansionReadiness || 75 },
                    { label: 'Investment Readiness', val: sReadiness.investmentReadiness || 82 }
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-[11px] font-semibold">
                        <span className="text-slate-400">{item.label}</span>
                        <span className="text-blue-400">{item.val}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: `${item.val}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-5">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2 pb-3 border-b border-slate-850">
                  <Target className="h-4 w-4 text-blue-400" />
                  Predictive Horizons
                </h2>
                <div className="space-y-4">
                  {sPrediction.predictions.map((p: any, idx: number) => (
                    <div key={idx} className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xs font-bold text-white">{p.metricName}</h3>
                        <span className="text-[10px] text-slate-400">Horizon: {p.horizonDays} Days ({new Date(p.horizonDate).toLocaleDateString()})</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <div>
                          <span className="text-[9px] text-slate-500 font-bold block uppercase">Predicted Value</span>
                          <span className="text-lg font-black text-blue-400">+{p.predictedVal}%</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-500 font-bold block uppercase">Confidence Index</span>
                          <span className="font-extrabold text-white">{p.confidence}%</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed italic mt-1">Evidence context: {p.evidence}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: EXECUTIVE STORY */}
          {activeTab === 'story' && (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-5 animate-fade-in">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2 pb-3 border-b border-slate-850">
                <FileText className="h-4 w-4 text-blue-400" />
                Executive Story quarterly report Narrative
              </h2>
              <div className="p-6 bg-slate-950/45 border border-slate-850 rounded-xl leading-relaxed text-slate-200 text-xs font-medium space-y-4 shadow-inner">
                {story ? story.split('\n\n').map((para, idx) => (
                  <p key={idx}>{para}</p>
                )) : (
                  <p className="text-slate-400 text-center italic">Run Analytics Engine to compile a natural-language quarterly performance narrative.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 10: TIME MACHINE */}
          {activeTab === 'timemachine' && (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-6 animate-fade-in">
              <div className="pb-3 border-b border-slate-850">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <ArrowRightLeft className="h-5 w-5 text-blue-400" />
                  Business Time Machine Snapshot Comparer
                </h2>
                <p className="text-xs text-slate-400 mt-1">Select any two historical snapshots to compare metrics, leakage differences, and causative engines.</p>
              </div>

              {/* Selectors */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-slate-950/40 border border-slate-850 p-4 rounded-xl">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Source Snapshot</label>
                  <select 
                    value={sourceSnapshotId}
                    onChange={(e) => setSourceSnapshotId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white cursor-pointer"
                  >
                    <option value="">Choose snapshot...</option>
                    {evolution.map((snap: any) => (
                      <option key={snap.id} value={snap.id}>V{snap.version} - {new Date(snap.createdAt).toLocaleDateString()}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Target Snapshot</label>
                  <select 
                    value={targetSnapshotId}
                    onChange={(e) => setTargetSnapshotId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white cursor-pointer"
                  >
                    <option value="">Choose snapshot...</option>
                    {evolution.map((snap: any) => (
                      <option key={snap.id} value={snap.id}>V{snap.version} - {new Date(snap.createdAt).toLocaleDateString()}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleCompare}
                  disabled={comparing || !sourceSnapshotId || !targetSnapshotId}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <ArrowRightLeft className="h-4 w-4" />
                  {comparing ? 'Comparing...' : 'Compare Snapshots'}
                </button>
              </div>

              {/* Comparison Data display */}
              {comparison ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
                  <div className="lg:col-span-2 space-y-4">
                    <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-2">
                      <span className="text-[10px] font-bold text-blue-400 uppercase">What Changed?</span>
                      <p className="text-xs text-slate-200 font-semibold leading-relaxed">{comparison.whatChanged}</p>
                    </div>
                    <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-2">
                      <span className="text-[10px] font-bold text-blue-400 uppercase">Why It Changed?</span>
                      <p className="text-xs text-slate-200 font-semibold leading-relaxed">{comparison.whyItChanged}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-2">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase">Positive Impacts</span>
                        <p className="text-xs text-slate-200 font-semibold">{comparison.positiveImpact}</p>
                      </div>
                      <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-2">
                        <span className="text-[10px] font-bold text-rose-400 uppercase">Negative Impacts / Risks</span>
                        <p className="text-xs text-slate-200 font-semibold">{comparison.negativeImpact}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-2.5 text-xs">
                      <div className="pb-1 border-b border-slate-900">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Causative Driver</span>
                        <p className="font-extrabold text-white mt-0.5">{comparison.causativeEngine}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Forecast Delta</span>
                        <span className="font-semibold text-slate-300">{comparison.forecastDiff}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Confidence Delta</span>
                        <span className="font-semibold text-slate-300">{comparison.confidenceDiff}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Executive Summary</span>
                        <p className="text-slate-400 leading-relaxed mt-1 font-medium italic">"{comparison.executiveSummary}"</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 bg-slate-950/20 border border-slate-900 rounded-xl text-slate-500 italic text-xs font-semibold">
                  Select snapshot versions and click Compare to evaluate.
                </div>
              )}
            </div>
          )}

          {/* TAB 11: DECISION TIMELINE */}
          {activeTab === 'decisions' && (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-5 animate-fade-in">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2 pb-3 border-b border-slate-850">
                <Clock className="h-4 w-4 text-blue-400" />
                Decision Timeline Audit Trail
              </h2>
              <div className="relative border-l border-slate-800 pl-6 ml-4 space-y-6">
                {decisions.map((dec: any, idx: number) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-[31px] top-1 bg-slate-950 border border-blue-500 text-blue-400 rounded-full h-4 w-4 flex items-center justify-center text-[9px] font-black">
                      •
                    </span>
                    <div className="bg-slate-950/40 border border-slate-850 rounded-xl p-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xs font-bold text-white">{dec.decision}</h3>
                        <span className="text-[9px] text-slate-500">{new Date(dec.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-slate-300 font-medium">{dec.reason}</p>
                      <div className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                        Expected Outcome Impact: <span className="text-blue-400">{dec.expectedOutcome || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
