/**
 * MetalAssets — Manage precious metals and commodities in LDGR Assets.
 */

import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, RefreshCw, TrendingUp, TrendingDown, Gem } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import {
  getAssetsByType, addAsset, updateAsset, deleteAsset, enrichAssetsWithPrices,
  METAL_TYPES, ASSET_TYPE_CONFIG, toTroyOz,
  type LdgrAsset, type LdgrAssetInput, type AssetWithPrice, type AssetType,
} from '../../lib/ldgr/assets'

export default function MetalAssets() {
  const { user } = useAuth()
  const [assets, setAssets] = useState<AssetWithPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingAsset, setEditingAsset] = useState<LdgrAsset | null>(null)

  const loadAssets = async () => {
    if (!user) return
    try {
      setLoading(true)
      const types: AssetType[] = [...METAL_TYPES, 'commodity']
      const raw = await getAssetsByType(user.id, types)
      const enriched = await enrichAssetsWithPrices(raw)
      setAssets(enriched)
    } catch (err) {
      console.error('Error loading metal assets:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (user) loadAssets() }, [user])

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadAssets()
    setRefreshing(false)
  }

  const handleAdd = async (input: LdgrAssetInput) => {
    if (!user) return
    await addAsset(user.id, input)
    await loadAssets()
    setShowAddModal(false)
  }

  const handleUpdate = async (id: string, input: Partial<LdgrAssetInput>) => {
    await updateAsset(id, input)
    await loadAssets()
    setEditingAsset(null)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return
    await deleteAsset(id)
    await loadAssets()
  }

  const totalValue = assets.reduce((s, a) => s + (a.currentValue || 0), 0)
  const totalCost = assets.reduce((s, a) => s + a.cost_basis * a.quantity, 0)
  const totalPnl = totalValue - totalCost
  const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0

  const fmt = (n: number) => {
    if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(2)}M`
    if (Math.abs(n) >= 1e3) return `$${(n / 1e3).toFixed(1)}K`
    return `$${n.toFixed(2)}`
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-samurai-red/30 border-t-samurai-red rounded-full animate-spin" />
        <p className="mt-4 text-white/70">Loading metals & commodities...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Gem className="w-6 h-6 text-samurai-red" />
            Metals & Commodities
          </h2>
          <p className="text-white/70 text-sm mt-1 hidden sm:block">
            Track precious metals and commodity holdings with spot pricing
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleRefresh} disabled={refreshing}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-samurai-grey-dark text-white rounded-lg font-bold hover:bg-samurai-grey transition-all disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-samurai-red text-white rounded-lg font-bold hover:bg-samurai-red-dark transition-all flex-1 sm:flex-none">
            <Plus className="w-4 h-4" />
            Add Metal
          </button>
        </div>
      </div>

      {/* Summary */}
      {assets.length > 0 && totalValue > 0 && (
        <div className="bg-samurai-grey-darker border-2 border-samurai-grey rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-white/60 text-xs">Total Metals Value</p>
            <p className="text-2xl font-bold text-white">{fmt(totalValue)}</p>
          </div>
          <div className="text-right">
            <p className="text-white/60 text-xs">Total P&L</p>
            <p className={`text-lg font-bold ${totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalPnl >= 0 ? '+' : ''}{fmt(totalPnl)} ({totalPnlPct >= 0 ? '+' : ''}{totalPnlPct.toFixed(1)}%)
            </p>
          </div>
        </div>
      )}

      {/* Assets list */}
      {assets.length === 0 ? (
        <div className="text-center py-12 bg-samurai-grey-darker rounded-lg border-2 border-samurai-grey">
          <Gem className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <p className="text-white/70 text-lg">No metals or commodities yet</p>
          <p className="text-white/50 text-sm mt-2">Add gold, silver, platinum, or other holdings</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {assets.map(a => {
            const cfg = ASSET_TYPE_CONFIG[a.asset_type]
            const isUp = (a.pnl || 0) >= 0
            const unit = a.weight_unit || 'oz'
            const ozQty = toTroyOz(a.quantity, unit)
            return (
              <div key={a.id} className="bg-samurai-grey-darker border-2 border-samurai-steel-dark rounded-lg p-4 hover:border-samurai-red/50 transition-all">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl">{cfg.icon}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-white truncate">{a.asset_name}</h3>
                        <span className="text-xs text-white/40 bg-samurai-grey px-1.5 py-0.5 rounded">{cfg.label}</span>
                      </div>
                      <p className="text-sm text-white/60">
                        {a.quantity} {unit} ({ozQty.toFixed(2)} troy oz) @ ${a.cost_basis.toFixed(2)}/{unit}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      {a.currentValue !== null ? (
                        <>
                          <p className="text-lg font-bold text-white">{fmt(a.currentValue)}</p>
                          <p className={`text-sm font-bold ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                            {isUp ? '+' : ''}{fmt(a.pnl || 0)} ({a.pnlPct !== null ? `${isUp ? '+' : ''}${a.pnlPct.toFixed(1)}%` : '—'})
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-lg font-bold text-white">{fmt(a.cost_basis * a.quantity)}</p>
                          <p className="text-sm text-white/40">cost basis</p>
                        </>
                      )}
                    </div>
                    {isUp ? <TrendingUp className="w-5 h-5 text-green-500" /> : <TrendingDown className="w-5 h-5 text-red-500" />}
                    <div className="flex gap-1">
                      <button onClick={() => setEditingAsset(a)} className="p-1.5 rounded hover:bg-samurai-grey transition-colors" title="Edit">
                        <Edit2 className="w-4 h-4 text-white/70" />
                      </button>
                      <button onClick={() => handleDelete(a.id, a.asset_name)} className="p-1.5 rounded hover:bg-red-600 transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4 text-white/70" />
                      </button>
                    </div>
                  </div>
                </div>
                {a.notes && <p className="text-white/50 text-xs mt-2">{a.notes}</p>}
              </div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editingAsset) && (
        <MetalModal
          existing={editingAsset}
          onSave={editingAsset ? (input) => handleUpdate(editingAsset.id, input) : handleAdd}
          onClose={() => { setShowAddModal(false); setEditingAsset(null) }}
        />
      )}
    </div>
  )
}

function MetalModal({ existing, onSave, onClose }: {
  existing: LdgrAsset | null
  onSave: (input: LdgrAssetInput) => Promise<void>
  onClose: () => void
}) {
  const [name, setName] = useState(existing?.asset_name || '')
  const [type, setType] = useState<AssetType>(existing?.asset_type as AssetType || 'gold')
  const [quantity, setQuantity] = useState(existing?.quantity?.toString() || '')
  const [weightUnit, setWeightUnit] = useState<'oz' | 'g' | 'kg'>(existing?.weight_unit || 'oz')
  const [costBasis, setCostBasis] = useState(existing?.cost_basis?.toString() || '')
  const [notes, setNotes] = useState(existing?.notes || '')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const qty = parseFloat(quantity)
    const cost = parseFloat(costBasis)
    if (!name || isNaN(qty) || qty <= 0 || isNaN(cost) || cost < 0) return

    setSaving(true)
    try {
      await onSave({
        asset_name: name,
        asset_type: type,
        quantity: qty,
        cost_basis: cost,
        weight_unit: weightUnit,
        notes: notes || undefined,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-samurai-grey-darker border-2 border-samurai-red rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-2xl font-black text-white mb-6">
          {existing ? 'Edit Metal' : 'Add Metal / Commodity'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white font-semibold mb-2">Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g., Gold Eagles, Silver Bars"
              className="w-full px-4 py-3 bg-samurai-black border-2 border-samurai-grey rounded-lg text-white placeholder-white/50 focus:border-samurai-red focus:outline-none" required />
          </div>
          <div>
            <label className="block text-white font-semibold mb-2">Type</label>
            <select value={type} onChange={e => setType(e.target.value as AssetType)}
              className="w-full px-4 py-3 bg-samurai-black border-2 border-samurai-grey rounded-lg text-white focus:border-samurai-red focus:outline-none">
              <option value="gold">🥇 Gold</option>
              <option value="silver">🥈 Silver</option>
              <option value="platinum">⬜ Platinum</option>
              <option value="palladium">🔘 Palladium</option>
              <option value="metal_other">⚙️ Other Metal</option>
              <option value="commodity">🛢️ Commodity</option>
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-white font-semibold mb-2">Quantity</label>
              <input type="number" step="any" value={quantity} onChange={e => setQuantity(e.target.value)}
                placeholder="10"
                className="w-full px-4 py-3 bg-samurai-black border-2 border-samurai-grey rounded-lg text-white placeholder-white/50 focus:border-samurai-red focus:outline-none" required />
            </div>
            <div className="col-span-1">
              <label className="block text-white font-semibold mb-2">Unit</label>
              <select value={weightUnit} onChange={e => setWeightUnit(e.target.value as 'oz' | 'g' | 'kg')}
                className="w-full px-4 py-3 bg-samurai-black border-2 border-samurai-grey rounded-lg text-white focus:border-samurai-red focus:outline-none">
                <option value="oz">Troy oz</option>
                <option value="g">Grams</option>
                <option value="kg">Kilograms</option>
              </select>
            </div>
            <div className="col-span-1">
              <label className="block text-white font-semibold mb-2">Cost/Unit ($)</label>
              <input type="number" step="any" value={costBasis} onChange={e => setCostBasis(e.target.value)}
                placeholder="2000"
                className="w-full px-4 py-3 bg-samurai-black border-2 border-samurai-grey rounded-lg text-white placeholder-white/50 focus:border-samurai-red focus:outline-none" required />
            </div>
          </div>
          <div>
            <label className="block text-white font-semibold mb-2">Notes (optional)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Additional notes..."
              rows={2}
              className="w-full px-4 py-3 bg-samurai-black border-2 border-samurai-grey rounded-lg text-white placeholder-white/50 focus:border-samurai-red focus:outline-none resize-none" />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={saving}
              className="flex-1 px-6 py-3 bg-samurai-red text-white rounded-lg font-bold hover:bg-samurai-red-dark transition-all disabled:opacity-50">
              {saving ? 'Saving...' : existing ? 'Update' : 'Add Metal'}
            </button>
            <button type="button" onClick={onClose}
              className="px-6 py-3 bg-samurai-grey text-white rounded-lg font-bold hover:bg-samurai-grey-dark transition-all">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
