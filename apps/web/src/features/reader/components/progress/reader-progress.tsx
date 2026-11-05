import type { ProgressStyle, ReaderDirection } from "@taiyomoe/schemas/reader-settings"
import * as stylex from "@stylexjs/stylex"
import { BarProgress } from "@/features/reader/components/progress/bar-progress"
import { SegmentedProgress } from "@/features/reader/components/progress/segmented-progress"
import { TextProgress } from "@/features/reader/components/progress/text-progress"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  root: {
    insetInline: 0,
    pointerEvents: "none",
    position: "fixed",
    zIndex: 10,
    bottom: 0,
    paddingBottom: "env(safe-area-inset-bottom)",
  },
})

export function ReaderProgress({
  style,
  pageCount,
  visible,
  loaded,
  direction,
  onSeek,
}: {
  style: ProgressStyle
  pageCount: number
  visible: readonly number[]
  loaded: ReadonlySet<number>
  direction: ReaderDirection
  onSeek: (index: number) => void
}) {
  if (style === "hidden") {
    return null
  }

  const last = Math.max(...visible)
  const first = Math.min(...visible)
  const pages = first === last ? `${last + 1}` : `${first + 1}–${last + 1}`

  return (
    <div sx={styles.root}>
      {style === "segments" ? (
        <SegmentedProgress
          direction={direction}
          loaded={loaded}
          onSeek={onSeek}
          pageCount={pageCount}
          visible={visible}
        />
      ) : null}
      {style === "bar" ? (
        <BarProgress
          direction={direction}
          onSeek={onSeek}
          pageCount={pageCount}
          visible={visible}
        />
      ) : null}
      {style === "counter" ? (
        <TextProgress label={m.reader_page_of({ page: pages, total: pageCount })} />
      ) : null}
      {style === "percent" ? (
        <TextProgress
          label={m.reader_percent({ value: Math.round(((last + 1) / pageCount) * 100) })}
        />
      ) : null}
    </div>
  )
}
