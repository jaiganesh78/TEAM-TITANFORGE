'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Key, Mail, Building, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Mock registration process
    setTimeout(() => {
      setLoading(false);
      if (name && email && password && company) {
        router.push('/dashboard');
      } else {
        setError('Please fill in all registration fields.');
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background radial highlight */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[100px] pointer-events-none" />

      <div className="max-w-md w-full bg-slate-900/60 border border-slate-800 backdrop-blur rounded-xl p-8 space-y-5.5 relative z-10">
        
        {/* Title */}
        <div className="text-center space-y-2">
          <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center text-black font-extrabold text-lg mx-auto shadow">
            TF
          </div>
          <h2 className="text-lg font-bold text-white">Create your Organization</h2>
          <p className="text-xs text-slate-400">Initialize your business data twin and setup the executive board.</p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg text-center font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-semibold">Your Full Name</label>
            <input 
              type="text" 
              placeholder="Jai Ganesh" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-slate-200 focus:outline-none focus:border-slate-700"
              required
            />
          </div>

          {/* Company Name */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-semibold">Company/Organization Name</label>
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5">
              <Building className="h-4 w-4 text-slate-500 shrink-0" />
              <input 
                type="text" 
                placeholder="TitanForge LLC" 
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full bg-transparent border-0 ring-0 focus:outline-none text-slate-200"
                required
              />
            </div>
          </div>

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
            <label className="text-slate-400 font-semibold">Create Password</label>
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
            <span>{loading ? 'Bootstrapping Board...' : 'Create Account'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>

        </form>

        {/* Redirect */}
        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-800/40">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
            Sign In
          </Link>
        </div>

      </div>

    </div>
  );
}
