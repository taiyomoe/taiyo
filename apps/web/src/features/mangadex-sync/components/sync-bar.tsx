import * as stylex from "@stylexjs/stylex"
import { Refresh } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { colors, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  bar: {
    padding: "0.75rem",
    borderColor: colors.border,
    borderRadius: radius.xxl,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "1rem",
    alignItems: "center",
    backgroundColor: colors.card,
    boxShadow: shadows.raised,
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingInlineStart: "1.25rem",
    position: "sticky",
    zIndex: 1,
    bottom: "1rem",
  },
  summary: {
    color: colors.mutedForeground,
    fontSize: "0.875rem",
  },
  actions: {
    gap: "0.5rem",
    display: "flex",
  },
})

export function SyncBar({
  picked,
  covers,
  chapters,
  pending,
  refreshing,
  onRefresh,
  onStart,
}: {
  picked: number
  covers: number
  chapters: number
  pending: boolean
  refreshing: boolean
  onRefresh: () => void
  onStart: () => void
}) {
  return (
    <div sx={styles.bar}>
      <span sx={styles.summary}>
        {picked === 0
          ? m.mangadex_bar_nothing()
          : m.mangadex_bar_summary({ count: picked, covers, chapters })}
      </span>
      <div sx={styles.actions}>
        <Button disabled={refreshing || pending} onClick={onRefresh} variant="outline">
          <Refresh />
          {m.mangadex_refresh()}
        </Button>
        <Button disabled={picked === 0 || pending} onClick={onStart}>
          {m.mangadex_start()}
        </Button>
      </div>
    </div>
  )
}
