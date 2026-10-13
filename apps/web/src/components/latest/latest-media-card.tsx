import * as stylex from "@stylexjs/stylex"
import { Clock } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { colors, font, motion, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { useState } from "react"
import { range } from "remeda"
import type { ContentRating } from "@/lib/settings"
import {
  ChapterGroups,
  TimeAgo,
  Uploader,
  getChapterLabel,
} from "@/components/chapters/chapter-meta"
import { CountryFlag, LanguageFlag, getLanguageCode } from "@/components/chapters/flags"
import { Cover, CoverSkeleton } from "@/components/media/cover"
import { type LatestMediaUpdate, mediaLatestChaptersQueryOptions } from "@/lib/queries/chapters"
import { m } from "@/paraglide/messages"

const DESKTOP = "@media (width >= 48rem)"
const styles = stylex.create({
  card: {
    padding: { [DESKTOP]: "0.875rem", default: "0.625rem" },
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: 1,
    alignItems: "start",
    backgroundClip: "padding-box",
    backgroundColor: colors.card,
    boxShadow: shadows.raised,
    columnGap: { [DESKTOP]: "1.25rem", default: "0.875rem" },
    display: "grid",
    gridTemplateColumns: { [DESKTOP]: "7rem minmax(0, 1fr)", default: "4.5rem minmax(0, 1fr)" },
  },
  coverLink: {
    borderRadius: {
      [DESKTOP]: `calc(${radius.xl} - 0.875rem)`,
      default: `calc(${radius.xl} - 0.625rem)`,
    },
    display: "block",
    outlineColor: colors.ring,
    outlineOffset: 2,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    position: { [DESKTOP]: "sticky", default: "static" },
    top: "calc(var(--navbar-height) + 1rem)",
  },
  cover: {
    borderRadius: {
      [DESKTOP]: `calc(${radius.xl} - 0.875rem)`,
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
    fontSize: { [DESKTOP]: "1.125rem", default: "1rem" },
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
  chapters: {
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
  chapter: {
    gridTemplateAreas: {
      [DESKTOP]: '"label time" "groups uploader"',
      default: '"label time" "groups groups" "uploader uploader"',
    },
    paddingBlock: "0.625rem",
    columnGap: "1.5rem",
    display: "grid",
    gridTemplateColumns: { [DESKTOP]: "minmax(0, 1fr) auto", default: "minmax(0, 1fr) auto" },
    rowGap: "0.375rem",
    borderTopColor: { default: colors.border, ":first-child": "transparent" },
    borderTopStyle: "solid",
    borderTopWidth: 1,
  },
  label: {
    gap: "0.5rem",
    alignItems: "center",
    color: colors.foreground,
    display: "flex",
    fontSize: "0.875rem",
    fontWeight: 600,
    gridColumnEnd: "label",
    gridColumnStart: "label",
    gridRowEnd: "label",
    gridRowStart: "label",
    minWidth: 0,
  },
  labelText: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  chapterTitle: {
    color: `color-mix(in srgb, ${colors.foreground} 72%, transparent)`,
    fontWeight: 500,
  },
  groups: {
    gridColumnEnd: "groups",
    gridColumnStart: "groups",
    gridRowEnd: "groups",
    gridRowStart: "groups",
  },
  time: {
    gap: "0.5rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    gridColumnEnd: "time",
    gridColumnStart: "time",
    gridRowEnd: "time",
    gridRowStart: "time",
    justifySelf: "end",
  },
  timeIcon: {
    flexShrink: 0,
  },
  uploader: {
    gridColumnEnd: "uploader",
    gridColumnStart: "uploader",
    gridRowEnd: "uploader",
    gridRowStart: "uploader",
    justifySelf: { [DESKTOP]: "end", default: "start" },
    maxWidth: { [DESKTOP]: "14rem", default: "100%" },
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
  skeletonLabel: {
    gridColumnEnd: "label",
    gridColumnStart: "label",
    gridRowEnd: "label",
    gridRowStart: "label",
    height: "0.875rem",
    width: "min(16rem, 80%)",
  },
  skeletonMeta: {
    gridColumnEnd: "groups",
    gridColumnStart: "groups",
    gridRowEnd: "groups",
    gridRowStart: "groups",
    height: "0.75rem",
    width: "min(9rem, 50%)",
  },
})

type LatestMediaCardProps = {
  media: LatestMediaUpdate
  contentRatings: readonly ContentRating[]
}

export function LatestMediaCard({ media, contentRatings }: LatestMediaCardProps) {
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
        <ul sx={styles.chapters}>
          {chapters.map((chapter) => (
            <li key={chapter.id} sx={styles.chapter}>
              <span sx={styles.label}>
                <LanguageFlag language={chapter.language} />
                <span sx={styles.labelText} title={getLanguageCode(chapter.language)}>
                  {getChapterLabel(chapter)}
                  {chapter.title === null ? null : (
                    <span sx={styles.chapterTitle}> – {chapter.title}</span>
                  )}
                </span>
              </span>
              <span sx={styles.time}>
                <Clock size={16} {...stylex.props(styles.timeIcon)} />
                <TimeAgo date={chapter.createdAt} />
              </span>
              <ChapterGroups groups={chapter.groups} max={3} sx={styles.groups} wrap />
              <Uploader sx={styles.uploader} uploader={chapter.uploader} />
            </li>
          ))}
        </ul>
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
        <ul sx={styles.chapters}>
          {range(0, 3).map((index) => (
            <li key={index} sx={styles.chapter}>
              <Skeleton sx={styles.skeletonLabel} />
              <Skeleton sx={styles.skeletonMeta} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
