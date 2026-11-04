import * as stylex from "@stylexjs/stylex"
import { colors, motion, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import type { ReaderDirection } from "@/features/reader/lib/reader-settings"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  track: {
    gap: "2px",
    paddingInline: "0.5rem",
    display: "flex",
    pointerEvents: "auto",
  },
  rtl: {
    flexDirection: "row-reverse",
  },
  segment: {
    padding: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
    cursor: "pointer",
    flexBasis: 0,
    flexGrow: 1,
    minWidth: 0,
    paddingTop: "0.75rem",
    "::after": {
      borderRadius: radius.full,
      backgroundColor: "rgb(128 128 128 / 32%)",
      content: '""',
      display: "block",
      transitionDuration: motion.enter,
      transitionProperty: "height, background-color",
      height: { default: "0.25rem", ":hover": "0.5rem" },
    },
  },
  loaded: {
    "::after": {
      backgroundColor: "rgb(128 128 128 / 56%)",
    },
  },
  read: {
    "::after": {
      backgroundColor: `color-mix(in srgb, ${colors.primary} 55%, transparent)`,
    },
  },
  current: {
    "::after": {
      backgroundColor: colors.primary,
    },
  },
})

export function SegmentedProgress({
  pageCount,
  visible,
  loaded,
  direction,
  onSeek,
}: {
  pageCount: number
  visible: readonly number[]
  loaded: ReadonlySet<number>
  direction: ReaderDirection
  onSeek: (index: number) => void
}) {
  const last = Math.max(...visible)

  return (
    <div sx={[styles.track, direction === "rtl" && styles.rtl]}>
      {Array.from({ length: pageCount }, (_, index) => (
        <button
          aria-current={visible.includes(index) ? "page" : undefined}
          aria-label={m.reader_page_label({ page: index + 1 })}
          key={index}
          onClick={() => {
            onSeek(index)
          }}
          sx={[
            styles.segment,
            loaded.has(index) && styles.loaded,
            index < last && styles.read,
            visible.includes(index) && styles.current,
          ]}
          title={m.reader_page_label({ page: index + 1 })}
          type="button"
        />
      ))}
    </div>
  )
}
