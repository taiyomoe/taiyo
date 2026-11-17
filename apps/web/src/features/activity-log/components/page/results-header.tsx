import * as stylex from "@stylexjs/stylex"
import { Switch } from "@taiyomoe/ui/components/ui/switch"
import { sceneFont } from "@taiyomoe/ui/styles/scene.stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import type { UpdateSearch } from "@/features/activity-log/hooks/use-activity-log"
import { formatCount } from "@/features/activity-log/lib/format"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  resultsHeader: {
    gap: "0.75rem",
    paddingInline: "0.875rem",
    alignItems: "flex-start",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBlockEnd: "0.75rem",
    paddingBlockStart: "1rem",
  },
  resultsHeading: {
    gap: "0.25rem",
    display: "flex",
    flexDirection: "column",
  },
  groupToggle: {
    gap: "0.625rem",
    alignItems: "center",
    color: colors.mutedForeground,
    cursor: "pointer",
    display: "inline-flex",
    fontSize: "0.875rem",
  },
  resultsTitle: {
    margin: 0,
    fontFamily: sceneFont.display,
    fontSize: "1.375rem",
    fontWeight: 700,
    letterSpacing: "-0.01em",
  },
  resultsMeta: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.875rem",
  },
})

export function ResultsHeader({
  entryCount,
  grouping,
  loaded,
  rangeLabel,
  onUpdate,
}: {
  entryCount: number
  grouping: boolean
  loaded: boolean
  rangeLabel: string
  onUpdate: UpdateSearch
}) {
  return (
    <header sx={styles.resultsHeader}>
      <div sx={styles.resultsHeading}>
        <h2 sx={styles.resultsTitle}>
          {loaded
            ? m.activity_results_count({ count: formatCount(entryCount) })
            : m.activity_results_title()}
        </h2>
        <p sx={styles.resultsMeta}>{rangeLabel}</p>
      </div>
      <label sx={styles.groupToggle}>
        <Switch
          checked={grouping}
          onCheckedChange={(checked) => {
            onUpdate({ grouping: checked ? undefined : "off" })
          }}
        />
        {m.activity_group_toggle()}
      </label>
    </header>
  )
}
