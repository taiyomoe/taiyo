import * as stylex from "@stylexjs/stylex"
import { Switch } from "@taiyomoe/ui/components/ui/switch"
import { Tabs, TabsList, TabsTab } from "@taiyomoe/ui/components/ui/tabs"
import { colors, containers } from "@taiyomoe/ui/styles/tokens.stylex"
import { useNavigate } from "@tanstack/react-router"
import {
  DASHBOARD_RANGE_LABELS,
  DEFAULT_DASHBOARD_RANGE,
  DASHBOARD_RANGES,
  type DashboardRange,
} from "@/features/dashboard/lib/dashboard"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  controls: {
    gap: "1rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  compare: {
    borderColor: colors.border,
    borderRadius: "9999px",
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.75rem",
    paddingBlock: "0.5rem",
    alignItems: "center",
    backgroundColor: colors.card,
    cursor: "pointer",
    display: "inline-flex",
    fontSize: "0.9375rem",
    fontWeight: 500,
    paddingInlineEnd: "1.125rem",
    paddingInlineStart: "0.625rem",
  },
  ranges: {
    scrollbarWidth: "none",
    maxWidth: "100%",
    overflowX: "auto",
  },
  rangeLong: {
    display: {
      default: "none",
      [containers.lg]: "inline",
    },
  },
  rangeShort: {
    display: {
      default: "inline",
      [containers.lg]: "none",
    },
  },
})
const isRange = (value: unknown): value is DashboardRange =>
  DASHBOARD_RANGES.some((range) => range === value)

export function OverviewControls({ range, compare }: { range: DashboardRange; compare: boolean }) {
  const navigate = useNavigate({ from: "/dashboard/" })

  return (
    <div sx={styles.controls}>
      <label sx={styles.compare}>
        <Switch
          checked={compare}
          onCheckedChange={(checked) => {
            void navigate({
              search: (previous) => ({ ...previous, compare: checked ? undefined : false }),
              resetScroll: false,
            })
          }}
        />
        {m.dashboard_compare()}
      </label>
      <Tabs
        onValueChange={(value) => {
          if (isRange(value)) {
            void navigate({
              search: (previous) => ({
                ...previous,
                range: value === DEFAULT_DASHBOARD_RANGE ? undefined : value,
              }),
              resetScroll: false,
            })
          }
        }}
        sx={styles.ranges}
        value={range}
      >
        <TabsList aria-label={m.dashboard_range_label()}>
          {DASHBOARD_RANGES.map((value) => (
            <TabsTab aria-label={DASHBOARD_RANGE_LABELS[value].tab()} key={value} value={value}>
              <span sx={styles.rangeLong}>{DASHBOARD_RANGE_LABELS[value].tab()}</span>
              <span sx={styles.rangeShort}>{DASHBOARD_RANGE_LABELS[value].short()}</span>
            </TabsTab>
          ))}
        </TabsList>
      </Tabs>
    </div>
  )
}
