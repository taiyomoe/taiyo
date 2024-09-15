import { ScansIndexService } from "@taiyomoe/meilisearch/services"
import { buildFilter, buildSort } from "@taiyomoe/meilisearch/utils"
import {
  bulkMutateSchema,
  createScanSchema,
  getScansListSchema,
  updateScanSchema,
} from "@taiyomoe/schemas"
import type { ScansListItem } from "@taiyomoe/types"
import { TRPCError } from "@trpc/server"
import { DateTime } from "luxon"
import { omit, parallel, unique } from "radash"
import { createTRPCRouter, protectedProcedure } from "../trpc"
export const scansRouter = createTRPCRouter({
  create: protectedProcedure
    .meta({ resource: "scans", action: "create" })
    .input(createScanSchema)
    .mutation(async ({ ctx, input }) => {
      const createdScan = await ctx.db.scan.create({
        data: {
          ...input,
          creatorId: ctx.session.user.id,
        },
      })

      await ctx.logs.scans.insert({
        type: "created",
        _new: createdScan,
        userId: ctx.session.user.id,
      })

      await ScansIndexService.sync(ctx.db, [createdScan.id])

      return createdScan
    }),

  update: protectedProcedure
    .meta({ resource: "scans", action: "update" })
    .input(updateScanSchema)
    .mutation(async ({ ctx, input }) => {
      const scan = await ctx.db.scan.findUnique({
        where: { id: input.id },
      })

      if (!scan) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Scan not found",
        })
      }

      const newScan = await ctx.db.scan.update({
        data: input,
        where: { id: input.id },
      })

      await ctx.logs.scans.insert({
        type: "updated",
        old: scan,
        _new: newScan,
        userId: ctx.session.user.id,
      })

      await ScansIndexService.sync(ctx.db, [newScan.id])
    }),

  getList: protectedProcedure
    .meta({ resource: "scans", action: "create" })
    .input(getScansListSchema)
    .query(async ({ ctx, input }) => {
      const searched = await ctx.meilisearch.scans.search(input.query.q, {
        attributesToSearchOn: input.query.attributes,
        filter: buildFilter(input.filter),
        sort: buildSort(input.sort),
        hitsPerPage: input.perPage,
        page: input.page,
      })
      const uniqueUsers = unique(
        [
          searched.hits.map((h) => h.creatorId),
          searched.hits.map((h) => h.deleterId).filter(Boolean),
        ].flat(),
      )
      const users = await ctx.db.user.findMany({
        select: { id: true, name: true, image: true },
        where: { id: { in: uniqueUsers } },
      })
      const scans = (await parallel(10, searched.hits, async (h) => {
        const chaptersCount = await ctx.db.mediaChapter.count({
          where: { scans: { some: { id: h.id } } },
        })

        return {
          ...omit(h, [
            "createdAt",
            "updatedAt",
            "deletedAt",
            "creatorId",
            "deleterId",
          ]),
          createdAt: DateTime.fromSeconds(h.createdAt).toJSDate(),
          updatedAt: DateTime.fromSeconds(h.updatedAt).toJSDate(),
          deletedAt: h.deletedAt
            ? DateTime.fromSeconds(h.deletedAt).toJSDate()
            : null,
          creator: users.find((u) => u.id === h.creatorId)!,
          deleter: users.find((d) => d.id === h.deleterId) ?? null,
          chaptersCount,
        }
      })) satisfies ScansListItem[]

      return {
        scans,
        totalPages: searched.totalPages,
        totalCount: searched.totalHits,
      }
    }),

  bulkMutate: protectedProcedure
    .meta({ resource: "scans", action: "update" })
    .input(bulkMutateSchema)
    .mutation(async ({ ctx, input }) => {
      const scans = await ctx.db.scan.findMany({
        include: { chapters: { select: { id: true } } },
        where: { id: { in: input.ids } },
      })

      if (scans.length !== input.ids.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Uma ou várias scans não existem.",
        })
      }

      if (input.type === "restore") {
        if (scans.some((c) => c.deletedAt === null)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Algumas scans não estão deletadas.",
          })
        }
      }

      if (input.type === "delete") {
        if (scans.some((c) => c.deletedAt !== null)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Algumas scans já estão deletadas.",
          })
        }
      }

      const newScans = scans.map((s) => ({
        ...s,
        deletedAt: input.type === "delete" ? new Date() : null,
        deleterId: input.type === "delete" ? ctx.session.user.id : null,
      }))

      for (const scan of newScans) {
        await ctx.db.scan.update({
          data: {
            deletedAt: scan.deletedAt,
            deleterId: scan.deleterId,
            chapters: { set: [] },
            members: { set: [] },
          },
          where: { id: scan.id },
        })

        await ctx.logs.scans.insert({
          type: "deleted",
          old: omit(scan, ["chapters"]),
          userId: ctx.session.user.id,
          affectedChaptersIds: scan.chapters.map((c) => c.id),
        })
      }

      await ScansIndexService.sync(ctx.db, input.ids)
    }),
})
