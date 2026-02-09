# Multi-Chain Wallet Import - TODO

## Current Status
The multi-chain wallet import feature is **disabled** because it requires proper cryptographic libraries for address derivation. Currently using placeholder/random addresses which fail balance checks.

## Required Libraries

### 1. Ethereum & EVM Chains (ETH, BSC, Polygon, Arbitrum, Optimism, Base)
```bash
npm install ethers
```

**Implementation:**
```typescript
import { ethers } from 'ethers'

async function deriveEthereumAddress(seedPhrase: string): Promise<string> {
  const wallet = ethers.Wallet.fromMnemonic(seedPhrase)
  return wallet.address
}
```

### 2. Bitcoin
```bash
npm install bitcoinjs-lib bip39 bip32
```

**Implementation:**
```typescript
import * as bitcoin from 'bitcoinjs-lib'
import * as bip39 from 'bip39'
import * as bip32 from 'bip32'

async function deriveBitcoinAddress(seedPhrase: string): Promise<string> {
  const seed = await bip39.mnemonicToSeed(seedPhrase)
  const root = bip32.fromSeed(seed)
  const child = root.derivePath("m/84'/0'/0'/0/0") // Native SegWit
  const { address } = bitcoin.payments.p2wpkh({
    pubkey: child.publicKey,
    network: bitcoin.networks.bitcoin
  })
  return address!
}
```

### 3. Solana
```bash
npm install @solana/web3.js bip39
```

**Implementation:**
```typescript
import { Keypair } from '@solana/web3.js'
import * as bip39 from 'bip39'

async function deriveSolanaAddress(seedPhrase: string): Promise<string> {
  const seed = await bip39.mnemonicToSeed(seedPhrase)
  const keypair = Keypair.fromSeed(seed.slice(0, 32))
  return keypair.publicKey.toBase58()
}
```

### 4. Ripple (XRP)
```bash
npm install ripple-keypairs ripple-address-codec
```

**Implementation:**
```typescript
import { deriveKeypair } from 'ripple-keypairs'
import { encodeAccountID } from 'ripple-address-codec'

async function deriveRippleAddress(seedPhrase: string): Promise<string> {
  const keypair = deriveKeypair(seedPhrase)
  return encodeAccountID(keypair.publicKey)
}
```

## Additional Improvements Needed

### 1. Add Missing Blockchain Balance Fetchers
Currently missing implementations for:
- Binance Smart Chain (BSC)
- Arbitrum
- Optimism
- Base

**Solution:** Use Etherscan-like APIs for each chain:
- BSC: `https://api.bscscan.com/api`
- Arbitrum: `https://api.arbiscan.io/api`
- Optimism: `https://api-optimistic.etherscan.io/api`
- Base: `https://api.basescan.org/api`

### 2. Fix CoinGecko Rate Limiting
**Problem:** Direct browser calls to CoinGecko API hit CORS and rate limits

**Solutions:**
- Use a backend proxy for price fetching
- Cache prices locally (5-10 minute TTL)
- Use alternative price APIs (CoinMarketCap, CryptoCompare)
- Implement exponential backoff for retries

### 3. Improve Error Handling
- Show user-friendly error messages
- Distinguish between "no balance" vs "API error"
- Add retry logic for failed balance checks
- Display partial results if some chains fail

## Re-enabling the Feature

Once the above libraries are integrated:

1. Uncomment the "Import from Seed" button in `CryptoWallet.tsx`
2. Replace placeholder functions in `multiChainImport.ts`
3. Add missing blockchain balance fetchers in `cryptoWallets.ts`
4. Test with real seed phrases
5. Add proper error handling and user feedback

## Security Notes

⚠️ **IMPORTANT:**
- Seed phrases should NEVER be sent to any server
- All derivation must happen client-side
- Ensure proper encryption before storing in Supabase
- Warn users about the risks of entering seed phrases
- Consider adding a "view-only" mode that only requires addresses
