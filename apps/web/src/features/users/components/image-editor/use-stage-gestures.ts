import { type RefObject, useEffect } from "react"
import type { Point } from "@/features/users/components/image-editor/crop-math"
import type { ImageEditor } from "@/features/users/components/image-editor/use-image-editor"

/** Pixels per wheel `deltaMode` unit: pixels, lines, pages. */
const WHEEL_UNITS = [1, 16, 400]
const KEY_PAN = 10
const KEY_PAN_FAST = 50
const measurePair = (pointers: Map<number, Point>) => {
  const [first, second] = [...pointers.values()]

  if (first === undefined || second === undefined) {
    return null
  }

  return {
    distance: Math.max(Math.hypot(second.x - first.x, second.y - first.y), 1),
    centre: { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 },
  }
}

/**
 * Pointer, wheel and double-click handling for the stage. Everything goes
 * straight to the editor, which batches DOM writes per animation frame, so no
 * React state changes while a gesture runs.
 */
export const useStageGestures = (editor: ImageEditor, stage: RefObject<HTMLDivElement | null>) => {
  useEffect(() => {
    const element = stage.current

    if (element === null) {
      return undefined
    }

    const pointers = new Map<number, Point>()
    let pinch: ReturnType<typeof measurePair> = null
    // Relative to the stage centre, which is where the frame is centred too.
    const toStage = ({ x, y }: Point) => {
      const rect = element.getBoundingClientRect()

      return { x: x - rect.left - rect.width / 2, y: y - rect.top - rect.height / 2 }
    }
    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) {
        return
      }

      element.setPointerCapture(event.pointerId)
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })

      if (pointers.size === 1) {
        editor.beginDrag()
      } else {
        pinch = measurePair(pointers)
      }
    }
    const onPointerMove = (event: PointerEvent) => {
      const previous = pointers.get(event.pointerId)

      if (previous === undefined) {
        return
      }

      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })

      if (pinch === null) {
        editor.dragBy(event.clientX - previous.x, event.clientY - previous.y)

        return
      }

      const next = measurePair(pointers)

      if (next !== null) {
        editor.zoomBy(next.distance / pinch.distance, toStage(next.centre))
        editor.dragBy(next.centre.x - pinch.centre.x, next.centre.y - pinch.centre.y)
        pinch = next
      }
    }
    const onPointerEnd = (event: PointerEvent) => {
      if (!pointers.delete(event.pointerId)) {
        return
      }

      pinch = pointers.size >= 2 ? measurePair(pointers) : null

      if (pointers.size === 0) {
        editor.endDrag()
      }
    }
    const onWheel = (event: WheelEvent) => {
      event.preventDefault()

      // Trackpad pinches arrive as ctrl+wheel with small deltas.
      const sensitivity = event.ctrlKey ? 0.01 : 0.0015
      const delta = event.deltaY * (WHEEL_UNITS[event.deltaMode] ?? 1)

      editor.zoomBy(Math.exp(-delta * sensitivity), toStage({ x: event.clientX, y: event.clientY }))
    }
    const onDoubleClick = (event: MouseEvent) => {
      editor.toggleFit(toStage({ x: event.clientX, y: event.clientY }))
    }

    element.addEventListener("pointerdown", onPointerDown)
    element.addEventListener("pointermove", onPointerMove)
    element.addEventListener("pointerup", onPointerEnd)
    element.addEventListener("pointercancel", onPointerEnd)
    element.addEventListener("lostpointercapture", onPointerEnd)
    element.addEventListener("wheel", onWheel, { passive: false })
    element.addEventListener("dblclick", onDoubleClick)

    return () => {
      element.removeEventListener("pointerdown", onPointerDown)
      element.removeEventListener("pointermove", onPointerMove)
      element.removeEventListener("pointerup", onPointerEnd)
      element.removeEventListener("pointercancel", onPointerEnd)
      element.removeEventListener("lostpointercapture", onPointerEnd)
      element.removeEventListener("wheel", onWheel)
      element.removeEventListener("dblclick", onDoubleClick)
    }
  }, [editor, stage])
}

const KEY_ACTIONS: Record<string, ((editor: ImageEditor, step: number) => void) | undefined> = {
  ArrowLeft: (editor, step) => {
    editor.panBy(-step, 0)
  },
  ArrowRight: (editor, step) => {
    editor.panBy(step, 0)
  },
  ArrowUp: (editor, step) => {
    editor.panBy(0, -step)
  },
  ArrowDown: (editor, step) => {
    editor.panBy(0, step)
  },
  "+": (editor) => {
    editor.stepZoom(1)
  },
  "=": (editor) => {
    editor.stepZoom(1)
  },
  "-": (editor) => {
    editor.stepZoom(-1)
  },
  _: (editor) => {
    editor.stepZoom(-1)
  },
  r: (editor) => {
    editor.rotate(1)
  },
  R: (editor) => {
    editor.rotate(-1)
  },
  h: (editor) => {
    editor.flip("x")
  },
  H: (editor) => {
    editor.flip("x")
  },
  v: (editor) => {
    editor.flip("y")
  },
  V: (editor) => {
    editor.flip("y")
  },
  g: (editor) => {
    editor.toggleGrid()
  },
  G: (editor) => {
    editor.toggleGrid()
  },
  "0": (editor) => {
    editor.reset()
  },
}

/** Keyboard shortcuts on the focused stage. Returns whether the key was handled. */
export const handleStageKey = (editor: ImageEditor, event: KeyboardEvent) => {
  const action = event.ctrlKey || event.metaKey || event.altKey ? undefined : KEY_ACTIONS[event.key]

  if (action === undefined) {
    return false
  }

  action(editor, event.shiftKey ? KEY_PAN_FAST : KEY_PAN)

  return true
}
