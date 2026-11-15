import * as stylex from "@stylexjs/stylex"
import { ChevronDown, ChevronUp, Close, Search } from "@taiyomoe/ui/components/icons"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@taiyomoe/ui/components/ui/input-group"
import { breakpoints, colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { useEffect, useRef, useState } from "react"
import { controlStyles } from "@/features/advanced-search/components/control-styles"
import { useAdvancedSearch } from "@/features/advanced-search/hooks/use-advanced-search"
import { countActiveFilters } from "@/features/advanced-search/lib/advanced-search"
import { m } from "@/paraglide/messages"

const QUERY_DEBOUNCE_MS = 350
const styles = stylex.create({
  bar: {
    gap: "0.75rem",
    display: "flex",
    flexDirection: { default: "column", [breakpoints.sm]: "row" },
  },
  form: {
    flexGrow: 1,
    minWidth: 0,
  },
  icon: {
    color: colors.mutedForeground,
  },
  toggle: {
    flexShrink: 0,
    minWidth: { default: null, [breakpoints.sm]: "10.5rem" },
  },
  count: {
    minWidth: "1.25rem",
  },
})

export function SearchBar({
  filtersOpen,
  onFiltersOpenChange,
}: {
  filtersOpen: boolean
  onFiltersOpenChange: (open: boolean) => void
}) {
  const { search, update } = useAdvancedSearch()
  const [draft, setDraft] = useState(search.q)
  const sent = useRef(search.q)
  const activeFilters = countActiveFilters(search)

  useEffect(() => {
    if (search.q !== sent.current) {
      sent.current = search.q
      setDraft(search.q)
    }
  }, [search.q])

  useEffect(() => {
    const next = draft.trim()
    const timeout =
      next === sent.current
        ? undefined
        : setTimeout(() => {
            sent.current = next
            void update({ q: next })
          }, QUERY_DEBOUNCE_MS)

    return () => {
      clearTimeout(timeout)
    }
  }, [draft, update])

  return (
    <div sx={styles.bar}>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          sent.current = draft.trim()
          void update({ q: draft.trim() })
        }}
        role="search"
        sx={styles.form}
      >
        <InputGroup>
          <InputGroupAddon align="inline-start">
            <Search {...stylex.props(styles.icon)} />
          </InputGroupAddon>
          <InputGroupInput
            aria-label={m.search_query_label()}
            autoComplete="off"
            enterKeyHint="search"
            onChange={(event) => {
              setDraft(event.target.value)
            }}
            placeholder={m.search_query_placeholder()}
            type="search"
            value={draft}
          />
          {draft === "" ? null : (
            <InputGroupAddon align="inline-end">
              <Button
                aria-label={m.search_query_clear()}
                onClick={() => {
                  setDraft("")
                  sent.current = ""
                  void update({ q: "" })
                }}
                size="icon-xs"
                variant="ghost"
              >
                <Close />
              </Button>
            </InputGroupAddon>
          )}
        </InputGroup>
      </form>
      <Button
        aria-expanded={filtersOpen}
        onClick={() => {
          onFiltersOpenChange(!filtersOpen)
        }}
        size="lg"
        sx={[controlStyles.height, styles.toggle]}
        variant={filtersOpen ? "default" : "secondary"}
      >
        {filtersOpen ? <ChevronUp /> : <ChevronDown />}
        {filtersOpen ? m.search_filters_hide() : m.search_filters_show()}
        {!filtersOpen && activeFilters > 0 ? (
          <Badge size="sm" sx={styles.count} variant="default">
            {activeFilters}
          </Badge>
        ) : null}
      </Button>
    </div>
  )
}
