import type { ContentRating, Language } from "@taiyomoe/db/constants"

export type StagedCoverFields = {
  volume: string
  language: Language
  contentRating: ContentRating
  main: boolean
}

export const parseVolumeInput = (value: string) => {
  const trimmed = value.trim()

  if (trimmed === "") {
    return null
  }

  const volume = Number(trimmed)

  return /^\d+(?:\.\d+)?$/.test(trimmed) && volume >= 1 ? volume : undefined
}
