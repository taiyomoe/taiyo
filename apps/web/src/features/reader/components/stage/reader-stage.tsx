import type { ReactNode, RefObject } from "react"
import * as stylex from "@stylexjs/stylex"
import { useRef, useState } from "react"
import type { ReaderSettings } from "@/features/reader/lib/reader-settings"
import { getImageFilter, isLightColor } from "@/features/reader/lib/reader-filter"
import { getSideStep, getZoneAction, type ReaderStep } from "@/features/reader/lib/reader-input"

const SWIPE_DISTANCE = 50
const SWIPE_TIME = 600
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
    height: "100%",
  },
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
  children,
  onStep,
  onMenu,
}: {
  ref: RefObject<HTMLElement | null>
  settings: ReaderSettings
  strip: boolean
  hideCursor: boolean
  children: ReactNode
  onStep: (step: ReaderStep) => void
  onMenu: () => void
}) {
  const [hover, setHover] = useState<ReaderStep | "menu" | null>(null)
  const swipe = useRef<{ x: number; y: number; time: number } | null>(null)
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

        const action = zoneAt(event.clientX)

        if (action === "menu") {
          onMenu()
        } else if (action !== null) {
          onStep(action)
        }
      }}
      onPointerDown={(event) => {
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
        settings.cursorHints && hover !== null && styles[hover],
        hideCursor && styles.idle,
      ]}
      tabIndex={-1}
    >
      <div sx={[styles.content(getImageFilter(settings)), !strip && styles.paged]}>{children}</div>
    </main>
  )
}
