import { config } from "@taiyomoe/config"

export const toTags = (input: string[] | null): PrismaJson.MediaTags[] => {
  const tags: PrismaJson.MediaTags[] = []

  for (const tag of input ?? []) {
    const normalizedTag = tag
      .toUpperCase()
      .replaceAll(" ", "_")
      .replaceAll("-", "_")
      .replaceAll("'", "")

    if (normalizedTag in config.tags) {
      tags.push({
        key: normalizedTag as keyof typeof config.tags,
        isSpoiler: false,
      })

      continue
    }

    const tagsMap = {
      COOKING: "FOOD",
      SCHOOL_LIFE: "SCHOOL",
      HAREM: "FEMALE_HAREM",
      REVERSE_HAREM: "MALE_HAREM",
      VAMPIRES: "VAMPIRE",
    }

    if (normalizedTag in tagsMap) {
      tags.push({
        key: tagsMap[
          normalizedTag as keyof typeof tagsMap
        ] as keyof typeof config.tags,
        isSpoiler: false,
      })

      continue
    }

    console.warn(`Invalid tag key "${tag}", skipping...`)
  }

  return tags
}
