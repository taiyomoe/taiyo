import * as stylex from "@stylexjs/stylex"
import { config } from "@taiyomoe/config"
import { Ellipsis, Play } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { colors, consts, font, motion, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import type { LibraryEntry } from "@/features/library/api/library"
import { LibraryEntryMenu } from "@/features/library/components/library-entry-menu"
import {
  getContinueTarget,
  getProgressPercent,
  getUnreadCount,
} from "@/features/library/lib/library-progress"
import {
  LIBRARY_STATUS_ICONS,
  LIBRARY_STATUS_LABELS,
  libraryStatusTones,
} from "@/features/library/lib/library-statuses"
import { Cover } from "@/features/media/components/cover"
import { StarGlyph } from "@/features/ratings/components/star-glyph"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  card: {
    gap: "0.625rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  coverWrap: {
    borderRadius: radius.lg,
    overflow: "hidden",
    isolation: "isolate",
    position: "relative",
  },
  coverLink: {
    borderRadius: radius.lg,
    display: "block",
    outlineColor: colors.ring,
    outlineOffset: 3,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
  },
  cover: {
    width: "100%",
  },
  shade: {
    inset: "auto 0 0 0",
    backgroundImage: "linear-gradient(to top, rgb(0 0 0 / 72%), rgb(0 0 0 / 0%))",
    pointerEvents: "none",
    position: "absolute",
    zIndex: 1,
    height: "45%",
  },
  statusBadge: {
    borderRadius: radius.full,
    alignItems: "center",
    backdropFilter: "blur(10px)",
    backgroundColor: "rgb(12 12 12 / 62%)",
    boxShadow: "inset 0 0 0 1px rgb(255 255 255 / 10%)",
    display: "flex",
    justifyContent: "center",
    position: "absolute",
    zIndex: 2,
    height: "1.875rem",
    left: "0.5rem",
    top: "0.5rem",
    width: "1.875rem",
  },
  unread: {
    borderRadius: radius.full,
    paddingInline: "0.5rem",
    backgroundColor: colors.primary,
    boxShadow: "0 4px 12px rgb(0 0 0 / 35%)",
    color: colors.primaryForeground,
    fontFamily: font.mono,
    fontSize: "0.6875rem",
    fontVariantNumeric: "tabular-nums",
    fontWeight: 700,
    lineHeight: "1.375rem",
    position: "absolute",
    zIndex: 2,
    right: "0.5rem",
    top: "0.5rem",
  },
  bar: {
    backgroundColor: "rgb(255 255 255 / 18%)",
    position: "absolute",
    zIndex: 2,
    bottom: 0,
    height: "0.25rem",
    left: 0,
    right: 0,
  },
  barFill: {
    backgroundColor: colors.primary,
    boxShadow: `0 0 10px ${colors.primary}`,
    height: "100%",
  },
  barComplete: {
    backgroundColor: colors.success,
    boxShadow: "none",
  },
  continue: {
    opacity: {
      default: 0,
      [stylex.when.ancestor(":focus-within")]: 1,
      [stylex.when.ancestor(":hover")]: 1,
      [consts.pointerCoarse]: 1,
    },
    position: "absolute",
    transform: {
      default: "translateY(0.375rem)",
      [stylex.when.ancestor(":focus-within")]: "none",
      [stylex.when.ancestor(":hover")]: "none",
      [consts.pointerCoarse]: "none",
    },
    transitionDuration: { default: "200ms", [consts.reducedMotion]: "0s" },
    transitionProperty: "opacity, transform",
    transitionTimingFunction: motion.easeOut,
    zIndex: 3,
    bottom: "0.625rem",
    left: { default: "0.625rem", [consts.pointerCoarse]: "auto" },
    right: "0.625rem",
  },
  continueButton: {
    display: { default: "inline-flex", [consts.pointerCoarse]: "none" },
    width: "100%",
  },
  continueIcon: {
    display: { default: "none", [consts.pointerCoarse]: "inline-flex" },
  },
  continueLabel: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  body: {
    columnGap: "0.25rem",
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto",
    rowGap: "0.25rem",
  },
  title: {
    overflow: "hidden",
    textDecoration: "none",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 2,
    alignSelf: "start",
    color: colors.foreground,
    display: "-webkit-box",
    fontSize: "0.9375rem",
    fontWeight: 600,
    lineHeight: 1.3,
    outlineStyle: "none",
    overflowWrap: "anywhere",
  },
  untitled: {
    color: colors.mutedForeground,
    fontStyle: "italic",
  },
  meta: {
    gap: "0.375rem",
    gridRow: "2",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    fontFamily: font.mono,
    fontSize: "0.75rem",
    fontVariantNumeric: "tabular-nums",
    gridColumnEnd: "-1",
    gridColumnStart: "1",
  },
  score: {
    gap: "0.25rem",
    alignItems: "center",
    color: colors.foreground,
    display: "inline-flex",
    marginInlineStart: "auto",
  },
  scoreIcon: {
    color: colors.warning,
    height: "0.75rem",
    width: "0.75rem",
  },
  menuButton: {
    gridColumn: "2",
    gridRow: "1",
    color: colors.mutedForeground,
    marginRight: "-0.375rem",
    marginTop: "-0.25rem",
  },
})

export function LibraryCard({
  entry,
  showStatus,
  eager,
}: {
  entry: LibraryEntry
  showStatus: boolean
  eager: boolean
}) {
  const percent = getProgressPercent(entry)
  const unread = getUnreadCount(entry)
  const target = getContinueTarget(entry)
  const StatusIcon = LIBRARY_STATUS_ICONS[entry.status]
  const title = entry.media.title ?? m.media_untitled()

  return (
    <li sx={styles.card}>
      <div sx={[styles.coverWrap, stylex.defaultMarker()]}>
        <Link
          params={{ mediaId: entry.mediaId }}
          to="/media/$mediaId"
          {...stylex.props(styles.coverLink)}
        >
          <Cover
            alt={title}
            priority={eager ? "high" : "auto"}
            src={entry.media.coverUrl}
            sx={styles.cover}
          />
        </Link>
        <span aria-hidden sx={styles.shade} />
        {showStatus ? (
          <span sx={styles.statusBadge} title={LIBRARY_STATUS_LABELS[entry.status]()}>
            <StatusIcon size={16} {...stylex.props(libraryStatusTones[entry.status])} />
          </span>
        ) : null}
        {unread > 0 ? (
          <span sx={styles.unread} title={m.library_unread({ count: unread })}>
            +{unread > 999 ? "999" : unread}
          </span>
        ) : null}
        {target === null ? null : (
          <div sx={styles.continue}>
            <Button
              render={
                <Link
                  params={{ chapterId: target.chapterId }}
                  search={{ page: target.page }}
                  to="/chapters/$chapterId"
                />
              }
              size="sm"
              sx={styles.continueButton}
            >
              <Play />
              <span sx={styles.continueLabel}>{target.label}</span>
            </Button>
            <Button
              aria-label={target.label}
              render={
                <Link
                  params={{ chapterId: target.chapterId }}
                  search={{ page: target.page }}
                  to="/chapters/$chapterId"
                />
              }
              size="icon-sm"
              sx={styles.continueIcon}
            >
              <Play />
            </Button>
          </div>
        )}
        <span aria-hidden sx={styles.bar}>
          <span
            style={{ width: `${percent}%` }}
            sx={[styles.barFill, percent === 100 && styles.barComplete]}
          />
        </span>
      </div>
      <div sx={styles.body}>
        <Link
          params={{ mediaId: entry.mediaId }}
          to="/media/$mediaId"
          {...stylex.props(styles.title, entry.media.title === null && styles.untitled)}
        >
          {title}
        </Link>
        <span sx={styles.meta}>
          {entry.totalCount === 0
            ? m.library_no_chapters()
            : m.library_progress_short({ read: entry.readCount, total: entry.totalCount })}
          {entry.score === null ? null : (
            <span
              aria-label={m.rating_your_score_label({
                score: entry.score,
                max: config.ratings.maxScore,
              })}
              role="img"
              sx={styles.score}
              title={m.rating_your_score_label({
                score: entry.score,
                max: config.ratings.maxScore,
              })}
            >
              <StarGlyph sx={styles.scoreIcon} />
              {entry.score}
            </span>
          )}
        </span>
        <LibraryEntryMenu
          entry={entry}
          trigger={
            <Button
              aria-label={m.library_entry_actions({ title })}
              size="icon-sm"
              sx={styles.menuButton}
              variant="ghost"
            >
              <Ellipsis />
            </Button>
          }
        />
      </div>
    </li>
  )
}
