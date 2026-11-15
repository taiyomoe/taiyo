import * as stylex from "@stylexjs/stylex"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { breakpoints, colors, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import type { SearchHit } from "@/features/advanced-search/hooks/use-search-results"
import { ResultStats } from "@/features/advanced-search/components/results/result-stats"
import { ResultSynopsis } from "@/features/advanced-search/components/results/result-synopsis"
import { ResultTags } from "@/features/advanced-search/components/results/result-tags"
import { ResultTitle } from "@/features/advanced-search/components/results/result-title"
import { Cover, CoverSkeleton } from "@/features/media/components/cover"
import { MEDIA_STATUS_BADGES, MEDIA_STATUS_LABELS } from "@/features/media/lib/media-labels"
import { m } from "@/paraglide/messages"

const PADDING = "0.625rem"
const styles = stylex.create({
  card: {
    padding: PADDING,
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: 1,
    gap: { default: "0.875rem", [breakpoints.md]: "1rem" },
    backgroundClip: "padding-box",
    backgroundColor: colors.card,
    boxShadow: shadows.raised,
    display: "grid",
    gridTemplateColumns: {
      default: "5.5rem minmax(0, 1fr)",
      [breakpoints.sm]: "8.5rem minmax(0, 1fr)",
    },
    minWidth: 0,
  },
  coverLink: {
    borderRadius: `calc(${radius.xl} - ${PADDING} - 1px)`,
    alignSelf: "start",
    display: "block",
    outlineColor: colors.ring,
    outlineOffset: 2,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
  },
  cover: {
    borderRadius: `calc(${radius.xl} - ${PADDING} - 1px)`,
    width: "100%",
  },
  body: {
    gap: "0.5rem",
    paddingBlock: "0.125rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    paddingRight: "0.25rem",
  },
  title: {
    fontSize: "1.0625rem",
  },
  meta: {
    gap: "0.75rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  skeletonTitle: {
    height: "1.125rem",
    width: "70%",
  },
  skeletonLine: {
    height: "0.875rem",
    width: "100%",
  },
  skeletonShort: {
    height: "0.875rem",
    width: "45%",
  },
})

export function ResultCard({ hit }: { hit: SearchHit }) {
  return (
    <article sx={styles.card}>
      <Link
        aria-label={hit.mainTitle?.title ?? m.media_untitled()}
        params={{ mediaId: hit.id }}
        tabIndex={-1}
        to="/media/$mediaId"
        {...stylex.props(styles.coverLink)}
      >
        <Cover src={hit.coverUrl} sx={styles.cover} />
      </Link>
      <div sx={styles.body}>
        <ResultTitle hit={hit} sx={styles.title} />
        <div sx={styles.meta}>
          <ResultStats hit={hit} />
          <Badge size="sm" variant={MEDIA_STATUS_BADGES[hit.status]}>
            {MEDIA_STATUS_LABELS[hit.status]()}
          </Badge>
        </div>
        <ResultTags hit={hit} />
        <ResultSynopsis hit={hit} lines={6} />
      </div>
    </article>
  )
}

export function ResultCardSkeleton() {
  return (
    <div aria-hidden sx={styles.card}>
      <CoverSkeleton sx={styles.cover} />
      <div sx={styles.body}>
        <Skeleton sx={styles.skeletonTitle} />
        <Skeleton sx={styles.skeletonShort} />
        <Skeleton sx={styles.skeletonLine} />
        <Skeleton sx={styles.skeletonLine} />
        <Skeleton sx={styles.skeletonShort} />
      </div>
    </div>
  )
}
