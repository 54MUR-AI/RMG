/**
 * Secure Clipboard Utility
 * 
 * Copies sensitive text to clipboard and automatically clears it after a timeout.
 * Shows a countdown toast so the user knows when the clipboard will be wiped.
 */

let clearTimer: ReturnType<typeof setTimeout> | null = null
let countdownTimer: ReturnType<typeof setInterval> | null = null
let toastElement: HTMLDivElement | null = null

const CLEAR_DELAY_MS = 30_000 // 30 seconds

function removeToast() {
  if (toastElement && toastElement.parentNode) {
    toastElement.style.opacity = '0'
    toastElement.style.transform = 'translateX(100%)'
    setTimeout(() => toastElement?.parentNode?.removeChild(toastElement), 300)
    toastElement = null
  }
}

function showToast() {
  removeToast()

  const el = document.createElement('div')
  el.id = 'secure-clipboard-toast'
  el.style.cssText = `
    position: fixed; bottom: 24px; right: 24px; z-index: 99999;
    background: #1F2937; border: 1px solid #E63946; border-radius: 12px;
    padding: 12px 18px; color: #fff; font-size: 13px; font-family: system-ui, sans-serif;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5); display: flex; align-items: center; gap: 10px;
    transition: opacity 0.3s, transform 0.3s; opacity: 0; transform: translateX(20px);
  `

  const icon = document.createElement('span')
  icon.textContent = '🔒'
  icon.style.fontSize = '18px'

  const text = document.createElement('span')
  text.id = 'secure-clipboard-text'

  const seconds = Math.ceil(CLEAR_DELAY_MS / 1000)
  text.textContent = `Clipboard clears in ${seconds}s`

  el.appendChild(icon)
  el.appendChild(text)
  document.body.appendChild(el)
  toastElement = el

  // Animate in
  requestAnimationFrame(() => {
    el.style.opacity = '1'
    el.style.transform = 'translateX(0)'
  })

  // Countdown
  let remaining = seconds
  countdownTimer = setInterval(() => {
    remaining--
    if (remaining <= 0) {
      if (countdownTimer) clearInterval(countdownTimer)
      countdownTimer = null
      return
    }
    const textEl = document.getElementById('secure-clipboard-text')
    if (textEl) textEl.textContent = `Clipboard clears in ${remaining}s`
  }, 1000)
}

function showClearedToast() {
  removeToast()

  const el = document.createElement('div')
  el.style.cssText = `
    position: fixed; bottom: 24px; right: 24px; z-index: 99999;
    background: #1F2937; border: 1px solid #22c55e; border-radius: 12px;
    padding: 12px 18px; color: #22c55e; font-size: 13px; font-family: system-ui, sans-serif;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5); display: flex; align-items: center; gap: 10px;
    transition: opacity 0.3s, transform 0.3s; opacity: 0; transform: translateX(20px);
  `
  el.innerHTML = '<span style="font-size:18px">✓</span><span>Clipboard cleared</span>'
  document.body.appendChild(el)
  toastElement = el

  requestAnimationFrame(() => {
    el.style.opacity = '1'
    el.style.transform = 'translateX(0)'
  })

  setTimeout(removeToast, 2000)
}

/**
 * Copy sensitive text to clipboard with automatic 30-second clear.
 * Non-sensitive copies (like wallet addresses) should use navigator.clipboard.writeText directly.
 */
export async function secureCopy(text: string): Promise<void> {
  // Cancel any pending clear
  if (clearTimer) clearTimeout(clearTimer)
  if (countdownTimer) clearInterval(countdownTimer)

  await navigator.clipboard.writeText(text)

  showToast()

  clearTimer = setTimeout(async () => {
    try {
      // Only clear if clipboard still contains our text
      const current = await navigator.clipboard.readText()
      if (current === text) {
        await navigator.clipboard.writeText('')
      }
    } catch {
      // readText may fail due to permissions — clear anyway
      try { await navigator.clipboard.writeText('') } catch { /* noop */ }
    }
    clearTimer = null
    showClearedToast()
  }, CLEAR_DELAY_MS)
}
