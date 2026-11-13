import * as stylex from "@stylexjs/stylex"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { colors, motion, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import type { RelatedMedias } from "@/features/recommendations/api/recommendations"
import { Cover, CoverSkeleton } from "@/features/media/components/cover"
import { LIBRARY_STATUS_LABELS, MEDIA_TYPE_LABELS } from "@/features/media/lib/media-labels"
import { m } from "@/paraglide/messages"

type CardMedia = Pick<
  RelatedMedias["similar"][number],
  "id" | "title" | "coverUrl" | "type" | "libraryStatus"
>

const styles = stylex.create({
  card: {
    borderRadius: radius.lg,
    gap: "0.5rem",
    textDecoration: "none",
    color: "inherit",
    display: "flex",
    flexDirection: "column",
    outlineColor: colors.ring,
    outlineOffset: 3,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    minWidth: 0,
  },
  coverWrap: {
    display: "block",
    position: "relative",
  },
  cover: {
    width: "100%",
  },
  badge: {
    borderRadius: radius.full,
    overflow: "hidden",
    paddingInline: "0.5rem",
    backdropFilter: "blur(8px)",
    backgroundColor: `color-mix(in srgb, ${colors.background} 78%, transparent)`,
    color: colors.foreground,
    fontSize: "0.6875rem",
    fontWeight: 600,
    lineHeight: "1.375rem",
    position: "absolute",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    zIndex: 1,
    left: "0.5rem",
    maxWidth: "calc(100% - 1rem)",
    top: "0.5rem",
  },
  text: {
    gap: "0.125rem",
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
      ":is(:hover > * > *)": `color-mix(in srgb, ${colors.foreground} 75%, ${colors.background})`,
    },
    display: "-webkit-box",
    fontSize: "0.9375rem",
    fontWeight: 600,
    lineHeight: 1.3,
    overflowWrap: "anywhere",
    transitionDuration: "200ms",
    transitionProperty: "color",
    transitionTimingFunction: motion.easeOut,
  },
  untitled: {
    color: colors.mutedForeground,
    fontStyle: "italic",
  },
  detail: {
    overflow: "hidden",
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  skeletonLine: {
    borderRadius: radius.full,
    height: "0.875rem",
    width: "80%",
  },
  skeletonDetail: {
    borderRadius: radius.full,
    height: "0.75rem",
    width: "50%",
  },
})

export function RecommendationCard({
  media,
  badge,
  detail,
  onOpen,
}: {
  media: CardMedia
  badge?: string | undefined
  detail?: string | null | undefined
  onOpen?: () => void
}) {
  const status = media.libraryStatus === null ? null : LIBRARY_STATUS_LABELS[media.libraryStatus]()
  const label = badge ?? status

  return (
    <Link
      onClick={onOpen}
      params={{ mediaId: media.id }}
      title={media.title ?? undefined}
      to="/media/$mediaId"
      {...stylex.props(styles.card)}
    >
      <span sx={styles.coverWrap}>
        {label === null ? null : <span sx={styles.badge}>{label}</span>}
        <Cover alt={media.title ?? ""} src={media.coverUrl} sx={styles.cover} />
      </span>
      <span sx={styles.text}>
        <span sx={[styles.title, media.title === null && styles.untitled]}>
          {media.title ?? m.media_untitled()}
        </span>
        <span sx={styles.detail}>{detail ?? MEDIA_TYPE_LABELS[media.type]()}</span>
      </span>
    </Link>
  )
}

export function RecommendationCardSkeleton() {
  return (
    <span sx={styles.card}>
      <CoverSkeleton sx={styles.cover} />
      <span sx={styles.text}>
        <Skeleton sx={styles.skeletonLine} />
        <Skeleton sx={styles.skeletonDetail} />
      </span>
    </span>
  )
}
