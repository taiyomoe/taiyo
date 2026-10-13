import { isMediaLink, type MediaLinks } from "@taiyomoe/db"

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

    if (!isMediaLink(key)) {
      // oxlint-disable-next-line no-console
      console.warn(`Invalid media link key "${key}", skipping...`)

      continue
    }

    if (key === "myAnimeList" || key === "anilist") {
      links[key] = Number.parseInt(value.split("/").find((part) => /^\d+$/.test(part)) ?? "", 10)

      continue
    }

    links[key] = value
  }

  return links
}
