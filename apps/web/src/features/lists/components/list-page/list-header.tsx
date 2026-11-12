import * as stylex from "@stylexjs/stylex"
import { Edit, Lock } from "@taiyomoe/ui/components/icons"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { breakpoints, colors, font, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import type { ListDetail } from "@/features/lists/api/lists"
import { sceneFont } from "@/components/scene/scene.stylex"
import { TimeAgo } from "@/components/time/time-ago"
import { ListCoverStack } from "@/features/lists/components/list-cover-stack"
import { ListOwner } from "@/features/lists/components/list-owner"
import { ListVoteButton } from "@/features/lists/components/list-vote-button"
import { formatTitleCount } from "@/features/lists/lib/list-labels"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  header: {
    gap: { default: "1.25rem", [breakpoints.md]: "2rem" },
    alignItems: { default: "flex-start", [breakpoints.md]: "flex-end" },
    display: "flex",
    flexDirection: { default: "column", [breakpoints.md]: "row" },
  },
  covers: {
    paddingInlineEnd: "0.5rem",
  },
  info: {
    gap: "0.75rem",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minWidth: 0,
  },
  name: {
    margin: 0,
    fontFamily: sceneFont.display,
    fontSize: { default: "1.875rem", [breakpoints.md]: "2.5rem" },
    fontWeight: font.weightBold,
    letterSpacing: "-0.02em",
    lineHeight: 1.1,
    overflowWrap: "anywhere",
  },
  description: {
    margin: 0,
    color: `color-mix(in srgb, ${colors.foreground} 78%, transparent)`,
    lineHeight: 1.55,
    whiteSpace: "pre-line",
    maxWidth: "48rem",
  },
  meta: {
    gap: "0.5rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    flexWrap: "wrap",
    fontSize: "0.875rem",
  },
  badge: {
    alignSelf: "flex-start",
  },
  actions: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    flexShrink: 0,
  },
  skeletonCovers: {
    borderRadius: radius.lg,
    flexShrink: 0,
    height: "9.75rem",
    width: "12rem",
  },
  skeletonName: {
    borderRadius: radius.md,
    height: "2.25rem",
    width: "min(24rem, 80%)",
  },
  skeletonMeta: {
    borderRadius: radius.sm,
    height: "1rem",
    width: "14rem",
  },
})

export function ListHeader({
  list,
  isOwner,
  viewerId,
}: {
  list: ListDetail
  isOwner: boolean
  viewerId: string | null
}) {
  return (
    <header sx={styles.header}>
      <ListCoverStack coverUrls={list.coverUrls} size="lg" sx={styles.covers} />
      <div sx={styles.info}>
        {list.visibility === "PRIVATE" ? (
          <Badge sx={styles.badge} variant="secondary">
            <Lock />
            {m.lists_private()}
          </Badge>
        ) : null}
        <h1 sx={styles.name}>{list.name}</h1>
        {list.description === null || list.description === "" ? null : (
          <p sx={styles.description}>{list.description}</p>
        )}
        <div sx={styles.meta}>
          <ListOwner owner={list.owner} size="lg" />
          <span aria-hidden>·</span>
          <span>{formatTitleCount(list.itemCount)}</span>
          <span aria-hidden>·</span>
          <span>
            {m.list_updated()} <TimeAgo date={list.updatedAt} />
          </span>
        </div>
      </div>
      <div sx={styles.actions}>
        {list.visibility === "PUBLIC" ? (
          <ListVoteButton list={list} size="default" viewerId={viewerId} />
        ) : null}
        {isOwner ? (
          <Button
            render={<Link params={{ listId: list.id }} to="/lists/$listId/edit" />}
            variant="outline"
          >
            <Edit />
            {m.list_edit()}
          </Button>
        ) : null}
      </div>
    </header>
  )
}

export function ListHeaderSkeleton() {
  return (
    <div sx={styles.header}>
      <Skeleton sx={styles.skeletonCovers} />
      <div sx={styles.info}>
        <Skeleton sx={styles.skeletonName} />
        <Skeleton sx={styles.skeletonMeta} />
      </div>
    </div>
  )
}
