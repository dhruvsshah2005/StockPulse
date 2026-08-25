import React from 'react';
import { Zap, AlertTriangle, CheckCircle, ShieldCheck, ShoppingCart, RefreshCw } from 'lucide-react';

export default function ActivityTicker({ latestLog }) {
  if (!latestLog) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl px-4 py-2.5 mb-6 flex items-center space-x-3 text-xs text-slate-400">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
        <span className="font-mono text-slate-300">Live Agentic Signal Ticker: Listening for e-commerce inventory events...</span>
      </div>
    );
  }

  const getBadgeIcon = (type) => {
    switch (type) {
      case 'INVENTORY_LOW_TRIGGER':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
      case 'DEMAND_SPIKE_TRIGGER':
        return <Zap className="w-3.5 h-3.5 text-purple-400 animate-pulse" />;
      case 'HUMAN_CHECKPOINT_ACCEPTED':
        return <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />;
      case 'HUMAN_CHECKPOINT_REJECTED':
        return <ShieldCheck className="w-3.5 h-3.5 text-red-400" />;
      case 'SALE_SIMULATED':
        return <ShoppingCart className="w-3.5 h-3.5 text-blue-400" />;
      default:
        return <RefreshCw className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 mb-6 flex items-center justify-between shadow-lg overflow-hidden relative">
      <div className="flex items-center space-x-3 truncate">
        <div className="flex items-center space-x-1.5 shrink-0 font-mono text-[10px] bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold">LIVE EVENT</span>
        </div>

        <div className="flex items-center space-x-2 text-xs truncate">
          {getBadgeIcon(latestLog.type)}
          <span className="font-bold text-white font-mono">{latestLog.title}:</span>
          <span className="text-slate-300 truncate">{latestLog.details}</span>
        </div>
      </div>

      <div className="text-[10px] font-mono text-slate-500 shrink-0 hidden sm:block">
        {new Date(latestLog.createdAt).toLocaleTimeString()}
      </div>
    </div>
  );
}
