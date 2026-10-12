import { config } from "@taiyomoe/config"
import type { MediaTags } from "@taiyomoe/db"

const TAGS_MAP = new Map([
  ["COOKING", "FOOD"],
  ["SCHOOL_LIFE", "SCHOOL"],
  ["HAREM", "FEMALE_HAREM"],
  ["REVERSE_HAREM", "MALE_HAREM"],
  ["VAMPIRES", "VAMPIRE"],
])

export const toTags = (input: string[] | null): MediaTags[] => {
  const tags: MediaTags[] = []

  for (const tag of input ?? []) {
    const normalizedTag = tag
      .toUpperCase()
      .replaceAll(" ", "_")
      .replaceAll("-", "_")
      .replaceAll("'", "")

    if (normalizedTag in config.tags) {
      tags.push({
        key: normalizedTag,
        isSpoiler: false,
      })

      continue
    }

    const mappedTag = TAGS_MAP.get(normalizedTag)

    if (mappedTag !== undefined) {
      tags.push({
        key: mappedTag,
        isSpoiler: false,
      })

      continue
    }

    // oxlint-disable-next-line no-console
    console.warn(`Invalid tag key "${tag}", skipping...`)
  }

  return tags
}
