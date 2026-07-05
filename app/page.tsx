'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, Key, Mail, Target } from 'lucide-react';

export default function RootLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify({
        name: 'Aditya Kumar',
        email: 'executive@rajalakshmi.edu.in',
        role: 'OWNER'
      }));
      localStorage.setItem('accessToken', 'mock-token-for-executive-product');
    }
    router.push('/dashboard');
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', data.data.accessToken);
          localStorage.setItem('user', JSON.stringify(data.data.user));
          document.cookie = `accessToken=${data.data.accessToken}; path=/; max-age=900; SameSite=Lax`;
        }
        router.push('/dashboard');
      } else {
        setError(data.message || 'Invalid email or password. Please try again.');
      }
    } catch (err) {
      setError('Unable to connect to the server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen w-full flex bg-[#f8fafc] font-sans antialiased">
      
      {/* LEFT COLUMN: BRANDING & SAFEGUARDS (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative z-10 border-r border-white/5 bg-gradient-to-br from-[#1F4068] via-[#0F1829] to-[#070C16] text-white">
        {/* Desktop-specific background glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[-10%] left-[-10%] size-[500px] rounded-full bg-[#1f4068]/15 blur-[130px]" />
          <div className="absolute bottom-[-10%] right-[-10%] size-[600px] rounded-full bg-[#F4D03F]/5 blur-[150px]" />
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.12] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]"
          />
        </div>

        {/* Brand Header and Main content wrapped together for tight vertical spacing */}
        <div className="space-y-10 z-10">
          {/* Top Header Logo (Inline & left-aligned) */}
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
            initial={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            <Link className="inline-flex items-center gap-3 group" href="/">
              <div className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#F4D03F] shadow-lg transition-transform group-hover:scale-105 group-hover:rotate-2 p-2.5 font-bold text-xs">
                TF
              </div>
              <div className="flex flex-col justify-center">
                <span className="font-bold text-base tracking-widest text-white leading-none uppercase">
                  TitanForge
                </span>
                <span className="text-[9.5px] font-semibold text-[#F4D03F] tracking-widest mt-1.5 leading-none uppercase">
                  AI Business Growth Operating System
                </span>
              </div>
            </Link>
          </motion.div>

          {/* Safeguards values content */}
          <div className="max-w-md space-y-5">
            <motion.div
              animate={{ opacity: 1, x: 0 }}
              className="space-y-3"
              initial={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[9px] font-bold uppercase tracking-wider text-[#F4D03F]">
                <Target className="size-3" />
                <span>Enterprise Growth Blueprint</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight leading-tight">
                A Structured System for Business Growth.
              </h2>
              <p className="text-sm text-slate-350 leading-relaxed font-normal">
                TitanForge connects corporate offices with verified growth telemetry for structural alignment. Simulate pricing models, check cash runtimes, and debate business strategies.
              </p>
            </motion.div>

            {/* Checklist */}
            <motion.div
              animate={{ opacity: 1 }}
              className="space-y-3 pt-4 border-t border-white/10"
              initial={{ opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              {[
                "Verified corporate data twin feeds only",
                "Sandbox model playground for resource runways",
                "Decentralized agent oversight and debate approvals",
                "Cumulative performance telemetry loop"
              ].map((text) => (
                <div className="flex items-start gap-3" key={text}>
                  <CheckCircle2 className="size-4.5 text-[#F4D03F] shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-355 font-normal leading-relaxed">
                    {text}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Footer info */}
        <motion.div
          animate={{ opacity: 1 }}
          className="text-[10px] text-slate-400 font-medium flex flex-wrap items-center gap-1.5 z-10 mt-8"
          initial={{ opacity: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <span>TitanForge Platform</span>
          <span className="text-white/20">•</span>
          <span>Corporate Portal V1</span>
        </motion.div>
      </div>

      {/* RIGHT COLUMN: FORM CARD CONTAINER */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 z-10 bg-[#F3F6FA] text-[#0F172A]">
        {/* Width-restrained wrapper containing the card */}
        <div className="w-full max-w-[420px]">
          {/* Container Card */}
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="w-full rounded-3xl border border-[#E2E8F0] bg-white p-8 sm:p-10 shadow-xl space-y-6 text-[#0F172A]"
            initial={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.4 }}
          >
            {/* Header branding */}
            <div className="text-left space-y-2">
              {/* Logo for Mobile only */}
              <div className="lg:hidden flex items-center gap-2 mb-4">
                <div className="size-8 rounded-lg bg-[#1F4068] flex items-center justify-center text-[#F4D03F] font-bold text-xs">
                  TF
                </div>
                <span className="font-bold text-xs tracking-widest text-[#0F172A]">
                  TITANFORGE
                </span>
              </div>

              <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight leading-tight">
                Sign In to TitanForge
              </h1>
              <p className="text-sm text-[#64748B] font-medium leading-relaxed">
                Access your simulated twin or orchestrate automated board sessions.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-500/5 border border-red-500/10 text-red-500 text-xs font-semibold rounded-lg text-center">
                {error}
              </div>
            )}

            {/* Credentials Form */}
            <form className="space-y-4 pt-1" onSubmit={handleLogin}>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                  Work Email Address
                </label>
                <input
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl h-10 px-3 text-sm placeholder-[#94A3B8] placeholder:text-xs text-[#0F172A] focus:outline-none focus:border-[#F4D03F]/80 focus:ring-2 focus:ring-[#F4D03F]/10 transition-all"
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. name@company.com"
                  type="email"
                  value={email}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                  Password
                </label>
                <input
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl h-10 px-3 text-sm placeholder-[#94A3B8] placeholder:text-xs text-[#0F172A] focus:outline-none focus:border-[#F4D03F]/80 focus:ring-2 focus:ring-[#F4D03F]/10 transition-all"
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  required
                />
              </div>

              <button
                className="w-full text-sm font-semibold rounded-xl h-10.5 bg-[#F4D03F] text-[#070C16] hover:bg-[#F4D03F]/90 hover:-translate-y-0.5 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-primary/10 mt-6 font-bold"
                disabled={isLoading}
                type="submit"
              >
                {isLoading ? "Signing In..." : "Sign In to Account"}
              </button>
            </form>

            {/* Signup anchor */}
            <div className="text-center pt-1">
              <p className="text-sm text-[#64748B] font-medium">
                Don't have an account?{" "}
                <Link
                  className="text-amber-600 hover:underline font-bold transition-all"
                  href="/register"
                >
                  Register here
                </Link>
              </p>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}
