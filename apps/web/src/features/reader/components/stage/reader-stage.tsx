import type { ReaderSettings } from "@taiyomoe/schemas/reader-settings"
import type { ReactNode, RefObject } from "react"
import * as stylex from "@stylexjs/stylex"
import { useRef, useState } from "react"
import type { PageZoom } from "@/features/reader/hooks/use-page-zoom"
import { getImageFilter, isLightColor } from "@/features/reader/lib/reader-filter"
import { getSideStep, getZoneAction, type ReaderStep } from "@/features/reader/lib/reader-input"

const SWIPE_DISTANCE = 50
const SWIPE_TIME = 600
const DOUBLE_TAP_TIME = 300
const DOUBLE_TAP_DISTANCE = 40
const styles = stylex.create({
  stage: (background: string, foreground: string) => ({
    WebkitTapHighlightColor: "transparent",
    inset: 0,
    outline: "none",
    overflow: "auto",
    overscrollBehavior: "contain",
    backgroundColor: background,
    color: foreground,
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    userSelect: "none",
  }),
  content: (filter: string) => ({
    display: "flex",
    filter,
    flexDirection: "column",
    flexGrow: 1,
    minHeight: 0,
  }),
  paged: {
    touchAction: "pan-x pan-y",
    height: "100%",
  },
  zoomedStage: {
    overflow: "hidden",
    cursor: { default: "grab", ":active": "grabbing" },
    touchAction: "none",
  },
  zoom: (x: number, y: number, scale: number) => ({
    transform: `translate(${x}px, ${y}px) scale(${scale})`,
    transformOrigin: "0 0",
    willChange: "transform",
  }),
  prev: {
    cursor: "w-resize",
  },
  next: {
    cursor: "e-resize",
  },
  menu: {
    cursor: "pointer",
  },
  idle: {
    cursor: "none",
  },
})

export function ReaderStage({
  ref,
  settings,
  strip,
  hideCursor,
  zoom,
  children,
  onStep,
  onMenu,
}: {
  ref: RefObject<HTMLElement | null>
  settings: ReaderSettings
  strip: boolean
  hideCursor: boolean
  zoom: PageZoom
  children: ReactNode
  onStep: (step: ReaderStep) => void
  onMenu: () => void
}) {
  const [hover, setHover] = useState<ReaderStep | "menu" | null>(null)
  const swipe = useRef<{ x: number; y: number; time: number } | null>(null)
  const pointerType = useRef("mouse")
  const pendingTap = useRef<{
    x: number
    y: number
    time: number
    timer: ReturnType<typeof setTimeout>
  } | null>(null)
  const zoneAt = (clientX: number) => {
    const element = ref.current

    if (element === null) {
      return null
    }

    const rect = element.getBoundingClientRect()

    return getZoneAction(
      (clientX - rect.left) / rect.width,
      settings.clickZones,
      settings.direction,
    )
  }

  return (
    <main
      aria-live="off"
      onClick={(event) => {
        if (event.defaultPrevented || window.getSelection()?.isCollapsed === false) {
          return
        }

        if (zoom.takeDrag()) {
          return
        }

        const action = zoneAt(event.clientX)
        const run = () => {
          if (action === "menu") {
            onMenu()
          } else if (action !== null && !zoom.zoomed) {
            onStep(action)
          }
        }

        if (strip || pointerType.current !== "touch" || !settings.doubleTapZoom) {
          run()

          return
        }

        const previous = pendingTap.current

        if (
          previous !== null &&
          event.timeStamp - previous.time < DOUBLE_TAP_TIME &&
          Math.hypot(event.clientX - previous.x, event.clientY - previous.y) < DOUBLE_TAP_DISTANCE
        ) {
          clearTimeout(previous.timer)
          pendingTap.current = null
          zoom.toggleAt(event.clientX, event.clientY)

          return
        }

        clearTimeout(previous?.timer)
        pendingTap.current = {
          x: event.clientX,
          y: event.clientY,
          time: event.timeStamp,
          timer: setTimeout(() => {
            pendingTap.current = null
            run()
          }, DOUBLE_TAP_TIME),
        }
      }}
      onDoubleClick={(event) => {
        if (
          !strip &&
          pointerType.current === "mouse" &&
          (zoom.zoomed || settings.clickZones === "off")
        ) {
          zoom.toggleAt(event.clientX, event.clientY)
        }
      }}
      onPointerDown={(event) => {
        pointerType.current = event.pointerType
        swipe.current =
          event.pointerType === "touch" && event.isPrimary
            ? { x: event.clientX, y: event.clientY, time: event.timeStamp }
            : null
      }}
      onPointerLeave={() => {
        setHover(null)
      }}
      onPointerMove={(event) => {
        if (settings.cursorHints && event.pointerType === "mouse") {
          setHover(zoneAt(event.clientX))
        }
      }}
      onPointerUp={(event) => {
        const start = swipe.current

        swipe.current = null

        if (
          start === null ||
          strip ||
          !settings.swipe ||
          zoom.zoomed ||
          (window.visualViewport?.scale ?? 1) > 1.01
        ) {
          return
        }

        const dx = event.clientX - start.x
        const dy = event.clientY - start.y

        if (
          Math.abs(dx) > SWIPE_DISTANCE &&
          Math.abs(dx) > Math.abs(dy) * 1.5 &&
          event.timeStamp - start.time < SWIPE_TIME
        ) {
          onStep(getSideStep(dx < 0 ? "right" : "left", settings.direction))
        }
      }}
      ref={ref}
      sx={[
        styles.stage(
          settings.background,
          isLightColor(settings.background) ? "rgb(0 0 0 / 72%)" : "rgb(255 255 255 / 72%)",
        ),
        settings.cursorHints && hover !== null && !zoom.zoomed && styles[hover],
        hideCursor && styles.idle,
        zoom.zoomed && styles.zoomedStage,
      ]}
      tabIndex={-1}
    >
      <div
        ref={strip ? undefined : zoom.content}
        sx={[
          styles.content(getImageFilter(settings)),
          !strip && styles.paged,
          zoom.zoomed && styles.zoom(zoom.zoom.x, zoom.zoom.y, zoom.zoom.scale),
        ]}
      >
        {children}
      </div>
    </main>
  )
}
