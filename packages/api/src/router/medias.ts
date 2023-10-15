import { z } from "zod";

import { db, eq, sql } from "@taiyo/db";
import { mediaChapters } from "@taiyo/db/schema/mediaChapters";
import type { LatestMedia, MediaLimited } from "@taiyo/db/types";
import {
  DEFAULT_MEDIA_PAGE,
  DEFAULT_MEDIA_PER_PAGE,
  MEDIA_PER_PAGE_CHOICES,
} from "@taiyo/utils";

import { NotFoundError } from "../errors";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const mediasRouter = createTRPCRouter({
  getById: publicProcedure
    .input(
      z.object({
        id: z.string(),
        page: z.number().optional().default(DEFAULT_MEDIA_PAGE),
        perPage: z
          .number()
          .optional()
          .default(DEFAULT_MEDIA_PER_PAGE)
          .refine((x) => MEDIA_PER_PAGE_CHOICES.includes(x), {
            message: `perPage must be one of ${MEDIA_PER_PAGE_CHOICES.join(
              ", ",
            )}`,
          }),
      }),
    )
    .query(async ({ input }) => {
      const { id: mediaId, page, perPage } = input;
      const result = await db.query.medias.findFirst({
        columns: { synopsis: true },
        with: {
          covers: {
            columns: { id: true },
            limit: 1,
          },
          banners: {
            columns: { id: true },
            limit: 1,
          },
          titles: {
            columns: { title: true },
            limit: 1,
          },
        },
        where: (m, { eq }) => eq(m.id, mediaId),
      });
      /**
       * Only top-level offsets are available in relational queries yet.
       * In order to get pagination working, we have to do a separate query.
       */
      const chaptersResult = await db.query.mediaChapters.findMany({
        columns: {
          id: true,
          createdAt: true,
          title: true,
          number: true,
          volume: true,
          uploaderId: true,
        },
        with: {
          uploader: {
            columns: { name: true },
          },
          scans: {
            columns: { scanId: true },
            with: {
              scan: {
                columns: { name: true },
              },
            },
          },
        },
        orderBy: (c, { asc }) => asc(c.number),
        limit: perPage,
        offset: (page - 1) * perPage,
        where: (c, { eq }) => eq(c.mediaId, mediaId),
      });
      /**
       * Counting in relational queries is not yet supported by Drizzle.
       * So as per the recommendation of the author, we have to do a separate query.
       */
      const countResult = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(mediaChapters)
        .where(eq(mediaChapters.mediaId, mediaId))
        .execute();

      if (!result?.covers.at(0) || !result.titles.at(0) || !countResult.at(0)) {
        throw new NotFoundError();
      }

      const mediaLimited: MediaLimited = {
        id: mediaId,
        synopsis: result.synopsis,
        // ----- RELATIONS
        coverId: result.covers.at(0)!.id,
        bannerId: result.banners.at(0)?.id ?? null,
        title: result.titles.at(0)!.title,
        chapters: chaptersResult.map((c) => ({
          id: c.id,
          createdAt: c.createdAt,
          title: c.title,
          number: c.number,
          volume: c.volume,
          // ----- RELATIONS
          uploader: {
            id: c.uploaderId,
            name: c.uploader.name,
          },
          scans: c.scans.map((s) => ({
            id: s.scanId,
            name: s.scan.name,
          })),
        })),
        // ----- OTHERS
        totalPages: Math.ceil(countResult.at(0)!.count / perPage) || 1,
      };

      return mediaLimited;
    }),
  getLatestMedias: publicProcedure.query(async () => {
    const result = await db.query.medias.findMany({
      columns: { id: true },
      with: {
        covers: {
          columns: { id: true },
          limit: 1,
        },
      },
      limit: 20,
      orderBy: (m, { desc }) => desc(m.createdAt),
    });

    const latestMedias: LatestMedia[] = result.map((m) => ({
      id: m.id,
      coverId: m.covers.at(0)!.id,
    }));

    return latestMedias;
  }),
});
