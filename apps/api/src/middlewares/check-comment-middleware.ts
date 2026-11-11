import { createMiddleware } from "hono/factory"
import z from "zod"
import { liveCommentSql, visibleThreadTargetSql } from "../utils/comments"

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
        visibleThreadTargetSql("t").as("targetVisible"),
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
