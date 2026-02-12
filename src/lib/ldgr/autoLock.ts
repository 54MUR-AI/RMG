/**
 * LDGR Auto-Lock Module
 * 
 * Monitors user activity and triggers a lock callback after a period of inactivity.
 * When locked, all decrypted/revealed data should be hidden until the user interacts again.
 * 
 * Listens for: mouse movement, key presses, clicks, scroll, touch events.
 * Default timeout: 5 minutes.
 */

type LockCallback = () => void

const IDLE_TIMEOUT_MS = 5 * 60 * 1000 // 5 minutes

const ACTIVITY_EVENTS: (keyof DocumentEventMap)[] = [
  'mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'
]

let idleTimer: ReturnType<typeof setTimeout> | null = null
let isLocked = false
const lockCallbacks = new Set<LockCallback>()

function resetTimer() {
  if (isLocked) {
    // User activity detected after lock — unlock
    isLocked = false
  }

  if (idleTimer) clearTimeout(idleTimer)

  idleTimer = setTimeout(() => {
    isLocked = true
    lockCallbacks.forEach(cb => {
      try { cb() } catch { /* noop */ }
    })
  }, IDLE_TIMEOUT_MS)
}

let listening = false

function startListening() {
  if (listening) return
  listening = true
  ACTIVITY_EVENTS.forEach(event => {
    document.addEventListener(event, resetTimer, { passive: true })
  })
  resetTimer()
}

function stopListening() {
  if (!listening) return
  listening = false
  ACTIVITY_EVENTS.forEach(event => {
    document.removeEventListener(event, resetTimer)
  })
  if (idleTimer) {
    clearTimeout(idleTimer)
    idleTimer = null
  }
}

/**
 * Register a callback to be called when the idle timeout fires.
 * Returns an unsubscribe function.
 * Automatically starts listening on first subscriber.
 */
export function onAutoLock(callback: LockCallback): () => void {
  lockCallbacks.add(callback)
  startListening()

  return () => {
    lockCallbacks.delete(callback)
    if (lockCallbacks.size === 0) {
      stopListening()
    }
  }
}

/**
 * Check if the session is currently locked.
 */
export function isSessionLocked(): boolean {
  return isLocked
}
