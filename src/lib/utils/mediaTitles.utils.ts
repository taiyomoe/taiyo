import type { MediaTitle } from "@prisma/client"

import type { MediaLimited } from "~/lib/types"

const sort = <T extends MediaLimited["titles"] | MediaTitle[]>(titles: T) => {
  const inputOrder = [
    "en",
    "pt_br",
    "pt_pt",
    "ja_ro",
    "ko_ro",
    "zh_ro",
    "ja",
    "ko",
    "zh",
    "de",
  ]
  const customSort = (
    a: (typeof titles)[number],
    b: (typeof titles)[number],
  ) => {
    const langAIndex = inputOrder.indexOf(a.language)
    const langBIndex = inputOrder.indexOf(b.language)

    if (langAIndex === -1 && langBIndex !== -1) {
      return 1
    }

    if (langAIndex !== -1 && langBIndex === -1) {
      return -1
    }

    if (langAIndex === -1 && langBIndex === -1) {
      return 0
    }

    if (langAIndex !== langBIndex) {
      return langAIndex - langBIndex
    }

    // If languages are the same, sort by priority
    return b.priority - a.priority
  }

  return titles.sort(customSort) as T
}

export const MediaTitleUtils = {
  sort,
}
