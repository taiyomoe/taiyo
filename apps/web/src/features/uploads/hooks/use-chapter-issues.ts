import type { Language } from "@taiyomoe/db/constants"
import { config } from "@taiyomoe/config"
import { useQuery } from "@tanstack/react-query"
import { isWebUrl, resolveLink } from "@/features/uploads/lib/chapter-batch/links"
import {
  linkNumber,
  parseNumber,
  type RowIssues,
  type UploadRow,
} from "@/features/uploads/lib/chapter-batch/upload-rows"
import { api } from "@/lib/api"
import { unwrap } from "@/lib/envelope"
import { m } from "@/paraglide/messages"

type ChapterIssuesInput = {
  mediaId: string | undefined
  language: Language
  rows: UploadRow[]
  template: string
}

export function useChapterIssues({ mediaId, language, rows, template }: ChapterIssuesInput) {
  const existing = useQuery({
    queryKey: ["medias", mediaId ?? "", "chapter-numbers", language] as const,
    queryFn: async ({ signal }) =>
      unwrap(
        await api.medias[":id"]["chapter-numbers"].$get(
          { param: { id: mediaId ?? "" }, query: { language } },
          { init: { signal } },
        ),
      ),
    enabled: mediaId !== undefined,
  })
  const existingNumbers = new Set(existing.data ?? [])
  const counts = new Map<number, number>()

  for (const row of rows) {
    const number = parseNumber(row.number)

    if (number !== null) {
      counts.set(number, (counts.get(number) ?? 0) + 1)
    }
  }

  const issues = new Map(
    rows.map((row) => {
      const found: RowIssues = { errors: [], warnings: [] }
      const number = parseNumber(row.number)
      const link = resolveLink(row.link, template, linkNumber(row))

      if (number === null) {
        found.errors.push(m.upload_warning_number())
      } else if ((counts.get(number) ?? 0) > 1) {
        found.warnings.push(m.upload_warning_duplicate())
      } else if (existingNumbers.has(number)) {
        found.warnings.push(m.upload_warning_exists())
      }

      if (row.source === null && link === null) {
        found.errors.push(m.upload_warning_link_required())
      } else if (row.link.trim() !== "" && !isWebUrl(row.link.trim())) {
        found.errors.push(m.upload_link_invalid())
      }

      if (row.source !== null) {
        const sizes = new Map(row.source.pages.map((page) => [page.key, page.size]))
        const oversized = row.pageKeys.filter(
          (key) => (sizes.get(key) ?? 0) > config.images.maxChapterPageSizeBytes,
        ).length

        if (row.pageKeys.length === 0) {
          found.errors.push(m.upload_warning_no_pages())
        }

        if (row.pageKeys.length > config.images.maxChapterPages) {
          found.errors.push(m.upload_warning_too_many({ max: config.images.maxChapterPages }))
        }

        if (oversized > 0) {
          found.errors.push(m.upload_warning_too_large({ count: oversized }))
        }
      }

      return [row.key, found]
    }),
  )

  return { existingNumbers, issues }
}
