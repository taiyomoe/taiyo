import * as stylex from "@stylexjs/stylex"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import {
  breakpoints,
  colors,
  font,
  motion,
  radius,
  shadows,
} from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { useState } from "react"
import type { ContentRating } from "@/lib/settings"
import { CountryFlag } from "@/components/flags/flags"
import {
  type LatestMediaUpdate,
  mediaLatestChaptersQueryOptions,
} from "@/features/chapters/api/chapters"
import { ChapterList, ChapterListSkeleton } from "@/features/chapters/components/chapter-list"
import { Cover, CoverSkeleton } from "@/features/media/components/cover"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  card: {
    padding: { [breakpoints.md]: "0.875rem", default: "0.625rem" },
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: 1,
    alignItems: "start",
    backgroundClip: "padding-box",
    backgroundColor: colors.card,
    boxShadow: shadows.raised,
    columnGap: { [breakpoints.md]: "1.25rem", default: "0.875rem" },
    display: "grid",
    gridTemplateColumns: {
      [breakpoints.md]: "7rem minmax(0, 1fr)",
      default: "4.5rem minmax(0, 1fr)",
    },
  },
  coverLink: {
    borderRadius: {
      [breakpoints.md]: `calc(${radius.xl} - 0.875rem)`,
      default: `calc(${radius.xl} - 0.625rem)`,
    },
    display: "block",
    outlineColor: colors.ring,
    outlineOffset: 2,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    position: { [breakpoints.md]: "sticky", default: "static" },
    top: "calc(var(--navbar-height) + 1rem)",
  },
  cover: {
    borderRadius: {
      [breakpoints.md]: `calc(${radius.xl} - 0.875rem)`,
      default: `calc(${radius.xl} - 0.625rem)`,
    },
    width: "100%",
  },
  body: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  header: {
    gap: "0.625rem",
    alignItems: "center",
    display: "flex",
    borderBottomColor: colors.border,
    borderBottomStyle: "solid",
    borderBottomWidth: 1,
    minWidth: 0,
    paddingBottom: "0.625rem",
  },
  title: {
    margin: 0,
    overflow: "hidden",
    color: {
      default: colors.foreground,
      ":has(> a:hover)": `color-mix(in srgb, ${colors.foreground} 75%, ${colors.background})`,
    },
    fontFamily: font.heading,
    fontSize: { [breakpoints.md]: "1.125rem", default: "1rem" },
    fontWeight: font.weightBold,
    letterSpacing: "-0.01em",
    textOverflow: "ellipsis",
    transitionDuration: "200ms",
    transitionProperty: "color",
    transitionTimingFunction: motion.easeOut,
    whiteSpace: "nowrap",
    minWidth: 0,
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
  untitled: {
    color: colors.mutedForeground,
    fontStyle: "italic",
    paddingRight: "0.125em",
  },
  footer: {
    display: "flex",
    justifyContent: "center",
    paddingTop: "0.25rem",
  },
  skeletonTitle: {
    height: "1.125rem",
    width: "min(18rem, 70%)",
  },
})

export function LatestMediaCard({
  media,
  contentRatings,
}: {
  media: LatestMediaUpdate
  contentRatings: readonly ContentRating[]
}) {
  const [expanded, setExpanded] = useState(false)
  const all = useQuery({
    ...mediaLatestChaptersQueryOptions(media.id, contentRatings),
    enabled: expanded,
  })
  const chapters = expanded && all.data !== undefined ? all.data : media.chapters
  const hasMore = media.chapterCount > media.chapters.length

  return (
    <article sx={styles.card}>
      <Link
        aria-label={media.title ?? m.media_untitled()}
        params={{ mediaId: media.id }}
        tabIndex={-1}
        to="/media/$mediaId"
        {...stylex.props(styles.coverLink)}
      >
        <Cover src={media.coverUrl} sx={styles.cover} />
      </Link>
      <div sx={styles.body}>
        <div sx={styles.header}>
          <CountryFlag country={media.countryOfOrigin} />
          <h2 sx={styles.title}>
            <Link
              params={{ mediaId: media.id }}
              to="/media/$mediaId"
              {...stylex.props(styles.titleLink)}
            >
              {media.title ?? <span sx={styles.untitled}>{m.media_untitled()}</span>}
            </Link>
          </h2>
        </div>
        <ChapterList chapters={chapters} />
        {hasMore ? (
          <div sx={styles.footer}>
            <Button
              loading={expanded && all.isFetching && all.data === undefined}
              onClick={() => {
                setExpanded(!expanded)
              }}
              size="sm"
              variant="ghost"
            >
              {expanded && all.data !== undefined
                ? m.latest_show_less()
                : m.latest_show_all({ count: media.chapterCount })}
            </Button>
          </div>
        ) : null}
      </div>
    </article>
  )
}

export function LatestMediaCardSkeleton() {
  return (
    <div aria-hidden sx={styles.card}>
      <CoverSkeleton sx={styles.cover} />
      <div sx={styles.body}>
        <div sx={styles.header}>
          <Skeleton sx={styles.skeletonTitle} />
        </div>
        <ChapterListSkeleton count={3} />
      </div>
    </div>
  )
}
