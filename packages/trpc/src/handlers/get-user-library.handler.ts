import { getLibrarySchema } from "@taiyomoe/schemas"
import type { UserLibraryMedia } from "@taiyomoe/types"
import { MediaUtils } from "@taiyomoe/utils"
import { protectedProcedure } from "../trpc"

export const getUserLibraryHandler = protectedProcedure
  .meta({ resource: "library", action: "update" })
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
      mainTitle: MediaUtils.getDisplayTitle(
        media.titles,
        ctx.session?.user.settings.preferredTitles,
      ),
      mediaStatus: media.status,
      libraryStatus: input.status,
    }))

    return libraryMedias
  })
