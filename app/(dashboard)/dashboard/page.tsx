'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb, 
  Hourglass, 
  ArrowUpRight, 
  ShieldAlert, 
  Activity,
  CheckCircle2,
  Clock,
  Play,
  Layers,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Vote,
  Target,
  AlertCircle
} from 'lucide-react';

interface KPITreeNode {
  name: string;
  value: string;
  metricKey: string;
  trend: 'UP' | 'DOWN' | 'STABLE';
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  children?: KPITreeNode[];
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [simCommand, setSimCommand] = useState('Scale mid-market organic marketing outreach channels');
  
  // Onboarding completion status
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);

  // Dashboard states
  const [brief, setBrief] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [consensus, setConsensus] = useState<any[]>([]);
  const [kpiTree, setKpiTree] = useState<KPITreeNode | null>(null);
  const [roadmap, setRoadmap] = useState<any[]>([]);
  const [operatingPlan, setOperatingPlan] = useState<any>(null);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'overall_health': true,
    'growth_score': true,
    'customer_health': true
  });

  const businessId = 'mock-business-id';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch onboarding status from Discovery API
      const sessionRes = await fetch(`/api/discovery/chat/session`);
      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        if (sessionData.success) {
          setOnboardingCompleted(sessionData.data.onboardingCompleted);
          if (!sessionData.data.onboardingCompleted) {
            setLoading(false);
            return; // Skip downstream calls if insights are locked
          }
        }
      }

      // 2. Fetch Board data if onboarding is complete
      const runRes = await fetch(`/api/executive-board/run/${businessId}`, { method: 'POST' });
      if (runRes.ok) {
        const runData = await runRes.json();
        if (runData.success) {
          setBrief(runData.brief);
          setRecommendations(runData.recommendations || []);
          setConflicts(runData.conflicts || []);
          setConsensus(runData.consensus || []);
        }
      }

      // Fetch KPI Tree
      const treeRes = await fetch(`/api/executive-board/kpi-tree/${businessId}`);
      if (treeRes.ok) {
        const treeData = await treeRes.json();
        if (treeData.success) {
          setKpiTree(treeData.tree);
        }
      }

      // Fetch Roadmap
      const roadmapRes = await fetch(`/api/executive-board/roadmap/${businessId}`);
      if (roadmapRes.ok) {
        const roadmapData = await roadmapRes.json();
        if (roadmapData.success) {
          setRoadmap(roadmapData.roadmap || []);
        }
      }

      // Fetch Operating Plan
      const planRes = await fetch(`/api/executive-board/plan/${businessId}`);
      if (planRes.ok) {
        const planData = await planRes.json();
        if (planData.success) {
          setOperatingPlan(planData.plan);
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard board assets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulate = async () => {
    if (!simCommand.trim()) return;
    setSimulating(true);
    setSimulationResult(null);
    try {
      const res = await fetch(`/api/executive-board/simulate/${businessId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: simCommand })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSimulationResult(data.simulation);
        }
      }
    } catch (err) {
      console.error('Error simulating command:', err);
    } finally {
      setSimulating(false);
    }
  };

  const renderKPITreeNode = (node: KPITreeNode, depth = 0) => {
    const isExpanded = expandedNodes[node.metricKey];
    const hasChildren = node.children && node.children.length > 0;
    
    const toggleNode = () => {
      setExpandedNodes(prev => ({
        ...prev,
        [node.metricKey]: !prev[node.metricKey]
      }));
    };

    const statusColors = {
      HEALTHY: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      WARNING: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      CRITICAL: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
    };

    return (
      <div key={node.metricKey} className="space-y-1.5">
        <div 
          onClick={hasChildren ? toggleNode : undefined}
          className={`flex items-center justify-between p-2.5 rounded-lg border bg-white/5 border-white/5 transition-all ${hasChildren ? 'cursor-pointer hover:bg-white/10' : ''}`}
          style={{ marginLeft: `${depth * 12}px` }}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            {hasChildren ? (
              isExpanded ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            ) : (
              <span className="w-3.5 h-3.5 block" />
            )}
            <span className="text-xs font-medium text-slate-200 truncate">{node.name}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-300 font-bold">{node.value}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${statusColors[node.status]}`}>
              {node.trend === 'UP' ? '↑' : node.trend === 'DOWN' ? '↓' : '→'}
            </span>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-1.5">
            {node.children!.map(child => renderKPITreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 relative">
      
      {/* Top Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Executive AI Command Center</h1>
          <p className="text-slate-400 text-xs mt-1">Unified consensus execution roadmap and KPI root-cause monitoring.</p>
        </div>
        <button 
          onClick={fetchDashboardData}
          disabled={loading}
          className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-all border border-indigo-500/30 flex items-center gap-2 active:scale-95"
        >
          <Layers className="h-3.5 w-3.5" />
          {loading ? 'Synchronizing...' : 'Sync Board Session'}
        </button>
      </div>

      {/* Main content area */}
      <div className="relative">
        
        {/* Onboarding Lock Overlay */}
        {onboardingCompleted === false && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center text-center p-8 z-50 rounded-2xl border border-white/10 min-h-[450px]">
            <ShieldAlert className="h-14 w-14 text-indigo-400 animate-pulse mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Business Discovery Required</h2>
            <p className="text-slate-300 text-xs max-w-md mb-6 leading-relaxed">
              TitanForge requires completed business details to execute the Strategy, Marketing, Sales, and Analytics engines.
            </p>
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6 text-left max-w-sm w-full space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Required Information:</span>
              <ul className="text-xs text-slate-300 list-disc list-inside space-y-1">
                <li>Business Identity (Legal Name, Trade Name)</li>
                <li>Products & Services Catalog</li>
                <li>Target Customer Segments</li>
                <li>Website Crawl Ingestion</li>
              </ul>
            </div>
            <button 
              onClick={() => window.location.href = '/onboarding'}
              className="px-6 py-3 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all border border-indigo-500/30 flex items-center gap-2 active:scale-95 text-white"
            >
              <span>Resume Business Discovery</span>
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className={`space-y-6 ${onboardingCompleted === false ? 'blur-sm pointer-events-none opacity-30 select-none' : ''}`}>
          
          {/* Decision Simulator Control Bar */}
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 backdrop-blur-lg space-y-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-emerald-400" />
              <h2 className="text-sm font-bold text-slate-200">Executive Decision Simulator</h2>
            </div>
            <div className="flex gap-2">
              <input 
                type="text"
                value={simCommand}
                onChange={(e) => setSimCommand(e.target.value)}
                placeholder="Type simulated command (e.g. Increase ad budget by 20%, Hire 2 SDR representatives)..."
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <button 
                onClick={handleSimulate}
                disabled={simulating}
                className="px-4 py-2.5 text-xs bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 rounded-lg font-bold flex items-center gap-2 active:scale-95 transition-all border border-emerald-500/30"
              >
                <Play className="h-3.5 w-3.5" />
                {simulating ? 'Simulating...' : 'Simulate'}
              </button>
            </div>

            {/* Simulation Output Projections */}
            {simulationResult && (
              <div className="mt-4 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-3 animate-fadeIn">
                <div className="flex justify-between items-center pb-2 border-b border-emerald-500/20">
                  <span className="text-xs font-bold text-emerald-400">Simulation Projections Summary</span>
                  <span className="text-[10px] font-mono bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-300">Confidence: {simulationResult.confidence}%</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{simulationResult.executiveSummary}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-white/5 p-2.5 rounded-lg border border-white/5">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wide">Revenue Impact</span>
                    <p className="text-xs font-bold text-white mt-0.5">{simulationResult.revenueImpact}</p>
                  </div>
                  <div className="bg-white/5 p-2.5 rounded-lg border border-white/5">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wide">CAC Delta</span>
                    <p className="text-xs font-bold text-white mt-0.5">{simulationResult.cacImpact}</p>
                  </div>
                  <div className="bg-white/5 p-2.5 rounded-lg border border-white/5">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wide">LTV Projections</span>
                    <p className="text-xs font-bold text-white mt-0.5">{simulationResult.ltvImpact}</p>
                  </div>
                  <div className="bg-white/5 p-2.5 rounded-lg border border-white/5">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wide">Growth Index</span>
                    <p className="text-xs font-bold text-white mt-0.5">{simulationResult.growthScoreImpact}</p>
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1.5 pt-1">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                  <span>Disagreements: {simulationResult.engineDisagreements?.map((d: any) => `${d.engine} (${d.challenge})`).join(', ') || 'None'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Grid: KPI Tree & Board Debates */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* KPI Tree Section */}
            <div className="lg:col-span-1 bg-slate-900/50 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
              <div className="flex items-center gap-2 pb-3 border-b border-white/10 mb-4">
                <Activity className="h-4.5 w-4.5 text-indigo-400" />
                <h2 className="text-sm font-bold text-slate-200">Root-Cause KPI Hierarchy</h2>
              </div>
              
              <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                {kpiTree ? renderKPITreeNode(kpiTree) : (
                  <div className="py-6 text-center text-xs text-slate-500">Loading KPI tree...</div>
                )}
              </div>
            </div>

            {/* Board Debate Dialogues logs */}
            <div className="lg:col-span-2 bg-slate-900/50 border border-white/10 rounded-2xl p-5 backdrop-blur-md flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4.5 w-4.5 text-indigo-400" />
                  <h2 className="text-sm font-bold text-slate-200">Board Consensus Debate logs</h2>
                </div>
                {brief && (
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded font-mono">
                    Consensus: {brief.consensus}%
                  </span>
                )}
              </div>

              {/* Debate Log display */}
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[330px] pr-1">
                {consensus.length > 0 ? consensus.map((cMsg, idx) => (
                  <div key={idx} className={`p-3 rounded-xl border text-xs space-y-1.5 transition-all bg-white/5 border-white/5`}>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-indigo-300 uppercase tracking-wide">{cMsg.engineName} representative</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${cMsg.voteType === 'SUPPORT' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>{cMsg.voteType}</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed font-medium">"{cMsg.reason}"</p>
                  </div>
                )) : (
                  <div className="py-6 text-center text-slate-500 text-xs">No active consensus debate logs available.</div>
                )}
              </div>
            </div>

          </div>

          {/* Grid: Actions, Conflicts & Roadmap */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* CEO Board Action Items */}
            <div className="lg:col-span-1 bg-slate-900/50 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
              <div className="flex items-center gap-2 pb-3 border-b border-white/10 mb-4">
                <CheckCircle2 className="h-4.5 w-4.5 text-indigo-400" />
                <h2 className="text-sm font-bold text-slate-200">CEO Board Action Items</h2>
              </div>
              <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                {recommendations.length > 0 ? recommendations.map((rec, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-white/5 bg-white/5 text-xs space-y-1">
                    <span className="font-bold text-indigo-400 font-semibold">{rec.title}</span>
                    <p className="text-slate-300">{rec.description}</p>
                    <div className="text-[10px] text-slate-400 pt-1 flex justify-between">
                      <span>Owner: {rec.representative}</span>
                      <span>Impact: {rec.estimatedValue || 'High'}</span>
                    </div>
                  </div>
                )) : (
                  <div className="py-6 text-center text-xs text-slate-500">No action items recommendation.</div>
                )}
              </div>
            </div>

            {/* Conflicts Alerts */}
            <div className="lg:col-span-1 bg-slate-900/50 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
              <div className="flex items-center gap-2 pb-3 border-b border-white/10 mb-4">
                <AlertTriangle className="h-4.5 w-4.5 text-indigo-400" />
                <h2 className="text-sm font-bold text-slate-200">Resource Conflicts & Auditing</h2>
              </div>
              <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                {conflicts.map((con, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-rose-500/20 bg-rose-500/5 text-xs space-y-1">
                    <span className="font-bold text-rose-400 font-semibold">{con.title}</span>
                    <p className="text-slate-300">{con.description}</p>
                    <p className="text-[10px] text-slate-400 pt-1 font-medium"><span className="font-semibold text-rose-400">Resolution:</span> {con.resolution}</p>
                  </div>
                ))}
                {conflicts.length === 0 && (
                  <div className="py-6 text-center text-xs text-slate-500">No active conflict alerts.</div>
                )}
              </div>
            </div>

            {/* Operating Plan & Roadmap Panel */}
            <div className="lg:col-span-1 bg-slate-900/50 border border-white/10 rounded-2xl p-5 backdrop-blur-md space-y-4">
              <div className="flex items-center pb-3 border-b border-white/10">
                <Hourglass className="h-4.5 w-4.5 text-indigo-400" />
                <h2 className="text-sm font-bold text-slate-200">Execution Plan & Roadmap</h2>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Today / This Week</h3>
                  {operatingPlan ? (
                    <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-xs">
                      <span className="font-bold text-indigo-400">Today:</span> {JSON.parse(operatingPlan.todayPriorities || '[]').join(', ') || 'Audit operations'}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500">Loading plan...</div>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phased Roadmap</h3>
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                    {roadmap.length > 0 ? roadmap.map((rm, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-white/5 border border-white/5 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold text-emerald-400">[{rm.phase}]</span> <span className="text-white/90">{rm.itemText}</span>
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-slate-500" />
                      </div>
                    )) : (
                      <div className="text-xs text-slate-500">Loading roadmap...</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
