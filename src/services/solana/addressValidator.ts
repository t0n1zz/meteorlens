/**
 * Re-export and thin wrapper for address validation used by services.
 */
import { isValidSolanaAddress, normalizeAddress } from '../../utils/addressUtils';

export function validateAddress(address: string): { valid: boolean; normalized?: string; error?: string } {
  const normalized = normalizeAddress(address);
  if (!normalized) {
    return { valid: false, error: 'Address is required' };
  }
  if (!isValidSolanaAddress(normalized)) {
    return { valid: false, error: 'Invalid Solana address (expected 32–44 base58 characters)' };
  }
  return { valid: true, normalized };
}
