import { buildFilter, buildSort } from "@taiyomoe/meilisearch/utils"
import { getChaptersListSchema } from "@taiyomoe/schemas"
import type { ChaptersListItem } from "@taiyomoe/types"
import { MediaUtils } from "@taiyomoe/utils"
import { DateTime } from "luxon"
import { omit, unique } from "radash"
import { protectedProcedure } from "../trpc"

export const getChaptersListHandler = protectedProcedure
  .meta({ resource: "mediaChapters", action: "create" })
  .input(getChaptersListSchema)
  .query(async ({ ctx, input }) => {
    const searched = await ctx.meilisearch.chapters.search(null, {
      filter: buildFilter(input.filter),
      sort: buildSort(input.sort),
      hitsPerPage: input.perPage,
      page: input.page,
    })
    const uniqueMedias = unique(searched.hits.map((h) => h.mediaId))
    const uniqueUsers = unique(
      [
        searched.hits.map((h) => h.uploaderId),
        searched.hits.map((h) => h.deleterId).filter(Boolean),
      ].flat(),
    )
    const uniqueScans = unique(searched.hits.flatMap((h) => h.scanIds))
    const medias = await ctx.db.media.findMany({
      select: { id: true, titles: true },
      where: { id: { in: uniqueMedias } },
    })
    const users = await ctx.db.user.findMany({
      select: { id: true, name: true, image: true },
      where: { id: { in: uniqueUsers } },
    })
    const scans = await ctx.db.scan.findMany({
      select: { id: true, name: true },
      where: { id: { in: uniqueScans } },
    })
    const chapters = searched.hits.map((h) => ({
      ...omit(h, [
        "createdAt",
        "updatedAt",
        "deletedAt",
        "mediaId",
        "uploaderId",
        "deleterId",
        "scanIds",
      ]),
      createdAt: DateTime.fromSeconds(h.createdAt).toJSDate(),
      updatedAt: DateTime.fromSeconds(h.updatedAt).toJSDate(),
      deletedAt: h.deletedAt
        ? DateTime.fromSeconds(h.deletedAt).toJSDate()
        : null,
      media: {
        id: h.mediaId,
        mainTitle: MediaUtils.getDisplayTitle(
          medias.find((m) => m.id === h.mediaId)!.titles,
          ctx.session.user.preferredTitles,
        ),
      },
      uploader: users.find((u) => u.id === h.uploaderId)!,
      deleter: users.find((d) => d.id === h.deleterId) ?? null,
      scans: h.scanIds.map((s) => scans.find((sc) => sc.id === s)!),
    })) satisfies ChaptersListItem[]

    return {
      chapters,
      totalPages: searched.totalPages,
      totalCount: searched.totalHits,
    }
  })
