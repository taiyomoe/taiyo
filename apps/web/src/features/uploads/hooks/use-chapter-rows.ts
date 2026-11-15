import { useState } from "react"
import { parseChapterName } from "@/features/uploads/lib/chapter-batch/parse-chapter-name"
import { type DroppedFile, readChapterSources } from "@/features/uploads/lib/chapter-batch/sources"
import {
  byNumber,
  parseNumber,
  type UploadRow,
} from "@/features/uploads/lib/chapter-batch/upload-rows"

export function useChapterRows() {
  const [rows, setRows] = useState<UploadRow[]>([])
  const [reading, setReading] = useState(false)
  const [unsupported, setUnsupported] = useState<string[]>([])
  const [started, setStarted] = useState(false)
  const updateRow = (key: string, patch: Partial<UploadRow>) => {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)))
  }
  const addFiles = (files: Promise<DroppedFile[]>) => {
    setReading(true)
    setStarted(false)
    void files
      .then(readChapterSources)
      .then((result) => {
        const added = result.chapters.map((source) => {
          const parsed = parseChapterName(source.path)

          return {
            key: source.key,
            source,
            number: parsed.number === null ? "" : String(parsed.number),
            volume: parsed.volume ?? "",
            title: parsed.title ?? "",
            pageKeys: source.pages.map((page) => page.key),
            link: "",
            linkOpen: false,
          } satisfies UploadRow
        })

        setUnsupported(result.unsupported)
        setRows((current) => [...current, ...added].sort(byNumber))
      })
      .finally(() => {
        setReading(false)
      })
  }
  const addLinkRow = (existingNumbers: Set<number>) => {
    const numbers = rows.flatMap((row) => {
      const number = parseNumber(row.number)

      return number === null ? [] : [number]
    })
    const next = Math.floor(Math.max(0, ...numbers, ...existingNumbers)) + 1

    setStarted(false)
    setRows((current) => [
      ...current,
      {
        key: `link:${crypto.randomUUID()}`,
        source: null,
        number: String(next),
        volume: "",
        title: "",
        pageKeys: [],
        link: "",
        linkOpen: true,
      },
    ])
  }
  const removeRow = (key: string) => {
    setRows((current) => current.filter((item) => item.key !== key))
  }
  const clearRows = () => {
    setRows([])
  }
  const markStarted = () => {
    setRows([])
    setUnsupported([])
    setStarted(true)
  }

  return {
    rows,
    reading,
    unsupported,
    started,
    updateRow,
    addFiles,
    addLinkRow,
    removeRow,
    clearRows,
    markStarted,
  }
}
