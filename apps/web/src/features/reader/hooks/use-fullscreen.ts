import { useSyncExternalStore } from "react"

const subscribe = (listener: () => void) => {
  document.addEventListener("fullscreenchange", listener)

  return () => {
    document.removeEventListener("fullscreenchange", listener)
  }
}

export function useFullscreen() {
  const active = useSyncExternalStore(
    subscribe,
    () => document.fullscreenElement !== null,
    () => false,
  )
  const supported = useSyncExternalStore(
    subscribe,
    () => document.fullscreenEnabled,
    () => false,
  )

  return {
    active,
    supported,
    toggle: () => {
      if (document.fullscreenElement === null) {
        void document.documentElement.requestFullscreen().catch(() => {})
      } else {
        void document.exitFullscreen().catch(() => {})
      }
    },
  }
}
