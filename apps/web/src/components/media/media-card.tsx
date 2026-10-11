import * as stylex from "@stylexjs/stylex"
import { Link } from "@tanstack/react-router"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import {
  PreviewCard,
  PreviewCardPopup,
  PreviewCardTrigger,
} from "@taiyomoe/ui/components/ui/preview-card"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { focus } from "@taiyomoe/ui/styles/recipes"
import { colors, radius, text } from "@taiyomoe/ui/styles/tokens.stylex"

import { MediaCover } from "@/components/media/media-cover"
import { getMediaCardModel, mediaDemographyLabel } from "@/components/media/media-labels"
import type { MediaHit } from "@/lib/queries/medias"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  card: {
    borderRadius: radius.xl,
    gap: "0.75rem",
    textDecoration: "none",
    color: colors.foreground,
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  cover: {
    transform: { default: "none", ":hover": "translateY(-3px)" },
    transitionDuration: "200ms",
    transitionProperty: "transform",
    transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
  },
  rating: {
    position: "absolute",
    left: "0.5rem",
    top: "0.5rem",
  },
  body: {
    gap: "0.375rem",
    paddingInline: "0.125rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  title: {
    overflow: "hidden",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 2,
    display: "-webkit-box",
    fontSize: "0.9375rem",
    fontWeight: 600,
    lineHeight: 1.35,
  },
  meta: {
    gap: "0.375rem",
    color: colors.mutedForeground,
    display: "flex",
    flexWrap: "wrap",
    fontSize: "0.8125rem",
  },
  dot: {
    opacity: 0.5,
  },
  popup: {
    gap: "0.75rem",
    display: "flex",
    flexDirection: "column",
    width: "18rem",
  },
  popupTitle: {
    margin: 0,
    fontSize: text.base,
    fontWeight: 600,
    lineHeight: 1.35,
  },
  badges: {
    gap: "0.375rem",
    display: "flex",
    flexWrap: "wrap",
  },
  stats: {
    margin: 0,
    gap: "1rem",
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
  },
  stat: {
    gap: "0.125rem",
    display: "flex",
    flexDirection: "column-reverse",
  },
  statLabel: {
    color: colors.mutedForeground,
    fontSize: "0.75rem",
  },
  statValue: {
    margin: 0,
    fontSize: text.lg,
    fontVariantNumeric: "tabular-nums",
    fontWeight: 600,
  },
  skeletonTitle: {
    height: "1rem",
    width: "85%",
  },
  skeletonMeta: {
    height: "0.75rem",
    width: "55%",
  },
  skeletonCover: {
    borderRadius: radius.xl,
    aspectRatio: "2 / 3",
    width: "100%",
  },
})

export function MediaCard({ hit }: { hit: MediaHit }) {
  const model = getMediaCardModel(hit)

  return (
    <PreviewCard>
      <PreviewCardTrigger
        render={<Link params={{ mediaId: hit.id }} to="/titles/$mediaId" />}
        sx={[styles.card, focus.control]}
      >
        <MediaCover
          alt={m.media_cover_alt({ title: model.title })}
          sx={styles.cover}
          url={model.coverUrl}
        >
          {model.rating ? (
            <Badge sx={styles.rating} variant={model.rating.variant}>
              {model.rating.label}
            </Badge>
          ) : null}
        </MediaCover>
        <div sx={styles.body}>
          <span sx={styles.title}>{model.title}</span>
          <span sx={styles.meta}>
            <span>{model.typeLabel}</span>
            <span aria-hidden sx={styles.dot}>
              ·
            </span>
            <span>{model.statusLabel}</span>
          </span>
        </div>
      </PreviewCardTrigger>
      <PreviewCardPopup align="start" sx={styles.popup}>
        <p sx={styles.popupTitle}>{model.title}</p>
        <div sx={styles.badges}>
          <Badge variant="secondary">{model.typeLabel}</Badge>
          <Badge variant="outline">{model.statusLabel}</Badge>
          <Badge variant="outline">{mediaDemographyLabel(hit.demography)}</Badge>
          {model.rating ? <Badge variant={model.rating.variant}>{model.rating.label}</Badge> : null}
        </div>
        <dl sx={styles.stats}>
          <div sx={styles.stat}>
            <dt sx={styles.statLabel}>{m.media_stat_chapters()}</dt>
            <dd sx={styles.statValue}>{hit.chapterCount}</dd>
          </div>
          <div sx={styles.stat}>
            <dt sx={styles.statLabel}>{m.media_stat_readers()}</dt>
            <dd sx={styles.statValue}>{hit.libraryCount}</dd>
          </div>
        </dl>
      </PreviewCardPopup>
    </PreviewCard>
  )
}

export function MediaCardSkeleton() {
  return (
    <div sx={styles.card}>
      <Skeleton sx={styles.skeletonCover} />
      <div sx={styles.body}>
        <Skeleton sx={styles.skeletonTitle} />
        <Skeleton sx={styles.skeletonMeta} />
      </div>
    </div>
  )
}
