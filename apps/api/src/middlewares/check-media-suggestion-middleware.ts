import { createMiddleware } from "hono/factory"
import z from "zod"
import { selectSuggestionColumns, selectSuggestions } from "../utils/media-suggestions"

const paramSchema = z.object({
  id: z.uuid(),
})

type MediaSuggestionRow = NonNullable<
  Awaited<ReturnType<ReturnType<typeof selectSuggestionColumns>["executeTakeFirst"]>>
>

export const checkMediaSuggestion = () =>
  createMiddleware<{
    Variables: { mediaSuggestion: MediaSuggestionRow }
  }>(async (c, next) => {
    const parsed = paramSchema.safeParse({ id: c.req.param("id") })

    if (!parsed.success) {
      return c.fail("VALIDATION_ERROR", parsed.error.issues)
    }

    const { id } = parsed.data
    const { can, db, log } = c.var

    log.set({ mediaSuggestion: { id } })

    const mediaSuggestion = await selectSuggestionColumns(selectSuggestions(db))
      .where("mediaSuggestions.id", "=", id)
      .executeTakeFirst()

    if (mediaSuggestion === undefined || can?.("mediaSuggestion.view", mediaSuggestion) !== true) {
      return c.fail("MEDIA_SUGGESTION_NOT_FOUND")
    }

    c.set("mediaSuggestion", mediaSuggestion)

    return next()
  })
