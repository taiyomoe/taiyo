import * as stylex from "@stylexjs/stylex"
import { colors, motion } from "@taiyomoe/ui/styles/tokens.stylex"
import type { DashboardOverview } from "@/features/dashboard/api/overview"
import { AttentionList } from "@/features/dashboard/components/overview/attention-list"
import { CardSkeleton } from "@/features/dashboard/components/overview/card-skeleton"
import { CatalogMix } from "@/features/dashboard/components/overview/catalog-mix"
import { ChaptersCard } from "@/features/dashboard/components/overview/chapters-card"
import { DashboardCard } from "@/features/dashboard/components/overview/dashboard-card"
import { KpiTiles } from "@/features/dashboard/components/overview/kpi-tiles"
import { LanguageDonut } from "@/features/dashboard/components/overview/language-donut"
import { ReadingHeatmap } from "@/features/dashboard/components/overview/reading-heatmap"
import { RecentActivity } from "@/features/dashboard/components/overview/recent-activity"
import { TopMedias } from "@/features/dashboard/components/overview/top-medias"
import { TrendCard } from "@/features/dashboard/components/overview/trend-card"
import { UploadersCard } from "@/features/dashboard/components/overview/uploaders-card"
import { DASHBOARD_RANGE_LABELS, type DashboardRange } from "@/features/dashboard/lib/dashboard"
import { m } from "@/paraglide/messages"

const SIGN_UPS_TONE = colors.chart3
const CHAPTERS_TONE = colors.chart5
const PREVIOUS_BAR_TONE = `color-mix(in srgb, ${colors.mutedForeground} 45%, ${colors.card})`
const PREVIOUS_TICK_TONE = `color-mix(in srgb, ${colors.foreground} 72%, transparent)`
const styles = stylex.create({
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
})

type OverviewGridProps = {
  overview: DashboardOverview | undefined
  range: DashboardRange
  compare: boolean
  stale: boolean
}

export function OverviewGrid({ overview, range, compare, stale }: OverviewGridProps) {
  const { period, unit } = DASHBOARD_RANGE_LABELS[range]
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
    <div aria-busy={stale} sx={[styles.grid, stale && styles.stale]}>
      <KpiTiles compare={compare} overview={overview} />
      <TrendCard
        compare={compare}
        empty={m.dashboard_empty_reads()}
        metric="reads"
        minHeight={260}
        overview={overview}
        subtitle={byUnit}
        sx={styles.primary}
        ticks={6}
        title={m.dashboard_reads_title()}
        tone={colors.primary}
      />
      <DashboardCard subtitle={byReads} sx={styles.secondary} title={m.dashboard_languages_title()}>
        {overview === undefined ? <CardSkeleton /> : <LanguageDonut overview={overview} />}
      </DashboardCard>
      <ChaptersCard
        compare={compare}
        overview={overview}
        previousTone={PREVIOUS_BAR_TONE}
        subtitle={byUnit}
        sx={styles.chapters}
        tone={CHAPTERS_TONE}
      />
      <UploadersCard
        compare={compare}
        overview={overview}
        previousTone={PREVIOUS_TICK_TONE}
        subtitle={byChapters}
        sx={styles.ranking}
        tone={CHAPTERS_TONE}
      />
      <DashboardCard subtitle={byReads} sx={styles.ranking} title={m.dashboard_top_media_title()}>
        {overview === undefined ? <CardSkeleton /> : <TopMedias overview={overview} />}
      </DashboardCard>
      <TrendCard
        compare={compare}
        empty={m.dashboard_empty_sign_ups()}
        metric="newAccounts"
        minHeight={200}
        overview={overview}
        subtitle={byUnit}
        sx={styles.signUps}
        ticks={4}
        title={m.dashboard_sign_ups_title()}
        tone={SIGN_UPS_TONE}
      />
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
  )
}
