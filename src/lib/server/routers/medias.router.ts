import type { Trackers } from "@prisma/client";

import { DEFAULT_PREFERRED_TITLES } from "~/lib/constants";
import { getMediaByIdSchema, insertMediaSchema } from "~/lib/schemas";
import type { LatestMedia, MediaLimited } from "~/lib/types";
import { MediaUtils } from "~/lib/utils/media.utils";

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
    .input(getMediaByIdSchema)
    .query(async ({ ctx, input: mediaId }) => {
      const result = await ctx.db.media.findFirst({
        select: {
          synopsis: true,
          genres: true,
          covers: { select: { id: true }, take: 1 },
          banners: { select: { id: true }, take: 1 },
          titles: {
            select: {
              title: true,
              language: true,
              isAcronym: true,
              priority: true,
            },
          },
          tags: {
            select: { isSpoiler: true, tag: { select: { name: true } } },
          },
          trackers: { select: { tracker: true, externalId: true } },
        },
        where: { id: mediaId },
      });

      if (!result?.covers.at(0) || !result.titles.at(0)) {
        throw new NotFoundError();
      }

      const mediaLimited: MediaLimited = {
        id: mediaId,
        synopsis: result.synopsis,
        genres: result.genres,
        // ----- RELATIONS
        coverId: result.covers.at(0)!.id,
        bannerId: result.banners.at(0)?.id ?? null,
        mainTitle: MediaUtils.getMainTitle(
          result.titles,
          ctx.session?.user.preferredTitles ?? DEFAULT_PREFERRED_TITLES,
        ),
        titles: result.titles,
        tags: result.tags.map((t) => ({
          isSpoiler: t.isSpoiler,
          name: t.tag.name,
        })),
        trackers: result.trackers,
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
