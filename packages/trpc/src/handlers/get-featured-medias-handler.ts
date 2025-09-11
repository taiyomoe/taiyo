import { optionsSchema } from "@taiyomoe/schemas"
import { publicProcedure } from "../trpc"

export const getFeaturedMediasHandler = publicProcedure
  .input(optionsSchema)
  .query(async ({ ctx, input }) => {
    // First, try to get medias with banners
    const mediasWithBanners = await ctx.db.media.findMany({
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
        contentRating: { in: input.contentRating },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    })

    // If we have enough medias with banners, return them
    if (mediasWithBanners.length >= 10) {
      return mediasWithBanners
    }

    // If we don't have enough, get additional medias without banners
    const remainingCount = 10 - mediasWithBanners.length
    const mediasWithoutBanners = await ctx.db.media.findMany({
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
        banners: { none: { deletedAt: null } },
        contentRating: { in: input.contentRating },
        id: { notIn: mediasWithBanners.map((media) => media.id) },
      },
      orderBy: { createdAt: "desc" },
      take: remainingCount,
    })

    return [...mediasWithBanners, ...mediasWithoutBanners]
  })
