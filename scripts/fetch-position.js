/**
 * Proof-of-data: fetch one DLMM position's fee/APR from Meteora API.
 * Run: npm run fetch-position
 *
 * Optional: POSITION_ADDRESS=YourPositionAddress npm run fetch-position
 *   You can get position addresses from the Meteora app or via SDK getPositionsByUserAndLbPair().
 */

const POSITION_API = 'https://dlmm-api.meteora.ag';
const POSITION_ADDRESS =
  process.env.POSITION_ADDRESS || 'REPLACE_WITH_YOUR_POSITION_PUBKEY';

async function main() {
  if (POSITION_ADDRESS === 'REPLACE_WITH_YOUR_POSITION_PUBKEY') {
    console.log('Usage: POSITION_ADDRESS=<pubkey> npm run fetch-position');
    console.log('Get your position address from app.meteora.ag or from SDK getPositionsByUserAndLbPair().');
    process.exit(0);
  }

  console.log('Fetching position', POSITION_ADDRESS, '...\n');

  const res = await fetch(`${POSITION_API}/position/${POSITION_ADDRESS}`);
  if (!res.ok) {
    console.error('Position request failed:', res.status, await res.text());
    process.exit(1);
  }
  const pos = await res.json();

  console.log('Position:', pos.address);
  console.log('  owner:', pos.owner);
  console.log('  pair_address:', pos.pair_address);
  console.log('  fee_apr_24h:', pos.fee_apr_24h);
  console.log('  fee_apy_24h:', pos.fee_apy_24h);
  console.log('  daily_fee_yield:', pos.daily_fee_yield);
  console.log('  total_fee_usd_claimed:', pos.total_fee_usd_claimed);
  console.log('  total_fee_x_claimed:', pos.total_fee_x_claimed);
  console.log('  total_fee_y_claimed:', pos.total_fee_y_claimed);
  console.log('  total_reward_usd_claimed:', pos.total_reward_usd_claimed);

  console.log('\nDone. Position fee/APR data is available for the dashboard.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
