import * as stylex from "@stylexjs/stylex"
import { Languages, Search } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@taiyomoe/ui/components/ui/empty"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@taiyomoe/ui/components/ui/input-group"
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@taiyomoe/ui/components/ui/select"
import { Switch } from "@taiyomoe/ui/components/ui/switch"
import { Tabs, TabsList, TabsTab } from "@taiyomoe/ui/components/ui/tabs"
import { colors, font, motion, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { Link, getRouteApi } from "@tanstack/react-router"
import { useDeferredValue, useEffect, useEffectEvent, useRef, useState } from "react"
import { ChapterList, ChapterListSkeleton } from "@/components/chapters/chapter-list"
import { LanguageFlag, getLanguageName } from "@/components/chapters/flags"
import { PagePagination } from "@/components/pagination/page-pagination"
import { ContentFilterEmpty } from "@/components/settings/content-filter"
import {
  CHAPTER_SORTS,
  type ChapterSort,
  type MediaChapter,
  type MediaChapterFacets,
  mediaChapterFacetsQueryOptions,
  mediaChaptersQueryOptions,
} from "@/lib/queries/chapters"
import { useSettings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

export const CHAPTERS_PER_PAGE = 24

const NO_VOLUME = "none"
const ALL_LANGUAGES = "all"
const MIN_LANGUAGES_FOR_FILTER = 3
const DESKTOP = "@media (width >= 48rem)"
const WIDE = "@media (width >= 72rem)"
const SEARCH_DEBOUNCE_MS = 300
const SORT_LABELS: Record<ChapterSort, () => string> = {
  newest: m.media_chapters_sort_newest,
  oldest: m.media_chapters_sort_oldest,
  uploaded: m.media_chapters_sort_uploaded,
}
const routeApi = getRouteApi("/media/$mediaId")
const styles = stylex.create({
  root: {
    gap: "1rem",
    display: "flex",
    flexDirection: "column",
  },
  toolbar: {
    gap: "0.75rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
  },
  search: {
    flexBasis: "16rem",
    flexGrow: 1,
    minWidth: 0,
  },
  searchIcon: {
    color: colors.mutedForeground,
  },
  unread: {
    gap: "0.625rem",
    alignItems: "center",
    color: colors.foreground,
    cursor: "pointer",
    display: "flex",
    fontSize: "0.875rem",
    fontWeight: 500,
    userSelect: "none",
    whiteSpace: "nowrap",
  },
  trigger: {
    maxWidth: "14rem",
    minWidth: "10rem",
    width: "auto",
  },
  triggerValue: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    minWidth: 0,
  },
  triggerText: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  triggerIcon: {
    color: colors.mutedForeground,
    flexShrink: 0,
  },
  item: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    width: "100%",
  },
  itemCount: {
    color: colors.mutedForeground,
    fontFamily: font.mono,
    fontSize: "0.75rem",
    marginInlineStart: "auto",
    paddingInlineStart: "1rem",
  },
  body: {
    gap: "1.25rem",
    alignItems: "start",
    display: "grid",
    gridTemplateColumns: { [WIDE]: "15rem minmax(0, 1fr)", default: "minmax(0, 1fr)" },
  },
  rail: {
    margin: 0,
    padding: "0.375rem",
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.125rem",
    listStyle: "none",
    backgroundColor: colors.well,
    boxShadow: shadows.sunken,
    display: "flex",
    flexDirection: { [WIDE]: "column", default: "row" },
    position: { [WIDE]: "sticky", default: "static" },
    scrollbarWidth: "none",
    overflowX: { [WIDE]: "visible", default: "auto" },
    top: "calc(var(--navbar-height) + 1rem)",
  },
  volumeItem: {
    flexShrink: 0,
  },
  volume: {
    borderRadius: `calc(${radius.xl} - 0.375rem)`,
    borderWidth: 0,
    paddingBlock: "0.625rem",
    paddingInline: "0.875rem",
    alignItems: "center",
    backgroundColor: {
      default: "transparent",
      ":is([aria-current=true])": colors.wellRaised,
      ":hover": colors.chipHover,
    },
    boxShadow: { default: "none", ":is([aria-current=true])": shadows.raised },
    color: colors.foreground,
    columnGap: "0.75rem",
    cursor: "pointer",
    display: "grid",
    flexShrink: 0,
    gridTemplateColumns: "minmax(0, 1fr) auto",
    outlineColor: colors.ring,
    outlineOffset: -2,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    textAlign: "start",
    transitionDuration: "150ms",
    transitionProperty: "background-color, box-shadow",
    transitionTimingFunction: motion.easeOut,
    width: { [WIDE]: "100%", default: "auto" },
  },
  volumeName: {
    overflow: "hidden",
    fontSize: "0.9375rem",
    fontWeight: 600,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: { [WIDE]: null, default: "14rem" },
  },
  volumeNameActive: {
    color: colors.primary,
  },
  volumeRange: {
    color: colors.mutedForeground,
    fontFamily: font.mono,
    fontSize: "0.75rem",
    gridColumnStart: 1,
    whiteSpace: "nowrap",
  },
  volumeCount: {
    color: colors.mutedForeground,
    fontFamily: font.mono,
    fontSize: "0.75rem",
    gridColumnStart: 2,
    gridRowEnd: 3,
    gridRowStart: 1,
  },
  list: {
    gap: "1rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    scrollMarginTop: "calc(var(--navbar-height) + 1rem)",
  },
  card: {
    padding: { [DESKTOP]: "0.875rem", default: "0.625rem" },
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: 1,
    backgroundClip: "padding-box",
    backgroundColor: colors.card,
    boxShadow: shadows.raised,
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  cardHeader: {
    gap: "1rem",
    alignItems: "baseline",
    display: "flex",
    justifyContent: "space-between",
    borderBottomColor: colors.border,
    borderBottomStyle: "solid",
    borderBottomWidth: 1,
    minWidth: 0,
    paddingBottom: "0.625rem",
  },
  cardTitle: {
    margin: 0,
    overflow: "hidden",
    color: colors.foreground,
    fontFamily: font.heading,
    fontSize: { [DESKTOP]: "1.125rem", default: "1rem" },
    fontWeight: font.weightBold,
    letterSpacing: "-0.01em",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  cardCount: {
    color: colors.mutedForeground,
    flexShrink: 0,
    fontFamily: font.mono,
    fontSize: "0.75rem",
    whiteSpace: "nowrap",
  },
  stale: {
    opacity: 0.6,
    transitionDuration: "150ms",
    transitionProperty: "opacity",
  },
  empty: {
    paddingBlock: "2rem",
  },
})

type ChapterSearch = ReturnType<typeof routeApi.useSearch>

const getVolumeName = (volume: string | null) => {
  if (volume === null) {
    return m.media_chapters_no_volume()
  }

  return /^\d+(?:\.\d+)?$/.test(volume) ? m.media_chapters_volume({ volume }) : volume
}
const getRange = (first: number, last: number) =>
  first === last ? m.chapter_number({ number: first }) : m.media_chapters_range({ first, last })

export function MediaChapters({ mediaId, signedIn }: { mediaId: string; signedIn: boolean }) {
  const search = routeApi.useSearch()
  const navigate = routeApi.useNavigate()
  const contentRatings = useDeferredValue(useSettings().contentRatings)
  const sort = search.sort ?? "newest"
  const page = search.page ?? 1
  const unread = signedIn && search.unread === true
  const filters = { contentRatings, language: search.lang }
  const facets = useQuery({
    ...mediaChapterFacetsQueryOptions(mediaId, filters),
    placeholderData: keepPreviousData,
  })
  const chapters = useQuery({
    ...mediaChaptersQueryOptions(mediaId, {
      ...filters,
      page,
      perPage: CHAPTERS_PER_PAGE,
      sort,
      volume: search.volume,
      search: search.q,
      unread,
    }),
    placeholderData: keepPreviousData,
  })
  const update = (patch: Partial<ChapterSearch>) => {
    void navigate({
      replace: true,
      resetScroll: false,
      search: (previous) => ({ ...previous, page: undefined, ...patch }),
    })
  }
  const filtered =
    search.lang !== undefined || search.volume !== undefined || search.q !== undefined || unread
  const languages = facets.data?.languages ?? []

  if (facets.data?.total === 0 && search.lang === undefined) {
    return (
      <ContentFilterEmpty
        description={m.media_chapters_none_description()}
        title={m.media_chapters_none_title()}
      />
    )
  }

  return (
    <div sx={styles.root}>
      <div sx={styles.toolbar}>
        <ChapterSearchField
          onSearch={(q) => {
            update({ q })
          }}
          value={search.q ?? ""}
        />
        {languages.length >= MIN_LANGUAGES_FOR_FILTER || search.lang !== undefined ? (
          <LanguageSelect
            languages={languages}
            onChange={(lang) => {
              update({ lang })
            }}
            value={search.lang}
          />
        ) : null}
        <Tabs
          onValueChange={(value: ChapterSort) => {
            update({ sort: value === "newest" ? undefined : value })
          }}
          value={sort}
        >
          <TabsList aria-label={m.media_chapters_sort()}>
            {CHAPTER_SORTS.map((value) => (
              <TabsTab key={value} value={value}>
                {SORT_LABELS[value]()}
              </TabsTab>
            ))}
          </TabsList>
        </Tabs>
        {signedIn ? (
          <label sx={styles.unread}>
            <Switch
              checked={unread}
              onCheckedChange={(checked) => {
                update({ unread: checked ? true : undefined })
              }}
            />
            {m.media_chapters_unread()}
          </label>
        ) : null}
      </div>
      <div sx={styles.body}>
        {facets.data !== undefined && facets.data.volumes.some(({ volume }) => volume !== null) ? (
          <VolumeRail
            facets={facets.data}
            onSelect={(volume) => {
              update({ volume })
            }}
            selected={search.volume}
          />
        ) : null}
        <MediaChapterList
          chapters={chapters.data?.data}
          filtered={filtered}
          onClear={() => {
            update({ lang: undefined, q: undefined, unread: undefined, volume: undefined })
          }}
          page={page}
          stale={chapters.isPlaceholderData}
          title={
            search.volume === undefined
              ? m.media_chapters_all()
              : getVolumeName(search.volume === NO_VOLUME ? null : search.volume)
          }
          total={chapters.data?.meta.total ?? 0}
        />
      </div>
    </div>
  )
}

function ChapterSearchField({
  value,
  onSearch,
}: {
  value: string
  onSearch: (q?: string) => void
}) {
  const [draft, setDraft] = useState<string | null>(null)
  const [synced, setSynced] = useState(value)
  const search = useEffectEvent((q: string) => {
    onSearch(q === "" ? undefined : q)
  })

  if (synced !== value) {
    setSynced(value)

    if ((draft ?? "").trim() !== value) {
      setDraft(null)
    }
  }

  useEffect(() => {
    const pending = draft !== null && draft.trim() !== value
    const timer = pending
      ? setTimeout(() => {
          search(draft.trim())
        }, SEARCH_DEBOUNCE_MS)
      : undefined

    return () => {
      clearTimeout(timer)
    }
  }, [draft, value])

  return (
    <InputGroup sx={styles.search}>
      <InputGroupAddon>
        <Search {...stylex.props(styles.searchIcon)} />
      </InputGroupAddon>
      <InputGroupInput
        aria-label={m.media_chapters_search()}
        enterKeyHint="search"
        maxLength={100}
        onChange={(event) => {
          setDraft(event.target.value)
        }}
        placeholder={m.media_chapters_search()}
        type="search"
        value={draft ?? value}
      />
    </InputGroup>
  )
}

type LanguageSelectProps = {
  languages: MediaChapterFacets["languages"]
  value: string | undefined
  onChange: (language: string | undefined) => void
}

function LanguageSelect({ languages, value, onChange }: LanguageSelectProps) {
  const selected = languages.find((entry) => entry.language === value)

  return (
    <Select
      onValueChange={(next) => {
        onChange(next === null || next === ALL_LANGUAGES ? undefined : next)
      }}
      value={value ?? ALL_LANGUAGES}
    >
      <SelectTrigger aria-label={m.media_chapters_language()} sx={styles.trigger}>
        <SelectValue>
          {() => (
            <span sx={styles.triggerValue}>
              {selected === undefined ? (
                <Languages size={16} {...stylex.props(styles.triggerIcon)} />
              ) : (
                <LanguageFlag language={selected.language} />
              )}
              <span sx={styles.triggerText}>
                {selected === undefined
                  ? m.media_chapters_all_languages()
                  : getLanguageName(selected.language)}
              </span>
            </span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectPopup>
        <SelectItem value={ALL_LANGUAGES}>
          <span sx={styles.item}>
            <Languages size={16} {...stylex.props(styles.triggerIcon)} />
            {m.media_chapters_all_languages()}
          </span>
        </SelectItem>
        {languages.map((entry) => (
          <SelectItem key={entry.language} value={entry.language}>
            <span sx={styles.item}>
              <LanguageFlag language={entry.language} />
              {getLanguageName(entry.language)}
              <span sx={styles.itemCount}>{entry.count}</span>
            </span>
          </SelectItem>
        ))}
      </SelectPopup>
    </Select>
  )
}

type VolumeRailProps = {
  facets: MediaChapterFacets
  selected: string | undefined
  onSelect: (volume: string | undefined) => void
}

function VolumeRail({ facets, selected, onSelect }: VolumeRailProps) {
  const first = Math.min(...facets.volumes.map((volume) => volume.firstNumber))
  const last = Math.max(...facets.volumes.map((volume) => volume.lastNumber))

  return (
    <nav aria-label={m.media_chapters_volumes()}>
      <ul sx={styles.rail}>
        <VolumeItem
          active={selected === undefined}
          count={facets.total}
          name={m.media_chapters_all()}
          onClick={() => {
            onSelect(undefined)
          }}
          range={facets.total === 0 ? null : getRange(first, last)}
        />
        {facets.volumes.map((volume) => {
          const value = volume.volume ?? NO_VOLUME

          return (
            <VolumeItem
              key={value}
              active={selected === value}
              count={volume.count}
              name={getVolumeName(volume.volume)}
              onClick={() => {
                onSelect(value)
              }}
              range={getRange(volume.firstNumber, volume.lastNumber)}
            />
          )
        })}
      </ul>
    </nav>
  )
}

type VolumeItemProps = {
  name: string
  range: string | null
  count: number
  active: boolean
  onClick: () => void
}

function VolumeItem({ name, range: chapters, count, active, onClick }: VolumeItemProps) {
  return (
    <li sx={styles.volumeItem}>
      <button aria-current={active} onClick={onClick} sx={styles.volume} type="button">
        <span sx={[styles.volumeName, active && styles.volumeNameActive]} title={name}>
          {name}
        </span>
        <span sx={styles.volumeCount}>{count}</span>
        {chapters === null ? null : <span sx={styles.volumeRange}>{chapters}</span>}
      </button>
    </li>
  )
}

type MediaChapterListProps = {
  title: string
  chapters: MediaChapter[] | undefined
  total: number
  page: number
  stale: boolean
  filtered: boolean
  onClear: () => void
}

function MediaChapterList({
  title,
  chapters,
  total,
  page,
  stale,
  filtered,
  onClear,
}: MediaChapterListProps) {
  const ref = useRef<HTMLElement>(null)
  const previousPage = useRef(page)
  const navigate = routeApi.useNavigate()
  const pageCount = Math.ceil(total / CHAPTERS_PER_PAGE)

  useEffect(() => {
    if (previousPage.current !== page && ref.current !== null) {
      if (ref.current.getBoundingClientRect().top < 0) {
        ref.current.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }

    previousPage.current = page
  }, [page])

  return (
    <section aria-labelledby="media-chapters-title" ref={ref} sx={styles.list}>
      <div sx={styles.card}>
        <div sx={styles.cardHeader}>
          <h3 id="media-chapters-title" sx={styles.cardTitle}>
            {title}
          </h3>
          {chapters === undefined ? null : (
            <span sx={styles.cardCount}>
              {m.media_chapters_count({ total, shown: chapters.length })}
            </span>
          )}
        </div>
        <MediaChapterListBody
          chapters={chapters}
          filtered={filtered}
          onClear={onClear}
          stale={stale}
        />
      </div>
      <PagePagination
        onJump={(target) => {
          void navigate({
            resetScroll: false,
            search: (previous) => ({ ...previous, page: target === 1 ? undefined : target }),
          })
        }}
        page={page}
        pageCount={pageCount}
        renderLink={(target) => (
          <Link
            from="/media/$mediaId"
            resetScroll={false}
            search={(previous) => ({ ...previous, page: target === 1 ? undefined : target })}
          />
        )}
      />
    </section>
  )
}

type MediaChapterListBodyProps = Pick<
  MediaChapterListProps,
  "chapters" | "stale" | "filtered" | "onClear"
>

function MediaChapterListBody({ chapters, stale, filtered, onClear }: MediaChapterListBodyProps) {
  if (chapters === undefined) {
    return <ChapterListSkeleton count={6} />
  }

  if (chapters.length === 0) {
    return (
      <Empty sx={styles.empty}>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Search size={18} />
          </EmptyMedia>
          <EmptyTitle>{m.media_chapters_empty_title()}</EmptyTitle>
          <EmptyDescription>{m.media_chapters_empty_description()}</EmptyDescription>
        </EmptyHeader>
        {filtered ? (
          <EmptyContent>
            <Button onClick={onClear} size="sm" variant="outline">
              {m.media_chapters_clear()}
            </Button>
          </EmptyContent>
        ) : null}
      </Empty>
    )
  }

  return <ChapterList chapters={chapters} sx={stale && styles.stale} />
}
