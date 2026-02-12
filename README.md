# Meteora DLMM Portfolio Tracker (Meteor Lens)

Mobile-first DeFi portfolio tracker for **Meteora DLMM** (Dynamic Liquidity Market Maker) on Solana. Track liquidity provider positions with position value, fees, PnL, and in/out-of-range status. **Read-only**: paste wallet addresses — no wallet connection or private keys.

Built with **Expo (React Native)** for **Solana Seeker** and the dApp Store.

## Features

- **Read-only tracking** — Paste one or more Solana wallet addresses; addresses stored locally only
- **Position dashboard** — See all DLMM positions: pair, value (USD), range (bins), in/out of range
- **Fees & APR** — Fee APR/APY and claimed fees from Meteora position API
- **PnL** — Total PnL and impermanent loss (IL) calculations
- **Pool context** — Pool TVL, volume, and active bin from Meteora APIs
- **Multiple wallets** — Save and switch between labeled addresses
- **Dark UI** — Optimized for small screens and touch

## Quick start

```bash
npm install
# Set EXPO_PUBLIC_HELIUS_API_KEY in .env (see below)
npx expo start
```

Then open on device/emulator, paste a wallet address, and tap **Track positions**.

## Environment

1. Copy `.env.example` to `.env`.
2. Set your [Helius](https://helius.dev) API key:
   ```bash
   EXPO_PUBLIC_HELIUS_API_KEY=your_helius_api_key_here
   ```
3. Restart the dev server after changing env.

Without a key, the app uses public Solana RPC (rate-limited). Meteora REST APIs require no key.

## Project structure

```
/src
  /components     — UI: AddressInput, AddressManager, PositionCard, PortfolioSummary, RiskScore
  /screens        — WalletInput, Dashboard, PositionDetail, Settings
  /services       — Meteora API + positions, Solana RPC, address validation
  /store          — Zustand: addresses, positions, settings (persisted where noted)
  /hooks          — useAddresses, usePositions, usePoolData
  /utils          — calculations (PnL, IL), formatters, constants, addressUtils
  /types          — position, pool, wallet, risk
  /navigation     — Stack + bottom tabs (Track, Settings)
```

## Data sources

| Data | Source |
|------|--------|
| User positions | `@meteora-ag/dlmm` SDK: `DLMM.getAllLbPairPositionsByUser(connection, userPubkey)` |
| Position fees/APR | `GET https://dlmm-api.meteora.ag/position/{address}` |
| Pool list & metrics | `GET https://dlmm.datapi.meteora.ag/pools`, `/pools/{address}` |
| In/out of range | Pool `active_bin_id` vs position `lowerBinId` / `upperBinId` |

See `REQUIREMENTS.md` and `docs/ARCHITECTURE.md` for more detail.

## Scripts

```bash
npm run fetch-pools                    # List sample pools (Meteora API)
POSITION_ADDRESS=<pubkey> npm run fetch-position   # One position fee data
```

## Solana Seeker / dApp Store

- **Stack**: Expo (React Native). Android required for dApp Store.
- **Build**: See [Building a release APK with Expo](https://docs.solanamobile.com/dapp-publishing/building-expo-apk) and [Prepare your dApp for publishing](https://docs.solanamobile.com/dapp-publishing/prepare).
- **Privacy**: Read-only; no private keys, no transaction signing. Addresses stored on device only.

## Security & privacy

- No wallet connection or signing; paste public addresses only
- Addresses stored locally (AsyncStorage); not sent to external servers
- All data from public blockchain and public Meteora APIs

## License

Private / as per repo.
