import type { ChapterSource } from "./sources"

export type UploadRow = {
  key: string
  source: ChapterSource | null
  number: string
  volume: string
  title: string
  pageKeys: string[]
  link: string
  linkOpen: boolean
}

export type RowIssues = { errors: string[]; warnings: string[] }

export const parseNumber = (value: string) => {
  const number = Number(value.replace(",", "."))

  return value.trim() === "" || !Number.isFinite(number) || number < 0 ? null : number
}

export const byNumber = (a: UploadRow, b: UploadRow) =>
  (parseNumber(a.number) ?? Number.POSITIVE_INFINITY) -
    (parseNumber(b.number) ?? Number.POSITIVE_INFINITY) ||
  (a.source?.name ?? "").localeCompare(b.source?.name ?? "", undefined, { numeric: true })

export const linkNumber = (row: UploadRow) => String(parseNumber(row.number) ?? row.number)
