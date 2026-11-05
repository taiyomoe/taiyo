import { type RefObject, useEffect, useEffectEvent, useRef, useState } from "react"
import {
  NO_ZOOM,
  TAP_ZOOM,
  type Zoom,
  clampZoom,
  zoomAround,
} from "@/features/reader/lib/reader-zoom"

const DRAG_THRESHOLD = 6
const WHEEL_ZOOM_SPEED = 0.01

type Gesture =
  | { kind: "pinch"; start: Zoom; distance: number; midX: number; midY: number }
  | { kind: "pan"; start: Zoom; x: number; y: number }

export function usePageZoom({
  stage,
  enabled,
  resetKey,
}: {
  stage: RefObject<HTMLElement | null>
  enabled: boolean
  resetKey: string
}) {
  const content = useRef<HTMLDivElement | null>(null)
  const gesture = useRef<Gesture | null>(null)
  const dragged = useRef(false)
  const [state, setState] = useState({ key: resetKey, zoom: NO_ZOOM })
  const zoom = enabled && state.key === resetKey ? state.zoom : NO_ZOOM
  const zoomed = zoom.scale > 1
  const frame = () => {
    const element = content.current

    if (element === null) {
      return null
    }

    const rect = element.getBoundingClientRect()

    return {
      left: rect.left - zoom.x,
      top: rect.top - zoom.y,
      size: { width: element.offsetWidth, height: element.offsetHeight },
    }
  }
  const apply = (next: Zoom) => {
    setState({ key: resetKey, zoom: next })
  }
  const zoomTo = (scale: number, clientX: number, clientY: number) => {
    const box = frame()

    if (box !== null) {
      const point = { x: clientX - box.left, y: clientY - box.top }

      apply(zoomAround(zoom, point, point, scale, box.size))
    }
  }
  const pan = (start: Zoom, dx: number, dy: number) => {
    const box = frame()

    if (box !== null) {
      apply(clampZoom({ scale: start.scale, x: start.x + dx, y: start.y + dy }, box.size))
    }
  }
  const onTouchStart = useEffectEvent((event: TouchEvent) => {
    const [a, b] = [event.touches[0], event.touches[1]]

    if (!enabled || a === undefined) {
      return
    }

    if (b === undefined) {
      gesture.current = zoomed ? { kind: "pan", start: zoom, x: a.clientX, y: a.clientY } : null
      dragged.current = false

      return
    }

    gesture.current = {
      kind: "pinch",
      start: zoom,
      distance: Math.max(Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), 1),
      midX: (a.clientX + b.clientX) / 2,
      midY: (a.clientY + b.clientY) / 2,
    }
    dragged.current = true
  })
  const onTouchMove = useEffectEvent((event: TouchEvent) => {
    const current = gesture.current
    const [a, b] = [event.touches[0], event.touches[1]]

    if (current === null || a === undefined) {
      return
    }

    event.preventDefault()

    if (current.kind === "pan") {
      const dx = a.clientX - current.x
      const dy = a.clientY - current.y

      dragged.current ||= Math.hypot(dx, dy) > DRAG_THRESHOLD
      pan(current.start, dx, dy)

      return
    }

    const box = frame()

    if (b === undefined || box === null) {
      return
    }

    const distance = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)

    apply(
      zoomAround(
        current.start,
        { x: current.midX - box.left, y: current.midY - box.top },
        { x: (a.clientX + b.clientX) / 2 - box.left, y: (a.clientY + b.clientY) / 2 - box.top },
        (current.start.scale * distance) / current.distance,
        box.size,
      ),
    )
  })
  const onTouchEnd = useEffectEvent((event: TouchEvent) => {
    const remaining = event.touches[0]

    gesture.current =
      remaining !== undefined && event.touches.length === 1 && zoomed
        ? { kind: "pan", start: zoom, x: remaining.clientX, y: remaining.clientY }
        : null
  })
  const onWheel = useEffectEvent((event: WheelEvent) => {
    if (!enabled) {
      return
    }

    if (event.ctrlKey || event.metaKey) {
      event.preventDefault()
      zoomTo(zoom.scale * Math.exp(-event.deltaY * WHEEL_ZOOM_SPEED), event.clientX, event.clientY)
    } else if (zoomed) {
      event.preventDefault()
      pan(zoom, -event.deltaX, -event.deltaY)
    }
  })
  const onPointerDown = useEffectEvent((event: PointerEvent) => {
    if (event.pointerType !== "mouse" || event.button !== 0) {
      return
    }

    dragged.current = false
    gesture.current = zoomed
      ? { kind: "pan", start: zoom, x: event.clientX, y: event.clientY }
      : null
  })
  const onPointerMove = useEffectEvent((event: PointerEvent) => {
    const current = gesture.current

    if (event.pointerType !== "mouse" || current?.kind !== "pan") {
      return
    }

    const dx = event.clientX - current.x
    const dy = event.clientY - current.y

    dragged.current ||= Math.hypot(dx, dy) > DRAG_THRESHOLD
    pan(current.start, dx, dy)
  })
  const onPointerUp = useEffectEvent((event: PointerEvent) => {
    if (event.pointerType === "mouse") {
      gesture.current = null
    }
  })

  useEffect(() => {
    const element = stage.current

    if (element === null) {
      return undefined
    }

    const options = { passive: false }

    element.addEventListener("touchstart", onTouchStart, options)
    element.addEventListener("touchmove", onTouchMove, options)
    element.addEventListener("touchend", onTouchEnd, options)
    element.addEventListener("touchcancel", onTouchEnd, options)
    element.addEventListener("wheel", onWheel, options)
    element.addEventListener("pointerdown", onPointerDown)
    element.addEventListener("pointermove", onPointerMove)
    element.addEventListener("pointerup", onPointerUp)

    return () => {
      element.removeEventListener("touchstart", onTouchStart)
      element.removeEventListener("touchmove", onTouchMove)
      element.removeEventListener("touchend", onTouchEnd)
      element.removeEventListener("touchcancel", onTouchEnd)
      element.removeEventListener("wheel", onWheel)
      element.removeEventListener("pointerdown", onPointerDown)
      element.removeEventListener("pointermove", onPointerMove)
      element.removeEventListener("pointerup", onPointerUp)
    }
  }, [stage])

  return {
    zoom,
    zoomed,
    content,
    toggleAt: (clientX: number, clientY: number) => {
      if (zoomed) {
        apply(NO_ZOOM)
      } else {
        zoomTo(TAP_ZOOM, clientX, clientY)
      }
    },
    zoomBy: (factor: number) => {
      const rect = stage.current?.getBoundingClientRect()

      if (rect !== undefined) {
        zoomTo(zoom.scale * factor, rect.left + rect.width / 2, rect.top + rect.height / 2)
      }
    },
    reset: () => {
      apply(NO_ZOOM)
    },
    takeDrag: () => {
      const value = dragged.current

      dragged.current = false

      return value
    },
  }
}

export type PageZoom = ReturnType<typeof usePageZoom>
