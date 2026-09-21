import { useEffect, useState } from 'react'

/**
 * Shows a pulsing red dot until the user has "seen" this feature version.
 * Bump `version` whenever there's something new worth flagging — everyone
 * who hasn't opened it since gets the dot again.
 */
export function useNewFeatureBadge(key: string, version: string) {
  const storageKey = `essayz_seen_${key}`
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const seen = localStorage.getItem(storageKey)
      setVisible(seen !== version)
    } catch {
      // Storage unavailable (private browsing, disabled) — default to not showing
      // rather than crashing the nav.
      setVisible(false)
    }
  }, [storageKey, version])

  function markSeen() {
    try {
      localStorage.setItem(storageKey, version)
    } catch {
      // Ignore — worst case the dot reappears next visit.
    }
    setVisible(false)
  }

  return { visible, markSeen }
}

export default function NewFeatureDot({ show }: { show: boolean }) {
  if (!show) return null
  return (
    <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5" aria-hidden>
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
    </span>
  )
}
