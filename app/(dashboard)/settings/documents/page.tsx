'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Upload, 
  Trash2, 
  CheckCircle, 
  Loader2, 
  AlertTriangle,
  History,
  Layers,
  ChevronDown
} from 'lucide-react';

enum DocumentCategory {
  FINANCIAL_REPORT = 'FINANCIAL_REPORT',
  MARKETING_REPORT = 'MARKETING_REPORT',
  SALES_REPORT = 'SALES_REPORT',
  BUSINESS_PLAN = 'BUSINESS_PLAN',
  INVESTOR_PITCH_DECK = 'INVESTOR_PITCH_DECK',
  PRODUCT_CATALOGUE = 'PRODUCT_CATALOGUE',
  CUSTOMER_FEEDBACK = 'CUSTOMER_FEEDBACK',
  HR_DOCUMENTS = 'HR_DOCUMENTS',
  OTHER = 'OTHER'
}

export default function DocumentsPage() {
  const [activeBiz, setActiveBiz] = useState<any | null>(null);
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState<DocumentCategory>(DocumentCategory.FINANCIAL_REPORT);

  // Fetch active business
  const fetchActiveBusiness = async () => {
    try {
      const res = await fetch('/api/business');
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setActiveBiz(data.data[0]);
        fetchDocuments(data.data[0].id);
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  };

  // Fetch uploaded documents
  const fetchDocuments = async (businessId: string) => {
    try {
      const res = await fetch(`/api/acquisition/document/${businessId}`);
      const data = await res.json();
      if (data.success) {
        setDocs(data.data);
      }
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveBusiness();
  }, []);

  // Handle file select and mock content reader upload
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !activeBiz) return;
    const file = e.target.files[0];
    
    setUploading(true);
    try {
      // Simulate reading raw text content
      const reader = new FileReader();
      reader.onload = async () => {
        const textContent = (reader.result as string) || `Mock content inside file: ${file.name}`;
        
        const res = await fetch('/api/acquisition/document/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessId: activeBiz.id,
            fileName: file.name,
            fileContent: textContent,
            category: category,
            uploadedBy: 'Jai Ganesh'
          })
        });
        
        const data = await res.json();
        if (data.success) {
          fetchDocuments(activeBiz.id);
        }
        setUploading(false);
      };
      reader.readAsText(file);
    } catch {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-2 text-xs text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
        <span>Syncing Document Center...</span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <FileText className="h-5.5 w-5.5 text-blue-500" />
          Document Intelligence Center
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">Categorize and parse business reports or financial spreadsheets to enrich your Digital Twin.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Upload Form Pane */}
        <div className="md:col-span-1 bg-card/45 border border-border/80 rounded-xl p-4 space-y-4">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">Document Settings</h2>
          
          <div className="space-y-1.5 text-xs">
            <label className="font-semibold text-muted-foreground">Category Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as DocumentCategory)}
              className="w-full bg-slate-900 border border-border/80 text-white rounded-lg p-2 text-xs focus:outline-none"
            >
              {Object.values(DocumentCategory).map((cat) => (
                <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          <div className="border border-dashed border-border bg-card/25 rounded-xl p-6 text-center space-y-4 hover:border-blue-500 transition-colors relative">
            <input 
              type="file" 
              accept=".pdf,.docx,.csv,.xlsx,.pptx,.txt"
              onChange={handleUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
              disabled={uploading}
            />
            <div className="h-9 w-9 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto">
              {uploading ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Upload className="h-4.5 w-4.5" />}
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-white">{uploading ? 'Processing parser...' : 'Select File'}</p>
              <p className="text-[9px] text-muted-foreground">PDF, DOCX, CSV, XLSX, PPTX</p>
            </div>
          </div>
        </div>

        {/* Uploaded History Pane */}
        <div className="md:col-span-2 bg-card/40 border border-border/80 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-card/60 flex justify-between items-center">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Upload History & Versioning</h2>
            <span className="text-[10px] text-muted-foreground font-semibold">Total: {docs.length}</span>
          </div>

          {docs.length > 0 ? (
            <div className="divide-y divide-border/60 text-xs">
              {docs.map((doc) => (
                <div key={doc.id} className="p-3.5 flex justify-between items-center hover:bg-accent/15 transition-all">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="h-8 w-8 rounded bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-[9px] shrink-0">
                      V{doc.version}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-semibold text-white truncate">{doc.fileName}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Category: <span className="text-blue-400 font-medium">{doc.category}</span> • Hash: {doc.hash.substring(0, 10)}...
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      doc.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {doc.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-muted-foreground space-y-2">
              <History className="h-6 w-6 text-slate-500 mx-auto" />
              <p className="font-semibold text-white">No documents uploaded yet.</p>
              <p className="text-[10px]">Use the left panel to upload files and generate extraction candidates.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
