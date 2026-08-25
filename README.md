# StockPulse — Autonomous AI Inventory & Dynamic Pricing Engine

> **StockPulse** is a real-time reactive e-commerce merchandising platform. It monitors SKU inventory levels and sales demand velocity, automatically generating AI-driven pricing adjustments and replenishment purchase orders governed by mandatory human-in-the-loop merchandiser approvals.

---

## ✨ Key Features

- **⚡ Agentic Signal Triggers**: Automatically detects low inventory (`stockLevel < reorderThreshold`) and viral demand velocity surges (`demandVelocity > 3x category average`).
- **🤖 Multi-Agent AI Swarm (`backend/agents/`)**: Specialized autonomous agents:
  - `PricingAgent`: Dynamic price elasticity and margin protection.
  - `InventoryAgent`: Stock burn rate and replenishment planning.
  - `OrchestratorAgent`: Swarm coordination and fallback management.
- **🧠 Gemini AI Integration (`gemini-3.6-flash`)**: Generates structured pricing & restocking recommendations with confidence scores and plain-English reasoning.
- **🛡️ Mandatory Human Checkpoint**: Zero automated price publishing. Recommendations require explicit merchandiser `ACCEPT` or `REJECT` action.
- **📜 Real-Time Audit Trail & Database Inspector**: Live activity ticker and database document inspector for complete operational transparency.
- **✅ 100% Passing Automated Test Suite**: Built-in native test runner verifying advisor rules and price bound sanity.

---

## 🏃 Quick Start Guide

### Prerequisites
- **Node.js**: v18.x or higher
- **NPM**: v9.x or higher

### 1. Backend Server Setup
```bash
cd backend
npm install
npm start
```
*Backend runs on `http://localhost:5000`*.

### 2. Frontend Console Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*.

### 3. Run Automated Tests
```bash
cd backend
npm test
```

---

## 🛠️ API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/products` | Filterable catalog products list |
| `POST` | `/products/:id/orders` | Simulate sale (decrements stock, bumps velocity, fires agentic triggers) |
| `PATCH` | `/products/:id/stock` | Update stock level |
| `GET` | `/pricing-suggestions` | List pending/accepted pricing recommendations |
| `PATCH` | `/pricing-suggestions/:id` | Accept/Reject pricing recommendation (Accept mutates live price) |
| `GET` | `/reorder-suggestions` | List pending/accepted reorder recommendations |
| `PATCH` | `/reorder-suggestions/:id` | Accept/Reject reorder recommendation (Accept restocks inventory) |
| `POST` | `/auth/login` | Authenticate admin credentials |
| `POST` | `/auth/register` | Register new merchandiser account |
| `GET` | `/activity-logs` | Real-time signal audit trail feed |
| `GET` | `/docs/openapi.json` | OpenAPI 3.0 REST Specification |

---

## 🏗️ Project Architecture

```
hack/
├── backend/
│   ├── agents/          # Multi-Agent Swarm (PricingAgent, InventoryAgent, OrchestratorAgent)
│   ├── config/          # Database ORM & In-Memory Fallback Store
│   ├── docs/            # OpenAPI 3.0 Specification (openapi.json)
│   ├── middleware/      # Auth, RateLimiter, ErrorHandler
│   ├── models/          # Product, PricingSuggestion, ReorderSuggestion, User, ActivityLog
│   ├── routes/          # productRoutes, suggestionRoutes, authRoutes, seedRoutes, configRoutes
│   ├── services/        # triggerService, advisorFactory
│   ├── strategies/      # CommerceAdvisor, RuleBasedAdvisor, AIAdvisor
│   └── tests/           # Automated Test Suite (Jest / Node test runner)
├── frontend/
│   └── src/
│       ├── components/  # LandingPage, Navbar, ProductList, SuggestionCards,
│       │                    AdminLoginModal, DbInspectorModal, ActivityTicker, AuditLogTab
│       └── App.jsx
├── ADR.md               # Architecture Decision Records
└── README.md            # Project Documentation
```

---

## 📄 Architecture Decision Record
For in-depth technical decisions regarding strategy patterns, LLM fallback guarantees, and agentic loop decoupling, see [ADR.md](./ADR.md).
