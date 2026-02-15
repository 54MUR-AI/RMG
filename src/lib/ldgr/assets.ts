/**
 * LDGR Assets — CRUD + pricing for stocks, ETFs, mutual funds, metals, commodities.
 * Crypto wallets remain in cryptoWallets.ts. This handles everything else.
 */

import { supabase } from '../supabase'
import { fetchCryptoPrice } from './cryptoWallets'

// ── Types ──

export type AssetType =
  | 'stock' | 'etf' | 'mutf'
  | 'gold' | 'silver' | 'platinum' | 'palladium' | 'metal_other'
  | 'commodity'
  | 'crypto'
  | 'tokenized'

export interface LdgrAsset {
  id: string
  user_id: string
  asset_name: string
  asset_type: AssetType
  symbol: string | null
  quantity: number
  cost_basis: number
  weight_unit: 'oz' | 'g' | 'kg' | null
  token_id: string | null
  token_metadata: Record<string, any> | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface LdgrAssetInput {
  asset_name: string
  asset_type: AssetType
  symbol?: string
  quantity: number
  cost_basis: number
  weight_unit?: 'oz' | 'g' | 'kg'
  token_id?: string
  token_metadata?: Record<string, any>
  notes?: string
}

export interface AssetWithPrice extends LdgrAsset {
  currentPrice: number | null
  currentValue: number | null
  pnl: number | null
  pnlPct: number | null
}

// ── Asset type metadata ──

export const ASSET_TYPE_CONFIG: Record<AssetType, { label: string; icon: string; category: string }> = {
  stock: { label: 'Stock', icon: '📈', category: 'equities' },
  etf: { label: 'ETF', icon: '📊', category: 'equities' },
  mutf: { label: 'Mutual Fund', icon: '🏦', category: 'equities' },
  gold: { label: 'Gold', icon: '🥇', category: 'metals' },
  silver: { label: 'Silver', icon: '🥈', category: 'metals' },
  platinum: { label: 'Platinum', icon: '⬜', category: 'metals' },
  palladium: { label: 'Palladium', icon: '🔘', category: 'metals' },
  metal_other: { label: 'Other Metal', icon: '⚙️', category: 'metals' },
  commodity: { label: 'Commodity', icon: '🛢️', category: 'commodities' },
  crypto: { label: 'Crypto', icon: '🪙', category: 'crypto' },
  tokenized: { label: 'Tokenized Asset', icon: '🔗', category: 'tokenized' },
}

export const EQUITY_TYPES: AssetType[] = ['stock', 'etf', 'mutf']
export const METAL_TYPES: AssetType[] = ['gold', 'silver', 'platinum', 'palladium', 'metal_other']

// Map crypto ticker symbols to blockchain names used by fetchCryptoPrice
const SYMBOL_TO_BLOCKCHAIN: Record<string, string> = {
  ETH: 'ethereum', BTC: 'bitcoin', SOL: 'solana', MATIC: 'polygon',
  BNB: 'binance', AVAX: 'avalanche', ADA: 'cardano', XRP: 'ripple',
  CRO: 'cronos',
}

// ── CRUD ──

export async function getUserAssets(userId: string): Promise<LdgrAsset[]> {
  const { data, error } = await supabase
    .from('ldgr_assets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []).map(normalizeAsset)
}

export async function getAssetsByType(userId: string, types: AssetType[]): Promise<LdgrAsset[]> {
  const { data, error } = await supabase
    .from('ldgr_assets')
    .select('*')
    .eq('user_id', userId)
    .in('asset_type', types)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []).map(normalizeAsset)
}

export async function addAsset(userId: string, input: LdgrAssetInput): Promise<LdgrAsset> {
  const { data, error } = await supabase
    .from('ldgr_assets')
    .insert({
      user_id: userId,
      asset_name: input.asset_name,
      asset_type: input.asset_type,
      symbol: input.symbol || null,
      quantity: input.quantity,
      cost_basis: input.cost_basis,
      weight_unit: input.weight_unit || null,
      token_id: input.token_id || null,
      token_metadata: input.token_metadata || null,
      notes: input.notes || null,
    })
    .select()
    .single()

  if (error) throw error
  return normalizeAsset(data)
}

export async function updateAsset(assetId: string, updates: Partial<LdgrAssetInput>): Promise<LdgrAsset> {
  const updateData: Record<string, any> = {}
  if (updates.asset_name !== undefined) updateData.asset_name = updates.asset_name
  if (updates.asset_type !== undefined) updateData.asset_type = updates.asset_type
  if (updates.symbol !== undefined) updateData.symbol = updates.symbol || null
  if (updates.quantity !== undefined) updateData.quantity = updates.quantity
  if (updates.cost_basis !== undefined) updateData.cost_basis = updates.cost_basis
  if (updates.weight_unit !== undefined) updateData.weight_unit = updates.weight_unit || null
  if (updates.token_id !== undefined) updateData.token_id = updates.token_id || null
  if (updates.token_metadata !== undefined) updateData.token_metadata = updates.token_metadata || null
  if (updates.notes !== undefined) updateData.notes = updates.notes || null

  const { data, error } = await supabase
    .from('ldgr_assets')
    .update(updateData)
    .eq('id', assetId)
    .select()
    .single()

  if (error) throw error
  return normalizeAsset(data)
}

export async function deleteAsset(assetId: string): Promise<void> {
  const { error } = await supabase
    .from('ldgr_assets')
    .delete()
    .eq('id', assetId)

  if (error) throw error
}

function normalizeAsset(row: any): LdgrAsset {
  return {
    ...row,
    quantity: Number(row.quantity),
    cost_basis: Number(row.cost_basis),
  }
}

// ── Pricing ──

// Yahoo Finance proxy via scrp-api (CORS-enabled for roninmedia.studio).
// Yahoo v8/finance/chart endpoint — free, no API key, covers stocks/ETFs/mutf/metals/commodities.
const YAHOO_PROXY = 'https://scrp-api.onrender.com/yahoo'
const priceCache: Record<string, { price: number; ts: number }> = {}
const PRICE_CACHE_TTL = 300_000 // 5 min

async function fetchYahooPrice(symbol: string): Promise<number> {
  const key = symbol.toUpperCase()
  const cached = priceCache[key]
  if (cached && Date.now() - cached.ts < PRICE_CACHE_TTL) return cached.price

  try {
    const res = await fetch(
      `${YAHOO_PROXY}/v8/finance/chart/${encodeURIComponent(key)}?interval=1d&range=1d`,
      { signal: AbortSignal.timeout(10000) },
    )
    if (!res.ok) return cached?.price || 0
    const json = await res.json()
    const price = json.chart?.result?.[0]?.meta?.regularMarketPrice ?? 0
    if (price > 0) {
      priceCache[key] = { price, ts: Date.now() }
    }
    return price
  } catch {
    return cached?.price || 0
  }
}

export async function fetchStockPrice(symbol: string): Promise<number> {
  return fetchYahooPrice(symbol)
}

// Metal futures symbols on Yahoo Finance (USD per troy oz)
const METAL_YAHOO: Record<string, string> = {
  gold: 'GC=F',
  silver: 'SI=F',
  platinum: 'PL=F',
  palladium: 'PA=F',
}

export async function fetchMetalPrice(metalType: string): Promise<number> {
  const yahooSymbol = METAL_YAHOO[metalType]
  if (!yahooSymbol) return 0
  return fetchYahooPrice(yahooSymbol)
}

// Fetch Yahoo Finance historical closes for a symbol (reuses N-SIT proxy)
const histCache: Record<string, { data: { date: string; close: number }[]; ts: number }> = {}
const HIST_CACHE_TTL = 600_000 // 10 min

function yahooRange(timeRange: string): string {
  const map: Record<string, string> = {
    '1d': '1d', '3d': '5d', '1w': '5d', '1m': '1mo',
    '3m': '3mo', '6m': '6mo', '1y': '1y', '5y': '5y', '10y': '10y', 'all': 'max',
  }
  return map[timeRange] || '1mo'
}

function yahooInterval(timeRange: string): string {
  const map: Record<string, string> = {
    '1d': '5m', '3d': '15m', '1w': '1h', '1m': '1d',
    '3m': '1d', '6m': '1d', '1y': '1wk', '5y': '1wk', '10y': '1mo', 'all': '1mo',
  }
  return map[timeRange] || '1d'
}

export async function fetchYahooHistory(
  symbol: string,
  timeRange: string,
): Promise<{ date: string; close: number }[]> {
  const key = `${symbol.toUpperCase()}-${timeRange}`
  const cached = histCache[key]
  if (cached && Date.now() - cached.ts < HIST_CACHE_TTL) return cached.data

  try {
    const range = yahooRange(timeRange)
    const interval = yahooInterval(timeRange)
    const res = await fetch(
      `${YAHOO_PROXY}/v8/finance/chart/${encodeURIComponent(symbol.toUpperCase())}?interval=${interval}&range=${range}`,
      { signal: AbortSignal.timeout(12000) },
    )
    if (!res.ok) return cached?.data || []
    const json = await res.json()
    const result = json.chart?.result?.[0]
    if (!result) return []

    const timestamps: number[] = result.timestamp || []
    const closes: (number | null)[] = result.indicators?.quote?.[0]?.close || []
    const points: { date: string; close: number }[] = []

    for (let i = 0; i < timestamps.length; i++) {
      const c = closes[i]
      if (c == null) continue
      const d = new Date(timestamps[i] * 1000)
      const label = ['1d', '3d', '1w'].includes(timeRange)
        ? d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      points.push({ date: label, close: c })
    }

    histCache[key] = { data: points, ts: Date.now() }
    return points
  } catch {
    return cached?.data || []
  }
}

// Convert metal weight to troy oz for pricing
export function toTroyOz(quantity: number, unit: string): number {
  switch (unit) {
    case 'oz': return quantity
    case 'g': return quantity / 31.1035
    case 'kg': return quantity / 0.0311035
    default: return quantity
  }
}

// Enrich assets with live prices
export async function enrichAssetsWithPrices(assets: LdgrAsset[]): Promise<AssetWithPrice[]> {
  const results: AssetWithPrice[] = []

  for (const asset of assets) {
    let currentPrice: number | null = null

    if (asset.asset_type === 'crypto' && asset.symbol) {
      const blockchain = SYMBOL_TO_BLOCKCHAIN[asset.symbol.toUpperCase()]
      if (blockchain) {
        currentPrice = await fetchCryptoPrice(blockchain)
      }
    } else if (EQUITY_TYPES.includes(asset.asset_type) && asset.symbol) {
      currentPrice = await fetchStockPrice(asset.symbol)
    } else if (METAL_TYPES.includes(asset.asset_type)) {
      const metalType = asset.asset_type === 'metal_other' ? null : asset.asset_type
      if (metalType) {
        const pricePerOz = await fetchMetalPrice(metalType)
        const ozQty = toTroyOz(asset.quantity, asset.weight_unit || 'oz')
        currentPrice = pricePerOz > 0 ? pricePerOz : null
        if (currentPrice !== null) {
          const currentValue = ozQty * currentPrice
          const costValue = asset.cost_basis * asset.quantity
          results.push({
            ...asset,
            currentPrice,
            currentValue,
            pnl: currentValue - costValue,
            pnlPct: costValue > 0 ? ((currentValue - costValue) / costValue) * 100 : null,
          })
          continue
        }
      }
    }

    const currentValue = currentPrice !== null ? currentPrice * asset.quantity : null
    const costValue = asset.cost_basis * asset.quantity
    results.push({
      ...asset,
      currentPrice,
      currentValue,
      pnl: currentValue !== null ? currentValue - costValue : null,
      pnlPct: currentValue !== null && costValue > 0 ? ((currentValue - costValue) / costValue) * 100 : null,
    })
  }

  return results
}
