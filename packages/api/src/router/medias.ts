import { z } from "zod";

import { db } from "@taiyo/db";
import type { LatestMedia, MediaLimited } from "@taiyo/db/types";

import { NotFoundError } from "../errors";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const mediasRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.string())
    .query(async ({ input: mediaId }) => {
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
          chapters: {
            columns: {
              id: true,
              createdAt: true,
              title: true,
              number: true,
              volume: true,
              userId: true,
            },
            with: {
              user: {
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
          },
        },
        where: (m, { eq }) => eq(m.id, mediaId),
      });

      console.log(result);

      if (
        !result?.covers.at(0) ||
        !result.titles.at(0) ||
        !result.chapters.at(0)
      ) {
        throw new NotFoundError();
      }

      const mediaLimited: MediaLimited = {
        id: mediaId,
        synopsis: result.synopsis,
        // ----- RELATIONS
        coverId: result.covers.at(0)!.id,
        bannerId: result.banners.at(0)?.id ?? null,
        title: result.titles.at(0)!.title,
        chapters: result.chapters.map((c) => ({
          id: c.id,
          createdAt: c.createdAt,
          title: c.title,
          number: c.number,
          volume: c.volume,
          // ----- RELATIONS
          user: {
            id: c.userId,
            name: c.user.name,
          },
          scans: c.scans.map((s) => ({
            id: s.scanId,
            name: s.scan.name,
          })),
        })),
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
