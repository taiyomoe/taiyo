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

const PADDING = "0.5rem"
const styles = stylex.create({
  row: {
    padding: PADDING,
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.875rem",
    backgroundClip: "padding-box",
    backgroundColor: colors.card,
    boxShadow: shadows.raised,
    display: "grid",
    gridTemplateColumns: "4.5rem minmax(0, 1fr)",
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
    gap: "0.375rem",
    paddingBlock: "0.125rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    paddingRight: "0.25rem",
  },
  header: {
    alignItems: { default: "flex-start", [breakpoints.md]: "center" },
    columnGap: "1rem",
    display: "flex",
    flexDirection: { default: "column", [breakpoints.md]: "row" },
    justifyContent: "space-between",
    rowGap: "0.5rem",
    minWidth: 0,
  },
  meta: {
    gap: "0.75rem",
    alignItems: "center",
    display: "flex",
    flexShrink: 0,
  },
  skeletonTitle: {
    height: "1rem",
    width: "40%",
  },
  skeletonLine: {
    height: "0.875rem",
    width: "90%",
  },
})

export function ResultRow({ hit }: { hit: SearchHit }) {
  return (
    <article sx={styles.row}>
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
        <div sx={styles.header}>
          <ResultTitle hit={hit} />
          <div sx={styles.meta}>
            <ResultStats hit={hit} />
            <Badge size="sm" variant={MEDIA_STATUS_BADGES[hit.status]}>
              {MEDIA_STATUS_LABELS[hit.status]()}
            </Badge>
          </div>
        </div>
        <ResultTags hit={hit} />
        <ResultSynopsis hit={hit} lines={3} />
      </div>
    </article>
  )
}

export function ResultRowSkeleton() {
  return (
    <div aria-hidden sx={styles.row}>
      <CoverSkeleton sx={styles.cover} />
      <div sx={styles.body}>
        <Skeleton sx={styles.skeletonTitle} />
        <Skeleton sx={styles.skeletonLine} />
        <Skeleton sx={styles.skeletonLine} />
      </div>
    </div>
  )
}
