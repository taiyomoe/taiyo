import * as stylex from "@stylexjs/stylex"
import { Popover, PopoverPopup, PopoverTrigger } from "@taiyomoe/ui/components/ui/popover"
import { SelectButton } from "@taiyomoe/ui/components/ui/select"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { useId } from "react"
import type { AdvancedSearch } from "@/features/advanced-search/lib/advanced-search"
import { FilterField } from "@/features/advanced-search/components/filters/filter-field"
import { TagFilterPanel } from "@/features/advanced-search/components/tags/tag-filter-panel"
import { getTagName } from "@/features/advanced-search/lib/search-tags"
import { getContentLanguage } from "@/lib/locale"
import { m } from "@/paraglide/messages"

type TagSelection = Pick<AdvancedSearch, "tags" | "excludedTags" | "tagMode">

const VISIBLE_NAMES = 2
const styles = stylex.create({
  trigger: {
    width: "100%",
  },
  popup: {
    width: "min(56rem, calc(100vw - 2rem))",
  },
  counts: {
    gap: "0.375rem",
    display: "inline-flex",
    fontSize: "0.75rem",
    fontVariantNumeric: "tabular-nums",
    fontWeight: 600,
  },
  included: {
    color: colors.success,
  },
  excluded: {
    color: colors.destructive,
  },
  empty: {
    color: colors.mutedForeground,
  },
  summary: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    minWidth: 0,
  },
})
const listNames = (keys: AdvancedSearch["tags"]) => {
  const names = keys
    .slice(0, VISIBLE_NAMES)
    .map((key) => getTagName(key, getContentLanguage()))
    .join(", ")
  const hidden = keys.length - VISIBLE_NAMES

  return hidden > 0 ? m.search_tags_list_more({ names, count: hidden }) : names
}
const describeSelection = ({ tags, excludedTags, tagMode }: TagSelection) => {
  const includeMessage =
    tagMode === "any" && tags.length > 1
      ? m.search_tags_summary_include_any
      : m.search_tags_summary_include
  const included = tags.length === 0 ? null : includeMessage({ tags: listNames(tags) })
  const excluded =
    excludedTags.length === 0
      ? null
      : m.search_tags_summary_exclude({ tags: listNames(excludedTags) })

  if (included !== null && excluded !== null) {
    return m.search_tags_summary_both({ included, excluded })
  }

  return (
    included ??
    (excluded === null
      ? null
      : m.search_tags_summary_exclude_only({ tags: listNames(excludedTags) }))
  )
}

export function TagFilter({
  selection,
  showAdult,
  onChange,
}: {
  selection: TagSelection
  showAdult: boolean
  onChange: (selection: Partial<TagSelection>) => void
}) {
  const labelId = useId()
  const summary = describeSelection(selection)
  const active = selection.tags.length > 0 || selection.excludedTags.length > 0

  return (
    <FilterField
      label={
        <>
          {m.search_filter_tags()}
          {active ? (
            <span sx={styles.counts}>
              {selection.tags.length > 0 ? (
                <span
                  aria-label={m.search_tags_included_count({ count: selection.tags.length })}
                  sx={styles.included}
                >
                  +{selection.tags.length}
                </span>
              ) : null}
              {selection.excludedTags.length > 0 ? (
                <span
                  aria-label={m.search_tags_excluded_count({
                    count: selection.excludedTags.length,
                  })}
                  sx={styles.excluded}
                >
                  −{selection.excludedTags.length}
                </span>
              ) : null}
            </span>
          ) : null}
        </>
      }
      labelId={labelId}
      onClear={
        active
          ? () => {
              onChange({ tags: [], excludedTags: [] })
            }
          : null
      }
    >
      <Popover>
        <PopoverTrigger aria-labelledby={labelId} render={<SelectButton sx={styles.trigger} />}>
          {summary === null ? (
            <span sx={styles.empty}>{m.search_filter_any()}</span>
          ) : (
            <span sx={styles.summary} title={summary}>
              {summary}
            </span>
          )}
        </PopoverTrigger>
        <PopoverPopup align="start" sx={styles.popup}>
          <TagFilterPanel onChange={onChange} selection={selection} showAdult={showAdult} />
        </PopoverPopup>
      </Popover>
    </FilterField>
  )
}
