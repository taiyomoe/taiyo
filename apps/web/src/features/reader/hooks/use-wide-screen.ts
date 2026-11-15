import { useSyncExternalStore } from "react"

const WIDE_QUERY = "(width >= 40rem)"
const subscribe = (onChange: () => void) => {
  const query = matchMedia(WIDE_QUERY)

  query.addEventListener("change", onChange)

  return () => {
    query.removeEventListener("change", onChange)
  }
}

export const useWideScreen = () =>
  useSyncExternalStore(
    subscribe,
    () => matchMedia(WIDE_QUERY).matches,
    () => true,
  )
