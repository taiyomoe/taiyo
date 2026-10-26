import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Card } from "@taiyomoe/ui/components/ui/card"
import { Switch } from "@taiyomoe/ui/components/ui/switch"
import { Tabs, TabsList, TabsTab } from "@taiyomoe/ui/components/ui/tabs"
import { colors, motion } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import type {
  DashboardOverview,
  dashboardOverviewQueryOptions,
} from "@/features/dashboard/api/overview"
import type { Session } from "@/lib/session"
import { DashboardIntro } from "@/features/dashboard/components/dashboard-intro"
import { AttentionList } from "@/features/dashboard/components/overview/attention-list"
import { CatalogMix } from "@/features/dashboard/components/overview/catalog-mix"
import { ChaptersChart } from "@/features/dashboard/components/overview/chapters-chart"
import {
  CardFigure,
  CardNote,
  CardSkeleton,
  DashboardCard,
} from "@/features/dashboard/components/overview/dashboard-card"
import { Delta } from "@/features/dashboard/components/overview/delta"
import { KpiTiles } from "@/features/dashboard/components/overview/kpi-tiles"
import { LanguageDonut } from "@/features/dashboard/components/overview/language-donut"
import { PeriodLegend } from "@/features/dashboard/components/overview/period-legend"
import { ReadingHeatmap } from "@/features/dashboard/components/overview/reading-heatmap"
import { RecentActivity } from "@/features/dashboard/components/overview/recent-activity"
import { TopMedias } from "@/features/dashboard/components/overview/top-medias"
import { TopUploaders } from "@/features/dashboard/components/overview/top-uploaders"
import { TrendChart } from "@/features/dashboard/components/overview/trend-chart"
import {
  DEFAULT_DASHBOARD_RANGE,
  DASHBOARD_RANGES,
  type DashboardRange,
} from "@/features/dashboard/lib/dashboard"
import { formatCompact, getDelta } from "@/features/dashboard/lib/format"
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
})
const isRange = (value: unknown): value is DashboardRange =>
  DASHBOARD_RANGES.some((range) => range === value)

type OverviewPageProps = {
  user: Session["user"]
  range: DashboardRange
  compare: boolean
  queryOptions: ReturnType<typeof dashboardOverviewQueryOptions>
}

export function OverviewPage({ user, range, compare, queryOptions }: OverviewPageProps) {
  const navigate = useNavigate({ from: "/dashboard/" })
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

  return (
    <div sx={styles.page}>
      <DashboardIntro name={user.name} subtitle={m.dashboard_overview_subtitle()} />
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
            if (isRange(value)) {
              void navigate({
                search: (previous) => ({
                  ...previous,
                  range: value === DEFAULT_DASHBOARD_RANGE ? undefined : value,
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
          <KpiTiles compare={compare} overview={overview} />
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
            {overview === undefined ? <CardSkeleton /> : <TopMedias overview={overview} />}
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
            {overview === undefined ? <CardSkeleton /> : <AttentionList overview={overview} />}
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
    <CardFigure value={formatCompact(metric.total)}>
      {compare ? <Delta value={getDelta(metric.total, metric.previousTotal)} /> : null}
    </CardFigure>
  )
}
