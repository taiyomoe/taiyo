import { useSyncExternalStore } from "react"

const STORAGE_KEY = "taiyo:shop-sound"
const listeners = new Set<() => void>()
const read = () => {
  try {
    return globalThis.localStorage.getItem(STORAGE_KEY) !== "off"
  } catch {
    return true
  }
}
const subscribe = (listener: () => void) => {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

export function useSoundPreference() {
  const enabled = useSyncExternalStore(subscribe, read, () => true)

  return {
    enabled,
    toggle: () => {
      try {
        globalThis.localStorage.setItem(STORAGE_KEY, enabled ? "off" : "on")
      } catch {
        return
      }

      for (const listener of listeners) {
        listener()
      }
    },
  }
}
