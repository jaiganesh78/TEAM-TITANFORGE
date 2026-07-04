'use client';

import React, { useState, useEffect } from 'react';
import { 
  Loader2, 
  CheckCircle2, 
  Sparkles, 
  Cpu, 
  Zap, 
  TrendingUp,
  BarChart3,
  Compass
} from 'lucide-react';

interface JobStatus {
  id: string;
  taskType: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
}

export default function CompletionPage() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing Strategy playbook rules...');
  const [jobStates, setJobStates] = useState<JobStatus[]>([]);

  useEffect(() => {
    let jobIds: string[] = [];
    try {
      const stored = localStorage.getItem('titanforge_onboarding_jobs');
      if (stored) {
        jobIds = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error parsing stored onboarding jobs:', e);
    }

    let pollInterval: NodeJS.Timeout;

    if (jobIds.length > 0) {
      // Real-time job polling
      const pollJobs = async () => {
        try {
          const res = await fetch('/api/discovery/jobs/status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jobIds })
          });
          
          if (res.ok) {
            const result = await res.json();
            if (result.success && Array.isArray(result.data)) {
              const jobs: JobStatus[] = result.data;
              setJobStates(jobs);

              // Calculate overall progress percentage
              const completedCount = jobs.filter(j => j.status === 'COMPLETED' || j.status === 'FAILED').length;
              const processingCount = jobs.filter(j => j.status === 'PROCESSING').length;
              
              // We assign: COMPLETED/FAILED = 100%, PROCESSING = 50%, PENDING = 10%
              const totalProgress = jobs.reduce((acc, job) => {
                if (job.status === 'COMPLETED' || job.status === 'FAILED') return acc + 100;
                if (job.status === 'PROCESSING') return acc + 50;
                return acc + 10;
              }, 0);
              
              const averageProgress = Math.round(totalProgress / jobs.length);
              setProgress(averageProgress);

              // Update user facing sequential description
              if (averageProgress < 30) {
                setStatusText('Initializing Strategy playbook rules...');
              } else if (averageProgress < 60) {
                setStatusText('Analyzing Marketing and CAC ratios...');
              } else if (averageProgress < 85) {
                setStatusText('Enqueuing sales CRM projections...');
              } else {
                setStatusText('Bootstrapping Executive command widgets...');
              }

              // Check if all jobs finished
              if (completedCount === jobs.length) {
                clearInterval(pollInterval);
                setProgress(100);
                setTimeout(() => {
                  window.location.href = '/dashboard';
                }, 1200);
              }
            }
          }
        } catch (err) {
          console.error('Error fetching job statuses:', err);
        }
      };

      pollJobs();
      pollInterval = setInterval(pollJobs, 1500);
    } else {
      // Fallback: Mock sequential progress if no job IDs exist in localStorage
      let currentProgress = 0;
      pollInterval = setInterval(() => {
        currentProgress += 5;
        if (currentProgress > 100) currentProgress = 100;
        setProgress(currentProgress);

        if (currentProgress < 25) {
          setStatusText('Initializing Strategy playbook rules...');
        } else if (currentProgress < 50) {
          setStatusText('Analyzing Marketing and CAC ratios...');
        } else if (currentProgress < 75) {
          setStatusText('Enqueuing sales CRM projections...');
        } else if (currentProgress < 95) {
          setStatusText('Bootstrapping Executive command widgets...');
        } else {
          setStatusText('Wrapping up Digital Twin compilation...');
        }

        if (currentProgress === 100) {
          clearInterval(pollInterval);
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 1000);
        }
      }, 350);
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-8 max-w-md w-full backdrop-blur-lg text-center space-y-6 shadow-2xl relative overflow-hidden">
        
        {/* Glow effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex justify-center">
          <div className="relative">
            <Loader2 className="h-16 w-16 text-indigo-500 animate-spin" />
            <Sparkles className="h-6 w-6 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-lg font-black text-white tracking-tight uppercase">Compiling Growth Twin</h1>
          <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto">
            Downstream AI engines are building strategy check-lists and operations plans.
          </p>
        </div>

        {/* Progress Bar Container */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-400 font-medium">Build Progress</span>
            <span className="text-indigo-400 font-extrabold">{progress}%</span>
          </div>
          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-indigo-400 h-full transition-all duration-500" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>

        {/* Sequential loading item display */}
        <div className="p-3.5 bg-white/5 border border-white/5 rounded-xl text-left text-xs font-medium text-indigo-300 flex items-center gap-2.5">
          <Zap className="h-4 w-4 text-indigo-400 shrink-0 animate-pulse" />
          <span className="truncate">{statusText}</span>
        </div>

        {/* Downstream Engine checklist */}
        <div className="border-t border-white/5 pt-4 text-left space-y-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Orchestrating Downstream Nodes</span>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {[
              { name: 'Strategy Engine', icon: Compass },
              { name: 'Marketing Engine', icon: BarChart3 },
              { name: 'Sales Engine', icon: TrendingUp },
              { name: 'Analytics Engine', icon: Cpu }
            ].map((engine, idx) => {
              const isDone = progress > (idx + 1) * 23;
              return (
                <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/5">
                  <engine.icon className={`h-3.5 w-3.5 ${isDone ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <span className={isDone ? 'text-slate-200 font-medium' : 'text-slate-500'}>{engine.name}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
