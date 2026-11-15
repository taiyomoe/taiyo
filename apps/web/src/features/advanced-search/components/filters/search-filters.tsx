import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { MultiSelectFilter } from "@/features/advanced-search/components/filters/multi-select-filter"
import { SortFilter } from "@/features/advanced-search/components/filters/sort-filter"
import { StaffFilter } from "@/features/advanced-search/components/filters/staff-filter"
import { TranslatedFilter } from "@/features/advanced-search/components/filters/translated-filter"
import { YearFilter } from "@/features/advanced-search/components/filters/year-filter"
import { TagFilter } from "@/features/advanced-search/components/tags/tag-filter"
import { useAdvancedSearch } from "@/features/advanced-search/hooks/use-advanced-search"
import {
  DEMOGRAPHIC_OPTIONS,
  ORIGIN_OPTIONS,
  RATING_OPTIONS,
  STATUS_OPTIONS,
  TYPE_OPTIONS,
} from "@/features/advanced-search/lib/filter-options"
import { CONTENT_RATING_LABELS } from "@/features/media/lib/media-labels"
import { useSettings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  grid: {
    columnGap: "1rem",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 13.5rem), 1fr))",
    rowGap: "1.25rem",
  },
  inherited: {
    color: colors.mutedForeground,
  },
})

export function SearchFilters() {
  const { search, update } = useAdvancedSearch()
  const { contentRatings } = useSettings()
  const ratings = search.rating.length > 0 ? search.rating : contentRatings

  return (
    <div aria-label={m.search_filters_label()} role="group" sx={styles.grid}>
      <SortFilter
        onValueChange={(sort) => {
          void update({ sort })
        }}
        value={search.sort}
      />
      <TagFilter
        onChange={(selection) => {
          void update(selection)
        }}
        selection={search}
        showAdult={ratings.includes("NSFW") || ratings.includes("NSFL")}
      />
      <MultiSelectFilter
        empty={
          <span sx={styles.inherited}>
            {contentRatings.map((rating) => CONTENT_RATING_LABELS[rating]()).join(", ")}
          </span>
        }
        label={m.search_filter_rating()}
        onValueChange={(rating) => {
          void update({ rating })
        }}
        options={RATING_OPTIONS}
        value={search.rating}
      />
      <MultiSelectFilter
        label={m.search_filter_type()}
        onValueChange={(type) => {
          void update({ type })
        }}
        options={TYPE_OPTIONS}
        value={search.type}
      />
      <MultiSelectFilter
        label={m.search_filter_demographic()}
        onValueChange={(demographic) => {
          void update({ demographic })
        }}
        options={DEMOGRAPHIC_OPTIONS}
        value={search.demographic}
      />
      <StaffFilter
        label={m.search_filter_authors()}
        onValueChange={(authors) => {
          void update({ authors })
        }}
        searchPlaceholder={m.search_authors_placeholder()}
        value={search.authors}
      />
      <StaffFilter
        label={m.search_filter_artists()}
        onValueChange={(artists) => {
          void update({ artists })
        }}
        searchPlaceholder={m.search_artists_placeholder()}
        value={search.artists}
      />
      <MultiSelectFilter
        label={m.search_filter_origin()}
        onValueChange={(origin) => {
          void update({ origin })
        }}
        options={ORIGIN_OPTIONS}
        value={search.origin}
      />
      <YearFilter
        onValueChange={(year) => {
          void update({ year })
        }}
        value={search.year}
      />
      <MultiSelectFilter
        label={m.search_filter_status()}
        onValueChange={(status) => {
          void update({ status })
        }}
        options={STATUS_OPTIONS}
        value={search.status}
      />
      <TranslatedFilter
        languages={search.languages}
        onChange={(value) => {
          void update(value)
        }}
        translated={search.translated}
      />
    </div>
  )
}
