import type { MediaTracker } from "@taiyomoe/db"
import { updateMediaSchema } from "@taiyomoe/schemas"
import { TRPCError } from "@trpc/server"
import { omit } from "radash"
import { protectedProcedure } from "../trpc"

export const updateMediaHandler = protectedProcedure
  .meta({ resource: "medias", action: "update" })
  .input(updateMediaSchema)
  .mutation(async ({ ctx, input }) => {
    const media = await ctx.db.media.findUnique({
      include: { trackers: true },
      where: { id: input.id },
    })
    const trackers = ctx.services.trackers.getFormatted(
      input,
      ctx.session.user.id,
    )

    if (!media) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Media not found",
      })
    }

    const result = await ctx.db.media.update({
      data: omit(input, ["mdId", "alId", "malId"]),
      where: { id: input.id },
    })
    const createdTrackers: MediaTracker[] = []

    for (const tracker of trackers) {
      const oldTracker = media.trackers.find(
        (t) => t.tracker === tracker.tracker,
      )

      if (oldTracker) {
        const result = await ctx.db.mediaTracker.update({
          data: tracker,
          where: { id: oldTracker.id },
        })

        await ctx.services.trackers.postUpdate(
          "updated",
          oldTracker,
          result,
          ctx.session.user.id,
        )

        continue
      }

      const result = await ctx.db.mediaTracker.create({
        data: { ...tracker, mediaId: media.id },
      })

      createdTrackers.push(result)
    }

    await ctx.services.medias.postUpdate(
      "updated",
      omit(media, ["trackers"]),
      result,
      ctx.session.user.id,
    )
    await ctx.services.trackers.postCreate("created", createdTrackers)
  })
