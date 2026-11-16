import type { ReactElement } from "react"
import {
  CalendarArrowDown,
  CalendarArrowUp,
  ClockArrowDown,
  ClockArrowUp,
  type IconProps,
  Refresh,
  SortAscending,
  SortAZ,
  SortDescending,
  SortNineOne,
  SortOneNine,
  Sparkles,
  SortZA,
} from "@taiyomoe/ui/components/icons"
import type { SearchSort } from "@/features/advanced-search/lib/advanced-search"
import type { TagSectionId } from "@/features/advanced-search/lib/search-tags"
import { type OptionSet, tonedIcon } from "@/components/fields/option-select"
import {
  CONTENT_RATING_OPTIONS,
  MEDIA_COUNTRY_OPTIONS,
  MEDIA_DEMOGRAPHY_OPTIONS,
  MEDIA_STATUS_OPTIONS,
  MEDIA_TYPE_OPTIONS,
} from "@/features/media/lib/media-options"
import { m } from "@/paraglide/messages"

export type FilterOptionIcon = (props: IconProps) => ReactElement

export type FilterOption<T extends string> = {
  value: T
  label: () => string
  icon?: FilterOptionIcon | undefined
}

/** The filter chips read the same option sets as every select of the app. */
const toOptions = <T extends string>(options: OptionSet<T>): Array<FilterOption<T>> =>
  options.values.map((value) => ({
    value,
    label: () => options.label(value),
    icon: tonedIcon(options, value),
  }))

export const TYPE_OPTIONS = toOptions(MEDIA_TYPE_OPTIONS)

export const STATUS_OPTIONS = toOptions(MEDIA_STATUS_OPTIONS)

export const RATING_OPTIONS = toOptions(CONTENT_RATING_OPTIONS)

export const DEMOGRAPHIC_OPTIONS = toOptions(MEDIA_DEMOGRAPHY_OPTIONS)

export const ORIGIN_OPTIONS = toOptions(MEDIA_COUNTRY_OPTIONS)

export const SORT_OPTIONS = [
  { value: "relevance", label: m.search_sort_relevance, icon: Sparkles },
  { value: "followers", label: m.search_sort_followers, icon: SortDescending },
  { value: "followers-asc", label: m.search_sort_followers_asc, icon: SortAscending },
  { value: "latest", label: m.search_sort_latest, icon: ClockArrowDown },
  { value: "oldest", label: m.search_sort_oldest, icon: ClockArrowUp },
  { value: "updated", label: m.search_sort_updated, icon: Refresh },
  { value: "title", label: m.search_sort_title, icon: SortAZ },
  { value: "title-desc", label: m.search_sort_title_desc, icon: SortZA },
  { value: "chapters", label: m.search_sort_chapters, icon: SortNineOne },
  { value: "chapters-asc", label: m.search_sort_chapters_asc, icon: SortOneNine },
  { value: "year", label: m.search_sort_year, icon: CalendarArrowDown },
  { value: "year-asc", label: m.search_sort_year_asc, icon: CalendarArrowUp },
] as const satisfies Array<FilterOption<SearchSort>>

export const TAG_SECTION_LABELS: Record<TagSectionId, () => string> = {
  Genre: m.search_tags_section_genre,
  Theme: m.search_tags_section_theme,
  Technical: m.search_tags_section_format,
  Setting: m.search_tags_section_setting,
  Cast: m.search_tags_section_cast,
  Demographic: m.search_tags_section_demographic,
  "Sexual Content": m.search_tags_section_sexual,
}
