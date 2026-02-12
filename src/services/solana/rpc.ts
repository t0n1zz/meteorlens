/**
 * Solana RPC connection helper.
 * Uses Helius if EXPO_PUBLIC_HELIUS_API_KEY is set, else public mainnet.
 */
import { Connection } from '@solana/web3.js';
import Constants from 'expo-constants';

const MAINNET_RPC = 'https://api.mainnet-beta.solana.com';

export function getRpcUrl(): string {
  const key =
    Constants.expoConfig?.extra?.EXPO_PUBLIC_HELIUS_API_KEY ??
    (typeof process !== 'undefined' && (process as unknown as { env?: { EXPO_PUBLIC_HELIUS_API_KEY?: string } }).env?.EXPO_PUBLIC_HELIUS_API_KEY);
  if (key) {
    return `https://mainnet.helius-rpc.com/?api-key=${key}`;
  }
  return MAINNET_RPC;
}

let _connection: Connection | null = null;

export function getConnection(): Connection {
  if (!_connection) {
    _connection = new Connection(getRpcUrl(), { commitment: 'confirmed' });
  }
  return _connection;
}

export function resetConnection(): void {
  _connection = null;
}
