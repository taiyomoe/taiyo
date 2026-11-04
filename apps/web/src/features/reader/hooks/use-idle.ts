import { useEffect, useState } from "react"

const EVENTS = ["pointermove", "pointerdown", "keydown", "wheel", "touchstart"] as const

export function useIdle(timeout: number, enabled: boolean) {
  const [idle, setIdle] = useState(false)

  useEffect(() => {
    if (!enabled) {
      return undefined
    }

    let timer = setTimeout(() => {
      setIdle(true)
    }, timeout)
    const wake = () => {
      setIdle(false)
      clearTimeout(timer)
      timer = setTimeout(() => {
        setIdle(true)
      }, timeout)
    }

    for (const event of EVENTS) {
      window.addEventListener(event, wake, { passive: true })
    }

    return () => {
      clearTimeout(timer)

      for (const event of EVENTS) {
        window.removeEventListener(event, wake)
      }
    }
  }, [enabled, timeout])

  return enabled && idle
}
