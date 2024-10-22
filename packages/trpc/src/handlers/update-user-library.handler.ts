import { updateLibrarySchema } from "@taiyomoe/schemas"
import { protectedProcedure } from "../trpc"

export const updateUserLibraryHandler = protectedProcedure
  .meta({ resource: "library", action: "update" })
  .input(updateLibrarySchema)
  .mutation(async ({ ctx, input }) => {
    const library = await ctx.db.userLibrary.findUnique({
      where: { userId: ctx.session.user.id },
    })

    if (!library) {
      throw new Error("Library not found. This should never happen.")
    }

    // Remove the media from all lists
    for (const list of [
      library.reading,
      library.rereading,
      library.planToRead,
      library.completed,
      library.onHold,
      library.dropped,
    ]) {
      const index = list.findIndex((m) => m.mediaId === input.mediaId)
      if (index !== -1) list.splice(index, 1)
    }

    // Add the media to the correct list
    if (input.status !== "delete") {
      library[input.status].push({
        mediaId: input.mediaId,
        updatedAt: new Date().toISOString(),
      })
    }

    const status = await ctx.services.medias.getStatus(input.mediaId)

    if (input.status === "completed" && status !== "FINISHED") {
      throw new Error("Cannot mark as completed a media that is not finished")
    }

    await ctx.db.userLibrary.update({
      data: library,
      where: { userId: ctx.session.user.id },
    })
  })
