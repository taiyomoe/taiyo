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
import { HotkeysProvider, useHotkeys } from "@tanstack/react-hotkeys"
import { useEffect, useId, useRef, useState } from "react"
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
  // Translucent, so the page stays faintly visible behind the image.
  backdrop: {
    backdropFilter: "blur(4px)",
    backgroundColor: "rgb(0 0 0 / 62%)",
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
  const swiped = useRef(false)
  const popup = useRef<HTMLDivElement>(null)
  const [popupElement, setPopupElement] = useState<HTMLDivElement | null>(null)
  const scope = `lightbox-${useId()}`
  const step = (delta: number) => {
    if (index !== null && count > 1) {
      onIndexChange((index + delta + count) % count)
    }
  }

  useHotkeys(
    [
      {
        hotkey: "ArrowRight",
        callback: () => {
          step(1)
        },
        options: { meta: { name: "Next image" } },
      },
      {
        hotkey: "ArrowLeft",
        callback: () => {
          step(-1)
        },
        options: { meta: { name: "Previous image" } },
      },
      {
        hotkey: "Home",
        callback: () => {
          onIndexChange(0)
        },
        options: { meta: { name: "First image" } },
      },
      {
        hotkey: "End",
        callback: () => {
          onIndexChange(count - 1)
        },
        options: { meta: { name: "Last image" } },
      },
    ],
    { scope, target: popupElement, capture: true },
  )

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
          ref={(element) => {
            popup.current = element
            setPopupElement(element)
          }}
          {...stylex.props(styles.popup)}
          initialFocus={popup}
          // The popup covers the backdrop, so a click on the empty space around the image
          // lands here; anything but the image, the buttons and the title closes it.
          onClick={(event) => {
            if (swiped.current) {
              swiped.current = false

              return
            }

            if (
              event.target instanceof Element &&
              event.target.closest("img, button, a, p") === null
            ) {
              onClose()
            }
          }}
        >
          <HotkeysProvider exclusive scope={scope}>
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
                      swiped.current = true
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
          </HotkeysProvider>
        </DialogPrimitive.Popup>
      </DialogPortal>
    </Dialog>
  )
}
