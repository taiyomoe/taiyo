import type { ReactElement } from "react"
import {
  CONTENT_RATINGS,
  MEDIA_COUNTRIES_OF_ORIGIN,
  MEDIA_DEMOGRAPHIES,
  MEDIA_STATUSES,
  MEDIA_TYPES,
} from "@taiyomoe/db/constants"
import {
  BookOpenText,
  CalendarArrowDown,
  CalendarArrowUp,
  ClockArrowDown,
  ClockArrowUp,
  Flame,
  type IconProps,
  Kissing,
  MoreCircle,
  Refresh,
  ShieldCheck,
  Skull,
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
import { CountryFlag } from "@/components/flags/flags"
import {
  CONTENT_RATING_LABELS,
  MEDIA_COUNTRY_LABELS,
  MEDIA_DEMOGRAPHY_LABELS,
  MEDIA_STATUS_LABELS,
  MEDIA_TYPE_LABELS,
} from "@/features/media/lib/media-labels"
import { m } from "@/paraglide/messages"

export type FilterOptionIcon = (props: IconProps) => ReactElement

export type FilterOption<T extends string> = {
  value: T
  label: () => string
  icon?: FilterOptionIcon | undefined
}

type Country = (typeof MEDIA_COUNTRIES_OF_ORIGIN)[number]

const toOptions = <T extends string>(
  values: readonly T[],
  labels: Record<T, () => string>,
  iconOf: (value: T) => FilterOptionIcon | undefined = () => undefined,
) => values.map((value) => ({ value, label: labels[value], icon: iconOf(value) }))
const flagIcon = (country: Country): FilterOptionIcon =>
  function Flag() {
    return <CountryFlag country={country} />
  }
const TYPE_ICONS: Record<(typeof MEDIA_TYPES)[number], FilterOptionIcon> = {
  MANGA: flagIcon("JAPAN"),
  MANHWA: flagIcon("KOREA"),
  MANHUA: flagIcon("CHINA"),
  LIGHT_NOVEL: BookOpenText,
  OTHER: MoreCircle,
}
const RATING_ICONS: Record<(typeof CONTENT_RATINGS)[number], FilterOptionIcon> = {
  NORMAL: ShieldCheck,
  SUGGESTIVE: Kissing,
  NSFW: Flame,
  NSFL: Skull,
}

export const TYPE_OPTIONS = toOptions(MEDIA_TYPES, MEDIA_TYPE_LABELS, (type) => TYPE_ICONS[type])

export const STATUS_OPTIONS = toOptions(MEDIA_STATUSES, MEDIA_STATUS_LABELS)

export const RATING_OPTIONS = toOptions(
  CONTENT_RATINGS,
  CONTENT_RATING_LABELS,
  (rating) => RATING_ICONS[rating],
)

export const DEMOGRAPHIC_OPTIONS = toOptions(MEDIA_DEMOGRAPHIES, MEDIA_DEMOGRAPHY_LABELS)

export const ORIGIN_OPTIONS = toOptions(MEDIA_COUNTRIES_OF_ORIGIN, MEDIA_COUNTRY_LABELS, flagIcon)

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
