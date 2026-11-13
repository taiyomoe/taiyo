import * as stylex from "@stylexjs/stylex"
import { breakpoints, colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { getRouteApi } from "@tanstack/react-router"
import { layout } from "@/components/layout/layout.stylex"
import { sceneFont } from "@/components/scene/scene.stylex"
import { activityLogContainers } from "@/features/activity-log/components/activity-log.stylex"
import { FieldBreakdown } from "@/features/activity-log/components/field-breakdown"
import { ActivityLogToolbar } from "@/features/activity-log/components/page/activity-log-toolbar"
import { HistogramCard } from "@/features/activity-log/components/page/histogram-card"
import { ProblemCard } from "@/features/activity-log/components/page/problem-card"
import { ResultsCard } from "@/features/activity-log/components/page/results-card"
import { ResultsContent } from "@/features/activity-log/components/page/results-content"
import { useActivityLog } from "@/features/activity-log/hooks/use-activity-log"
import { m } from "@/paraglide/messages"

const routeApi = getRouteApi("/dashboard/activity-log")
const styles = stylex.create({
  page: {
    gap: "1.5rem",
    paddingInline: layout.gutter,
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
      [breakpoints.md]: "2.75rem",
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
  content: {
    gap: "1rem",
    alignItems: "start",
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      [activityLogContainers.sidebar]: "17rem minmax(0, 1fr)",
    },
  },
  breakdown: {
    order: {
      default: 2,
      [activityLogContainers.sidebar]: 0,
    },
    position: {
      default: "static",
      [activityLogContainers.sidebar]: "sticky",
    },
    top: "calc(var(--navbar-height, 4rem) + 1rem)",
  },
  main: {
    gap: "1rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
})

export function ActivityLogPage() {
  const search = routeApi.useSearch()
  const log = useActivityLog(search)
  const { results, serverIssue } = log
  const blocked = serverIssue !== null

  return (
    <div sx={styles.page}>
      <div sx={styles.intro}>
        <h1 sx={styles.title}>{m.activity_title()}</h1>
        <p sx={styles.subtitle}>{m.activity_subtitle()}</p>
      </div>
      <ActivityLogToolbar
        draft={log.draft}
        error={log.queryIssue}
        fetching={log.fetching}
        from={log.from}
        onDraftChange={log.changeDraft}
        onSubmit={log.submit}
        onUpdate={log.update}
        refresh={search.refresh}
        to={log.to}
      />
      {log.range === null ? (
        <ProblemCard
          action={m.activity_reset_range()}
          message={m.activity_invalid_range()}
          onAction={() => {
            log.update({ from: undefined, to: undefined })
          }}
        />
      ) : (
        <div sx={styles.content}>
          <div sx={styles.breakdown}>
            <FieldBreakdown blocked={blocked} facets={log.facets.data} onFilter={log.addFilter} />
          </div>
          <div sx={styles.main}>
            <HistogramCard
              blocked={blocked}
              histogram={log.histogram.data}
              interval={log.interval}
              onZoom={log.zoom}
              rangeLabel={log.rangeLabel}
              stale={log.histogram.isPlaceholderData}
              to={log.scope?.to ?? ""}
            />
            {results.isError && log.queryIssue === null && results.data === undefined ? (
              <ProblemCard
                action={m.dashboard_retry()}
                message={m.activity_error()}
                onAction={() => {
                  void results.refetch()
                }}
              />
            ) : (
              <ResultsCard
                entryCount={log.entryCount}
                grouping={log.grouping}
                loaded={results.data !== undefined}
                onUpdate={log.update}
                page={log.page}
                pageCount={log.pageCount}
                rangeLabel={log.rangeLabel}
                search={search}
                total={log.total}
              >
                <ResultsContent
                  blocked={blocked}
                  onFilter={log.addFilter}
                  onUpdate={log.update}
                  onViewGroup={log.viewGroup}
                  query={log.query}
                  rows={log.rows}
                  scope={log.scope}
                  sort={log.sort}
                  span={log.span}
                  stale={results.isPlaceholderData}
                />
              </ResultsCard>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
