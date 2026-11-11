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
import { groupProfileStyles } from "@/features/groups/components/group/profile/group-profile-styles"
import { GROUP_LATEST_RELEASES } from "@/features/groups/lib/group-page"
import { Cover } from "@/features/media/components/cover"
import { useSettings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

const ROW_BLEED = "0.75rem"
const styles = stylex.create({
  seeAll: {
    textDecoration: "none",
    color: {
      default: colors.primary,
      ":hover": `color-mix(in srgb, ${colors.primary} 75%, ${colors.foreground})`,
    },
    fontSize: "0.875rem",
    fontWeight: 600,
    transitionDuration: motion.enter,
    transitionProperty: "color",
  },
  list: {
    margin: 0,
    padding: 0,
    listStyle: "none",
    columnGap: "1.5rem",
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      [breakpoints.md]: "repeat(2, minmax(0, 1fr))",
    },
  },
  row: {
    borderRadius: radius.lg,
    gap: "0.875rem",
    marginInline: `calc(-1 * ${ROW_BLEED})`,
    paddingBlock: "0.5rem",
    paddingInline: ROW_BLEED,
    textDecoration: "none",
    alignItems: "center",
    backgroundColor: {
      default: "transparent",
      ":hover": `color-mix(in srgb, ${colors.foreground} 5%, transparent)`,
    },
    color: colors.foreground,
    display: "flex",
    outlineColor: colors.ring,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    transitionDuration: motion.enter,
    transitionProperty: "background-color",
  },
  cover: {
    borderRadius: radius.md,
    flexShrink: 0,
    width: "2.5rem",
  },
  text: {
    gap: "0.125rem",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minWidth: 0,
  },
  title: {
    overflow: "hidden",
    fontSize: "0.9375rem",
    fontWeight: 500,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  chapter: {
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
  },
  time: {
    color: colors.mutedForeground,
    flexShrink: 0,
    fontFamily: font.mono,
    fontSize: "0.75rem",
  },
  skeleton: {
    borderRadius: radius.lg,
    height: "3.75rem",
  },
})

export function GroupRecentReleases({ groupId }: { groupId: string }) {
  const contentRatings = useDeferredValue(useSettings().contentRatings)
  const latest = useQuery(
    groupChaptersQueryOptions(groupId, contentRatings, 1, GROUP_LATEST_RELEASES),
  )

  if (latest.data?.data.length === 0) {
    return null
  }

  return (
    <section sx={groupProfileStyles.section}>
      <div sx={groupProfileStyles.sectionHead}>
        <h2 sx={groupProfileStyles.sectionTitle}>{m.group_latest_releases()}</h2>
        <Link
          params={{ groupId }}
          search={{ tab: "chapters" }}
          to="/groups/$groupId"
          {...stylex.props(styles.seeAll)}
        >
          {m.group_see_all()}
        </Link>
      </div>
      <ul sx={styles.list}>
        {latest.data === undefined
          ? range(0, GROUP_LATEST_RELEASES).map((index) => (
              <li key={index}>
                <Skeleton sx={styles.skeleton} />
              </li>
            ))
          : latest.data.data.map((chapter) => (
              <li key={chapter.id}>
                <Link
                  params={{ chapterId: chapter.id }}
                  to="/chapters/$chapterId"
                  {...stylex.props(styles.row)}
                >
                  <Cover src={chapter.mediaCoverUrl} sx={styles.cover} />
                  <span sx={styles.text}>
                    <span sx={styles.title}>{chapter.mediaTitle ?? m.media_untitled()}</span>
                    <span sx={styles.chapter}>{getChapterLabel(chapter)}</span>
                  </span>
                  <TimeAgo date={chapter.createdAt} sx={styles.time} />
                </Link>
              </li>
            ))}
      </ul>
    </section>
  )
}
