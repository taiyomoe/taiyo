import type { Language } from "@taiyomoe/db/constants"
import * as stylex from "@stylexjs/stylex"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogTitle,
} from "@taiyomoe/ui/components/ui/dialog"
import { Field, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import { Input } from "@taiyomoe/ui/components/ui/input"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useState } from "react"
import type { LatestChapter } from "@/features/chapters/api/chapters"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { LanguagePicker } from "@/components/fields/language-picker"
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
  "id" | "mediaTitle" | "number" | "volume" | "title" | "language"
>

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

type EditChapterFormProps = {
  chapter: EditableChapter
  onDone: () => void
}

export function EditChapterForm({ chapter, onDone }: EditChapterFormProps) {
  const details = useQuery(chapterQueryOptions(chapter.id))
  const invalidate = useInvalidateReview()
  const edit = useMutation({
    mutationFn: async ({
      id,
      details: changes,
      pageIds: reordered,
    }: {
      id: string
      details: ChapterUpdate | null
      pageIds: string[] | null
    }) => {
      if (changes !== null) {
        await ensureSuccess(await api.chapters[":id"].$patch({ param: { id }, json: changes }))
      }

      if (reordered !== null) {
        await ensureSuccess(
          await api.chapters[":id"].pages.$patch({ param: { id }, json: { pageIds: reordered } }),
        )
      }
    },
    onSuccess: invalidate,
  })
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
