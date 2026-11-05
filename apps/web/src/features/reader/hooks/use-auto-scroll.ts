import { type RefObject, useEffect, useEffectEvent } from "react"

export function useAutoScroll({
  stage,
  active,
  speed,
  onEnd,
}: {
  stage: RefObject<HTMLElement | null>
  active: boolean
  speed: number
  onEnd: () => void
}) {
  const end = useEffectEvent(onEnd)

  useEffect(() => {
    const element = stage.current

    if (!active || element === null) {
      return undefined
    }

    let frame = 0
    let previous = performance.now()
    let carry = 0
    const tick = (now: number) => {
      carry += (speed * (now - previous)) / 1000
      previous = now

      const whole = Math.trunc(carry)

      carry -= whole
      element.scrollTop += whole

      if (element.scrollTop + element.clientHeight >= element.scrollHeight - 1) {
        end()

        return
      }

      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
    }
  }, [active, speed, stage])
}
