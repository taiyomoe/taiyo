import type { Languages } from "@prisma/client"

export type ParsedMdCover = {
  mdId: string
  url: string
  volume: number | null
  language: Languages
}

export type ParsedMdChapter = {
  mdId: string
  title: string | null
  number: number
  volume: number | null
  groupIds: string[]
}
