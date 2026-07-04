'use client';

import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Search, 
  Filter, 
  RefreshCw, 
  Layers, 
  ShieldCheck,
  TrendingUp, 
  Loader2, 
  History, 
  Camera, 
  CheckCircle, 
  AlertTriangle,
  Info
} from 'lucide-react';

export default function KnowledgeCenterPage() {
  const [activeBiz, setActiveBiz] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [snapping, setSnapping] = useState(false);

  // States
  const [health, setHealth] = useState<any | null>(null);
  const [chunks, setChunks] = useState<any[]>([]);
  const [selectedChunk, setSelectedChunk] = useState<any | null>(null);
  const [snapshots, setSnapshots] = useState<any[]>([]);

  // Search parameters
  const [query, setQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [confidenceThreshold, setConfidenceThreshold] = useState(50);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);

  // Snapshot trigger form
  const [topic, setTopic] = useState('Marketing');
  const [version, setVersion] = useState(1);

  // Fetch active business
  const fetchActiveBusiness = async () => {
    try {
      const res = await fetch('/api/business');
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setActiveBiz(data.data[0]);
        loadDashboardData(data.data[0].id);
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  };

  const loadDashboardData = async (businessId: string) => {
    try {
      // 1. Fetch Health stats
      const hRes = await fetch(`/api/knowledge/health/${businessId}`);
      const hData = await hRes.json();
      if (hData.success) setHealth(hData.data);

      // 2. Fetch all Chunks
      const cRes = await fetch(`/api/knowledge/chunks/${businessId}`);
      const cData = await cRes.json();
      if (cData.success) {
        setChunks(cData.data);
        if (cData.data.length > 0) setSelectedChunk(cData.data[0]);
      }

      // 3. Fetch snapshots
      const sRes = await fetch(`/api/knowledge/snapshots/${businessId}`);
      const sData = await sRes.json();
      if (sData.success) setSnapshots(sData.data);

      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveBusiness();
  }, []);

  // Trigger manual refresh pipeline
  const handleRefresh = async () => {
    if (!activeBiz) return;
    setRefreshing(true);
    try {
      const res = await fetch(`/api/knowledge/refresh/${activeBiz.id}`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await loadDashboardData(activeBiz.id);
      }
      setRefreshing(false);
    } catch {
      setRefreshing(false);
    }
  };

  // Run search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !activeBiz) return;
    setSearching(true);
    try {
      let url = `/api/knowledge/search/${activeBiz.id}?q=${encodeURIComponent(query)}`;
      if (sourceFilter !== 'ALL') {
        url += `&sourceType=${sourceFilter}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.data);
        setSearched(true);
      }
      setSearching(false);
    } catch {
      setSearching(false);
    }
  };

  // Trigger context snapshot creation
  const handleCreateSnapshot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBiz) return;
    setSnapping(true);
    try {
      const res = await fetch(`/api/knowledge/snapshot/${activeBiz.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, version })
      });
      const data = await res.json();
      if (data.success) {
        // Refresh snapshots list
        const sRes = await fetch(`/api/knowledge/snapshots/${activeBiz.id}`);
        const sData = await sRes.json();
        if (sData.success) setSnapshots(sData.data);
      }
      setSnapping(false);
    } catch {
      setSnapping(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-2 text-xs text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
        <span>Loading Knowledge Base metrics...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Database className="h-5.5 w-5.5 text-blue-500" />
            Knowledge & RAG Intelligence Center
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Partition searchable datasets into vector collections, query explainability metadata, and capture context snapshots.</p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/35 text-blue-400 text-xs font-bold rounded-lg transition-all"
        >
          {refreshing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          <span>Re-Index Chunks</span>
        </button>
      </div>

      {/* Health Metrics Grid */}
      {health && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
          <div className="bg-card/45 border border-border/80 p-3 rounded-xl space-y-2">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Freshness Index</span>
            <p className="text-xl font-bold text-white">{Math.round(health.freshnessScore)}%</p>
            <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden">
              <div className="bg-emerald-500 h-full" style={{ width: `${health.freshnessScore}%` }} />
            </div>
          </div>
          <div className="bg-card/45 border border-border/80 p-3 rounded-xl space-y-2">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Twin Coverage</span>
            <p className="text-xl font-bold text-white">{health.coverageScore}%</p>
            <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden">
              <div className="bg-blue-500 h-full" style={{ width: `${health.coverageScore}%` }} />
            </div>
          </div>
          <div className="bg-card/45 border border-border/80 p-3 rounded-xl space-y-2">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Source Diversity</span>
            <p className="text-xl font-bold text-white">{health.sourceDiversityScore}%</p>
            <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden">
              <div className="bg-indigo-500 h-full" style={{ width: `${health.sourceDiversityScore}%` }} />
            </div>
          </div>
          <div className="bg-card/45 border border-border/80 p-3 rounded-xl space-y-2">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Version Health</span>
            <p className="text-xl font-bold text-white">{health.versionHealthScore}%</p>
            <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden">
              <div className="bg-amber-500 h-full" style={{ width: `${health.versionHealthScore}%` }} />
            </div>
          </div>
          <div className="bg-card/45 border border-border/80 p-3 rounded-xl space-y-2">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Review Rate</span>
            <p className="text-xl font-bold text-white">{health.reviewHealthScore}%</p>
            <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden">
              <div className="bg-cyan-500 h-full" style={{ width: `${health.reviewHealthScore}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: RAG search & Snapshots */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Hybrid search tool */}
          <div className="bg-card/45 border border-border/80 rounded-xl p-4 space-y-4">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Search className="h-4 w-4 text-blue-500" />
              RAG Query Sandbox
            </h2>

            <form onSubmit={handleSearch} className="space-y-3.5">
              <div className="space-y-1.5 text-xs">
                <label className="font-semibold text-muted-foreground">Search Query</label>
                <input
                  type="text"
                  placeholder="e.g. Marketing channels..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-border/80 text-white rounded-lg p-2.5 text-xs focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="space-y-1.5 text-xs">
                <label className="font-semibold text-muted-foreground">Partition Source Filter</label>
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="w-full bg-slate-900 border border-border/80 text-white rounded-lg p-2.5 text-xs focus:outline-none"
                >
                  <option value="ALL">All Collections</option>
                  <option value="DOCUMENT">Documents Core</option>
                  <option value="WEBSITE">Website Crawls</option>
                </select>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between font-semibold text-muted-foreground">
                  <span>Confidence Threshold</span>
                  <span>{confidenceThreshold}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={confidenceThreshold}
                  onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>

              <button
                type="submit"
                disabled={searching}
                className="w-full py-2 bg-blue-500 text-black hover:bg-blue-400 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                {searching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
                <span>Retrieve Context</span>
              </button>
            </form>
          </div>

          {/* Snapshots builder */}
          <div className="bg-card/45 border border-border/80 rounded-xl p-4 space-y-4">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Camera className="h-4 w-4 text-emerald-500" />
              Context Snapshot Builder
            </h2>

            <form onSubmit={handleCreateSnapshot} className="space-y-3.5">
              <div className="space-y-1.5 text-xs">
                <label className="font-semibold text-muted-foreground">Topic Package Scope</label>
                <input
                  type="text"
                  placeholder="e.g. Marketing, Financial Summary"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-slate-900 border border-border/80 text-white rounded-lg p-2 text-xs focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5 text-xs">
                <label className="font-semibold text-muted-foreground">Snapshot Version</label>
                <input
                  type="number"
                  min="1"
                  value={version}
                  onChange={(e) => setVersion(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-border/80 text-white rounded-lg p-2 text-xs focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={snapping}
                className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/35 text-emerald-400 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                {snapping ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
                <span>Create Snapshot</span>
              </button>
            </form>

            {/* Snapshots log list */}
            {snapshots.length > 0 && (
              <div className="space-y-2 mt-4">
                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Immutable Snapshots ({snapshots.length})</h3>
                <div className="max-h-36 overflow-y-auto divide-y divide-border/60 pr-1 text-[10px]">
                  {snapshots.map((snap) => (
                    <div key={snap.id} className="py-2 flex justify-between items-center text-slate-350">
                      <div>
                        <p className="font-bold text-white">{snap.topic} (V{snap.contextVersion})</p>
                        <p className="text-[9px] text-muted-foreground">Twin V{snap.digitalTwinVersion} • RAG V{snap.knowledgeVersion}</p>
                      </div>
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.5 rounded">
                        {snap.confidenceSummary}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Center column: Chunks Explorer / Results */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Chunks List Panel */}
            <div className="bg-card/40 border border-border/80 rounded-xl overflow-hidden flex flex-col min-h-[400px]">
              <div className="px-4 py-3 border-b border-border bg-card/60">
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                  {searched ? `Search Results (${searchResults.length})` : `All Indexed Chunks (${chunks.length})`}
                </h2>
              </div>

              <div className="divide-y divide-border/60 overflow-y-auto max-h-[500px] flex-1 text-xs">
                {(searched ? searchResults : chunks).length > 0 ? (
                  (searched ? searchResults : chunks).map((chunk) => {
                    const isSelected = selectedChunk?.id === chunk.id || selectedChunk?.chunkId === chunk.id;
                    const displayContent = chunk.content || chunk.document;
                    const confidenceVal = chunk.explainability?.confidence || 90;

                    if (confidenceVal < confidenceThreshold) return null;

                    return (
                      <div 
                        key={chunk.id} 
                        onClick={() => setSelectedChunk(chunk)}
                        className={`p-3.5 text-left cursor-pointer transition-all space-y-2 ${
                          isSelected ? 'bg-blue-500/10 border-l-2 border-blue-500' : 'hover:bg-accent/15'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded uppercase">
                            {chunk.sourceType || 'DOCUMENT'}
                          </span>
                          {chunk.status && (
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                              chunk.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                            }`}>
                              {chunk.status}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-300 font-medium text-[11px] line-clamp-2">{displayContent}</p>
                        <p className="text-[10px] text-muted-foreground truncate">Source: {chunk.source || chunk.explainability?.source}</p>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-12 text-center text-muted-foreground flex flex-col justify-center h-full gap-2">
                    <Layers className="h-6 w-6 text-slate-500 mx-auto" />
                    <p className="font-semibold text-white">No chunks indexed.</p>
                    <p className="text-[10px]">Refresh the indexes or upload documents to generate data.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Details & Metadata Inspector */}
            <div className="bg-card/40 border border-border/80 rounded-xl p-4 flex flex-col min-h-[400px] text-xs">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider border-b border-border pb-3 flex items-center gap-1.5">
                <Info className="h-4 w-4 text-indigo-400" />
                Chunk Inspector
              </h2>

              {selectedChunk ? (
                <div className="space-y-4 mt-3 overflow-y-auto max-h-[500px] flex-1">
                  
                  {/* Content snippet */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Chunk Text Extract</span>
                    <div className="bg-slate-950/60 p-3 rounded-lg border border-border/40 text-[11px] text-slate-200 leading-relaxed font-mono whitespace-pre-wrap">
                      {selectedChunk.content || selectedChunk.document}
                    </div>
                  </div>

                  {/* Explainability metadata */}
                  {selectedChunk.explainability && (
                    <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-3 space-y-2">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                        <TrendingUp className="h-3.5 w-3.5" />
                        Retrieval Explainability
                      </span>
                      <p className="text-[10px] text-slate-300 italic">"{selectedChunk.explainability.whySelected}"</p>
                      <div className="grid grid-cols-2 gap-2 text-[9px] font-mono mt-1 text-slate-400">
                        <div>Match Score: <span className="text-indigo-300 font-bold">{selectedChunk.explainability.matchingScore}</span></div>
                        <div>Vector Score: <span className="text-indigo-300 font-bold">{selectedChunk.explainability.vectorScore}</span></div>
                        <div>Keyword Score: <span className="text-indigo-300 font-bold">{selectedChunk.explainability.keywordScore}</span></div>
                        <div>Confidence: <span className="text-emerald-400 font-bold">{selectedChunk.explainability.confidence}%</span></div>
                      </div>
                    </div>
                  )}

                  {/* Metadata Tag table list */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Metadata Parameters</span>
                    <div className="divide-y divide-border/60 bg-slate-950/30 rounded-lg border border-border/40 overflow-hidden font-mono text-[9px]">
                      {selectedChunk.metadata ? (
                        selectedChunk.metadata.map((m: any) => (
                          <div key={m.id} className="p-2 flex justify-between items-center text-slate-300 hover:bg-slate-900/40">
                            <span className="text-muted-foreground">{m.key}</span>
                            <span className="font-semibold truncate max-w-[150px]">{m.value}</span>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-center text-muted-foreground italic">No key-value attributes.</div>
                      )}
                    </div>
                  </div>

                  {/* Version Differentials */}
                  {selectedChunk.diffInfo && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-1">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Version Diff Log
                      </span>
                      <div className="bg-rose-500/5 border border-rose-500/20 p-2.5 rounded-lg text-[10px] text-slate-350 italic">
                        {selectedChunk.diffInfo}
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground italic">
                  Select an indexed chunk to inspect its tags and explainability rankings.
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
