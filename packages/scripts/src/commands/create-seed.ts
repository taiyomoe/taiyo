import type { Prisma } from "@taiyomoe/db"
import {
  toContentRating,
  toCountryOfOrigin,
  toDemography,
  toLanguage,
  toLocalizedText,
  toStatus,
  toTags,
  toType,
} from "@taiyomoe/utils"
import { Command } from "commander"
import { Cover, Manga } from "mangadex-full-api"
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { group, map, mapValues, sleep } from "radashi"
import {
  CREATOR_ID,
  downloadFiles,
  outputDir,
  seedsPath,
  templatesPath,
} from "../utils"

export const createSeedCommand = new Command("create-seed")
  .description("Create a new media seed")
  .option("--mdId <mdId>", "Media ID on MangaDex")
  .action(async (options: { mdId: string }) => {
    const mediaId = crypto.randomUUID()
    const manga = await Manga.get(options.mdId)
    const titles = Object.values(
      mapValues(
        group(
          // Main title first
          manga.altTitles
            .concat(manga.title)
            .sort((a) => (a === manga.title ? -1 : 1)),
          (title) => Object.keys(title)[0]!,
        ),
        (titles) =>
          titles!.map((t, i) => {
            const language = toLanguage(Object.keys(t)[0])!

            return {
              title: t.localString,
              language,
              priority: i + 1,
              isMainTitle: i === 0 && language === "en",
              creatorId: CREATOR_ID,
            } satisfies Prisma.TitleCreateManyMediaInput
          }),
      ),
    ).flat()
    const covers = await (async () => {
      const result = (
        await Cover.search({ manga: [manga.id], limit: 100 })
      ).map((c) => ({
        id: crypto.randomUUID(),
        volume: c.volume,
        language: toLanguage(c.locale)!,
        contentRating: "NORMAL",
        isMainCover: manga.mainCover.id === c.id,
        uploaderId: CREATOR_ID,
        url: c.url,
      })) satisfies Prisma.CoverCreateManyMediaInput[]
      const coversDir = join(
        outputDir("create-seed"),
        "medias",
        mediaId,
        "covers",
      )

      console.log("Starting to process media ID: ", mediaId)
      console.log("Downloading covers...")

      await mkdir(coversDir, { recursive: true })
      await downloadFiles(result, coversDir)

      console.log(`Downloaded ${result.length} covers`)

      return result.map(({ url: _, ...c }) => c)
    })()

    if (!titles.some((t) => t.isMainTitle)) {
      throw new Error("No main title found")
    }

    if (!covers.some((c) => c.isMainCover)) {
      throw new Error("No main cover found")
    }

    const chapters = await (async () => {
      const result = []
      let hasMore = true
      let offset = 0

      while (hasMore) {
        const feed = await manga.getFeed({
          translatedLanguage: ["pt-br", "fr"],
          order: { chapter: "asc" },
          limit: 100,
          offset,
        })

        result.push(...feed)

        if (feed.length < 10) {
          hasMore = false
        }

        offset += 100
      }

      const sample = (() => {
        if (result.length <= 45) {
          return result
        }

        const first = result.slice(0, 15)
        const last = result.slice(-15)
        const middleSection = result.slice(15, -15)
        const middle: typeof result = []
        const step = middleSection.length / 15

        for (let i = 0; i < 15; i++) {
          middle.push(middleSection[Math.floor(i * step)]!)
        }

        return first.concat(middle, last)
      })()

      const parsed = await map(sample, async (c, i) => {
        const rawPages = await c.getReadablePages()
        const pages = Array.from({ length: c.pages }, (_, i) => ({
          id: crypto.randomUUID(),
          url: rawPages[i]!,
        }))
        const chapterDir = join(
          outputDir("create-seed"),
          "medias",
          mediaId,
          "chapters",
          c.id,
        )

        await mkdir(chapterDir, { recursive: true })
        await downloadFiles(pages, chapterDir)

        // Resolve groups for this chapter
        const groups = await map(c.groups, async (g) => {
          const resolved = await g.resolve()

          return {
            where: { id: resolved.id },
            create: {
              id: resolved.id,
              name: resolved.name,
              description: resolved.description,
              website: resolved.website,
              discord: resolved.discord
                ? `https://discord.gg/${resolved.discord}`
                : null,
              x: resolved.twitter
                ? `https://twitter.com/${resolved.twitter}`
                : null,
              creatorId: CREATOR_ID,
            },
          }
        })

        console.log(
          `Downloaded chapter ${c.chapter} (${c.translatedLanguage}) - ${groups.length} group(s) [${i + 1}/${sample.length}]`,
        )

        await sleep(2000)

        return {
          id: crypto.randomUUID(),
          number: Number(c.chapter),
          volume: c.volume,
          language: toLanguage(c.translatedLanguage)!,
          pages: pages.map((p) => ({ id: p.id })),
          uploaderId: CREATOR_ID,
          groups: { connectOrCreate: groups },
        } satisfies Prisma.ChapterUncheckedCreateWithoutMediaInput
      })

      return parsed
    })()
    const newMedia = {
      id: mediaId,
      synopsis: toLocalizedText(manga.description),
      contentRating: toContentRating(manga.contentRating),
      tags: toTags(manga.tags.map((t) => t.localName)),
      type: toType(manga.originalLanguage),
      status: toStatus(manga.status),
      source: "ORIGINAL",
      demography: toDemography(manga.publicationDemographic),
      countryOfOrigin: toCountryOfOrigin(manga.originalLanguage),
      creatorId: CREATOR_ID,
      titles: { create: titles },
      covers: { create: covers },
      chapters: { create: chapters },
    } satisfies Prisma.MediaUncheckedCreateInput

    // Find latest seed number
    const mediasDir = join(seedsPath, "medias")
    const files = await readdir(mediasDir)
    const mediaNumbers = files
      .filter((f) => f.startsWith("media-") && f.endsWith(".ts"))
      .map((f) =>
        Number.parseInt(f.replace("media-", "").replace(".ts", ""), 10),
      )
      .filter((n) => !Number.isNaN(n))
    const latestNumber = mediaNumbers.length > 0 ? Math.max(...mediaNumbers) : 0
    const newNumber = latestNumber + 1

    // Read template and create new seed file
    const templateContent = await readFile(
      join(templatesPath, "media-{{count}}.ts.hbs"),
      "utf-8",
    )
    const newContent = templateContent.replace(
      "{{ media }}",
      JSON.stringify(newMedia, null, 2),
    )
    const newFilePath = join(mediasDir, `media-${newNumber}.ts`)

    await writeFile(newFilePath, newContent)

    console.log(`Created seed file: ${newFilePath}`)
  })
