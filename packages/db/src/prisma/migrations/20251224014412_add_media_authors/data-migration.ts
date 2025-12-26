import type { Prisma } from "@taiyomoe/db"
import { Manga } from "mangadex-full-api"
import { shake } from "radashi"

export default async (tx: Prisma.TransactionClient) => {
  const medias = await tx.$queryRaw<{ id: string; trackers: { md: string } }[]>`
    SELECT "id", "trackers" FROM "Media" WHERE "trackers" ? 'md'
  `

  console.log(`Found ${medias.length} medias to migrate`)

  // Track staff by MangaDex ID to avoid duplicates
  const staffCache = new Map<string, string>() // mdId -> dbId

  for (const media of medias) {
    if (!media.trackers.md || typeof media.trackers.md !== "string") continue

    const manga = await Manga.get(media.trackers.md).catch(() => null)

    if (!manga) {
      console.log(
        `MangaDex manga not found (${media.trackers.md}) for media ${media.id}, removing md key`,
      )

      await tx.$executeRaw`
        UPDATE "Media"
        SET "trackers" = "trackers" - 'md'
        WHERE "id" = ${media.id}::uuid
      `

      continue
    }

    const originalStaff = manga.authors.concat(manga.artists)

    console.log(
      `Processing ${originalStaff.length} staff for media ${media.id}`,
    )

    for (const s of originalStaff) {
      const role = s.type === "author" ? "AUTHOR" : "ARTIST"
      let staffId = staffCache.get(s.id)

      // Create staff if not already cached
      if (!staffId) {
        const relation = await s.resolve()
        const name = relation.name
        const bio = relation.biography.localString ?? null
        const links = JSON.stringify(
          shake(
            {
              website: relation.website,
              twitter: relation.twitter,
              youtube: relation.youtube,
              tumblr: relation.tumblr,
              fanbox: relation.fanBox,
              fantia: relation.fantia,
              pixiv: relation.pixiv,
              melonBooks: relation.melonBook,
              namicomi: relation.namicomi,
              naver: relation.naver,
              nicoVideo: relation.nicoVideo,
              skeb: relation.skeb,
              weibo: relation.weibo,
              booth: relation.booth,
            },
            (v) => !v,
          ),
        )
        const creatorId = "db852a04-7406-4a6a-87f2-1b494e810a29"

        const [inserted] = await tx.$queryRaw<[{ id: string }]>`
          INSERT INTO "Staff" ("name", "bio", "links", "creatorId", "createdAt", "updatedAt")
          VALUES (${name}, ${bio}, ${links}::jsonb, ${creatorId}::uuid, NOW(), NOW())
          RETURNING "id"
        `

        staffId = inserted.id
        staffCache.set(s.id, staffId)

        console.log(`Added staff: ${name} (${staffId})`)
      }

      // Insert into pivot table with role
      await tx.$executeRaw`
        INSERT INTO "StaffOnMedia" ("mediaId", "staffId", "role")
        VALUES (${media.id}::uuid, ${staffId}::uuid, ${role}::"StaffRole")
        ON CONFLICT DO NOTHING
      `

      console.log(`Linked media ${media.id} -> staff ${staffId} as ${role}`)
    }

    await new Promise((resolve) => setTimeout(resolve, 100))
  }
}
