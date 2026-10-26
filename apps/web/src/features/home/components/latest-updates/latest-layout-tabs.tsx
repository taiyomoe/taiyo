import * as stylex from "@stylexjs/stylex"
import { Grid, List, Rows } from "@taiyomoe/ui/components/icons"
import { Tabs, TabsList, TabsTab } from "@taiyomoe/ui/components/ui/tabs"
import {
  Tooltip,
  TooltipPopup,
  TooltipPrimitive,
  TooltipTrigger,
} from "@taiyomoe/ui/components/ui/tooltip"
import { type LatestUpdatesLayout, useUpdateSettings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

const LAYOUTS = [
  { value: "LIST", label: m.home_latest_layout_list, icon: List },
  { value: "GRID", label: m.home_latest_layout_grid, icon: Grid },
  { value: "COMPACT", label: m.home_latest_layout_compact, icon: Rows },
] as const satisfies Array<{ value: LatestUpdatesLayout; label: () => string; icon: unknown }>
const styles = stylex.create({
  tab: {
    paddingInline: "0.625rem",
  },
})
const layoutTooltip = TooltipPrimitive.createHandle<string>()
const isLayout = (value: unknown): value is LatestUpdatesLayout =>
  LAYOUTS.some((layout) => layout.value === value)

export function LatestLayoutTabs({ layout }: { layout: LatestUpdatesLayout }) {
  const updateSettings = useUpdateSettings()

  return (
    <>
      <Tabs
        onValueChange={(value) => {
          if (isLayout(value)) {
            updateSettings.mutate({ latestUpdatesLayout: value })
          }
        }}
        value={layout}
      >
        <TabsList aria-label={m.home_latest_layout()}>
          {LAYOUTS.map(({ value, label, icon: Icon }) => (
            <TooltipTrigger
              key={value}
              delay={300}
              handle={layoutTooltip}
              payload={label()}
              render={<TabsTab aria-label={label()} sx={styles.tab} value={value} />}
            >
              <Icon size={18} />
            </TooltipTrigger>
          ))}
        </TabsList>
      </Tabs>
      <Tooltip handle={layoutTooltip}>
        {({ payload }) => (
          <TooltipPopup arrow side="top">
            {payload}
          </TooltipPopup>
        )}
      </Tooltip>
    </>
  )
}
