import { useCallback, useSyncExternalStore } from "react"

export function useMediaQuery(query: string): boolean {
  const mediaQuery = query.replace(/^@media /, "")
  const subscribe = useCallback(
    (callback: () => void) => {
      if (typeof window === "undefined") {
        return () => {}
      }

      const mql = window.matchMedia(mediaQuery)

      mql.addEventListener("change", callback)

      return () => {
        mql.removeEventListener("change", callback)
      }
    },
    [mediaQuery],
  )
  const getSnapshot = useCallback(
    () => (typeof window === "undefined" ? false : window.matchMedia(mediaQuery).matches),
    [mediaQuery],
  )

  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
