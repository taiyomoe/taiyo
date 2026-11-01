import { MEDIA_LINK_KEYS, type MediaLinks } from "@taiyomoe/db"

export const toMediaLinks = (input: Record<string, unknown>): MediaLinks => {
  const links: MediaLinks = {}

  for (const [key, value] of Object.entries(input)) {
    if (typeof value !== "string" || value === "") {
      continue
    }

    if (key === "officialEnglishTranslation") {
      links.officialENTranslation = value

      continue
    }

    const link = MEDIA_LINK_KEYS.find((candidate) => candidate === key)

    if (link === undefined) {
      // oxlint-disable-next-line no-console
      console.warn(`Invalid media link key "${key}", skipping...`)

      continue
    }

    if (link === "myAnimeList" || link === "anilist") {
      links[link] = Number.parseInt(value.split("/").find((part) => /^\d+$/.test(part)) ?? "", 10)

      continue
    }

    links[link] = value
  }

  return links
}
