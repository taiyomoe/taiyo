import type { UseEmblaCarouselType } from "embla-carousel-react"
import * as stylex from "@stylexjs/stylex"
import { breakpoints, colors, consts, motion } from "@taiyomoe/ui/styles/tokens.stylex"
import type { FeaturedMedia } from "@/features/media/api/medias"
import { ProgressFill } from "@/features/home/components/featured/progress-fill"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  dots: {
    gap: "0.125rem",
    alignItems: "center",
    display: "flex",
    position: "absolute",
    bottom: { default: "0.375rem", [breakpoints.md]: "0.5rem" },
    right: { default: "1rem", [breakpoints.md]: "2.25rem" },
  },
  dot: {
    borderStyle: "none",
    paddingBlock: "0.5rem",
    paddingInline: { default: "0.1875rem", [breakpoints.md]: "0.25rem" },
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
      [consts.reducedMotion]: "0s",
    },
    transitionProperty: "width, background-color",
    transitionTimingFunction: motion.easeOut,
    height: "0.5rem",
    width: "0.5rem",
  },
  pillActive: {
    width: "2rem",
  },
})

export function FeaturedDots({
  medias,
  selected,
  emblaApi,
  autoplay,
  paused,
  reducedMotion,
}: {
  medias: FeaturedMedia[]
  selected: number
  emblaApi: UseEmblaCarouselType[1]
  autoplay: boolean
  paused: boolean
  reducedMotion: boolean
}) {
  return (
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
  )
}
