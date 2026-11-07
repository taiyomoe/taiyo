import { useSyncExternalStore } from "react"

const HINT_KEY = "taiyo:advanced-search:tag-hint-dismissed"
const listeners = new Set<() => void>()
let dismissedThisSession = false
const readDismissed = () => {
  if (dismissedThisSession) {
    return true
  }

  try {
    return localStorage.getItem(HINT_KEY) === "1"
  } catch {
    return false
  }
}
const subscribe = (listener: () => void) => {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

export function useTagHint() {
  const dismissed = useSyncExternalStore(subscribe, readDismissed, () => true)

  return {
    visible: !dismissed,
    dismiss: () => {
      try {
        localStorage.setItem(HINT_KEY, "1")
      } catch {
        dismissedThisSession = true
      }

      for (const listener of listeners) {
        listener()
      }
    },
  }
}
