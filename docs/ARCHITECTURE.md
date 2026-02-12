# Architecture Overview

## High-level flow

1. **Wallet input** — User pastes a Solana address (or picks a saved one). Address is validated (base58, 32–44 chars) and optionally saved with a label.
2. **Position fetch** — App calls `DLMM.getAllLbPairPositionsByUser(connection, userPubkey)` (Meteora SDK + Solana RPC). For each position we:
   - Resolve pool metrics from `dlmm.datapi.meteora.ag` (cache per session).
   - Fetch fee/APR from `dlmm-api.meteora.ag/position/{positionAddress}`.
   - Map to app model: range (min/max/active bin), value (token amounts + USD), fees, and optional PnL.
3. **Dashboard** — Lists positions with portfolio summary (total value, fees, PnL). Tap a position for detail (value, fees, PnL, range, pool TVL/volume).
4. **Settings** — Placeholder; emphasizes read-only and local-only storage.

## Tech stack

- **UI**: React Native (Expo), TypeScript
- **State**: Zustand (addresses, positions, settings); addresses and settings persisted via AsyncStorage
- **Navigation**: React Navigation (native stack + bottom tabs)
- **Data**: Meteora DLMM SDK (`@meteora-ag/dlmm`), Meteora REST (pools + position APIs), Solana RPC (Helius or public)
- **No wallet adapter** — read-only; no signing

## Key services

- **`services/meteora/api.ts`** — REST: pools, pool by address, position by address, wallet earning.
- **`services/meteora/pools.ts`** — Normalizes pool API responses to `PoolMetrics`.
- **`services/meteora/positions.ts`** — Fetches user positions via SDK, enriches with pool + position API, returns `AppPosition[]`.
- **`services/solana/rpc.ts`** — Builds Solana `Connection` (Helius if key set).
- **`services/solana/addressValidator.ts`** — Validates and normalizes Solana addresses.

## PnL / IL

- **Total PnL**: `(currentValueUsd + feesEarnedUsd) - initialValueUsd`; percent = PnL / initial.
- **Impermanent loss**: `IL % = ((currentLpValueUsd / holdValueUsd) - 1) * 100`. MVP uses current value as proxy for “initial” where needed; full history would require stored entry snapshot or historical prices.

## API reference (Meteora)

- **Pools (datapi)**: `https://dlmm.datapi.meteora.ag` — `GET /pools`, `GET /pools/{address}`, `GET /pools/{address}/ohlcv`, `GET /pools/{address}/volume/history`.
- **Positions / wallet**: `https://dlmm-api.meteora.ag` — `GET /position/{address}`, `GET /wallet/{wallet}/{pair}/earning`.
- Rate limit: 30 req/s (Meteora). Use in-memory pool cache in `positions.ts` to limit calls.

## Future phases (from REQUIREMENTS.md)

- Phase 2: Auto-refresh, IL from entry snapshot, basic risk score.
- Phase 3: Money flow, technical indicators, whale tracking, alerts.
- Phase 4: Historical charts, portfolio analytics, export, performance tuning.
