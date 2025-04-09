import { publicProcedure } from "../trpc"

export const getFeaturedMediasHandler = publicProcedure.query(
  async ({ ctx }) => {
    const result = await ctx.db.media.findMany({
      select: {
        id: true,
        synopsis: true,
        genres: true,
        tags: true,
        titles: {
          select: {
            id: true,
            title: true,
            priority: true,
            language: true,
            isAcronym: true,
            isMainTitle: true,
          },
          where: { deletedAt: null },
        },
        covers: {
          select: {
            id: true,
            volume: true,
            contentRating: true,
            language: true,
            isMainCover: true,
          },
          where: { deletedAt: null },
          orderBy: { createdAt: "desc" },
        },
        banners: {
          select: { id: true },
          where: { deletedAt: null },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      where: {
        flag: "OK",
        deletedAt: null,
        banners: { some: { deletedAt: null } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    })

    return result
  },
)
