'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Key, Mail, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Mock auth verification
    setTimeout(() => {
      setLoading(false);
      if (email && password) {
        router.push('/dashboard');
      } else {
        setError('Please fill in all credentials.');
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background radial highlight */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[100px] pointer-events-none" />

      <div className="max-w-md w-full bg-slate-900/60 border border-slate-800 backdrop-blur rounded-xl p-8 space-y-6 relative z-10">
        
        {/* Title */}
        <div className="text-center space-y-2">
          <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center text-black font-extrabold text-lg mx-auto shadow">
            TF
          </div>
          <h2 className="text-lg font-bold text-white">Sign in to TitanForge</h2>
          <p className="text-xs text-slate-400">Enter your credentials to manage your digital twin.</p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg text-center font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4.5 text-xs">
          
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-semibold">Work Email Address</label>
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5">
              <Mail className="h-4 w-4 text-slate-500 shrink-0" />
              <input 
                type="email" 
                placeholder="name@company.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-0 ring-0 focus:outline-none text-slate-200"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-slate-400 font-semibold">Account Password</label>
              <a href="#" className="text-[10px] text-blue-400 hover:text-blue-300 font-medium">Forgot?</a>
            </div>
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5">
              <Key className="h-4 w-4 text-slate-500 shrink-0" />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-0 ring-0 focus:outline-none text-slate-200"
                required
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-1.5 px-4 py-3 bg-white text-black hover:bg-slate-200 rounded-lg font-semibold transition-colors disabled:opacity-50 text-xs shadow-lg mt-4"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>

        </form>

        {/* Redirect */}
        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-800/40">
          New to TitanForge?{' '}
          <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium">
            Create an Organization
          </Link>
        </div>

      </div>

    </div>
  );
}
