import * as stylex from "@stylexjs/stylex"
import { Lock, ThumbsUp } from "@taiyomoe/ui/components/icons"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { colors, font, motion, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import type { ListSummary } from "@/features/lists/api/lists"
import { ListCoverStack } from "@/features/lists/components/list-cover-stack"
import { ListOwner } from "@/features/lists/components/list-owner"
import { formatTitleCount } from "@/features/lists/lib/list-labels"
import { m } from "@/paraglide/messages"

const PADDING = "0.625rem"
const styles = stylex.create({
  card: {
    padding: PADDING,
    borderColor: colors.border,
    borderRadius: `calc(${radius.lg} + ${PADDING} + 1px)`,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.875rem",
    backgroundColor: {
      default: colors.card,
      ":hover": `color-mix(in srgb, ${colors.foreground} 4%, ${colors.card})`,
    },
    display: "flex",
    flexDirection: "column",
    position: "relative",
    transitionDuration: motion.enter,
    transitionProperty: "background-color",
    minWidth: 0,
  },
  well: {
    borderRadius: radius.lg,
    alignItems: "flex-end",
    backgroundColor: colors.well,
    display: "flex",
    justifyContent: "center",
    paddingBottom: "0.875rem",
    paddingTop: "1.25rem",
  },
  body: {
    gap: "0.375rem",
    paddingInline: "0.375rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    paddingBottom: "0.25rem",
  },
  name: {
    overflow: "hidden",
    textDecoration: "none",
    color: colors.foreground,
    fontSize: "1rem",
    fontWeight: 650,
    lineHeight: 1.3,
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
  nameFocus: {
    outlineColor: colors.ring,
    outlineOffset: 2,
    outlineStyle: { default: "none", ":has(> div > a:first-child:focus-visible)": "solid" },
    outlineWidth: 2,
  },
  meta: {
    gap: "0.75rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    fontSize: "0.8125rem",
    justifyContent: "space-between",
    marginTop: "0.25rem",
    minWidth: 0,
  },
  facts: {
    gap: "0.375rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    fontSize: "0.8125rem",
  },
  votes: {
    gap: "0.25rem",
    alignItems: "center",
    display: "inline-flex",
    fontFamily: font.mono,
    fontSize: "0.75rem",
    fontVariantNumeric: "tabular-nums",
  },
  lock: {
    flexShrink: 0,
  },
  skeletonWell: {
    borderRadius: radius.lg,
    height: "8.75rem",
  },
  skeletonLine: {
    borderRadius: radius.sm,
    height: "1rem",
    width: "70%",
  },
  skeletonMeta: {
    borderRadius: radius.sm,
    height: "0.875rem",
    width: "45%",
  },
})

export function ListCard({ list, showOwner = true }: { list: ListSummary; showOwner?: boolean }) {
  return (
    <article sx={[styles.card, styles.nameFocus]}>
      <div sx={styles.well}>
        <ListCoverStack coverUrls={list.coverUrls} />
      </div>
      <div sx={styles.body}>
        <Link params={{ listId: list.id }} to="/lists/$listId" {...stylex.props(styles.name)}>
          {list.name}
        </Link>
        <span sx={styles.facts}>
          {formatTitleCount(list.itemCount)}
          {list.visibility === "PRIVATE" ? (
            <>
              <span aria-hidden>·</span>
              <Lock aria-hidden size={14} {...stylex.props(styles.lock)} />
              {m.lists_private()}
            </>
          ) : null}
        </span>
        {showOwner || list.visibility === "PUBLIC" ? (
          <div sx={styles.meta}>
            {showOwner ? <ListOwner owner={list.owner} /> : <span />}
            {list.visibility === "PUBLIC" ? (
              <span sx={styles.votes} title={m.lists_vote()}>
                <ThumbsUp aria-hidden size={14} />
                {list.upvoteCount}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  )
}

export function ListCardSkeleton() {
  return (
    <div sx={styles.card}>
      <Skeleton sx={styles.skeletonWell} />
      <div sx={styles.body}>
        <Skeleton sx={styles.skeletonLine} />
        <Skeleton sx={styles.skeletonMeta} />
      </div>
    </div>
  )
}

export const listCardGridStyles = stylex.create({
  grid: {
    gap: "0.875rem",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(13.5rem, 1fr))",
  },
})
