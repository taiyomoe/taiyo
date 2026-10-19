import * as stylex from "@stylexjs/stylex"
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
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useMemo } from "react"
import type { ChapterSource } from "@/lib/chapter-batch/sources"
import { SortablePageGrid } from "@/components/submissions/sortable-page-grid"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  popup: {
    maxWidth: "60rem",
  },
  loading: {
    margin: 0,
    color: colors.mutedForeground,
  },
})

function PagesPreview({
  source,
  pageKeys,
  onChange,
}: {
  source: ChapterSource
  pageKeys: string[]
  onChange: (pageKeys: string[]) => void
}) {
  const { data } = useQuery({
    queryKey: ["chapter-batch", "pages", source.key],
    queryFn: () => source.open(),
    gcTime: 0,
    staleTime: Number.POSITIVE_INFINITY,
  })
  const urls = useMemo(
    () =>
      new Map(
        [...(data ?? new Map<string, Blob>())].map(([key, blob]) => [
          key,
          URL.createObjectURL(blob),
        ]),
      ),
    [data],
  )

  useEffect(
    () => () => {
      for (const url of urls.values()) {
        URL.revokeObjectURL(url)
      }
    },
    [urls],
  )

  if (data === undefined) {
    return <p sx={styles.loading}>{m.upload_pages_loading()}</p>
  }

  return (
    <SortablePageGrid
      onRemove={(key) => {
        onChange(pageKeys.filter((item) => item !== key))
      }}
      onReorder={onChange}
      pages={pageKeys.map((key) => ({ key, url: urls.get(key) ?? null }))}
    />
  )
}

export function ChapterPagesDialog({
  chapter,
  onChange,
  onClose,
}: {
  chapter: { number: string; source: ChapterSource; pageKeys: string[] } | null
  onChange: (pageKeys: string[]) => void
  onClose: () => void
}) {
  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
      open={chapter !== null}
    >
      <DialogPopup sx={styles.popup}>
        {chapter === null ? null : (
          <>
            <DialogHeader>
              <DialogTitle>{m.upload_pages_button({ number: chapter.number || "?" })}</DialogTitle>
              <DialogDescription>{m.upload_pages_dialog_description()}</DialogDescription>
            </DialogHeader>
            <DialogPanel>
              <PagesPreview
                onChange={onChange}
                pageKeys={chapter.pageKeys}
                source={chapter.source}
              />
            </DialogPanel>
            <DialogFooter>
              <DialogClose render={<Button />}>{m.upload_done()}</DialogClose>
            </DialogFooter>
          </>
        )}
      </DialogPopup>
    </Dialog>
  )
}
