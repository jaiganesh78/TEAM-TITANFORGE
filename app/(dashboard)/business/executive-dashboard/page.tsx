'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  LayoutGrid, 
  FileText,
  HelpCircle,
  Activity,
  Award,
  Shield,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export default function DigitalTwinSummaryPage() {
  const [twin, setTwin] = useState<any | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch first business in organization
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        // List investigations first
        const listRes = await fetch('/api/business');
        const listData = await listRes.json();
        if (listData.success && listData.data.length > 0) {
          const bizId = listData.data[0].id;
          const summaryRes = await fetch(`/api/business/${bizId}`);
          const summaryData = await summaryRes.json();
          if (summaryData.success) {
            setTwin(summaryData.data.business);
            setAuditLogs(summaryData.data.auditLogs);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-2 text-xs text-muted-foreground">
        <Activity className="h-5 w-5 animate-pulse text-blue-500" />
        <span>Loading Digital Twin summary...</span>
      </div>
    );
  }

  if (!twin) {
    return (
      <div className="p-8 text-center border border-dashed border-border rounded-xl text-muted-foreground max-w-sm mx-auto space-y-2">
        <LayoutGrid className="h-8 w-8 text-blue-500 mx-auto" />
        <p className="font-semibold text-white text-xs">No Active Digital Twin</p>
        <p className="text-xs">Go to the Discovery Flow page to configure your organization profile and activate your Digital Twin board.</p>
      </div>
    );
  }

  const sectionsList = [
    { name: 'Business Identity', status: twin.discoveryProgress?.identityStatus || 'DRAFT' },
    { name: 'Business Model', status: twin.discoveryProgress?.modelStatus || 'DRAFT' },
    { name: 'Products & Services', status: twin.discoveryProgress?.productsStatus || 'DRAFT' },
    { name: 'Customers', status: twin.discoveryProgress?.customersStatus || 'DRAFT' },
    { name: 'Marketing', status: twin.discoveryProgress?.marketingStatus || 'DRAFT' },
    { name: 'Sales', status: twin.discoveryProgress?.salesStatus || 'DRAFT' },
    { name: 'Operations', status: twin.discoveryProgress?.operationsStatus || 'DRAFT' },
    { name: 'Finance', status: twin.discoveryProgress?.financeStatus || 'DRAFT' },
    { name: 'Technology', status: twin.discoveryProgress?.technologyStatus || 'DRAFT' },
    { name: 'Organization', status: twin.discoveryProgress?.organizationStatus || 'DRAFT' },
    { name: 'Partners & Vendors', status: twin.discoveryProgress?.partnersStatus || 'DRAFT' },
    { name: 'Competitors', status: twin.discoveryProgress?.competitorsStatus || 'DRAFT' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Building2 className="h-6.5 w-6.5 text-blue-500" />
            Business Digital Twin Summary
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Comprehensive, structured view of your business state variables.</p>
        </div>
        <div className="text-xs border border-border bg-card/45 px-3 py-1.5 rounded-lg text-muted-foreground flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          <span>Last updated: {new Date(twin.lastUpdated).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Grid Layout: Left Overview Board & Right Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Core sections data details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Identity & Model Board */}
          <div className="bg-card/40 border border-border/80 rounded-xl p-5.5 space-y-4">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-border/60">Business Profile Overview</h2>
            
            <div className="grid grid-cols-2 gap-4 text-xs leading-relaxed">
              <div>
                <p className="text-muted-foreground font-semibold">Legal Identity</p>
                <p className="text-white font-bold mt-0.5">{twin.identity?.legalName || 'Unspecified Name'}</p>
                <p className="text-muted-foreground text-[10px] mt-0.5">{twin.identity?.hqLocation || 'HQ Location: Unspecified'}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-semibold">Classification</p>
                <p className="text-white font-bold mt-0.5">{twin.model?.type || 'Structure type unspecified'}</p>
                <p className="text-muted-foreground text-[10px] mt-0.5">{twin.identity?.industry || 'Industry unspecified'}</p>
              </div>
            </div>

            <div className="border-t border-border/40 pt-3 text-xs leading-relaxed">
              <p className="text-muted-foreground font-semibold mb-1">Company Value Proposition</p>
              <p className="text-slate-300 font-medium">{twin.model?.valueProposition || 'Define the key values, resources, and structures in the workspace.'}</p>
            </div>
          </div>

          {/* Revenue & Finance Board */}
          <div className="bg-card/40 border border-border/80 rounded-xl p-5.5 space-y-4">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-border/60">Financial Variables</h2>
            
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-900 border border-border rounded-lg text-center">
                <p className="text-[10px] text-muted-foreground font-semibold">Cash On Hand</p>
                <p className="text-md font-extrabold text-white mt-1">
                  {twin.finance?.cashOnHand ? `$${twin.finance.cashOnHand.toLocaleString()}` : '$0'}
                </p>
              </div>
              <div className="p-3 bg-slate-900 border border-border rounded-lg text-center">
                <p className="text-[10px] text-muted-foreground font-semibold">Monthly Burn Rate</p>
                <p className="text-md font-extrabold text-white mt-1">
                  {twin.finance?.burnRate ? `$${twin.finance.burnRate.toLocaleString()}` : '$0'}
                </p>
              </div>
              <div className="p-3 bg-slate-900 border border-border rounded-lg text-center">
                <p className="text-[10px] text-muted-foreground font-semibold">Runway Months</p>
                <p className="text-md font-extrabold text-white mt-1">
                  {twin.finance?.runwayMonths ? `${twin.finance.runwayMonths} Mo` : 'TBD'}
                </p>
              </div>
            </div>

            {twin.revenueProfiles && twin.revenueProfiles.length > 0 && (
              <div className="border-t border-border/40 pt-3 text-xs">
                <p className="text-muted-foreground font-semibold mb-2">Revenue Records</p>
                <div className="divide-y divide-border/40 max-h-40 overflow-y-auto">
                  {twin.revenueProfiles.map((rev: any) => (
                    <div key={rev.id} className="py-2 flex justify-between">
                      <span className="text-white font-semibold">{rev.period}</span>
                      <span className="text-slate-300">Revenue: ${rev.totalRevenue.toLocaleString()} (Margin: {rev.grossMargin}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Audit Logs History Feed */}
          <div className="bg-card/40 border border-border/80 rounded-xl p-5.5 space-y-4">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-border/60">Audit History Feed</h2>
            <div className="divide-y divide-border/40 max-h-40 overflow-y-auto space-y-2 text-xs">
              {auditLogs.map((log) => (
                <div key={log.id} className="py-2.5 flex justify-between items-start first:pt-0">
                  <div className="space-y-0.5">
                    <p className="text-white font-semibold">Section: {log.section.toUpperCase()}</p>
                    <p className="text-[10px] text-muted-foreground">Modified by {log.user.name}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{new Date(log.timestamp).toLocaleDateString()}</span>
                </div>
              ))}
              {auditLogs.length === 0 && (
                <p className="text-muted-foreground text-center py-4">No audit events logged yet.</p>
              )}
            </div>
          </div>

        </div>

        {/* Right Tracker: Completions and validation summary */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Completion summary list */}
          <div className="bg-card/45 border border-border/80 rounded-xl p-5 space-y-4">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-border/60">Module Completions</h2>
            
            <div className="space-y-3 text-xs">
              {/* Coverage bar */}
              <div>
                <div className="flex justify-between items-center mb-1.5 font-medium">
                  <span className="text-muted-foreground">Digital Twin Coverage</span>
                  <span className="text-blue-400 font-bold">{twin.discoveryProgress?.overallCoverage || 0}%</span>
                </div>
                <div className="h-2 bg-accent/25 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${twin.discoveryProgress?.overallCoverage || 0}%` }}
                  />
                </div>
              </div>

              {/* Breakdown */}
              <div className="border-t border-border/40 pt-3 space-y-2 max-h-60 overflow-y-auto pr-1">
                {sectionsList.map((sec) => {
                  const isCompleted = sec.status === 'COMPLETED';
                  return (
                    <div key={sec.name} className="flex justify-between items-center py-1">
                      <span className="text-muted-foreground font-medium">{sec.name}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                        isCompleted ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {sec.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
