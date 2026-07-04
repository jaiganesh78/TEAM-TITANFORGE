'use client';

import React, { useState } from 'react';
import { FileText, Upload, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export default function DocumentsPage() {
  const [files, setFiles] = useState([
    { id: 'f1', name: 'Q1_Financial_Report.pdf', size: '2.4 MB', type: 'PDF', date: 'July 04, 2026' },
    { id: 'f2', name: 'Competitor_List.csv', size: '124 KB', type: 'CSV', date: 'July 04, 2026' }
  ]);
  const [uploading, setUploading] = useState(false);

  const handleFakeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setFiles(prev => [
        ...prev,
        {
          id: `f-${Date.now()}`,
          name: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          type: file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN',
          date: 'Just now'
        }
      ]);
    }, 1200);
  };

  const handleDelete = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <FileText className="h-6 w-6 text-blue-500" />
          Uploaded Documents
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Upload financial statements, pitch decks, and company files to enrich your Digital Twin.</p>
      </div>

      {/* Upload Zone */}
      <div className="border border-dashed border-border/80 bg-card/25 rounded-xl p-8 text-center space-y-4 hover:border-border transition-colors relative">
        <input 
          type="file" 
          accept=".pdf,.docx,.csv,.png,.jpg"
          onChange={handleFakeUpload}
          className="absolute inset-0 opacity-0 cursor-pointer"
          disabled={uploading}
        />
        <div className="h-10 w-10 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto">
          <Upload className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold text-white">{uploading ? 'Processing & indexing file...' : 'Upload business documents'}</p>
          <p className="text-[10px] text-muted-foreground">Supports PDF, DOCX, CSV, and Images up to 20MB</p>
        </div>
      </div>

      {/* File List */}
      <div className="bg-card/40 border border-border/80 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-card/60 flex justify-between items-center">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">Indexed Documents ({files.length})</h2>
        </div>
        
        {files.length > 0 ? (
          <div className="divide-y divide-border/60 text-xs">
            {files.map((file) => (
              <div key={file.id} className="p-3.5 flex justify-between items-center hover:bg-accent/20 transition-all">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="h-8 w-8 rounded bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                    {file.type}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-semibold text-white truncate">{file.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{file.size} • Uploaded {file.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Twin Synced</span>
                  </span>
                  <button 
                    onClick={() => handleDelete(file.id)}
                    className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-muted-foreground">
            No documents indexed. Upload files above to build knowledge.
          </div>
        )}
      </div>

    </div>
  );
}
