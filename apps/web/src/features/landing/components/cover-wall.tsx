import * as stylex from "@stylexjs/stylex"
import { consts, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery } from "@tanstack/react-query"
import { showcaseMediasQueryOptions } from "@/features/media/api/medias"
import { Cover } from "@/features/media/components/cover"

const ROWS = [
  { id: "a", offset: 0, duration: "90s", reverse: false },
  { id: "b", offset: 5, duration: "110s", reverse: true },
  { id: "c", offset: 10, duration: "80s", reverse: false },
  { id: "d", offset: 3, duration: "120s", reverse: true },
]
const slide = stylex.keyframes({
  from: { transform: "translateX(0)" },
  to: { transform: "translateX(-50%)" },
})
const styles = stylex.create({
  wall: {
    gap: "1.25rem",
    display: "flex",
    flexDirection: "column",
    pointerEvents: "none",
    position: "absolute",
    transform: "translate(-50%, -50%) rotate(-9deg) scale(1.12)",
    left: "50%",
    top: "50%",
  },
  row: {
    gap: "1.25rem",
    animationDuration: "var(--duration)",
    animationIterationCount: "infinite",
    animationName: { default: slide, [consts.reducedMotion]: "none" },
    animationTimingFunction: "linear",
    display: "flex",
    width: "max-content",
  },
  reverse: {
    animationDirection: "reverse",
  },
  cover: {
    borderRadius: radius.lg,
    boxShadow: "0 18px 40px rgba(0,0,0,0.55)",
    width: "clamp(8rem, 11vw, 11.5rem)",
  },
})

export const CoverWall = () => {
  const { data: medias = [] } = useQuery(showcaseMediasQueryOptions())

  if (medias.length === 0) {
    return null
  }

  return (
    <div aria-hidden sx={styles.wall}>
      {ROWS.map((row) => {
        const rotated = [...medias.slice(row.offset), ...medias.slice(0, row.offset)]
        const strip = [...rotated, ...rotated]

        return (
          <div
            key={row.id}
            sx={[styles.row, row.reverse && styles.reverse]}
            style={{ "--duration": row.duration }}
          >
            {strip.map((media, i) => (
              <Cover
                key={`${media.id}-${String(i)}`}
                src={media.coverUrl}
                priority="low"
                sx={styles.cover}
              />
            ))}
          </div>
        )
      })}
    </div>
  )
}
