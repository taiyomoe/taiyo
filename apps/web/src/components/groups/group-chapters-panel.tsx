import type { Permissions } from "@taiyomoe/permissions"
import * as stylex from "@stylexjs/stylex"
import { CONTENT_RATINGS, type Language } from "@taiyomoe/db/constants"
import { CalendarClock, ChevronLeft, ChevronRight, Globe } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@taiyomoe/ui/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import { Input } from "@taiyomoe/ui/components/ui/input"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { useState } from "react"
import { AuthAlert } from "@/components/auth/auth-alert"
import { ChapterNumber, TimeAgo } from "@/components/chapters/chapter-meta"
import { LanguageChip } from "@/components/chapters/flags"
import { ScheduleActions } from "@/components/chapters/schedule-actions"
import { type Confirmation, ConfirmDialog } from "@/components/dashboard/confirm-dialog"
import { ListCard, ListRow } from "@/components/dashboard/dashboard-page"
import { Cover } from "@/components/media/cover"
import { PagePagination } from "@/components/pagination/page-pagination"
import { LanguagePicker } from "@/components/submissions/pickers"
import { isWebUrl } from "@/lib/chapter-batch/links"
import { getErrorMessage } from "@/lib/errors"
import {
  type LatestChapter,
  type UpcomingChapter,
  upcomingChaptersQueryOptions,
} from "@/lib/queries/chapters"
import { groupChaptersQueryOptions } from "@/lib/queries/groups"
import { chapterQueryOptions, useDeleteChapter, useEditChapter } from "@/lib/queries/submissions"
import { m } from "@/paraglide/messages"

const PER_PAGE = 20
const ALL_RATINGS = [...CONTENT_RATINGS]
const styles = stylex.create({
  cover: {
    flexShrink: 0,
    width: "3rem",
  },
  main: {
    gap: "0.375rem",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minWidth: 0,
  },
  titleLine: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
  },
  media: {
    textDecoration: "none",
    color: {
      default: colors.foreground,
      ":hover": `color-mix(in srgb, ${colors.foreground} 75%, ${colors.background})`,
    },
    fontWeight: 600,
    overflowWrap: "anywhere",
  },
  meta: {
    gap: "0.75rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    flexWrap: "wrap",
    fontSize: "0.875rem",
  },
  actions: {
    gap: "0.25rem",
    display: "flex",
    flexShrink: 0,
  },
  empty: {
    margin: 0,
    color: colors.mutedForeground,
  },
  sections: {
    gap: "1.25rem",
    display: "flex",
    flexDirection: "column",
  },
  section: {
    gap: "0.625rem",
    display: "flex",
    flexDirection: "column",
  },
  sectionTitle: {
    margin: 0,
    gap: "0.5rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    fontSize: "0.8125rem",
    fontWeight: 600,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  goesLive: {
    gap: "0.375rem",
    alignItems: "center",
    display: "inline-flex",
  },
  popup: {
    maxWidth: "52rem",
  },
  form: {
    gap: "1.25rem",
    display: "flex",
    flexDirection: "column",
  },
  row: {
    gap: "0.75rem",
    display: "grid",
    gridTemplateColumns: "1fr 1fr 2fr",
  },
  pages: {
    margin: 0,
    padding: 0,
    gap: "0.5rem",
    listStyle: "none",
    alignContent: "start",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(6rem, 1fr))",
    maxHeight: "22rem",
    overflowY: "auto",
  },
  page: {
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderStyle: "solid",
    borderWidth: 1,
    overflow: "hidden",
    backgroundColor: colors.card,
    display: "flex",
    flexDirection: "column",
  },
  pageImage: {
    aspectRatio: "3 / 4",
    backgroundColor: colors.muted,
    display: "block",
    objectFit: "cover",
    width: "100%",
  },
  pageControls: {
    padding: "0.25rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    fontSize: "0.75rem",
    fontVariantNumeric: "tabular-nums",
    justifyContent: "space-between",
  },
})

type EditableChapter = Pick<
  LatestChapter,
  "id" | "mediaTitle" | "number" | "volume" | "title" | "language"
>

const targetOf = (
  chapter: Pick<LatestChapter, "uploader" | "groups">,
  status: "PUBLISHED" | "SCHEDULED",
) => ({
  uploaderId: chapter.uploader.id,
  status,
  groupIds: chapter.groups.map((group) => group.id),
})

export function GroupChaptersPanel({ groupId, can }: { groupId: string; can: Permissions }) {
  const [page, setPage] = useState(1)
  const { data } = useSuspenseQuery(groupChaptersQueryOptions(groupId, ALL_RATINGS, page, PER_PAGE))
  const upcoming = useQuery(upcomingChaptersQueryOptions({ contentRatings: ALL_RATINGS, groupId }))
  const remove = useDeleteChapter()
  const [editing, setEditing] = useState<EditableChapter | null>(null)
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null)
  const scheduled = upcoming.data ?? []
  const confirmDelete = (chapterId: string) => {
    setConfirmation({
      title: m.group_chapter_delete_title(),
      description: m.group_chapter_delete_description(),
      confirmLabel: m.group_chapter_delete(),
      destructive: true,
      run: () => remove.mutateAsync(chapterId),
    })
  }

  if (data.data.length === 0 && scheduled.length === 0) {
    return <p sx={styles.empty}>{m.group_chapters_empty()}</p>
  }

  return (
    <div sx={styles.sections}>
      {scheduled.length === 0 ? null : (
        <section sx={styles.section}>
          <h3 sx={styles.sectionTitle}>
            <CalendarClock size={14} />
            {m.media_upcoming_title()}
          </h3>
          <ListCard>
            {scheduled.map((chapter) => (
              <UpcomingRow
                canDelete={can("chapter.delete", targetOf(chapter, "SCHEDULED"))}
                canEdit={can("chapter.update", targetOf(chapter, "PUBLISHED"))}
                canRelease={can("chapter.update", targetOf(chapter, "SCHEDULED"))}
                chapter={chapter}
                key={chapter.id}
                onDelete={() => {
                  confirmDelete(chapter.id)
                }}
                onEdit={() => {
                  setEditing(chapter)
                }}
              />
            ))}
          </ListCard>
        </section>
      )}
      {data.data.length === 0 ? null : (
        <section sx={styles.section}>
          {scheduled.length === 0 ? null : <h3 sx={styles.sectionTitle}>{m.group_chapters()}</h3>}
          <PublishedChapters
            can={can}
            chapters={data.data}
            onDelete={confirmDelete}
            onEdit={setEditing}
          />
          <PagePagination
            onJump={setPage}
            page={page}
            pageCount={Math.ceil(data.meta.total / PER_PAGE)}
            renderLink={(target) => (
              <button
                onClick={() => {
                  setPage(target)
                }}
                type="button"
              />
            )}
          />
        </section>
      )}
      <ConfirmDialog
        confirmation={confirmation}
        error={remove.isError ? getErrorMessage(remove.error) : null}
        onClose={() => {
          setConfirmation(null)
          remove.reset()
        }}
        pending={remove.isPending}
      />
      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            setEditing(null)
          }
        }}
        open={editing !== null}
      >
        <DialogPopup sx={styles.popup}>
          {editing === null ? null : (
            <EditChapterForm
              chapter={editing}
              onDone={() => {
                setEditing(null)
              }}
            />
          )}
        </DialogPopup>
      </Dialog>
    </div>
  )
}

function UpcomingRow({
  chapter,
  canRelease,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: {
  chapter: UpcomingChapter
  canRelease: boolean
  canEdit: boolean
  canDelete: boolean
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <ListRow>
      <Cover src={chapter.mediaCoverUrl} sx={styles.cover} />
      <div sx={styles.main}>
        <div sx={styles.titleLine}>
          <Link
            params={{ mediaId: chapter.mediaId }}
            to="/media/$mediaId"
            {...stylex.props(styles.media)}
          >
            {chapter.mediaTitle ?? m.media_untitled()}
          </Link>
          <ChapterNumber number={chapter.number} />
        </div>
        <div sx={styles.meta}>
          <LanguageChip language={chapter.language} />
          {chapter.title === null ? null : <span>{chapter.title}</span>}
          {chapter.isExternal ? (
            <span sx={styles.goesLive}>
              <Globe size={14} />
              {m.submission_link_only()}
            </span>
          ) : null}
          <span sx={styles.goesLive}>
            <CalendarClock size={14} />
            <TimeAgo date={chapter.publishAt} future />
          </span>
        </div>
      </div>
      <div sx={styles.actions}>
        {canRelease ? <ScheduleActions chapter={chapter} /> : null}
        {canEdit ? (
          <Button onClick={onEdit} size="sm" variant="ghost">
            {m.group_chapter_edit()}
          </Button>
        ) : null}
        {canDelete ? (
          <Button onClick={onDelete} size="sm" variant="ghost">
            {m.group_chapter_delete()}
          </Button>
        ) : null}
      </div>
    </ListRow>
  )
}

function PublishedChapters({
  chapters,
  can,
  onEdit,
  onDelete,
}: {
  chapters: LatestChapter[]
  can: Permissions
  onEdit: (chapter: LatestChapter) => void
  onDelete: (chapterId: string) => void
}) {
  return (
    <ListCard>
      {chapters.map((chapter) => (
        <ListRow key={chapter.id}>
          <Cover src={chapter.mediaCoverUrl} sx={styles.cover} />
          <div sx={styles.main}>
            <div sx={styles.titleLine}>
              <Link
                params={{ mediaId: chapter.mediaId }}
                to="/media/$mediaId"
                {...stylex.props(styles.media)}
              >
                {chapter.mediaTitle ?? m.media_untitled()}
              </Link>
              <ChapterNumber number={chapter.number} />
            </div>
            <div sx={styles.meta}>
              <LanguageChip language={chapter.language} />
              {chapter.title === null ? null : <span>{chapter.title}</span>}
              <TimeAgo date={chapter.createdAt} />
            </div>
          </div>
          <div sx={styles.actions}>
            {can("chapter.update", targetOf(chapter, "PUBLISHED")) ? (
              <Button
                onClick={() => {
                  onEdit(chapter)
                }}
                size="sm"
                variant="ghost"
              >
                {m.group_chapter_edit()}
              </Button>
            ) : null}
            {can("chapter.delete", targetOf(chapter, "PUBLISHED")) ? (
              <Button
                onClick={() => {
                  onDelete(chapter.id)
                }}
                size="sm"
                variant="ghost"
              >
                {m.group_chapter_delete()}
              </Button>
            ) : null}
          </div>
        </ListRow>
      ))}
    </ListCard>
  )
}

function EditChapterForm({ chapter, onDone }: { chapter: EditableChapter; onDone: () => void }) {
  const details = useQuery(chapterQueryOptions(chapter.id))
  const edit = useEditChapter()
  const [number, setNumber] = useState(String(chapter.number))
  const [volume, setVolume] = useState(chapter.volume ?? "")
  const [title, setTitle] = useState(chapter.title ?? "")
  const [language, setLanguage] = useState<Language>(chapter.language)
  const [order, setOrder] = useState<string[] | null>(null)
  const [link, setLink] = useState<string | null>(null)
  const linkValue = link ?? details.data?.externalUrl ?? ""
  const linkInvalid =
    (linkValue.trim() !== "" && !isWebUrl(linkValue.trim())) ||
    (details.data?.isExternal === true && linkValue.trim() === "")
  const pages = details.data?.pages ?? []
  const pageIds = order ?? pages.map((page) => page.id)
  const urls = new Map(pages.map((page) => [page.id, page.url]))
  const parsedNumber = Number(number)
  const numberInvalid = number.trim() === "" || !Number.isFinite(parsedNumber) || parsedNumber < 0
  const move = (index: number, offset: number) => {
    const next = [...pageIds]
    const [item] = next.splice(index, 1)

    if (item !== undefined) {
      next.splice(index + offset, 0, item)
      setOrder(next)
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {m.review_chapter_title({
            media: chapter.mediaTitle ?? m.media_untitled(),
            number: chapter.number,
          })}
        </DialogTitle>
        <DialogDescription>{m.group_chapter_edit_description()}</DialogDescription>
      </DialogHeader>
      <DialogPanel>
        <div sx={styles.form}>
          <AuthAlert message={edit.isError ? getErrorMessage(edit.error) : null} />
          <div sx={styles.row}>
            <Field invalid={numberInvalid}>
              <FieldLabel>{m.upload_number()}</FieldLabel>
              <Input
                inputMode="decimal"
                onChange={(event) => {
                  setNumber(event.target.value)
                }}
                value={number}
              />
            </Field>
            <Field>
              <FieldLabel>{m.upload_volume()}</FieldLabel>
              <Input
                onChange={(event) => {
                  setVolume(event.target.value)
                }}
                value={volume}
              />
            </Field>
            <Field>
              <FieldLabel>{m.upload_language()}</FieldLabel>
              <LanguagePicker onChange={setLanguage} value={language} />
            </Field>
          </div>
          <Field>
            <FieldLabel>{m.upload_chapter_title()}</FieldLabel>
            <Input
              onChange={(event) => {
                setTitle(event.target.value)
              }}
              value={title}
            />
          </Field>
          <Field invalid={linkInvalid}>
            <FieldLabel>{m.upload_link()}</FieldLabel>
            <Input
              onChange={(event) => {
                setLink(event.target.value)
              }}
              placeholder="https://"
              type="url"
              value={linkValue}
            />
            {linkInvalid ? (
              <FieldError match>
                {linkValue.trim() === ""
                  ? m.upload_warning_link_required()
                  : m.upload_link_invalid()}
              </FieldError>
            ) : null}
          </Field>
          {details.data?.isExternal === true ? null : (
            <Field>
              <FieldLabel>{m.upload_pages()}</FieldLabel>
              <ol sx={styles.pages}>
                {pageIds.map((id, index) => (
                  <li key={id} sx={styles.page}>
                    <img alt="" loading="lazy" src={urls.get(id)} sx={styles.pageImage} />
                    <div sx={styles.pageControls}>
                      <Button
                        aria-label={m.upload_page_earlier()}
                        disabled={index === 0}
                        onClick={() => {
                          move(index, -1)
                        }}
                        size="icon-xs"
                        type="button"
                        variant="ghost"
                      >
                        <ChevronLeft />
                      </Button>
                      <span>{index + 1}</span>
                      <Button
                        aria-label={m.upload_page_later()}
                        disabled={index === pageIds.length - 1}
                        onClick={() => {
                          move(index, 1)
                        }}
                        size="icon-xs"
                        type="button"
                        variant="ghost"
                      >
                        <ChevronRight />
                      </Button>
                    </div>
                  </li>
                ))}
              </ol>
            </Field>
          )}
        </div>
      </DialogPanel>
      <DialogFooter>
        <DialogClose render={<Button variant="outline" />}>{m.cancel()}</DialogClose>
        <Button
          disabled={edit.isPending || numberInvalid || linkInvalid}
          onClick={() => {
            edit.mutate(
              {
                id: chapter.id,
                details: {
                  number: parsedNumber,
                  volume: volume.trim() === "" ? null : volume.trim(),
                  title: title.trim() === "" ? null : title.trim(),
                  language,
                  ...(link === null
                    ? {}
                    : { externalUrl: link.trim() === "" ? null : link.trim() }),
                },
                pageIds: order,
              },
              { onSuccess: onDone },
            )
          }}
        >
          {m.save()}
        </Button>
      </DialogFooter>
    </>
  )
}
