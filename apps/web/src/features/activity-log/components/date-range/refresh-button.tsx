import * as stylex from "@stylexjs/stylex"
import { Refresh, Spinner } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { activityLogContainers } from "@/features/activity-log/components/activity-log.stylex"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  refresh: {
    flexShrink: 0,
    minHeight: "2.75rem",
  },
  refreshLabel: {
    display: {
      default: "none",
      [activityLogContainers.rangeLabel]: "inline",
    },
  },
  spin: {
    animationDuration: "900ms",
    animationIterationCount: "infinite",
    animationName: stylex.keyframes({ to: { transform: "rotate(360deg)" } }),
    animationTimingFunction: "linear",
  },
})

export function RefreshButton({
  fetching,
  onRefresh,
}: {
  fetching: boolean
  onRefresh: () => void
}) {
  return (
    <Button aria-label={m.activity_refresh()} onClick={onRefresh} size="lg" sx={styles.refresh}>
      {fetching ? <Spinner {...stylex.props(styles.spin)} /> : <Refresh />}
      <span sx={styles.refreshLabel}>{m.activity_refresh()}</span>
    </Button>
  )
}
