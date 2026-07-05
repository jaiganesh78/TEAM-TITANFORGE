'use client';

import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Send, 
  Check, 
  Shield, 
  TrendingUp, 
  AlertTriangle, 
  Play, 
  Loader2, 
  Sparkles, 
  History, 
  Layers,
  HelpCircle,
  Activity,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface Vote {
  engine: string;
  vote: 'SUPPORT' | 'OPPOSE' | 'COMPROMISE';
  reason: string;
}

interface DebateRound {
  recommendationTitle: string;
  votes: Vote[];
}

interface SimulatedDecision {
  id: string;
  title: string;
  choice: string;
  logic: string;
  expectedOutcome: string;
  confidence: number;
  participatingEngines: string;
}

export default function AiWorkspacePage() {
  const [activeTab, setActiveTab] = useState<'debate' | 'decisions' | 'agents'>('debate');
  const [businessId] = useState<string>('mock-business-id'); // aligned with dashboard/page.tsx
  const [loading, setLoading] = useState(true);
  const [runningDebate, setRunningDebate] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [promptInput, setPromptInput] = useState('');
  
  // Data lists
  const [debateRounds, setDebateRounds] = useState<DebateRound[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [decisions, setDecisions] = useState<SimulatedDecision[]>([]);
  const [simulationResult, setSimulationResult] = useState<any | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Load initial data from Express backend
  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch latest meetings (to extract latest debates)
      const meetingsRes = await fetch(`/api/executive-board/meetings/${businessId}`);
      if (meetingsRes.ok) {
        const meetingsData = await meetingsRes.json();
        setMeetings(meetingsData.meetings || []);
        
        // Parse votes from the latest meeting for the active debate stream
        if (meetingsData.meetings && meetingsData.meetings.length > 0) {
          const latestMeeting = meetingsData.meetings[0];
          try {
            const parsedVotes = JSON.parse(latestMeeting.votes);
            setDebateRounds(parsedVotes);
          } catch (e) {
            console.warn('Failed to parse votes from latest meeting:', e);
          }
        }
      }

      // Fetch simulated decisions
      const decisionsRes = await fetch(`/api/executive-board/decisions/${businessId}`);
      if (decisionsRes.ok) {
        const decisionsData = await decisionsRes.json();
        setDecisions(decisionsData.decisions || []);
      }
    } catch (err) {
      console.error('Failed to load board telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [businessId]);

  // Run Sprints 13 Executive Board Orchestration Graph
  const triggerDebate = async () => {
    try {
      setRunningDebate(true);
      showToast('🤖 Activating AI Board Debate Graph...');
      
      const res = await fetch(`/api/executive-board/run/${businessId}`, {
        method: 'POST'
      });
      
      if (res.ok) {
        const data = await res.json();
        showToast('✅ Executive Board synchronization debate completed.');
        if (data.consensus) {
          setDebateRounds(data.consensus);
        }
        await loadData();
      } else {
        showToast('❌ Board orchestration execution failed.');
      }
    } catch (err) {
      console.error(err);
      showToast('❌ Network error starting debate graph.');
    } finally {
      setRunningDebate(false);
    }
  };

  // Run Decision Impact Simulator Graph
  const executeSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;

    try {
      setSimulating(true);
      showToast('⚡ Running Decision Impact Projections...');
      
      const res = await fetch(`/api/executive-board/simulate/${businessId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: promptInput })
      });

      if (res.ok) {
        const data = await res.json();
        setSimulationResult(data.simulation);
        setPromptInput('');
        showToast('📈 Simulation complete. KPI projections saved.');
        await loadData();
      } else {
        showToast('❌ Simulation error. Try a different parameter.');
      }
    } catch (err) {
      console.error(err);
      showToast('❌ Network error simulating decision.');
    } finally {
      setSimulating(false);
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  // Fallback default debate rounds if DB is empty
  const activeDebateRounds = debateRounds.length > 0 ? debateRounds : [
    {
      recommendationTitle: "Optimize Cloud Infrastructure Costs & Re-Allocate CapEx",
      votes: [
        { engine: 'strategy-engine', vote: 'SUPPORT' as const, reason: 'Improves cash runways by re-allocating over-provisioned cloud resource buffers.' },
        { engine: 'marketing-engine', vote: 'COMPROMISE' as const, reason: 'Support if cost savings are routed to high-intent retargeting campaigns.' },
        { engine: 'sales-engine', vote: 'SUPPORT' as const, reason: 'Lowers gross overheads, creating room for mid-market rep commission schemes.' }
      ]
    },
    {
      recommendationTitle: "Accelerate Inbound Lead Capture Loop SEO Strategy",
      votes: [
        { engine: 'lead-generation-engine', vote: 'SUPPORT' as const, reason: 'Organic search optimization increases high-intent SQL volume naturally.' },
        { engine: 'sales-engine', vote: 'SUPPORT' as const, reason: 'Reduces lead response times and increases conversion velocities.' },
        { engine: 'analytics-engine', vote: 'OPPOSE' as const, reason: 'Lacks sufficient historical data logs. Requires 30-day monitoring buffer.' }
      ]
    }
  ];

  const REGISTERED_AGENTS = [
    { name: 'Strategy Architect', engine: 'strategy-engine', icon: '🧭', color: 'text-purple-400', border: 'border-purple-500/25 bg-purple-500/5', desc: 'Constructs commercial priorities, positioning strategies, SWOT matrices, and competitive maps.' },
    { name: 'Growth Marketer', engine: 'marketing-engine', icon: '📣', color: 'text-pink-400', border: 'border-pink-500/25 bg-pink-500/5', desc: 'Formulates multi-channel campaign architectures, budget allocations, and customer journey maps.' },
    { name: 'Lead Intelligence', engine: 'lead-generation-engine', icon: '🎣', color: 'text-amber-400', border: 'border-amber-500/25 bg-amber-500/5', desc: 'Scores acquisition lists, tracks pipeline velocity, and maps ideal customer profiles.' },
    { name: 'Revenue Officer', engine: 'sales-engine', icon: '🎯', color: 'text-emerald-400', border: 'border-emerald-500/25 bg-emerald-500/5', desc: 'Manages sales pipelines, outlines outbound email sequences, and defines qualification parameters.' },
    { name: 'Analytics Auditor', engine: 'analytics-engine', icon: '📊', color: 'text-blue-400', border: 'border-blue-500/25 bg-blue-500/5', desc: 'Calculates overall business health scores, forecasts ARR, and captures historical memory traces.' },
    { name: 'Customer Success', engine: 'customer-success-engine', icon: '🤝', color: 'text-cyan-400', border: 'border-cyan-500/25 bg-cyan-500/5', desc: 'Tracks client retention levels, maps onboarding paths, and minimizes recurring churn risks.' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 bg-blue-600 border border-blue-500 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 animate-bounce">
          <Sparkles className="h-4.5 w-4.5" />
          <span className="text-xs font-semibold">{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-md">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Cpu className="h-6 w-6 text-blue-500 shrink-0" />
            AI Executive Boardroom
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Steer and review the multi-agent consensus network as representatives synchronize strategies.</p>
        </div>
        <button
          onClick={triggerDebate}
          disabled={runningDebate}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow"
        >
          {runningDebate ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Orchestrating Debate...</span>
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5" />
              <span>Run Board Synchronization</span>
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border text-xs font-semibold overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setActiveTab('debate')}
          className={`pb-2.5 px-4 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'debate' ? 'border-white text-white' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Active Board Debate
        </button>
        <button 
          onClick={() => setActiveTab('decisions')}
          className={`pb-2.5 px-4 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'decisions' ? 'border-white text-white' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Decision Simulator ({decisions.length})
        </button>
        <button 
          onClick={() => setActiveTab('agents')}
          className={`pb-2.5 px-4 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'agents' ? 'border-white text-white' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Registered Board Agents ({REGISTERED_AGENTS.length})
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'debate' && (
        <div className="space-y-6">
          {/* Active Debate Stream */}
          <div className="bg-card/40 border border-border/80 rounded-xl p-5 space-y-5">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">Live Debate Rounds</h2>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400">ROUND {meetings.length + 1}</span>
            </div>

            <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
              {activeDebateRounds.map((round, rIdx) => (
                <div key={rIdx} className="space-y-3 bg-slate-900/35 border border-border/40 p-4 rounded-xl">
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5 leading-snug">
                    <Sparkles className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                    Topic: {round.recommendationTitle}
                  </h3>
                  
                  <div className="space-y-3 pl-1.5 border-l border-blue-500/20">
                    {round.votes.map((vote, vIdx) => {
                      const isSupport = vote.vote === 'SUPPORT';
                      const isOppose = vote.vote === 'OPPOSE';

                      let stanceColor = 'text-slate-400 bg-slate-800 border-slate-700/35';
                      if (isSupport) stanceColor = 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20';
                      if (isOppose) stanceColor = 'text-rose-400 bg-rose-500/10 border border-rose-500/20';

                      const agentDetails = REGISTERED_AGENTS.find(a => a.engine === vote.engine) || {
                        name: vote.engine.replace('-engine', '').toUpperCase(),
                        icon: '🤖'
                      };

                      return (
                        <div key={vIdx} className="text-[11px] leading-relaxed space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-200 flex items-center gap-1">
                              <span>{agentDetails.icon}</span>
                              <span>{agentDetails.name}</span>
                            </span>
                            <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded uppercase ${stanceColor}`}>
                              {vote.vote}
                            </span>
                          </div>
                          <p className="text-muted-foreground pl-5">{vote.reason}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'decisions' && (
        <div className="space-y-6">
          {/* Quick Command Prompt Simulation Form */}
          <div className="bg-card/40 border border-border rounded-xl p-5 space-y-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">Hypothetical Impact Projections</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">Input a strategic decision or scenario. Sprints 13 Simulator will project metrics and departmental impact.</p>
            </div>
            
            <form onSubmit={executeSimulation} className="flex gap-2 items-center">
              <input 
                type="text" 
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="e.g. Hire 2 mid-market Sales Representatives and double pricing..." 
                disabled={simulating}
                className="flex-1 bg-slate-900/60 border border-border rounded-xl focus:outline-none focus:border-blue-500 text-xs text-white placeholder-slate-500 px-4 py-2.5"
              />
              <button 
                type="submit"
                disabled={simulating || !promptInput.trim()}
                className="p-2.5 bg-white text-black hover:bg-slate-200 disabled:opacity-50 rounded-xl transition-colors shadow shrink-0"
              >
                {simulating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </form>

            {/* Simulation Highlight Result */}
            {simulationResult && (
              <div className="bg-blue-600/10 border border-blue-500/20 rounded-xl p-4.5 space-y-3.5 animate-fadeIn">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4.5 w-4.5 text-blue-400" />
                    <h3 className="text-xs font-bold text-white">Projection Result</h3>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Confidence: {simulationResult.confidence}%
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                  <div className="bg-slate-950/40 p-2.5 rounded-lg border border-border/40">
                    <span className="text-muted-foreground font-semibold">Executive Narrative:</span>
                    <p className="text-slate-300 mt-0.5">{simulationResult.executiveSummary}</p>
                  </div>
                  <div className="bg-slate-950/40 p-2.5 rounded-lg border border-border/40">
                    <span className="text-muted-foreground font-semibold">Revenue Projection:</span>
                    <p className="text-emerald-400 font-bold mt-0.5">{simulationResult.revenueImpact || 'Calculating...'}</p>
                  </div>
                </div>

                <div className="text-[11px] space-y-1.5">
                  <span className="text-muted-foreground font-semibold block">Identified Strategic Risks:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(simulationResult.risks || []).map((risk: string, idx: number) => (
                      <span key={idx} className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded text-[10px]">
                        ⚠️ {risk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Historical Projections List */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <History className="h-4 w-4" />
              Simulation Ledger
            </h2>

            {decisions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {decisions.map((dec) => (
                  <div key={dec.id} className="bg-slate-900/40 border border-border/80 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <h4 className="text-[11px] font-bold text-white break-words">{dec.title}</h4>
                        <span className="text-[9px] text-muted-foreground block mt-0.5">Command: "{dec.choice}"</span>
                      </div>
                      <span className="text-[9px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 shrink-0">
                        {dec.confidence}% Match
                      </span>
                    </div>

                    <div className="text-[10px] space-y-1 bg-slate-950/40 p-2.5 rounded border border-border/30">
                      <span className="text-slate-400 font-semibold block">Projections & Risks:</span>
                      <p className="text-slate-300">{dec.logic}</p>
                      {dec.expectedOutcome && (
                        <p className="text-emerald-400 font-bold mt-1">Expected Outcome: {dec.expectedOutcome}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-900/20 border border-dashed border-border/60 p-8 text-center rounded-xl text-xs text-muted-foreground">
                No simulated projections registered in this session.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'agents' && (
        /* Registered Agents Panel */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {REGISTERED_AGENTS.map((agent) => (
            <div key={agent.engine} className={`border rounded-xl p-4.5 space-y-2.5 flex flex-col justify-between ${agent.border}`}>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{agent.icon}</span>
                  <h3 className="text-xs font-bold text-white">{agent.name}</h3>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{agent.desc}</p>
              </div>
              <span className="text-[8.5px] uppercase font-bold text-slate-400 bg-slate-800/65 px-2 py-0.5 rounded self-start">
                {agent.engine}
              </span>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
