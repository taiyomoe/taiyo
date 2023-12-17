import { TRPCError } from "@trpc/server";

import {
  getMediaChapterByIdSchema,
  getMediaChaptersByMediaIdSchema,
  insertMediaChapterSchema,
} from "~/lib/schemas/mediaChapter.schemas";
import type { MediaChapterLimited } from "~/lib/types";
import { MediaUtils } from "~/lib/utils/media.utils";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const mediaChaptersRouter = createTRPCRouter({
  create: protectedProcedure
    .meta({ resource: "mediaChapters", action: "create" })
    .input(insertMediaChapterSchema)
    .mutation(async ({ ctx, input: { pages, scanIds, ...input } }) => {
      const scans = await ctx.db.scan.findMany({
        where: { id: { in: scanIds } },
      });

      if (scans.length !== scanIds.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Uma ou várias scans não existem.",
        });
      }

      const result = await ctx.db.mediaChapter.create({
        data: {
          ...input,
          pages: pages.map((page) => ({ id: page })),
          scans: {
            connect: scanIds.map((scanId) => ({ id: scanId })),
          },
          uploaderId: ctx.session.user.id,
        },
      });

      return result;
    }),

  getById: publicProcedure
    .input(getMediaChapterByIdSchema)
    .query(async ({ ctx, input: chapterId }) => {
      const result = await ctx.db.mediaChapter.findFirst({
        select: {
          title: true,
          number: true,
          volume: true,
          pages: true,
          mediaId: true,
          uploader: { select: { id: true, name: true } },
          media: {
            select: {
              type: true,
              titles: {
                select: {
                  title: true,
                  language: true,
                  priority: true,
                  isAcronym: true,
                  isMainTitle: true,
                },
              },
              chapters: {
                select: {
                  id: true,
                  number: true,
                  title: true,
                },
              },
            },
          },
          scans: { select: { id: true, name: true } },
          comments: true,
        },
        where: { id: chapterId, deletedAt: null },
      });

      if (!result?.uploader.name || !result.media.titles.at(0)) {
        return null;
      }

      const sortedMediaChapters = result.media.chapters.sort(
        (a, b) => a.number - b.number,
      );
      const currentMediaChapterIndex = sortedMediaChapters.findIndex(
        (c) => c.id === chapterId,
      );
      const mediaTitle = MediaUtils.getMainTitle(
        result.media.titles,
        ctx.session?.user.preferredTitles ?? null,
      );

      const mediaChapterLimited: MediaChapterLimited = {
        id: chapterId,
        title: result.title,
        number: result.number,
        volume: result.volume,
        pages: result.pages,
        previousChapter:
          sortedMediaChapters.at(currentMediaChapterIndex - 1) ?? null,
        nextChapter:
          sortedMediaChapters.at(currentMediaChapterIndex + 1) ?? null,
        // ----- RELATIONS
        uploader: {
          id: result.uploader.id,
          name: result.uploader.name,
        },
        media: {
          id: result.mediaId,
          type: result.media.type,
          title: mediaTitle,
          chapters: sortedMediaChapters,
        },
        scans: result.scans.map((s) => ({
          id: s.id,
          name: s.name,
        })),
        comments: result.comments,
      };

      return mediaChapterLimited;
    }),

  getByMediaId: publicProcedure
    .input(getMediaChaptersByMediaIdSchema)
    .query(async ({ ctx, input: { mediaId, page, perPage } }) => {
      const result = await ctx.db.mediaChapter.findMany({
        select: {
          id: true,
          createdAt: true,
          title: true,
          number: true,
          volume: true,
          uploader: { select: { id: true, name: true } },
          scans: { select: { id: true, name: true } },
        },
        where: { mediaId, deletedAt: null },
        orderBy: { number: "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
      });
      const chaptersCount = await ctx.db.mediaChapter.count({
        where: { mediaId, deletedAt: null },
      });
      const { progression } = ctx.session
        ? (await ctx.db.userHistory.findFirst({
            select: { progression: true },
            where: { userId: ctx.session?.user.id, mediaId },
          })) ?? { progression: [] }
        : { progression: [] };

      const mediaLimitedChapterPagination = {
        chapters: result.map((c) => ({
          id: c.id,
          createdAt: c.createdAt,
          title: c.title,
          number: c.number,
          volume: c.volume,
          // ----- USER PROGRESSION
          completed:
            progression.find((p) => p.chapterId === c.id)?.completed ?? null,
          // ----- RELATIONS
          uploader: {
            id: c.uploader.id,
            name: c.uploader.name,
          },
          scans: c.scans,
        })),
        // ----- OTHERS
        totalPages: Math.ceil(chaptersCount / perPage) || 1,
      };

      return mediaLimitedChapterPagination;
    }),
});
