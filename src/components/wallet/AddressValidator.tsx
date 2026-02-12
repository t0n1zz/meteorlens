import { isValidSolanaAddress } from '../../utils/addressUtils';

/**
 * Returns validation error message or null if valid.
 */
export function validateAddressInput(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return 'Enter a wallet address';
  if (trimmed.length < 32) return 'Address is too short';
  if (trimmed.length > 44) return 'Address is too long';
  if (!isValidSolanaAddress(trimmed)) return 'Invalid Solana address (use base58, 32–44 characters)';
  return null;
}
