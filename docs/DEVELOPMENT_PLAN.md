# Meteora DLMM Portfolio Tracker — Development Plan

This document maps the **Comprehensive Prompt** requirements to the current codebase and a phased roadmap. Use it to track progress and plan sprints.

---

## 1. Current State vs Requirements

### 1.1 Technology Stack

| Requirement | Status | Notes |
|-------------|--------|------|
| Platform: Mobile-first (React Native) | ✅ Done | Expo (React Native); web-first dev, native for Solana Seeker |
| Blockchain: Solana | ✅ Done | `@solana/web3.js`, Helius RPC |
| Wallet: Read-only (paste addresses) | ✅ Done | No adapter; paste + validate + save |
| Optional Wallet Adapter | ⬜ Not started | Phase 2+ (one-tap import) |
| State: Redux/Zustand | ✅ Done | Zustand: addresses, positions, settings |
| Data: React Query / SWR | ⬜ Optional | Currently fetch in hooks; can add later for caching |
| Charts: Lightweight-charts / recharts | ⬜ Not started | Phase 4 (PnL, price, flow charts) |
| RPC: Helius / QuickNode / Alchemy | ✅ Done | Helius via `EXPO_PUBLIC_HELIUS_API_KEY` |

### 1.2 Position Tracking Dashboard

| Feature | Status | Location / Notes |
|---------|--------|------------------|
| **Wallet management** | | |
| Manual address input | ✅ Done | `AddressInput.tsx`, `WalletInputScreen.tsx` |
| Address validation | ✅ Done | `addressUtils.ts`, `AddressValidator.tsx`, `addressValidator.ts` |
| Multiple wallet support | ✅ Done | `addressesStore.ts`, `AddressManager.tsx` |
| Address labels | ✅ Done | `SavedAddress.label`, setLabel in store |
| Address book (save/switch) | ✅ Done | AsyncStorage, AddressManager |
| Privacy (local only) | ✅ Done | No server upload; README/docs |
| **Position display** | | |
| Pool pair, value USD | ✅ Done | `PositionCard`, `AppPosition` |
| Liquidity in both tokens | ✅ Done | `PositionValue` in types + positions service |
| Position size % of pool | ✅ Done | `shareOfPoolPercent` when pool TVL available |
| Entry date/time | ⬜ Partial | API has creation; not always shown in UI |
| Current APR/APY | ✅ Done | `PositionFees.feeApr24h`, `feeApy24h` from API |
| **Range info** | | |
| Active range (min/max bins) | ✅ Done | `PositionRange`, active bin from pool |
| Current price vs range | ✅ Done | `range.currentPrice`, in/out of range badge |
| Visual bins/liquidity distribution | ⬜ Not started | Phase 2–3 (chart) |
| Distance to range edges | ⬜ Not started | Phase 2 |
| **Value metrics** | | |
| Current value, token breakdown | ✅ Done | PositionCard, PositionDetailScreen |
| Initial investment value | ⬜ Approx | MVP uses current as proxy; need entry snapshot for real |
| Fees earned (USD + tokens) | ✅ Done | `fees.totalFeeUsdClaimed`, etc. |
| Fees per day/week/month | ⬜ Not started | Derive from API or local cache |
| **PnL** | | |
| Total PnL (USD, %) | ✅ Done | `calculations.ts`, PositionCard/Detail |
| Fee income PnL | ✅ Done | In `computeFullPnl` |
| IL calculation | ✅ Done | `computeImpermanentLoss`, `calculations.ts` |
| IL % vs hold | ✅ Done | Shown in detail |
| Net PnL (fees − IL) | ✅ Done | | 
| ROI | ⬜ Partial | Can derive from PnL % |
| Historical PnL chart | ⬜ Not started | Phase 4 |
| **Pool info** | | |
| Pool TVL, 24h volume | ✅ Done | `getPoolMetrics`, PositionDetailScreen |
| 24h fees, volume/TVL | ⬜ Partial | Pool API has volume; ratio in Phase 2 |
| Number of LPs, pool age, fee tier | ⬜ Not started | When Meteora API exposes |
| **Global metrics** | | |
| Total TVL / PnL / fees | ✅ Done | `PortfolioSummary` |
| Best/worst positions | ⬜ Not started | Phase 2 |
| Portfolio allocation breakdown | ⬜ Not started | Phase 2–4 |

### 1.3 Risk Assessment System

| Feature | Status | Notes |
|---------|--------|------|
| Risk score 0–100 | ⬜ UI only | `RiskScore.tsx` exists; score always null in data |
| IL risk component | ⬜ Not started | Need `useRiskScore` + analytics/risk.ts |
| Pool health metrics | ⬜ Not started | TVL/volume trends, volume/TVL ratio |
| Liquidity concentration | ⬜ Not started | User % done; top-10, bin distribution later |
| Range management | ⬜ Not started | Time in range, distance to edges |
| Token-specific risks | ⬜ Not started | Volatility, unlocks, other DEX liquidity |
| Money flow in score | ⬜ Not started | Phase 3 |
| Green / yellow / red bands | ✅ Done | `RiskScore.tsx`, constants |
| Alert system | ⬜ Not started | Phase 3 (notifications, thresholds) |

### 1.4 Technical Analysis & Money Flow

| Feature | Status | Notes |
|---------|--------|------|
| Flow metrics (in/out, large tx) | ⬜ Not started | Phase 3 |
| Whale / smart money tracking | ⬜ Not started | Phase 3 |
| Accumulation/distribution | ⬜ Not started | Phase 3 |
| Technical indicators (MA, RSI, etc.) | ⬜ Not started | Phase 3 |
| Market structure (trend/range, volatility) | ⬜ Not started | Phase 3 |
| Price/volume/money flow charts | ⬜ Not started | Phase 4 |

### 1.5 Data Integration

| Area | Status | Notes |
|------|--------|------|
| Meteora: positions, pools, OHLCV | ✅ Done | api.ts, pools.ts, positions.ts |
| Meteora: historical, fee endpoints | ⬜ Partial | position API used; more endpoints as needed |
| Solana RPC: positions, balances | ✅ Done | DLMM SDK + Helius |
| RPC: tx history, account subs | ⬜ Not started | Phase 2–3 |
| Price: Jupiter / real-time | ⬜ Partial | Pool current_price used; no Jupiter yet |
| Whale/wallet tracking | ⬜ Not started | Phase 3 |

### 1.6 UI/UX

| Requirement | Status | Notes |
|-------------|--------|------|
| Mobile-first, touch-friendly | ✅ Done | RN components, WebLayout for web |
| Swipe, pull-to-refresh | ✅ Done | RefreshControl on dashboard |
| Dark mode | ✅ Done | Theme + screens |
| Light mode | ⬜ Not started | Settings placeholder |
| Overview cards, expandable details | ✅ Done | Cards, PositionDetailScreen |
| Risk color coding | ✅ Done | RiskScore component |
| Loading & error states | ✅ Done | Buttons, alerts, store error |
| Accessibility | ⬜ Audit | Phase 2–4 |

### 1.7 Code Structure vs Prompt

| Prompt path | Status | Actual path |
|-------------|--------|-------------|
| `components/dashboard/*` | ✅ | PositionCard, PortfolioSummary, RiskScore |
| `components/wallet/*` | ✅ | AddressInput, AddressManager, AddressValidator |
| `components/charts/*` | ⬜ | Add in Phase 4 |
| `components/common/*` | ✅ | + WebLayout |
| `screens/*` | ✅ | Wallet, Dashboard, PositionDetail, Settings (no AnalyticsScreen yet) |
| `services/meteora/*` | ✅ | api, positions, pools |
| `services/solana/*` | ✅ | rpc, addressValidator |
| `services/analytics/*` | ⬜ | Add pnl, risk, moneyFlow in Phase 2–3 |
| `hooks/*` | ✅ | usePositions, usePoolData, useAddresses (no useRiskScore/useMoneyFlow yet) |
| `utils/*` | ✅ | calculations, formatters, constants, addressUtils |
| `types/*` | ✅ | position, pool, risk, wallet |
| `store/*` | ✅ | addresses, positions, settings (Zustand, not Redux slices) |

---

## 2. Phased Roadmap (from MVP to Full Spec)

### Phase 1 — Core MVP (mostly done)

**Goal:** Paste wallet → see positions, basic PnL, pool TVL, multiple addresses.

| # | Task | Status | Owner/Note |
|---|------|--------|------------|
| 1.1 | Wallet address input + validation | ✅ Done | |
| 1.2 | Basic position list (pair, range, value) | ✅ Done | |
| 1.3 | Simple PnL (total, fee, IL) | ✅ Done | |
| 1.4 | Pool TVL (and volume where API provides) | ✅ Done | |
| 1.5 | Manual refresh | ✅ Done | Pull-to-refresh |
| 1.6 | Save multiple addresses + labels | ✅ Done | |
| 1.7 | Web-first dev + native compatibility | ✅ Done | Stack/theme fixes for web |

**Phase 1 exit criteria:** User can add wallet, see positions and portfolio summary, open position detail, switch wallets. No risk score or charts yet.

---

### Phase 2 — Data quality & risk foundation

**Goal:** Better PnL/IL (entry snapshot or proxy), auto-refresh, basic risk score, more pool metrics.

| # | Task | Priority | Notes |
|---|------|----------|--------|
| 2.1 | Automatic data refresh (30s value, 5m pool) | High | Timer in hook or store; respect rate limits |
| 2.2 | IL from “entry” (store first-seen value or use API if available) | High | Optional entry snapshot in AsyncStorage or backend |
| 2.3 | Fee tracking over time (per day/week/month) | Medium | From position API + local aggregation |
| 2.4 | Basic risk score (0–100) | High | `services/analytics/risk.ts`, `useRiskScore`, wire to RiskScore.tsx |
| 2.5 | Risk inputs: IL %, pool TVL/volume trend, user % of pool | High | Same module as 2.4 |
| 2.6 | Best/worst positions in portfolio | Low | Sort by PnL % in PortfolioSummary or dashboard |
| 2.7 | Entry date/time shown in UI | Low | From position or pool API |
| 2.8 | Volume/TVL ratio, pool fee tier in UI | Medium | When Meteora API exposes |
| 2.9 | Optional: React Query or SWR for caching | Medium | Reduce duplicate fetches, stale-while-revalidate |

**Deliverables:** Risk score visible on cards/detail; auto-refresh; clearer PnL/IL story.

---

### Phase 3 — Risk alerts & money flow

**Goal:** Alerts, money flow metrics, technical indicators, whale awareness.

| # | Task | Priority | Notes |
|---|------|----------|--------|
| 3.1 | Alert system (push or in-app) | High | Firebase or Expo notifs; thresholds in settings |
| 3.2 | Alert triggers: TVL drop, out of range, IL threshold, risk threshold | High | Use risk score + position state |
| 3.3 | Money flow service (in/out, large tx, buy/sell pressure) | High | `services/analytics/moneyFlow.ts`; may need RPC + indexing |
| 3.4 | Whale / smart money tracking (optional list) | Medium | Curated list or heuristic from flow |
| 3.5 | Technical indicators (MA, RSI, volume trend) | Medium | From OHLCV or swap data |
| 3.6 | Risk score: add money flow + token risk components | High | Extend risk algorithm per prompt |
| 3.7 | Jupiter (or other) price integration for consistency | Medium | Fallback or cross-check vs pool price |
| 3.8 | Analytics screen (optional) | Low | Aggregate flow, risk, performance |

**Deliverables:** Configurable alerts; money flow and tech indicators feeding risk and (later) charts.

---

### Phase 4 — Charts, polish & scale

**Goal:** Historical charts, portfolio analytics, performance and bundle size optimization.

| # | Task | Priority | Notes |
|---|------|----------|--------|
| 4.1 | Historical PnL chart | High | Lightweight-charts or recharts; data from cache or backend |
| 4.2 | Price chart (OHLCV) + range overlay | High | Meteora OHLCV + current position range |
| 4.3 | Flow / accumulation chart | Medium | From Phase 3 money flow |
| 4.4 | Bin/liquidity distribution visual | Medium | Per-pool or per-position |
| 4.5 | Portfolio allocation (by pool, by token) | Medium | Pie or bar in dashboard or Analytics |
| 4.6 | Export (CSV/PDF) positions & PnL | Low | For tax or reporting |
| 4.7 | Performance: lazy list, debounce RPC, memoization | High | Already partially in place; measure and tune |
| 4.8 | Bundle size & load time (<5MB, <3s to positions) | High | Tree-shake, lazy load charts, measure |
| 4.9 | Light mode + accessibility pass | Medium | Settings + contrast/targets |
| 4.10 | AnalyticsScreen (if not done in Phase 3) | Low | Charts and tables |

**Deliverables:** Charts in place; success criteria (load time, bundle size) met or documented.

---

### Phase 5 — Solana Seeker & shipping

**Goal:** dApp Store ready, optional wallet adapter, deep links, docs.

| # | Task | Priority | Notes |
|---|------|----------|--------|
| 5.1 | Optional Solana Mobile Wallet Adapter (one-tap address) | Medium | Convenience only; keep read-only as primary |
| 5.2 | Deep link: open app with `?address=...` | Medium | Expo linking + handle in WalletInput |
| 5.3 | QR code scanner for address | Low | Expo camera or lib |
| 5.4 | Push notifications for alerts | High | If alerts in Phase 3 use push |
| 5.5 | dApp Store metadata (icon, screenshots, description) | High | Per Solana docs |
| 5.6 | Privacy policy & terms (read-only, no keys) | High | Required for store |
| 5.7 | Deployment guide (EAS, store checklist) | High | docs/DEPLOYMENT.md |
| 5.8 | User-facing docs (how to use, what data we use) | Medium | README + optional in-app |

**Deliverables:** App buildable for Seeker; store listing and legal text in place.

---

## 3. Implementation Details to Lock In

### 3.1 Position tracking (already implemented; refine in Phase 2)

- Fetch: `DLMM.getAllLbPairPositionsByUser` + Meteora position API + pool API.
- Value: `(tokenX * priceX) + (tokenY * priceY)`; price from pool.
- PnL: `calculations.computeFullPnl` (total, fee, IL).
- Entry: currently approximated; add optional “entry snapshot” or API-backed field in Phase 2.

### 3.2 Risk score (Phase 2–3)

- Formula: weighted average of IL risk (20%), pool health (25%), liquidity concentration (15%), range (15%), token risk (15%), money flow (10%).
- Each component 0–100; map to green (80–100), yellow (50–79), red (0–49).
- Implement in `services/analytics/risk.ts` and feed `RiskScore.tsx` via `useRiskScore`.

### 3.3 Money flow (Phase 3)

- Per period (24h, 7d, 30d): classify swaps by size, sum buy vs sell, net flow, large holder deltas.
- Output: accumulation/distribution score and series for charts.
- May require RPC + indexer or Meteora/Helius endpoints; document in API docs.

### 3.4 Data refresh strategy

- Real-time: range status, current price (when user is viewing).
- 30s: position value, PnL.
- 5 min: pool TVL, volume, fees.
- 1 hour: risk score, historical/cache.
- On-demand: full analytics, export.

---

## 4. Testing Plan

| Layer | Phase | Scope |
|-------|--------|--------|
| Unit | 2 | PnL, IL, risk formula in `utils/calculations.ts` and `analytics/risk.ts` |
| Unit | 3 | Money flow helpers in `analytics/moneyFlow.ts` |
| Integration | 2 | Meteora API + RPC (address validation, fetch positions/pool) |
| E2E | 2–4 | Address input → dashboard → detail; refresh; multi-wallet (e.g. Detox or Maestro) |

---

## 5. Documentation Checklist

| Doc | Status | Owner |
|-----|--------|--------|
| README (setup, scripts, env) | ✅ Done | |
| Architecture (data flow, stack) | ✅ Done | docs/ARCHITECTURE.md |
| API integration (Meteora, RPC, env vars) | ⬜ Add | docs/API_INTEGRATION.md |
| Calculation methodologies (PnL, IL) | ⬜ Add | docs/CALCULATIONS.md |
| Risk scoring algorithm | ⬜ Add | When risk.ts is implemented |
| Deployment (EAS, dApp Store) | ⬜ Add | docs/DEPLOYMENT.md |
| How to add features | ⬜ Optional | CONTRIBUTING or docs |

---

## 6. Success Criteria (from prompt)

| Criterion | Target | How to verify |
|-----------|--------|----------------|
| Load positions | &lt; 3 s | Measure time from “Track” to list rendered |
| PnL/IL accuracy | ±0.1% | Unit tests + spot-check vs Meteora UI |
| Price latency | &lt; 30 s | Refresh interval + pool price source |
| Risk score update | &lt; 5 min | Refresh strategy + logging |
| UI performance | 60fps | Profile on device / web |
| Bundle size | &lt; 5 MB | EAS build report / web bundle analyzer |
| dApp Store | Submitted | Phase 5 checklist |

---

## 7. Open Questions (from prompt)

1. **Meteora DLMM API structure** — Document in API_INTEGRATION.md as we add endpoints (historical, fee details, LPs count).
2. **RPC performance/cost** — Helius in use; compare QuickNode/Alchemy if needed; track usage.
3. **Whale tracking at scale** — Phase 3: start with per-pool or per-position; consider backend/indexer if needed.
4. **Refresh frequency** — Start with 30s/5m/1h as above; tune with rate limits and UX.
5. **Multiple positions** — Already supported; optimize with caching and lazy load in Phase 4.
6. **Historical storage** — Phase 2–4: local cache first; optional backend for PnL history and charts.
7. **RPC cost** — Minimize with caching, batch where possible, and refresh tiers above.

---

## 8. Quick Reference: Where Things Live

- **Wallet/addresses:** `store/addressesStore`, `hooks/useAddresses`, `components/wallet/*`, `utils/addressUtils`, `services/solana/addressValidator`.
- **Positions:** `store/positionsStore`, `hooks/usePositions`, `services/meteora/positions`, `types/position`.
- **Pools:** `services/meteora/api`, `pools`, `hooks/usePoolData`, `types/pool`.
- **PnL/IL:** `utils/calculations`, `types/position` (PnL), used in positions service and UI.
- **Risk:** `components/dashboard/RiskScore`, `types/risk`; logic to add in `services/analytics/risk.ts` + `useRiskScore`.
- **Navigation:** `navigation/AppNavigator`, web vs native stack, theme in `App.tsx`.
- **Config:** `app.config.js`, `.env` (Helius, etc.), `metro.config.js`, `polyfills.js`, `shim/util.js`.

Use this plan to prioritize backlog, plan sprints, and track deliverables against the comprehensive prompt.
