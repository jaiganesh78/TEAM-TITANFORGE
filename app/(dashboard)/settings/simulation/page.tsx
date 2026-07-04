'use client';

import React, { useState } from 'react';
import { Play, RotateCcw, AlertCircle, BarChart, ArrowUpRight } from 'lucide-react';

export default function SimulationPage() {
  const [action, setAction] = useState('Optimize AWS Compute Spend');
  const [duration, setDuration] = useState(12);
  const [simulating, setSimulating] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    setSimulating(true);
    setResult(null);

    setTimeout(() => {
      setSimulating(false);
      setResult({
        burnRate: { baseline: 45000, simulated: 37500, diff: -7500, pct: -16.6 },
        runway: { baseline: 12.2, simulated: 14.6, diff: 2.4, pct: 19.6 },
        constraints: [
          { name: 'SLA Latency Check', passed: true, details: 'Average stays below 280ms (< 300ms SLA limit)' }
        ]
      });
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Play className="h-6 w-6 text-blue-500" />
          Decision Simulator
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Simulate tactical changes to forecast LTV, runway, burn-rates, and product constraints.</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Simulator Form */}
        <form onSubmit={handleSimulate} className="bg-card/40 border border-border rounded-xl p-5.5 space-y-4 text-xs">
          
          <div className="space-y-1.5">
            <label className="font-semibold text-white">Proposed Action</label>
            <select 
              value={action} 
              onChange={(e) => setAction(e.target.value)}
              className="w-full bg-slate-900 border border-border/80 rounded-lg p-2.5 text-white focus:border-blue-500 focus:outline-none transition-colors"
            >
              <option value="Optimize AWS Compute Spend">Optimize AWS Compute Spend</option>
              <option value="Raise pricing tiers by 10%">Raise pricing tiers by 10%</option>
              <option value="Hire 2 Senior Full-Stack Engineers">Hire 2 Senior Full-Stack Engineers</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-white">Projection Horizon (Months)</label>
            <input 
              type="number" 
              value={duration} 
              onChange={(e) => setDuration(Number(e.target.value))}
              min={1} 
              max={36}
              className="w-full bg-slate-900 border border-border/80 rounded-lg p-2.5 text-white focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="submit"
              disabled={simulating}
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white text-black hover:bg-slate-200 rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>{simulating ? 'Running Projections...' : 'Execute Simulation'}</span>
            </button>
          </div>

        </form>

        {/* Results Panel */}
        <div className="bg-card/40 border border-border rounded-xl p-5.5 flex flex-col justify-between min-h-[220px]">
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider border-b border-border pb-2 mb-3">Simulation Forecasts</h2>
            
            {simulating && (
              <div className="h-28 flex items-center justify-center text-xs text-muted-foreground animate-pulse">
                Analyzing twin model parameter outcomes...
              </div>
            )}

            {!simulating && !result && (
              <div className="h-28 flex items-center justify-center text-xs text-muted-foreground text-center px-4 leading-relaxed">
                Set options and trigger simulation to generate financial projections and KPI outcomes.
              </div>
            )}

            {!simulating && result && (
              <div className="space-y-3.5 text-xs">
                {/* Burn rate forecast */}
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-muted-foreground">Monthly Burn Rate</p>
                    <p className="text-white font-semibold mt-0.5">${result.burnRate.simulated.toLocaleString()}</p>
                  </div>
                  <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded text-[10px]">
                    {result.burnRate.pct}% MoM
                  </span>
                </div>

                {/* Runway forecast */}
                <div className="border-t border-border/40 pt-2.5 flex justify-between items-center">
                  <div>
                    <p className="text-muted-foreground">Cash Runway</p>
                    <p className="text-white font-semibold mt-0.5">{result.runway.simulated} Months</p>
                  </div>
                  <span className="text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded text-[10px]">
                    +{result.runway.diff} Months
                  </span>
                </div>

                {/* Constraint checks */}
                <div className="border-t border-border/40 pt-2.5">
                  <p className="text-muted-foreground mb-1.5 font-medium">Constraints Verification</p>
                  {result.constraints.map((c: any, idx: number) => (
                    <div key={idx} className="flex gap-1.5 items-start text-[10px]">
                      <span className="h-3.5 w-3.5 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-extrabold text-[8px] mt-0.5">✓</span>
                      <div>
                        <p className="text-white font-semibold">{c.name}</p>
                        <p className="text-muted-foreground mt-0.5">{c.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
