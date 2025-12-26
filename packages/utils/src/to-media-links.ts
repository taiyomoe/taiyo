import { config } from "@taiyomoe/config"

export const toMediaLinks = (
  input: Record<string, unknown>,
): PrismaJson.MediaLinks => {
  const links: PrismaJson.MediaLinks = {}

  for (const [key, value] of Object.entries(input)) {
    if (!value || typeof value !== "string") {
      continue
    }

    if (key === "myAnimeList" || key === "anilist") {
      links[key] = Number.parseInt(
        value.split("/").find((part) => /^\d+$/.test(part)) ?? "",
        10,
      )

      continue
    }

    if (key === "officialEnglishTranslation") {
      links.officialENTranslation = value

      continue
    }

    if (config.medias.links.includes(key)) {
      links[
        key as keyof Omit<
          PrismaJson.MediaLinks,
          "myAnimeList" | "anilist" | "officialENTranslation"
        >
      ] = value

      continue
    }

    console.warn(`Invalid media link key "${key}", skipping...`)
  }

  return links
}
