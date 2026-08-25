# Architecture Decision Record (ADR) — StockPulse

**Project**: StockPulse — AI Inventory & Dynamic Pricing Engine  
**Author**: Lead Developer  
**Date**: August 25, 2026  
**Status**: APPROVED / IMPLEMENTED

---

## 1. Stack & Runtime Choice: Node.js + Express + React (Vite) vs. Spring Boot

### Context
The hackathon problem statement permits both Java (Spring Boot) and JavaScript/TypeScript (Node.js/Express + React). Given the 2-to-3-hour time constraint, rapid domain modeling, async event loops, and zero-friction setup were critical.

### Options
1. **Spring Boot 3.x + React / Angular**: Powerful type safety, `@EventListener`, and `@Async` support, but requires longer boilerplate, JVM warm-up, and heavier configuration.
2. **Node.js + Express + React (Vite)**: Lightweight, fast startup times, non-blocking asynchronous event loop natively integrated, and instant Vite hot module replacement (HMR).

### Decision
Chose **Node.js + Express + React (Vite)** with **MongoDB (Mongoose + `mongodb-memory-server` fallback)**.
- Express provides minimal overhead for REST API endpoints.
- `mongodb-memory-server` ensures the application runs out-of-the-box on any judge machine without requiring a pre-installed MongoDB daemon.

### Tradeoffs
- Sacrificed Java compile-time type safety for high development velocity.
- Mitigated potential dynamic typing issues using explicit Mongoose schema validation.

---

## 2. Commerce Engine Architecture: Pluggable Strategy Pattern

### Context
Pricing and replenishment decisions must support both deterministic rules and LLM-driven reasoning. The system must allow switching between `RuleBasedAdvisor` and `AIAdvisor` at runtime without restarting the application or changing business logic.

### Options
1. **Conditional Statements inside Route Controllers**: Embedding `if (strategy === 'AI')` directly inside Express route handlers.
2. **Pluggable Strategy Pattern (`CommerceAdvisor` interface)**: Defining an abstract interface contract with decoupled implementations (`RuleBasedAdvisor`, `AIAdvisor`) managed by a central `AdvisorFactory`.

### Decision
Chose **Pluggable Strategy Pattern**.
- `CommerceAdvisor` defines a standard `generateRecommendations(product, context)` signature returning `{ pricing, reorder }`.
- `advisorFactory.js` manages runtime strategy switching via `/config/strategy`.

### Tradeoffs
- Requires lightweight abstraction boilerplate, but completely decouples HTTP routes from commerce reasoning logic and simplifies adding future strategies (e.g. `CompetitorAwareStrategy` in Sprint 2).

---

## 3. LLM Resilience & Fallback Mechanism

### Context
LLMs (Gemini / Groq) can fail due to network timeouts, rate limits, invalid API keys, or malformed JSON responses. The agentic loop must **never silently drop recommendations** or crash the application.

### Options
1. **Fail-hard & Throw HTTP 500**: Return error to caller or discard the recommendation event on AI failure.
2. **Automatic Fallback to Rule-Based Advisor**: Catch all AI errors/validation failures, execute `RuleBasedAdvisor`, and attach a notice string (`[Rule Fallback Active]`) to the recommendation reasoning.

### Decision
Chose **Automatic Fallback to Rule-Based Advisor**.
- The `AIAdvisor` validates pricing bounds (0.5x to 2.5x current price), positive reorder quantities, and confidence ranges.
- On any validation failure or LLM exception, it transparently invokes `RuleBasedAdvisor`.

### Tradeoffs
- Merchandisers receive a deterministic recommendation instead of an AI-generated one when the LLM is unreachable, but system reliability and recommendation continuity remain 100%.

---

## 4. Agentic Recommendation Loop & Event Decoupling

### Context
Inventory low stock (`stockLevel < reorderThreshold`) and demand velocity spikes (`demandVelocity > 3x categoryAvg`) must automatically trigger recommendation generation without blocking simulated orders or stock updates.

### Options
1. **Synchronous Trigger Processing**: Block `POST /products/:id/orders` until AI finishes generating recommendations.
2. **Asynchronous Non-blocking Event Trigger with Deduplication**: Process stock updates instantly, return HTTP response, and execute recommendation generation asynchronously (`setImmediate` / event queue).

### Decision
Chose **Asynchronous Non-blocking Event Trigger with Deduplication**.
- Orders respond in under 10ms.
- `triggerService.js` checks for existing `PENDING` suggestions matching `productId + triggerReason` to prevent recommendation spamming.

### Tradeoffs
- Frontend requires auto-polling (every 3s) or refresh to display newly generated suggestions as they land in the background.

---

## 5. Human Checkpoint Design

### Context
AI or rule-based recommendations must **NOT** automatically update live product prices or place purchase orders without human consent.

### Options
1. **Automated Price Publishing**: Directly mutate `product.currentPrice` upon suggestion creation.
2. **Human-in-the-Loop Checkpoint**: Persist suggestions in `PENDING` state until a human merchandiser explicitly clicks ACCEPT or REJECT.

### Decision
Chose **Human-in-the-Loop Checkpoint**.
- ACCEPT on pricing suggestion updates `Product.currentPrice`.
- ACCEPT on reorder suggestion simulates inbound stock delivery by incrementing `Product.stockLevel`.
- REJECT marks suggestion as `REJECTED` with zero mutation to live inventory or prices.

### Tradeoffs
- Requires human oversight for price changes, preventing unauthorized or unexpected price fluctuations in production.
