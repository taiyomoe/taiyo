import type { Permissions } from "@taiyomoe/permissions"
import * as stylex from "@stylexjs/stylex"
import { Edit, ExternalLink, Trash } from "@taiyomoe/ui/components/icons"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import { TableCell, TableRow } from "@taiyomoe/ui/components/ui/table"
import { Link } from "@tanstack/react-router"
import type { ManagedChapter } from "@/features/catalog/api/catalog"
import type { RowAction } from "@/features/catalog/components/shared/row-actions"
import { LanguageChip } from "@/components/flags/flags"
import { TimeAgo } from "@/components/time/time-ago"
import { MediaCell } from "@/features/catalog/components/shared/media-cell"
import { RowActions } from "@/features/catalog/components/shared/row-actions"
import { catalogStyles } from "@/features/catalog/lib/catalog-styles"
import { ChapterGroups } from "@/features/chapters/components/chapter-groups"
import { ChapterNumber } from "@/features/chapters/components/chapter-number"
import { Uploader } from "@/features/chapters/components/uploader"
import { SUBMISSION_STATUS } from "@/features/uploads/lib/submission-status"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  chapter: {
    gap: "0.125rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  title: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
})

export function ChapterRow({
  chapter,
  can,
  onEdit,
  onDelete,
}: {
  chapter: ManagedChapter
  can: Permissions
  onEdit: () => void
  onDelete: () => void
}) {
  const target = {
    uploaderId: chapter.uploader.id,
    status: chapter.status,
    groupIds: chapter.groups.map((group) => group.id),
  }
  const actions: RowAction[] = [
    ...(chapter.status === "PUBLISHED"
      ? [
          {
            key: "read",
            label: m.catalog_chapter_read(),
            icon: ExternalLink,
            render: <Link params={{ chapterId: chapter.id }} to="/chapters/$chapterId" />,
          },
        ]
      : []),
    ...(can("chapter.update", target)
      ? [{ key: "edit", label: m.catalog_edit(), icon: Edit, onClick: onEdit }]
      : []),
    ...(can("chapter.delete", target)
      ? [
          {
            key: "delete",
            label: m.catalog_delete(),
            icon: Trash,
            destructive: true,
            onClick: onDelete,
          },
        ]
      : []),
  ]

  return (
    <TableRow>
      <TableCell>
        <div sx={styles.chapter}>
          <ChapterNumber number={chapter.number} />
          <span sx={[catalogStyles.muted, styles.title]}>
            {chapter.title ??
              (chapter.volume === null ? null : m.catalog_volume({ volume: chapter.volume }))}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <MediaCell
          coverUrl={chapter.mediaCoverUrl}
          mediaId={chapter.mediaId}
          title={chapter.mediaTitle}
        />
      </TableCell>
      <TableCell>
        <LanguageChip language={chapter.language} />
      </TableCell>
      <TableCell>
        <Badge variant={SUBMISSION_STATUS[chapter.status].variant}>
          {SUBMISSION_STATUS[chapter.status].label()}
        </Badge>
      </TableCell>
      <TableCell>
        <div sx={catalogStyles.inline}>
          <Uploader uploader={chapter.uploader} />
          <ChapterGroups groups={chapter.groups} />
        </div>
      </TableCell>
      <TableCell sx={catalogStyles.muted}>
        <TimeAgo date={chapter.createdAt} />
      </TableCell>
      <TableCell>
        <RowActions
          actions={actions}
          label={m.catalog_actions({
            name: `${chapter.mediaTitle ?? m.media_untitled()} — ${m.chapter_number({ number: chapter.number })}`,
          })}
        />
      </TableCell>
    </TableRow>
  )
}
