import { sql } from "@taiyomoe/db"
import { createMiddleware } from "hono/factory"
import z from "zod"
import { liveCommentSql } from "../utils/comments"

const paramSchema = z.object({ id: z.uuid() })

export const checkComment = (opts: { live?: boolean } = {}) =>
  createMiddleware<{
    Variables: {
      comment: {
        id: string
        threadId: string
        parentId: string | null
        authorId: string | null
        content: string
        createdAt: Date
        editedAt: Date | null
        deletedAt: Date | null
        live: boolean
        ownerId: string | null
      }
    }
  }>(async (c, next) => {
    const parsed = paramSchema.safeParse({ id: c.req.param("id") })

    if (!parsed.success) {
      return c.fail("VALIDATION_ERROR", parsed.error.issues)
    }

    const { db, log } = c.var

    log.set({ comment: { id: parsed.data.id } })

    const comment = await db
      .selectFrom("comments as c")
      .innerJoin("commentThreads as t", "t.id", "c.threadId")
      .leftJoin("users as u", "u.id", "c.authorId")
      .select([
        "c.id",
        "c.threadId",
        "c.parentId",
        "c.authorId",
        "c.content",
        "c.createdAt",
        "c.editedAt",
        "c.deletedAt",
        "t.profileId as ownerId",
        liveCommentSql("c", "u").as("live"),
        sql<boolean>`(
          exists (select 1 from "medias" as "m" where "m"."id" = "t"."mediaId" and "m"."deletedAt" is null)
          or exists (select 1 from "chapters" as "ch" where "ch"."id" = "t"."chapterId" and "ch"."deletedAt" is null and "ch"."status" = 'PUBLISHED')
          or exists (select 1 from "groups" as "g" where "g"."id" = "t"."groupId" and "g"."deletedAt" is null)
          or exists (select 1 from "users" as "pu" where "pu"."id" = "t"."profileId" and not coalesce("pu"."banned", false))
        )`.as("targetVisible"),
      ])
      .where("c.id", "=", parsed.data.id)
      .executeTakeFirst()

    if (comment === undefined || !comment.targetVisible || (opts.live === true && !comment.live)) {
      return c.fail("COMMENT_NOT_FOUND")
    }

    const { targetVisible: _, ...rest } = comment

    c.set("comment", rest)

    return next()
  })
