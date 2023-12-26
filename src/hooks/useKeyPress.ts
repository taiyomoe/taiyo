import type { KeyboardEvent, KeyboardEventHandler } from "react"
import { experimental_useEffectEvent, useEffect } from "react"

export function useKeyPress(
  key: string,
  cb: (e: KeyboardEvent) => unknown,
  options: {
    event?: keyof WindowEventMap
    target?: Element | Window
    eventOptions?: Record<string, unknown>
  } = {},
) {
  const {
    event = "keydown",
    target = typeof window !== "undefined" ? window : null,
    eventOptions,
  } = options

  const onListen = experimental_useEffectEvent(
    (target: Element | Window, event: keyof WindowEventMap) => {
      const handler: KeyboardEventHandler = (event) => {
        if (event.key === key) {
          cb(event)
        }
      }

      target.addEventListener(
        event,
        handler as unknown as EventListener,
        eventOptions,
      )

      return () => {
        target.removeEventListener(
          event,
          handler as unknown as EventListener,
          eventOptions,
        )
      }
    },
  )

  useEffect(() => {
    if (!target) {
      return
    }

    return onListen(target, event)
  }, [target, event, onListen])
}
