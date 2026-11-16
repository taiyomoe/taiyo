import { type Media, type Selectable, sql } from "@taiyomoe/db"
import { MangaDexNotFoundError } from "@taiyomoe/mangadex"
import { createMiddleware } from "hono/factory"
import { buildMangaDexPlan, type MangaDexPlan } from "../utils/mangadex-sync"

/**
 * Builds the MangaDex plan of `c.var.media` before any transaction opens, since it waits on
 * MangaDex. The entry is the media's MangaDex link, or the `mangaDexId` the request names when
 * the media has none yet.
 */
export const loadMangaDexPlan = createMiddleware<{
  Variables: {
    media: Selectable<Media>
    mangaDexId: string
    mangaDexPlan: MangaDexPlan
    query?: { mangaDexId?: string | undefined }
    json?: { mangaDexId?: string | undefined }
  }
}>(async (c, next) => {
  const { db, log, mangaDex, media } = c.var
  const requested = c.var.query?.mangaDexId ?? c.var.json?.mangaDexId
  const linked = media.links.mangaDex

  if (linked !== undefined && requested !== undefined && linked !== requested) {
    return c.fail("MANGADEX_LINK_MISMATCH", { mangaDexId: linked })
  }

  const mangaDexId = linked ?? requested

  if (mangaDexId === undefined) {
    return c.fail("MANGADEX_NOT_LINKED")
  }

  if (linked === undefined) {
    const owner = await db
      .selectFrom("medias")
      .select("id")
      .where("id", "!=", media.id)
      .where(sql<boolean>`"links" @> ${JSON.stringify({ mangaDex: mangaDexId })}::jsonb`)
      .executeTakeFirst()

    if (owner !== undefined) {
      return c.fail("MEDIA_LINK_CONFLICT", {
        conflictingMediaId: owner.id,
        providedLinks: { mangaDex: mangaDexId },
      })
    }
  }

  try {
    c.set("mangaDexPlan", await buildMangaDexPlan({ db, mangaDex }, media.id, mangaDexId))
  } catch (error) {
    if (error instanceof MangaDexNotFoundError) {
      return c.fail("MANGADEX_NOT_FOUND")
    }

    log.error(error instanceof Error ? error : String(error))

    return c.fail("MANGADEX_UNAVAILABLE")
  }

  c.set("mangaDexId", mangaDexId)
  log.set({ mangaDex: { id: mangaDexId } })

  return next()
})
