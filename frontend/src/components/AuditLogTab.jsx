import React from 'react';
import { History, Zap, AlertTriangle, CheckCircle, XCircle, ShoppingCart, RefreshCw } from 'lucide-react';

export default function AuditLogTab({ activityLogs }) {
  const getBadgeStyle = (badge) => {
    switch (badge) {
      case 'WARNING':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'PURPLE':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'SUCCESS':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'DANGER':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 mb-8">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <History className="w-4 h-4 text-emerald-400" />
          <span>Real-Time Audit Trail & Signal Trace</span>
          <span className="text-xs bg-slate-800 text-slate-400 font-mono px-2 py-0.5 rounded-full">
            {activityLogs.length} events logged
          </span>
        </h3>
        <p className="text-xs text-slate-400 font-mono">Order ➔ Low Stock Trigger ➔ AI Suggestion ➔ Human Approval</p>
      </div>

      {activityLogs.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-xs font-mono">
          No activity logged yet. Click "Simulate Sale" to trigger signal detection events.
        </div>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {activityLogs.map((log) => (
            <div
              key={log._id}
              className="bg-slate-900 border border-slate-800/80 rounded-xl p-3.5 flex items-start justify-between gap-4 hover:border-slate-700 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full border ${getBadgeStyle(log.badge)}`}>
                    {log.type}
                  </span>
                  <h4 className="text-xs font-bold text-white">{log.title}</h4>
                </div>
                <p className="text-xs text-slate-300 font-mono">{log.details}</p>
                {log.productName && (
                  <div className="text-[11px] text-slate-400">
                    Product: <span className="text-slate-200 font-semibold">{log.productName}</span> ({log.productSku})
                  </div>
                )}
              </div>

              <div className="text-[10px] font-mono text-slate-500 shrink-0">
                {new Date(log.createdAt).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
