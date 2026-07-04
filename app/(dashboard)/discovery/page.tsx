'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Building2, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
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
  FolderOpen
} from 'lucide-react';
import { BusinessDigitalTwin, DiscoveryProgress } from '../../../shared/types/digitalTwin';

interface SectionConfig {
  id: string;
  name: string;
  progressKey: keyof DiscoveryProgress;
}

const SECTIONS: SectionConfig[] = [
  { id: 'identity', name: 'Business Identity', progressKey: 'identityStatus' },
  { id: 'model', name: 'Business Model', progressKey: 'modelStatus' },
  { id: 'products-services', name: 'Products & Services', progressKey: 'productsStatus' },
  { id: 'customers', name: 'Customers', progressKey: 'customersStatus' },
  { id: 'marketing', name: 'Marketing', progressKey: 'marketingStatus' },
  { id: 'sales', name: 'Sales', progressKey: 'salesStatus' },
  { id: 'operations', name: 'Operations', progressKey: 'operationsStatus' },
  { id: 'finance', name: 'Finance', progressKey: 'financeStatus' },
  { id: 'technology', name: 'Technology', progressKey: 'technologyStatus' },
  { id: 'organization', name: 'Organization', progressKey: 'organizationStatus' },
  { id: 'partners-vendors', name: 'Partners & Vendors', progressKey: 'partnersStatus' },
  { id: 'competitors', name: 'Competitors', progressKey: 'competitorsStatus' },
  { id: 'goals', name: 'Goals', progressKey: 'goalsStatus' },
  { id: 'constraints', name: 'Constraints', progressKey: 'constraintsStatus' },
  { id: 'risks', name: 'Risks', progressKey: 'risksStatus' },
  { id: 'kpis', name: 'KPIs', progressKey: 'kpisStatus' },
  { id: 'documents', name: 'Documents', progressKey: 'documentsStatus' },
  { id: 'website', name: 'Website', progressKey: 'websiteStatus' }
];

export default function BusinessWorkspace() {
  const [activeSection, setActiveSection] = useState<string>('summary'); // 'summary' or section ID
  const [businessList, setBusinessList] = useState<any[]>([]);
  const [activeBiz, setActiveBiz] = useState<any | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [unsaved, setUnsaved] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newBizName, setNewBizName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Fetch Investigations list
  const fetchInvestigations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/business');
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setBusinessList(data.data);
        // Set first business active if none active
        if (!activeBiz) {
          fetchBusinessDetails(data.data[0].id);
        }
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }, [activeBiz]);

  // 2. Fetch full Business details including nested values
  const fetchBusinessDetails = async (id: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/business/${id}`);
      const data = await res.json();
      if (data.success) {
        setActiveBiz(data.data.business);
        // Fetch current active section data
        if (activeSection !== 'summary') {
          await loadSectionData(id, activeSection);
        }
      }
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  // 3. Load section-specific data
  const loadSectionData = async (bizId: string, section: string) => {
    try {
      const res = await fetch(`/api/business/${bizId}/section/${section}`);
      const data = await res.json();
      if (data.success) {
        setFormData(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInvestigations();
  }, []);

  // Track section loading when switching tabs
  useEffect(() => {
    if (activeBiz && activeSection !== 'summary') {
      loadSectionData(activeBiz.id, activeSection);
      setUnsaved(prev => ({ ...prev, [activeSection]: false }));
    }
  }, [activeSection, activeBiz]);

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

  // 4. Autosave logic (Debounced database updates)
  const saveSectionData = async (section: string, payload: any) => {
    if (!activeBiz) return;
    setSaving('saving');
    try {
      const res = await fetch(`/api/business/${activeBiz.id}/section/${section}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setSaving('saved');
        setUnsaved(prev => ({ ...prev, [section]: false }));
        // Refresh business summary/progress data in state
        const updatedBizRes = await fetch(`/api/business/${activeBiz.id}`);
        const updatedBizData = await updatedBizRes.json();
        if (updatedBizData.success) {
          setActiveBiz(updatedBizData.data.business);
        }
      }
    } catch {
      setSaving('idle');
    }
  };

  // Change form fields dynamically and queue autosave
  const handleFieldChange = (field: string, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    setUnsaved(prev => ({ ...prev, [activeSection]: true }));
    setSaving('saving');

    // Debounce save request
    const timer = setTimeout(() => {
      saveSectionData(activeSection, updated);
    }, 1500);

    return () => clearTimeout(timer);
  };

  // List updates helper
  const handleListUpdate = (listField: string, newList: any[]) => {
    const updated = { ...formData, [listField]: newList };
    setFormData(updated);
    setUnsaved(prev => ({ ...prev, [activeSection]: true }));
    saveSectionData(activeSection, updated);
  };

  // Next and Prev handlers
  const handleNextSection = () => {
    const idx = SECTIONS.findIndex(s => s.id === activeSection);
    if (idx !== -1 && idx < SECTIONS.length - 1) {
      setActiveSection(SECTIONS[idx + 1].id);
    }
  };

  const handlePrevSection = () => {
    const idx = SECTIONS.findIndex(s => s.id === activeSection);
    if (idx > 0) {
      setActiveSection(SECTIONS[idx - 1].id);
    } else if (activeSection !== 'summary') {
      setActiveSection('summary');
    }
  };

  if (loading && !activeBiz) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-2 text-xs text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        <span>Initializing Workspace modules...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Controls & Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-border/60">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="h-5.5 w-5.5 text-blue-500" />
            Digital Twin Workspace
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Maintain corporate profile mapping and strategic constraints.</p>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-3">
          {businessList.length > 0 && (
            <select
              value={activeBiz?.id || ''}
              onChange={(e) => fetchBusinessDetails(e.target.value)}
              className="bg-slate-900 border border-border/80 text-xs text-white rounded-lg p-2 focus:border-blue-500 focus:outline-none"
            >
              {businessList.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          )}

          {/* New investigation form */}
          <form onSubmit={handleCreateBiz} className="flex gap-1.5 items-center">
            <input
              type="text"
              placeholder="Investigation Name..."
              value={newBizName}
              onChange={(e) => setNewBizName(e.target.value)}
              className="bg-slate-900 border border-border/80 text-xs text-white rounded-lg p-2 w-40 focus:border-blue-500 focus:outline-none"
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

      {/* Main Workspace Frame */}
      {activeBiz ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* 1. Left Nav: Section lists */}
          <div className="lg:col-span-1 bg-card/45 border border-border/80 rounded-xl p-2 space-y-1">
            <button
              onClick={() => setActiveSection('summary')}
              className={`w-full flex items-center gap-2 p-2 rounded-lg text-left text-xs font-semibold transition-all ${
                activeSection === 'summary' 
                  ? 'bg-accent/80 text-white' 
                  : 'text-muted-foreground hover:bg-accent/35 hover:text-foreground'
              }`}
            >
              <LayoutGrid className="h-4 w-4 shrink-0" />
              <span>Digital Twin Summary</span>
            </button>

            <div className="border-t border-border/40 my-2 pt-2">
              <p className="text-[9px] font-bold text-muted-foreground px-2 pb-1.5 uppercase tracking-wider">Workspace Modules</p>
              <div className="max-h-[380px] overflow-y-auto space-y-0.5 pr-1">
                {SECTIONS.map((section) => {
                  const status = activeBiz.discoveryProgress?.[section.progressKey] || 'DRAFT';
                  const isCompleted = status === 'COMPLETED';
                  const isUnsaved = unsaved[section.id];
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
                        {isUnsaved && <span className="h-1.5 w-1.5 rounded-full bg-orange-500" title="Unsaved changes" />}
                        <span className="text-[8px] font-bold px-1 rounded bg-slate-800 text-[10px]">
                          {status}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 2. Middle Content Pane: Forms */}
          <div className="lg:col-span-2 bg-card/40 border border-border/80 rounded-xl p-5.5 space-y-5">
            {/* Header state banner */}
            <div className="flex justify-between items-center pb-2 border-b border-border/60">
              <h2 className="text-sm font-semibold text-white">
                {activeSection === 'summary' ? 'Digital Twin Summary' : SECTIONS.find(s => s.id === activeSection)?.name}
              </h2>
              
              {activeSection !== 'summary' && (
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  {saving === 'saving' && (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin text-blue-400" />
                      <span className="text-blue-400 font-medium">Autosaving changes...</span>
                    </>
                  )}
                  {saving === 'saved' && (
                    <>
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-medium">Draft saved successfully</span>
                    </>
                  )}
                  {saving === 'idle' && !unsaved[activeSection] && (
                    <span>All changes saved in local cache</span>
                  )}
                </div>
              )}
            </div>

            {/* Form Panels routing */}
            {activeSection === 'summary' ? (
              /* Summary Page View */
              <div className="space-y-4 text-xs leading-relaxed">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-900 border border-border rounded-lg">
                    <p className="text-muted-foreground font-semibold">Business Identity</p>
                    <p className="text-white mt-1.5 font-bold">{activeBiz.identity?.legalName || 'Unspecified'}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{activeBiz.identity?.description || 'No description provided'}</p>
                  </div>
                  <div className="p-3 bg-slate-900 border border-border rounded-lg">
                    <p className="text-muted-foreground font-semibold">Structure Type</p>
                    <p className="text-white mt-1.5 font-bold">{activeBiz.model?.type || 'Not declared'}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{activeBiz.identity?.industry || 'Industry unspecified'}</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-900 border border-border rounded-lg space-y-1.5">
                  <p className="text-muted-foreground font-semibold">Value Proposition</p>
                  <p className="text-white">{activeBiz.model?.valueProposition || 'Value prop canvas details are not filled yet.'}</p>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-2.5 border border-border rounded-lg">
                    <p className="text-[9px] text-muted-foreground">Competitors</p>
                    <p className="text-sm font-extrabold text-white mt-0.5">{activeBiz.competitors?.length || 0}</p>
                  </div>
                  <div className="p-2.5 border border-border rounded-lg">
                    <p className="text-[9px] text-muted-foreground">Strategic Goals</p>
                    <p className="text-sm font-extrabold text-white mt-0.5">{activeBiz.goals?.length || 0}</p>
                  </div>
                  <div className="p-2.5 border border-border rounded-lg">
                    <p className="text-[9px] text-muted-foreground">Active Risks</p>
                    <p className="text-sm font-extrabold text-white mt-0.5">{activeBiz.risks?.length || 0}</p>
                  </div>
                </div>
              </div>
            ) : (
              /* Specific Form Fields */
              <div className="space-y-4 text-xs">
                {activeSection === 'identity' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="font-semibold text-white">Company Legal Name *</label>
                      <input 
                        type="text"
                        value={formData.legalName || ''}
                        onChange={(e) => handleFieldChange('legalName', e.target.value)}
                        className="w-full bg-slate-950 border border-border rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-semibold text-white">Trade Name / Brand Name</label>
                      <input 
                        type="text"
                        value={formData.tradeName || ''}
                        onChange={(e) => handleFieldChange('tradeName', e.target.value)}
                        className="w-full bg-slate-950 border border-border rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="font-semibold text-white">Founded Year</label>
                        <input 
                          type="number"
                          value={formData.foundedYear || ''}
                          onChange={(e) => handleFieldChange('foundedYear', Number(e.target.value))}
                          className="w-full bg-slate-950 border border-border rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-semibold text-white">HQ Location</label>
                        <input 
                          type="text"
                          value={formData.headquarters || ''}
                          onChange={(e) => handleFieldChange('headquarters', e.target.value)}
                          className="w-full bg-slate-950 border border-border rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-semibold text-white">Identity Description</label>
                      <textarea
                        value={formData.description || ''}
                        onChange={(e) => handleFieldChange('description', e.target.value)}
                        rows={3}
                        className="w-full bg-slate-950 border border-border rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500 resize-none"
                      />
                    </div>
                  </>
                )}

                {activeSection === 'model' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="font-semibold text-white">Business Model Classification Type</label>
                      <select 
                        value={formData.type || ''}
                        onChange={(e) => handleFieldChange('type', e.target.value)}
                        className="w-full bg-slate-950 border border-border rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="">Select structure...</option>
                        <option value="SaaS">Software as a Service (SaaS)</option>
                        <option value="B2B">B2B Enterprise Products</option>
                        <option value="B2C">B2C Retail/Consumer Products</option>
                        <option value="MARKETPLACE">Two-sided Marketplace</option>
                        <option value="HYBRID">Hybrid Multi-Tier Model</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-semibold text-white">Core Value Proposition</label>
                      <textarea 
                        value={formData.valueProposition || ''}
                        onChange={(e) => handleFieldChange('valueProposition', e.target.value)}
                        rows={3}
                        className="w-full bg-slate-950 border border-border rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500 resize-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-semibold text-white">Key Strategic Partners</label>
                      <input 
                        type="text"
                        value={formData.keyPartners || ''}
                        onChange={(e) => handleFieldChange('keyPartners', e.target.value)}
                        className="w-full bg-slate-950 border border-border rounded-lg p-2.5 text-white focus:outline-none"
                      />
                    </div>
                  </>
                )}

                {/* Array sections: dynamic lists */}
                {activeSection === 'products-services' && (
                  <div className="space-y-4">
                    <p className="font-semibold text-white mb-2">Configure Products Portfolio</p>
                    <div className="space-y-2">
                      {(formData.products || []).map((p: any, idx: number) => (
                        <div key={idx} className="flex gap-2 items-center bg-slate-900 p-2.5 rounded-lg border border-border">
                          <input 
                            type="text" 
                            placeholder="Product Name" 
                            value={p.name}
                            onChange={(e) => {
                              const newList = [...(formData.products || [])];
                              newList[idx].name = e.target.value;
                              handleListUpdate('products', newList);
                            }}
                            className="bg-transparent border-0 w-1/2 focus:outline-none text-white font-medium"
                          />
                          <input 
                            type="number" 
                            placeholder="Price" 
                            value={p.price}
                            onChange={(e) => {
                              const newList = [...(formData.products || [])];
                              newList[idx].price = Number(e.target.value);
                              handleListUpdate('products', newList);
                            }}
                            className="bg-transparent border-0 w-1/4 focus:outline-none text-white"
                          />
                          <button 
                            onClick={() => {
                              const newList = (formData.products || []).filter((_: any, i: number) => i !== idx);
                              handleListUpdate('products', newList);
                            }}
                            className="p-1 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      <button 
                        onClick={() => {
                          const newList = [...(formData.products || []), { name: '', price: 0 }];
                          handleListUpdate('products', newList);
                        }}
                        className="flex items-center gap-1 text-blue-400 font-semibold mt-1"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Product</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Fallback for general text fields (marketing, technology, etc.) */}
                {['marketing', 'sales', 'operations', 'technology'].includes(activeSection) && (
                  <div className="space-y-4">
                    {activeSection === 'marketing' && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="font-semibold text-white">Monthly Ad Spend ($)</label>
                            <input 
                              type="number" 
                              value={formData.adSpend || ''} 
                              onChange={(e) => handleFieldChange('adSpend', Number(e.target.value))}
                              className="w-full bg-slate-950 border border-border rounded-lg p-2.5 text-white"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="font-semibold text-white">Ad ROI (Multiplier)</label>
                            <input 
                              type="number" 
                              value={formData.roi || ''} 
                              onChange={(e) => handleFieldChange('roi', Number(e.target.value))}
                              className="w-full bg-slate-950 border border-border rounded-lg p-2.5 text-white"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="font-semibold text-white">Channels Used</label>
                          <input 
                            type="text" 
                            value={formData.channelsUsed || ''} 
                            onChange={(e) => handleFieldChange('channelsUsed', e.target.value)}
                            className="w-full bg-slate-950 border border-border rounded-lg p-2.5 text-white"
                          />
                        </div>
                      </>
                    )}

                    {activeSection === 'sales' && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="font-semibold text-white">Leads Count (Monthly)</label>
                            <input 
                              type="number" 
                              value={formData.leadsCount || ''} 
                              onChange={(e) => handleFieldChange('leadsCount', Number(e.target.value))}
                              className="w-full bg-slate-950 border border-border rounded-lg p-2.5 text-white"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="font-semibold text-white">Conversion Rate (%)</label>
                            <input 
                              type="number" 
                              value={formData.conversionRate || ''} 
                              onChange={(e) => handleFieldChange('conversionRate', Number(e.target.value))}
                              className="w-full bg-slate-950 border border-border rounded-lg p-2.5 text-white"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="font-semibold text-white">Sales Pipeline Value ($)</label>
                          <input 
                            type="number" 
                            value={formData.pipelineValue || ''} 
                            onChange={(e) => handleFieldChange('pipelineValue', Number(e.target.value))}
                            className="w-full bg-slate-950 border border-border rounded-lg p-2.5 text-white"
                          />
                        </div>
                      </>
                    )}

                    {activeSection === 'operations' && (
                      <>
                        <div className="space-y-1.5">
                          <label className="font-semibold text-white">Monthly Tech Infrastructure Costs</label>
                          <input 
                            type="number" 
                            value={formData.infraCost || ''} 
                            onChange={(e) => handleFieldChange('infraCost', Number(e.target.value))}
                            className="w-full bg-slate-950 border border-border rounded-lg p-2.5 text-white"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="font-semibold text-white">Known Operational Bottlenecks</label>
                          <textarea 
                            value={formData.bottlenecks || ''} 
                            onChange={(e) => handleFieldChange('bottlenecks', e.target.value)}
                            rows={3}
                            className="w-full bg-slate-950 border border-border rounded-lg p-2.5 text-white resize-none"
                          />
                        </div>
                      </>
                    )}

                    {activeSection === 'technology' && (
                      <>
                        <div className="space-y-1.5">
                          <label className="font-semibold text-white">Primary Cloud Hosting Infrastructure Provider</label>
                          <input 
                            type="text" 
                            value={formData.infraProvider || ''} 
                            onChange={(e) => handleFieldChange('infraProvider', e.target.value)}
                            className="w-full bg-slate-950 border border-border rounded-lg p-2.5 text-white"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="font-semibold text-white">Core Frameworks & Databases Stack</label>
                          <input 
                            type="text" 
                            value={formData.coreFrameworks || ''} 
                            onChange={(e) => handleFieldChange('coreFrameworks', e.target.value)}
                            className="w-full bg-slate-950 border border-border rounded-lg p-2.5 text-white"
                          />
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Inform user for other sections placeholder arrays */}
                {!['identity', 'model', 'products-services', 'marketing', 'sales', 'operations', 'technology'].includes(activeSection) && (
                  <div className="p-4 bg-slate-900 border border-dashed border-border rounded-xl text-center text-muted-foreground">
                    <p className="font-medium text-white mb-2">Section: {activeSection.toUpperCase()}</p>
                    <p className="leading-relaxed mb-4">Autosave variables configuration is ready. Add/edit item structures to record details into this twin profile section.</p>
                    <button 
                      onClick={() => handleFieldChange('configured', true)}
                      className="px-3 py-1.5 bg-white text-black text-[10px] font-bold rounded-lg"
                    >
                      Complete Section Status
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Footer page switches */}
            <div className="flex justify-between items-center pt-4 border-t border-border/60">
              <button
                onClick={handlePrevSection}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/20 hover:bg-accent rounded-lg text-xs font-semibold text-white transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous Section</span>
              </button>
              <button
                onClick={handleNextSection}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/20 hover:bg-accent rounded-lg text-xs font-semibold text-white transition-colors"
              >
                <span>Next Section</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* 3. Right Panel: Progress Details */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Sticky summary bar */}
            <div className="bg-card/45 border border-border/80 rounded-xl p-5 space-y-4 sticky top-20">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-border/60">Discovery Tracker</h2>
              
              <div className="space-y-4 text-xs">
                {/* Visual completion bar */}
                <div>
                  <div className="flex justify-between items-center font-medium mb-1">
                    <span className="text-muted-foreground">Completeness Score</span>
                    <span className="text-blue-400 font-bold">{activeBiz.discoveryProgress?.overallCoverage || 0}%</span>
                  </div>
                  <div className="h-2 bg-accent/15 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${activeBiz.discoveryProgress?.overallCoverage || 0}%` }}
                    />
                  </div>
                </div>

                <div className="border-t border-border/40 pt-3.5 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-semibold text-white uppercase text-[10px]">{activeBiz.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Started On</span>
                    <span className="text-white font-medium">{new Date(activeBiz.startedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Updated</span>
                    <span className="text-white font-medium">{new Date(activeBiz.lastUpdated).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="border-t border-border/40 pt-3.5 space-y-2">
                  <span className="text-muted-foreground font-semibold uppercase text-[10px]">Incomplete Modules</span>
                  <div className="space-y-1 text-[10px] max-h-[120px] overflow-y-auto pr-1">
                    {SECTIONS.filter(s => (activeBiz.discoveryProgress?.[s.progressKey] || 'DRAFT') !== 'COMPLETED').map(s => (
                      <div key={s.id} className="flex gap-1.5 items-center text-muted-foreground">
                        <span className="h-1 w-1 rounded-full bg-slate-500" />
                        <span>{s.name}</span>
                      </div>
                    ))}
                    {SECTIONS.filter(s => (activeBiz.discoveryProgress?.[s.progressKey] || 'DRAFT') !== 'COMPLETED').length === 0 && (
                      <p className="text-emerald-400 font-medium">All modules completed!</p>
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
