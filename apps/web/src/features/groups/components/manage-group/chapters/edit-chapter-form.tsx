import type { ChapterStatus } from "@taiyomoe/db/constants"
import type { Permissions } from "@taiyomoe/permissions"
import * as stylex from "@stylexjs/stylex"
import {
  isSupportedLanguage,
  type SupportedLanguage,
  SUPPORTED_LANGUAGES,
} from "@taiyomoe/db/constants"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogTitle,
} from "@taiyomoe/ui/components/ui/dialog"
import { Field, FieldDescription, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import { Input } from "@taiyomoe/ui/components/ui/input"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useState } from "react"
import type { LatestChapter } from "@/features/chapters/api/chapters"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { LanguagePicker } from "@/components/fields/language-picker"
import { type GroupOption, GroupPicker } from "@/features/groups/components/group-picker"
import { ChapterLinkField } from "@/features/groups/components/manage-group/chapters/chapter-link-field"
import { ChapterPagesField } from "@/features/groups/components/manage-group/chapters/chapter-pages-field"
import {
  type ChapterUpdate,
  chapterQueryOptions,
  useInvalidateReview,
} from "@/features/uploads/api/submissions"
import { isWebUrl } from "@/features/uploads/lib/chapter-batch/links"
import { api } from "@/lib/api"
import { ensureSuccess } from "@/lib/envelope"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

export type EditableChapter = Pick<
  LatestChapter,
  "id" | "mediaTitle" | "number" | "volume" | "title" | "language" | "groups" | "uploader"
> & { status: ChapterStatus }

const styles = stylex.create({
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
})

export function EditChapterForm({
  chapter,
  can,
  onDone,
}: {
  chapter: EditableChapter
  can: Permissions
  onDone: () => void
}) {
  const details = useQuery(chapterQueryOptions(chapter.id))
  const invalidate = useInvalidateReview()
  const edit = useMutation({
    mutationFn: async ({
      id,
      details: changes,
      pageIds: reordered,
      credited,
      uncredited,
    }: {
      id: string
      details: ChapterUpdate | null
      pageIds: string[] | null
      credited: string[]
      uncredited: string[]
    }) => {
      if (changes !== null) {
        await ensureSuccess(await api.chapters[":id"].$patch({ param: { id }, json: changes }))
      }

      if (reordered !== null) {
        await ensureSuccess(
          await api.chapters[":id"].pages.$patch({ param: { id }, json: { pageIds: reordered } }),
        )
      }

      for (const groupId of credited) {
        await ensureSuccess(
          await api.chapters[":id"].groups.$post({ param: { id }, json: { groupId } }),
        )
      }

      for (const groupId of uncredited) {
        await ensureSuccess(
          await api.chapters[":id"].groups[":groupId"].$delete({ param: { id, groupId } }),
        )
      }
    },
    onSettled: invalidate,
  })
  const [number, setNumber] = useState(String(chapter.number))
  const [volume, setVolume] = useState(chapter.volume ?? "")
  const [title, setTitle] = useState(chapter.title ?? "")
  const [language, setLanguage] = useState<SupportedLanguage | null>(
    isSupportedLanguage(chapter.language) ? chapter.language : null,
  )
  const [order, setOrder] = useState<string[] | null>(null)
  const [groups, setGroups] = useState<GroupOption[]>(chapter.groups)
  const target = {
    uploaderId: chapter.uploader.id,
    status: chapter.status,
    groupIds: chapter.groups.map((group) => group.id),
  }
  const canCredit = can("chapter.credit", { chapter: target, groupId: "" })
  const locked = new Set(
    chapter.groups
      .filter((group) => !can("chapter.uncredit", { chapter: target, groupId: group.id }))
      .map((group) => group.id),
  )
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
          <ErrorAlert message={edit.isError ? getErrorMessage(edit.error) : null} />
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
              <LanguagePicker
                languages={SUPPORTED_LANGUAGES}
                onChange={setLanguage}
                value={language}
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
          {canCredit ? (
            <Field>
              <FieldLabel>{m.upload_groups()}</FieldLabel>
              <GroupPicker locked={locked} onChange={setGroups} value={groups} />
              {locked.size === 0 ? null : (
                <FieldDescription>{m.group_chapter_credits_locked()}</FieldDescription>
              )}
            </Field>
          ) : null}
          <ChapterLinkField invalid={linkInvalid} onChange={setLink} value={linkValue} />
          {details.data?.isExternal === true ? null : (
            <ChapterPagesField
              onReorder={setOrder}
              pages={
                details.data === undefined
                  ? undefined
                  : pageIds.map((id) => ({ key: id, url: urls.get(id) ?? null }))
              }
            />
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
                  ...(language === null ? {} : { language }),
                  ...(link === null
                    ? {}
                    : { externalUrl: link.trim() === "" ? null : link.trim() }),
                },
                pageIds: order,
                credited: groups
                  .filter((group) => !target.groupIds.includes(group.id))
                  .map((group) => group.id),
                uncredited: target.groupIds.filter(
                  (groupId) => !groups.some((group) => group.id === groupId),
                ),
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
