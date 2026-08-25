import React, { useState } from 'react';
import { ShoppingCart, Edit2, Sparkles, AlertCircle, ArrowUpRight } from 'lucide-react';

export default function ProductList({ products, onSimulateSale, onUpdateStock, onRequestSuggestion }) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [editingStockId, setEditingStockId] = useState(null);
  const [stockInputVal, setStockInputVal] = useState('');
  const [actionLoading, setActionLoading] = useState({});

  const categories = ['ALL', 'ELECTRONICS', 'APPAREL', 'HOME'];

  const filteredProducts = selectedCategory === 'ALL'
    ? products
    : products.filter(p => p.category === selectedCategory);

  const handleStockSave = async (id) => {
    const val = parseInt(stockInputVal, 10);
    if (!isNaN(val) && val >= 0) {
      setActionLoading(prev => ({ ...prev, [id]: true }));
      await onUpdateStock(id, val);
      setActionLoading(prev => ({ ...prev, [id]: false }));
      setEditingStockId(null);
    }
  };

  const handleSaleClick = async (id) => {
    setActionLoading(prev => ({ ...prev, [id]: true }));
    await onSimulateSale(id, 1);
    setActionLoading(prev => ({ ...prev, [id]: false }));
  };

  const handleSuggestClick = async (id) => {
    setActionLoading(prev => ({ ...prev, [id]: true }));
    await onRequestSuggestion(id);
    setActionLoading(prev => ({ ...prev, [id]: false }));
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden mb-8">
      {/* Header & Category Filters */}
      <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <span>Product Catalog</span>
            <span className="text-xs bg-slate-800 text-slate-400 font-mono px-2 py-0.5 rounded-full">
              {filteredProducts.length} items
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Real-time inventory levels, pricing & demand signals</p>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-mono text-[10px] border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-5">Product Details</th>
              <th className="py-3.5 px-4">Price</th>
              <th className="py-3.5 px-4">Stock Level</th>
              <th className="py-3.5 px-4">Demand Velocity</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredProducts.map((p) => {
              const isLowStock = p.stockLevel < p.reorderThreshold;
              const isOutOfStock = p.stockLevel === 0;

              return (
                <tr key={p._id} className="hover:bg-slate-800/30 transition-colors">
                  {/* Product Details */}
                  <td className="py-4 px-5">
                    <div className="font-semibold text-white text-sm">{p.name}</div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="font-mono text-[11px] text-slate-400">{p.sku}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {p.category}
                      </span>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="py-4 px-4 font-mono font-bold text-sm text-emerald-400">
                    ${p.currentPrice.toFixed(2)}
                  </td>

                  {/* Stock Level */}
                  <td className="py-4 px-4">
                    {editingStockId === p._id ? (
                      <div className="flex items-center space-x-1.5">
                        <input
                          type="number"
                          value={stockInputVal}
                          onChange={(e) => setStockInputVal(e.target.value)}
                          className="w-16 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
                          autoFocus
                        />
                        <button
                          onClick={() => handleStockSave(p._id)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] px-2 py-1 rounded font-semibold"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingStockId(null)}
                          className="text-slate-400 hover:text-slate-200 text-[11px]"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span className={`font-mono font-semibold ${isLowStock ? 'text-amber-400' : 'text-slate-200'}`}>
                          {p.stockLevel} units
                        </span>
                        <button
                          onClick={() => {
                            setEditingStockId(p._id);
                            setStockInputVal(p.stockLevel);
                          }}
                          className="text-slate-500 hover:text-slate-300 p-0.5"
                          title="Edit stock level"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <div className="text-[10px] text-slate-500 font-mono">
                          (Thresh: {p.reorderThreshold})
                        </div>
                      </div>
                    )}
                  </td>

                  {/* Demand Velocity */}
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-1.5 font-mono text-slate-300">
                      <span>{p.demandVelocity}</span>
                      <span className="text-[10px] text-slate-500">orders/24h</span>
                    </div>
                  </td>

                  {/* Status Badges */}
                  <td className="py-4 px-4">
                    {isOutOfStock ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                        OUT OF STOCK
                      </span>
                    ) : p.status === 'PRICE_REVIEW_PENDING' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        REVIEW PENDING
                      </span>
                    ) : isLowStock ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        LOW INVENTORY
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        ACTIVE
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleSaleClick(p._id)}
                        disabled={isOutOfStock || actionLoading[p._id]}
                        className="flex items-center space-x-1 px-2.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold rounded-lg transition-all active:scale-95 disabled:opacity-40"
                        title="Simulate sale to decrement stock & trigger agentic loop"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Simulate Sale</span>
                      </button>

                      <button
                        onClick={() => handleSuggestClick(p._id)}
                        disabled={actionLoading[p._id]}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-all"
                        title="Request on-demand suggestions"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
