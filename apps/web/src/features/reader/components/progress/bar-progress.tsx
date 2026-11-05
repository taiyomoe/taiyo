import type { ReaderDirection } from "@taiyomoe/schemas/reader-settings"
import * as stylex from "@stylexjs/stylex"
import { colors, motion } from "@taiyomoe/ui/styles/tokens.stylex"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  hit: {
    cursor: "pointer",
    pointerEvents: "auto",
    paddingTop: "0.75rem",
  },
  track: {
    backgroundColor: "rgb(128 128 128 / 32%)",
    position: "relative",
    height: "0.1875rem",
  },
  fill: (ratio: number) => ({
    insetBlock: 0,
    backgroundColor: colors.primary,
    position: "absolute",
    transitionDuration: motion.enter,
    transitionProperty: "width",
    width: `${ratio * 100}%`,
  }),
  ltr: {
    left: 0,
  },
  rtl: {
    right: 0,
  },
})

export function BarProgress({
  pageCount,
  visible,
  direction,
  onSeek,
}: {
  pageCount: number
  visible: readonly number[]
  direction: ReaderDirection
  onSeek: (index: number) => void
}) {
  const last = Math.max(...visible)

  return (
    <div
      aria-label={m.reader_page_of({ page: last + 1, total: pageCount })}
      aria-valuemax={pageCount}
      aria-valuemin={1}
      aria-valuenow={last + 1}
      onClick={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        const ratio = (event.clientX - rect.left) / rect.width
        const position = direction === "rtl" ? 1 - ratio : ratio

        onSeek(Math.min(pageCount - 1, Math.floor(position * pageCount)))
      }}
      role="progressbar"
      sx={styles.hit}
    >
      <div sx={styles.track}>
        <div
          sx={[styles.fill((last + 1) / pageCount), direction === "rtl" ? styles.rtl : styles.ltr]}
        />
      </div>
    </div>
  )
}
