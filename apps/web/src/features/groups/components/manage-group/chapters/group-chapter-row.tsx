import type { Permissions } from "@taiyomoe/permissions"
import * as stylex from "@stylexjs/stylex"
import { BookOpen, CalendarClock, Edit, Globe, Send, Trash } from "@taiyomoe/ui/components/icons"
import { TableRow } from "@taiyomoe/ui/components/ui/table"
import { Link } from "@tanstack/react-router"
import { isNonNull } from "remeda"
import type { RowAction } from "@/features/catalog/components/shared/row-actions"
import type { Selection } from "@/features/catalog/hooks/use-selection"
import type { LatestChapter, UpcomingChapter } from "@/features/chapters/api/chapters"
import { LanguageChip } from "@/components/flags/flags"
import { TimeAgo } from "@/components/time/time-ago"
import { CatalogCell, CatalogSelectCell } from "@/features/catalog/components/shared/catalog-table"
import { Folded, MediaCell } from "@/features/catalog/components/shared/media-cell"
import { RowActions } from "@/features/catalog/components/shared/row-actions"
import { catalogStyles } from "@/features/catalog/lib/catalog-styles"
import { ChapterGroups } from "@/features/chapters/components/chapter-groups"
import { ChapterNumber } from "@/features/chapters/components/chapter-number"
import { Uploader } from "@/features/chapters/components/uploader"
import { targetOf } from "@/features/groups/lib/chapter-target"
import { m } from "@/paraglide/messages"

export type GroupChapter = LatestChapter | UpcomingChapter

export type GroupChapterDialogKind = "edit" | "delete" | "release" | "reschedule"

const styles = stylex.create({
  detail: {
    overflow: "hidden",
    display: "block",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  number: {
    marginRight: "0.375rem",
  },
})

export const isScheduled = (chapter: GroupChapter): chapter is UpcomingChapter =>
  "publishAt" in chapter

export const chapterLabel = (chapter: GroupChapter) =>
  `${chapter.mediaTitle ?? m.media_untitled()} — ${m.chapter_number({ number: chapter.number })}`

/** What the viewer may do to a chapter of the group. */
export const getChapterAccess = (chapter: GroupChapter, can: Permissions) => {
  const scheduled = isScheduled(chapter)

  return {
    edit: can("chapter.update", targetOf(chapter, "PUBLISHED")),
    schedule: scheduled && can("chapter.update", targetOf(chapter, "SCHEDULED")),
    delete: can("chapter.delete", targetOf(chapter, scheduled ? "SCHEDULED" : "PUBLISHED")),
  }
}

type ChapterAccess = ReturnType<typeof getChapterAccess>

export function GroupChapterRow({
  chapter,
  access,
  selection,
  onDialog,
}: {
  chapter: GroupChapter
  access: ChapterAccess
  selection: Selection
  onDialog: (kind: GroupChapterDialogKind) => void
}) {
  const scheduled = isScheduled(chapter)
  const open = (kind: GroupChapterDialogKind) => () => {
    onDialog(kind)
  }
  const actions: RowAction[] = [
    ...(scheduled
      ? []
      : [
          {
            key: "read",
            label: m.catalog_chapter_read(),
            icon: BookOpen,
            render: <Link params={{ chapterId: chapter.id }} to="/chapters/$chapterId" />,
          },
        ]),
    ...(scheduled || chapter.externalUrl === null
      ? []
      : [
          {
            key: "external",
            label: m.submissions_open_external(),
            icon: Globe,
            render: (
              <a href={chapter.externalUrl} rel="noopener noreferrer nofollow" target="_blank" />
            ),
          },
        ]),
    ...(access.schedule
      ? [
          { key: "release", label: m.upcoming_release_now(), icon: Send, onClick: open("release") },
          {
            key: "reschedule",
            label: m.upcoming_reschedule(),
            icon: CalendarClock,
            onClick: open("reschedule"),
          },
        ]
      : []),
    ...(access.edit
      ? [{ key: "edit", label: m.catalog_edit(), icon: Edit, onClick: open("edit") }]
      : []),
    ...(access.delete
      ? [
          {
            key: "delete",
            label: m.catalog_delete(),
            icon: Trash,
            destructive: true,
            onClick: open("delete"),
          },
        ]
      : []),
  ]
  const detail = [
    chapter.isExternal ? m.submission_link_only() : null,
    chapter.title ??
      (chapter.volume === null ? null : m.catalog_volume({ volume: chapter.volume })),
  ]
    .filter(isNonNull)
    .join(" · ")
  const date = scheduled ? (
    <TimeAgo date={chapter.publishAt} future length="long" />
  ) : (
    <TimeAgo date={chapter.createdAt} length="long" />
  )

  return (
    <TableRow>
      <CatalogSelectCell
        disabled={!access.edit && !access.delete}
        id={chapter.id}
        label={chapterLabel(chapter)}
        selection={selection}
      />
      <CatalogCell column="chapter">
        <MediaCell
          coverUrl={chapter.mediaCoverUrl}
          detail={
            <span sx={styles.detail} title={detail === "" ? undefined : detail}>
              <ChapterNumber number={chapter.number} sx={styles.number} />
              {detail}
            </span>
          }
          mediaId={chapter.mediaId}
          narrow={{
            from: "4xl",
            content: (
              <>
                <Folded until="3xl">
                  <LanguageChip language={chapter.language} />
                </Folded>
                <Uploader uploader={chapter.uploader} />
                <ChapterGroups groups={chapter.groups} />
                <span {...stylex.props(catalogStyles.muted)}>{date}</span>
              </>
            ),
          }}
          title={chapter.mediaTitle}
        />
      </CatalogCell>
      <CatalogCell column="language">
        <LanguageChip language={chapter.language} />
      </CatalogCell>
      <CatalogCell column="credits">
        <div {...stylex.props(catalogStyles.inline)}>
          <Uploader uploader={chapter.uploader} />
          <ChapterGroups groups={chapter.groups} underUploader />
        </div>
      </CatalogCell>
      <CatalogCell column="date" sx={catalogStyles.muted}>
        {date}
      </CatalogCell>
      <CatalogCell column="actions">
        <RowActions actions={actions} label={m.catalog_actions({ name: chapterLabel(chapter) })} />
      </CatalogCell>
    </TableRow>
  )
}
