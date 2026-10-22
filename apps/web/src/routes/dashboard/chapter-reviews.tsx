import type { Language } from "@taiyomoe/db/constants"
import type { Permissions } from "@taiyomoe/permissions"
import * as stylex from "@stylexjs/stylex"
import { CheckCircle, Globe } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Checkbox } from "@taiyomoe/ui/components/ui/checkbox"
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
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@taiyomoe/ui/components/ui/empty"
import { Field, FieldError, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import { Input } from "@taiyomoe/ui/components/ui/input"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { Textarea } from "@taiyomoe/ui/components/ui/textarea"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { noop, useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router"
import { type ReactNode, useState } from "react"
import { range } from "remeda"
import { z } from "zod"
import { AuthAlert } from "@/components/auth/auth-alert"
import { DashboardPage, ListCard } from "@/components/dashboard/dashboard-page"
import { PagePagination } from "@/components/pagination/page-pagination"
import { type GroupOption, GroupPicker, LanguagePicker } from "@/components/submissions/pickers"
import { SubmissionRow } from "@/components/submissions/submission-row"
import { api } from "@/lib/api"
import { ensureSuccess, unwrap } from "@/lib/envelope"
import { getErrorMessage } from "@/lib/errors"
import { getPermissions, usePermissions } from "@/lib/permissions"
import {
  type ApproveFixes,
  type ChapterSubmission,
  chapterQueryOptions,
  reviewQueueQueryOptions,
  SUBMISSIONS_PER_PAGE,
  useInvalidateReview,
} from "@/lib/queries/submissions"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  popup: {
    maxWidth: "56rem",
  },
  body: {
    gap: "1.5rem",
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      "@media (width >= 48rem)": "minmax(0, 1fr) 18rem",
    },
  },
  pages: {
    margin: 0,
    padding: 0,
    gap: "0.5rem",
    listStyle: "none",
    alignContent: "start",
    alignSelf: "start",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(6.5rem, 1fr))",
    maxHeight: "28rem",
    overflowY: "auto",
  },
  page: {
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colors.muted,
    position: "relative",
  },
  pageImage: {
    aspectRatio: "3 / 4",
    display: "block",
    objectFit: "cover",
    width: "100%",
  },
  pageIndex: {
    borderRadius: radius.sm,
    paddingInline: "0.375rem",
    backgroundColor: "rgb(0 0 0 / 60%)",
    color: "white",
    fontSize: "0.6875rem",
    fontVariantNumeric: "tabular-nums",
    position: "absolute",
    bottom: "0.25rem",
    left: "0.25rem",
  },
  fields: {
    gap: "1rem",
    display: "flex",
    flexDirection: "column",
  },
  row: {
    gap: "0.75rem",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
  },
  skeleton: {
    borderRadius: radius.md,
    aspectRatio: "3 / 4",
  },
  muted: {
    margin: 0,
    color: colors.mutedForeground,
  },
  external: {
    gap: "0.5rem",
    display: "flex",
    flexDirection: "column",
  },
  externalLink: {
    gap: "0.5rem",
    alignItems: "center",
    color: colors.foreground,
    display: "flex",
    fontWeight: 500,
    overflowWrap: "anywhere",
  },
  bulkBar: {
    gap: "0.75rem",
    paddingInline: "1.25rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  bulkSelect: {
    gap: "0.75rem",
    alignItems: "center",
    color: colors.mutedForeground,
    cursor: "pointer",
    display: "flex",
    fontSize: "0.875rem",
  },
  bulkActions: {
    gap: "0.5rem",
    display: "flex",
  },
})
const searchSchema = z.object({
  page: z.coerce.number().int().min(1).max(100_000).optional().catch(undefined),
})

export const Route = createFileRoute("/dashboard/chapter-reviews")({
  head: () => ({ meta: [{ title: m.review_chapters_meta_title() }] }),
  validateSearch: searchSchema,
  beforeLoad: ({ context }) => {
    if (!getPermissions(context.session.user)("chapter.review")) {
      throw redirect({ to: "/dashboard" })
    }
  },
  loaderDeps: ({ search }) => ({ page: search.page ?? 1 }),
  loader: async ({ context, deps: { page } }) => {
    const prefetch = context.queryClient.query(reviewQueueQueryOptions(page)).catch(noop)

    if (import.meta.env.SSR) {
      await prefetch
    }
  },
  component: function ChapterReviews() {
    const { session } = Route.useRouteContext()
    const { page } = Route.useLoaderDeps()
    const { user } = session
    const { data } = useSuspenseQuery(reviewQueueQueryOptions(page))
    const can = usePermissions(user)
    const navigate = useNavigate({ from: "/dashboard/chapter-reviews" })
    const [reviewing, setReviewing] = useState<ChapterSubmission | null>(null)
    const [selected, setSelected] = useState<string[]>([])
    const pageIds = data.data.map((submission) => submission.id)
    const selection = selected.filter((id) => pageIds.includes(id))

    return (
      <DashboardPage subtitle={m.review_chapters_subtitle()} title={m.review_chapters_title()}>
        {data.data.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CheckCircle />
              </EmptyMedia>
              <EmptyTitle>{m.review_empty_title()}</EmptyTitle>
              <EmptyDescription>{m.review_chapters_empty()}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <BulkBar
              allSelected={selection.length === pageIds.length}
              onClear={() => {
                setSelected([])
              }}
              onToggleAll={(checked) => {
                setSelected(checked ? pageIds : [])
              }}
              selection={selection}
            />
            <ListCard>
              {data.data.map((submission) => (
                <SubmissionRow
                  leading={
                    <Checkbox
                      aria-label={m.review_chapter_title({
                        media: submission.mediaTitle ?? m.media_untitled(),
                        number: submission.number,
                      })}
                      checked={selection.includes(submission.id)}
                      onCheckedChange={(checked) => {
                        setSelected((current) =>
                          checked
                            ? [...current, submission.id]
                            : current.filter((id) => id !== submission.id),
                        )
                      }}
                    />
                  }
                  actions={
                    <Button
                      onClick={() => {
                        setReviewing(submission)
                      }}
                      size="sm"
                    >
                      {m.review_chapter()}
                    </Button>
                  }
                  key={submission.id}
                  showUploader
                  submission={submission}
                />
              ))}
            </ListCard>
            <PagePagination
              onJump={(target) => {
                void navigate({ search: { page: target === 1 ? undefined : target } })
              }}
              page={page}
              pageCount={Math.ceil(data.meta.total / SUBMISSIONS_PER_PAGE)}
              renderLink={(target) => (
                <Link
                  search={{ page: target === 1 ? undefined : target }}
                  to="/dashboard/chapter-reviews"
                />
              )}
            />
          </>
        )}
        <Dialog
          onOpenChange={(open) => {
            if (!open) {
              setReviewing(null)
            }
          }}
          open={reviewing !== null}
        >
          <DialogPopup sx={styles.popup}>
            {reviewing === null ? null : (
              <ReviewForm
                can={can}
                onDone={() => {
                  setReviewing(null)
                }}
                submission={reviewing}
              />
            )}
          </DialogPopup>
        </Dialog>
      </DashboardPage>
    )
  },
})

function BulkBar({
  selection,
  allSelected,
  onToggleAll,
  onClear,
}: {
  selection: string[]
  allSelected: boolean
  onToggleAll: (checked: boolean) => void
  onClear: () => void
}) {
  const invalidate = useInvalidateReview()
  const review = useMutation({
    mutationFn: async ({ chapterIds, reason: note }: { chapterIds: string[]; reason?: string }) => {
      if (note === undefined) {
        const response = await api.chapters.approve.$post({ json: { chapterIds } })

        return (await unwrap<Awaited<ReturnType<typeof response.json>>>(response)).skipped.length
      }

      const response = await api.chapters.reject.$post({ json: { chapterIds, reason: note } })

      return (await unwrap<Awaited<ReturnType<typeof response.json>>>(response)).skipped.length
    },
    onSuccess: invalidate,
  })
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState("")
  const [touched, setTouched] = useState(false)
  const [skipped, setSkipped] = useState<number | null>(null)
  const run = (chapterIds: string[], rejectReason?: string) => {
    review.mutate(
      rejectReason === undefined ? { chapterIds } : { chapterIds, reason: rejectReason },
      {
        onSuccess: (count) => {
          setSkipped(count)
          setRejecting(false)
          setReason("")
          setTouched(false)
          onClear()
        },
      },
    )
  }

  return (
    <>
      <div sx={styles.bulkBar}>
        <label sx={styles.bulkSelect}>
          <Checkbox checked={allSelected} onCheckedChange={onToggleAll} />
          {selection.length === 0
            ? m.review_select_all()
            : m.review_selected({ count: selection.length })}
        </label>
        <div sx={styles.bulkActions}>
          <Button
            disabled={selection.length === 0 || review.isPending}
            onClick={() => {
              setRejecting(true)
            }}
            size="sm"
            variant="outline"
          >
            {m.review_reject_selected()}
          </Button>
          <Button
            disabled={selection.length === 0 || review.isPending}
            onClick={() => {
              run(selection)
            }}
            size="sm"
          >
            {m.review_approve_selected()}
          </Button>
        </div>
      </div>
      <AuthAlert message={review.isError ? getErrorMessage(review.error) : null} />
      {skipped === null || skipped === 0 ? null : (
        <p sx={styles.muted}>{m.review_bulk_skipped({ count: skipped })}</p>
      )}
      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            setRejecting(false)
          }
        }}
        open={rejecting}
      >
        <DialogPopup>
          <DialogHeader>
            <DialogTitle>{m.review_bulk_reject_title()}</DialogTitle>
            <DialogDescription>{m.review_bulk_reject_description()}</DialogDescription>
          </DialogHeader>
          <DialogPanel>
            <Field invalid={touched && reason.trim() === ""}>
              <FieldLabel>{m.review_reject_note()}</FieldLabel>
              <Textarea
                onChange={(event) => {
                  setReason(event.target.value)
                }}
                placeholder={m.review_chapter_reason_placeholder()}
                rows={4}
                value={reason}
              />
              {touched && reason.trim() === "" ? (
                <FieldError match>{m.review_reject_note_required()}</FieldError>
              ) : null}
            </Field>
          </DialogPanel>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>{m.cancel()}</DialogClose>
            <Button
              disabled={review.isPending}
              onClick={() => {
                setTouched(true)

                if (reason.trim() !== "") {
                  run(selection, reason.trim())
                }
              }}
              variant="destructive"
            >
              {m.review_reject_selected()}
            </Button>
          </DialogFooter>
        </DialogPopup>
      </Dialog>
    </>
  )
}

function ReviewForm({
  submission,
  can,
  onDone,
}: {
  submission: ChapterSubmission
  can: Permissions
  onDone: () => void
}) {
  const chapter = useQuery(chapterQueryOptions(submission.id))
  const invalidate = useInvalidateReview()
  const review = useMutation({
    mutationFn: async ({
      id,
      fixes,
      reason: note,
    }: {
      id: string
      fixes?: ApproveFixes
      reason?: string
    }) =>
      ensureSuccess(
        note === undefined
          ? await api.chapters[":id"].approve.$post({ param: { id }, json: fixes ?? {} })
          : await api.chapters[":id"].reject.$post({ param: { id }, json: { reason: note } }),
      ),
    onSuccess: invalidate,
  })
  const [number, setNumber] = useState(String(submission.number))
  const [volume, setVolume] = useState(submission.volume ?? "")
  const [title, setTitle] = useState(submission.title ?? "")
  const [language, setLanguage] = useState<Language>(submission.language)
  const [groups, setGroups] = useState<GroupOption[]>(submission.groups)
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState("")
  const [touched, setTouched] = useState(false)
  const parsedNumber = Number(number)
  const numberInvalid = number.trim() === "" || !Number.isFinite(parsedNumber) || parsedNumber < 0
  const pages = chapter.data?.pages
  let previews: ReactNode = <p sx={styles.muted}>{m.review_chapter_no_pages()}</p>

  if (pages === undefined) {
    previews = (
      <ol sx={styles.pages}>
        {range(0, Math.min(Math.max(submission.pageCount, 1), 8)).map((index) => (
          <li key={index}>
            <Skeleton sx={styles.skeleton} />
          </li>
        ))}
      </ol>
    )
  } else if (pages !== null && pages.length > 0) {
    previews = (
      <ol sx={styles.pages}>
        {pages.map((page, index) => (
          <li key={page.id} sx={styles.page}>
            <a href={page.url} rel="noreferrer" target="_blank">
              <img alt="" loading="lazy" src={page.url} sx={styles.pageImage} />
            </a>
            <span sx={styles.pageIndex}>{index + 1}</span>
          </li>
        ))}
      </ol>
    )
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {m.review_chapter_title({
            media: submission.mediaTitle ?? m.media_untitled(),
            number: submission.number,
          })}
        </DialogTitle>
        <DialogDescription>
          {m.review_chapter_description({ name: submission.uploader.displayUsername })}
        </DialogDescription>
      </DialogHeader>
      <DialogPanel>
        <div sx={styles.body}>
          {submission.isExternal && submission.externalUrl !== null ? (
            <div sx={styles.external}>
              <p sx={styles.muted}>{m.review_chapter_external()}</p>
              <a
                href={submission.externalUrl}
                rel="noopener noreferrer nofollow ugc"
                sx={styles.externalLink}
                target="_blank"
              >
                <Globe size={16} />
                {submission.externalUrl}
              </a>
            </div>
          ) : (
            previews
          )}
          <div sx={styles.fields}>
            <AuthAlert message={review.isError ? getErrorMessage(review.error) : null} />
            {rejecting ? (
              <Field invalid={touched && reason.trim() === ""}>
                <FieldLabel>{m.review_reject_note()}</FieldLabel>
                <Textarea
                  onBlur={() => {
                    setTouched(true)
                  }}
                  onChange={(event) => {
                    setReason(event.target.value)
                  }}
                  placeholder={m.review_chapter_reason_placeholder()}
                  rows={5}
                  value={reason}
                />
                {touched && reason.trim() === "" ? (
                  <FieldError match>{m.review_reject_note_required()}</FieldError>
                ) : null}
              </Field>
            ) : (
              <>
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
                <Field>
                  <FieldLabel>{m.upload_language()}</FieldLabel>
                  <LanguagePicker onChange={setLanguage} value={language} />
                </Field>
                <Field>
                  <FieldLabel>{m.upload_groups()}</FieldLabel>
                  <GroupPicker can={can} onChange={setGroups} value={groups} />
                </Field>
              </>
            )}
          </div>
        </div>
      </DialogPanel>
      <DialogFooter>
        {rejecting ? (
          <>
            <Button
              onClick={() => {
                setRejecting(false)
              }}
              variant="outline"
            >
              {m.cancel()}
            </Button>
            <Button
              disabled={review.isPending}
              onClick={() => {
                setTouched(true)

                if (reason.trim() !== "") {
                  review.mutate({ id: submission.id, reason: reason.trim() }, { onSuccess: onDone })
                }
              }}
              variant="destructive"
            >
              {m.review_reject()}
            </Button>
          </>
        ) : (
          <>
            <DialogClose render={<Button variant="outline" />}>{m.cancel()}</DialogClose>
            <Button
              onClick={() => {
                setRejecting(true)
              }}
              variant="outline"
            >
              {m.review_reject()}
            </Button>
            <Button
              disabled={review.isPending || numberInvalid || submission.pageCount === 0}
              onClick={() => {
                review.mutate(
                  {
                    id: submission.id,
                    fixes: {
                      number: parsedNumber,
                      volume: volume.trim() === "" ? null : volume.trim(),
                      title: title.trim() === "" ? null : title.trim(),
                      language,
                      groupIds: groups.map((group) => group.id),
                    },
                  },
                  { onSuccess: onDone },
                )
              }}
            >
              {m.review_approve()}
            </Button>
          </>
        )}
      </DialogFooter>
    </>
  )
}
