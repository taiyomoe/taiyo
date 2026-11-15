import { useSyncExternalStore } from "react"

const subscribeToVisibility = (onChange: () => void) => {
  document.addEventListener("visibilitychange", onChange)

  return () => {
    document.removeEventListener("visibilitychange", onChange)
  }
}

export const useDocumentHidden = () =>
  useSyncExternalStore(
    subscribeToVisibility,
    () => document.hidden,
    () => false,
  )
