import type { MediaTitle } from "@prisma/client"
import type { MediaLimited, NewTitle } from "@taiyomoe/types"
import { group, listify, mapValues } from "radash"

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

const computeDelta = (oldTitles: MediaTitle[], newTitles: NewTitle[]) => {
  return newTitles
    .map((t) =>
      oldTitles.find(
        (tt) =>
          tt.title.toLowerCase() === t.title.toLowerCase() &&
          tt.language === t.language,
      )
        ? null
        : t,
    )
    .filter(Boolean)
}

const computePriorities = (oldTitles: MediaTitle[], newTitles: NewTitle[]) => {
  const groupedByLanguage: Record<string, (MediaTitle | NewTitle)[]> = group(
    oldTitles,
    (t) => t.language,
  )

  for (const title of newTitles) {
    if (!groupedByLanguage[title.language]) {
      groupedByLanguage[title.language] = []
    }

    groupedByLanguage[title.language]!.unshift(title)
  }

  /**
   * Sort the titles by priority.
   *
   * Acronyms first.
   * Then, new titles sorted by priority.
   * Then, old titles sorted by priority.
   * Then, main titles.
   */
  const sortedTitles = mapValues(groupedByLanguage, (titles) =>
    titles.sort((a, b) => {
      if (a.isMainTitle || b.isMainTitle) {
        return 1
      }

      if ("isAcronym" in a && "isAcronym" in b) {
        return a.priority - b.priority
      }

      if ("isAcronym" in a) {
        return a.isAcronym ? -1 : 1
      }

      if ("isAcronym" in b) {
        return b.isAcronym ? -1 : 1
      }

      return a.priority - b.priority
    }),
  )

  // Recompute priorities after sorting
  const computedTitles = mapValues(sortedTitles, (titles) =>
    titles.map((t, i) => ({ ...t, priority: i + 1 })),
  )

  return listify(computedTitles, (_, value) => value).flat()
}

export const TitleUtils = {
  sort,
  computeDelta,
  computePriorities,
}
