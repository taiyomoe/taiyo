import {
  ArrowDown01Icon,
  Compass01Icon,
  ConstructionIcon,
  LibraryIcon,
  LinkSquare02Icon,
  ServerStack01Icon,
  SmartPhone01Icon,
  Sun03Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import * as stylex from "@stylexjs/stylex"
import { config } from "@taiyomoe/config"
import { ArrowRight, Grid, List, Rows } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { Tabs, TabsList, TabsTab } from "@taiyomoe/ui/components/ui/tabs"
import {
  Tooltip,
  TooltipPopup,
  TooltipPrimitive,
  TooltipTrigger,
} from "@taiyomoe/ui/components/ui/tooltip"
import {
  colors,
  consts,
  font,
  motion,
  radius,
  shadows,
  text,
} from "@taiyomoe/ui/styles/tokens.stylex"
import { noop, useSuspenseQuery } from "@tanstack/react-query"
import { CatchBoundary, createFileRoute, Link } from "@tanstack/react-router"
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react"
import {
  type CSSProperties,
  Suspense,
  useDeferredValue,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react"
import { range } from "remeda"
import { GhostAnchor } from "@/components/buttons/ghost-anchor"
import { SunLink } from "@/components/buttons/sun-button"
import { ChapterGroups, ChapterNumber, TimeAgo } from "@/components/chapters/chapter-meta"
import { LanguageChip, LanguageFlag } from "@/components/chapters/flags"
import { LatestList, layoutStyles, MediaTitleLink } from "@/components/home/latest-update-layouts"
import { Eyebrow, Reveal, Section, SectionHead } from "@/components/landing/landing-atoms"
import { REVIEWS, STATS, TITLES } from "@/components/landing/landing-data"
import { LandingFooter } from "@/components/landing/landing-footer"
import { LandingNav } from "@/components/landing/landing-nav"
import { Cover, CoverSkeleton } from "@/components/media/cover"
import { Animated } from "@/components/scene/animated"
import { Embers } from "@/components/scene/embers"
import { scene, sceneFont } from "@/components/scene/scene.stylex"
import { Stars } from "@/components/scene/stars"
import { SunRays } from "@/components/scene/sun-rays"
import { ContentFilterEmpty } from "@/components/settings/content-filter"
import { AppShell } from "@/components/shell/app-shell"
import { latestChaptersQueryOptions } from "@/lib/queries/chapters"
import { type FeaturedMedia, featuredMediasQueryOptions } from "@/lib/queries/medias"
import {
  getContentRatings,
  type LatestUpdatesLayout,
  useSettings,
  useUpdateSettings,
} from "@/lib/settings"
import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"

type EmblaApi = NonNullable<UseEmblaCarouselType[1]>

const LATEST_UPDATES_PER_PAGE = 12
const SHELVES = range(0, 5)
const PLACEHOLDERS = range(0, 6)
const MAX_GENRES = 8
const LAYOUTS = [
  { value: "LIST", label: m.home_latest_layout_list, icon: List },
  { value: "GRID", label: m.home_latest_layout_grid, icon: Grid },
  { value: "COMPACT", label: m.home_latest_layout_compact, icon: Rows },
] as const satisfies Array<{ value: LatestUpdatesLayout; label: () => string; icon: unknown }>
const STRIP = ["a", "b"].flatMap((copy) =>
  TITLES.map((title) => ({ ...title, key: `${title.id}-${copy}` })),
)
const DEFAULT_GRADIENT: [string, string] = ["#f2452d", "#ffb820"]
const GRADIENTS: Array<[string, string]> = [
  DEFAULT_GRADIENT,
  ["#2e7de0", "#9333ea"],
  ["#1fa85b", "#0ea5a5"],
  ["#8e2015", "#f2452d"],
  ["#cc7a04", "#ffb820"],
  ["#6d28d9", "#2e7de0"],
  ["#db3420", "#6b1810"],
  ["#0f766e", "#1fa85b"],
]
const FLAWS = [
  {
    id: "broken",
    icon: ConstructionIcon,
    title: m.landing_flaw_broken_title,
    body: m.landing_flaw_broken_body,
  },
  {
    id: "catalog",
    icon: LibraryIcon,
    title: m.landing_flaw_catalog_title,
    body: m.landing_flaw_catalog_body,
  },
  {
    id: "kuro",
    icon: LinkSquare02Icon,
    title: m.landing_flaw_kuro_title,
    body: m.landing_flaw_kuro_body,
  },
  {
    id: "servers",
    icon: ServerStack01Icon,
    title: m.landing_flaw_servers_title,
    body: m.landing_flaw_servers_body,
  },
  {
    id: "team",
    icon: UserGroupIcon,
    title: m.landing_flaw_team_title,
    body: m.landing_flaw_team_body,
  },
  {
    id: "app",
    icon: SmartPhone01Icon,
    title: m.landing_flaw_app_title,
    body: m.landing_flaw_app_body,
  },
]
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)"
const progress = stylex.keyframes({
  from: { transform: "translateX(-100%)" },
  to: { transform: "translateX(0)" },
})
const homeStyles = stylex.create({
  page: {
    gap: "3rem",
    paddingBlock: "2rem",
    paddingInline: {
      default: "1.25rem",
      "@media (width >= 48rem)": "2rem",
    },
    display: "flex",
    flexDirection: "column",
  },
  shelf: {
    gap: "1rem",
    display: "flex",
    flexDirection: "column",
  },
  shelfTitle: {
    borderRadius: radius.full,
    backgroundColor: colors.well,
    height: "1.25rem",
    width: "12rem",
  },
  covers: {
    gap: "1rem",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(9rem, 1fr))",
  },
  cover: {
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: 1,
    aspectRatio: "2 / 3",
    backgroundColor: colors.card,
  },
})
const carouselStyles = stylex.create({
  root: {
    position: "relative",
    marginTop: { default: "calc(-1 * var(--navbar-height))", "@media (width >= 50rem)": 0 },
  },
  viewport: {
    overflow: "hidden",
  },
  empty: {
    borderBottomColor: colors.border,
    borderBottomStyle: "solid",
    borderBottomWidth: 1,
    paddingTop: { default: "var(--navbar-height)", "@media (width >= 50rem)": 0 },
  },
  container: {
    display: "flex",
    touchAction: "pan-y pinch-zoom",
  },
  dots: {
    gap: "0.125rem",
    alignItems: "center",
    display: "flex",
    position: "absolute",
    bottom: { default: "0.375rem", "@media (width >= 48rem)": "0.5rem" },
    right: { default: "1rem", "@media (width >= 48rem)": "2.25rem" },
  },
  dot: {
    borderStyle: "none",
    paddingBlock: "0.5rem",
    paddingInline: { default: "0.1875rem", "@media (width >= 48rem)": "0.25rem" },
    backgroundColor: "transparent",
    cursor: "pointer",
    display: "flex",
    outlineStyle: "none",
  },
  pill: {
    borderRadius: "9999px",
    overflow: "hidden",
    backgroundColor: {
      default: `color-mix(in srgb, ${colors.foreground} 32%, transparent)`,
      ":is(:hover > *)": `color-mix(in srgb, ${colors.foreground} 56%, transparent)`,
    },
    outlineColor: colors.ring,
    outlineOffset: 3,
    outlineStyle: {
      default: "none",
      ":is(:focus-visible > *)": "solid",
    },
    outlineWidth: 2,
    transform: "translateZ(0)",
    transitionDuration: {
      default: "520ms",
      "@media (prefers-reduced-motion: reduce)": "0s",
    },
    transitionProperty: "width, background-color",
    transitionTimingFunction: motion.easeOut,
    height: "0.5rem",
    width: "0.5rem",
  },
  pillActive: {
    width: "2rem",
  },
  fill: {
    borderRadius: "inherit",
    backgroundColor: colors.foreground,
    display: "block",
    transform: "translateX(-100%)",
    height: "100%",
    width: "100%",
  },
  fillComplete: {
    transform: "translateX(0)",
  },
  fillRunning: {
    animationDuration: "7s",
    animationFillMode: "both",
    animationName: progress,
    animationTimingFunction: "linear",
    willChange: "transform",
  },
  fillPaused: {
    animationPlayState: "paused",
  },
})
const slideStyles = stylex.create({
  slide: {
    overflow: "hidden",
    flexBasis: "100%",
    flexGrow: 0,
    flexShrink: 0,
    position: "relative",
    userSelect: "none",
    minWidth: 0,
  },
  backdrop: {
    inset: 0,
    overflow: "hidden",
    pointerEvents: "none",
    position: "absolute",
  },
  backdropImage: {
    filter: "blur(4px)",
    objectFit: "cover",
    objectPosition: "50% 30%",
    position: "absolute",
    transform: "scale(1.05)",
    height: "150%",
    left: 0,
    top: 0,
    width: "100%",
  },
  shade: {
    inset: 0,
    backgroundImage: `linear-gradient(to bottom, color-mix(in srgb, ${colors.background} 60%, transparent), ${colors.background})`,
    position: "absolute",
  },
  content: {
    gap: { default: "1.25rem", "@media (width >= 48rem)": "2.5rem" },
    paddingInline: { default: "1.25rem", "@media (width >= 48rem)": "2.5rem" },
    display: "flex",
    position: "relative",
    paddingBottom: { default: "2.25rem", "@media (width >= 48rem)": "2.5rem" },
    paddingTop: {
      default: "calc(var(--navbar-height) + 1.25rem)",
      "@media (width >= 48rem) and (width < 50rem)": "calc(var(--navbar-height) + 2.5rem)",
      "@media (width >= 50rem)": "2.5rem",
    },
  },
  coverLink: {
    borderRadius: radius.lg,
    boxShadow: shadows.overlay,
    display: "block",
    flexShrink: 0,
    outlineColor: colors.ring,
    outlineOffset: 3,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
  },
  cover: {
    height: { default: "10.5rem", "@media (width >= 48rem)": "16.5rem" },
  },
  details: {
    gap: { default: "0.375rem", "@media (width >= 48rem)": "0.75rem" },
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    maxWidth: "52rem",
    minWidth: 0,
  },
  title: {
    margin: 0,
    overflow: "hidden",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 2,
    color: {
      default: colors.foreground,
      ":has(> a:hover)": `color-mix(in srgb, ${colors.foreground} 75%, ${colors.background})`,
    },
    display: "-webkit-box",
    flexShrink: 0,
    fontFamily: font.heading,
    fontSize: { default: text.xl, "@media (width >= 48rem)": "2.5rem" },
    fontWeight: font.weightBold,
    letterSpacing: "-0.02em",
    lineHeight: 1.2,
    overflowWrap: "anywhere",
    transitionDuration: "200ms",
    transitionProperty: "color",
    transitionTimingFunction: motion.easeOut,
  },
  titleLink: {
    borderRadius: radius.sm,
    color: "inherit",
    outlineColor: colors.ring,
    outlineOffset: 2,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    textDecorationLine: "none",
  },
  authors: {
    margin: 0,
    overflow: "hidden",
    color: `color-mix(in srgb, ${colors.foreground} 85%, transparent)`,
    flexShrink: 0,
    fontSize: { default: "0.875rem", "@media (width >= 48rem)": text.base },
    fontWeight: 600,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  genres: {
    margin: 0,
    padding: 0,
    gap: "0.375rem",
    listStyle: "none",
    overflow: "hidden",
    display: { default: "none", "@media (width >= 48rem)": "flex" },
    flexShrink: 0,
    flexWrap: "wrap",
    maxHeight: "1.5rem",
  },
  genre: {
    borderRadius: radius.full,
    overflow: "hidden",
    paddingBlock: "0.25rem",
    paddingInline: "0.625rem",
    backgroundColor: `color-mix(in srgb, ${colors.foreground} 10%, transparent)`,
    color: colors.foreground,
    fontSize: "0.6875rem",
    fontWeight: 700,
    letterSpacing: "0.05em",
    lineHeight: "1rem",
    textOverflow: "ellipsis",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    maxWidth: "100%",
  },
  synopsisBox: {
    overflow: "hidden",
    containerType: "size",
    flexBasis: 0,
    flexGrow: 1,
    fontSize: { default: "0.875rem", "@media (width >= 48rem)": text.lg },
    lineHeight: 1.6,
    minHeight: 0,
  },
  synopsis: {
    margin: 0,
    overflow: "hidden",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: {
      default: 1,
      "@container (height >= 3.2em)": 2,
      "@container (height >= 4.8em)": 3,
      "@container (height >= 6.4em)": 4,
      "@container (height >= 8em)": 5,
      "@container (height >= 9.6em)": 6,
    },
    color: `color-mix(in srgb, ${colors.foreground} 80%, transparent)`,
    display: "-webkit-box",
    overflowWrap: "anywhere",
  },
  skeletonLines: {
    gap: { default: "0.5rem", "@media (width >= 48rem)": "0.75rem" },
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    maxWidth: "36rem",
  },
  skeletonTitle: {
    height: { default: "1.5rem", "@media (width >= 48rem)": "2.5rem" },
    width: "70%",
  },
  skeletonAuthors: {
    height: "1rem",
    width: "40%",
  },
  skeletonLine: {
    height: "0.875rem",
    width: "100%",
  },
  skeletonLineShort: {
    height: "0.875rem",
    width: "60%",
  },
})
const latestStyles = stylex.create({
  section: {
    gap: "1.25rem",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    gap: "1rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  heading: {
    margin: 0,
    gap: "0.75rem",
    alignItems: "center",
    color: colors.foreground,
    display: "flex",
    fontFamily: sceneFont.display,
    fontSize: { default: "1.5rem", "@media (width >= 48rem)": "1.875rem" },
    fontWeight: font.weightBold,
    letterSpacing: "-0.02em",
  },
  accent: {
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    flexShrink: 0,
    height: "0.1875rem",
    width: "1.25rem",
  },
  actions: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
  },
  tab: {
    paddingInline: "0.625rem",
  },
  seeAll: {
    color: colors.mutedForeground,
  },
})
const landingStyles = stylex.create({
  page: {
    backgroundColor: scene.night,
    color: scene.paper,
    overflowX: "hidden",
  },
})
const heroStyles = stylex.create({
  hero: {
    overflow: "hidden",
    paddingInline: "1.5rem",
    alignItems: "center",
    backgroundColor: scene.night,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    position: "relative",
    textAlign: "center",
    minHeight: "100vh",
    paddingBottom: "clamp(10rem, 28vh, 20rem)",
    paddingTop: "7.5rem",
  },
  content: {
    gap: "1.625rem",
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    zIndex: 3,
    maxWidth: "55rem",
  },
  scrim: {
    backgroundImage:
      "radial-gradient(60% 56% at 50% 46%, rgba(14,7,4,0.62), rgba(14,7,4,0.28) 60%, transparent 78%)",
    filter: "blur(8px)",
    pointerEvents: "none",
    position: "absolute",
    transform: "translate(-50%, -50%)",
    zIndex: 1,
    height: "32.5rem",
    left: "50%",
    top: "42%",
    width: "min(51.25rem, 92vw)",
  },
  title: {
    margin: 0,
    color: scene.paper,
    fontFamily: sceneFont.display,
    fontSize: "clamp(2.875rem, 7vw, 5.75rem)",
    fontWeight: font.weightBold,
    letterSpacing: "-0.03em",
    lineHeight: 0.98,
    textShadow: "0 4px 40px rgba(10,5,3,0.6)",
    textWrap: "balance",
  },
  subtitle: {
    margin: 0,
    color: `color-mix(in srgb, ${scene.paper} 74%, transparent)`,
    fontSize: "clamp(1.0625rem, 1.7vw, 1.3125rem)",
    lineHeight: 1.5,
    textWrap: "pretty",
    maxWidth: "35rem",
  },
  actions: {
    gap: "0.875rem",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: "0.375rem",
  },
  rating: {
    gap: "0.625rem",
    alignItems: "center",
    display: "flex",
    marginTop: "0.5rem",
  },
  ratingLabel: {
    color: `color-mix(in srgb, ${scene.paper} 60%, transparent)`,
    fontSize: text.base,
  },
  ratingScore: {
    color: scene.paper,
    fontWeight: font.weightBold,
  },
  scrollCue: {
    insetInline: 0,
    color: `color-mix(in srgb, ${scene.paper} 40%, transparent)`,
    display: "flex",
    justifyContent: "center",
    position: "absolute",
    zIndex: 4,
    bottom: "1.375rem",
  },
})
const sunStyles = stylex.create({
  field: {
    inset: 0,
    overflow: "hidden",
    pointerEvents: "none",
    position: "absolute",
  },
  aurora: {
    inset: "-20% -20% 10% -20%",
    backgroundImage: `radial-gradient(58% 70% at 50% 92%, color-mix(in srgb, ${scene.brand} 50%, transparent), transparent 72%)`,
    filter: "blur(24px)",
    position: "absolute",
  },
  orbit: {
    position: "absolute",
    bottom: {
      default: "calc(20% - var(--sun-size))",
      [consts.sm]: "calc(32% - var(--sun-size))",
    },
    height: "var(--sun-size)",
    left: "50%",
    width: "var(--sun-size)",
  },
  disc: {
    inset: 0,
    borderRadius: "50%",
    backgroundImage: `radial-gradient(circle at 50% 40%, ${scene.goldPale} 0%, #ffd060 26%, ${scene.gold} 46%, ${scene.brand} 70%, #c8301c 100%)`,
    boxShadow: `0 0 140px 40px color-mix(in srgb, #ff8c28 55%, transparent), 0 0 280px 110px color-mix(in srgb, ${scene.gold} 30%, transparent)`,
    position: "absolute",
  },
  vignette: {
    inset: 0,
    backgroundImage: `linear-gradient(180deg, ${scene.night} 0%, color-mix(in srgb, ${scene.night} 34%, transparent) 22%, color-mix(in srgb, ${scene.night} 5%, transparent) 48%, color-mix(in srgb, ${scene.night} 4%, transparent) 72%, color-mix(in srgb, ${scene.night} 35%, transparent) 100%)`,
    position: "absolute",
  },
})
const marqueeStyles = stylex.create({
  band: {
    overflow: "hidden",
    backgroundColor: scene.night,
    position: "relative",
    paddingBottom: "0.625rem",
    paddingTop: "2.5rem",
  },
  fade: {
    inset: 0,
    backgroundImage: `linear-gradient(90deg, ${scene.night} 0%, transparent 12%, transparent 88%, ${scene.night} 100%)`,
    pointerEvents: "none",
    position: "absolute",
    zIndex: 2,
  },
  track: {
    gap: "1.125rem",
    display: "flex",
    width: "max-content",
  },
  slot: {
    flexShrink: 0,
    width: "9.375rem",
  },
  scrim: {
    inset: 0,
    backgroundImage: "linear-gradient(180deg, transparent 55%, rgba(8,4,2,0.85))",
    position: "absolute",
  },
  metaLine: {
    color: `color-mix(in srgb, ${scene.paper} 70%, transparent)`,
    fontFamily: font.mono,
    fontSize: "0.6875rem",
    marginTop: "0.25rem",
  },
})
const coverArtStyles = stylex.create({
  cover: {
    borderRadius: radius.md,
    overflow: "hidden",
    aspectRatio: "2 / 3",
    position: "relative",
    width: "100%",
  },
  caption: {
    inset: 0,
    padding: "0.875rem",
    gap: "0.375rem",
    alignItems: "flex-start",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    position: "absolute",
    zIndex: 2,
  },
  title: {
    color: scene.paper,
    fontFamily: sceneFont.display,
    fontSize: text.base,
    fontWeight: 900,
    lineHeight: 1.15,
    textShadow: "0 2px 8px rgba(0,0,0,0.35)",
    textWrap: "balance",
  },
})
const flawsStyles = stylex.create({
  band: {
    paddingBlock: "clamp(5rem,11vw,8.75rem)",
    backgroundColor: scene.night,
  },
  grid: {
    gap: "1.25rem",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(17.5rem, 1fr))",
    marginTop: "3.5rem",
  },
  card: {
    borderColor: `color-mix(in srgb, ${scene.paper} 10%, transparent)`,
    borderRadius: radius.xxl,
    borderStyle: "solid",
    borderWidth: "1px",
    overflow: "hidden",
    paddingBlock: "2.125rem",
    paddingInline: "1.875rem",
    backgroundImage: `linear-gradient(180deg, color-mix(in srgb, ${scene.paper} 5%, transparent), color-mix(in srgb, ${scene.paper} 2%, transparent))`,
    position: "relative",
    transitionDuration: "200ms",
    transitionProperty: "transform, box-shadow",
    transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
    height: "100%",
  },
  cardHovered: {
    boxShadow: "0 24px 50px rgba(0,0,0,0.45)",
    transform: "translateY(-5px)",
  },
  corona: {
    borderRadius: "50%",
    backgroundImage: `radial-gradient(circle, color-mix(in srgb, ${scene.brand} 50%, transparent), transparent 70%)`,
    filter: "blur(20px)",
    opacity: 0.4,
    position: "absolute",
    transitionDuration: "200ms",
    transitionProperty: "opacity",
    height: "10rem",
    right: "-2.5rem",
    top: "-3.75rem",
    width: "10rem",
  },
  coronaHovered: {
    opacity: 0.9,
  },
  body: {
    position: "relative",
    zIndex: 2,
  },
  glyph: {
    borderRadius: radius.md,
    alignItems: "center",
    backgroundImage: `linear-gradient(140deg, ${scene.brand}, ${scene.gold})`,
    boxShadow: `0 8px 22px color-mix(in srgb, ${scene.brand} 40%, transparent)`,
    color: scene.ink,
    display: "flex",
    justifyContent: "center",
    height: "3.375rem",
    marginBottom: "1.375rem",
    width: "3.375rem",
  },
  title: {
    color: scene.paper,
    fontFamily: sceneFont.display,
    fontSize: text.xl,
    fontWeight: font.weightBold,
    letterSpacing: "-0.01em",
    marginBottom: "0.625rem",
    marginLeft: "0",
    marginRight: "0",
    marginTop: "0",
  },
  text: {
    margin: 0,
    color: `color-mix(in srgb, ${scene.paper} 60%, transparent)`,
    fontSize: text.base,
    lineHeight: 1.6,
  },
})
const statsStyles = stylex.create({
  band: {
    borderBlockStyle: "solid",
    paddingBlock: "clamp(3.375rem,7vw,5.25rem)",
    backgroundColor: scene.nightRaised,
    borderBlockColor: `color-mix(in srgb, ${scene.paper} 7%, transparent)`,
    borderBlockWidth: "1px",
  },
  grid: {
    columnGap: "1.25rem",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(11.25rem, 1fr))",
    rowGap: "2.5rem",
    textAlign: "center",
  },
  value: {
    backgroundClip: "text",
    backgroundImage: `linear-gradient(180deg, ${scene.goldPale}, ${scene.gold})`,
    color: "transparent",
    fontFamily: sceneFont.display,
    fontSize: "clamp(2.5rem, 5vw, 3.75rem)",
    fontWeight: font.weightBold,
    lineHeight: 1,
  },
  label: {
    color: `color-mix(in srgb, ${scene.paper} 55%, transparent)`,
    fontSize: "0.875rem",
    marginTop: "0.625rem",
  },
})
const reviewsStyles = stylex.create({
  band: {
    paddingBlock: "clamp(5rem,11vw,8.75rem)",
    backgroundColor: scene.night,
  },
  columns: {
    columnGap: "1.25rem",
    columnWidth: "21.25rem",
    marginTop: "3.375rem",
  },
  item: {
    breakInside: "avoid",
    marginBottom: "1.25rem",
  },
  card: {
    borderColor: `color-mix(in srgb, ${scene.paper} 10%, transparent)`,
    borderRadius: radius.xxl,
    borderStyle: "solid",
    borderWidth: "1px",
    backgroundImage: `linear-gradient(180deg, color-mix(in srgb, ${scene.paper} 5%, transparent), color-mix(in srgb, ${scene.paper} 2%, transparent))`,
    paddingBottom: "1.5rem",
    paddingLeft: "1.625rem",
    paddingRight: "1.625rem",
    paddingTop: "1.625rem",
  },
  quote: {
    color: scene.paper,
    fontFamily: sceneFont.display,
    fontSize: text.xl,
    fontStyle: "italic",
    fontWeight: font.weightBold,
    lineHeight: 1.32,
    textWrap: "pretty",
    marginBottom: "1.25rem",
    marginLeft: "0",
    marginRight: "0",
    marginTop: "0.9375rem",
  },
  author: {
    gap: "0.6875rem",
    alignItems: "center",
    display: "flex",
  },
  avatar: {
    borderRadius: "50%",
    alignItems: "center",
    backgroundImage: `linear-gradient(140deg, ${scene.brand}, ${scene.gold})`,
    color: scene.ink,
    display: "flex",
    flexShrink: 0,
    fontFamily: sceneFont.display,
    fontSize: "1rem",
    fontWeight: font.weightBold,
    justifyContent: "center",
    height: "2.375rem",
    width: "2.375rem",
  },
  who: {
    color: scene.paper,
    fontSize: "0.875rem",
    fontWeight: font.weightBold,
  },
  role: {
    color: `color-mix(in srgb, ${scene.paper} 50%, transparent)`,
    fontSize: "0.75rem",
  },
})
const ctaStyles = stylex.create({
  band: {
    paddingBlock: "clamp(4.375rem,10vw,7.5rem)",
    paddingInline: "clamp(1.25rem,4vw,2.5rem)",
    backgroundColor: scene.night,
  },
  banner: {
    borderColor: `color-mix(in srgb, ${scene.gold} 30%, transparent)`,
    borderRadius: radius.xxl,
    borderStyle: "solid",
    borderWidth: "1px",
    marginInline: "auto",
    overflow: "hidden",
    paddingBlock: "clamp(3rem,7vw,5.25rem)",
    paddingInline: "clamp(1.75rem,6vw,4.75rem)",
    backgroundImage: `linear-gradient(118deg, #5c1b11 0%, #7d2014 36%, #a92a18 70%, #c8341e 100%)`,
    boxShadow: "0 40px 90px rgba(0,0,0,0.5)",
    position: "relative",
    maxWidth: "68.75rem",
  },
  corona: {
    borderRadius: "50%",
    backgroundImage: `radial-gradient(circle, color-mix(in srgb, ${scene.goldLight} 55%, transparent), color-mix(in srgb, ${scene.brand} 20%, transparent) 45%, transparent 70%)`,
    filter: "blur(20px)",
    position: "absolute",
    height: "32.5rem",
    right: "-12%",
    top: "-40%",
    width: "32.5rem",
  },
  kanji: {
    color: `color-mix(in srgb, ${scene.paper} 6%, transparent)`,
    fontFamily: sceneFont.display,
    fontSize: "clamp(12.5rem, 32vw, 26.25rem)",
    fontWeight: font.weightBold,
    lineHeight: 0.8,
    pointerEvents: "none",
    position: "absolute",
    transform: "translateY(-50%)",
    userSelect: "none",
    right: "clamp(-1.875rem, 2vw, 2.5rem)",
    top: "50%",
  },
  content: {
    gap: "1.375rem",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    zIndex: 2,
    maxWidth: "35rem",
  },
  title: {
    margin: 0,
    color: scene.paper,
    fontFamily: sceneFont.display,
    fontSize: "clamp(2.25rem, 5.4vw, 3.875rem)",
    fontWeight: font.weightBold,
    letterSpacing: "-0.02em",
    lineHeight: 1.02,
    textWrap: "balance",
  },
  body: {
    margin: 0,
    color: `color-mix(in srgb, ${scene.paper} 82%, transparent)`,
    fontSize: text.xl,
    lineHeight: 1.5,
    textWrap: "pretty",
  },
  actions: {
    gap: "0.875rem",
    display: "flex",
    flexWrap: "wrap",
    marginTop: "0.375rem",
  },
})
const layoutTooltip = TooltipPrimitive.createHandle<string>()
const subscribeToReducedMotion = (onChange: () => void) => {
  const query = matchMedia(REDUCED_MOTION_QUERY)

  query.addEventListener("change", onChange)

  return () => {
    query.removeEventListener("change", onChange)
  }
}
const subscribeToVisibility = (onChange: () => void) => {
  document.addEventListener("visibilitychange", onChange)

  return () => {
    document.removeEventListener("visibilitychange", onChange)
  }
}

export const Route = createFileRoute("/")({
  head: ({ match }) => ({
    meta: match.context.session
      ? []
      : [
          { title: m.landing_meta_title() },
          { name: "description", content: m.landing_meta_description() },
        ],
  }),
  loader: async ({ context }) => {
    if (context.session) {
      const contentRatings = getContentRatings(context.session)
      const prefetch = Promise.all([
        context.queryClient.query(featuredMediasQueryOptions(contentRatings)).catch(noop),
        context.queryClient
          .query(latestChaptersQueryOptions(contentRatings, LATEST_UPDATES_PER_PAGE))
          .catch(noop),
      ])

      if (import.meta.env.SSR) {
        await prefetch
      }
    }
  },
  component: function Index() {
    const { session } = Route.useRouteContext()
    const trackProps = stylex.props(marqueeStyles.track)

    return session ? (
      <AppShell overlayNavbar user={session.user}>
        <CatchBoundary errorComponent={() => null} getResetKey={() => "featured"}>
          <Suspense
            fallback={
              <div sx={carouselStyles.root}>
                <div aria-hidden sx={slideStyles.slide}>
                  <div sx={slideStyles.backdrop}>
                    <div sx={slideStyles.shade} />
                  </div>
                  <div sx={slideStyles.content}>
                    <CoverSkeleton sx={slideStyles.cover} />
                    <div sx={slideStyles.skeletonLines}>
                      <Skeleton sx={slideStyles.skeletonTitle} />
                      <Skeleton sx={slideStyles.skeletonAuthors} />
                      <Skeleton sx={slideStyles.skeletonLine} />
                      <Skeleton sx={slideStyles.skeletonLine} />
                      <Skeleton sx={slideStyles.skeletonLineShort} />
                    </div>
                  </div>
                </div>
              </div>
            }
          >
            <FeaturedCarousel />
          </Suspense>
        </CatchBoundary>
        <div sx={homeStyles.page}>
          <LatestUpdates />
          {SHELVES.map((shelf) => (
            <section key={shelf} sx={homeStyles.shelf}>
              <div sx={homeStyles.shelfTitle} />
              <div sx={homeStyles.covers}>
                {PLACEHOLDERS.map((cover) => (
                  <div key={cover} sx={homeStyles.cover} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </AppShell>
    ) : (
      <div data-landing sx={landingStyles.page}>
        <LandingNav />
        <LandingHero />
        <section id="titles" sx={marqueeStyles.band}>
          <div sx={marqueeStyles.fade} />
          <div
            className={trackProps.className}
            style={{ ...trackProps.style, animation: "scene-marquee 48s linear infinite" }}
          >
            {STRIP.map((title) => {
              let hash = 0

              for (let i = 0; i < title.title.length; i++) {
                hash = (hash * 31 + title.title.charCodeAt(i)) | 0
              }

              const [from, to] = GRADIENTS[Math.abs(hash) % GRADIENTS.length] ?? DEFAULT_GRADIENT
              const coverProps = stylex.props(coverArtStyles.cover)

              return (
                <div key={title.key} sx={marqueeStyles.slot}>
                  <div
                    className={coverProps.className}
                    style={{
                      ...coverProps.style,
                      backgroundImage: `linear-gradient(150deg, ${from}, ${to})`,
                      boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                    }}
                  >
                    <div sx={marqueeStyles.scrim} />
                    <div sx={coverArtStyles.caption}>
                      <span sx={coverArtStyles.title}>{title.title}</span>
                      <div>
                        <Stars filled={Math.round(title.rating)} size={12} />
                        <div sx={marqueeStyles.metaLine}>
                          {title.chapters} ch · {title.tag}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
        <section sx={flawsStyles.band}>
          <Section>
            <Reveal>
              <SectionHead
                centered
                eyebrow={m.landing_flaws_eyebrow()}
                title={m.landing_flaws_title()}
                sub={m.landing_flaws_subtitle()}
              />
            </Reveal>
            <div sx={flawsStyles.grid}>
              {FLAWS.map((flaw, i) => (
                <Reveal key={flaw.id} delay={i * 90}>
                  <FlawCard icon={flaw.icon} title={flaw.title()} body={flaw.body()} />
                </Reveal>
              ))}
            </div>
          </Section>
        </section>
        <section sx={statsStyles.band}>
          <Section>
            <div sx={statsStyles.grid}>
              {STATS.map((stat, i) => (
                <Reveal key={stat.value} delay={i * 70}>
                  <div sx={statsStyles.value}>{stat.value}</div>
                  <div sx={statsStyles.label}>{stat.label()}</div>
                </Reveal>
              ))}
            </div>
          </Section>
        </section>
        <section id="reviews" sx={reviewsStyles.band}>
          <Section>
            <Reveal>
              <SectionHead
                centered
                eyebrow={m.landing_reviews_eyebrow()}
                title={m.landing_reviews_title()}
                sub={m.landing_reviews_subtitle()}
              />
            </Reveal>
            <div sx={reviewsStyles.columns}>
              {REVIEWS.map((review, i) => {
                const who = review.who()

                return (
                  <div key={who} sx={reviewsStyles.item}>
                    <Reveal delay={(i % 3) * 80}>
                      <div sx={reviewsStyles.card}>
                        <Stars filled={1} />
                        <p sx={reviewsStyles.quote}>“{review.quote()}”</p>
                        <div sx={reviewsStyles.author}>
                          <span sx={reviewsStyles.avatar}>{who.charAt(0).toUpperCase()}</span>
                          <div>
                            <div sx={reviewsStyles.who}>{who}</div>
                            <div sx={reviewsStyles.role}>{review.role()}</div>
                          </div>
                        </div>
                      </div>
                    </Reveal>
                  </div>
                )
              })}
            </div>
          </Section>
        </section>
        <section sx={ctaStyles.band}>
          <div sx={ctaStyles.banner}>
            <div sx={ctaStyles.corona} />
            <div aria-hidden sx={ctaStyles.kanji}>
              太
            </div>
            <div sx={ctaStyles.content}>
              <Eyebrow>{m.landing_cta_eyebrow()}</Eyebrow>
              <h2 sx={ctaStyles.title}>{m.landing_cta_title()}</h2>
              <p sx={ctaStyles.body}>{m.landing_cta_body()}</p>
              <div sx={ctaStyles.actions}>
                <SunLink to="/auth/sign-up">
                  <HugeiconsIcon icon={Sun03Icon} size={20} />
                  {m.landing_cta_primary()}
                </SunLink>
                <GhostAnchor href="#titles">{m.landing_cta_secondary()}</GhostAnchor>
              </div>
            </div>
          </div>
        </section>
        <LandingFooter />
      </div>
    )
  },
})

function FeaturedCarousel() {
  const contentRatings = useDeferredValue(useSettings().contentRatings)
  const { data: medias } = useSuspenseQuery(featuredMediasQueryOptions(contentRatings))

  if (medias.length > 0) {
    return <FeaturedCarouselView key={medias.map((media) => media.id).join()} medias={medias} />
  }

  return (
    <div sx={[carouselStyles.root, carouselStyles.empty]}>
      <ContentFilterEmpty
        description={m.home_featured_empty_description()}
        title={m.home_featured_empty_title()}
      />
    </div>
  )
}

function FeaturedCarouselView({ medias }: { medias: FeaturedMedia[] }) {
  const [viewportRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 32 })
  const [selected, setSelected] = useState(0)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [dragging, setDragging] = useState(false)
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    () => matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  )
  const hidden = useSyncExternalStore(
    subscribeToVisibility,
    () => document.hidden,
    () => false,
  )
  const autoplay = emblaApi !== undefined && medias.length > 1 && !reducedMotion
  const paused = hovered || focused || dragging || hidden

  useEffect(() => {
    const onSelect = (api: EmblaApi) => {
      setSelected(api.selectedSnap())
    }
    const onPointerDown = () => {
      setDragging(true)
    }
    const onPointerUp = () => {
      setDragging(false)
    }

    emblaApi?.on("select", onSelect)
    emblaApi?.on("pointerdown", onPointerDown)
    emblaApi?.on("pointerup", onPointerUp)

    return () => {
      emblaApi?.off("select", onSelect)
      emblaApi?.off("pointerdown", onPointerDown)
      emblaApi?.off("pointerup", onPointerUp)
    }
  }, [emblaApi])

  return (
    <section
      aria-label={m.home_featured_label()}
      aria-roledescription="carousel"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setFocused(false)
        }
      }}
      onFocus={(event) => {
        if (event.target.matches(":focus-visible")) {
          setFocused(true)
        }
      }}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") {
          setHovered(true)
        }
      }}
      onPointerLeave={() => {
        setHovered(false)
      }}
      sx={carouselStyles.root}
    >
      <div ref={viewportRef} sx={carouselStyles.viewport}>
        <div sx={carouselStyles.container}>
          {medias.map((media, index) => {
            const backdropUrl = media.bannerUrl ?? media.coverUrl
            const localized =
              media.synopsis[getLocale()] ?? media.synopsis.en ?? Object.values(media.synopsis)[0]
            const synopsis =
              localized === undefined
                ? ""
                : (localized.split(/\n\s*(?:-{3,}|_{3,}|\*{3,})\s*\n/)[0] ?? "")
                    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
                    .replace(/[*_`#>~]+/g, "")
                    .replace(/\s+/g, " ")
                    .trim()
            const genres = media.tags
              .filter((key): key is keyof typeof config.tags => key in config.tags)
              .map((key) => config.tags[key])
              .filter((tag) => tag.category === "Genre")
              .slice(0, MAX_GENRES)
              .map((tag) => tag.name.en)
            const eager = index === 0

            return (
              <div
                key={media.id}
                aria-label={m.home_featured_slide({ index: index + 1, total: medias.length })}
                aria-roledescription="slide"
                role="group"
                sx={slideStyles.slide}
              >
                <div aria-hidden sx={slideStyles.backdrop}>
                  {backdropUrl === null ? null : (
                    <img
                      alt=""
                      decoding={eager ? "sync" : "async"}
                      draggable={false}
                      fetchPriority={eager ? "high" : "low"}
                      src={backdropUrl}
                      sx={slideStyles.backdropImage}
                    />
                  )}
                  <div sx={slideStyles.shade} />
                </div>
                <div sx={slideStyles.content}>
                  <Link
                    aria-label={media.title ?? undefined}
                    draggable={false}
                    params={{ mediaId: media.id }}
                    {...stylex.props(slideStyles.coverLink)}
                    to="/media/$mediaId"
                  >
                    <Cover
                      priority={eager ? "high" : "low"}
                      src={media.coverUrl}
                      sx={slideStyles.cover}
                    />
                  </Link>
                  <div sx={slideStyles.details}>
                    <h2 sx={slideStyles.title}>
                      <Link
                        draggable={false}
                        params={{ mediaId: media.id }}
                        {...stylex.props(slideStyles.titleLink)}
                        to="/media/$mediaId"
                      >
                        {media.title}
                      </Link>
                    </h2>
                    {media.authors.length > 0 ? (
                      <p sx={slideStyles.authors}>{media.authors.join(", ")}</p>
                    ) : null}
                    {genres.length > 0 ? (
                      <ul sx={slideStyles.genres}>
                        {genres.map((genre) => (
                          <li key={genre} sx={slideStyles.genre}>
                            {genre}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    {synopsis === "" ? null : (
                      <div sx={slideStyles.synopsisBox}>
                        <p sx={slideStyles.synopsis}>{synopsis}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      {medias.length > 1 ? (
        <div sx={carouselStyles.dots}>
          {medias.map((media, index) => {
            const active = index === selected

            return (
              <button
                key={media.id}
                aria-current={active}
                aria-label={m.home_featured_go_to({ title: media.title ?? index + 1 })}
                onClick={() => emblaApi?.goTo(index)}
                sx={carouselStyles.dot}
                type="button"
              >
                <span sx={[carouselStyles.pill, active && carouselStyles.pillActive]}>
                  {active ? (
                    <span
                      onAnimationEnd={() => emblaApi?.goToNext()}
                      sx={[
                        carouselStyles.fill,
                        reducedMotion && carouselStyles.fillComplete,
                        autoplay && carouselStyles.fillRunning,
                        paused && carouselStyles.fillPaused,
                      ]}
                    />
                  ) : null}
                </span>
              </button>
            )
          })}
        </div>
      ) : null}
    </section>
  )
}

function LatestUpdates() {
  const { latestUpdatesLayout } = useSettings()
  const updateSettings = useUpdateSettings()
  let skeleton = (
    <ul aria-hidden sx={layoutStyles.list}>
      {range(0, LATEST_UPDATES_PER_PAGE).map((index) => (
        <li key={index} sx={layoutStyles.row}>
          <CoverSkeleton sx={[layoutStyles.rowCover, layoutStyles.rowCoverImage]} />
          <div sx={[layoutStyles.inline, layoutStyles.rowMain]}>
            <Skeleton sx={layoutStyles.skeletonTitle} />
          </div>
          <div sx={layoutStyles.rowMeta}>
            <Skeleton sx={layoutStyles.skeletonMeta} />
          </div>
          <Skeleton sx={[layoutStyles.rowTime, layoutStyles.skeletonTime]} />
        </li>
      ))}
    </ul>
  )

  if (latestUpdatesLayout === "GRID") {
    skeleton = (
      <ul aria-hidden sx={layoutStyles.grid}>
        {range(0, LATEST_UPDATES_PER_PAGE).map((index) => (
          <li key={index} sx={layoutStyles.card}>
            <CoverSkeleton sx={layoutStyles.cardCover} />
            <div sx={layoutStyles.cardBody}>
              <Skeleton sx={layoutStyles.skeletonCardTitle} />
              <Skeleton sx={layoutStyles.skeletonCardMeta} />
            </div>
          </li>
        ))}
      </ul>
    )
  } else if (latestUpdatesLayout === "COMPACT") {
    skeleton = (
      <ul aria-hidden sx={layoutStyles.compact}>
        {range(0, LATEST_UPDATES_PER_PAGE).map((index) => (
          <li key={index} sx={layoutStyles.compactRow}>
            <span />
            <Skeleton sx={layoutStyles.skeletonTitle} />
            <Skeleton sx={layoutStyles.skeletonTime} />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <section aria-labelledby="latest-updates" sx={latestStyles.section}>
      <div sx={latestStyles.header}>
        <h2 id="latest-updates" sx={latestStyles.heading}>
          <span aria-hidden sx={latestStyles.accent} />
          {m.home_latest_title()}
        </h2>
        <div sx={latestStyles.actions}>
          <Tabs
            onValueChange={(value) => {
              const layout = LAYOUTS.find((option) => option.value === value)

              if (layout !== undefined) {
                updateSettings.mutate({ latestUpdatesLayout: layout.value })
              }
            }}
            value={latestUpdatesLayout}
          >
            <TabsList aria-label={m.home_latest_layout()}>
              {LAYOUTS.map(({ value, label, icon: Icon }) => (
                <TooltipTrigger
                  key={value}
                  delay={300}
                  handle={layoutTooltip}
                  payload={label()}
                  render={<TabsTab aria-label={label()} sx={latestStyles.tab} value={value} />}
                >
                  <Icon size={18} />
                </TooltipTrigger>
              ))}
            </TabsList>
          </Tabs>
          <Tooltip handle={layoutTooltip}>
            {({ payload }) => (
              <TooltipPopup arrow side="top">
                {payload}
              </TooltipPopup>
            )}
          </Tooltip>
          <Button render={<Link to="/latest" />} size="sm" sx={latestStyles.seeAll} variant="ghost">
            {m.home_latest_see_all()}
            <ArrowRight />
          </Button>
        </div>
      </div>
      <CatchBoundary errorComponent={() => null} getResetKey={() => "latest"}>
        <Suspense fallback={skeleton}>
          <LatestUpdatesContent layout={latestUpdatesLayout} />
        </Suspense>
      </CatchBoundary>
    </section>
  )
}

function LatestUpdatesContent({ layout }: { layout: LatestUpdatesLayout }) {
  const contentRatings = useDeferredValue(useSettings().contentRatings)
  const { data: chapters } = useSuspenseQuery(
    latestChaptersQueryOptions(contentRatings, LATEST_UPDATES_PER_PAGE),
  )

  if (chapters.length === 0) {
    return (
      <ContentFilterEmpty
        description={m.latest_empty_description()}
        title={m.latest_empty_title()}
      />
    )
  }

  if (layout === "GRID") {
    return (
      <ul sx={layoutStyles.grid}>
        {chapters.map((chapter) => (
          <li key={chapter.id} sx={layoutStyles.card}>
            <Link
              aria-label={chapter.mediaTitle ?? m.media_untitled()}
              params={{ mediaId: chapter.mediaId }}
              tabIndex={-1}
              to="/media/$mediaId"
              {...stylex.props(layoutStyles.cardCoverLink)}
            >
              <Cover src={chapter.mediaCoverUrl} sx={layoutStyles.cardCover} />
              <span sx={layoutStyles.cardLanguage}>
                <LanguageChip language={chapter.language} />
              </span>
            </Link>
            <div sx={layoutStyles.cardBody}>
              <MediaTitleLink chapter={chapter} sx={layoutStyles.cardTitle} />
              <div sx={layoutStyles.cardMeta}>
                <ChapterNumber number={chapter.number} />
                <TimeAgo date={chapter.createdAt} />
              </div>
            </div>
          </li>
        ))}
      </ul>
    )
  }

  return layout === "COMPACT" ? (
    <ul sx={layoutStyles.compact}>
      {chapters.map((chapter) => (
        <li key={chapter.id} sx={layoutStyles.compactRow}>
          <span sx={layoutStyles.compactFlag}>
            <LanguageFlag language={chapter.language} />
          </span>
          <div sx={layoutStyles.inline}>
            <MediaTitleLink chapter={chapter} />
            <ChapterNumber number={chapter.number} />
            {chapter.title === null ? null : (
              <span sx={layoutStyles.chapterTitle}>{chapter.title}</span>
            )}
          </div>
          <ChapterGroups groups={chapter.groups} sx={layoutStyles.compactGroups} />
          <TimeAgo date={chapter.createdAt} sx={layoutStyles.compactTime} />
        </li>
      ))}
    </ul>
  ) : (
    <LatestList chapters={chapters} />
  )
}

const LandingHero = () => {
  const [parallax, setParallax] = useState({ x: 0, y: 0 })

  return (
    <section
      sx={heroStyles.hero}
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()

        setParallax({
          x: ((event.clientX - rect.left - rect.width / 2) / rect.width) * 40,
          y: ((event.clientY - rect.top - rect.height / 2) / rect.height) * 40,
        })
      }}
    >
      <div sx={sunStyles.field}>
        <Animated sx={sunStyles.aurora} animation="scene-aurora 16s ease-in-out infinite" />
        <Animated
          sx={sunStyles.orbit}
          style={
            {
              "--sun-size": "70vw",
              transform: `translate(calc(-50% + ${parallax.x * -0.9}px), ${parallax.y * -0.6}px)`,
            } as CSSProperties
          }
        >
          <SunRays
            count={52}
            innerRadius="calc(var(--sun-size) / 2)"
            minReach={0.22}
            maxReach={0.62}
            minWidth={5}
            maxWidth={14}
            spinSeconds={130}
          />
          <Animated sx={sunStyles.disc} animation="scene-sun-breathe 7s ease-in-out infinite" />
        </Animated>
        <div sx={sunStyles.vignette} />
      </div>
      <Embers count={30} />
      <div sx={heroStyles.scrim} />

      <div sx={heroStyles.content}>
        <Eyebrow centered>{m.landing_hero_eyebrow()}</Eyebrow>
        <h1 sx={heroStyles.title}>{m.landing_hero_title()}</h1>
        <p sx={heroStyles.subtitle}>{m.landing_hero_subtitle()}</p>
        <div sx={heroStyles.actions}>
          <SunLink to="/auth/sign-up">
            <HugeiconsIcon icon={Sun03Icon} size={20} />
            {m.landing_hero_cta_primary()}
          </SunLink>
          <GhostAnchor href="#titles">
            <HugeiconsIcon icon={Compass01Icon} size={19} />
            {m.landing_hero_cta_secondary()}
          </GhostAnchor>
        </div>
        <div sx={heroStyles.rating}>
          <Stars filled={5} size={16} />
          <span sx={heroStyles.ratingLabel}>
            <b sx={heroStyles.ratingScore}>{m.landing_hero_rating_score()}</b>{" "}
            {m.landing_hero_rating_label()}
          </span>
        </div>
      </div>

      <a href="#titles" aria-label={m.landing_hero_scroll_hint()} sx={heroStyles.scrollCue}>
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          size={22}
          style={{ animation: "scene-bob 2.4s ease-in-out infinite" }}
        />
      </a>
    </section>
  )
}
const FlawCard = ({ icon, title, body }: { icon: IconSvgElement; title: string; body: string }) => {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      sx={[flawsStyles.card, hovered && flawsStyles.cardHovered]}
      onMouseEnter={() => {
        setHovered(true)
      }}
      onMouseLeave={() => {
        setHovered(false)
      }}
    >
      <div sx={[flawsStyles.corona, hovered && flawsStyles.coronaHovered]} />
      <div sx={flawsStyles.body}>
        <div sx={flawsStyles.glyph}>
          <HugeiconsIcon icon={icon} size={26} />
        </div>
        <h3 sx={flawsStyles.title}>{title}</h3>
        <p sx={flawsStyles.text}>{body}</p>
      </div>
    </div>
  )
}
