import type { Prisma } from "@taiyomoe/db"
import { config } from "../../../../../config/src/index"

type MediaTag = { key: string; isSpoiler: boolean }

export default async (tx: Prisma.TransactionClient) => {
  const medias = await tx.$queryRaw<
    {
      id: string
      genres: string[] | null
      tags: MediaTag[] | null
      oneShot: boolean
    }[]
  >`
    SELECT "id", "genres", "tags", "oneShot" FROM "Media"
  `

  console.log(`Found ${medias.length} medias to migrate`)

  for (const media of medias) {
    const newTags: MediaTag[] = []

    // Add ONESHOT tag if oneShot column is true
    if (media.oneShot) {
      newTags.push({ key: "ONESHOT", isSpoiler: false })
    }

    // Add genres to the tags array
    if (media.genres && Array.isArray(media.genres)) {
      for (const genre of media.genres) {
        if (genre in config.tags) {
          newTags.push({ key: genre, isSpoiler: false })
        } else {
          console.warn(
            `Invalid genre key "${genre}" for media ${media.id}, skipping`,
          )
        }
      }
    }

    // Add existing tags to the array
    if (media.tags && Array.isArray(media.tags)) {
      for (const tag of media.tags) {
        if (tag.key && tag.key in config.tags) {
          // Avoid duplicates
          if (!newTags.some((t) => t.key === tag.key)) {
            newTags.push({ key: tag.key, isSpoiler: tag.isSpoiler ?? false })
          }

          continue
        }

        if (tag.key === "PHILOSOPHY") {
          newTags.push({
            key: "PHILOSOPHICAL",
            isSpoiler: tag.isSpoiler ?? false,
          })

          continue
        }

        if (tag.key === "MEDICINE") {
          newTags.push({ key: "MEDICAL", isSpoiler: tag.isSpoiler ?? false })

          continue
        }

        console.warn(
          `Invalid tag key "${tag.key}" for media ${media.id}, skipping`,
        )
      }
    }

    // Update the media with the new tags array
    // Use ARRAY() with jsonb_array_elements to convert JSON array to PostgreSQL jsonb[]
    await tx.$executeRaw`
      UPDATE "Media"
      SET "tags" = ARRAY(SELECT jsonb_array_elements(${JSON.stringify(newTags)}::jsonb))
      WHERE "id" = ${media.id}::uuid
    `

    console.log(`Migrated media ${media.id}: ${newTags.length} tags`)
  }

  // Drop the genres column, oneShot column, and MediaGenres enum after migration is complete
  await tx.$executeRaw`ALTER TABLE "Media" DROP COLUMN "genres"`
  await tx.$executeRaw`ALTER TABLE "Media" DROP COLUMN "oneShot"`
  await tx.$executeRaw`DROP TYPE "MediaGenres"`
}
