import React from 'react';
import { Zap, Bot, ShieldCheck, ArrowRight, TrendingUp, RefreshCw, BarChart2, Check, Sparkles, Layers, Sliders } from 'lucide-react';

export default function LandingPage({ onLaunchConsole, onOpenAdr }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-emerald-500 to-teal-400 p-2.5 rounded-2xl shadow-lg shadow-emerald-900/40 text-slate-950 flex items-center justify-center">
              <Zap className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl text-white tracking-tight font-sans">StockPulse</span>
                <span className="text-[10px] uppercase font-mono tracking-widest font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  AI Commerce
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Autonomous Inventory & Dynamic Pricing Engine</p>
            </div>
          </div>

          {/* Navigation Links & Action */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onLaunchConsole}
              className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-950/60 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Launch Merchandising Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden">
        {/* Subtle Background Glow Elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[200px] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 mb-6 shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span>Next-Gen E-Commerce Signal Automation</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15] mb-6">
              Real-Time Demand Signals.{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-purple-400 bg-clip-text text-transparent">
                Smart AI Pricing.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-400 leading-relaxed font-normal mb-8">
              Stop lagging behind manual spreadsheets. StockPulse automatically detects low inventory thresholds and viral demand spikes, generating AI pricing and reorder recommendations governed by human merchandiser checkpoint approval.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onLaunchConsole}
                className="w-full sm:w-auto flex items-center justify-center space-x-2.5 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm rounded-2xl shadow-xl shadow-emerald-950/80 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>Open Merchandising Console</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Live Demo Preview Mock Card */}
          <div className="max-w-4xl mx-auto bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-slate-950 backdrop-blur">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs font-mono text-slate-400 ml-2">StockPulse Signal Detection Engine — Live Preview</span>
              </div>
              <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30">
                SIGNAL: INVENTORY_LOW
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Context */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                <div className="text-xs text-slate-400 uppercase font-mono tracking-wider mb-1">Target Product</div>
                <h3 className="text-lg font-bold text-white mb-2">Organic Cotton T-Shirt</h3>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-slate-900">
                    <span className="text-slate-500">Current Stock</span>
                    <span className="text-amber-400 font-bold">8 units (Threshold: 15)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900">
                    <span className="text-slate-500">Current Price</span>
                    <span className="text-slate-200 font-bold">$24.99</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Demand Velocity</span>
                    <span className="text-emerald-400 font-bold">12 orders/24h</span>
                  </div>
                </div>
              </div>

              {/* AI Recommendation Output */}
              <div className="bg-slate-950 border border-purple-500/30 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-purple-300 flex items-center space-x-1">
                      <Bot className="w-3.5 h-3.5 text-purple-400" />
                      <span>Gemini AI Merchandising Strategy</span>
                    </span>
                    <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">
                      88% Confidence
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 italic mb-4">
                    "Stock level (8) is below reorder threshold (15). Recommending +10% price adjustment ($24.99 ➔ $27.49) to optimize revenue while stock is replenished (+37 units)."
                  </p>
                </div>

                <div className="flex items-center space-x-2 pt-3 border-t border-slate-900">
                  <button
                    onClick={onLaunchConsole}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-950"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Accept & Live Update</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3 Pillars Section */}
      <section className="py-16 bg-slate-950 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
              Built for Modern E-Commerce Merchandising
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Combines event-driven automation, advanced LLM reasoning, and mandatory human checkpoints.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Pillar 1 */}
            <div className="bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 rounded-3xl p-6 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">1. Agentic Signal Triggers</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automatically detects when inventory crosses low-stock thresholds or demand velocity spikes 3x above category averages, queueing recommendations without manual intervention.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 rounded-3xl p-6 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-5">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">2. Pluggable AI & Fallbacks</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Powered by Gemini AI with strict bounds checking. If the LLM times out or encounters API limits, the engine seamlessly falls back to deterministic rule-based algorithms.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="bg-slate-900/60 border border-slate-800 hover:border-teal-500/40 rounded-3xl p-6 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">3. Human-in-the-Loop</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Zero automated price changes or unvetted purchase orders. Recommendations land in the Merchandiser Action Center where humans click Accept or Reject.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 py-8 bg-slate-950 text-center text-xs text-slate-500">
        StockPulse — AI Inventory & Dynamic Pricing Engine · Hackathon Edition
      </footer>

    </div>
  );
}
