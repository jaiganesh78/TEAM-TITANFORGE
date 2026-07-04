'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Check, 
  X, 
  Loader2, 
  Sparkles, 
  HelpCircle,
  Database,
  ArrowRight,
  ShieldCheck,
  Eye,
  AlertCircle
} from 'lucide-react';

interface Candidate {
  id: string;
  fieldPath: string;
  value: string;
  confidence: number;
  sourceType: 'MANUAL' | 'WEBSITE' | 'DOCUMENT' | 'AI';
  sourceId: string;
  status: 'PENDING_REVIEW' | 'ACCEPTED' | 'REJECTED';
}

export default function ReviewPage() {
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState<string>('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    initReview();
  }, []);

  const initReview = async () => {
    setLoading(true);
    try {
      const sessionRes = await fetch('/api/discovery/chat/session');
      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        if (sessionData.success) {
          const bizId = sessionData.data.businessId;
          setBusinessId(bizId);
          
          // Fetch pending candidates
          const candidatesRes = await fetch(`/api/acquisition/review/${bizId}`);
          if (candidatesRes.ok) {
            const candidatesData = await candidatesRes.json();
            if (candidatesData.success) {
              setCandidates(candidatesData.data || []);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error initiating review:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (candidateId: string, action: 'ACCEPT' | 'REJECT', editedValue?: string) => {
    try {
      const res = await fetch('/api/acquisition/review/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId, action, editedValue })
      });
      if (res.ok) {
        // Update local candidates state
        setCandidates(prev => prev.map(c => {
          if (c.id === candidateId) {
            return { 
              ...c, 
              status: action === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED',
              value: editedValue !== undefined ? editedValue : c.value
            };
          }
          return c;
        }));
      }
    } catch (err) {
      console.error('Error handling candidate review action:', err);
    }
  };

  const handleConfirmAndBuild = async () => {
    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/discovery/chat/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data.jobs) {
          localStorage.setItem('titanforge_onboarding_jobs', JSON.stringify(data.data.jobs));
        }
        window.location.href = '/onboarding/completion';
      } else {
        const data = await res.json();
        setErrorMsg(data.message || 'Failed to build Growth Digital Twin.');
        setSubmitting(false);
      }
    } catch (err) {
      console.error('Error approving onboarding summary:', err);
      setErrorMsg('Network error. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Loading Executive Review Panel...</p>
      </div>
    );
  }

  const pendingCount = candidates.filter(c => c.status === 'PENDING_REVIEW').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      
      {/* Review Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-white/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-indigo-400" />
            <h1 className="text-xl font-extrabold tracking-tight text-white uppercase">Executive Business Review</h1>
          </div>
          <p className="text-slate-400 text-xs">Verify and audit extracted information before compiling your Growth Digital Twin.</p>
        </div>

        <button 
          onClick={handleConfirmAndBuild}
          disabled={submitting || pendingCount > 0}
          className="px-6 py-3 text-xs bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900/60 disabled:text-slate-500 rounded-xl font-bold flex items-center gap-2 active:scale-95 transition-all text-white border border-indigo-500/30"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-white" />
              <span>Building Growth Twin...</span>
            </>
          ) : (
            <>
              <span>Confirm & Build Digital Twin</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      {pendingCount > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200">
            <span className="font-bold">Attention Required:</span> You have <span className="font-bold font-mono">{pendingCount}</span> unreviewed candidates. Please accept or reject all candidates before compiling your Digital Twin.
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-xs text-rose-300">
          {errorMsg}
        </div>
      )}

      {/* Candidates List Grid */}
      <div className="space-y-4">
        {candidates.length > 0 ? (
          candidates.map(candidate => (
            <div 
              key={candidate.id} 
              className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                candidate.status === 'ACCEPTED' 
                  ? 'bg-emerald-500/5 border-emerald-500/20' 
                  : candidate.status === 'REJECTED' 
                  ? 'bg-rose-500/5 border-rose-500/10 opacity-60' 
                  : 'bg-slate-900/50 border-white/10 hover:border-white/20'
              }`}
            >
              {/* Candidate Info */}
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] font-mono bg-white/5 px-2 py-0.5 rounded text-indigo-300 font-bold uppercase">
                    {candidate.fieldPath}
                  </span>
                  <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-semibold uppercase tracking-wider">
                    {candidate.sourceType}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Confidence: {Math.round(candidate.confidence * 100)}%
                  </span>
                </div>
                
                {/* Editable Value Input */}
                <input 
                  type="text"
                  defaultValue={candidate.value}
                  onBlur={(e) => {
                    if (e.target.value !== candidate.value) {
                      handleAction(candidate.id, 'ACCEPT', e.target.value);
                    }
                  }}
                  disabled={candidate.status === 'REJECTED'}
                  className="bg-transparent border-b border-transparent focus:border-indigo-500 font-bold text-sm text-slate-200 focus:outline-none w-full max-w-lg transition-colors py-0.5"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 shrink-0">
                <button 
                  onClick={() => handleAction(candidate.id, 'ACCEPT')}
                  disabled={candidate.status === 'ACCEPTED'}
                  className={`p-2.5 rounded-lg border transition-all flex items-center justify-center ${
                    candidate.status === 'ACCEPTED' 
                      ? 'bg-emerald-600 border-emerald-500 text-white' 
                      : 'bg-white/5 border-white/10 hover:bg-emerald-500/10 hover:border-emerald-500/30 text-slate-400 hover:text-emerald-400'
                  }`}
                  title="Accept candidate suggestion"
                >
                  <Check className="h-4 w-4" />
                </button>
                
                <button 
                  onClick={() => handleAction(candidate.id, 'REJECT')}
                  disabled={candidate.status === 'REJECTED'}
                  className={`p-2.5 rounded-lg border transition-all flex items-center justify-center ${
                    candidate.status === 'REJECTED' 
                      ? 'bg-rose-600 border-rose-500 text-white' 
                      : 'bg-white/5 border-white/10 hover:bg-rose-500/10 hover:border-rose-500/30 text-slate-400 hover:text-rose-400'
                  }`}
                  title="Reject candidate suggestion"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-12 text-center text-xs text-slate-500">
            No candidates available for review. Complete some questions first or submit documents!
          </div>
        )}
      </div>

    </div>
  );
}
