import type { Trackers } from "@prisma/client";
import { z } from "zod";

import {
  DEFAULT_MEDIA_PAGE,
  DEFAULT_MEDIA_PER_PAGE,
  MEDIA_PER_PAGE_CHOICES,
} from "~/lib/constants";
import { insertMediaSchema } from "~/lib/schemas";
import type { LatestMedia, MediaLimited } from "~/lib/types";

import { NotFoundError } from "../errors";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const mediasRouter = createTRPCRouter({
  create: protectedProcedure
    .meta({
      resource: "medias",
      action: "create",
    })
    .input(insertMediaSchema)
    .mutation(
      async ({
        ctx,
        input: { cover, banner, mdTracker, alTracker, malTracker, ...input },
      }) => {
        /**
         * Before creating the media, we need to create the trackers array.
         * It would be too much of a hassle to create it in the creating object.
         */
        const trackers = [];

        if (mdTracker) {
          trackers.push({
            tracker: "MANGADEX" as Trackers,
            externalId: mdTracker,
            creatorId: ctx.session.user.id,
          });
        }

        if (alTracker) {
          trackers.push({
            tracker: "ANILIST" as Trackers,
            externalId: alTracker.toString(),
            creatorId: ctx.session.user.id,
          });
        }

        if (malTracker) {
          trackers.push({
            tracker: "MYANIMELIST" as Trackers,
            externalId: malTracker.toString(),
            creatorId: ctx.session.user.id,
          });
        }

        const result = await ctx.db.media.create({
          data: {
            ...input,
            titles: {
              createMany: {
                data: input.titles.map((t) => ({
                  ...t,
                  creatorId: ctx.session.user.id,
                })),
              },
            },
            trackers: { createMany: { data: trackers } },
            covers: {
              create: { ...cover, uploaderId: ctx.session.user.id },
            },
            banners: {
              create: banner.id
                ? { ...banner, uploaderId: ctx.session.user.id }
                : undefined,
            },
            creatorId: ctx.session.user.id,
          },
        });

        return result;
      },
    ),

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
    .query(async ({ ctx, input }) => {
      const { id: mediaId, page, perPage } = input;
      const result = await ctx.db.media.findFirst({
        select: {
          _count: { select: { chapters: true } },
          synopsis: true,
          covers: { select: { id: true }, take: 1 },
          banners: { select: { id: true }, take: 1 },
          titles: { select: { title: true }, take: 1 },
          chapters: {
            select: {
              id: true,
              createdAt: true,
              title: true,
              number: true,
              volume: true,
              uploader: { select: { id: true, name: true } },
              scans: { select: { id: true, name: true } },
            },
            orderBy: { number: "asc" },
            take: perPage,
            skip: (page - 1) * perPage,
            where: { mediaId },
          },
        },
        where: { id: mediaId },
      });

      if (!result?.covers.at(0) || !result.titles.at(0)) {
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
          uploader: {
            id: c.uploader.id,
            name: c.uploader.name,
          },
          scans: c.scans.map((s) => ({
            id: s.id,
            name: s.name,
          })),
        })),
        // ----- OTHERS
        totalPages: Math.ceil(result._count.chapters / perPage) || 1,
      };

      return mediaLimited;
    }),
  getLatestMedias: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.db.media.findMany({
      select: {
        id: true,
        covers: { select: { id: true }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const latestMedias: LatestMedia[] = result.map((m) => ({
      id: m.id,
      coverId: m.covers.at(0)!.id,
    }));

    return latestMedias;
  }),
});
