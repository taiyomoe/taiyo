import * as stylex from "@stylexjs/stylex"
import { type KqlSyntaxError, parseKql } from "@taiyomoe/audit/query"
import { History } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Card } from "@taiyomoe/ui/components/ui/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@taiyomoe/ui/components/ui/empty"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { Switch } from "@taiyomoe/ui/components/ui/switch"
import { colors, motion, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Link, useNavigate } from "@tanstack/react-router"
import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react"
import { DateRangePicker } from "@/components/dashboard/activity-log/date-range-picker"
import { FieldBreakdown } from "@/components/dashboard/activity-log/field-breakdown"
import { FilterBar } from "@/components/dashboard/activity-log/filter-bar"
import {
  describeDateMath,
  describeInterval,
  describeRange,
  formatCount,
} from "@/components/dashboard/activity-log/format"
import { KqlInput } from "@/components/dashboard/activity-log/kql-input"
import { LogHistogram } from "@/components/dashboard/activity-log/log-histogram"
import { LogTable } from "@/components/dashboard/activity-log/log-table"
import {
  CardNote,
  CardSkeleton,
  DashboardCard,
} from "@/components/dashboard/overview/dashboard-card"
import { PagePagination } from "@/components/pagination/page-pagination"
import { sceneFont } from "@/components/scene/scene.stylex"
import {
  ACTIVITY_LOG_PER_PAGE,
  type ActivityLogSearch,
  buildQuery,
  DEFAULT_FILTERS,
  DEFAULT_FROM,
  DEFAULT_TO,
  getFilterKey,
  getGroupRange,
  getGroupViewFilters,
  isDefaultFilters,
  type LogFilter,
  type LogGroup,
  pickHistogramInterval,
  QUERY_OFFSET,
  REFRESH_INTERVAL_MS,
  toSingleGroup,
} from "@/lib/activity-log"
import { resolveDateRange } from "@/lib/datemath"
import {
  auditLogFacetsQueryOptions,
  auditLogGroupsQueryOptions,
  auditLogHistogramQueryOptions,
  auditLogsQueryOptions,
} from "@/lib/queries/audit-logs"
import { useClientValue } from "@/lib/use-client-value"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  emptyActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    maxWidth: "none",
  },
  page: {
    gap: "1.5rem",
    paddingInline: {
      default: "1.25rem",
      "@media (width >= 48rem)": "2rem",
    },
    containerType: "inline-size",
    display: "flex",
    flexDirection: "column",
    paddingBottom: "3rem",
    paddingTop: "2rem",
  },
  intro: {
    gap: "0.5rem",
    display: "flex",
    flexDirection: "column",
  },
  title: {
    margin: 0,
    fontFamily: sceneFont.display,
    fontSize: {
      default: "2rem",
      "@media (width >= 48rem)": "2.75rem",
    },
    fontWeight: 700,
    letterSpacing: "-0.02em",
    lineHeight: 1.1,
  },
  subtitle: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "1.0625rem",
    lineHeight: 1.5,
  },
  toolbar: {
    gap: "0.75rem",
    display: "flex",
    flexDirection: "column",
  },
  searchRow: {
    gap: "0.75rem",
    alignItems: "flex-start",
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      "@container (width >= 64rem)": "minmax(0, 1fr) auto",
    },
  },
  content: {
    gap: "1rem",
    alignItems: "start",
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      "@container (width >= 68rem)": "17rem minmax(0, 1fr)",
    },
  },
  breakdown: {
    order: {
      default: 2,
      "@container (width >= 68rem)": 0,
    },
    position: {
      default: "static",
      "@container (width >= 68rem)": "sticky",
    },
    top: "calc(var(--navbar-height, 4rem) + 1rem)",
  },
  main: {
    gap: "1rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  stale: {
    opacity: {
      '[aria-busy="true"]': 0.6,
      default: 1,
    },
    transitionDuration: motion.enter,
    transitionProperty: "opacity",
  },
  results: {
    padding: 0,
    gap: 0,
    overflow: "hidden",
    minWidth: 0,
  },
  resultsHeader: {
    gap: "0.75rem",
    paddingBlock: "1rem",
    paddingInline: "1.25rem",
    alignItems: "baseline",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    borderBottomColor: colors.border,
    borderBottomStyle: "solid",
    borderBottomWidth: 1,
  },
  resultsHeading: {
    gap: "0.25rem",
    display: "flex",
    flexDirection: "column",
  },
  groupToggle: {
    gap: "0.625rem",
    alignItems: "center",
    color: colors.mutedForeground,
    cursor: "pointer",
    display: "inline-flex",
    fontSize: "0.875rem",
  },
  resultsTitle: {
    margin: 0,
    fontFamily: sceneFont.display,
    fontSize: "1.375rem",
    fontWeight: 700,
    letterSpacing: "-0.01em",
  },
  resultsMeta: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.875rem",
  },
  pagination: {
    paddingBlock: "1rem",
    borderTopColor: colors.border,
    borderTopStyle: "solid",
    borderTopWidth: 1,
  },
  skeletons: {
    padding: "1.25rem",
    gap: "0.75rem",
    display: "flex",
    flexDirection: "column",
  },
  skeletonRow: {
    borderRadius: radius.md,
    height: "2.75rem",
  },
  problem: {
    padding: "1.5rem",
    gap: "1rem",
    alignItems: "flex-start",
  },
  problemText: {
    margin: 0,
    color: colors.mutedForeground,
  },
})
const getQueryIssue = (error: unknown): KqlSyntaxError | null => {
  if (
    typeof error !== "object" ||
    error === null ||
    !("details" in error) ||
    !Array.isArray(error.details)
  ) {
    return null
  }

  const details: readonly unknown[] = error.details
  const issue = details[0]

  if (
    typeof issue === "object" &&
    issue !== null &&
    "path" in issue &&
    Array.isArray(issue.path) &&
    issue.path.includes("q") &&
    "message" in issue &&
    typeof issue.message === "string"
  ) {
    const start = "start" in issue && typeof issue.start === "number" ? issue.start : 0
    const end = "end" in issue && typeof issue.end === "number" ? issue.end : start

    return { message: issue.message, start: start - QUERY_OFFSET, end: end - QUERY_OFFSET }
  }

  return null
}
const getRangeText = (page: number, total: number, grouping: boolean) => {
  const range = {
    start: formatCount((page - 1) * ACTIVITY_LOG_PER_PAGE + 1),
    end: formatCount(Math.min(page * ACTIVITY_LOG_PER_PAGE, total)),
    total: formatCount(total),
  }

  return grouping ? m.activity_results_groups(range) : m.activity_results_range(range)
}
const WIDER_RANGES = [
  { from: "now-7d", span: 604_800_000, label: m.activity_empty_widen_7d },
  { from: "now-30d", span: 2_592_000_000, label: m.activity_empty_widen_30d },
  { from: "now-1y", span: 31_536_000_000, label: m.activity_empty_widen_1y },
]
const DEFAULT_FILTER_KEYS = new Set(DEFAULT_FILTERS.map(getFilterKey))
const withoutDefaults = (search: ActivityLogSearch): ActivityLogSearch => ({
  ...(search.q === undefined || search.q.trim() === "" ? {} : { q: search.q }),
  ...(search.from === undefined || search.from === DEFAULT_FROM ? {} : { from: search.from }),
  ...(search.to === undefined || search.to === DEFAULT_TO ? {} : { to: search.to }),
  ...(search.filters === undefined || isDefaultFilters(search.filters)
    ? {}
    : { filters: search.filters }),
  ...(search.page === undefined || search.page === 1 ? {} : { page: search.page }),
  ...(search.sort === undefined ? {} : { sort: search.sort }),
  ...(search.refresh === undefined ? {} : { refresh: search.refresh }),
  ...(search.grouping === undefined ? {} : { grouping: search.grouping }),
})

export function ActivityLogPage({ search }: { search: ActivityLogSearch }) {
  const navigate = useNavigate({ from: "/dashboard/activity-log" })
  const queryClient = useQueryClient()
  const from = search.from ?? DEFAULT_FROM
  const to = search.to ?? DEFAULT_TO
  const query = search.q ?? ""
  const page = search.page ?? 1
  const sort = search.sort === "asc" ? "asc" : "desc"
  const filters = useMemo(() => search.filters ?? [...DEFAULT_FILTERS], [search.filters])
  const [draft, setDraft] = useState(query)
  const [draftFor, setDraftFor] = useState(query)
  const [syntaxError, setSyntaxError] = useState<KqlSyntaxError | null>(null)
  const [anchor, setAnchor] = useState(() => Date.now())
  const timeZone = useClientValue(() => new Intl.DateTimeFormat().resolvedOptions().timeZone)

  if (draftFor !== query) {
    setDraftFor(query)
    setDraft(query)
    setSyntaxError(null)
  }

  useEffect(() => {
    if (search.refresh === undefined) {
      return undefined
    }

    const interval = setInterval(() => {
      setAnchor(Date.now())
    }, REFRESH_INTERVAL_MS[search.refresh])

    return () => {
      clearInterval(interval)
    }
  }, [search.refresh])

  const range = useMemo(() => resolveDateRange(from, to, anchor), [from, to, anchor])
  const scope = useMemo(
    () =>
      range === null
        ? null
        : {
            q: buildQuery(query, filters),
            from: range.from.toISOString(),
            to: range.to.toISOString(),
          },
    [range, query, filters],
  )
  const enabled = scope !== null && timeZone !== null
  const fallbackScope = { q: "", from: "", to: "" }
  const interval = pickHistogramInterval(
    range === null ? 0 : range.to.getTime() - range.from.getTime(),
  )
  const grouping = search.grouping !== "off"
  const list = useQuery({
    ...auditLogsQueryOptions(scope ?? fallbackScope, {
      page,
      perPage: ACTIVITY_LOG_PER_PAGE,
      sort,
    }),
    enabled: enabled && !grouping,
  })
  const grouped = useQuery({
    ...auditLogGroupsQueryOptions(scope ?? fallbackScope, {
      page,
      perPage: ACTIVITY_LOG_PER_PAGE,
      sort,
    }),
    enabled: enabled && grouping,
  })
  const results = grouping ? grouped : list
  const rows = useMemo(
    () => (grouping ? grouped.data?.groups : list.data?.entries.map(toSingleGroup)),
    [grouping, grouped.data, list.data],
  )
  const histogram = useQuery({
    ...auditLogHistogramQueryOptions(scope ?? fallbackScope, interval, timeZone ?? "UTC"),
    enabled,
  })
  const facets = useQuery({ ...auditLogFacetsQueryOptions(scope ?? fallbackScope), enabled })
  const serverIssue = getQueryIssue(results.error) ?? getQueryIssue(histogram.error)
  const queryIssue = syntaxError ?? serverIssue
  const update = useCallback(
    (patch: Partial<ActivityLogSearch>, { keepPage = false } = {}) => {
      if ("from" in patch || "to" in patch) {
        setAnchor(Date.now())
      }

      void navigate({
        search: (previous) =>
          withoutDefaults({ ...previous, ...(keepPage ? {} : { page: undefined }), ...patch }),
        resetScroll: false,
      })
    },
    [navigate],
  )
  const addFilter = useCallback(
    (field: string, value: string, negate: boolean) => {
      const filter: LogFilter = { field, operator: negate ? "is_not" : "is", values: [value] }
      const others = filters.filter(
        (existing) =>
          !(
            existing.field === field &&
            (existing.operator === "is" || existing.operator === "is_not") &&
            existing.values[0] === value
          ),
      )

      update({ filters: [...others, filter] })
    },
    [filters, update],
  )
  const zoom = useCallback(
    (next: { from: string; to: string }) => {
      update({ from: next.from, to: next.to })
    },
    [update],
  )
  const submit = (text: string) => {
    const result = parseKql(text)

    if (!result.ok) {
      setSyntaxError(result.error)

      return
    }

    setSyntaxError(null)

    if (text === query) {
      setAnchor(Date.now())
      void queryClient.invalidateQueries({ queryKey: ["audit-logs"] })
    } else {
      update({ q: text })
    }
  }
  const total = results.data?.total ?? 0
  const entryCount = grouped.data?.entries ?? list.data?.total ?? 0
  const pageCount = Math.max(1, Math.ceil(total / ACTIVITY_LOG_PER_PAGE))
  const fetching = results.isFetching || histogram.isFetching || facets.isFetching
  const viewGroup = (group: LogGroup) => {
    update({
      ...getGroupRange(group),
      filters: getGroupViewFilters(filters, group),
      grouping: "off",
    })
  }
  const rangeLabel =
    describeRange(from, to) ?? `${describeDateMath(from)} → ${describeDateMath(to)}`
  const showProblem = results.isError && queryIssue === null && results.data === undefined
  let histogramContent: ReactNode = <CardSkeleton />

  if (serverIssue !== null) {
    histogramContent = <CardNote>{m.activity_fix_query()}</CardNote>
  } else if (histogram.data !== undefined) {
    histogramContent = (
      <div aria-busy={histogram.isPlaceholderData} sx={styles.stale}>
        <LogHistogram histogram={histogram.data} onZoom={zoom} to={scope?.to ?? ""} />
      </div>
    )
  }

  let resultsContent: ReactNode = (
    <div sx={styles.skeletons}>
      {Array.from({ length: 8 }, (_, index) => (
        <Skeleton key={index} sx={styles.skeletonRow} />
      ))}
    </div>
  )

  if (serverIssue !== null) {
    resultsContent = <CardNote>{m.activity_fix_query()}</CardNote>
  } else if (rows?.length === 0) {
    const span = range === null ? 0 : range.to.getTime() - range.from.getTime()
    const wider = WIDER_RANGES.find((option) => option.span > span + 60_000)
    const narrowed = filters.some(
      (filter) => filter.disabled !== true && !DEFAULT_FILTER_KEYS.has(getFilterKey(filter)),
    )
    const queried = query.trim() !== ""

    resultsContent = (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <History />
          </EmptyMedia>
          <EmptyTitle>{m.activity_empty_title()}</EmptyTitle>
          <EmptyDescription>{m.activity_empty_description()}</EmptyDescription>
        </EmptyHeader>
        {queried || narrowed || wider !== undefined ? (
          <EmptyContent sx={styles.emptyActions}>
            {queried ? (
              <Button
                onClick={() => {
                  update({ q: undefined })
                }}
                variant="outline"
              >
                {m.activity_empty_clear_query()}
              </Button>
            ) : null}
            {narrowed ? (
              <Button
                onClick={() => {
                  update({ filters: undefined })
                }}
                variant="outline"
              >
                {m.activity_empty_reset_filters()}
              </Button>
            ) : null}
            {wider === undefined ? null : (
              <Button
                onClick={() => {
                  update({ from: wider.from, to: "now" })
                }}
                variant="outline"
              >
                {wider.label()}
              </Button>
            )}
          </EmptyContent>
        ) : null}
      </Empty>
    )
  } else if (rows !== undefined && scope !== null) {
    resultsContent = (
      <div aria-busy={results.isPlaceholderData} sx={styles.stale}>
        <LogTable
          groups={rows}
          onFilter={addFilter}
          onSortChange={(next) => {
            update({ sort: next === "asc" ? "asc" : undefined })
          }}
          onViewGroup={viewGroup}
          scope={scope}
          sort={sort}
        />
      </div>
    )
  }

  return (
    <div sx={styles.page}>
      <div sx={styles.intro}>
        <h1 sx={styles.title}>{m.activity_title()}</h1>
        <p sx={styles.subtitle}>{m.activity_subtitle()}</p>
      </div>
      <div sx={styles.toolbar}>
        <div sx={styles.searchRow}>
          <KqlInput
            error={queryIssue}
            onChange={(text) => {
              setDraft(text)

              if (syntaxError !== null) {
                setSyntaxError(null)
              }
            }}
            onSubmit={submit}
            value={draft}
          />
          <DateRangePicker
            fetching={fetching}
            from={from}
            onChange={(next) => {
              update({ from: next.from, to: next.to })
            }}
            onRefresh={() => {
              submit(draft)
            }}
            onRefreshChange={(refresh) => {
              update({ refresh }, { keepPage: true })
            }}
            refresh={search.refresh}
            to={to}
          />
        </div>
        <FilterBar
          filters={filters}
          onChange={(next) => {
            update({ filters: next })
          }}
        />
      </div>
      {range === null ? (
        <Card sx={styles.problem}>
          <p sx={styles.problemText}>{m.activity_invalid_range()}</p>
          <Button
            onClick={() => {
              update({ from: undefined, to: undefined })
            }}
            variant="outline"
          >
            {m.activity_reset_range()}
          </Button>
        </Card>
      ) : (
        <div sx={styles.content}>
          <div sx={styles.breakdown}>
            <FieldBreakdown
              blocked={serverIssue !== null}
              facets={facets.data}
              onFilter={addFilter}
            />
          </div>
          <div sx={styles.main}>
            <DashboardCard
              settings={false}
              subtitle={m.activity_histogram_subtitle({
                range: rangeLabel,
                interval: describeInterval(histogram.data?.interval ?? interval),
              })}
              title={m.activity_histogram_title()}
            >
              {histogramContent}
            </DashboardCard>
            {showProblem ? (
              <Card sx={styles.problem}>
                <p sx={styles.problemText}>{m.activity_error()}</p>
                <Button
                  onClick={() => {
                    void results.refetch()
                  }}
                  variant="outline"
                >
                  {m.dashboard_retry()}
                </Button>
              </Card>
            ) : (
              <Card render={<section />} sx={styles.results}>
                <header sx={styles.resultsHeader}>
                  <div sx={styles.resultsHeading}>
                    <h2 sx={styles.resultsTitle}>
                      {results.data === undefined
                        ? m.activity_results_title()
                        : m.activity_results_count({ count: formatCount(entryCount) })}
                    </h2>
                    <p sx={styles.resultsMeta}>
                      {total === 0 ? rangeLabel : getRangeText(page, total, grouping)}
                    </p>
                  </div>
                  <label sx={styles.groupToggle}>
                    <Switch
                      checked={grouping}
                      onCheckedChange={(checked) => {
                        update({ grouping: checked ? undefined : "off" })
                      }}
                    />
                    {m.activity_group_toggle()}
                  </label>
                </header>
                {resultsContent}
                {pageCount > 1 ? (
                  <div sx={styles.pagination}>
                    <PagePagination
                      onJump={(target) => {
                        update({ page: target }, { keepPage: true })
                      }}
                      page={page}
                      pageCount={pageCount}
                      renderLink={(target) => (
                        <Link
                          resetScroll={false}
                          search={withoutDefaults({ ...search, page: target })}
                          to="/dashboard/activity-log"
                        />
                      )}
                    />
                  </div>
                ) : null}
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
