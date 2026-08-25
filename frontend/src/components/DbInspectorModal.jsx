import React, { useState, useEffect } from 'react';
import { Database, X, Users, Package, RefreshCw, ShieldCheck } from 'lucide-react';
import { api } from '../api/client';

export default function DbInspectorModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'products'
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [u, p] = await Promise.all([
        api.getUsers().catch(() => []),
        api.getProducts().catch(() => [])
      ]);
      setUsers(u || []);
      setProducts(p || []);
    } catch (err) {
      console.error('Failed loading DB inspector data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative shadow-purple-950/20 max-h-[85vh] flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>Database Record Inspector</span>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 font-mono px-2 py-0.5 rounded border border-purple-500/30">
                  Live Records
                </span>
              </h3>
              <p className="text-xs text-slate-400">Inspect live documents saved in the User and Product database collections</p>
            </div>
          </div>

          <button
            onClick={loadData}
            disabled={isLoading}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-all"
            title="Refresh database records"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Collection Selector Tabs */}
        <div className="flex items-center space-x-2 mb-4">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'users'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Users Collection ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'products'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Products Collection ({products.length})</span>
          </button>
        </div>

        {/* Content Table Container */}
        <div className="flex-1 overflow-y-auto bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
          {activeTab === 'users' ? (
            users.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs font-mono">No users found in database</div>
            ) : (
              <table className="w-full text-left text-xs text-slate-300 font-mono">
                <thead className="text-[10px] text-slate-500 uppercase border-b border-slate-800">
                  <tr>
                    <th className="pb-2">User ID</th>
                    <th className="pb-2">Full Name</th>
                    <th className="pb-2">Email Address</th>
                    <th className="pb-2">Role</th>
                    <th className="pb-2 text-right">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {users.map(u => (
                    <tr key={u.id}>
                      <td className="py-2.5 text-slate-500 text-[11px]">{u.id}</td>
                      <td className="py-2.5 font-bold text-white">{u.name}</td>
                      <td className="py-2.5 text-purple-300">{u.email}</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-2.5 text-right text-slate-500 text-[10px]">
                        {new Date(u.createdAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : (
            products.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs font-mono">No products found in database</div>
            ) : (
              <table className="w-full text-left text-xs text-slate-300 font-mono">
                <thead className="text-[10px] text-slate-500 uppercase border-b border-slate-800">
                  <tr>
                    <th className="pb-2">SKU</th>
                    <th className="pb-2">Product Name</th>
                    <th className="pb-2">Category</th>
                    <th className="pb-2">Price</th>
                    <th className="pb-2">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {products.map(p => (
                    <tr key={p._id}>
                      <td className="py-2.5 text-slate-400">{p.sku}</td>
                      <td className="py-2.5 font-bold text-white">{p.name}</td>
                      <td className="py-2.5 text-slate-400">{p.category}</td>
                      <td className="py-2.5 text-emerald-400">${p.currentPrice.toFixed(2)}</td>
                      <td className="py-2.5 text-amber-400">{p.stockLevel} units</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}
        </div>

      </div>
    </div>
  );
}
