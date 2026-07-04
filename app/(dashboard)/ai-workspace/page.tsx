'use client';

import React, { useState } from 'react';
import { Cpu, Send, Check, Shield, TrendingUp, AlertTriangle } from 'lucide-react';

export default function AiWorkspacePage() {
  const [activeTab, setActiveTab] = useState<'agents' | 'debate'>('debate');

  const debateRounds = [
    {
      agent: 'Finance Advisor',
      avatar: 'F',
      stance: 'SUPPORT',
      text: 'Reducing AWS compute over-provisioning directly expands our monthly cash runway. It represents the lowest-risk cost saving available.',
    },
    {
      agent: 'Performance Monitor',
      avatar: 'P',
      stance: 'OPPOSE',
      text: 'Consolidating database replicas may increase response latencies during European peak periods (9AM-11AM UTC). This could violate our 300ms SLA.',
    },
    {
      agent: 'Reflector Chief',
      avatar: 'R',
      stance: 'COMPROMISE',
      text: 'We can consolidate compute, but must maintain active auto-scaling trigger thresholds and preserve DB replicas to guarantee SLA performance.',
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Cpu className="h-6 w-6 text-blue-500" />
          AI Workspace
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Observe, review, and prompt the AI Executive Board as they analyze operations.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border text-xs font-semibold">
        <button 
          onClick={() => setActiveTab('debate')}
          className={`pb-2.5 px-4 border-b-2 transition-all ${
            activeTab === 'debate' ? 'border-white text-white' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Active Board Debate
        </button>
        <button 
          onClick={() => setActiveTab('agents')}
          className={`pb-2.5 px-4 border-b-2 transition-all ${
            activeTab === 'agents' ? 'border-white text-white' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Registered Agents ({debateRounds.length})
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'debate' ? (
        <div className="space-y-4">
          
          {/* Debate Stream */}
          <div className="bg-card/40 border border-border/80 rounded-xl p-5 space-y-4.5">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <h2 className="text-sm font-semibold text-white">Topic: Optimize Cloud Infrastructure Costs</h2>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-500/25 text-blue-400">ROUND 2</span>
            </div>

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
              {debateRounds.map((round, idx) => {
                const isSupport = round.stance === 'SUPPORT';
                const isOppose = round.stance === 'OPPOSE';

                let stanceColor = 'text-slate-400 bg-slate-800';
                if (isSupport) stanceColor = 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20';
                if (isOppose) stanceColor = 'text-red-400 bg-red-500/10 border border-red-500/20';

                return (
                  <div key={idx} className="flex gap-3 text-xs leading-relaxed items-start">
                    <div className="h-7 w-7 rounded-full bg-accent flex items-center justify-center font-bold text-white shrink-0 mt-0.5">
                      {round.avatar}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{round.agent}</span>
                        <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded uppercase ${stanceColor}`}>
                          {round.stance}
                        </span>
                      </div>
                      <p className="text-muted-foreground">{round.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Command Prompt */}
          <div className="bg-card/50 border border-border rounded-xl p-3 flex gap-2 items-center">
            <input 
              type="text" 
              placeholder="Inject a prompt or parameter to steer the board..." 
              className="flex-1 bg-transparent border-0 ring-0 focus:outline-none text-xs text-white placeholder-slate-500 px-2"
            />
            <button className="p-2 bg-white text-black hover:bg-slate-200 rounded-lg transition-colors shadow">
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>

        </div>
      ) : (
        /* Agents Registry Panel */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card/50 border border-border rounded-xl p-4.5 space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="h-4.5 w-4.5 text-blue-400" />
              <h3 className="text-xs font-semibold text-white">Finance Advisor</h3>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">Dedicated to monitoring revenue growth, budget constraints, ARR optimization, and burn-rate reduction strategies.</p>
          </div>

          <div className="bg-card/50 border border-border rounded-xl p-4.5 space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-purple-400" />
              <h3 className="text-xs font-semibold text-white">Performance Monitor</h3>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">Monitors technological infrastructure logs, latency thresholds, server health metrics, and software SLAs.</p>
          </div>

          <div className="bg-card/50 border border-border rounded-xl p-4.5 space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4.5 w-4.5 text-yellow-400" />
              <h3 className="text-xs font-semibold text-white">Reflector Chief</h3>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">Orchestrates compromises, reviews conflicting recommendations, acts as the moderator, and signs off on final options.</p>
          </div>
        </div>
      )}

    </div>
  );
}
