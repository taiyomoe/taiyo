import * as stylex from "@stylexjs/stylex"
import { ArrowLeft } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { breakpoints, colors, font } from "@taiyomoe/ui/styles/tokens.stylex"
import { getRouteApi, Link } from "@tanstack/react-router"
import { useState } from "react"
import { layout } from "@/components/layout/layout.stylex"
import { sceneFont } from "@/components/scene/scene.stylex"
import { AppShell } from "@/components/shell/app-shell"
import { SearchFilters } from "@/features/advanced-search/components/filters/search-filters"
import { SearchResults } from "@/features/advanced-search/components/results/search-results"
import { SearchBar } from "@/features/advanced-search/components/search-bar"
import { SearchToolbar } from "@/features/advanced-search/components/search-toolbar"
import { useAdvancedSearch } from "@/features/advanced-search/hooks/use-advanced-search"
import { countActiveFilters } from "@/features/advanced-search/lib/advanced-search"
import { m } from "@/paraglide/messages"

const routeApi = getRouteApi("/titles")
const styles = stylex.create({
  page: {
    gap: "1.25rem",
    paddingBlock: "2rem",
    paddingInline: layout.gutter,
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  header: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
  },
  back: {
    color: colors.mutedForeground,
    marginInlineStart: { default: "-0.75rem", [breakpoints.sm]: "-0.6875rem" },
  },
  heading: {
    margin: 0,
    color: colors.foreground,
    fontFamily: sceneFont.display,
    fontSize: { default: "1.75rem", [breakpoints.md]: "2.25rem" },
    fontWeight: font.weightBold,
    letterSpacing: "-0.02em",
  },
  controls: {
    gap: "1rem",
    display: "flex",
    flexDirection: "column",
  },
})

export function AdvancedSearchPage() {
  const { session } = routeApi.useRouteContext()
  const { search } = useAdvancedSearch()
  const [filtersOpen, setFiltersOpen] = useState(() => countActiveFilters(search) > 0)

  return (
    <AppShell user={session?.user ?? null}>
      <div sx={styles.page}>
        <div sx={styles.header}>
          <Button
            aria-label={m.search_back()}
            render={<Link to="/" />}
            size="icon-xl"
            sx={styles.back}
            variant="ghost"
          >
            <ArrowLeft />
          </Button>
          <h1 sx={styles.heading}>{m.search_heading()}</h1>
        </div>
        <div sx={styles.controls}>
          <SearchBar filtersOpen={filtersOpen} onFiltersOpenChange={setFiltersOpen} />
          {filtersOpen ? <SearchFilters /> : null}
          <SearchToolbar />
        </div>
        <SearchResults />
      </div>
    </AppShell>
  )
}
