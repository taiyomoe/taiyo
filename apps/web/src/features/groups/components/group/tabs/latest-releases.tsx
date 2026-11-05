import * as stylex from "@stylexjs/stylex"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { breakpoints, colors, font, motion, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { useDeferredValue } from "react"
import { range } from "remeda"
import { TimeAgo } from "@/components/time/time-ago"
import { getChapterLabel } from "@/features/chapters/lib/chapter-label"
import { groupChaptersQueryOptions } from "@/features/groups/api/groups"
import { groupStyles } from "@/features/groups/components/group/group-styles"
import { GROUP_LATEST_RELEASES } from "@/features/groups/lib/group-page"
import { Cover } from "@/features/media/components/cover"
import { useSettings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  section: {
    gap: "0.875rem",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    alignItems: "baseline",
    display: "flex",
    justifyContent: "space-between",
  },
  seeAll: {
    textDecoration: "none",
    color: {
      default: colors.primary,
      ":hover": `color-mix(in srgb, ${colors.primary} 75%, ${colors.foreground})`,
    },
    fontSize: "0.9375rem",
    fontWeight: 600,
    transitionDuration: motion.enter,
    transitionProperty: "color",
  },
  grid: {
    margin: 0,
    padding: 0,
    gap: "0.75rem",
    listStyle: "none",
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      [breakpoints.sm]: "repeat(2, minmax(0, 1fr))",
      [breakpoints.xl]: "repeat(4, minmax(0, 1fr))",
    },
  },
  card: {
    padding: "0.75rem",
    gap: "0.875rem",
    textDecoration: "none",
    alignItems: "center",
    color: colors.foreground,
    display: "flex",
    outlineColor: colors.ring,
    outlineOffset: 2,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    transform: { default: "none", ":hover": "translateY(-1px)" },
    transitionDuration: motion.enter,
    transitionProperty: "transform",
  },
  cover: {
    borderRadius: radius.md,
    width: "3rem",
  },
  text: {
    gap: "0.125rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  title: {
    overflow: "hidden",
    fontSize: "0.9375rem",
    fontWeight: 600,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  chapter: {
    color: colors.primary,
    fontFamily: font.mono,
    fontSize: "0.8125rem",
    fontWeight: 600,
  },
  time: {
    fontFamily: font.mono,
    fontSize: "0.75rem",
  },
  skeleton: {
    borderRadius: radius.xl,
    height: "5.75rem",
  },
})

export function LatestReleases({ groupId }: { groupId: string }) {
  const contentRatings = useDeferredValue(useSettings().contentRatings)
  const latest = useQuery(
    groupChaptersQueryOptions(groupId, contentRatings, 1, GROUP_LATEST_RELEASES),
  )

  if (latest.data?.data.length === 0) {
    return null
  }

  return (
    <section sx={styles.section}>
      <div sx={styles.header}>
        <h3 sx={groupStyles.heading}>{m.group_latest_releases()}</h3>
        <Link
          params={{ groupId }}
          search={{ tab: "chapters" }}
          to="/groups/$groupId"
          {...stylex.props(styles.seeAll)}
        >
          {m.group_see_all()}
        </Link>
      </div>
      <ul sx={styles.grid}>
        {latest.data === undefined
          ? range(0, GROUP_LATEST_RELEASES).map((index) => (
              <li key={index}>
                <Skeleton sx={styles.skeleton} />
              </li>
            ))
          : latest.data.data.map((chapter) => (
              <li key={chapter.id}>
                <Link
                  params={{ mediaId: chapter.mediaId }}
                  to="/media/$mediaId"
                  {...stylex.props(groupStyles.card, styles.card)}
                >
                  <Cover src={chapter.mediaCoverUrl} sx={styles.cover} />
                  <span sx={styles.text}>
                    <span sx={styles.title}>{chapter.mediaTitle ?? m.media_untitled()}</span>
                    <span sx={styles.chapter}>{getChapterLabel(chapter)}</span>
                    <TimeAgo date={chapter.createdAt} sx={styles.time} />
                  </span>
                </Link>
              </li>
            ))}
      </ul>
    </section>
  )
}
