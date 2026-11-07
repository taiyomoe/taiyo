import * as stylex from "@stylexjs/stylex"
import {
  ArrowLeft,
  BookmarkAdd,
  BookmarkRemove,
  ExitFullscreen,
  Comment,
  Flag,
  Fullscreen,
  Pause,
  Play,
  Sliders,
} from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  breakpoints,
  colors,
  font,
  motion,
  radius,
  shadows,
} from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import { useFullscreen } from "@/features/reader/hooks/use-fullscreen"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  bar: {
    padding: "0.75rem",
    gap: "0.5rem",
    insetInline: 0,
    alignItems: "flex-start",
    display: "flex",
    justifyContent: "space-between",
    pointerEvents: "none",
    position: "fixed",
    transitionDuration: motion.enterLarge,
    transitionProperty: "opacity, translate",
    transitionTimingFunction: motion.easeOut,
    zIndex: 10,
    paddingTop: "max(0.75rem, env(safe-area-inset-top))",
    top: 0,
  },
  hidden: {
    opacity: 0,
    translate: "0 -0.5rem",
  },
  group: {
    padding: "0.25rem",
    borderColor: colors.border,
    borderRadius: radius.full,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.125rem",
    alignItems: "center",
    backdropFilter: "blur(12px)",
    backgroundColor: `color-mix(in srgb, ${colors.popover} 82%, transparent)`,
    boxShadow: shadows.overlay,
    color: colors.popoverForeground,
    display: "flex",
    pointerEvents: "auto",
    minWidth: 0,
  },
  groupHidden: {
    pointerEvents: "none",
  },
  heading: {
    display: { default: "none", [breakpoints.sm]: "flex" },
    flexDirection: "column",
    lineHeight: 1.25,
    paddingInlineEnd: "0.875rem",
    paddingInlineStart: "0.5rem",
    minWidth: 0,
  },
  media: {
    overflow: "hidden",
    color: colors.mutedForeground,
    fontSize: "0.75rem",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "22rem",
  },
  commentCount: {
    fontFamily: font.mono,
    fontSize: "0.75rem",
    fontVariantNumeric: "tabular-nums",
  },
  chapter: {
    overflow: "hidden",
    fontSize: "0.8125rem",
    fontWeight: 600,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "22rem",
  },
})

export function ReaderToolbar({
  visible,
  mediaId,
  mediaTitle,
  chapterLabel,
  strip,
  autoScrolling,
  bookmarked,
  onMenu,
  onAutoScroll,
  onToggleBookmark,
  onReport,
  onComments,
  commentCount,
}: {
  visible: boolean
  mediaId: string
  mediaTitle: string
  chapterLabel: string
  strip: boolean
  autoScrolling: boolean
  bookmarked: boolean | null
  onMenu: () => void
  onAutoScroll: () => void
  onToggleBookmark: () => void
  onReport: (() => void) | null
  onComments: (() => void) | null
  commentCount: number | undefined
}) {
  const fullscreen = useFullscreen()

  return (
    <div aria-hidden={!visible} sx={[styles.bar, !visible && styles.hidden]}>
      <div sx={[styles.group, !visible && styles.groupHidden]}>
        <Button
          aria-label={m.reader_back_to_title()}
          render={<Link params={{ mediaId }} to="/media/$mediaId" />}
          size="icon"
          title={m.reader_back_to_title()}
          variant="ghost"
        >
          <ArrowLeft />
        </Button>
        <Button
          aria-label={m.reader_open_menu()}
          onClick={onMenu}
          size="icon"
          title={m.reader_open_menu()}
          variant="ghost"
        >
          <Sliders />
        </Button>
        <div sx={styles.heading}>
          <span sx={styles.media}>{mediaTitle}</span>
          <span sx={styles.chapter}>{chapterLabel}</span>
        </div>
      </div>
      <div sx={[styles.group, !visible && styles.groupHidden]}>
        {onComments === null ? null : (
          <Button
            aria-label={m.reader_comments_open()}
            onClick={onComments}
            size={commentCount === undefined || commentCount === 0 ? "icon" : "default"}
            title={m.reader_comments_open()}
            variant="ghost"
          >
            <Comment />
            {commentCount === undefined || commentCount === 0 ? null : (
              <span sx={styles.commentCount}>{commentCount}</span>
            )}
          </Button>
        )}
        {bookmarked === null ? null : (
          <Button
            aria-label={bookmarked ? m.reader_bookmark_remove() : m.reader_bookmark_add()}
            aria-pressed={bookmarked}
            onClick={onToggleBookmark}
            size="icon"
            title={bookmarked ? m.reader_bookmark_remove() : m.reader_bookmark_add()}
            variant="ghost"
          >
            {bookmarked ? <BookmarkRemove /> : <BookmarkAdd />}
          </Button>
        )}
        {onReport === null ? null : (
          <Button
            aria-label={m.reader_report_open()}
            onClick={onReport}
            size="icon"
            title={m.reader_report_open()}
            variant="ghost"
          >
            <Flag />
          </Button>
        )}
        {strip ? (
          <Button
            aria-label={autoScrolling ? m.reader_auto_scroll_stop() : m.reader_auto_scroll_start()}
            aria-pressed={autoScrolling}
            onClick={onAutoScroll}
            size="icon"
            title={autoScrolling ? m.reader_auto_scroll_stop() : m.reader_auto_scroll_start()}
            variant="ghost"
          >
            {autoScrolling ? <Pause /> : <Play />}
          </Button>
        ) : null}
        {fullscreen.supported ? (
          <Button
            aria-label={fullscreen.active ? m.reader_exit_fullscreen() : m.reader_fullscreen()}
            onClick={fullscreen.toggle}
            size="icon"
            title={fullscreen.active ? m.reader_exit_fullscreen() : m.reader_fullscreen()}
            variant="ghost"
          >
            {fullscreen.active ? <ExitFullscreen /> : <Fullscreen />}
          </Button>
        ) : null}
      </div>
    </div>
  )
}
