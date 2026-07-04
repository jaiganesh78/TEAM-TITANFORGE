'use client';

import React, { useState } from 'react';
import { Database, Plus, RefreshCw, Globe, ArrowUpRight } from 'lucide-react';

export default function KnowledgeBasePage() {
  const [urlInput, setUrlInput] = useState('');
  const [sources, setSources] = useState([
    { id: 's1', url: 'https://titanforge.io', title: 'TitanForge Software Home', status: 'INDEXED', crawledAt: 'July 04, 2026' },
    { id: 's2', url: 'https://titanforge.io/pricing', title: 'Pricing Plans - TitanForge', status: 'INDEXED', crawledAt: 'July 04, 2026' }
  ]);
  const [crawling, setCrawling] = useState(false);

  const handleCrawl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput) return;
    setCrawling(true);
    setTimeout(() => {
      setCrawling(false);
      setSources(prev => [
        ...prev,
        {
          id: `s-${Date.now()}`,
          url: urlInput,
          title: urlInput.replace('https://', '').split('/')[0] + ' Subpage',
          status: 'INDEXED',
          crawledAt: 'Just now'
        }
      ]);
      setUrlInput('');
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Database className="h-6 w-6 text-blue-500" />
          Knowledge Base (Web Crawler)
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Scrape public pages and landing sites to build vector embeddings for AI understanding.</p>
      </div>

      {/* Crawl Form */}
      <form onSubmit={handleCrawl} className="bg-card/50 border border-border rounded-xl p-4 flex gap-2 items-center text-xs">
        <div className="flex-1 flex items-center gap-2 bg-slate-900 border border-border/80 rounded-lg px-3 py-2.5">
          <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
          <input 
            type="url" 
            placeholder="Enter public website URL (e.g. https://yourcompany.com)..." 
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="w-full bg-transparent border-0 ring-0 focus:outline-none text-white placeholder-slate-500"
            required
          />
        </div>
        <button
          type="submit"
          disabled={crawling}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-white text-black hover:bg-slate-200 rounded-lg font-semibold transition-colors disabled:opacity-50"
        >
          {crawling ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          <span>{crawling ? 'Crawling...' : 'Crawl Site'}</span>
        </button>
      </form>

      {/* Index List */}
      <div className="bg-card/40 border border-border/80 rounded-xl overflow-hidden text-xs">
        <div className="px-4 py-3 border-b border-border bg-card/60">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">Crawled Links ({sources.length})</h2>
        </div>

        <div className="divide-y divide-border/60">
          {sources.map((src) => (
            <div key={src.id} className="p-3.5 flex justify-between items-center hover:bg-accent/20 transition-all">
              <div className="space-y-0.5 overflow-hidden pr-4">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white truncate">{src.title}</span>
                  <span className="text-[8px] font-bold px-1 rounded bg-emerald-500/20 text-emerald-400">
                    {src.status}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground truncate">{src.url}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[10px] text-muted-foreground">Synced: {src.crawledAt}</span>
                <a href={src.url} target="_blank" rel="noreferrer" className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-white transition-colors">
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
