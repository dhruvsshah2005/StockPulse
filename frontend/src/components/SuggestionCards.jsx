import React from 'react';
import { Check, X, TrendingUp, RefreshCw, Zap, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function SuggestionCards({
  pricingSuggestions,
  reorderSuggestions,
  onAcceptPricing,
  onRejectPricing,
  onAcceptReorder,
  onRejectReorder
}) {
  const pendingPricing = pricingSuggestions.filter(s => s.status === 'PENDING');
  const pendingReorder = reorderSuggestions.filter(s => s.status === 'PENDING');

  const getTriggerBadge = (reason) => {
    switch (reason) {
      case 'INVENTORY_LOW':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <AlertTriangle className="w-3 h-3" />
            <span>INVENTORY_LOW</span>
          </span>
        );
      case 'DEMAND_SPIKE':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
            <Zap className="w-3 h-3" />
            <span>DEMAND_SPIKE</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
            <span>MANUAL</span>
          </span>
        );
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* PRICING SUGGESTIONS COLUMN */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span>Pricing Recommendations</span>
            <span className="bg-purple-500/20 text-purple-300 font-mono text-xs px-2 py-0.5 rounded-full border border-purple-500/30">
              {pendingPricing.length} pending
            </span>
          </h3>
        </div>

        {pendingPricing.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8 text-center text-slate-500 text-xs">
            No pending pricing recommendations. Simulate sales or stock changes to trigger agentic recommendations.
          </div>
        ) : (
          pendingPricing.map(s => {
            const product = s.productId || {};
            const pctDiff = (((s.recommendedPrice - s.currentPrice) / s.currentPrice) * 100).toFixed(1);
            const isIncrease = s.recommendedPrice > s.currentPrice;

            return (
              <div
                key={s._id}
                className="bg-slate-900 border border-purple-500/30 hover:border-purple-500/50 rounded-2xl p-5 shadow-xl transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h4 className="font-bold text-white text-sm">{product.name || 'Product'}</h4>
                    <span className="font-mono text-[11px] text-slate-400">{product.sku}</span>
                  </div>
                  {getTriggerBadge(s.triggerReason)}
                </div>

                {/* Price Transformation */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between mb-3">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-mono">Current Price</div>
                    <div className="text-sm font-mono font-semibold text-slate-300">${s.currentPrice.toFixed(2)}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-mono">Recommended</div>
                    <div className="text-base font-mono font-extrabold text-purple-400">
                      ${s.recommendedPrice.toFixed(2)}
                      <span className={`text-xs ml-1 font-bold ${isIncrease ? 'text-emerald-400' : 'text-amber-400'}`}>
                        ({isIncrease ? `+${pctDiff}%` : `${pctDiff}%`})
                      </span>
                    </div>
                  </div>
                </div>

                {/* AI Confidence & Reasoning */}
                <div className="mb-4">
                  <div className="flex items-center space-x-1 text-xs text-purple-300 font-semibold mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                    <span>{(s.confidence * 100).toFixed(0)}% Confidence Score</span>
                  </div>
                  <p className="text-xs text-slate-300 bg-slate-950/40 border border-slate-800 p-2.5 rounded-lg italic">
                    "{s.reasoning}"
                  </p>
                </div>

                {/* Human Checkpoint Actions */}
                <div className="flex items-center space-x-2 pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => onAcceptPricing(s._id)}
                    className="flex-1 flex items-center justify-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2 rounded-xl transition-all shadow-lg shadow-emerald-900/30"
                  >
                    <Check className="w-4 h-4" />
                    <span>Accept & Update Price</span>
                  </button>
                  <button
                    onClick={() => onRejectPricing(s._id)}
                    className="px-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 font-semibold text-xs py-2 rounded-xl border border-slate-700 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* REORDER SUGGESTIONS COLUMN */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <RefreshCw className="w-4 h-4 text-emerald-400" />
            <span>Reorder / Replenishment</span>
            <span className="bg-emerald-500/20 text-emerald-300 font-mono text-xs px-2 py-0.5 rounded-full border border-emerald-500/30">
              {pendingReorder.length} pending
            </span>
          </h3>
        </div>

        {pendingReorder.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8 text-center text-slate-500 text-xs">
            No pending reorder recommendations. Stock levels are currently above reorder thresholds.
          </div>
        ) : (
          pendingReorder.map(s => {
            const product = s.productId || {};

            return (
              <div
                key={s._id}
                className="bg-slate-900 border border-emerald-500/30 hover:border-emerald-500/50 rounded-2xl p-5 shadow-xl transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h4 className="font-bold text-white text-sm">{product.name || 'Product'}</h4>
                    <span className="font-mono text-[11px] text-slate-400">{product.sku}</span>
                  </div>
                  {getTriggerBadge(s.triggerReason)}
                </div>

                {/* Stock Transformation */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between mb-3">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-mono">Current Stock</div>
                    <div className="text-sm font-mono font-semibold text-slate-300">{s.currentStock} units</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-mono">Reorder Order Qty</div>
                    <div className="text-base font-mono font-extrabold text-emerald-400">
                      +{s.recommendedQuantity} units
                      <span className="text-xs ml-1.5 font-normal text-slate-400">({s.suggestedLeadTimeDays}d lead)</span>
                    </div>
                  </div>
                </div>

                {/* AI Confidence & Reasoning */}
                <div className="mb-4">
                  <div className="flex items-center space-x-1 text-xs text-emerald-300 font-semibold mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{(s.confidence * 100).toFixed(0)}% Confidence Score</span>
                  </div>
                  <p className="text-xs text-slate-300 bg-slate-950/40 border border-slate-800 p-2.5 rounded-lg italic">
                    "{s.reasoning}"
                  </p>
                </div>

                {/* Human Checkpoint Actions */}
                <div className="flex items-center space-x-2 pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => onAcceptReorder(s._id)}
                    className="flex-1 flex items-center justify-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2 rounded-xl transition-all shadow-lg shadow-emerald-900/30"
                  >
                    <Check className="w-4 h-4" />
                    <span>Accept & Restock Stock</span>
                  </button>
                  <button
                    onClick={() => onRejectReorder(s._id)}
                    className="px-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 font-semibold text-xs py-2 rounded-xl border border-slate-700 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
