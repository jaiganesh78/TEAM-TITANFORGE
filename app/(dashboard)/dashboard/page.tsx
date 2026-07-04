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
      // Run board orchestration
      const runRes = await fetch(`/api/executive-board/run/${businessId}`, { method: 'POST' });
      const runData = await runRes.json();

      if (runData.success) {
        setBrief(runData.brief);
        setRecommendations(runData.recommendations || []);
        setConflicts(runData.conflicts || []);
        setConsensus(runData.consensus || []);
      }

      // Fetch KPI Tree
      const treeRes = await fetch(`/api/executive-board/kpi-tree/${businessId}`);
      const treeData = await treeRes.json();
      if (treeData.success) {
        setKpiTree(treeData.tree);
      }

      // Fetch Roadmap
      const roadmapRes = await fetch(`/api/executive-board/roadmap/${businessId}`);
      const roadmapData = await roadmapRes.json();
      if (roadmapData.success) {
        setRoadmap(roadmapData.roadmap || []);
      }

      // Fetch Operating Plan
      const planRes = await fetch(`/api/executive-board/plan/${businessId}`);
      const planData = await planRes.json();
      if (planData.success) {
        setOperatingPlan(planData.plan);
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
      const data = await res.json();
      if (data.success) {
        setSimulationResult(data.simulation);
      }
    } catch (err) {
      console.error('Error simulating command:', err);
    } finally {
      setSimulating(false);
    }
  };

  const toggleNode = (key: string) => {
    setExpandedNodes(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const renderKPITreeNode = (node: KPITreeNode, depth = 0) => {
    const isExpanded = expandedNodes[node.metricKey];
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.metricKey} className="select-none" style={{ marginLeft: `${depth * 14}px` }}>
        <div 
          onClick={() => hasChildren && toggleNode(node.metricKey)}
          className={`flex items-center justify-between p-2 rounded-lg my-1 transition-all ${
            hasChildren ? 'cursor-pointer hover:bg-white/5' : ''
          } border border-transparent hover:border-white/10`}
        >
          <div className="flex items-center gap-2">
            {hasChildren ? (
              isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />
            ) : (
              <span className="w-4" />
            )}
            <span className="text-xs font-semibold text-white/95">{node.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-white/80">{node.value}</span>
            <span className={`px-1.5 py-0.5 text-[8px] font-bold rounded ${
              node.status === 'HEALTHY' ? 'bg-emerald-500/10 text-emerald-400' :
              node.status === 'WARNING' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
            }`}>
              {node.status}
            </span>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div className="border-l border-white/10 ml-4 pl-1">
            {node.children!.map(child => renderKPITreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 text-white min-h-screen bg-transparent">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-slate-900/40 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">TitanForge Executive Command Center</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Executive AI Board Workspace
          </h1>
          <p className="text-xs text-slate-400">Governing company strategy, marketing, leads, sales, analytics, and customer retention workflows.</p>
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
            <h2 className="text-sm font-bold text-slate-200">Hierarchical KPI Drill-down</h2>
          </div>
          {kpiTree ? renderKPITreeNode(kpiTree) : (
            <div className="py-6 text-center text-xs text-slate-500">Loading KPI Tree index...</div>
          )}
        </div>

        {/* Board Debate & Consensus Panel */}
        <div className="lg:col-span-2 bg-slate-900/50 border border-white/10 rounded-2xl p-5 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Vote className="h-4.5 w-4.5 text-indigo-400" />
              <h2 className="text-sm font-bold text-slate-200">Board Consensus & Debate Logs</h2>
            </div>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-mono px-2 py-0.5 rounded">Consensus: 88.0%</span>
          </div>

          <div className="space-y-4">
            {recommendations.length > 0 ? recommendations.map((rec, i) => {
              const matchingDebate = consensus.find(c => c.recommendationTitle === rec.title || c.recommendationId === rec.id);
              return (
                <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xs font-bold text-white">{rec.title}</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">{rec.description}</p>
                    </div>
                    <span className={`px-1.5 py-0.5 text-[8px] font-bold rounded ${
                      rec.priority === 'CRITICAL' || rec.priority === 'HIGH' ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-500/10 text-slate-400'
                    }`}>{rec.priority}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] bg-black/20 p-2.5 rounded-lg">
                    <div><span className="text-slate-500">Expected Outcome:</span> {rec.expectedOutcome}</div>
                    <div><span className="text-slate-500">Alignment:</span> {rec.strategicAlignment}</div>
                  </div>

                  {matchingDebate && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">Engine Representative Votes:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {matchingDebate.votes?.map((voteObj: any, vIdx: number) => (
                          <div 
                            key={vIdx}
                            className={`px-2 py-1 rounded text-[9px] border ${
                              voteObj.vote === 'SUPPORT' 
                                ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' 
                                : 'border-rose-500/20 bg-rose-500/5 text-rose-400'
                            }`}
                            title={voteObj.reason}
                          >
                            <span className="font-semibold">{voteObj.engine}</span>: {voteObj.vote}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            }) : (
              <div className="py-6 text-center text-xs text-slate-500">No active Board recommendations.</div>
            )}
          </div>
        </div>

      </div>

      {/* Operating Plan & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Board Alerts */}
        <div className="lg:col-span-1 bg-slate-900/50 border border-white/10 rounded-2xl p-5 backdrop-blur-md space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/10">
            <ShieldAlert className="h-4.5 w-4.5 text-rose-500" />
            <h2 className="text-sm font-bold text-slate-200">Active Board Alerts</h2>
          </div>
          <div className="space-y-3">
            {conflicts.map((con, idx) => (
              <div key={idx} className="p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">{con.title}</span>
                  <span className="text-[8px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded font-bold">{con.severity}</span>
                </div>
                <p className="text-slate-400 mt-1 leading-relaxed">{con.businessImpact}</p>
                <div className="text-[10px] text-slate-500 mt-1.5 font-medium">Recommended: {con.recommendedResolution}</div>
              </div>
            ))}
            {conflicts.length === 0 && (
              <div className="py-6 text-center text-xs text-slate-500">No active conflict alerts.</div>
            )}
          </div>
        </div>

        {/* Operating Plan & Roadmap Panel */}
        <div className="lg:col-span-2 bg-slate-900/50 border border-white/10 rounded-2xl p-5 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Hourglass className="h-4.5 w-4.5 text-indigo-400" />
              <h2 className="text-sm font-bold text-slate-200">Execution Plan & Roadmap</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Operating Plan Column */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider text-slate-400">Initiatives Checklist</h3>
              {operatingPlan ? (
                <div className="space-y-2">
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-xs">
                    <span className="font-bold text-indigo-400">Today:</span> {JSON.parse(operatingPlan.todayPriorities || '[]').join(', ') || 'Audit operations'}
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-xs">
                    <span className="font-bold text-indigo-400">This Week:</span> {JSON.parse(operatingPlan.thisWeek || '[]').join(', ') || 'Align sales team targets'}
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-xs">
                    <span className="font-bold text-indigo-400">This Month:</span> {JSON.parse(operatingPlan.thisMonth || '[]').join(', ') || 'Publish subscription pricing tiers'}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500">Loading initiatives checklist...</div>
              )}
            </div>

            {/* Roadmap Phases Column */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider text-slate-400">Phased Roadmap</h3>
              <div className="space-y-2">
                {roadmap.length > 0 ? roadmap.map((rm, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-white/5 border border-white/5 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-emerald-400">[{rm.phase}]</span> <span className="text-white/90">{rm.itemText}</span>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-slate-500" />
                  </div>
                )) : (
                  <div className="text-xs text-slate-500">Loading roadmap phases...</div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
