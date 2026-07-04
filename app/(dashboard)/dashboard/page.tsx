'use client';

import React, { useState } from 'react';
import { 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb, 
  Hourglass, 
  ArrowUpRight, 
  ShieldAlert, 
  Activity,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function DashboardPage() {
  const [loading, setLoading] = useState(false);

  // Mock dashboard state
  const metrics = {
    revenue: '$148,200',
    revenueGrowth: '+12.4%',
    burnRate: '$42,500',
    burnRateChange: '-5.2%',
    runway: '12.4 months',
    pmfScore: '82/100',
    growthScore: '78/100',
    activeAlerts: 2,
    opportunities: 4
  };

  const opportunities = [
    { id: 'op1', title: 'AWS Cloud Spend Optimization', value: '$90,000/yr', difficulty: 'EASY', cert: '94% cert' },
    { id: 'op2', title: 'Pricing Model Expansion (Tiered Upgrades)', value: '$120,000/yr', difficulty: 'MEDIUM', cert: '88% cert' },
    { id: 'op3', title: 'Self-Serve Developer Checkout Pipeline', value: '$45,000/yr', difficulty: 'EASY', cert: '91% cert' }
  ];

  const risks = [
    { id: 'r1', title: 'Cash Runway Warning', desc: 'Current burn rate gives less than 13 months of cash reserves.', severity: 'HIGH' },
    { id: 'r2', title: 'Database Response Latency', desc: 'Avg read spikes above 300ms SLA during peak European hours.', severity: 'MEDIUM' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Executive Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Real-time business health and AI recommendations.</p>
        </div>
        <div className="flex items-center gap-2 text-xs border border-border bg-card/40 backdrop-blur-md px-3 py-1.5 rounded-lg text-muted-foreground font-medium">
          <Clock className="h-3.5 w-3.5" />
          <span>Last updated: Just now</span>
        </div>
      </div>

      {/* Grid: 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Revenue Card */}
        <div className="bg-card/50 border border-border/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-xs font-medium">Annual Recurring Revenue</span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2.5">
            <p className="text-2xl font-bold text-white leading-none">{metrics.revenue}</p>
            <p className="text-[10px] text-emerald-500 mt-1 font-medium flex items-center gap-0.5">
              {metrics.revenueGrowth} <span className="text-muted-foreground">vs last month</span>
            </p>
          </div>
        </div>

        {/* Burn Rate Card */}
        <div className="bg-card/50 border border-border/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-xs font-medium">Monthly Burn Rate</span>
            <Activity className="h-4 w-4 text-orange-500" />
          </div>
          <div className="mt-2.5">
            <p className="text-2xl font-bold text-white leading-none">{metrics.burnRate}</p>
            <p className="text-[10px] text-emerald-500 mt-1 font-medium flex items-center gap-0.5">
              {metrics.burnRateChange} <span className="text-muted-foreground">improvement</span>
            </p>
          </div>
        </div>

        {/* Runway Card */}
        <div className="bg-card/50 border border-border/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-xs font-medium">Cash Runway</span>
            <Hourglass className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2.5">
            <p className="text-2xl font-bold text-white leading-none">{metrics.runway}</p>
            <p className="text-[10px] text-muted-foreground mt-1">Estimated until exhaustion</p>
          </div>
        </div>

        {/* Growth/PMF Score */}
        <div className="bg-card/50 border border-border/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-xs font-medium">Growth Score</span>
            <CheckCircle2 className="h-4 w-4 text-purple-500" />
          </div>
          <div className="mt-2.5">
            <p className="text-2xl font-bold text-white leading-none">{metrics.growthScore}</p>
            <p className="text-[10px] text-purple-400 mt-1 font-medium">85th percentile of industry</p>
          </div>
        </div>
      </div>

      {/* Grid: Risks, Opportunities, and Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Risks/Alerts Section */}
        <div className="lg:col-span-1 bg-card/40 border border-border/60 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <ShieldAlert className="h-4 w-4 text-red-500" />
            <h2 className="text-sm font-semibold text-white">Active Risk Alerts</h2>
          </div>
          
          <div className="space-y-3">
            {risks.map((risk) => (
              <div 
                key={risk.id}
                className={`p-3 rounded-lg border text-xs ${
                  risk.severity === 'HIGH' 
                    ? 'border-red-500/20 bg-red-500/5' 
                    : 'border-yellow-500/20 bg-yellow-500/5'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-white">{risk.title}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                    risk.severity === 'HIGH' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>{risk.severity}</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">{risk.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Opportunities / Recommendations Section */}
        <div className="lg:col-span-2 bg-card/40 border border-border/60 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Lightbulb className="h-4 w-4 text-yellow-500" />
            <h2 className="text-sm font-semibold text-white">Growth & Optimization Recommendations</h2>
          </div>

          <div className="divide-y divide-border/60">
            {opportunities.map((op) => (
              <div key={op.id} className="py-3 flex justify-between items-center group first:pt-0 last:pb-0">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-white group-hover:text-blue-400 transition-colors">{op.title}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-emerald-400 font-medium">Est. Value: {op.value}</span>
                    <span className="text-[9px] px-1.5 py-0.5 bg-accent/40 rounded text-muted-foreground font-semibold">Difficulty: {op.difficulty}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground font-semibold">{op.cert}</span>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-white transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
