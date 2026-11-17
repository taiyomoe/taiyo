import * as stylex from "@stylexjs/stylex"
import { BookOpen, User, Users } from "@taiyomoe/ui/components/icons"
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@taiyomoe/ui/components/ui/segmented-control"
import { sceneFont } from "@taiyomoe/ui/styles/scene.stylex"
import { breakpoints, colors, containers, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { CatchBoundary, getRouteApi } from "@tanstack/react-router"
import { Suspense } from "react"
import type { RankingCategory, RankingPeriod } from "@/features/rankings/lib/rankings"
import { pageFrame } from "@/components/layout/page-frame"
import { AppShell } from "@/components/shell/app-shell"
import { navbarBleed } from "@/components/shell/navbar-bleed"
import {
  PERIOD_LABELS,
  RankingBoard,
  RankingBoardError,
  RankingBoardSkeleton,
} from "@/features/rankings/components/ranking-board"
import { flame } from "@/features/rankings/lib/podium.stylex"
import { RANKING_CATEGORIES, RANKING_PERIODS } from "@/features/rankings/lib/rankings"
import { darkThemeClassName } from "@/lib/theme"
import { m } from "@/paraglide/messages"

const routeApi = getRouteApi("/rankings")
const drift = stylex.keyframes({
  "0%": { transform: "translate(0, 0) scale(1)" },
  "100%": { transform: "translate(140px, 70px) scale(1.18)" },
})
const driftBack = stylex.keyframes({
  "0%": { transform: "translate(0, 0) scale(1)" },
  "100%": { transform: "translate(-160px, 50px) scale(1.12)" },
})
const styles = stylex.create({
  root: {
    isolation: "isolate",
    position: "relative",
  },
  // Like a profile banner: the aurora runs edge to edge and under the navbar, then fades out
  // before the board.
  aurora: {
    inset: 0,
    overflow: "hidden",
    maskImage: "linear-gradient(#000 40%, transparent)",
    pointerEvents: "none",
    position: "absolute",
    zIndex: -1,
  },
  blob: {
    borderRadius: "50%",
    animationDirection: "alternate",
    animationDuration: "16s",
    animationIterationCount: "infinite",
    animationName: drift,
    animationTimingFunction: "ease-in-out",
    filter: "blur(100px)",
    position: "absolute",
  },
  blobRed: {
    backgroundColor: colors.primary,
    opacity: 0.5,
    height: "26.25rem",
    left: "4%",
    top: "-11.25rem",
    width: "40rem",
  },
  blobAmber: {
    animationDuration: "19s",
    animationName: driftBack,
    backgroundColor: "#f5a623",
    opacity: 0.38,
    height: "23.75rem",
    right: "4%",
    top: "-8.75rem",
    width: "35rem",
  },
  blobViolet: {
    animationDirection: "alternate-reverse",
    animationDuration: "22s",
    backgroundColor: flame.violet,
    opacity: 0.32,
    height: "21.25rem",
    left: "38%",
    top: "2.5rem",
    width: "32.5rem",
  },
  dots: {
    inset: 0,
    backgroundImage: `radial-gradient(color-mix(in srgb, ${colors.foreground} 9%, transparent) 1px, transparent 1.3px)`,
    backgroundSize: "22px 22px",
    maskImage: "radial-gradient(ellipse 70% 70% at 50% 0%, #000, transparent)",
    position: "absolute",
  },
  hero: {
    position: "relative",
  },
  heroContent: {
    gap: { default: "2rem", [breakpoints.md]: "2.75rem" },
    display: "flex",
    flexDirection: "column",
    paddingBottom: { default: "2rem", [breakpoints.md]: "2.75rem" },
    paddingTop: { default: "2.5rem", [breakpoints.md]: "4.5rem" },
  },
  header: {
    gap: "1rem",
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    textAlign: "center",
  },
  title: {
    margin: 0,
    color: colors.foreground,
    fontFamily: sceneFont.display,
    fontSize: "clamp(3.25rem, 11vw, 5.5rem)",
    fontWeight: 700,
    letterSpacing: "-0.02em",
    lineHeight: 1.2,
  },
  subtitle: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: { default: "1rem", [breakpoints.md]: "1.0625rem" },
    lineHeight: { default: "1.5rem", [breakpoints.md]: "1.625rem" },
    maxWidth: "35rem",
  },
  controls: {
    gap: "0.75rem",
    alignItems: "center",
    containerType: "inline-size",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    minWidth: 0,
  },
  itemIcon: {
    display: { default: "none", [containers.lg]: "block" },
  },
  // The podium is a night scene in both themes, like the shop's treasury: in the dark theme it
  // blends into the page, in the light theme it reads as a dark panel.
  scene: {
    borderRadius: { default: radius.xxl, [breakpoints.md]: radius.xxxl },
    paddingBlock: { default: "1.5rem", [breakpoints.md]: "2rem" },
    paddingInline: { default: "0.75rem", [breakpoints.sm]: "1rem", [breakpoints.md]: "1.5rem" },
    backgroundColor: colors.background,
    color: colors.foreground,
    colorScheme: "dark",
    isolation: "isolate",
    position: "relative",
  },
  board: {
    marginBottom: { default: "3rem", [breakpoints.md]: "5rem" },
    maxWidth: "75rem",
  },
})
const CATEGORY_ITEMS = {
  readers: { icon: User, label: m.rankings_category_readers },
  groups: { icon: Users, label: m.rankings_category_groups },
  titles: { icon: BookOpen, label: m.rankings_category_titles },
} as const

function RankingControls({
  category,
  period,
}: {
  category: RankingCategory
  period: RankingPeriod
}) {
  const navigate = routeApi.useNavigate()

  return (
    <div sx={styles.controls}>
      <SegmentedControl
        aria-label={m.rankings_category_label()}
        onValueChange={(value: RankingCategory) => {
          void navigate({
            resetScroll: false,
            search: (previous) => ({ ...previous, category: value }),
          })
        }}
        value={category}
      >
        {RANKING_CATEGORIES.map((item) => {
          const { icon: Icon, label } = CATEGORY_ITEMS[item]

          return (
            <SegmentedControlItem key={item} value={item}>
              <Icon aria-hidden {...stylex.props(styles.itemIcon)} />
              {label()}
            </SegmentedControlItem>
          )
        })}
      </SegmentedControl>
      <SegmentedControl
        aria-label={m.rankings_period_label()}
        onValueChange={(value: RankingPeriod) => {
          void navigate({
            resetScroll: false,
            search: (previous) => ({ ...previous, period: value }),
          })
        }}
        value={period}
      >
        {RANKING_PERIODS.map((item) => (
          <SegmentedControlItem key={item} value={item}>
            {PERIOD_LABELS[item]()}
          </SegmentedControlItem>
        ))}
      </SegmentedControl>
    </div>
  )
}

export function RankingsPage() {
  const { session } = routeApi.useRouteContext()
  const { category, period } = routeApi.useLoaderDeps()
  const { user } = session
  const scene = stylex.props(styles.scene)

  return (
    <AppShell overlayNavbar user={user}>
      <div data-rankings="" sx={styles.root}>
        <section sx={[styles.hero, navbarBleed.banner]}>
          <div aria-hidden sx={styles.aurora}>
            <span sx={[styles.blob, styles.blobRed]} />
            <span sx={[styles.blob, styles.blobAmber]} />
            <span sx={[styles.blob, styles.blobViolet]} />
            <span sx={styles.dots} />
            <span sx={navbarBleed.scrim} />
          </div>
          <div sx={[pageFrame.frame, styles.heroContent]}>
            <header sx={styles.header}>
              <h1 sx={styles.title}>{m.rankings_title()}</h1>
              <p sx={styles.subtitle}>{m.rankings_subtitle()}</p>
            </header>
            <RankingControls category={category} period={period} />
          </div>
        </section>
        <div sx={[pageFrame.frame, styles.board]}>
          <div className={`${darkThemeClassName} ${scene.className ?? ""}`} style={scene.style}>
            <CatchBoundary
              errorComponent={RankingBoardError}
              getResetKey={() => `${category}:${period}`}
            >
              <Suspense fallback={<RankingBoardSkeleton />}>
                <RankingBoard
                  key={`${category}:${period}`}
                  category={category}
                  period={period}
                  viewer={user}
                />
              </Suspense>
            </CatchBoundary>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
