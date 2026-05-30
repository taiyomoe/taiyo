import { config } from "@taiyomoe/config"
import type { MediaLinks } from "@taiyomoe/db"

export const toMediaLinks = (input: Record<string, unknown>): MediaLinks => {
  const links: MediaLinks = {}

  for (const [key, value] of Object.entries(input)) {
    if (!value || typeof value !== "string") {
      continue
    }

    if (key === "myAnimeList" || key === "anilist") {
      links[key] = Number.parseInt(value.split("/").find((part) => /^\d+$/.test(part)) ?? "", 10)

      continue
    }

    if (key === "officialEnglishTranslation") {
      links.officialENTranslation = value

      continue
    }

    if (config.medias.links.includes(key)) {
      links[key as keyof Omit<MediaLinks, "myAnimeList" | "anilist" | "officialENTranslation">] =
        value

      continue
    }

    console.warn(`Invalid media link key "${key}", skipping...`)
  }

  return links
}
