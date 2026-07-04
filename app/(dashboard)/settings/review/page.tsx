'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Edit, 
  Loader2, 
  FolderSync, 
  ShieldAlert,
  Search,
  Filter,
  Check,
  CheckCheck,
  X,
  RefreshCw,
  GitCompare,
  TrendingUp,
  FileText
} from 'lucide-react';

export default function ReviewPage() {
  const [activeBiz, setActiveBiz] = useState<any | null>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState('ALL');
  
  // Inline editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // Fetch active business
  const fetchActiveBusiness = async () => {
    try {
      const res = await fetch('/api/business');
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setActiveBiz(data.data[0]);
        fetchCandidates(data.data[0].id);
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  };

  // Fetch review candidates queue
  const fetchCandidates = async (businessId: string) => {
    try {
      const res = await fetch(`/api/acquisition/review/${businessId}`);
      const data = await res.json();
      if (data.success) {
        setCandidates(data.data);
      }
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveBusiness();
  }, []);

  // Handle single action (ACCEPT/REJECT)
  const handleAction = async (candidateId: string, action: 'ACCEPT' | 'REJECT', finalValue?: string) => {
    if (!activeBiz) return;
    setActingId(candidateId);
    try {
      const res = await fetch('/api/acquisition/review/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId,
          action,
          editedValue: finalValue
        })
      });
      const data = await res.json();
      if (data.success) {
        setEditingId(null);
        // Refresh queue
        fetchCandidates(activeBiz.id);
      }
      setActingId(null);
    } catch {
      setActingId(null);
    }
  };

  // Bulk review execution
  const handleBulkReview = async (action: 'ACCEPT' | 'REJECT') => {
    if (!activeBiz || candidates.length === 0) return;
    setLoading(true);
    try {
      for (const cand of candidates) {
        await fetch('/api/acquisition/review/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            candidateId: cand.id,
            action
          })
        });
      }
      fetchCandidates(activeBiz.id);
    } catch {
      setLoading(false);
    }
  };

  // Filtered candidate list
  const filteredCandidates = candidates.filter(cand => {
    const matchesSearch = cand.fieldPath.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          cand.value.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSource = filterSource === 'ALL' || cand.sourceType === filterSource;
    return matchesSearch && matchesSource;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-2 text-xs text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
        <span>Syncing Knowledge Review Queue...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <GitCompare className="h-5.5 w-5.5 text-blue-500" />
            Knowledge Review Center
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Verify, merge, or discard parameters extracted by crawler pipelines before pushing them to the Digital Twin.</p>
        </div>

        {candidates.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleBulkReview('ACCEPT')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/35 text-emerald-400 text-xs font-bold rounded-lg transition-colors"
            >
              <CheckCheck className="h-4 w-4" />
              <span>Bulk Accept</span>
            </button>
            <button
              onClick={() => handleBulkReview('REJECT')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/35 text-rose-400 text-xs font-bold rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
              <span>Bulk Reject</span>
            </button>
          </div>
        )}
      </div>

      {/* Filters & Control bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center bg-card/30 border border-border/80 p-3 rounded-xl">
        <div className="flex items-center gap-2 bg-slate-950 border border-border rounded-lg px-2.5 py-1.5 w-full sm:w-60">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search parameter..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-0 text-xs text-white focus:outline-none w-full"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="bg-slate-950 border border-border text-xs text-white rounded-lg p-1.5 focus:outline-none"
          >
            <option value="ALL">All Sources</option>
            <option value="WEBSITE">Web Crawls</option>
            <option value="DOCUMENT">Documents</option>
          </select>
        </div>
      </div>

      {/* Main suggested items list */}
      <div className="bg-card/40 border border-border/80 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-card/60 flex justify-between items-center">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">Suggested Updates ({filteredCandidates.length})</h2>
          <button 
            onClick={() => activeBiz && fetchCandidates(activeBiz.id)}
            className="p-1 hover:bg-accent rounded text-muted-foreground transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>

        {filteredCandidates.length > 0 ? (
          <div className="divide-y divide-border/60 text-xs">
            {filteredCandidates.map((cand) => {
              const isActing = actingId === cand.id;
              const isEditing = editingId === cand.id;

              return (
                <div key={cand.id} className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-accent/15 transition-all">
                  <div className="space-y-2 overflow-hidden flex-1">
                    {/* Header tags */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-[11px] bg-slate-800 px-1.5 py-0.5 rounded">
                        {cand.fieldPath.toUpperCase()}
                      </span>
                      <span className={`text-[9px] font-semibold px-1 rounded ${
                        cand.sourceType === 'WEBSITE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
                      }`}>
                        {cand.sourceType}
                      </span>
                      <span className="text-[9px] text-amber-400 font-semibold flex items-center gap-0.5">
                        <TrendingUp className="h-3 w-3" />
                        Confidence: {Math.round(cand.confidence * 100)}%
                      </span>
                    </div>

                    {/* Compare Workspace */}
                    <div className="grid grid-cols-2 gap-4 bg-slate-950/40 p-2.5 rounded border border-border/40 text-[10px]">
                      <div>
                        <span className="text-muted-foreground font-medium">Digital Twin Field:</span>
                        <p className="text-slate-400 truncate mt-0.5 italic">Mapped path parameter</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground font-medium">Suggested Value:</span>
                        {isEditing ? (
                          <div className="flex gap-1.5 items-center mt-0.5">
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="bg-slate-900 border border-border text-white text-[10px] rounded p-1"
                            />
                            <button
                              onClick={() => handleAction(cand.id, 'ACCEPT', editValue)}
                              className="p-1 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/30"
                            >
                              <Check className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1 bg-slate-800 text-white rounded hover:bg-slate-700"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <p className="text-emerald-400 font-bold truncate">{cand.value}</p>
                            <button
                              onClick={() => {
                                setEditingId(cand.id);
                                setEditValue(cand.value);
                              }}
                              className="p-0.5 text-muted-foreground hover:text-white transition-colors"
                            >
                              <Edit className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    {isActing ? (
                      <Loader2 className="h-4.5 w-4.5 animate-spin text-blue-500" />
                    ) : (
                      <>
                        <button
                          onClick={() => handleAction(cand.id, 'ACCEPT')}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-black hover:bg-emerald-400 text-[10px] font-bold rounded-lg transition-colors"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span>Accept Update</span>
                        </button>
                        <button
                          onClick={() => handleAction(cand.id, 'REJECT')}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/35 text-rose-400 text-[10px] font-bold rounded-lg transition-colors"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          <span>Reject</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-muted-foreground space-y-2">
            <FolderSync className="h-6 w-6 text-slate-500 mx-auto" />
            <p className="font-semibold text-white">Review queue is empty.</p>
            <p className="text-[10px]">Crawl websites or upload documents to generate extraction suggestions.</p>
          </div>
        )}
      </div>

    </div>
  );
}
