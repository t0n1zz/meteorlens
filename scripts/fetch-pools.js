/**
 * Proof-of-data: fetch DLMM pool list and one pool's full details from Meteora API.
 * Run: npm run fetch-pools
 *
 * Optional: POOL_ADDRESS=YourPoolAddress npm run fetch-pools
 *   to fetch a specific pool (e.g. for testing position context).
 */

const POOLS_BASE = 'https://dlmm.datapi.meteora.ag';
const POOL_ADDRESS = process.env.POOL_ADDRESS || 'BGm1tav58oGcsQJehL9WXBFXF7D27vZsKefj4xJKD5Y'; // example SOL-USDC

async function main() {
  console.log('Fetching DLMM pools (first page)...\n');

  const poolsRes = await fetch(`${POOLS_BASE}/pools?limit=5`);
  if (!poolsRes.ok) {
    console.error('Pools request failed:', poolsRes.status, await poolsRes.text());
    process.exit(1);
  }
  const poolsData = await poolsRes.json();
  const pools = poolsData.data ?? poolsData;
  const list = Array.isArray(pools) ? pools : [];

  console.log('Sample pools (name, address, current_price, tvl):');
  list.slice(0, 5).forEach((p) => {
    console.log(
      `  ${p.name ?? p.token_x?.symbol + '-' + p.token_y?.symbol ?? '?'} | ${p.address} | price=${p.current_price} | tvl=${p.tvl}`
    );
  });

  console.log('\nFetching single pool details for', POOL_ADDRESS, '...\n');
  const poolRes = await fetch(`${POOLS_BASE}/pools/${POOL_ADDRESS}`);
  if (!poolRes.ok) {
    console.error('Pool detail failed:', poolRes.status, await poolRes.text());
    process.exit(1);
  }
  const pool = await poolRes.json();
  console.log('Pool:', pool.name ?? pool.address);
  console.log('  current_price:', pool.current_price);
  console.log('  tvl:', pool.tvl);
  console.log('  apr / apy:', pool.apr, '/', pool.apy);
  console.log('  fee_tvl_ratio (24h):', pool.fee_tvl_ratio?.['24h']);
  console.log('  volume 24h:', pool.volume?.['24h']);
  console.log('  token_x:', pool.token_x?.symbol, '| token_y:', pool.token_y?.symbol);

  console.log('\nDone. Data is available for building the dashboard.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
