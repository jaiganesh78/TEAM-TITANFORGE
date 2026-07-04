'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Building2, 
  CheckCircle, 
  AlertCircle, 
  Play, 
  RotateCw, 
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  LayoutGrid,
  FileText,
  Plus,
  Trash2,
  Save,
  Loader2,
  FolderOpen,
  Check,
  TrendingUp,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LibraryQuestion {
  id: string;
  title: string;
  description: string;
  type: 'text' | 'number' | 'select' | 'boolean';
  category: string;
  weight: number;
  dbPath: string;
  validation?: { required: boolean; min?: number; max?: number };
  options?: string[];
  priority: string;
  optional: boolean;
}

interface MissingInfoAlert {
  questionId: string;
  fieldPath: string;
  category: string;
  priority: string;
  message: string;
}

export default function BusinessWorkspace() {
  const [activeSection, setActiveSection] = useState<string>('summary'); // 'summary' or section ID
  const [businessList, setBusinessList] = useState<any[]>([]);
  const [activeBiz, setActiveBiz] = useState<any | null>(null);
  
  // Dynamic discovery engine state
  const [telemetry, setTelemetry] = useState<{
    overallCoverage: number;
    overallUnderstanding: number;
    categoryCoverage: Record<string, number>;
    categoryUnderstanding: Record<string, number>;
    activeQuestions: LibraryQuestion[];
    missingAlerts: MissingInfoAlert[];
    nextSection: string;
  } | null>(null);

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [fieldMetadata, setFieldMetadata] = useState<Record<string, { status: string; source: string }>>({});
  const [unsaved, setUnsaved] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newBizName, setNewBizName] = useState('');

  // 1. Fetch Investigations list
  const fetchInvestigations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/business');
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setBusinessList(data.data);
        if (!activeBiz) {
          fetchBusinessTelemetry(data.data[0].id);
        }
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }, [activeBiz]);

  // 2. Fetch full Discovery state and telemetry
  const fetchBusinessTelemetry = async (id: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/discovery/${id}/state`);
      const data = await res.json();
      if (data.success) {
        setTelemetry(data.data);
        
        // Populate form fields from DB extraction logic mapping
        const initialForm: Record<string, any> = {};
        const metaFields: Record<string, any> = {};
        
        // Request basic details to load values
        const detailsRes = await fetch(`/api/business/${id}`);
        const detailsData = await detailsRes.json();
        if (detailsData.success) {
          setActiveBiz(detailsData.data.business);
          
          // Map extracted values for each question
          for (const q of data.data.activeQuestions) {
            const parts = q.dbPath.split('.');
            const value = detailsData.data.business[parts[0]]?.[parts[1]];
            initialForm[q.id] = value ?? '';
            
            // Map metadata status if available
            const matchingMeta = data.data.metadata?.[q.dbPath];
            metaFields[q.id] = matchingMeta || { status: 'KNOWN', source: 'USER' };
          }
          setFormData(initialForm);
          setFieldMetadata(metaFields);
        }
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestigations();
  }, []);

  // Sync details when active business or section changes
  useEffect(() => {
    if (activeBiz) {
      fetchBusinessTelemetry(activeBiz.id);
    }
  }, [activeSection]);

  // Create new investigation
  const handleCreateBiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBizName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newBizName })
      });
      const data = await res.json();
      if (data.success) {
        setBusinessList(prev => [data.data, ...prev]);
        setActiveBiz(data.data);
        setActiveSection('identity');
        setNewBizName('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  // 3. Save dynamic answer to DB
  const saveAnswerData = async (questionId: string, value: any, status: string = 'KNOWN') => {
    if (!activeBiz) return;
    setSaving('saving');
    try {
      const res = await fetch(`/api/discovery/${activeBiz.id}/answer`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId,
          value,
          status,
          source: 'USER'
        })
      });
      const data = await res.json();
      if (data.success) {
        setSaving('saved');
        setTelemetry(data.data); // Update all coverage & understanding live!
        setUnsaved(prev => ({ ...prev, [questionId]: false }));
      }
    } catch {
      setSaving('idle');
    }
  };

  // Field change handler (triggers auto-save)
  const handleFieldChange = (questionId: string, value: any, status: string = 'KNOWN') => {
    setFormData(prev => ({ ...prev, [questionId]: value }));
    setUnsaved(prev => ({ ...prev, [questionId]: true }));
    setSaving('saving');

    // Debounce save request
    const timer = setTimeout(() => {
      saveAnswerData(questionId, value, status);
    }, 1500);

    return () => clearTimeout(timer);
  };

  // Helper lists categories based on active questions
  const SECTIONS = [
    { id: 'identity', name: 'Business Identity' },
    { id: 'model', name: 'Business Model' },
    { id: 'products-services', name: 'Products & Services' },
    { id: 'customers', name: 'Customers' },
    { id: 'marketing', name: 'Marketing' },
    { id: 'sales', name: 'Sales' },
    { id: 'operations', name: 'Operations' },
    { id: 'finance', name: 'Finance' },
    { id: 'technology', name: 'Technology' }
  ];

  const activeQuestionsForSection = telemetry?.activeQuestions.filter(q => q.category === activeSection) || [];

  if (loading && !activeBiz) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-2 text-xs text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        <span>Initializing Discovery Workspace...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Controls & Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-border/60">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="h-5.5 w-5.5 text-emerald-500" />
            Adaptive Business Discovery Engine
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Intelligent investigation and mapping of company digital twin parameters.</p>
        </div>

        <div className="flex items-center gap-3">
          {businessList.length > 0 && (
            <select
              value={activeBiz?.id || ''}
              onChange={(e) => {
                const selected = businessList.find(b => b.id === e.target.value);
                setActiveBiz(selected);
                fetchBusinessTelemetry(e.target.value);
              }}
              className="bg-slate-900 border border-border/80 text-xs text-white rounded-lg p-2 focus:border-emerald-500 focus:outline-none"
            >
              {businessList.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
                ))}
            </select>
          )}

          <form onSubmit={handleCreateBiz} className="flex gap-1.5 items-center">
            <input
              type="text"
              placeholder="Investigation Name..."
              value={newBizName}
              onChange={(e) => setNewBizName(e.target.value)}
              className="bg-slate-900 border border-border/80 text-xs text-white rounded-lg p-2 w-40 focus:border-emerald-500 focus:outline-none"
              required
            />
            <button
              type="submit"
              disabled={creating}
              className="p-2 bg-white text-black hover:bg-slate-200 rounded-lg text-xs font-semibold shrink-0 transition-colors disabled:opacity-50"
            >
              {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            </button>
          </form>
        </div>
      </div>

      {activeBiz ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* 1. Left Nav: Adaptive Section Lists */}
          <div className="lg:col-span-1 bg-card/45 border border-border/80 rounded-xl p-2 space-y-1">
            <button
              onClick={() => setActiveSection('summary')}
              className={`w-full flex items-center gap-2 p-2 rounded-lg text-left text-xs font-semibold transition-all ${
                activeSection === 'summary' 
                  ? 'bg-emerald-600/80 text-white' 
                  : 'text-muted-foreground hover:bg-accent/35 hover:text-foreground'
              }`}
            >
              <LayoutGrid className="h-4 w-4 shrink-0" />
              <span>Digital Twin Dashboard</span>
            </button>

            <div className="border-t border-border/40 my-2 pt-2">
              <p className="text-[9px] font-bold text-muted-foreground px-2 pb-1.5 uppercase tracking-wider">Discovery Domains</p>
              <div className="max-h-[380px] overflow-y-auto space-y-0.5 pr-1">
                {SECTIONS.map((section) => {
                  const coverage = telemetry?.categoryCoverage[section.id] ?? 0;
                  const understanding = telemetry?.categoryUnderstanding[section.id] ?? 0;
                  const isCompleted = coverage === 100;
                  const isActive = activeSection === section.id;

                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors ${
                        isActive 
                          ? 'bg-accent text-white font-medium' 
                          : 'text-muted-foreground hover:bg-accent/30 hover:text-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                          isCompleted ? 'bg-emerald-500' : 'bg-slate-600'
                        }`} />
                        <span className="truncate">{section.name}</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[8px] font-bold px-1 rounded bg-slate-800 text-[10px]">
                          Cov: {coverage}%
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 2. Middle Content Pane: Dynamic Questions rendering */}
          <div className="lg:col-span-2 bg-card/40 border border-border/80 rounded-xl p-5.5 space-y-5">
            <div className="flex justify-between items-center pb-2 border-b border-border/60">
              <h2 className="text-sm font-semibold text-white">
                {activeSection === 'summary' ? 'Digital Twin Summary' : SECTIONS.find(s => s.id === activeSection)?.name}
              </h2>
              
              {activeSection !== 'summary' && (
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  {saving === 'saving' && (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin text-emerald-400" />
                      <span className="text-emerald-400 font-medium">Auto-calculating coverage...</span>
                    </>
                  )}
                  {saving === 'saved' && (
                    <>
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-medium">State synchronized</span>
                    </>
                  )}
                  {saving === 'idle' && (
                    <span>Single source of truth active</span>
                  )}
                </div>
              )}
            </div>

            <AnimatePresence mode="wait">
              {activeSection === 'summary' ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4 text-xs leading-relaxed"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-900 border border-border rounded-lg">
                      <p className="text-muted-foreground font-semibold">Active Industry</p>
                      <p className="text-white mt-1.5 font-bold text-sm text-emerald-400">{activeBiz.model?.type || 'SaaS (Default)'}</p>
                    </div>
                    <div className="p-3 bg-slate-900 border border-border rounded-lg">
                      <p className="text-muted-foreground font-semibold">Completeness status</p>
                      <p className="text-white mt-1.5 font-bold">{telemetry?.overallCoverage || 0}% Info Coverage</p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900 border border-border rounded-lg space-y-1.5">
                    <p className="text-muted-foreground font-semibold">Discovery Insights Summary</p>
                    <p className="text-white">The Business Digital Twin maps values for target parameters. Access the categories side panel to fill strategic operational details.</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-5"
                >
                  {activeQuestionsForSection.map((q) => {
                    const value = formData[q.id] || '';
                    const meta = fieldMetadata[q.id] || { status: 'KNOWN', source: 'USER' };
                    const isUnsaved = unsaved[q.id];

                    return (
                      <div key={q.id} className="space-y-2 p-4 bg-slate-900/50 border border-border/50 rounded-xl space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <label className="font-semibold text-xs text-white flex items-center gap-1.5">
                              {q.title}
                              {!q.optional && <span className="text-rose-500">*</span>}
                              {q.priority === 'CRITICAL' && <span className="text-[8px] bg-rose-500/20 text-rose-400 px-1 rounded">CRITICAL</span>}
                            </label>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{q.description}</p>
                          </div>

                          {/* Known/Estimated State Selector */}
                          <select
                            value={meta.status}
                            onChange={(e) => {
                              const newStatus = e.target.value;
                              setFieldMetadata(prev => ({
                                ...prev,
                                [q.id]: { ...meta, status: newStatus }
                              }));
                              saveAnswerData(q.id, value, newStatus);
                            }}
                            className="bg-slate-950 border border-border/40 text-[9px] text-white rounded p-1 focus:outline-none"
                          >
                            <option value="KNOWN">Known / Verified</option>
                            <option value="ESTIMATED">Estimated / Assumed</option>
                            <option value="UNKNOWN">Unknown</option>
                          </select>
                        </div>

                        {/* Custom inputs based on type */}
                        {q.type === 'select' ? (
                          <select
                            value={value}
                            onChange={(e) => handleFieldChange(q.id, e.target.value, meta.status)}
                            className="w-full bg-slate-950 border border-border rounded-lg p-2 text-xs text-white"
                          >
                            <option value="">Select options...</option>
                            {q.options?.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={q.type === 'number' ? 'number' : 'text'}
                            value={value}
                            onChange={(e) => handleFieldChange(q.id, q.type === 'number' ? Number(e.target.value) : e.target.value, meta.status)}
                            className="w-full bg-slate-950 border border-border rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                        )}
                      </div>
                    );
                  })}

                  {activeQuestionsForSection.length === 0 && (
                    <div className="p-8 text-center border border-dashed border-border rounded-xl text-muted-foreground">
                      <HelpCircle className="h-6 w-6 mx-auto mb-2 text-slate-500" />
                      <p className="text-xs">All active conditions resolved. No questions currently required for this category.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-between items-center pt-4 border-t border-border/60">
              <button
                onClick={() => {
                  const idx = SECTIONS.findIndex(s => s.id === activeSection);
                  if (idx > 0) setActiveSection(SECTIONS[idx - 1].id);
                  else if (activeSection !== 'summary') setActiveSection('summary');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/20 hover:bg-accent rounded-lg text-xs font-semibold text-white transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>
              <button
                onClick={() => {
                  const idx = SECTIONS.findIndex(s => s.id === activeSection);
                  if (idx !== -1 && idx < SECTIONS.length - 1) setActiveSection(SECTIONS[idx + 1].id);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/20 hover:bg-accent rounded-lg text-xs font-semibold text-white transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* 3. Right Panel: Discovery Insights Sidebar */}
          <div className="lg:col-span-1 space-y-5">
            <div className="bg-card/45 border border-border/80 rounded-xl p-5 space-y-4 sticky top-20">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-border/60">Discovery Insights</h2>
              
              <div className="space-y-4 text-xs">
                {/* Information Coverage Score */}
                <div>
                  <div className="flex justify-between items-center font-medium mb-1">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="h-3.5 w-3.5 text-blue-400" />
                      Info Coverage
                    </span>
                    <span className="text-blue-400 font-bold">{telemetry?.overallCoverage || 0}%</span>
                  </div>
                  <div className="h-2 bg-accent/15 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${telemetry?.overallCoverage || 0}%` }}
                    />
                  </div>
                </div>

                {/* Business Understanding Score */}
                <div>
                  <div className="flex justify-between items-center font-medium mb-1">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5 text-emerald-400" />
                      Business Understanding
                    </span>
                    <span className="text-emerald-400 font-bold">{telemetry?.overallUnderstanding || 0}%</span>
                  </div>
                  <div className="h-2 bg-accent/15 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${telemetry?.overallUnderstanding || 0}%` }}
                    />
                  </div>
                </div>

                {/* Suggested Next Section Button */}
                {telemetry?.nextSection && telemetry.nextSection !== 'summary' && (
                  <button
                    onClick={() => setActiveSection(telemetry.nextSection)}
                    className="w-full flex items-center justify-between p-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/35 text-emerald-400 font-bold rounded-lg transition-colors text-center text-[10px]"
                  >
                    <span>Suggested: {telemetry.nextSection.toUpperCase()}</span>
                    <Play className="h-3 w-3 fill-current" />
                  </button>
                )}

                {/* Missing Information Alerts */}
                <div className="border-t border-border/40 pt-3.5 space-y-2">
                  <span className="text-muted-foreground font-semibold uppercase text-[9px] flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                    Missing Information
                  </span>
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {telemetry?.missingAlerts && telemetry.missingAlerts.length > 0 ? (
                      telemetry.missingAlerts.map((alert, idx) => (
                        <div key={idx} className="p-2 bg-slate-900 border border-border rounded-lg text-[10px] space-y-1">
                          <p className="text-white font-medium">{alert.message}</p>
                          <div className="flex justify-between text-[8px] text-muted-foreground font-semibold">
                            <span>Category: {alert.category.toUpperCase()}</span>
                            <span className="text-rose-400">{alert.priority}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-emerald-400 font-medium text-[10px] flex items-center gap-1">
                        <Check className="h-3.5 w-3.5" />
                        All critical variables mapped!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      ) : (
        <div className="p-12 text-center border border-dashed border-border rounded-2xl text-muted-foreground max-w-sm mx-auto space-y-3">
          <FolderOpen className="h-8 w-8 text-blue-500 mx-auto" />
          <p className="font-semibold text-white text-xs">No Investigation Initiated</p>
          <p className="text-xs">Create a business investigation above using a name to construct your profile twin.</p>
        </div>
      )}

    </div>
  );
}
