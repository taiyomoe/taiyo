import type { IconProps } from "@taiyomoe/ui/components/icons"
import type { ReactElement } from "react"
import * as stylex from "@stylexjs/stylex"
import {
  CalendarArrowDown,
  History,
  Refresh,
  SortAZ,
  Sparkles,
  Star,
} from "@taiyomoe/ui/components/icons"
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@taiyomoe/ui/components/ui/select"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { getRouteApi } from "@tanstack/react-router"
import type { LibrarySort } from "@/features/library/api/library"
import { LIBRARY_SORTS } from "@/features/library/lib/library-search"
import { m } from "@/paraglide/messages"

const routeApi = getRouteApi("/library")
const SORT_OPTIONS: Record<
  LibrarySort,
  { label: () => string; icon: (props: IconProps) => ReactElement }
> = {
  read: { label: m.library_sort_read, icon: History },
  updated: { label: m.library_sort_updated, icon: Refresh },
  added: { label: m.library_sort_added, icon: CalendarArrowDown },
  released: { label: m.library_sort_released, icon: Sparkles },
  title: { label: m.library_sort_title, icon: SortAZ },
  score: { label: m.library_sort_score, icon: Star },
}
const styles = stylex.create({
  trigger: {
    minWidth: "12.5rem",
    width: "auto",
  },
  option: {
    gap: "0.625rem",
    alignItems: "center",
    display: "flex",
  },
  icon: {
    color: colors.mutedForeground,
    flexShrink: 0,
  },
})

function SortOption({ sort }: { sort: LibrarySort }) {
  const { label, icon: Icon } = SORT_OPTIONS[sort]

  return (
    <span sx={styles.option}>
      <Icon size={16} {...stylex.props(styles.icon)} />
      {label()}
    </span>
  )
}

export function LibrarySortSelect() {
  const navigate = routeApi.useNavigate()
  const search = routeApi.useSearch()
  const sort = search.sort ?? "read"

  return (
    <Select
      onValueChange={(next: LibrarySort | null) => {
        void navigate({
          resetScroll: false,
          search: {
            ...search,
            page: undefined,
            sort: next === null || next === "read" ? undefined : next,
          },
        })
      }}
      value={sort}
    >
      <SelectTrigger aria-label={m.library_sort_label()} size="sm" sx={styles.trigger}>
        <SelectValue>{() => <SortOption sort={sort} />}</SelectValue>
      </SelectTrigger>
      <SelectPopup>
        {LIBRARY_SORTS.map((value) => (
          <SelectItem key={value} value={value}>
            <SortOption sort={value} />
          </SelectItem>
        ))}
      </SelectPopup>
    </Select>
  )
}
