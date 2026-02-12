# Meteora DLMM Portfolio Tracker (Meteor Lens)

**Web-first** DeFi portfolio tracker for **Meteora DLMM** (Dynamic Liquidity Market Maker) on Solana. Track liquidity provider positions with position value, fees, PnL, and in/out-of-range status. **Read-only**: paste wallet addresses — no wallet connection or private keys.

Built with **Expo (React Native)** so you can run in the **browser** now and target **Solana Seeker / mobile** when you’re ready.

## Features

- **Read-only tracking** — Paste one or more Solana wallet addresses; addresses stored locally only
- **Position dashboard** — See all DLMM positions: pair, value (USD), range (bins), in/out of range
- **Fees & APR** — Fee APR/APY and claimed fees from Meteora position API
- **PnL** — Total PnL and impermanent loss (IL) calculations
- **Pool context** — Pool TVL, volume, and active bin from Meteora APIs
- **Multiple wallets** — Save and switch between labeled addresses
- **Dark UI** — Works on desktop and mobile; responsive layout on web

## Quick start (web — default)

```bash
npm install
# Optional: set EXPO_PUBLIC_HELIUS_API_KEY in .env for RPC
npm start
```

This opens the app in your **browser** (Expo web). Paste a wallet address and tap **Track positions**.

- **Mobile / device later:** run `npm run start:mobile` and use the QR code or press `a` / `i` for emulator.

### If `npx expo start` fails

- **"Project is incompatible with this version of Expo Go"** — The project is on **Expo SDK 54**. Use the latest Expo Go (SDK 54) on your device, or run `npm run install:fix` then `npx expo start`.
- **"The required package `expo-asset` cannot be found"** — Run `npm run install:fix` (or `npm install --legacy-peer-deps`).
- **Blank screen** — The app shows "Loading…" briefly while saved addresses are read; then the main screen appears.
- **Peer dependency conflicts** — Use `npm install --legacy-peer-deps` (or `npm run install:fix`).

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

See **`docs/DEVELOPMENT_PLAN.md`** for the full roadmap (phases, current vs planned features, success criteria). See `docs/ARCHITECTURE.md` for data flow and stack.

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start **web** dev server (default; opens in browser) |
| `npm run start:mobile` | Start for device/emulator (Expo Go, QR code) |
| `npm run web` | Same as `npm start` (web) |
| `npm run android` | Build/run Android |
| `npm run fetch-pools` | List sample pools (Meteora API) |
| `POSITION_ADDRESS=<pubkey> npm run fetch-position` | One position fee data |

## Later: mobile / Solana Seeker

When you want to ship on Solana Seeker or the dApp Store:

- **Stack**: Same Expo app; run `npm run start:mobile` and open in Expo Go, or build with EAS.
- **Build**: See [Building a release APK with Expo](https://docs.solanamobile.com/dapp-publishing/building-expo-apk) and [Prepare your dApp for publishing](https://docs.solanamobile.com/dapp-publishing/prepare).
- **Privacy**: Read-only; no private keys, no transaction signing. Addresses stored on device only.

## Security & privacy

- No wallet connection or signing; paste public addresses only
- Addresses stored locally (AsyncStorage); not sent to external servers
- All data from public blockchain and public Meteora APIs

## License

Private / as per repo.
