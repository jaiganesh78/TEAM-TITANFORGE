import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 md:p-12 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="flex justify-between items-center max-w-7xl w-full mx-auto relative z-10">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center text-black font-extrabold text-base shadow">
            TF
          </div>
          <span className="font-semibold text-lg tracking-tight">TitanForge OS</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium hover:text-white transition-colors text-slate-400">
            Sign In
          </Link>
          <Link href="/register" className="text-sm font-medium px-3.5 py-1.5 bg-white text-black hover:bg-slate-200 rounded-md transition-colors shadow">
            Get Started
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl w-full mx-auto text-center my-auto py-16 relative z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-800 bg-slate-900/50 backdrop-blur text-xs text-slate-400 mb-8">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
          AI Business Growth Operating System v1.0.0
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6">
          The AI-Powered <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Executive Board</span> For Your Company
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Establish alignment, simulate key operations, debate strategies across expert agents, and unlock growth opportunities. Not a CRM. Not a chatbot. An Operating System for enterprise growth.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link 
            href="/dashboard" 
            className="w-full sm:w-auto text-sm font-semibold px-6 py-3 bg-white text-black hover:bg-slate-200 rounded-lg shadow-lg transition-all flex items-center justify-center gap-2"
          >
            Enter Dashboard Shell
          </Link>
          <Link 
            href="/register" 
            className="w-full sm:w-auto text-sm font-semibold px-6 py-3 border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 hover:border-slate-700 rounded-lg transition-all"
          >
            Create Organization
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl w-full mx-auto flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 border-t border-slate-900 pt-6 relative z-10 gap-4">
        <p>© 2026 TitanForge. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-slate-300">Privacy Policy</a>
          <a href="#" className="hover:text-slate-300">Terms of Service</a>
        </div>
      </footer>
    </div>
  );
}
