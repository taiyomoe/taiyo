import { useSyncExternalStore } from "react"

const MINUTE = 60_000
const subscribe = (onChange: () => void) => {
  const interval = setInterval(onChange, MINUTE)

  return () => {
    clearInterval(interval)
  }
}
const getMinute = () => Math.floor(Date.now() / MINUTE) * MINUTE

export const useNow = () => useSyncExternalStore(subscribe, getMinute, getMinute)
