/**
 * Solana address validation (read-only app).
 */
const BASE58_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export function isValidSolanaAddress(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length < 32 || trimmed.length > 44) return false;
  return BASE58_REGEX.test(trimmed);
}

export function normalizeAddress(value: string): string {
  return value.trim();
}

export function shortenAddress(address: string, chars = 4): string {
  if (!address || address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}…${address.slice(-chars)}`;
}
