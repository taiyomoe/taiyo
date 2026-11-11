import type { Sx } from "@taiyomoe/ui/styles/sx"
import * as stylex from "@stylexjs/stylex"
import { breakpoints, colors, consts, motion } from "@taiyomoe/ui/styles/tokens.stylex"
import { ProgressFill } from "@/components/carousel-dots/progress-fill"
import { scene } from "@/components/scene/scene.stylex"

const styles = stylex.create({
  dots: {
    gap: "0.125rem",
    alignItems: "center",
    display: "flex",
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
  pillSun: {
    backgroundColor: {
      default: `color-mix(in srgb, ${scene.paper} 22%, transparent)`,
      ":is(:hover > *)": `color-mix(in srgb, ${scene.paper} 42%, transparent)`,
    },
    outlineColor: scene.gold,
  },
  pillActive: {
    width: "2rem",
  },
})

/**
 * Pills for a carousel: the current one widens and fills up while autoplay
 * runs, and `onComplete` fires when it is full. `sun` paints them in the
 * brand-scene colours for the night backdrops.
 */
export function CarouselDots({
  items,
  selected,
  onSelect,
  onComplete,
  autoplay,
  paused,
  reducedMotion,
  variant = "default",
  sx,
}: {
  items: Array<{ key: string; label: string }>
  selected: number
  onSelect: (index: number) => void
  onComplete: () => void
  autoplay: boolean
  paused: boolean
  reducedMotion: boolean
  variant?: "default" | "sun"
  sx?: Sx
}) {
  const sun = variant === "sun"

  return (
    <div sx={[styles.dots, sx]}>
      {items.map((item, index) => {
        const active = index === selected

        return (
          <button
            key={item.key}
            aria-current={active}
            aria-label={item.label}
            onClick={() => {
              onSelect(index)
            }}
            sx={styles.dot}
            type="button"
          >
            <span sx={[styles.pill, sun && styles.pillSun, active && styles.pillActive]}>
              {active ? (
                <ProgressFill
                  complete={reducedMotion}
                  onComplete={onComplete}
                  paused={paused}
                  running={autoplay}
                  sun={sun}
                />
              ) : null}
            </span>
          </button>
        )
      })}
    </div>
  )
}
