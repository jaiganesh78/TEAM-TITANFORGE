'use client';

import React from 'react';
import { Clock, Milestone, ShieldCheck, HelpCircle } from 'lucide-react';

export default function TimelinePage() {
  const events = [
    {
      id: 'e1',
      title: 'Company Bootstrapped & Initial Discovery',
      description: 'Completed onboarding questionnaire. Digital twin identity set up with B2B SaaS model.',
      date: 'July 04, 2026',
      type: 'MILESTONE',
      status: 'Completed'
    },
    {
      id: 'e2',
      title: 'Cloud Optimization Decision Triggered',
      description: 'AWS instance consolidation approved. Expected savings of $7,500/month in server costs.',
      date: 'July 05, 2026',
      type: 'DECISION',
      status: 'Proposed'
    },
    {
      id: 'e3',
      title: 'Pricing Tiers Strategy Simulation',
      description: 'Simulated 10% raise in pricing tiers to verify CAC/LTV outcomes under market friction.',
      date: 'July 08, 2026',
      type: 'SIMULATION',
      status: 'Scheduled'
    }
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Clock className="h-6 w-6 text-blue-500" />
          Business Timeline
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Audit log of key actions, board decisions, and historical outcomes.</p>
      </div>

      {/* Vertical Timeline */}
      <div className="relative border-l border-border pl-6 ml-3 space-y-6 py-2">
        {events.map((event) => {
          const isMilestone = event.type === 'MILESTONE';
          const isDecision = event.type === 'DECISION';
          
          let circleColor = 'bg-slate-800 border-slate-700';
          if (isMilestone) circleColor = 'bg-blue-500/20 border-blue-500 text-blue-400';
          if (isDecision) circleColor = 'bg-emerald-500/20 border-emerald-500 text-emerald-400';

          return (
            <div key={event.id} className="relative group">
              {/* Vertical node icon */}
              <span className={`absolute left-[-32px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full border ${circleColor} ring-4 ring-background`}>
                <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
              </span>

              {/* Event details */}
              <div className="bg-card/45 border border-border/80 hover:border-border rounded-xl p-4.5 transition-all">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-[10px] text-muted-foreground font-semibold">{event.date}</span>
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${
                    isMilestone ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {event.type}
                  </span>
                </div>
                <h3 className="text-xs font-semibold text-white mt-1.5 group-hover:text-blue-400 transition-colors">{event.title}</h3>
                <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{event.description}</p>
                <div className="flex gap-2 items-center mt-3 pt-2.5 border-t border-border/40 text-[10px]">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-semibold text-slate-300">{event.status}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
