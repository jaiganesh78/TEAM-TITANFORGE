'use client';

import React, { useState } from 'react';
import { Settings, Save, Shield } from 'lucide-react';

export default function ProfileSettingsPage() {
  const [name, setName] = useState('TitanForge Core');
  const [website, setWebsite] = useState('https://titanforge.io');
  const [desc, setDesc] = useState('AI Business Growth Operating System developers.');
  const [loading, setLoading] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('Settings saved successfully!');
    }, 800);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Settings className="h-6 w-6 text-blue-500" />
          Company Profile Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage details of your organization and tenant workspace.</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="bg-card/40 border border-border rounded-xl p-5.5 space-y-4 text-xs">
        
        {/* Name input */}
        <div className="space-y-1.5">
          <label className="font-semibold text-white">Organization Name</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            className="w-full bg-slate-900 border border-border/80 rounded-lg p-2.5 text-white focus:border-blue-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Website input */}
        <div className="space-y-1.5">
          <label className="font-semibold text-white">Primary Website URL</label>
          <input 
            type="url" 
            value={website} 
            onChange={(e) => setWebsite(e.target.value)} 
            className="w-full bg-slate-900 border border-border/80 rounded-lg p-2.5 text-white focus:border-blue-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Description input */}
        <div className="space-y-1.5">
          <label className="font-semibold text-white">Business Description</label>
          <textarea 
            value={desc} 
            onChange={(e) => setDesc(e.target.value)} 
            rows={4}
            className="w-full bg-slate-900 border border-border/80 rounded-lg p-2.5 text-white focus:border-blue-500 focus:outline-none transition-colors resize-none"
          />
        </div>

        {/* Access info */}
        <div className="flex gap-2 p-3 bg-accent/25 border border-border rounded-lg items-center">
          <Shield className="h-4.5 w-4.5 text-blue-400 shrink-0" />
          <div className="text-[10px] text-muted-foreground">
            Role level: <span className="font-semibold text-white">OWNER</span>. You hold root write access for this organization tenant.
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 bg-white text-black hover:bg-slate-200 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>

      </form>

    </div>
  );
}
