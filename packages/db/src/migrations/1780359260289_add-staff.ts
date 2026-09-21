import { type Kysely, sql } from "kysely"
import { Manga } from "mangadex-full-api"
import { shake } from "radashi"

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.createType("StaffRole").asEnum(["AUTHOR", "ARTIST"]).execute()

  await db.schema
    .createTable("Staff")
    .addColumn("id", "uuid", (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("updatedAt", sql`timestamp(3)`, (c) => c.notNull())
    .addColumn("deletedAt", sql`timestamp(3)`)
    .addColumn("name", "text", (c) => c.notNull())
    .addColumn("bio", "jsonb", (c) => c.notNull().defaultTo(sql`'{}'::jsonb`))
    .addColumn("image", "text")
    .addColumn("links", "jsonb", (c) => c.notNull().defaultTo(sql`'{}'::jsonb`))
    .addColumn("creatorId", "uuid", (c) =>
      c.notNull().references("User.id").onDelete("restrict").onUpdate("cascade"),
    )
    .addColumn("deleterId", "uuid")
    .execute()

  await db.schema
    .createTable("StaffOnMedia")
    .addColumn("mediaId", "uuid", (c) =>
      c.notNull().references("Media.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("staffId", "uuid", (c) =>
      c.notNull().references("Staff.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("role", sql`"StaffRole"`, (c) => c.notNull())
    .addPrimaryKeyConstraint("StaffOnMedia_pkey", ["mediaId", "staffId", "role"])
    .execute()

  await db.schema
    .createIndex("StaffOnMedia_staffId_index")
    .on("StaffOnMedia")
    .column("staffId")
    .execute()

  const medias = await db
    .selectFrom("Media")
    .select(["id", "links"])
    .where(sql<boolean>`"links" ? 'mangaDex'`)
    .execute()

  if (medias.length === 0) {
    return
  }

  const admin = await db
    .selectFrom("User")
    .select("id")
    .where("role", "=", "ADMIN")
    .orderBy("createdAt", "asc")
    .executeTakeFirstOrThrow()
  const staffCache = new Map<string, string>()
  let processed = 0

  for (const media of medias) {
    const mdId = media.links.mangaDex

    if (!mdId) {
      continue
    }

    const manga = await Manga.get(mdId).catch(() => null)

    if (!manga) {
      // oxlint-disable-next-line no-console
      console.log(
        `No MangaDex manga for media ${media.id} (mangaDex=${mdId}); stripping mangaDex key`,
      )

      const { mangaDex: _mangaDex, ...rest } = media.links

      await db
        .updateTable("Media")
        .set({ links: sql`${JSON.stringify(rest)}::jsonb` })
        .where("id", "=", media.id)
        .execute()

      await new Promise((r) => setTimeout(r, 50))

      continue
    }

    const relations = [...manga.authors, ...manga.artists]

    for (const s of relations) {
      const role = s.type === "author" ? "AUTHOR" : "ARTIST"
      const mdStaffId = s.id
      let staffId = staffCache.get(mdStaffId)

      if (!staffId) {
        const relation = await s.resolve().catch(() => null)

        if (!relation) {
          continue
        }

        const links = shake(
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
        )
        const bioPayload = relation.biography?.localString
          ? { en: relation.biography.localString }
          : {}
        const inserted = await db
          .insertInto("Staff")
          .values({
            name: relation.name,
            bio: sql`${JSON.stringify(bioPayload)}::jsonb`,
            links: sql`${JSON.stringify(links)}::jsonb`,
            creatorId: admin.id,
            createdAt: sql`NOW()`,
            updatedAt: sql`NOW()`,
          })
          .returning("id")
          .executeTakeFirst()

        staffId = inserted?.id

        if (!staffId) {
          continue
        }

        staffCache.set(mdStaffId, staffId)
      }

      await db
        .insertInto("StaffOnMedia")
        .values({
          mediaId: media.id,
          staffId,
          role: sql`${role}::"StaffRole"`,
        })
        .onConflict((oc) => oc.doNothing())
        .execute()
    }

    processed++

    if (processed % 50 === 0) {
      // oxlint-disable-next-line no-console
      console.log(`Processed ${processed}/${medias.length} medias`)
    }

    await new Promise((r) => setTimeout(r, 50))
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("StaffOnMedia").execute()

  await db.schema.dropTable("Staff").execute()

  await db.schema.dropType("StaffRole").execute()
}
