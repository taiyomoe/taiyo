import * as stylex from "@stylexjs/stylex"
import { Grid, List, Rows } from "@taiyomoe/ui/components/icons"
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@taiyomoe/ui/components/ui/segmented-control"
import {
  Tooltip,
  TooltipPopup,
  TooltipPrimitive,
  TooltipTrigger,
} from "@taiyomoe/ui/components/ui/tooltip"
import { useAdvancedSearch } from "@/features/advanced-search/hooks/use-advanced-search"
import { SEARCH_VIEWS, type SearchView } from "@/features/advanced-search/lib/advanced-search"
import { m } from "@/paraglide/messages"

const VIEWS = [
  { value: "list", label: m.search_view_list, icon: List },
  { value: "cards", label: m.search_view_cards, icon: Rows },
  { value: "grid", label: m.search_view_grid, icon: Grid },
] as const satisfies Array<{ value: SearchView; label: () => string; icon: unknown }>
const styles = stylex.create({
  item: {
    paddingInline: "0.625rem",
  },
})
const viewTooltip = TooltipPrimitive.createHandle<string>()
const isView = (value: unknown): value is SearchView => SEARCH_VIEWS.some((view) => view === value)

export function ViewSwitcher() {
  const { search, update } = useAdvancedSearch()

  return (
    <>
      <SegmentedControl
        aria-label={m.search_view()}
        onValueChange={(value) => {
          if (isView(value)) {
            void update((previous) => ({ view: value, page: previous.page }))
          }
        }}
        value={search.view}
      >
        {VIEWS.map(({ value, label, icon: Icon }) => (
          <TooltipTrigger
            key={value}
            delay={300}
            handle={viewTooltip}
            payload={label()}
            render={<SegmentedControlItem aria-label={label()} sx={styles.item} value={value} />}
          >
            <Icon size={18} />
          </TooltipTrigger>
        ))}
      </SegmentedControl>
      <Tooltip handle={viewTooltip}>
        {({ payload }) => (
          <TooltipPopup arrow side="top">
            {payload}
          </TooltipPopup>
        )}
      </Tooltip>
    </>
  )
}
