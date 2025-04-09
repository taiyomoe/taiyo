import { publicProcedure } from "../trpc"

export const getLatestMediasHandler = publicProcedure.query(async ({ ctx }) => {
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
    },
    where: { flag: "OK", deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 15,
  })

  return result
})
