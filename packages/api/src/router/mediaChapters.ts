import { z } from "zod";

import { db } from "@taiyo/db";
import type { MediaChapterLimited } from "@taiyo/db/types/mediaChapter.types";

import { NotFoundError } from "../errors";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const mediaChaptersRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.string())
    .query(async ({ input: chapterId }) => {
      const result = await db.query.mediaChapters.findFirst({
        columns: {
          title: true,
          number: true,
          volume: true,
          pages: true,
          userId: true,
          mediaId: true,
        },
        with: {
          user: {
            columns: { name: true },
          },
          media: {
            columns: { type: true },
            with: {
              titles: {
                columns: { title: true },
                limit: 1,
              },
              chapters: {
                columns: {
                  number: true,
                  title: true,
                },
              },
            },
          },
          scans: {
            columns: { scanId: true },
            with: {
              scan: {
                columns: { name: true },
              },
            },
          },
          comments: true,
        },
        where: (c, { eq }) => eq(c.id, chapterId),
      });

      if (!result?.user.name || !result.media.titles.at(0)) {
        throw new NotFoundError();
      }

      console.log(result.scans);

      const mediaChapterLimited: MediaChapterLimited = {
        id: chapterId,
        title: result.title,
        number: result.number,
        volume: result.volume,
        pages: result.pages,
        // ----- RELATIONS
        user: {
          id: result.userId,
          name: result.user.name,
        },
        media: {
          id: result.mediaId,
          type: result.media.type,
          title: result.media.titles.at(0)!.title,
          chapters: result.media.chapters,
        },
        scans: result.scans.map((mediaChapterScan) => ({
          id: mediaChapterScan.scanId,
          name: mediaChapterScan.scan.name,
        })),
        comments: result.comments,
      };

      return mediaChapterLimited;
    }),
});
