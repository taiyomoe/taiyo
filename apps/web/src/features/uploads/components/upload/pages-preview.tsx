import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useMemo } from "react"
import type { ChapterSource } from "@/features/uploads/lib/chapter-batch/sources"
import { SortablePageGrid } from "@/features/uploads/components/sortable-page-grid"
import { m } from "@/paraglide/messages"

type PagesPreviewProps = {
  source: ChapterSource
  pageKeys: string[]
  onChange: (pageKeys: string[]) => void
}

const styles = stylex.create({
  loading: {
    margin: 0,
    color: colors.mutedForeground,
  },
})

export function PagesPreview({ source, pageKeys, onChange }: PagesPreviewProps) {
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
