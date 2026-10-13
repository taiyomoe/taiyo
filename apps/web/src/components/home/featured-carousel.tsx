import * as stylex from "@stylexjs/stylex"
import { colors, motion } from "@taiyomoe/ui/styles/tokens.stylex"
import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react"
import {
  type FocusEvent,
  type PointerEvent,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react"
import type { FeaturedMedia } from "@/lib/queries/medias"
import { FeaturedSlide, FeaturedSlideSkeleton } from "@/components/home/featured-slide"
import { m } from "@/paraglide/messages"

type EmblaApi = NonNullable<UseEmblaCarouselType[1]>

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)"
const progress = stylex.keyframes({
  from: { transform: "translateX(-100%)" },
  to: { transform: "translateX(0)" },
})
const styles = stylex.create({
  root: {
    position: "relative",
    marginTop: { default: "calc(-1 * var(--navbar-height))", "@media (width >= 50rem)": 0 },
  },
  viewport: {
    overflow: "hidden",
  },
  container: {
    display: "flex",
    touchAction: "pan-y pinch-zoom",
  },
  dots: {
    gap: "0.125rem",
    alignItems: "center",
    display: "flex",
    position: "absolute",
    bottom: { default: "0.375rem", "@media (width >= 48rem)": "0.5rem" },
    right: { default: "1rem", "@media (width >= 48rem)": "2.25rem" },
  },
  dot: {
    borderStyle: "none",
    paddingBlock: "0.5rem",
    paddingInline: { default: "0.1875rem", "@media (width >= 48rem)": "0.25rem" },
    backgroundColor: "transparent",
    cursor: "pointer",
    display: "flex",
    outlineStyle: "none",
  },
  pill: {
    borderRadius: "9999px",
    overflow: "hidden",
    backgroundColor: {
      default: `color-mix(in srgb, ${colors.foreground} 32%, transparent)`,
      ":is(:hover > *)": `color-mix(in srgb, ${colors.foreground} 56%, transparent)`,
    },
    outlineColor: colors.ring,
    outlineOffset: 3,
    outlineStyle: {
      default: "none",
      ":is(:focus-visible > *)": "solid",
    },
    outlineWidth: 2,
    transform: "translateZ(0)",
    transitionDuration: {
      default: "520ms",
      "@media (prefers-reduced-motion: reduce)": "0s",
    },
    transitionProperty: "width, background-color",
    transitionTimingFunction: motion.easeOut,
    height: "0.5rem",
    width: "0.5rem",
  },
  pillActive: {
    width: "2rem",
  },
  fill: {
    borderRadius: "inherit",
    backgroundColor: colors.foreground,
    display: "block",
    transform: "translateX(-100%)",
    height: "100%",
    width: "100%",
  },
  fillComplete: {
    transform: "translateX(0)",
  },
  fillRunning: {
    animationDuration: "7s",
    animationFillMode: "both",
    animationName: progress,
    animationTimingFunction: "linear",
    willChange: "transform",
  },
  fillPaused: {
    animationPlayState: "paused",
  },
})
const routeApi = getRouteApi("/")
const subscribeToReducedMotion = (onChange: () => void) => {
  const query = matchMedia(REDUCED_MOTION_QUERY)

  query.addEventListener("change", onChange)

  return () => {
    query.removeEventListener("change", onChange)
  }
}
const subscribeToVisibility = (onChange: () => void) => {
  document.addEventListener("visibilitychange", onChange)

  return () => {
    document.removeEventListener("visibilitychange", onChange)
  }
}
const usePrefersReducedMotion = () =>
  useSyncExternalStore(
    subscribeToReducedMotion,
    () => matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  )
const useDocumentHidden = () =>
  useSyncExternalStore(
    subscribeToVisibility,
    () => document.hidden,
    () => false,
  )

export function FeaturedCarousel() {
  const { featuredMediasQueryOptions } = routeApi.useRouteContext()
  const { data: medias } = useSuspenseQuery(featuredMediasQueryOptions)

  return medias.length === 0 ? null : <FeaturedCarouselView medias={medias} />
}

function FeaturedCarouselView({ medias }: { medias: FeaturedMedia[] }) {
  const [viewportRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 32 })
  const [selected, setSelected] = useState(0)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [dragging, setDragging] = useState(false)
  const reducedMotion = usePrefersReducedMotion()
  const hidden = useDocumentHidden()
  const autoplay = emblaApi !== undefined && medias.length > 1 && !reducedMotion
  const paused = hovered || focused || dragging || hidden

  useEffect(() => {
    const onSelect = (api: EmblaApi) => {
      setSelected(api.selectedSnap())
    }
    const onPointerDown = () => {
      setDragging(true)
    }
    const onPointerUp = () => {
      setDragging(false)
    }

    emblaApi?.on("select", onSelect)
    emblaApi?.on("pointerdown", onPointerDown)
    emblaApi?.on("pointerup", onPointerUp)

    return () => {
      emblaApi?.off("select", onSelect)
      emblaApi?.off("pointerdown", onPointerDown)
      emblaApi?.off("pointerup", onPointerUp)
    }
  }, [emblaApi])

  const onPointerEnter = (event: PointerEvent) => {
    if (event.pointerType === "mouse") {
      setHovered(true)
    }
  }
  const onFocus = (event: FocusEvent) => {
    if (event.target.matches(":focus-visible")) {
      setFocused(true)
    }
  }
  const onBlur = (event: FocusEvent) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setFocused(false)
    }
  }

  return (
    <section
      aria-label={m.home_featured_label()}
      aria-roledescription="carousel"
      onBlur={onBlur}
      onFocus={onFocus}
      onPointerEnter={onPointerEnter}
      onPointerLeave={() => {
        setHovered(false)
      }}
      sx={styles.root}
    >
      <div ref={viewportRef} sx={styles.viewport}>
        <div sx={styles.container}>
          {medias.map((media, index) => (
            <FeaturedSlide key={media.id} index={index} media={media} total={medias.length} />
          ))}
        </div>
      </div>
      {medias.length > 1 ? (
        <div sx={styles.dots}>
          {medias.map((media, index) => {
            const active = index === selected

            return (
              <button
                key={media.id}
                aria-current={active}
                aria-label={m.home_featured_go_to({ title: media.title ?? index + 1 })}
                onClick={() => emblaApi?.goTo(index)}
                sx={styles.dot}
                type="button"
              >
                <span sx={[styles.pill, active && styles.pillActive]}>
                  {active ? (
                    <ProgressFill
                      complete={reducedMotion}
                      onComplete={() => emblaApi?.goToNext()}
                      paused={paused}
                      running={autoplay}
                    />
                  ) : null}
                </span>
              </button>
            )
          })}
        </div>
      ) : null}
    </section>
  )
}

type ProgressFillProps = {
  running: boolean
  paused: boolean
  complete: boolean
  onComplete: () => void
}

function ProgressFill({ running, paused, complete, onComplete }: ProgressFillProps) {
  return (
    <span
      onAnimationEnd={onComplete}
      sx={[
        styles.fill,
        complete && styles.fillComplete,
        running && styles.fillRunning,
        paused && styles.fillPaused,
      ]}
    />
  )
}

export function FeaturedCarouselSkeleton() {
  return (
    <div sx={styles.root}>
      <FeaturedSlideSkeleton />
    </div>
  )
}
