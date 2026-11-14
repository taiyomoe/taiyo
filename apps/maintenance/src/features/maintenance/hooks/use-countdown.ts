import { useEffect, useState } from "react"

export const useCountdown = (endsAt: number) => {
  const [now, setNow] = useState(Date.now)

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined
    const tick = () => {
      const current = Date.now()

      setNow(current)

      if (current < endsAt) {
        timeout = setTimeout(tick, ((endsAt - current) % 1000) + 10)
      }
    }

    tick()

    return () => {
      clearTimeout(timeout)
    }
  }, [endsAt])

  return Math.max(0, endsAt - now)
}
