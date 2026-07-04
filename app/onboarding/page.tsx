'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, 
  HelpCircle,
  ChevronRight,
  ArrowRight,
  FileText,
  Plus,
  Loader2,
  Check,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Globe,
  Upload,
  Sparkles,
  ShieldAlert,
  ChevronLeft,
  PieChart,
  LogOut,
  Settings,
  Flame,
  LineChart,
  Briefcase
} from 'lucide-react';

interface DiscoveryMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  questionId?: string;
  domain?: string;
  reasonForQuestion?: string;
  confidenceBefore?: number;
  confidenceAfter?: number;
}

interface Telemetry {
  overallCoverage: number;
  overallUnderstanding: number;
  categoryCoverage: Record<string, number>;
  categoryUnderstanding: Record<string, number>;
}

export default function OnboardingPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [businessId, setBusinessId] = useState<string>('');
  const [messages, setMessages] = useState<DiscoveryMessage[]>([]);
  const [inputText, setInputText] = useState('');
  
  // Website crawler state
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [crawling, setCrawling] = useState(false);
  const [crawlProgress, setCrawlProgress] = useState(0);

  // Document upload state
  const [docCategory, setDocCategory] = useState('BUSINESS_PLAN');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Twin Preview State
  const [twinData, setTwinData] = useState<any>(null);
  const [telemetry, setTelemetry] = useState<Telemetry>({
    overallCoverage: 0,
    overallUnderstanding: 0,
    categoryCoverage: {},
    categoryUnderstanding: {}
  });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    initSession();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initSession = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/discovery/chat/session');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setBusinessId(data.data.businessId);
          if (data.data.onboardingCompleted) {
            window.location.href = '/dashboard';
            return;
          }
          
          if (data.data.session) {
            setMessages(data.data.session.messages || []);
          }
          
          // Fetch GDT and state telemetry
          await syncTwinPreview(data.data.businessId);
        }
      }
    } catch (err) {
      console.error('Error initiating session:', err);
    } finally {
      setLoading(false);
    }
  };

  const syncTwinPreview = async (bizId: string) => {
    try {
      const res = await fetch(`/api/discovery/${bizId}/state`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setTelemetry(data.data);
        }
      }

      // Fetch actual business values to render GDT preview cards
      const detailsRes = await fetch(`/api/business/${bizId}`);
      if (detailsRes.ok) {
        const detailsData = await detailsRes.json();
        if (detailsData.success) {
          setTwinData(detailsData.data.business);
        }
      }
    } catch (err) {
      console.error('Error syncing preview details:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || submitting) return;

    const userText = inputText;
    setInputText('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/discovery/chat/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, content: userText })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setMessages(data.data.messages || []);
          
          // Re-sync GDT preview and telemetry stats
          await syncTwinPreview(businessId);

          // If validation phase is unlocked, forward user to review page
          if (data.data.activePhase?.key === 'VALIDATION') {
            setTimeout(() => {
              window.location.href = '/onboarding/review';
            }, 1500);
          }
        }
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = async () => {
    if (!confirm("Are you sure you want to skip?Downstream AI engines will remain locked until onboarding is complete.")) return;
    try {
      const res = await fetch('/api/discovery/chat/skip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId })
      });
      if (res.ok) {
        window.location.href = '/dashboard';
      }
    } catch (err) {
      console.error('Error skipping onboarding:', err);
    }
  };

  const handleStartCrawl = async () => {
    if (!websiteUrl.trim() || crawling) return;
    setCrawling(true);
    setCrawlProgress(15);
    try {
      const res = await fetch('/api/acquisition/website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, url: websiteUrl })
      });
      if (res.ok) {
        // Mock progress updates
        const interval = setInterval(() => {
          setCrawlProgress(prev => {
            if (prev >= 90) {
              clearInterval(interval);
              return 90;
            }
            return prev + 25;
          });
        }, 1000);

        setTimeout(async () => {
          clearInterval(interval);
          setCrawlProgress(100);
          setTimeout(() => {
            setCrawling(false);
            setWebsiteUrl('');
          }, 500);
          await syncTwinPreview(businessId);
        }, 4000);
      } else {
        setCrawling(false);
      }
    } catch (err) {
      console.error('Error starting website crawl:', err);
      setCrawling(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || uploading) return;

    setUploading(true);
    setUploadSuccess(false);
    try {
      // Simulate file reading content as text
      const fileContent = `Upload statement extract for file ${file.name} detailing leads metrics 1200 conversions and margins.`;
      
      const res = await fetch('/api/acquisition/document/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          fileName: file.name,
          fileContent,
          category: docCategory,
          uploadedBy: 'Executive Officer'
        })
      });

      if (res.ok) {
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
        await syncTwinPreview(businessId);
      }
    } catch (err) {
      console.error('Error uploading file:', err);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Initializing AI Discovery Workspace...</p>
      </div>
    );
  }

  // Active question explanation logic
  const lastMsg = [...messages].reverse().find(m => m.role === 'assistant');
  const activeExplanation = lastMsg?.reasonForQuestion;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      
      {/* Onboarding Top Header */}
      <header className="bg-slate-900/60 border-b border-white/5 px-6 py-4 flex justify-between items-center backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-400" />
          <span className="font-extrabold text-sm tracking-tight text-white uppercase">TitanForge AI Discovery</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSkip}
            className="px-4 py-2 text-xs font-semibold bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all text-slate-300"
          >
            Skip for Now
          </button>
        </div>
      </header>

      {/* Main Split Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 lg:overflow-hidden lg:h-[calc(100vh-65px)]">
        
        {/* LEFT COLUMN: Sidebar Discovery Progress (3 cols) */}
        <div className="lg:col-span-3 border-r border-white/5 bg-slate-900/40 p-5 flex flex-col justify-between overflow-y-auto space-y-6">
          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Discovery Health</span>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Knowledge Coverage:</span>
                  <span className="font-bold text-white font-mono">{Math.round(telemetry.overallCoverage)}%</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5">
                  <div className="bg-indigo-500 h-full transition-all duration-500" style={{ width: `${telemetry.overallCoverage}%` }} />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Business Confidence:</span>
                  <span className="font-bold text-white font-mono">{Math.round(telemetry.overallUnderstanding)}%</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5">
                  <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${telemetry.overallUnderstanding}%` }} />
                </div>
              </div>
            </div>

            {/* Discovery Phases Checklist */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Onboarding Progress</span>
              <div className="space-y-2">
                {[
                  { label: 'Business Identity', cat: ['identity', 'model'] },
                  { label: 'Products & Services', cat: ['products-services'] },
                  { label: 'Target Customers', cat: ['customers'] },
                  { label: 'Pricing Model', cat: ['finance'] },
                  { label: 'Operations & Tech', cat: ['operations', 'technology'] },
                  { label: 'Marketing Spend', cat: ['marketing'] },
                  { label: 'Sales Pipeline', cat: ['sales'] }
                ].map((item, idx) => {
                  const coverage = item.cat.reduce((acc, c) => acc + (telemetry.categoryCoverage[c] ?? 0), 0) / item.cat.length;
                  const isDone = coverage >= 100;
                  return (
                    <div key={idx} className={`p-2.5 rounded-lg border flex items-center justify-between text-xs transition-colors ${isDone ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300' : 'bg-white/5 border-white/5 text-slate-400'}`}>
                      <span>{item.label}</span>
                      <span className="font-bold font-mono text-[10px]">{Math.round(coverage)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-xl p-3.5 space-y-1.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Estimated Remaining Time</span>
            <div className="text-sm font-extrabold text-white">~ {Math.max(2, Math.round((100 - telemetry.overallCoverage) / 10))} mins</div>
            <p className="text-[10px] text-slate-500">Provide direct answers or drag pitch decks to populate cards instantly.</p>
          </div>
        </div>

        {/* CENTER COLUMN: AI Conversational Chat Workspace (5 cols) */}
        <div className="lg:col-span-5 flex flex-col h-full bg-slate-950">
          
          {/* Active Question Context Banner */}
          {activeExplanation && (
            <div className="bg-indigo-600/10 border-b border-indigo-500/20 px-5 py-3 text-xs text-indigo-300 flex items-start gap-2.5">
              <Lightbulb className="h-4.5 w-4.5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold uppercase text-[9px] tracking-wide text-indigo-400 block mb-0.5">Consultant Insight</span>
                <p className="leading-relaxed text-indigo-200">{activeExplanation}</p>
              </div>
            </div>
          )}

          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                <div className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-2 border ${m.role === 'user' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900/60 border-white/5 text-slate-200'}`}>
                  {m.role === 'assistant' && (
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-indigo-400 uppercase tracking-wider mb-1">
                      <Sparkles className="h-3 w-3" />
                      <span>TitanForge Advisor</span>
                    </div>
                  )}
                  <p className="whitespace-pre-line">{m.content}</p>
                </div>
              </div>
            ))}
            {submitting && (
              <div className="flex justify-start">
                <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-4 text-xs flex items-center gap-2 text-slate-400">
                  <Loader2 className="h-4 w-4 text-indigo-400 animate-spin" />
                  <span>Advisor is analyzing your answers...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input Footer */}
          <div className="p-4 bg-slate-900/30 border-t border-white/5">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input 
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your response here..."
                disabled={submitting}
                className="flex-1 bg-slate-900/80 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <button 
                type="submit"
                disabled={submitting || !inputText.trim()}
                className="px-5 py-3 text-xs bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 rounded-xl font-bold flex items-center gap-1.5 active:scale-95 transition-all text-white border border-indigo-500/20"
              >
                <span>Send</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Live GDT Preview + File Upload & Crawler (4 cols) */}
        <div className="lg:col-span-4 border-l border-white/5 bg-slate-900/20 p-5 flex flex-col justify-between overflow-y-auto space-y-6">
          
          {/* Top Panel: Live Digital Twin Preview Cards */}
          <div className="space-y-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Growth Twin Live Preview</span>
            
            <div className="grid grid-cols-1 gap-3 max-h-[350px] overflow-y-auto pr-1">
              {/* Card 1: Identity */}
              <div className="bg-slate-900/60 border border-white/5 rounded-xl p-3.5 space-y-2">
                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider block">Business Identity</span>
                {twinData?.identity?.legalName ? (
                  <div className="space-y-1 text-xs">
                    <div className="font-bold text-slate-200">{twinData.identity.legalName}</div>
                    <div className="text-slate-400 text-[11px] leading-relaxed">{twinData.identity.description}</div>
                    <div className="text-slate-500 text-[10px] mt-1">HQ: {twinData.identity.headquarters} | Founded: {twinData.identity.foundedYear}</div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 italic">No identity details available.</div>
                )}
              </div>

              {/* Card 2: Model & Value Proposition */}
              <div className="bg-slate-900/60 border border-white/5 rounded-xl p-3.5 space-y-2">
                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider block">Business Model & Offerings</span>
                {twinData?.model?.type ? (
                  <div className="space-y-1 text-xs">
                    <div className="font-bold text-slate-200">Model Class: {twinData.model.type}</div>
                    <div className="text-slate-400 text-[11px] leading-relaxed">{twinData.model.valueProposition}</div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 italic">No business model details.</div>
                )}
              </div>

              {/* Card 3: Marketing Spend & Channels */}
              <div className="bg-slate-900/60 border border-white/5 rounded-xl p-3.5 space-y-2">
                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider block">Marketing Channels & CAC</span>
                {twinData?.marketingProfile?.adSpend ? (
                  <div className="space-y-1 text-xs">
                    <div className="text-slate-300">Monthly AdSpend: <span className="font-bold text-white font-mono">${twinData.marketingProfile.adSpend}</span></div>
                    <div className="text-slate-400 text-[11px]">Conversions: {twinData.marketingProfile.conversions}</div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 italic">Waiting for Marketing parameters.</div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Panel: Interactive Website Crawler & File Upload */}
          <div className="space-y-4 border-t border-white/5 pt-4">
            
            {/* Website Crawling */}
            <div className="bg-slate-900/50 border border-white/5 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-indigo-400" />
                <span className="text-xs font-bold text-slate-300">Website Crawler Ingestion</span>
              </div>
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="https://yourwebsite.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  disabled={crawling}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button 
                  onClick={handleStartCrawl}
                  disabled={crawling || !websiteUrl.trim()}
                  className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 rounded-lg font-bold flex items-center gap-1 text-white border border-indigo-500/20"
                >
                  {crawling ? 'Crawling...' : 'Submit'}
                </button>
              </div>

              {crawling && (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] text-indigo-300">
                    <span>Background crawling...</span>
                    <span>{crawlProgress}%</span>
                  </div>
                  <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full transition-all duration-300" style={{ width: `${crawlProgress}%` }} />
                  </div>
                </div>
              )}
            </div>

            {/* Document Uploader */}
            <div className="bg-slate-900/50 border border-white/5 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-1.5">
                <Upload className="h-4 w-4 text-indigo-400" />
                <span className="text-xs font-bold text-slate-300">Document Upload</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select 
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="BUSINESS_PLAN">Business Plan</option>
                  <option value="FINANCIAL_REPORT">Financial Statement</option>
                  <option value="MARKETING_REPORT">Marketing Report</option>
                </select>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 rounded-lg font-bold flex items-center justify-center gap-1 text-white border border-indigo-500/20"
                >
                  {uploading ? 'Uploading...' : 'Choose File'}
                </button>
              </div>

              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept=".pdf,.docx,.pptx,.csv,.xlsx,.txt,.md" 
              />

              {uploadSuccess && (
                <div className="text-[10px] text-emerald-400 flex items-center gap-1 justify-center bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-lg">
                  <Check className="h-3 w-3" />
                  <span>Document parsed successfully. candidates extracted!</span>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
