'use client';

import React from 'react';
import { TrendingUp, Award, BarChart3, PieChart } from 'lucide-react';

export default function AnalyticsPage() {
  // Chart data
  const revenueHistory = [
    { month: 'Jan', val: 98000 },
    { month: 'Feb', val: 105000 },
    { month: 'Mar', val: 114000 },
    { month: 'Apr', val: 122000 },
    { month: 'May', val: 135000 },
    { month: 'Jun', val: 148200 }
  ];

  const maxVal = Math.max(...revenueHistory.map(r => r.val));

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-blue-500" />
          KPI Analytics
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Track financial, operational, and customer health metrics over time.</p>
      </div>

      {/* Grid: 2 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Revenue Growth Trend */}
        <div className="bg-card/40 border border-border/80 rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-border">
            <h2 className="text-sm font-semibold text-white">Monthly Recurring Revenue (MRR) Trend</h2>
            <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">+12.4% MoM</span>
          </div>

          {/* SVG Bar Chart */}
          <div className="h-[200px] flex items-end justify-between gap-2.5 pt-4 px-2">
            {revenueHistory.map((item) => {
              const heightPercent = (item.val / maxVal) * 100;
              return (
                <div key={item.month} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <span className="text-[10px] font-semibold text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    ${(item.val / 1000).toFixed(0)}k
                  </span>
                  <div 
                    className="w-full bg-blue-500/80 hover:bg-blue-400 rounded-md transition-all duration-300 cursor-pointer"
                    style={{ height: `${heightPercent * 0.75}%` }}
                  />
                  <span className="text-[10px] font-medium text-muted-foreground">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* LTV & CAC Efficiency Card */}
        <div className="bg-card/40 border border-border/80 rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-border">
            <h2 className="text-sm font-semibold text-white">Customer Acquisition Metrics</h2>
            <span className="text-[10px] text-purple-400 font-semibold bg-purple-500/10 px-2 py-0.5 rounded-full">LTV/CAC Ratio: 3.5x</span>
          </div>

          <div className="grid grid-cols-2 gap-4 h-[200px] items-center">
            
            {/* Metric Displays */}
            <div className="space-y-4">
              <div className="p-3 bg-accent/20 border border-border rounded-lg">
                <p className="text-[10px] text-muted-foreground font-medium">Customer Acquisition Cost (CAC)</p>
                <p className="text-lg font-bold text-white mt-0.5">$1,200</p>
                <p className="text-[9px] text-emerald-400 mt-0.5">-8.4% improvement</p>
              </div>

              <div className="p-3 bg-accent/20 border border-border rounded-lg">
                <p className="text-[10px] text-muted-foreground font-medium">Customer Lifetime Value (LTV)</p>
                <p className="text-lg font-bold text-white mt-0.5">$4,200</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">Based on 2.4% avg churn</p>
              </div>
            </div>

            {/* Simple Visual representation */}
            <div className="flex flex-col items-center justify-center p-4 bg-slate-950/40 border border-border/60 rounded-xl space-y-3">
              <div className="relative h-20 w-20 flex items-center justify-center">
                <svg className="absolute inset-0 h-full w-full transform -rotate-90">
                  <circle cx="40" cy="40" r="32" stroke="#1e293b" strokeWidth="6" fill="transparent" />
                  <circle cx="40" cy="40" r="32" stroke="#6366f1" strokeWidth="6" fill="transparent" strokeDasharray="200" strokeDashoffset="50" />
                </svg>
                <span className="text-xs font-bold text-white">75%</span>
              </div>
              <p className="text-[10px] text-muted-foreground text-center">Unit Economic Score (Optimal)</p>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
