'use client';

import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Play, 
  RotateCw, 
  CheckCircle, 
  Loader2, 
  History, 
  ExternalLink,
  ChevronDown
} from 'lucide-react';

export default function WebsiteCrawlerPage() {
  const [activeBiz, setActiveBiz] = useState<any | null>(null);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [crawling, setCrawling] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  // Fetch active business
  const fetchActiveBusiness = async () => {
    try {
      const res = await fetch('/api/business');
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setActiveBiz(data.data[0]);
        fetchHistory(data.data[0].id);
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  };

  // Fetch crawl runs history
  const fetchHistory = async (businessId: string) => {
    try {
      const res = await fetch(`/api/acquisition/website/${businessId}`);
      const data = await res.json();
      if (data.success) {
        setHistory(data.data);
      }
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveBusiness();
  }, []);

  // Trigger new crawl run
  const triggerCrawl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !activeBiz) return;

    setCrawling(true);
    try {
      const res = await fetch('/api/acquisition/website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: activeBiz.id,
          url: url.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setUrl('');
        // Refresh crawl history list
        fetchHistory(activeBiz.id);
      }
      setCrawling(false);
    } catch {
      setCrawling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-2 text-xs text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
        <span>Initializing Website Crawler...</span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Globe className="h-5.5 w-5.5 text-emerald-500" />
          Website Analysis & Crawling
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">Submit your corporate website domain to trigger automated site structure crawls and extract profile parameters.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Trigger form panel */}
        <div className="md:col-span-1 bg-card/45 border border-border/80 rounded-xl p-4 space-y-4">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">Crawl Trigger</h2>
          
          <form onSubmit={triggerCrawl} className="space-y-3">
            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-muted-foreground">Company URL</label>
              <input
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-slate-900 border border-border/80 text-white rounded-lg p-2.5 text-xs focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={crawling}
              className="w-full flex items-center justify-center gap-1.5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/35 text-emerald-400 text-xs font-bold rounded-lg transition-colors"
            >
              {crawling ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Enqueuing crawl...</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Start Analysis Run</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Crawler execution history panel */}
        <div className="md:col-span-2 bg-card/40 border border-border/80 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-card/60 flex justify-between items-center">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Analysis Runs History</h2>
            <span className="text-[10px] text-muted-foreground font-semibold">Targets: {history.length}</span>
          </div>

          {history.length > 0 ? (
            <div className="divide-y divide-border/60 text-xs">
              {history.map((site) => (
                <div key={site.id} className="p-4 space-y-3 hover:bg-accent/15 transition-all">
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <p className="font-bold text-white flex items-center gap-1">
                        {site.url}
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      </p>
                      <p className="text-[10px] text-muted-foreground">Crawl targets configuration active</p>
                    </div>
                    <span className="text-[8px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded uppercase font-bold">ACTIVE</span>
                  </div>

                  {/* Render analysis runs nested lists */}
                  <div className="pl-4 border-l border-border/80 space-y-2">
                    {site.analysisRuns.map((run: any) => (
                      <div key={run.id} className="flex justify-between items-center bg-slate-950/40 p-2 rounded border border-border/30">
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-semibold text-white">Run ID: {run.id.substring(0, 8)}...</p>
                          <p className="text-[8px] text-muted-foreground">Started: {new Date(run.startedAt).toLocaleString()}</p>
                        </div>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          run.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {run.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-muted-foreground space-y-2">
              <History className="h-6 w-6 text-slate-500 mx-auto" />
              <p className="font-semibold text-white">No website analyses queued yet.</p>
              <p className="text-[10px]">Enter your company homepage URL on the left to extract profile suggestions.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
