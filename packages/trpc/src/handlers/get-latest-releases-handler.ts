import { publicProcedure } from "../trpc"

export const getLatestReleasesHandler = publicProcedure.query(
  async ({ ctx }) => {
    const result = await ctx.db.chapter.findMany({
      select: {
        id: true,
        createdAt: true,
        number: true,
        volume: true,
        title: true,
        language: true,
        uploader: {
          select: {
            id: true,
            username: true,
            displayUsername: true,
          },
        },
        groups: true,
        media: {
          select: {
            id: true,
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
        },
      },
      where: {
        flag: "OK",
        deletedAt: null,
      },
      take: 24,
      orderBy: { createdAt: "desc" },
    })

    return result
  },
)
