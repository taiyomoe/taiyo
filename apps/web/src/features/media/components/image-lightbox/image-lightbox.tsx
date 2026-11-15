import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { ChevronLeft, ChevronRight } from "@taiyomoe/ui/components/icons"
import {
  Dialog,
  DialogBackdrop,
  DialogPortal,
  DialogPrimitive,
} from "@taiyomoe/ui/components/ui/dialog"
import { breakpoints, motion } from "@taiyomoe/ui/styles/tokens.stylex"
import { useEffect, useRef, useState } from "react"
import { LightboxBar } from "@/features/media/components/image-lightbox/lightbox-bar"
import { LightboxImage } from "@/features/media/components/image-lightbox/lightbox-image"
import { OverlayButton } from "@/features/media/components/image-lightbox/overlay-button"
import { m } from "@/paraglide/messages"

export type LightboxItem = {
  id: string
  url: string
  title: string
  detail?: ReactNode
  fileName: string
}

const SWIPE_DISTANCE = 48
const styles = stylex.create({
  backdrop: {
    backdropFilter: "blur(14px) saturate(120%)",
    backgroundColor: "rgb(6 6 6 / 86%)",
  },
  popup: {
    inset: 0,
    display: "grid",
    gridTemplateRows: "auto minmax(0, 1fr)",
    opacity: { "[data-ending-style]": 0, "[data-starting-style]": 0, default: 1 },
    outlineStyle: "none",
    position: "fixed",
    transitionDuration: { "[data-ending-style]": motion.exitLarge, default: motion.enterLarge },
    transitionProperty: "opacity",
    transitionTimingFunction: motion.easeOut,
    zIndex: 50,
  },
  title: {
    margin: "-1px",
    padding: 0,
    borderWidth: 0,
    overflow: "hidden",
    clip: "rect(0 0 0 0)",
    position: "absolute",
    whiteSpace: "nowrap",
    height: 1,
    width: 1,
  },
  stage: {
    paddingInline: { default: "0.75rem", [breakpoints.sm]: "5.5rem" },
    position: "relative",
    touchAction: "pan-y",
    minHeight: 0,
    paddingBottom: { default: "5rem", [breakpoints.sm]: "2rem" },
  },
  nav: {
    position: "absolute",
    transform: {
      default: null,
      ":active": "scale(0.94)",
      [breakpoints.sm]: { default: "translateY(-50%)", ":active": "translateY(-50%) scale(0.94)" },
    },
    zIndex: 1,
    bottom: { default: "1rem", [breakpoints.sm]: "auto" },
    top: { default: "auto", [breakpoints.sm]: "50%" },
  },
  prev: {
    left: { default: "calc(50% - 3.5rem)", [breakpoints.sm]: "1.5rem" },
  },
  next: {
    right: { default: "calc(50% - 3.5rem)", [breakpoints.sm]: "1.5rem" },
  },
})

export function ImageLightbox({
  items,
  index,
  onIndexChange,
  onClose,
}: {
  items: readonly LightboxItem[]
  index: number | null
  onIndexChange: (index: number) => void
  onClose: () => void
}) {
  const [lastIndex, setLastIndex] = useState(index)

  if (index !== null && index !== lastIndex) {
    setLastIndex(index)
  }

  const shownIndex = index ?? lastIndex
  const item = shownIndex === null ? undefined : items[shownIndex]
  const count = items.length
  const swipeStart = useRef<number | null>(null)
  const popup = useRef<HTMLDivElement>(null)
  const step = (delta: number) => {
    if (index !== null && count > 1) {
      onIndexChange((index + delta + count) % count)
    }
  }

  useEffect(() => {
    if (index === null || count < 2) {
      return
    }

    for (const neighbour of [items[(index + 1) % count], items[(index - 1 + count) % count]]) {
      if (neighbour !== undefined) {
        new Image().src = neighbour.url
      }
    }
  }, [index, items, count])

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
      open={index !== null && item !== undefined}
    >
      <DialogPortal>
        <DialogBackdrop sx={styles.backdrop} />
        <DialogPrimitive.Popup
          ref={popup}
          {...stylex.props(styles.popup)}
          initialFocus={popup}
          onKeyDown={(event) => {
            if (event.key === "ArrowRight") {
              event.preventDefault()
              step(1)
            } else if (event.key === "ArrowLeft") {
              event.preventDefault()
              step(-1)
            } else if (event.key === "Home" && index !== null) {
              event.preventDefault()
              onIndexChange(0)
            } else if (event.key === "End" && index !== null) {
              event.preventDefault()
              onIndexChange(count - 1)
            }
          }}
        >
          <DialogPrimitive.Title {...stylex.props(styles.title)}>
            {item?.title ?? m.media_lightbox_title()}
          </DialogPrimitive.Title>
          {item === undefined || shownIndex === null ? null : (
            <>
              <LightboxBar count={count} index={shownIndex} item={item} onClose={onClose} />
              <div
                onPointerDown={(event) => {
                  swipeStart.current = event.pointerType === "mouse" ? null : event.clientX
                }}
                onPointerUp={(event) => {
                  const start = swipeStart.current

                  swipeStart.current = null

                  if (start !== null && Math.abs(event.clientX - start) > SWIPE_DISTANCE) {
                    step(event.clientX < start ? 1 : -1)
                  }
                }}
                sx={styles.stage}
              >
                <LightboxImage key={item.id} alt={item.title} src={item.url} />
              </div>
              {count > 1 ? (
                <>
                  <OverlayButton
                    iconOnly
                    label={m.media_lightbox_previous()}
                    large
                    onClick={() => {
                      step(-1)
                    }}
                    sx={[styles.nav, styles.prev]}
                  >
                    <ChevronLeft size={22} />
                  </OverlayButton>
                  <OverlayButton
                    iconOnly
                    label={m.media_lightbox_next()}
                    large
                    onClick={() => {
                      step(1)
                    }}
                    sx={[styles.nav, styles.next]}
                  >
                    <ChevronRight size={22} />
                  </OverlayButton>
                </>
              ) : null}
            </>
          )}
        </DialogPrimitive.Popup>
      </DialogPortal>
    </Dialog>
  )
}
