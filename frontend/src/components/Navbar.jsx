import React from 'react';
import { RefreshCw, Zap, Bot, Sliders, Home, User, LogOut, Database } from 'lucide-react';

export default function Navbar({
  strategy,
  onToggleStrategy,
  onResetSeed,
  isSeeding,
  onGoHome,
  adminUser,
  onLogout,
  onOpenDbInspector
}) {
  return (
    <header className="bg-slate-950/80 backdrop-blur border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & Back to Home */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onGoHome}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl border border-slate-800 transition-all"
            title="Return to Landing Page"
          >
            <Home className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Landing Page</span>
          </button>

          <div className="h-6 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center space-x-2.5">
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-1.5 rounded-xl text-emerald-400 flex items-center justify-center">
              <Zap className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base text-white tracking-tight">StockPulse Console</span>
                <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Live
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          
          {/* DB Inspector Button */}
          <button
            onClick={onOpenDbInspector}
            className="flex items-center space-x-1.5 px-3 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs font-semibold rounded-xl border border-purple-500/30 transition-all"
            title="View live database records (Users & Products)"
          >
            <Database className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden md:inline">Inspect Database</span>
          </button>

          {/* Strategy Toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => onToggleStrategy('AI')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                strategy === 'AI'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>AI Advisor</span>
            </button>
            <button
              onClick={() => onToggleStrategy('RULE')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                strategy === 'RULE'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Rule-Based</span>
            </button>
          </div>

          {/* Seed / Reset Data */}
          <button
            onClick={onResetSeed}
            disabled={isSeeding}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all active:scale-95 disabled:opacity-50"
            title="Reset database to default seed state for live demo"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Reset Seed</span>
          </button>

          {/* Admin Profile & Logout */}
          {adminUser && (
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
              <div className="hidden md:flex items-center space-x-1.5 bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-300">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span className="max-w-[100px] truncate">{adminUser.name || 'Admin'}</span>
              </div>

              <button
                onClick={onLogout}
                className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl transition-all"
                title="Log Out Admin Session"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
