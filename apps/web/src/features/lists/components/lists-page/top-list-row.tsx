import * as stylex from "@stylexjs/stylex"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { breakpoints, colors, font, motion, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import type { ListSummary } from "@/features/lists/api/lists"
import { ListCoverStack } from "@/features/lists/components/list-cover-stack"
import { ListOwner } from "@/features/lists/components/list-owner"
import { ListVoteButton } from "@/features/lists/components/list-vote-button"
import { formatTitleCount } from "@/features/lists/lib/list-labels"

const PADDING = "0.75rem"
const styles = stylex.create({
  row: {
    padding: PADDING,
    borderColor: colors.border,
    borderRadius: `calc(${radius.sm} + ${PADDING} + 1px)`,
    borderStyle: "solid",
    borderWidth: 1,
    gap: { default: "0.875rem", [breakpoints.sm]: "1.125rem" },
    alignItems: "center",
    backgroundColor: {
      default: colors.card,
      ":hover": `color-mix(in srgb, ${colors.foreground} 4%, ${colors.card})`,
    },
    display: "flex",
    outlineColor: colors.ring,
    outlineOffset: 2,
    outlineStyle: { default: "none", ":has(> div > a:first-child:focus-visible)": "solid" },
    outlineWidth: 2,
    paddingInlineStart: { default: PADDING, [breakpoints.sm]: "1rem" },
    position: "relative",
    transitionDuration: motion.enter,
    transitionProperty: "background-color",
  },
  rank: {
    color: colors.mutedForeground,
    flexShrink: 0,
    fontFamily: font.mono,
    fontSize: "0.875rem",
    fontVariantNumeric: "tabular-nums",
    fontWeight: 600,
    textAlign: "end",
    width: "1.75rem",
  },
  podium: {
    color: `color-mix(in srgb, ${colors.primary} 80%, ${colors.foreground})`,
  },
  body: {
    gap: "0.3125rem",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minWidth: 0,
  },
  name: {
    overflow: "hidden",
    textDecoration: "none",
    color: colors.foreground,
    fontSize: "1rem",
    fontWeight: 650,
    outlineStyle: "none",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    "::after": {
      inset: 0,
      borderRadius: "inherit",
      content: '""',
      position: "absolute",
    },
  },
  description: {
    margin: 0,
    overflow: "hidden",
    color: colors.mutedForeground,
    display: { default: "none", [breakpoints.sm]: "block" },
    fontSize: "0.875rem",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  meta: {
    gap: "0.5rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    fontSize: "0.8125rem",
    minWidth: 0,
  },
  count: {
    flexShrink: 0,
  },
  covers: {
    display: { default: "none", [breakpoints.sm]: "flex" },
  },
  skeletonCovers: {
    borderRadius: radius.sm,
    flexShrink: 0,
    height: "4.125rem",
    width: "5.25rem",
  },
  skeletonName: {
    borderRadius: radius.sm,
    height: "1rem",
    width: "40%",
  },
  skeletonMeta: {
    borderRadius: radius.sm,
    height: "0.875rem",
    width: "25%",
  },
})

export function TopListRow({
  list,
  rank,
  viewerId,
}: {
  list: ListSummary
  rank: number
  viewerId: string | null
}) {
  return (
    <li sx={styles.row}>
      <span sx={[styles.rank, rank <= 3 && styles.podium]}>{rank}</span>
      <ListCoverStack coverUrls={list.coverUrls} size="sm" sx={styles.covers} />
      <div sx={styles.body}>
        <Link params={{ listId: list.id }} to="/lists/$listId" {...stylex.props(styles.name)}>
          {list.name}
        </Link>
        {list.description === null || list.description === "" ? null : (
          <p sx={styles.description}>{list.description}</p>
        )}
        <div sx={styles.meta}>
          <ListOwner owner={list.owner} />
          <span aria-hidden>·</span>
          <span sx={styles.count}>{formatTitleCount(list.itemCount)}</span>
        </div>
      </div>
      <ListVoteButton list={list} viewerId={viewerId} />
    </li>
  )
}

export function TopListRowSkeleton() {
  return (
    <li sx={styles.row}>
      <span sx={styles.rank} />
      <Skeleton sx={[styles.skeletonCovers, styles.covers]} />
      <div sx={styles.body}>
        <Skeleton sx={styles.skeletonName} />
        <Skeleton sx={styles.skeletonMeta} />
      </div>
    </li>
  )
}
