import type { Prisma } from "@taiyomoe/db"

export default async (tx: Prisma.TransactionClient) => {
  const medias = await tx.$queryRaw<
    { id: string; links: Record<string, unknown> }[]
  >`
    SELECT "id", "links" FROM "Media"
  `

  console.log(`Found ${medias.length} medias to migrate`)

  for (const media of medias) {
    const oldLinks = media.links
    const newLinks: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(oldLinks)) {
      if (key === "md") {
        newLinks.mangaDex = value
      } else if (key === "mal") {
        newLinks.myAnimeList = value
      } else if (key === "al") {
        newLinks.anilist = value
      }
    }

    await tx.$executeRaw`
      UPDATE "Media"
      SET "links" = ${JSON.stringify(newLinks)}::jsonb
      WHERE "id" = ${media.id}::uuid
    `

    console.log(`Migrated links for media ${media.id}`)
  }
}
