import * as stylex from "@stylexjs/stylex"
import { BookOpen, CalendarClock, Comment, Globe, Send, Undo } from "@taiyomoe/ui/components/icons"
import { TableRow } from "@taiyomoe/ui/components/ui/table"
import { Link } from "@tanstack/react-router"
import type { RowAction } from "@/features/catalog/components/shared/row-actions"
import type { Selection } from "@/features/catalog/hooks/use-selection"
import type { ChapterSubmission } from "@/features/uploads/api/submissions"
import { LanguageChip } from "@/components/flags/flags"
import { TimeAgo } from "@/components/time/time-ago"
import { CatalogCell, CatalogSelectCell } from "@/features/catalog/components/shared/catalog-table"
import {
  ChapterPages,
  FoldedChapterPages,
} from "@/features/catalog/components/shared/chapter-pages"
import { MediaCell, Folded } from "@/features/catalog/components/shared/media-cell"
import { RowActions } from "@/features/catalog/components/shared/row-actions"
import { catalogStyles } from "@/features/catalog/lib/catalog-styles"
import { ChapterGroups } from "@/features/chapters/components/chapter-groups"
import {
  SubmissionDetail,
  SubmissionRejection,
  SubmissionRelease,
  SubmissionStatus,
  submissionLabel,
} from "@/features/uploads/components/submission-cells"
import { m } from "@/paraglide/messages"

export type SubmissionDialog = "release" | "reschedule" | "note" | "withdraw"

export const isWithdrawable = (submission: ChapterSubmission) =>
  submission.status === "PENDING" || submission.status === "UPLOADING"

export function MySubmissionRow({
  submission,
  selection,
  onDialog,
}: {
  submission: ChapterSubmission
  selection: Selection | undefined
  onDialog: (dialog: SubmissionDialog) => void
}) {
  const label = submissionLabel(submission)
  const open = (dialog: SubmissionDialog) => () => {
    onDialog(dialog)
  }
  const scheduled = submission.status === "SCHEDULED" && submission.publishAt !== null
  const actions: RowAction[] = [
    ...(submission.status === "PUBLISHED"
      ? [
          {
            key: "read",
            label: m.catalog_chapter_read(),
            icon: BookOpen,
            render: <Link params={{ chapterId: submission.id }} to="/chapters/$chapterId" />,
          },
        ]
      : []),
    ...(submission.externalUrl === null
      ? []
      : [
          {
            key: "external",
            label: m.submissions_open_external(),
            icon: Globe,
            render: (
              <a href={submission.externalUrl} rel="noopener noreferrer nofollow" target="_blank" />
            ),
          },
        ]),
    ...(submission.rejectionReason === null
      ? []
      : [{ key: "note", label: m.submissions_view_note(), icon: Comment, onClick: open("note") }]),
    ...(scheduled
      ? [
          {
            key: "release",
            label: m.upcoming_release_now(),
            icon: Send,
            onClick: open("release"),
          },
          {
            key: "reschedule",
            label: m.upcoming_reschedule(),
            icon: CalendarClock,
            onClick: open("reschedule"),
          },
        ]
      : []),
    ...(isWithdrawable(submission)
      ? [
          {
            key: "withdraw",
            label: m.submission_withdraw(),
            icon: Undo,
            destructive: true,
            onClick: open("withdraw"),
          },
        ]
      : []),
  ]
  const status = <SubmissionStatus submission={submission} />
  const notes = (
    <>
      <SubmissionRelease submission={submission} />
      <SubmissionRejection submission={submission} />
    </>
  )

  return (
    <TableRow>
      {selection !== undefined && (
        <CatalogSelectCell
          disabled={!isWithdrawable(submission)}
          id={submission.id}
          label={label}
          selection={selection}
        />
      )}
      <CatalogCell column="chapter">
        <MediaCell
          coverUrl={submission.mediaCoverUrl}
          detail={<SubmissionDetail submission={submission} />}
          mediaId={submission.mediaId}
          narrow={{
            from: "4xl",
            content: (
              <>
                <Folded until="3xl">
                  {status}
                  <LanguageChip language={submission.language} />
                  <FoldedChapterPages chapter={submission} />
                </Folded>
                <ChapterGroups groups={submission.groups} />
                <span {...stylex.props(catalogStyles.muted)}>
                  <TimeAgo date={submission.createdAt} length="long" />
                </span>
                <Folded until="3xl">{notes}</Folded>
              </>
            ),
          }}
          title={submission.mediaTitle}
        />
      </CatalogCell>
      <CatalogCell column="language">
        <LanguageChip language={submission.language} />
      </CatalogCell>
      <CatalogCell column="pages">
        <ChapterPages chapter={submission} />
      </CatalogCell>
      <CatalogCell column="status">
        <div {...stylex.props(catalogStyles.stack)}>
          {status}
          {notes}
        </div>
      </CatalogCell>
      <CatalogCell column="groups">
        <ChapterGroups groups={submission.groups} />
      </CatalogCell>
      <CatalogCell column="date" sx={catalogStyles.muted}>
        <TimeAgo date={submission.createdAt} length="long" />
      </CatalogCell>
      <CatalogCell column="actions">
        <RowActions actions={actions} label={m.catalog_actions({ name: label })} />
      </CatalogCell>
    </TableRow>
  )
}
