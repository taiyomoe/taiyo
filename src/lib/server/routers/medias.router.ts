import type { Trackers } from "@prisma/client";

import {
  getMediaByIdSchema,
  insertMediaSchema,
  searchMediaSchema,
} from "~/lib/schemas";
import { LibraryService } from "~/lib/services";
import type { LatestMedia, MediaLimited, SearchedMedia } from "~/lib/types";
import { MediaUtils } from "~/lib/utils/media.utils";

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
              create: {
                ...cover,
                isMainCover: true,
                uploaderId: ctx.session.user.id,
              },
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
          status: true,
          genres: true,
          tags: true,
          covers: {
            select: { id: true },
            where: { isMainCover: true },
            take: 1,
          },
          banners: { select: { id: true }, take: 1 },
          titles: {
            select: {
              title: true,
              language: true,
              priority: true,
              isAcronym: true,
              isMainTitle: true,
            },
          },
          trackers: { select: { tracker: true, externalId: true } },
        },
        where: { id: mediaId },
      });

      if (!result?.covers.at(0) || !result.titles.at(0)) {
        return null;
      }

      const userLibraryMedia = await LibraryService.getUserLibraryMedia(
        ctx.session?.user.id,
        mediaId,
      );

      const mediaLimited: MediaLimited = {
        id: mediaId,
        synopsis: result.synopsis,
        status: result.status,
        genres: result.genres,
        tags: result.tags,
        // ----- USER LIBRARY
        userLibrary: userLibraryMedia
          ? {
              status: userLibraryMedia.status,
              updatedAt: userLibraryMedia.updatedAt,
            }
          : null,
        // ----- RELATIONS
        coverId: result.covers.at(0)!.id,
        bannerId: result.banners.at(0)?.id ?? null,
        mainTitle: MediaUtils.getMainTitle(
          result.titles,
          ctx.session?.user.preferredTitles ?? null,
        ),
        titles: result.titles,
        trackers: result.trackers.filter((t) => t.tracker !== "MANGADEX"),
      };

      return mediaLimited;
    }),

  getLatestMedias: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.db.media.findMany({
      select: {
        id: true,
        covers: {
          select: { id: true },
          where: { isMainCover: true },
          take: 1,
        },
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

  search: publicProcedure
    .input(searchMediaSchema)
    .mutation(async ({ ctx, input: { title } }) => {
      const results = await ctx.indexes.medias.search(title);
      const searchedMedias: SearchedMedia[] = results.hits.map((h) => ({
        id: h.id,
        synopsis: h.synopsis ? h.synopsis.slice(0, 100) + "..." : null,
        title: MediaUtils.getMainTitle(
          h.titles,
          ctx.session?.user.preferredTitles ?? null,
        ),
        coverId: h.mainCoverId,
      }));

      return searchedMedias;
    }),
});
