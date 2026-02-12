import { useState } from 'react'
import { ShieldCheck, X } from 'lucide-react'

interface ReAuthGateProps {
  title?: string
  message?: string
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Security confirmation modal shown before revealing highly sensitive data
 * (seed phrases, master passwords, etc).
 * 
 * Since auth is OAuth-based (no password to re-enter), this acts as a
 * deliberate-action gate to prevent shoulder-surfing and accidental reveals.
 */
export default function ReAuthGate({
  title = 'Security Check',
  message = 'You are about to reveal sensitive data. Please confirm this is intentional.',
  onConfirm,
  onCancel
}: ReAuthGateProps) {
  const [confirmed, setConfirmed] = useState(false)

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-samurai-grey-darker border-2 border-samurai-red rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-samurai-red/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-samurai-red" />
            </div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="text-white/50 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-white/80 text-sm mb-5 leading-relaxed">{message}</p>

        <label className="flex items-start gap-3 mb-5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-samurai-red rounded"
          />
          <span className="text-white/70 text-sm">
            I confirm no one is looking over my shoulder
          </span>
        </label>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 bg-samurai-grey border border-samurai-steel-dark text-white/80 rounded-lg font-medium hover:bg-samurai-grey-dark transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!confirmed}
            className="flex-1 px-4 py-2.5 bg-samurai-red text-white rounded-lg font-bold hover:bg-samurai-red-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
          >
            Reveal
          </button>
        </div>
      </div>
    </div>
  )
}
