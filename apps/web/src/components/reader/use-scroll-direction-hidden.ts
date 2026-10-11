import { useEffect, useState } from "react"

const REVEAL_ZONE = 80
const THRESHOLD = 8

export function useScrollDirectionHidden() {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    let lastY = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      const atBottom = window.innerHeight + y >= document.documentElement.scrollHeight - REVEAL_ZONE

      if (y < REVEAL_ZONE || atBottom) {
        setHidden(false)
      } else if (Math.abs(y - lastY) > THRESHOLD) {
        setHidden(y > lastY)
      }

      lastY = y
    }

    window.addEventListener("scroll", onScroll, { passive: true })

    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return hidden
}
