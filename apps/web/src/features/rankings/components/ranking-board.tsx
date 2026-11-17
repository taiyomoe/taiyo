import type { IconProps } from "@taiyomoe/ui/components/icons"
import type { ReactElement, ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { AlertCircle, BookOpen, Trophy, User, Users } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@taiyomoe/ui/components/ui/empty"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { colors, containers, font, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQueryErrorResetBoundary, useSuspenseQuery } from "@tanstack/react-query"
import type { RankingCategory, RankingPeriod } from "@/features/rankings/lib/rankings"
import type { Session } from "@/lib/session"
import {
  groupsRankingQueryOptions,
  type ReadersRanking,
  readersRankingQueryOptions,
  titlesRankingQueryOptions,
} from "@/features/rankings/api/rankings"
import { RankingPodium } from "@/features/rankings/components/ranking-podium"
import {
  RankingRows,
  StandingInvite,
  StandingRow,
} from "@/features/rankings/components/ranking-rows"
import { flame } from "@/features/rankings/lib/podium.stylex"
import {
  formatCount,
  type RankedEntry,
  toGroupEntries,
  toGroupStanding,
  toReaderEntries,
  toReaderStanding,
  toTitleEntries,
} from "@/features/rankings/lib/ranking-entries"
import { useCountUp } from "@/features/rankings/lib/use-count-up"
import { useSettings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

type Viewer = Session["user"]

const CATEGORY = {
  readers: {
    icon: User,
    label: m.rankings_category_readers,
    description: m.rankings_readers_description,
    total: m.rankings_total_readers,
  },
  groups: {
    icon: Users,
    label: m.rankings_category_groups,
    description: m.rankings_groups_description,
    total: m.rankings_total_groups,
  },
  titles: {
    icon: BookOpen,
    label: m.rankings_category_titles,
    description: m.rankings_titles_description,
    total: m.rankings_total_titles,
  },
} satisfies Record<
  RankingCategory,
  {
    icon: (props: IconProps) => ReactElement
    label: () => string
    description: () => string
    total: () => string
  }
>

export const PERIOD_LABELS = {
  week: m.rankings_period_week,
  month: m.rankings_period_month,
  all: m.rankings_period_all,
} satisfies Record<RankingPeriod, () => string>

const EMPTY = {
  readers: {
    week: m.rankings_empty_readers_week,
    month: m.rankings_empty_readers_month,
    all: m.rankings_empty_readers_all,
  },
  groups: {
    week: m.rankings_empty_groups_week,
    month: m.rankings_empty_groups_month,
    all: m.rankings_empty_groups_all,
  },
  titles: {
    week: m.rankings_empty_titles_week,
    month: m.rankings_empty_titles_month,
    all: m.rankings_empty_titles_all,
  },
} satisfies Record<RankingCategory, Record<RankingPeriod, () => string>>
const styles = stylex.create({
  board: {
    gap: "1.75rem",
    containerType: "inline-size",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    gap: "1rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
  },
  tile: {
    borderRadius: "1.125rem",
    alignItems: "center",
    backgroundImage: `linear-gradient(135deg, ${flame.deep}, ${flame.orange})`,
    boxShadow: "inset 0 1px rgb(255 255 255 / 25%), 0 10px 30px -10px rgb(242 69 45 / 80%)",
    color: "white",
    display: "flex",
    flexShrink: 0,
    justifyContent: "center",
    height: { default: "2.75rem", [containers.lg]: "3.375rem" },
    width: { default: "2.75rem", [containers.lg]: "3.375rem" },
  },
  tileIcon: {
    height: { default: "1.25rem", [containers.lg]: "1.5rem" },
    width: { default: "1.25rem", [containers.lg]: "1.5rem" },
  },
  heading: {
    flexBasis: "15rem",
    flexGrow: "1",
    flexShrink: "1",
    minWidth: 0,
  },
  title: {
    margin: 0,
    fontSize: { default: "1.25rem", [containers.lg]: "1.5rem" },
    fontWeight: 700,
    lineHeight: { default: "1.625rem", [containers.lg]: "1.875rem" },
  },
  description: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    marginTop: "0.25rem",
  },
  total: {
    gap: "0.625rem",
    alignItems: "baseline",
    display: "flex",
    minWidth: 0,
  },
  totalValue: {
    backgroundClip: "text",
    backgroundImage: `linear-gradient(180deg, #ffd9a0, ${flame.orange} 60%, ${colors.primary})`,
    color: "transparent",
    fontFamily: font.mono,
    fontSize: { default: "1.75rem", [containers.lg]: "2.5rem" },
    fontVariantNumeric: "tabular-nums",
    fontWeight: 700,
    letterSpacing: "-0.02em",
    lineHeight: { default: "2rem", [containers.lg]: "2.75rem" },
    overflowWrap: "anywhere",
  },
  totalLabel: {
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
    fontWeight: 600,
    letterSpacing: "0.04em",
    lineHeight: "1rem",
    textTransform: "uppercase",
  },
  empty: {
    borderRadius: radius.xxl,
    paddingBlock: "3rem",
    backgroundColor: `color-mix(in srgb, ${colors.card} 70%, transparent)`,
    boxShadow: `inset 0 0 0 1px ${colors.border}`,
  },
  emptyIcon: {
    backgroundImage: `linear-gradient(135deg, ${flame.deep}, ${flame.orange})`,
    color: "white",
  },
  skeletonPodium: {
    alignItems: "end",
    columnGap: "1rem",
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    paddingTop: "2rem",
  },
  skeletonStep: {
    gap: "0.75rem",
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
  },
  skeletonThumb: {
    borderRadius: radius.full,
    height: { default: "3.5rem", [containers["3xl"]]: "6rem" },
    width: { default: "3.5rem", [containers["3xl"]]: "6rem" },
  },
  skeletonFace: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopLeftRadius: "2rem",
    borderTopRightRadius: "2rem",
    width: "100%",
  },
  skeletonRow: {
    borderRadius: radius.xxl,
    height: { default: "4.5rem", [containers.lg]: "5.375rem" },
  },
  skeletonList: {
    gap: "0.75rem",
    display: "flex",
    flexDirection: "column",
  },
  skeletonHeader: {
    borderRadius: radius.xl,
    height: "3.375rem",
  },
})

function BoardView({
  category,
  period,
  total,
  entries,
  renderStanding,
}: {
  category: RankingCategory
  period: RankingPeriod
  total: number
  entries: readonly RankedEntry[]
  renderStanding?: (progress: number) => ReactNode
}) {
  const progress = useCountUp()
  const standing = renderStanding?.(progress)
  const { icon: Icon, label, description, total: totalLabel } = CATEGORY[category]

  return (
    <section aria-labelledby="ranking-board-title" sx={styles.board}>
      <div sx={styles.header}>
        <span aria-hidden sx={styles.tile}>
          <Icon {...stylex.props(styles.tileIcon)} />
        </span>
        <div sx={styles.heading}>
          <h2 id="ranking-board-title" sx={styles.title}>
            {label()}
          </h2>
          <p sx={styles.description}>
            {description()} · {PERIOD_LABELS[period]()}
          </p>
        </div>
        <div sx={styles.total}>
          <span sx={styles.totalValue}>{formatCount(Math.round(total * progress))}</span>
          <span sx={styles.totalLabel}>{totalLabel()}</span>
        </div>
      </div>
      {entries.length === 0 ? (
        <Empty sx={styles.empty}>
          <EmptyHeader>
            <EmptyMedia sx={styles.emptyIcon} variant="icon">
              <Trophy />
            </EmptyMedia>
            <EmptyTitle>{EMPTY[category][period]()}</EmptyTitle>
            <EmptyDescription>{m.rankings_empty_description()}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <RankingPodium category={category} entries={entries} progress={progress} />
          <RankingRows category={category} entries={entries} progress={progress}>
            {standing}
          </RankingRows>
        </>
      )}
      {entries.length === 0 ? standing : null}
    </section>
  )
}

const EMPTY_STANDING = {
  week: m.rankings_me_empty_week,
  month: m.rankings_me_empty_month,
  all: m.rankings_me_empty_all,
} satisfies Record<RankingPeriod, () => string>

function ReaderStanding({
  ranking,
  period,
  viewer,
  progress,
}: {
  ranking: ReadersRanking
  period: RankingPeriod
  viewer: Viewer
  progress: number
}) {
  const standing = toReaderStanding(ranking, {
    id: viewer.id,
    displayUsername: viewer.displayUsername ?? viewer.name,
    image: viewer.image ?? null,
    avatarBorder: viewer.avatarBorder ?? null,
  })

  if (standing === null) {
    return (
      <StandingInvite
        action={{ label: m.rankings_me_empty_action(), to: "/latest" }}
        description={EMPTY_STANDING[period]()}
        icon={<BookOpen />}
        title={m.rankings_me_empty_title()}
      />
    )
  }

  return <StandingRow category="readers" progress={progress} standing={standing} />
}

function ReadersBoard({ period, viewer }: { period: RankingPeriod; viewer: Viewer }) {
  const { data } = useSuspenseQuery(readersRankingQueryOptions(period, viewer.id))

  return (
    <BoardView
      category="readers"
      entries={toReaderEntries(data)}
      period={period}
      renderStanding={(progress) => (
        <ReaderStanding period={period} progress={progress} ranking={data} viewer={viewer} />
      )}
      total={data.total}
    />
  )
}

function GroupsBoard({ period, viewer }: { period: RankingPeriod; viewer: Viewer }) {
  const { data } = useSuspenseQuery(groupsRankingQueryOptions(period, viewer.id))
  const standing = toGroupStanding(data)

  return (
    <BoardView
      category="groups"
      entries={toGroupEntries(data)}
      period={period}
      renderStanding={(progress) =>
        standing === null ? null : (
          <StandingRow category="groups" progress={progress} standing={standing} />
        )
      }
      total={data.total}
    />
  )
}

function TitlesBoard({ period }: { period: RankingPeriod }) {
  const { contentRatings } = useSettings()
  const { data } = useSuspenseQuery(titlesRankingQueryOptions(period, contentRatings))

  return (
    <BoardView
      category="titles"
      entries={toTitleEntries(data)}
      period={period}
      total={data.total}
    />
  )
}

export function RankingBoard({
  category,
  period,
  viewer,
}: {
  category: RankingCategory
  period: RankingPeriod
  viewer: Viewer
}) {
  if (category === "readers") {
    return <ReadersBoard period={period} viewer={viewer} />
  }

  return category === "groups" ? (
    <GroupsBoard period={period} viewer={viewer} />
  ) : (
    <TitlesBoard period={period} />
  )
}

export function RankingBoardSkeleton() {
  return (
    <div aria-busy aria-label={m.rankings_loading()} role="status" sx={styles.board}>
      <Skeleton sx={styles.skeletonHeader} />
      <div aria-hidden sx={styles.skeletonPodium}>
        {[240, 310, 200].map((height) => (
          <div key={height} sx={styles.skeletonStep}>
            <Skeleton sx={styles.skeletonThumb} />
            <Skeleton style={{ height: `calc(${height}px * 0.6)` }} sx={styles.skeletonFace} />
          </div>
        ))}
      </div>
      <div aria-hidden sx={styles.skeletonList}>
        {Array.from({ length: 7 }, (_, index) => (
          <Skeleton key={index} sx={styles.skeletonRow} />
        ))}
      </div>
    </div>
  )
}

export function RankingBoardError({ reset: retry }: { reset: () => void }) {
  const { reset } = useQueryErrorResetBoundary()

  return (
    <Empty sx={styles.empty}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <AlertCircle />
        </EmptyMedia>
        <EmptyTitle>{m.rankings_error_title()}</EmptyTitle>
        <EmptyDescription>{m.rankings_error_description()}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button
          onClick={() => {
            reset()
            retry()
          }}
          variant="outline"
        >
          {m.rankings_error_retry()}
        </Button>
      </EmptyContent>
    </Empty>
  )
}
