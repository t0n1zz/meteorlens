/**
 * Test script to verify Meteora SDK getAllLbPairPositionsByUser works.
 * Run: node scripts/test-positions.js <wallet_address>
 */
require('../polyfills');
require('react-native-get-random-values');

const { Connection, PublicKey } = require('@solana/web3.js');
const { DLMM } = require('@meteora-ag/dlmm');

const walletAddress = process.argv[2] || 'QRzHHGjxLozvheWybyYRieMwzb4Zd7JJMuAxgh3f4ZZ';
const heliusKey = process.env.EXPO_PUBLIC_HELIUS_API_KEY;

const rpcUrl = heliusKey
  ? `https://mainnet.helius-rpc.com/?api-key=${heliusKey}`
  : 'https://api.mainnet-beta.solana.com';

console.log('Testing Meteora DLMM SDK...');
console.log('Wallet:', walletAddress);
console.log('RPC:', heliusKey ? 'Helius' : 'Public');
console.log('RPC URL:', rpcUrl);
console.log('');

async function test() {
  try {
    const connection = new Connection(rpcUrl, { commitment: 'confirmed' });
    
    // Test connection
    console.log('1. Testing connection...');
    const slot = await connection.getSlot();
    console.log('   ✓ Connection OK, slot:', slot);
    
    // Test SDK
    console.log('2. Calling DLMM.getAllLbPairPositionsByUser...');
    const userPubkey = new PublicKey(walletAddress);
    const opt = { cluster: 'mainnet-beta' };
    const getPositionsOpt = { chunkSize: 100 };
    
    const startTime = Date.now();
    const positionMap = await DLMM.getAllLbPairPositionsByUser(
      connection,
      userPubkey,
      opt,
      getPositionsOpt
    );
    const duration = Date.now() - startTime;
    
    console.log(`   ✓ SDK call completed in ${duration}ms`);
    console.log('   Pools found:', positionMap.size);
    
    if (positionMap.size === 0) {
      console.log('');
      console.log('⚠️  No positions found. Possible reasons:');
      console.log('   - Wallet has no DLMM positions');
      console.log('   - Positions are in old PositionV1 format (SDK only queries PositionV2)');
      console.log('   - RPC issue or timeout');
      console.log('');
      console.log('Check on app.meteora.ag/dlmm if this wallet has active DLMM positions.');
    } else {
      console.log('');
      for (const [lbPairAddress, info] of positionMap.entries()) {
        const count = info.lbPairPositionsData?.length ?? 0;
        console.log(`   Pool ${lbPairAddress.slice(0, 8)}...: ${count} position(s)`);
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

test();
