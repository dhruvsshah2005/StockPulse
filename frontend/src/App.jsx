import React, { useState, useEffect, useCallback } from 'react';
import LandingPage from './components/LandingPage';
import AdminLoginModal from './components/AdminLoginModal';
import DbInspectorModal from './components/DbInspectorModal';
import Navbar from './components/Navbar';
import AnalyticsSummary from './components/AnalyticsSummary';
import ProductList from './components/ProductList';
import SuggestionCards from './components/SuggestionCards';
import ActivityTicker from './components/ActivityTicker';
import AuditLogTab from './components/AuditLogTab';
import AgentSwarmWidget from './components/AgentSwarmWidget';
import { api } from './api/client';
import { RefreshCw, Play, Sparkles, CheckCircle, AlertCircle, Home } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'console'
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isDbInspectorOpen, setIsDbInspectorOpen] = useState(false);

  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('stockpulse_admin_token') || null);
  const [adminUser, setAdminUser] = useState(() => {
    const saved = localStorage.getItem('stockpulse_admin_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [products, setProducts] = useState([]);
  const [pricingSuggestions, setPricingSuggestions] = useState([]);
  const [reorderSuggestions, setReorderSuggestions] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [strategy, setStrategy] = useState('AI');
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadData = useCallback(async () => {
    try {
      const [prods, pricing, reorder, logs, stratObj] = await Promise.all([
        api.getProducts(),
        api.getPricingSuggestions(),
        api.getReorderSuggestions(),
        api.getActivityLogs().catch(() => []),
        api.getStrategy().catch(() => ({ strategy: 'AI' }))
      ]);

      setProducts(prods || []);
      setPricingSuggestions(pricing || []);
      setReorderSuggestions(reorder || []);
      setActivityLogs(logs || []);
      if (stratObj?.strategy) setStrategy(stratObj.strategy);
    } catch (err) {
      console.error('Error loading StockPulse state:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load and background polling every 3 seconds
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Handle Launch Console Click
  const handleLaunchConsoleClick = () => {
    if (adminUser && adminToken) {
      setCurrentView('console');
    } else {
      setIsLoginModalOpen(true);
    }
  };

  // Handle Login / Register Success
  const handleLoginSuccess = (token, user) => {
    setAdminToken(token);
    setAdminUser(user);
    localStorage.setItem('stockpulse_admin_token', token);
    localStorage.setItem('stockpulse_admin_user', JSON.stringify(user));
    setIsLoginModalOpen(false);
    setCurrentView('console');
    showNotification(`Welcome, ${user.name}! Account active.`, 'success');
  };

  // Handle Logout
  const handleLogout = () => {
    setAdminToken(null);
    setAdminUser(null);
    localStorage.removeItem('stockpulse_admin_token');
    localStorage.removeItem('stockpulse_admin_user');
    setCurrentView('landing');
    showNotification('Logged out successfully.', 'info');
  };

  // Strategy Switcher
  const handleToggleStrategy = async (newStrategy) => {
    try {
      await api.setStrategy(newStrategy);
      setStrategy(newStrategy);
      showNotification(`Advisor strategy switched to ${newStrategy}`, 'success');
      loadData();
    } catch (err) {
      showNotification(`Failed to set strategy: ${err.message}`, 'error');
    }
  };

  // Reset Database Seed Data
  const handleResetSeed = async () => {
    try {
      setIsSeeding(true);
      await api.seedDatabase();
      showNotification('Database reset and re-seeded with demo catalog!', 'success');
      await loadData();
    } catch (err) {
      showNotification(`Seed reset error: ${err.message}`, 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  // Simulate Sale
  const handleSimulateSale = async (id, quantity = 1) => {
    try {
      const res = await api.simulateSale(id, quantity);
      showNotification(`Sale simulated! Decremented stock for ${res.product.name}`, 'success');
      await loadData();
    } catch (err) {
      showNotification(`Sale simulation failed: ${err.message}`, 'error');
    }
  };

  // Update Stock
  const handleUpdateStock = async (id, newStock) => {
    try {
      await api.updateStock(id, newStock);
      showNotification(`Stock updated to ${newStock} units`, 'success');
      await loadData();
    } catch (err) {
      showNotification(`Stock update failed: ${err.message}`, 'error');
    }
  };

  // Request Manual Suggestion
  const handleRequestSuggestion = async (id) => {
    try {
      await Promise.all([api.suggestPricing(id), api.suggestReorder(id)]);
      showNotification('Manual suggestions generated successfully!', 'success');
      await loadData();
    } catch (err) {
      showNotification(`Suggestion request error: ${err.message}`, 'error');
    }
  };

  // Accept Pricing Suggestion
  const handleAcceptPricing = async (id) => {
    try {
      await api.patchPricingSuggestion(id, 'ACCEPTED');
      showNotification('Pricing suggestion ACCEPTED! Product price updated.', 'success');
      await loadData();
    } catch (err) {
      showNotification(`Failed to accept pricing: ${err.message}`, 'error');
    }
  };

  // Reject Pricing Suggestion
  const handleRejectPricing = async (id) => {
    try {
      await api.patchPricingSuggestion(id, 'REJECTED');
      showNotification('Pricing suggestion REJECTED.', 'info');
      await loadData();
    } catch (err) {
      showNotification(`Failed to reject pricing: ${err.message}`, 'error');
    }
  };

  // Accept Reorder Suggestion
  const handleAcceptReorder = async (id) => {
    try {
      await api.patchReorderSuggestion(id, 'ACCEPTED');
      showNotification('Reorder suggestion ACCEPTED! Inbound stock applied to inventory.', 'success');
      await loadData();
    } catch (err) {
      showNotification(`Failed to accept reorder: ${err.message}`, 'error');
    }
  };

  // Reject Reorder Suggestion
  const handleRejectReorder = async (id) => {
    try {
      await api.patchReorderSuggestion(id, 'REJECTED');
      showNotification('Reorder suggestion REJECTED.', 'info');
      await loadData();
    } catch (err) {
      showNotification(`Failed to reject reorder: ${err.message}`, 'error');
    }
  };

  // Quick Demo Trigger Shortcuts
  const handleQuickDemoLowStock = async () => {
    const tshirt = products.find(p => p.sku === 'PRD-003');
    if (tshirt) {
      await handleSimulateSale(tshirt._id, 1);
    }
  };

  const handleQuickDemoDemandSpike = async () => {
    const hoodie = products.find(p => p.sku === 'PRD-008');
    if (hoodie) {
      await handleSimulateSale(hoodie._id, 5);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl border flex items-center space-x-2 text-xs font-semibold animate-bounce ${
          notification.type === 'success'
            ? 'bg-emerald-900/90 text-emerald-200 border-emerald-500/50'
            : notification.type === 'error'
            ? 'bg-red-900/90 text-red-200 border-red-500/50'
            : 'bg-slate-800 text-slate-200 border-slate-700'
        }`}>
          {notification.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
          {notification.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Admin Login & Sign Up Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Database Inspector Modal */}
      <DbInspectorModal
        isOpen={isDbInspectorOpen}
        onClose={() => setIsDbInspectorOpen(false)}
      />

      {/* View Switcher */}
      {currentView === 'landing' ? (
        <LandingPage onLaunchConsole={handleLaunchConsoleClick} />
      ) : (
        <>
          {/* Navigation Header */}
          <Navbar
            strategy={strategy}
            onToggleStrategy={handleToggleStrategy}
            onResetSeed={handleResetSeed}
            isSeeding={isSeeding}
            onGoHome={() => setCurrentView('landing')}
            adminUser={adminUser}
            onLogout={handleLogout}
            onOpenDbInspector={() => setIsDbInspectorOpen(true)}
          />

          {/* Main Console Container */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            
            {/* Top Activity Ticker */}
            <ActivityTicker latestLog={activityLogs[0]} />

            {/* Active Multi-Agent AI Swarm Status Widget */}
            <AgentSwarmWidget />

            {/* Top Demo Shortcut Banner */}
            <div className="bg-gradient-to-r from-purple-900/40 via-slate-900 to-emerald-900/40 border border-slate-800 rounded-2xl p-4 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <h2 className="text-sm font-bold text-white">Live Demo Walkthrough Shortcuts</h2>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  1-click triggers to demonstrate real-time signal detection, agentic suggestions & human checkpoint approvals.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleQuickDemoLowStock}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold rounded-xl transition-all"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Demo 1: Trigger Low Stock (PRD-003)</span>
                </button>
                <button
                  onClick={handleQuickDemoDemandSpike}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold rounded-xl transition-all"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Demo 2: Trigger Demand Spike (PRD-008)</span>
                </button>
              </div>
            </div>

            {/* Analytics Stat Summary Cards */}
            <AnalyticsSummary
              products={products}
              pricingSuggestions={pricingSuggestions}
              reorderSuggestions={reorderSuggestions}
            />

            {/* Suggestions Recommendations Feed (Human Checkpoints) */}
            <SuggestionCards
              pricingSuggestions={pricingSuggestions}
              reorderSuggestions={reorderSuggestions}
              onAcceptPricing={handleAcceptPricing}
              onRejectPricing={handleRejectPricing}
              onAcceptReorder={handleAcceptReorder}
              onRejectReorder={handleRejectReorder}
            />

            {/* Catalog Table */}
            <ProductList
              products={products}
              onSimulateSale={handleSimulateSale}
              onUpdateStock={handleUpdateStock}
              onRequestSuggestion={handleRequestSuggestion}
            />

            {/* Audit Trail Section */}
            <AuditLogTab activityLogs={activityLogs} />

          </main>

          {/* Footer */}
          <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-600 flex items-center justify-center space-x-4">
            <span>StockPulse E-Commerce Engine — Hackathon MVP</span>
            <button
              onClick={() => setCurrentView('landing')}
              className="text-slate-400 hover:text-white flex items-center space-x-1 underline"
            >
              <Home className="w-3 h-3" />
              <span>Landing Page</span>
            </button>
          </footer>
        </>
      )}
    </div>
  );
}
