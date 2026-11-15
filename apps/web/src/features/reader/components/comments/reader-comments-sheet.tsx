import * as stylex from "@stylexjs/stylex"
import { Sheet, SheetPanel, SheetPopup, SheetTitle } from "@taiyomoe/ui/components/ui/sheet"
import type { Session } from "@/lib/session"
import { CommentSection } from "@/features/comments/components/comment-section"
import { useWideScreen } from "@/features/reader/hooks/use-wide-screen"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  popup: {
    outlineStyle: "none",
    maxWidth: "38rem",
  },
  bottom: {
    maxHeight: "88dvh",
  },
  title: {
    margin: "-1px",
    padding: 0,
    borderWidth: 0,
    overflow: "hidden",
    clip: "rect(0 0 0 0)",
    position: "absolute",
    whiteSpace: "nowrap",
    height: 1,
    width: 1,
  },
  panel: {
    paddingTop: "3.25rem",
  },
})

export function ReaderCommentsSheet({
  open,
  onOpenChange,
  chapterId,
  chapterLabel,
  viewer,
  linkedCommentId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  chapterId: string
  chapterLabel: string
  viewer: Session["user"] | null
  linkedCommentId: string | null
}) {
  const wide = useWideScreen()

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetPopup side={wide ? "right" : "bottom"} sx={[styles.popup, !wide && styles.bottom]}>
        <SheetTitle sx={styles.title}>
          {m.reader_comments_title({ chapter: chapterLabel })}
        </SheetTitle>
        <SheetPanel sx={styles.panel}>
          {open ? (
            <CommentSection
              getPermalink={(id) => `/chapters/${chapterId}?comment=${id}`}
              linkedCommentId={linkedCommentId}
              target={{ type: "CHAPTER", id: chapterId }}
              title={m.reader_comments_heading()}
              viewer={viewer}
            />
          ) : null}
        </SheetPanel>
      </SheetPopup>
    </Sheet>
  )
}
