/**
 * Export positions and PnL to CSV.
 */
import type { AppPosition } from '../types/position';
import { formatUsd, formatPercent } from './formatters';

function escapeCsvCell(value: string | number): string {
  const s = String(value);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function positionsToCsv(positions: AppPosition[]): string {
  const headers = [
    'Pair',
    'Position Address',
    'Value (USD)',
    'Token X',
    'Token Y',
    'In Range',
    'PnL (USD)',
    'PnL (%)',
    'ROI (%)',
    'Fees Claimed (USD)',
    'IL (%)',
    'Risk Score',
  ];

  const rows = positions.map((p) => [
    p.pairName,
    p.publicKey,
    p.value.valueUsd.toFixed(2),
    `${p.value.tokenXAmount.toFixed(4)} ${p.value.tokenXSymbol}`,
    `${p.value.tokenYAmount.toFixed(4)} ${p.value.tokenYSymbol}`,
    p.range.inRange ? 'Yes' : 'No',
    p.pnl?.totalPnlUsd.toFixed(2) ?? '',
    p.pnl?.totalPnlPercent.toFixed(2) ?? '',
    p.pnl?.roiPercent?.toFixed(2) ?? '',
    (p.fees.totalFeeUsdClaimed ?? 0).toFixed(2),
    p.pnl?.impermanentLossPercent.toFixed(2) ?? '',
    p.riskScore?.score ?? '',
  ]);

  const headerLine = headers.map(escapeCsvCell).join(',');
  const dataLines = rows.map((row) => row.map(escapeCsvCell).join(','));
  return [headerLine, ...dataLines].join('\n');
}

/**
 * Trigger download on web; return blob URL or data URI for native share.
 */
export function downloadCsv(csv: string, filename: string): string {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  if (typeof document !== 'undefined' && document.createElement) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
  return url;
}
