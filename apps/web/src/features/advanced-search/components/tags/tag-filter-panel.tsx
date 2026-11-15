import * as stylex from "@stylexjs/stylex"
import { Search } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@taiyomoe/ui/components/ui/input-group"
import { ScrollArea } from "@taiyomoe/ui/components/ui/scroll-area"
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@taiyomoe/ui/components/ui/segmented-control"
import { breakpoints, colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { useId, useMemo, useState } from "react"
import type { AdvancedSearch } from "@/features/advanced-search/lib/advanced-search"
import { controlStyles } from "@/features/advanced-search/components/control-styles"
import { TagHint } from "@/features/advanced-search/components/tags/tag-hint"
import { TagSection } from "@/features/advanced-search/components/tags/tag-section"
import {
  filterTagSections,
  getTagSections,
  nextTagState,
  setTagState,
  type TagKey,
} from "@/features/advanced-search/lib/search-tags"
import { getContentLanguage } from "@/lib/locale"
import { m } from "@/paraglide/messages"

type TagSelection = Pick<AdvancedSearch, "tags" | "excludedTags" | "tagMode">

const styles = stylex.create({
  panel: {
    gap: "0.75rem",
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
  },
  header: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    flexWrap: { default: "wrap", [breakpoints.sm]: "nowrap" },
  },
  search: {
    flexBasis: { default: "100%", [breakpoints.sm]: "auto" },
    flexGrow: 1,
    minWidth: 0,
  },
  searchIcon: {
    color: colors.mutedForeground,
  },
  mode: {
    gap: "0.5rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    fontSize: "0.8125rem",
    whiteSpace: "nowrap",
  },
  body: {
    maxHeight: "min(30rem, calc(var(--available-height) - 9rem))",
  },
  sections: {
    gap: "1.25rem",
    display: "flex",
    flexDirection: "column",
    paddingBottom: "0.25rem",
    paddingRight: "0.5rem",
  },
  empty: {
    margin: 0,
    paddingBlock: "2rem",
    color: colors.mutedForeground,
    fontSize: "0.875rem",
    textAlign: "center",
  },
})

export function TagFilterPanel({
  selection,
  showAdult,
  onChange,
}: {
  selection: TagSelection
  showAdult: boolean
  onChange: (selection: Partial<TagSelection>) => void
}) {
  const [query, setQuery] = useState("")
  const modeLabelId = useId()
  const sections = useMemo(() => getTagSections(getContentLanguage()), [])
  const visible = filterTagSections(
    sections,
    query,
    (tag) =>
      showAdult ||
      !tag.isAdult ||
      selection.tags.includes(tag.key) ||
      selection.excludedTags.includes(tag.key),
  )
  const stateOf = (key: TagKey) => {
    if (selection.tags.includes(key)) {
      return "include"
    }

    return selection.excludedTags.includes(key) ? "exclude" : undefined
  }

  return (
    <div sx={styles.panel}>
      <div sx={styles.header}>
        <InputGroup sx={styles.search}>
          <InputGroupAddon align="inline-start">
            <Search {...stylex.props(styles.searchIcon)} />
          </InputGroupAddon>
          <InputGroupInput
            aria-label={m.search_tags_search()}
            autoComplete="off"
            onChange={(event) => {
              setQuery(event.target.value)
            }}
            placeholder={m.search_tags_search()}
            type="search"
            value={query}
          />
        </InputGroup>
        <div sx={styles.mode}>
          <span id={modeLabelId}>{m.search_tags_match()}</span>
          <SegmentedControl
            aria-labelledby={modeLabelId}
            onValueChange={(value) => {
              onChange({ tagMode: value === "any" ? "any" : "all" })
            }}
            value={selection.tagMode}
          >
            <SegmentedControlItem value="all">{m.search_tags_match_all()}</SegmentedControlItem>
            <SegmentedControlItem value="any">{m.search_tags_match_any()}</SegmentedControlItem>
          </SegmentedControl>
        </div>
        <Button
          disabled={selection.tags.length === 0 && selection.excludedTags.length === 0}
          onClick={() => {
            onChange({ tags: [], excludedTags: [] })
          }}
          size="lg"
          sx={controlStyles.height}
          variant="destructive-outline"
        >
          {m.search_tags_reset()}
        </Button>
      </div>
      <TagHint />
      <ScrollArea scrollFade sx={styles.body}>
        {visible.length === 0 ? (
          <p sx={styles.empty}>{m.search_tags_none()}</p>
        ) : (
          <div sx={styles.sections}>
            {visible.map((section) => (
              <TagSection
                key={section.id}
                onToggle={(key) => {
                  onChange(setTagState(selection, key, nextTagState(stateOf(key))))
                }}
                section={section}
                stateOf={stateOf}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
