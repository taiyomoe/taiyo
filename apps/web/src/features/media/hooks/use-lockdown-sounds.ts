import { useEffect } from "react"
import { scheduleLockdownSounds } from "@/features/media/lib/lockdown-audio"

// Past this, a context that only started after a late user gesture would play
// the sounds out of step with the tape, so it stays silent instead.
const MAX_START_DELAY = 250

export function useLockdownSounds(enabled: boolean) {
  useEffect(() => {
    if (
      !enabled ||
      typeof window.AudioContext === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return undefined
    }

    const context = new window.AudioContext()
    const requestedAt = performance.now()
    let cancelled = false

    context
      .resume()
      .then(() => {
        if (
          !cancelled &&
          context.state === "running" &&
          performance.now() - requestedAt < MAX_START_DELAY
        ) {
          scheduleLockdownSounds(context, context.currentTime + 0.01)
        }
      })
      .catch(() => undefined)

    return () => {
      cancelled = true
      void context.close()
    }
  }, [enabled])
}
