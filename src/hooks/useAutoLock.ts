import { useEffect, useCallback, useRef } from 'react'
import { onAutoLock } from '../lib/ldgr/autoLock'

/**
 * Hook that calls the provided callback when the user has been idle for 5 minutes.
 * Use this to clear revealed passwords, seed phrases, and other sensitive UI state.
 */
export function useAutoLock(onLock: () => void) {
  const callbackRef = useRef(onLock)
  callbackRef.current = onLock

  const stableCallback = useCallback(() => {
    callbackRef.current()
  }, [])

  useEffect(() => {
    const unsubscribe = onAutoLock(stableCallback)
    return unsubscribe
  }, [stableCallback])
}
