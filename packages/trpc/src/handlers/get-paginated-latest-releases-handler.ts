import { getPaginatedLatestReleases } from "@prisma/client/sql"
import { pageSchema, perPageSchema } from "@taiyomoe/schemas"
import { z } from "zod"
import { publicProcedure } from "../trpc"

export const getPaginatedLatestReleasesHandler = publicProcedure
  .input(z.object({ page: pageSchema, perPage: perPageSchema }))
  .query(async ({ ctx, input }) => {
    const chapters = await ctx.db.$queryRawTyped(
      getPaginatedLatestReleases(
        input.perPage,
        (input.page - 1) * input.perPage,
      ),
    )
    const [medias, groups, uploaders] = await ctx.db.$transaction([
      ctx.db.media.findMany({
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
        where: { id: { in: chapters.map((c) => c.mediaId) } },
      }),
      ctx.db.group.findMany({
        select: { id: true, name: true },
        where: {
          chapters: { some: { id: { in: chapters.map((c) => c.id) } } },
        },
      }),
      ctx.db.user.findMany({
        select: {
          id: true,
          username: true,
          displayUsername: true,
          role: true,
        },
        where: { id: { in: chapters.map((c) => c.uploaderId) } },
      }),
    ])

    return medias
      .map((m) => ({
        ...m,
        chapters: chapters
          .filter((c) => c.mediaId === m.id)
          .map((c) => ({
            ...c,
            uploader: uploaders.find((u) => u.id === c.uploaderId)!,
            groups: c.groupIds
              ? groups.filter((g) => c.groupIds!.includes(g.id))
              : [],
          })),
      }))
      .sort(
        (a, b) =>
          b.chapters[0]!.createdAt.getTime() -
          a.chapters[0]!.createdAt.getTime(),
      )
  })
