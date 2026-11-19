import * as stylex from "@stylexjs/stylex"
import { CancelCircle, CheckCircle, ExternalLink, Eye, Globe } from "@taiyomoe/ui/components/icons"
import { TableRow } from "@taiyomoe/ui/components/ui/table"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
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
import { mediaCellStyles, TitleCell, Folded } from "@/features/catalog/components/shared/media-cell"
import { RowActions } from "@/features/catalog/components/shared/row-actions"
import { catalogStyles } from "@/features/catalog/lib/catalog-styles"
import { ChapterGroups } from "@/features/chapters/components/chapter-groups"
import { Uploader } from "@/features/chapters/components/uploader"
import { Cover } from "@/features/media/components/cover"
import {
  SubmissionDetail,
  SubmissionRelease,
  submissionLabel,
} from "@/features/uploads/components/submission-cells"
import { m } from "@/paraglide/messages"

export type ReviewDialogKind = "review" | "approve" | "reject"

const styles = stylex.create({
  open: {
    padding: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: "inherit",
    lineHeight: "inherit",
    outlineColor: colors.ring,
    outlineOffset: 2,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    textAlign: "start",
  },
})

export function ReviewQueueRow({
  submission,
  selection,
  onDialog,
}: {
  submission: ChapterSubmission
  selection: Selection
  onDialog: (kind: ReviewDialogKind) => void
}) {
  const label = submissionLabel(submission)
  const open = (kind: ReviewDialogKind) => () => {
    onDialog(kind)
  }
  const actions: RowAction[] = [
    { key: "review", label: m.review_chapter(), icon: Eye, onClick: open("review") },
    { key: "approve", label: m.review_approve(), icon: CheckCircle, onClick: open("approve") },
    {
      key: "media",
      label: m.catalog_view_page(),
      icon: ExternalLink,
      render: <Link params={{ mediaId: submission.mediaId }} to="/media/$mediaId" />,
    },
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
    {
      key: "reject",
      label: m.review_reject(),
      icon: CancelCircle,
      destructive: true,
      onClick: open("reject"),
    },
  ]
  const credits = (
    <>
      <Uploader uploader={submission.uploader} />
      <ChapterGroups groups={submission.groups} underUploader />
    </>
  )

  return (
    <TableRow>
      <CatalogSelectCell id={submission.id} label={label} selection={selection} />
      <CatalogCell column="chapter">
        <TitleCell
          detail={<SubmissionDetail submission={submission} />}
          narrow={{
            from: "4xl",
            content: (
              <>
                <Folded until="3xl">
                  <LanguageChip language={submission.language} />
                  <FoldedChapterPages chapter={submission} />
                  {credits}
                </Folded>
                <span {...stylex.props(catalogStyles.muted)}>
                  <TimeAgo date={submission.createdAt} length="long" />
                </span>
                <SubmissionRelease submission={submission} />
              </>
            ),
          }}
          thumb={<Cover src={submission.mediaCoverUrl} sx={mediaCellStyles.cover} />}
          title={
            <button
              aria-haspopup="dialog"
              onClick={open("review")}
              sx={[mediaCellStyles.title, styles.open]}
              title={m.review_chapter_title({
                media: submission.mediaTitle ?? m.media_untitled(),
                number: submission.number,
              })}
              type="button"
            >
              {submission.mediaTitle ?? m.media_untitled()}
            </button>
          }
        />
      </CatalogCell>
      <CatalogCell column="language">
        <LanguageChip language={submission.language} />
      </CatalogCell>
      <CatalogCell column="pages">
        <ChapterPages chapter={submission} />
      </CatalogCell>
      <CatalogCell column="credits">
        <div {...stylex.props(catalogStyles.inline)}>{credits}</div>
      </CatalogCell>
      <CatalogCell column="date">
        <div {...stylex.props(catalogStyles.stack)}>
          <span {...stylex.props(catalogStyles.muted)}>
            <TimeAgo date={submission.createdAt} length="long" />
          </span>
          <SubmissionRelease submission={submission} />
        </div>
      </CatalogCell>
      <CatalogCell column="actions">
        <RowActions actions={actions} label={m.catalog_actions({ name: label })} />
      </CatalogCell>
    </TableRow>
  )
}
