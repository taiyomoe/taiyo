"use client"

import { useCallback, useSyncExternalStore } from "react"

/**
 * Subscribes to a media query. Always false during SSR — the server has no
 * viewport, so the first client paint matches the server's markup and the
 * result settles on hydration.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (callback: () => void) => {
      if (typeof window === "undefined") {
        return () => {}
      }

      const mql = window.matchMedia(query)

      mql.addEventListener("change", callback)

      return () => mql.removeEventListener("change", callback)
    },
    [query],
  )
  const getSnapshot = useCallback(
    () => (typeof window === "undefined" ? false : window.matchMedia(query).matches),
    [query],
  )

  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
