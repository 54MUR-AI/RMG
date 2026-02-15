/**
 * LDGR Assets — CRUD + pricing for stocks, ETFs, mutual funds, metals, commodities.
 * Crypto wallets remain in cryptoWallets.ts. This handles everything else.
 */

import { supabase } from '../supabase'

// ── Types ──

export type AssetType =
  | 'stock' | 'etf' | 'mutf'
  | 'gold' | 'silver' | 'platinum' | 'palladium' | 'metal_other'
  | 'commodity'
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
  tokenized: { label: 'Tokenized Asset', icon: '🔗', category: 'tokenized' },
}

export const EQUITY_TYPES: AssetType[] = ['stock', 'etf', 'mutf']
export const METAL_TYPES: AssetType[] = ['gold', 'silver', 'platinum', 'palladium', 'metal_other']

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

// Stock/ETF/MUTF pricing via Yahoo Finance (through stonks-api proxy)
const STONKS_API = 'https://stonks-api-jlb2.onrender.com'
const stockPriceCache: Record<string, { price: number; ts: number }> = {}
const STOCK_CACHE_TTL = 300_000 // 5 min

export async function fetchStockPrice(symbol: string): Promise<number> {
  const upper = symbol.toUpperCase()
  const cached = stockPriceCache[upper]
  if (cached && Date.now() - cached.ts < STOCK_CACHE_TTL) return cached.price

  try {
    const res = await fetch(`${STONKS_API}/api/quote/${upper}`, {
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return cached?.price || 0
    const data = await res.json()
    const price = data?.regularMarketPrice || data?.price || 0
    if (price > 0) {
      stockPriceCache[upper] = { price, ts: Date.now() }
    }
    return price
  } catch {
    return cached?.price || 0
  }
}

// Metal pricing via free metals API
const metalPriceCache: Record<string, { price: number; ts: number }> = {}
const METAL_CACHE_TTL = 600_000 // 10 min

// Metal spot prices in USD per troy oz
const METAL_SYMBOLS: Record<string, string> = {
  gold: 'XAU',
  silver: 'XAG',
  platinum: 'XPT',
  palladium: 'XPD',
}

export async function fetchMetalPrice(metalType: string): Promise<number> {
  const cached = metalPriceCache[metalType]
  if (cached && Date.now() - cached.ts < METAL_CACHE_TTL) return cached.price

  const symbol = METAL_SYMBOLS[metalType]
  if (!symbol) return cached?.price || 0

  try {
    // Use metals.live free API (no key needed)
    const res = await fetch('https://api.metals.live/v1/spot', {
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return cached?.price || 0
    const data = await res.json()
    // data is array of { gold, silver, platinum, palladium } with USD prices
    const latest = Array.isArray(data) ? data[data.length - 1] : data
    const price = latest?.[metalType] || 0
    if (price > 0) {
      metalPriceCache[metalType] = { price, ts: Date.now() }
    }
    return price
  } catch {
    return cached?.price || 0
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

    if (EQUITY_TYPES.includes(asset.asset_type) && asset.symbol) {
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
