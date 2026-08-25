import React from 'react';
import { Package, AlertTriangle, TrendingUp, CheckCircle2 } from 'lucide-react';

export default function AnalyticsSummary({ products, pricingSuggestions, reorderSuggestions }) {
  const totalProducts = products.length;
  const lowStockCount = products.filter(p => p.stockLevel < p.reorderThreshold).length;
  const pendingPricing = pricingSuggestions.filter(s => s.status === 'PENDING').length;
  const pendingReorders = reorderSuggestions.filter(s => s.status === 'PENDING').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center space-x-4">
        <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
          <Package className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-400">Total Catalog Products</p>
          <h3 className="text-2xl font-bold text-white mt-0.5">{totalProducts}</h3>
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center space-x-4">
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-400">Low Stock Signals</p>
          <h3 className="text-2xl font-bold text-white mt-0.5">{lowStockCount}</h3>
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center space-x-4">
        <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl">
          <TrendingUp className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-400">Pending Price Reviews</p>
          <h3 className="text-2xl font-bold text-white mt-0.5">{pendingPricing}</h3>
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center space-x-4">
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-400">Pending Reorder Reviews</p>
          <h3 className="text-2xl font-bold text-white mt-0.5">{pendingReorders}</h3>
        </div>
      </div>
    </div>
  );
}
