import * as stylex from "@stylexjs/stylex"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { dateRangeStyles } from "@/features/activity-log/components/date-range/date-range-styles"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  nowText: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.875rem",
    lineHeight: 1.5,
  },
})

export function NowTab({
  edge,
  onApply,
}: {
  edge: "start" | "end"
  onApply: (value: string) => void
}) {
  return (
    <div sx={dateRangeStyles.panel}>
      <p sx={styles.nowText}>
        {edge === "start" ? m.activity_now_start_help() : m.activity_now_end_help()}
      </p>
      <Button
        onClick={() => {
          onApply("now")
        }}
        variant="secondary"
      >
        {edge === "start" ? m.activity_set_start_now() : m.activity_set_end_now()}
      </Button>
    </div>
  )
}
