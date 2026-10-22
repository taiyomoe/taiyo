import type { IconProps } from "@taiyomoe/ui/components/icons"
import type { ReactElement, ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import {
  AlertTriangle,
  Bookmark,
  Comment,
  Eye,
  Upload,
  UserAdd,
  UserCheck,
  Users,
} from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Card } from "@taiyomoe/ui/components/ui/card"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { Switch } from "@taiyomoe/ui/components/ui/switch"
import { Tabs, TabsList, TabsTab } from "@taiyomoe/ui/components/ui/tabs"
import { colors, font, motion, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { defineChart, lineY } from "@tanstack/charts"
import { Chart } from "@tanstack/charts/react"
import { scaleLinear } from "@tanstack/charts/scales/linear"
import { useQuery } from "@tanstack/react-query"
import { Link, useNavigate } from "@tanstack/react-router"
import { useMemo } from "react"
import type { DashboardOverview, dashboardOverviewQueryOptions } from "@/lib/queries/dashboard"
import type { Session } from "@/lib/queries/session"
import { CatalogMix } from "@/components/dashboard/overview/catalog-mix"
import { ChaptersChart } from "@/components/dashboard/overview/chapters-chart"
import { chartTheme } from "@/components/dashboard/overview/chart-frame"
import {
  CardNote,
  CardSkeleton,
  DashboardCard,
} from "@/components/dashboard/overview/dashboard-card"
import { Delta } from "@/components/dashboard/overview/delta"
import { formatCompact, formatNumber, getDelta } from "@/components/dashboard/overview/format"
import { LanguageDonut } from "@/components/dashboard/overview/language-donut"
import { PeriodLegend } from "@/components/dashboard/overview/period-legend"
import { ReadingHeatmap } from "@/components/dashboard/overview/reading-heatmap"
import { RecentActivity } from "@/components/dashboard/overview/recent-activity"
import { TopUploaders } from "@/components/dashboard/overview/top-uploaders"
import { TrendChart } from "@/components/dashboard/overview/trend-chart"
import { Cover } from "@/components/media/cover"
import { sceneFont } from "@/components/scene/scene.stylex"
import { DEFAULT_DASHBOARD_RANGE, DASHBOARD_RANGES, type DashboardRange } from "@/lib/dashboard"
import { useClientValue } from "@/lib/use-client-value"
import { m } from "@/paraglide/messages"

const RANGES: Record<
  DashboardRange,
  { tab: () => string; short: () => string; period: () => string; unit: () => string }
> = {
  "24h": {
    tab: m.dashboard_range_24h,
    short: m.dashboard_range_24h,
    period: m.dashboard_period_24h,
    unit: m.dashboard_unit_hour,
  },
  "7d": {
    tab: m.dashboard_range_7d,
    short: m.dashboard_range_7d_short,
    period: m.dashboard_period_7d,
    unit: m.dashboard_unit_day,
  },
  "30d": {
    tab: m.dashboard_range_30d,
    short: m.dashboard_range_30d_short,
    period: m.dashboard_period_30d,
    unit: m.dashboard_unit_day,
  },
  "90d": {
    tab: m.dashboard_range_90d,
    short: m.dashboard_range_90d_short,
    period: m.dashboard_period_90d,
    unit: m.dashboard_unit_week,
  },
  "12m": {
    tab: m.dashboard_range_12m,
    short: m.dashboard_range_12m_short,
    period: m.dashboard_period_12m,
    unit: m.dashboard_unit_month,
  },
}
const KPIS = [
  { key: "reads", label: m.dashboard_kpi_reads, icon: Eye },
  { key: "uniqueReaders", label: m.dashboard_kpi_unique_readers, icon: Users },
  { key: "libraryAdds", label: m.dashboard_kpi_library_adds, icon: Bookmark },
  { key: "chaptersUploaded", label: m.dashboard_kpi_chapters_uploaded, icon: Upload },
  { key: "newAccounts", label: m.dashboard_kpi_new_accounts, icon: UserAdd },
] as const
const ATTENTION_ITEMS: ReadonlyArray<{
  key: keyof DashboardOverview["attention"]
  label: () => string
  icon: (props: IconProps) => ReactElement
}> = [
  {
    key: "pendingOwnershipRequests",
    label: m.dashboard_attention_ownership_requests,
    icon: UserCheck,
  },
  { key: "failedUploads", label: m.dashboard_attention_failed_uploads, icon: AlertTriangle },
]
const SIGN_UPS_TONE = colors.chart3
const CHAPTERS_TONE = colors.chart5
const PREVIOUS_BAR_TONE = `color-mix(in srgb, ${colors.mutedForeground} 45%, ${colors.card})`
const PREVIOUS_TICK_TONE = `color-mix(in srgb, ${colors.foreground} 72%, transparent)`
const styles = stylex.create({
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
  controls: {
    gap: "1rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  compare: {
    borderColor: colors.border,
    borderRadius: "9999px",
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.75rem",
    paddingBlock: "0.5rem",
    alignItems: "center",
    backgroundColor: colors.card,
    cursor: "pointer",
    display: "inline-flex",
    fontSize: "0.9375rem",
    fontWeight: 500,
    paddingInlineEnd: "1.125rem",
    paddingInlineStart: "0.625rem",
  },
  ranges: {
    scrollbarWidth: "none",
    maxWidth: "100%",
    overflowX: "auto",
  },
  grid: {
    gap: "1rem",
    display: "grid",
    gridAutoFlow: "dense",
    gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
    opacity: 1,
    transitionDuration: motion.enter,
    transitionProperty: "opacity",
  },
  stale: {
    opacity: 0.6,
  },
  primary: {
    gridColumn: {
      default: "span 12",
      "@container (width >= 62rem)": "span 8",
    },
  },
  secondary: {
    gridColumn: {
      default: "span 12",
      "@container (40rem <= width < 62rem)": "span 6",
      "@container (width >= 62rem)": "span 4",
    },
  },
  chapters: {
    gridColumn: {
      default: "span 12",
      "@container (width >= 62rem)": "span 7",
    },
  },
  ranking: {
    gridColumn: {
      default: "span 12",
      "@container (40rem <= width < 62rem)": "span 6",
      "@container (width >= 62rem)": "span 5",
    },
  },
  signUps: {
    gridColumn: {
      default: "span 12",
      "@container (40rem <= width < 62rem)": "span 6",
      "@container (width >= 62rem)": "span 7",
    },
  },
  half: {
    gridColumn: {
      default: "span 12",
      "@container (width >= 40rem)": "span 6",
    },
  },
  activity: {
    gridColumn: {
      default: "span 12",
      "@container (width >= 62rem)": "span 4",
    },
  },
  rangeLong: {
    display: {
      default: "none",
      "@container (width >= 30rem)": "inline",
    },
  },
  rangeShort: {
    display: {
      default: "inline",
      "@container (width >= 30rem)": "none",
    },
  },
  error: {
    padding: "1.5rem",
    gap: "1rem",
    alignItems: "flex-start",
  },
  errorText: {
    margin: 0,
    color: colors.mutedForeground,
  },
  figure: {
    gap: "0.125rem",
    alignItems: "flex-end",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
  },
  figureValue: {
    fontSize: "1.75rem",
    fontWeight: 700,
    letterSpacing: "-0.02em",
    lineHeight: 1,
  },
})
const kpiStyles = stylex.create({
  row: {
    gap: "1rem",
    display: "grid",
    gridColumnEnd: "-1",
    gridColumnStart: "1",
    gridTemplateColumns: {
      default: "repeat(2, minmax(0, 1fr))",
      "@container (36rem <= width < 62rem)": "repeat(3, minmax(0, 1fr))",
      "@container (width >= 62rem)": "repeat(6, minmax(0, 1fr))",
    },
  },
  tile: {
    padding: "1.25rem",
    gap: "0.75rem",
    minWidth: 0,
  },
  label: {
    gap: "0.5rem",
    alignItems: "flex-start",
    color: colors.mutedForeground,
    display: "flex",
    fontSize: "0.875rem",
    fontWeight: 500,
    lineHeight: "1.125rem",
    minHeight: "2.25rem",
  },
  icon: {
    flexShrink: 0,
    marginTop: "0.0625rem",
  },
  value: {
    fontSize: "2rem",
    fontWeight: 700,
    letterSpacing: "-0.02em",
    lineHeight: 1,
  },
  meta: {
    alignItems: "center",
    display: "flex",
    minHeight: "1.25rem",
  },
  untracked: {
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
  },
  spark: {
    height: "2.5rem",
    marginTop: "auto",
  },
  valueSkeleton: {
    borderRadius: radius.md,
    height: "2rem",
    width: "60%",
  },
})
const topMediaStyles = stylex.create({
  list: {
    margin: 0,
    padding: 0,
    gap: "0.875rem",
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
  },
  row: {
    gap: "1rem",
    alignItems: "center",
    display: "grid",
    gridTemplateColumns: "1rem 2rem minmax(0, 1fr) auto",
  },
  rank: {
    color: colors.mutedForeground,
    fontFamily: font.mono,
    fontSize: "0.8125rem",
    textAlign: "center",
  },
  cover: {
    borderRadius: radius.sm,
    width: "2rem",
  },
  main: {
    gap: "0.5rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  title: {
    overflow: "hidden",
    color: {
      default: colors.foreground,
      ":hover": `color-mix(in srgb, ${colors.foreground} 72%, ${colors.background})`,
    },
    fontSize: "0.9375rem",
    fontWeight: 600,
    textDecorationLine: "none",
    textOverflow: "ellipsis",
    transitionDuration: "150ms",
    transitionProperty: "color",
    whiteSpace: "nowrap",
  },
  track: {
    borderRadius: radius.full,
    overflow: "hidden",
    backgroundColor: colors.well,
    height: "0.375rem",
  },
  fill: {
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    height: "100%",
  },
  value: {
    fontFamily: font.mono,
    fontSize: "0.875rem",
    fontVariantNumeric: "tabular-nums",
    fontWeight: 600,
    textAlign: "end",
    minWidth: "3rem",
  },
})
const attentionStyles = stylex.create({
  list: {
    margin: 0,
    padding: 0,
    gap: "0.625rem",
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
  },
  row: {
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.875rem",
    paddingBlock: "0.75rem",
    alignItems: "center",
    backgroundColor: colors.well,
    display: "flex",
    paddingInlineEnd: "1.125rem",
    paddingInlineStart: "0.75rem",
  },
  chip: {
    borderRadius: radius.full,
    alignItems: "center",
    backgroundColor: colors.wellRaised,
    boxShadow: shadows.chip,
    color: colors.primary,
    display: "flex",
    flexShrink: 0,
    justifyContent: "center",
    height: "2.5rem",
    width: "2.5rem",
  },
  chipIdle: {
    color: colors.mutedForeground,
  },
  label: {
    flex: "1",
    fontSize: "0.9375rem",
    fontWeight: 600,
    lineHeight: "1.25rem",
  },
  count: {
    fontFamily: font.mono,
    fontSize: "1rem",
    fontVariantNumeric: "tabular-nums",
    fontWeight: 600,
  },
  countIdle: {
    color: colors.mutedForeground,
  },
})
const getGreeting = (hour: number | null, name: string) => {
  if (hour === null) {
    return m.dashboard_greeting({ name })
  }

  if (hour >= 5 && hour < 12) {
    return m.dashboard_greeting_morning({ name })
  }

  return hour >= 12 && hour < 18
    ? m.dashboard_greeting_afternoon({ name })
    : m.dashboard_greeting_evening({ name })
}

type OverviewPageProps = {
  user: Session["user"]
  range: DashboardRange
  compare: boolean
  queryOptions: ReturnType<typeof dashboardOverviewQueryOptions>
}

export function OverviewPage({ user, range, compare, queryOptions }: OverviewPageProps) {
  const navigate = useNavigate({ from: "/dashboard/" })
  const hour = useClientValue(() => new Date().getHours())
  const query = useQuery(queryOptions)
  const overview = query.data
  const { period, unit } = RANGES[range]
  const byUnit = m.dashboard_card_subtitle({ period: period(), detail: unit() })
  const byReads = m.dashboard_card_subtitle({
    period: period(),
    detail: m.dashboard_detail_reads(),
  })
  const byChapters = m.dashboard_card_subtitle({
    period: period(),
    detail: m.dashboard_detail_chapters(),
  })
  const maxMediaReads = Math.max(1, ...(overview?.topMedias.map(({ reads }) => reads) ?? []))

  return (
    <div sx={styles.page}>
      <div sx={styles.intro}>
        <h1 sx={styles.title}>{getGreeting(hour, user.name)}</h1>
        <p sx={styles.subtitle}>{m.dashboard_overview_subtitle()}</p>
      </div>
      <div sx={styles.controls}>
        <label sx={styles.compare}>
          <Switch
            checked={compare}
            onCheckedChange={(checked) => {
              void navigate({
                search: (previous) => ({ ...previous, compare: checked ? undefined : false }),
                resetScroll: false,
              })
            }}
          />
          {m.dashboard_compare()}
        </label>
        <Tabs
          onValueChange={(value) => {
            const nextRange = DASHBOARD_RANGES.find((option) => option === value)

            if (nextRange !== undefined) {
              void navigate({
                search: (previous) => ({
                  ...previous,
                  range: nextRange === DEFAULT_DASHBOARD_RANGE ? undefined : nextRange,
                }),
                resetScroll: false,
              })
            }
          }}
          sx={styles.ranges}
          value={range}
        >
          <TabsList aria-label={m.dashboard_range_label()}>
            {DASHBOARD_RANGES.map((value) => (
              <TabsTab aria-label={RANGES[value].tab()} key={value} value={value}>
                <span sx={styles.rangeLong}>{RANGES[value].tab()}</span>
                <span sx={styles.rangeShort}>{RANGES[value].short()}</span>
              </TabsTab>
            ))}
          </TabsList>
        </Tabs>
      </div>
      {query.isError && overview === undefined ? (
        <Card sx={styles.error}>
          <p sx={styles.errorText}>{m.dashboard_error()}</p>
          <Button
            onClick={() => {
              void query.refetch()
            }}
            variant="outline"
          >
            {m.dashboard_retry()}
          </Button>
        </Card>
      ) : (
        <div
          aria-busy={query.isPlaceholderData}
          sx={[styles.grid, query.isPlaceholderData && styles.stale]}
        >
          <div sx={kpiStyles.row}>
            {KPIS.map(({ key, label, icon }) => (
              <KpiTile
                compare={compare}
                icon={icon}
                key={key}
                label={label()}
                metric={overview === undefined ? undefined : overview.metrics[key]}
              />
            ))}
            <KpiTile
              compare={compare}
              icon={Comment}
              label={m.dashboard_kpi_comments()}
              metric={null}
            />
          </div>
          <DashboardCard
            figure={<MetricFigure compare={compare} metric={overview?.metrics.reads} />}
            subtitle={byUnit}
            sx={styles.primary}
            title={m.dashboard_reads_title()}
          >
            {overview === undefined ? (
              <CardSkeleton />
            ) : (
              <MetricChart empty={m.dashboard_empty_reads()} metric={overview.metrics.reads}>
                <TrendChart
                  compare={compare}
                  minHeight={260}
                  label={m.dashboard_reads_title()}
                  metric={overview.metrics.reads}
                  overview={overview}
                  ticks={6}
                  tone={colors.primary}
                />
                {compare ? <PeriodLegend shape="line" tone={colors.primary} /> : null}
              </MetricChart>
            )}
          </DashboardCard>
          <DashboardCard
            subtitle={byReads}
            sx={styles.secondary}
            title={m.dashboard_languages_title()}
          >
            {overview === undefined ? <CardSkeleton /> : <LanguageDonut overview={overview} />}
          </DashboardCard>
          <DashboardCard
            figure={<MetricFigure compare={compare} metric={overview?.metrics.chaptersUploaded} />}
            subtitle={byUnit}
            sx={styles.chapters}
            title={m.dashboard_chapters_title()}
          >
            {overview === undefined ? (
              <CardSkeleton />
            ) : (
              <MetricChart
                empty={m.dashboard_empty_uploads()}
                metric={overview.metrics.chaptersUploaded}
              >
                <ChaptersChart
                  compare={compare}
                  overview={overview}
                  previousTone={PREVIOUS_BAR_TONE}
                  tone={CHAPTERS_TONE}
                />
                {compare ? (
                  <PeriodLegend previousTone={PREVIOUS_BAR_TONE} shape="bar" tone={CHAPTERS_TONE} />
                ) : null}
              </MetricChart>
            )}
          </DashboardCard>
          <DashboardCard
            subtitle={byChapters}
            sx={styles.ranking}
            title={m.dashboard_uploaders_title()}
          >
            {overview === undefined ? (
              <CardSkeleton />
            ) : (
              <>
                <TopUploaders
                  compare={compare}
                  overview={overview}
                  previousTone={PREVIOUS_TICK_TONE}
                  tone={CHAPTERS_TONE}
                />
                {compare && overview.topUploaders.length > 0 ? (
                  <PeriodLegend
                    previousTone={PREVIOUS_TICK_TONE}
                    shape="bullet"
                    tone={CHAPTERS_TONE}
                  />
                ) : null}
              </>
            )}
          </DashboardCard>
          <DashboardCard
            subtitle={byReads}
            sx={styles.ranking}
            title={m.dashboard_top_media_title()}
          >
            {overview === undefined ? <CardSkeleton /> : null}
            {overview?.topMedias.length === 0 ? (
              <CardNote>{m.dashboard_empty_reads()}</CardNote>
            ) : null}
            {overview !== undefined && overview.topMedias.length > 0 ? (
              <ol sx={topMediaStyles.list}>
                {overview.topMedias.map((media, index) => (
                  <li key={media.id} sx={topMediaStyles.row}>
                    <span sx={topMediaStyles.rank}>{index + 1}</span>
                    <Cover src={media.coverUrl} sx={topMediaStyles.cover} />
                    <div sx={topMediaStyles.main}>
                      <Link
                        params={{ mediaId: media.id }}
                        to="/media/$mediaId"
                        {...stylex.props(topMediaStyles.title)}
                      >
                        {media.title ?? m.media_untitled()}
                      </Link>
                      <div
                        aria-label={m.dashboard_top_media_reads({
                          reads: formatNumber(media.reads),
                        })}
                        role="img"
                        sx={topMediaStyles.track}
                      >
                        <div
                          style={{ width: `${(media.reads / maxMediaReads) * 100}%` }}
                          sx={topMediaStyles.fill}
                        />
                      </div>
                    </div>
                    <span sx={topMediaStyles.value}>{formatCompact(media.reads)}</span>
                  </li>
                ))}
              </ol>
            ) : null}
          </DashboardCard>
          <DashboardCard
            figure={<MetricFigure compare={compare} metric={overview?.metrics.newAccounts} />}
            subtitle={byUnit}
            sx={styles.signUps}
            title={m.dashboard_sign_ups_title()}
          >
            {overview === undefined ? (
              <CardSkeleton />
            ) : (
              <MetricChart
                empty={m.dashboard_empty_sign_ups()}
                metric={overview.metrics.newAccounts}
              >
                <TrendChart
                  compare={compare}
                  minHeight={200}
                  label={m.dashboard_sign_ups_title()}
                  metric={overview.metrics.newAccounts}
                  overview={overview}
                  ticks={4}
                  tone={SIGN_UPS_TONE}
                />
                {compare ? <PeriodLegend shape="line" tone={SIGN_UPS_TONE} /> : null}
              </MetricChart>
            )}
          </DashboardCard>
          <DashboardCard
            subtitle={m.dashboard_catalog_subtitle()}
            sx={styles.half}
            title={m.dashboard_catalog_title()}
          >
            {overview === undefined ? <CardSkeleton /> : <CatalogMix overview={overview} />}
          </DashboardCard>
          <DashboardCard
            settings={false}
            subtitle={m.dashboard_attention_subtitle()}
            sx={styles.half}
            title={m.dashboard_attention_title()}
          >
            {overview === undefined ? (
              <CardSkeleton />
            ) : (
              <ul sx={attentionStyles.list}>
                {ATTENTION_ITEMS.map(({ key, label, icon: Icon }) => (
                  <li key={key} sx={attentionStyles.row}>
                    <span
                      sx={[
                        attentionStyles.chip,
                        overview.attention[key] === 0 && attentionStyles.chipIdle,
                      ]}
                    >
                      <Icon size={18} />
                    </span>
                    <span sx={attentionStyles.label}>{label()}</span>
                    <span
                      sx={[
                        attentionStyles.count,
                        overview.attention[key] === 0 && attentionStyles.countIdle,
                      ]}
                    >
                      {formatNumber(overview.attention[key])}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </DashboardCard>
          <DashboardCard subtitle={byReads} sx={styles.primary} title={m.dashboard_heatmap_title()}>
            {overview === undefined ? <CardSkeleton /> : <ReadingHeatmap overview={overview} />}
          </DashboardCard>
          <DashboardCard
            settings={false}
            subtitle={m.dashboard_activity_subtitle()}
            sx={styles.activity}
            title={m.dashboard_activity_title()}
          >
            {overview === undefined ? <CardSkeleton /> : <RecentActivity overview={overview} />}
          </DashboardCard>
        </div>
      )}
    </div>
  )
}

function MetricChart({
  metric,
  empty,
  children,
}: {
  metric: DashboardOverview["metrics"]["reads"]
  empty: string
  children: ReactNode
}) {
  return metric.total === 0 && metric.previousTotal === 0 ? <CardNote>{empty}</CardNote> : children
}

function MetricFigure({
  metric,
  compare,
}: {
  metric: DashboardOverview["metrics"]["reads"] | undefined
  compare: boolean
}) {
  if (metric === undefined) {
    return null
  }

  return (
    <div sx={styles.figure}>
      <span sx={styles.figureValue}>{formatCompact(metric.total)}</span>
      {compare ? <Delta value={getDelta(metric.total, metric.previousTotal)} /> : null}
    </div>
  )
}

type KpiTileProps = {
  label: string
  icon: (props: IconProps) => ReactElement
  metric: DashboardOverview["metrics"]["reads"] | null | undefined
  compare: boolean
}

function KpiTile({ label, icon: Icon, metric, compare }: KpiTileProps) {
  const delta = metric && compare ? getDelta(metric.total, metric.previousTotal) : null

  return (
    <Card render={<article />} sx={kpiStyles.tile}>
      <div sx={kpiStyles.label}>
        <Icon {...stylex.props(kpiStyles.icon)} size={16} />
        <span>{label}</span>
      </div>
      {metric === undefined ? (
        <Skeleton sx={kpiStyles.valueSkeleton} />
      ) : (
        <div sx={kpiStyles.value}>{metric === null ? "—" : formatCompact(metric.total)}</div>
      )}
      <div sx={kpiStyles.meta}>
        {metric === null ? (
          <span sx={kpiStyles.untracked}>{m.dashboard_kpi_not_tracked()}</span>
        ) : (
          <Delta value={delta} />
        )}
      </div>
      <div sx={kpiStyles.spark}>
        {metric ? (
          <Sparkline
            label={m.dashboard_kpi_trend({ label })}
            tone={
              metric.total === 0 || (delta !== null && delta < 0)
                ? colors.mutedForeground
                : colors.primary
            }
            values={metric.current}
          />
        ) : null}
      </div>
    </Card>
  )
}

function Sparkline({
  values,
  tone,
  label,
}: {
  values: readonly number[]
  tone: string
  label: string
}) {
  const definition = useMemo(() => {
    const min = Math.min(...values)
    const max = Math.max(...values)

    return defineChart({
      marks: [
        lineY(
          values.map((value, index) => ({ index, value })),
          { x: "index", y: "value", stroke: tone, strokeWidth: 2 },
        ),
      ],
      scales: {
        x: { scale: scaleLinear },
        y: {
          scale: scaleLinear().domain(
            min === max ? [Math.min(min, 0), Math.max(max, 1)] : [min, max],
          ),
        },
      },
      guides: false,
      margin: 3,
      focus: false,
      pointer: false,
      keyboard: false,
      theme: chartTheme,
    })
  }, [values, tone])

  return <Chart ariaLabel={label} definition={definition} height={40} initialWidth={160} />
}
