import React from 'react';
import { Bot, Cpu, TrendingUp, Package, ShieldCheck, Zap } from 'lucide-react';

export default function AgentSwarmWidget() {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 mb-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
        <div className="flex items-center space-x-2">
          <Bot className="w-4 h-4 text-purple-400" />
          <h3 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono">
            Active Multi-Agent AI Swarm Status
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30 font-bold">
          3 AGENTS ACTIVE
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        
        {/* Agent 1 */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 flex items-start space-x-3">
          <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white font-mono flex items-center space-x-1">
              <span>PricingAgent</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Dynamic Elasticity & Price Surge Model</p>
          </div>
        </div>

        {/* Agent 2 */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 flex items-start space-x-3">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white font-mono flex items-center space-x-1">
              <span>InventoryAgent</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Stock Burn Rate & Lead Time Model</p>
          </div>
        </div>

        {/* Agent 3 */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 flex items-start space-x-3">
          <div className="p-2 bg-teal-500/10 text-teal-400 rounded-lg shrink-0">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white font-mono flex items-center space-x-1">
              <span>OrchestratorAgent</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Swarm Coordinator & Fallback Manager</p>
          </div>
        </div>

      </div>
    </div>
  );
}
