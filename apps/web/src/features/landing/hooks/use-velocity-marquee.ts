import { type RefObject, useEffect } from "react"

export const useVelocityMarquee = (
  trackRef: RefObject<HTMLElement | null>,
  { speed, boost = 1 }: { speed: number; boost?: number },
) => {
  useEffect(() => {
    const track = trackRef.current

    if (track === null || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined
    }

    let frame = 0
    let last = performance.now()
    let lastScroll = window.scrollY
    let velocity = 0
    let direction = 1
    let x = 0
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      const scroll = window.scrollY
      const instant = dt > 0 ? (scroll - lastScroll) / dt : 0
      const half = track.scrollWidth / 2

      last = now
      lastScroll = scroll
      velocity += (instant - velocity) * 0.12

      if (Math.abs(velocity) > 20) {
        direction = velocity > 0 ? 1 : -1
      }

      x -= speed * direction * (1 + Math.min(6, (Math.abs(velocity) / 500) * boost)) * dt

      if (half > 0) {
        x = ((x % half) - half) % half
      }

      track.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0)`
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
    }
  }, [trackRef, speed, boost])
}
