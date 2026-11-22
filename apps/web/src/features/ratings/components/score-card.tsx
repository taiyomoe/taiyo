import * as stylex from "@stylexjs/stylex"
import { config } from "@taiyomoe/config"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { colors, consts, font, motion, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { type KeyboardEvent, useEffect, useEffectEvent, useId, useRef, useState } from "react"
import { useRateMedia } from "@/features/ratings/api/ratings"
import { StarGlyph } from "@/features/ratings/components/star-glyph"
import { SCORES } from "@/features/ratings/lib/ratings"
import { m } from "@/paraglide/messages"

const SAVE_DELAY_MS = 400
const { maxScore } = config.ratings
const styles = stylex.create({
  card: {
    padding: "1rem",
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.625rem",
    backgroundClip: "padding-box",
    backgroundColor: colors.card,
    boxShadow: shadows.raised,
    display: "flex",
    flexDirection: "column",
  },
  header: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    justifyContent: "space-between",
    minHeight: "1.5rem",
  },
  label: {
    color: colors.mutedForeground,
    fontSize: "0.75rem",
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  value: {
    gap: "0.25rem",
    alignItems: "center",
    color: colors.foreground,
    display: "inline-flex",
    fontFamily: font.mono,
    fontSize: "0.8125rem",
    fontVariantNumeric: "tabular-nums",
    fontWeight: 600,
  },
  unrated: {
    color: colors.mutedForeground,
    fontFamily: font.sans,
    fontWeight: 500,
  },
  stars: {
    display: "grid",
    gridTemplateColumns: `repeat(${maxScore}, minmax(0, 1fr))`,
  },
  star: {
    padding: 0,
    borderRadius: radius.sm,
    borderWidth: 0,
    alignItems: "center",
    aspectRatio: "1",
    backgroundColor: "transparent",
    color: `color-mix(in srgb, ${colors.foreground} 22%, transparent)`,
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    outlineColor: colors.ring,
    outlineOffset: -2,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    transform: { default: null, ":active": "scale(0.88)" },
    transitionDuration: { default: motion.enter, [consts.reducedMotion]: "0s" },
    transitionProperty: "color, transform",
    minWidth: "1.5rem",
  },
  filled: {
    color: colors.warning,
  },
  preview: {
    color: `color-mix(in srgb, ${colors.warning} 60%, transparent)`,
  },
  icon: {
    height: "78%",
    width: "78%",
  },
  clear: {
    marginRight: "-0.5rem",
  },
})

/** The viewer's score: a star per point, saved a moment after the last change. */
export function ScoreCard({ mediaId, score }: { mediaId: string; score: number | null }) {
  const labelId = useId()
  const rate = useRateMedia(mediaId)
  const [draft, setDraft] = useState<number | null | undefined>(undefined)
  const [hovered, setHovered] = useState<number | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const pending = useRef<{ value: number | null } | undefined>(undefined)
  const stars = useRef<Array<HTMLButtonElement | null>>([])
  const selected = draft === undefined ? score : draft
  const flush = () => {
    clearTimeout(timer.current)

    const next = pending.current

    pending.current = undefined

    if (next !== undefined) {
      rate.mutate(next.value)
      setDraft(undefined)
    }
  }
  const choose = (value: number | null) => {
    clearTimeout(timer.current)
    setDraft(value)
    pending.current = value === score ? undefined : { value }

    if (pending.current === undefined) {
      setDraft(undefined)

      return
    }

    timer.current = setTimeout(flush, SAVE_DELAY_MS)
  }
  const flushOnUnmount = useEffectEvent(flush)

  useEffect(
    () => () => {
      flushOnUnmount()
    },
    [],
  )

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, value: number) => {
    const moves: Record<string, number> = {
      ArrowRight: value + 1,
      ArrowUp: value + 1,
      ArrowLeft: value - 1,
      ArrowDown: value - 1,
      Home: 1,
      End: maxScore,
    }
    const target = moves[event.key]

    if (target === undefined) {
      return
    }

    event.preventDefault()

    const next = Math.min(Math.max(target, 1), maxScore)

    choose(next)
    stars.current[next - 1]?.focus()
  }
  const shown = hovered ?? selected ?? 0

  return (
    <section aria-labelledby={labelId} sx={styles.card}>
      <div sx={styles.header}>
        <span id={labelId} sx={styles.label}>
          {m.rating_your_score()}
        </span>
        {selected === null ? (
          <span sx={[styles.value, styles.unrated]}>{m.rating_not_rated()}</span>
        ) : (
          <span sx={styles.value}>
            {m.rating_score_of({ score: selected, max: maxScore })}
            <Button
              aria-label={m.rating_clear()}
              onClick={() => {
                choose(null)
              }}
              size="xs"
              sx={styles.clear}
              variant="ghost"
            >
              {m.rating_clear_short()}
            </Button>
          </span>
        )}
      </div>
      <div
        aria-labelledby={labelId}
        onPointerLeave={() => {
          setHovered(null)
        }}
        role="radiogroup"
        sx={styles.stars}
      >
        {SCORES.map((value) => (
          <button
            key={value}
            ref={(element) => {
              stars.current[value - 1] = element
            }}
            aria-checked={selected === value}
            aria-label={m.rating_score_option({ score: value, max: maxScore })}
            onClick={() => {
              choose(value)
            }}
            onKeyDown={(event) => {
              onKeyDown(event, value)
            }}
            onPointerEnter={(event) => {
              if (event.pointerType === "mouse") {
                setHovered(value)
              }
            }}
            role="radio"
            sx={[
              styles.star,
              value <= shown && (hovered === null ? styles.filled : styles.preview),
            ]}
            tabIndex={value === (selected ?? 1) ? 0 : -1}
            type="button"
          >
            <StarGlyph sx={styles.icon} />
          </button>
        ))}
      </div>
    </section>
  )
}
