import * as stylex from "@stylexjs/stylex"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { colors, font, motion, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import type { SearchHit } from "@/features/advanced-search/hooks/use-search-results"
import { CountryFlag } from "@/components/flags/flags"
import { TimeAgo } from "@/components/time/time-ago"
import { Cover, CoverSkeleton } from "@/features/media/components/cover"
import { MEDIA_TYPE_LABELS } from "@/features/media/lib/media-labels"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  card: {
    gap: "0.625rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  coverLink: {
    borderRadius: radius.lg,
    boxShadow: shadows.raised,
    display: "block",
    outlineColor: colors.ring,
    outlineOffset: 3,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    position: "relative",
  },
  cover: {
    width: "100%",
  },
  flag: {
    display: "inline-flex",
    position: "absolute",
    left: "0.5rem",
    top: "0.5rem",
  },
  body: {
    gap: "0.25rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  title: {
    overflow: "hidden",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 2,
    color: {
      default: colors.foreground,
      ":hover": `color-mix(in srgb, ${colors.foreground} 75%, ${colors.background})`,
    },
    display: "-webkit-box",
    fontFamily: font.heading,
    fontSize: "0.9375rem",
    fontWeight: font.weightBold,
    letterSpacing: "-0.01em",
    lineHeight: 1.35,
    outlineColor: colors.ring,
    outlineOffset: 2,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    textDecorationLine: "none",
    transitionDuration: "200ms",
    transitionProperty: "color",
    transitionTimingFunction: motion.easeOut,
  },
  untitled: {
    color: colors.mutedForeground,
    fontStyle: "italic",
    fontWeight: 500,
  },
  meta: {
    gap: "0.5rem",
    alignItems: "baseline",
    color: colors.mutedForeground,
    display: "flex",
    fontSize: "0.8125rem",
    justifyContent: "space-between",
    minWidth: 0,
  },
  type: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  skeletonTitle: {
    height: "0.9375rem",
    width: "80%",
  },
  skeletonMeta: {
    height: "0.75rem",
    width: "50%",
  },
})

export function LatestTitleCard({ hit }: { hit: SearchHit }) {
  const title = hit.mainTitle?.title

  return (
    <article sx={styles.card}>
      <Link
        aria-label={title ?? m.media_untitled()}
        params={{ mediaId: hit.id }}
        tabIndex={-1}
        to="/media/$mediaId"
        {...stylex.props(styles.coverLink)}
      >
        <Cover src={hit.coverUrl} sx={styles.cover} />
        <span sx={styles.flag}>
          <CountryFlag country={hit.countryOfOrigin} />
        </span>
      </Link>
      <div sx={styles.body}>
        <Link
          params={{ mediaId: hit.id }}
          title={title ?? undefined}
          to="/media/$mediaId"
          {...stylex.props(styles.title)}
        >
          {title ?? <span sx={styles.untitled}>{m.media_untitled()}</span>}
        </Link>
        <div sx={styles.meta}>
          <span sx={styles.type}>{MEDIA_TYPE_LABELS[hit.type]()}</span>
          <TimeAgo date={new Date(hit.createdAt).toISOString()} />
        </div>
      </div>
    </article>
  )
}

export function LatestTitleCardSkeleton() {
  return (
    <div aria-hidden sx={styles.card}>
      <CoverSkeleton sx={styles.cover} />
      <div sx={styles.body}>
        <Skeleton sx={styles.skeletonTitle} />
        <Skeleton sx={styles.skeletonMeta} />
      </div>
    </div>
  )
}
