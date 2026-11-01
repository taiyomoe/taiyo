import { useSyncExternalStore } from "react"

const subscribe = (onChange: () => void) => {
  window.addEventListener("scroll", onChange, { passive: true })

  return () => {
    window.removeEventListener("scroll", onChange)
  }
}

export const useWindowScrolled = () =>
  useSyncExternalStore(
    subscribe,
    () => window.scrollY > 0,
    () => false,
  )
