import { type PointerEvent, useEffect, useRef, useState } from "react"

const OPEN_DELAY = 250
const CLOSE_DELAY = 150

export function useHoverPopover() {
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const pending = useRef<boolean | null>(null)
  const cancel = () => {
    clearTimeout(timer.current)
    pending.current = null
  }
  const schedule = (next: boolean, delay: number) => {
    cancel()
    pending.current = next
    timer.current = setTimeout(() => {
      pending.current = null
      setOpen(next)
      setHovered(next)
    }, delay)
  }
  const isMouse = (event: PointerEvent) => event.pointerType === "mouse"

  useEffect(
    () => () => {
      clearTimeout(timer.current)
    },
    [],
  )

  return {
    open,
    onOpenChange: (next: boolean, { reason }: { reason: string }) => {
      cancel()

      if (!next && hovered && reason === "trigger-press") {
        setHovered(false)

        return
      }

      setOpen(next)
      setHovered(false)
    },
    triggerProps: {
      onPointerMove: (event: PointerEvent) => {
        if (isMouse(event) && !open && pending.current !== true) {
          schedule(true, OPEN_DELAY)
        }
      },
      onPointerLeave: (event: PointerEvent) => {
        if (isMouse(event) && (hovered || !open)) {
          schedule(false, CLOSE_DELAY)
        }
      },
    },
    popupProps: {
      onPointerEnter: cancel,
      onPointerLeave: (event: PointerEvent) => {
        if (isMouse(event) && hovered) {
          schedule(false, CLOSE_DELAY)
        }
      },
    },
  }
}
