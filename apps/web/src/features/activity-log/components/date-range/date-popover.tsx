import * as stylex from "@stylexjs/stylex"
import { Popover, PopoverPopup, PopoverTrigger } from "@taiyomoe/ui/components/ui/popover"
import { Tabs, TabsList, TabsPanel, TabsTab } from "@taiyomoe/ui/components/ui/tabs"
import { useState } from "react"
import { AbsoluteTab } from "@/features/activity-log/components/date-range/absolute-tab"
import { dateRangeStyles } from "@/features/activity-log/components/date-range/date-range-styles"
import { NowTab } from "@/features/activity-log/components/date-range/now-tab"
import { RelativeTab } from "@/features/activity-log/components/date-range/relative-tab"
import { parseDateMath, resolveDateMath } from "@/features/activity-log/lib/datemath"
import { describeDateMath, formatDateTime } from "@/features/activity-log/lib/format"
import { useNow } from "@/hooks/use-now"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  edge: {
    overflow: "hidden",
    flexBasis: "auto",
    flexGrow: "1",
    flexShrink: "1",
    justifyContent: "center",
    textOverflow: "ellipsis",
  },
  datePopup: {
    padding: "0.25rem",
    gap: "0.875rem",
    display: "flex",
    flexDirection: "column",
    width: "min(21rem, calc(100vw - 2rem))",
  },
})

export function DatePopover({
  value,
  edge,
  onApply,
}: {
  value: string
  edge: "start" | "end"
  onApply: (value: string) => void
}) {
  const parsed = parseDateMath(value)
  const now = useNow()
  const resolved = resolveDateMath(value, { now, roundUp: edge === "end" }) ?? new Date(now)
  const [tab, setTab] = useState<string>(parsed?.kind === "absolute" ? "absolute" : "relative")
  const [text, setText] = useState(formatDateTime(resolved))

  return (
    <Popover
      onOpenChange={(open) => {
        if (open) {
          let initialTab = value === "now" ? "now" : "relative"

          if (parsed?.kind === "absolute") {
            initialTab = "absolute"
          }

          setTab(initialTab)
          setText(formatDateTime(resolved))
        }
      }}
    >
      <PopoverTrigger
        aria-label={edge === "start" ? m.activity_start_date() : m.activity_end_date()}
        sx={[dateRangeStyles.segment, styles.edge, edge === "end" && dateRangeStyles.last]}
      >
        {describeDateMath(value)}
      </PopoverTrigger>
      <PopoverPopup align={edge === "start" ? "start" : "end"}>
        <div sx={styles.datePopup}>
          <Tabs
            onValueChange={(next) => {
              setTab(String(next))
            }}
            value={tab}
          >
            <TabsList>
              <TabsTab value="absolute">{m.activity_absolute()}</TabsTab>
              <TabsTab value="relative">{m.activity_relative()}</TabsTab>
              <TabsTab value="now">{m.activity_now()}</TabsTab>
            </TabsList>
            <TabsPanel value="absolute">
              <AbsoluteTab
                onApply={onApply}
                onTextChange={setText}
                resolved={resolved}
                text={text}
              />
            </TabsPanel>
            <TabsPanel value="relative">
              <RelativeTab onApply={onApply} parsed={parsed} resolved={resolved} />
            </TabsPanel>
            <TabsPanel value="now">
              <NowTab edge={edge} onApply={onApply} />
            </TabsPanel>
          </Tabs>
        </div>
      </PopoverPopup>
    </Popover>
  )
}
