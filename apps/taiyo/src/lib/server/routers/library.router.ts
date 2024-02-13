import { getLibrarySchema, updateLibrarySchema } from "~/lib/schemas"
import { MediaService } from "~/lib/services"
import type { UserLibraryMedia } from "~/lib/types"
import { MediaUtils } from "~/lib/utils/media.utils"

import { createTRPCRouter, protectedProcedure } from "../trpc"

export const libraryRouter = createTRPCRouter({
  getLibrary: protectedProcedure
    .meta({
      resource: "library",
      action: "update",
    })
    .input(getLibrarySchema)
    .query(async ({ ctx, input }) => {
      const userLibrary = await ctx.db.userLibrary.findUnique({
        select: {
          reading: input.status === "reading",
          rereading: input.status === "rereading",
          completed: input.status === "completed",
          onHold: input.status === "onHold",
          dropped: input.status === "dropped",
          planToRead: input.status === "planToRead",
        },
        where: { userId: ctx.session.user.id },
      })

      if (!userLibrary) {
        throw new Error(
          `User ${ctx.session.user.id} has no library. This should not happen.`,
        )
      }

      const library = userLibrary[input.status]
      const medias = await ctx.db.media.findMany({
        select: {
          id: true,
          status: true,
          covers: {
            select: { id: true },
            where: { isMainCover: true },
            take: 1,
          },
          titles: {
            select: {
              title: true,
              language: true,
              priority: true,
              isAcronym: true,
              isMainTitle: true,
            },
          },
        },
        where: {
          id: {
            in: library.map((m) => m.mediaId),
          },
        },
      })

      const libraryMedias: UserLibraryMedia[] = medias.map((media) => ({
        id: media.id,
        updatedAt: new Date(
          library.find((m) => m.mediaId === media.id)!.updatedAt,
        ),
        coverId: media.covers.at(0)?.id ?? "",
        mainTitle: MediaUtils.getMainTitle(
          media.titles,
          ctx.session?.user.preferredTitles ?? null,
        ),
        mediaStatus: media.status,
        libraryStatus: input.status,
      }))

      return libraryMedias
    }),
  updateLibrary: protectedProcedure
    .meta({
      resource: "library",
      action: "update",
    })
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

      const status = await MediaService.getStatus(input.mediaId)

      if (input.status === "completed" && status !== "FINISHED") {
        throw new Error("Cannot mark as completed a media that is not finished")
      }

      await ctx.db.userLibrary.update({
        data: library,
        where: { userId: ctx.session.user.id },
      })
    }),
})
