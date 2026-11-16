import { useEffect, useState } from "react"
import {
  type LockdownSounds,
  loadLockdownSounds,
  playLockdownSounds,
} from "@/features/media/lib/lockdown-audio"

// How long the tape waits for its sounds before it starts without them.
const MAX_LOAD_WAIT = 700
const isSilent = () =>
  typeof window.OfflineAudioContext === "undefined" ||
  window.matchMedia("(prefers-reduced-motion: reduce)").matches

/**
 * Loads the lockdown sounds once the page is interactive. `ready` turns true
 * once they are decoded, or right away when they will not play, so the
 * animation never waits long on sounds. `play` starts them; call it in the
 * same commit that mounts the tape.
 */
export function useLockdownSounds(enabled: boolean) {
  const [state, setState] = useState<{ ready: boolean; sounds: LockdownSounds | null }>({
    ready: false,
    sounds: null,
  })

  useEffect(() => {
    if (!enabled || isSilent()) {
      return undefined
    }

    const timeout = setTimeout(() => {
      setState((current) => (current.ready ? current : { ...current, ready: true }))
    }, MAX_LOAD_WAIT)

    loadLockdownSounds()
      .then((sounds) => {
        setState((current) => (current.ready ? current : { ready: true, sounds }))
      })
      .catch(() => {
        setState((current) => ({ ...current, ready: true }))
      })
      .finally(() => {
        clearTimeout(timeout)
      })

    return () => {
      clearTimeout(timeout)
    }
  }, [enabled])

  return {
    ready: enabled && (state.ready || isSilent()),
    play: () => {
      if (state.sounds !== null) {
        playLockdownSounds(state.sounds)
      }
    },
  }
}
