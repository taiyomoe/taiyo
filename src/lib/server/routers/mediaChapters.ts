import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { insertMediaChapterSchema } from "~/lib/schemas/mediaChapter.schemas";
import type { MediaChapterLimited } from "~/lib/types";

import { NotFoundError } from "../errors";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const mediaChaptersRouter = createTRPCRouter({
  create: protectedProcedure
    .meta({ resource: "mediaChapters", action: "create" })
    .input(insertMediaChapterSchema)
    .mutation(async ({ ctx, input: { pages, scansIds, ...input } }) => {
      const scans = await ctx.db.scan.findMany({
        where: { id: { in: scansIds } },
      });

      if (scans.length !== scansIds.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Uma ou várias scans não existem.",
        });
      }

      const result = await ctx.db.mediaChapter.create({
        data: {
          ...input,
          pages: pages.map((page) => ({ id: page })),
          uploaderId: ctx.session.user.id,
        },
      });

      return result;
    }),

  getById: publicProcedure
    .input(z.string())
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
              titles: { select: { title: true }, take: 1 },
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
        where: { id: chapterId },
      });

      if (!result?.uploader.name || !result.media.titles.at(0)) {
        throw new NotFoundError();
      }

      const sortedMediaChapters = result.media.chapters.sort(
        (a, b) => a.number - b.number,
      );
      const currentMediaChapterIndex = sortedMediaChapters.findIndex(
        (c) => c.id === chapterId,
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
          title: result.media.titles.at(0)!.title,
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
});
