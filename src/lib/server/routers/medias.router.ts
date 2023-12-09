import type { Trackers } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import {
  getMediaByIdSchema,
  insertMediaSchema,
  searchMediaSchema,
  updateMediaSchema,
} from "~/lib/schemas";
import { LibraryService, MediaService } from "~/lib/services";
import type { MediaLimited, SearchedMedia } from "~/lib/types";
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
        input: { mdTracker, alTracker, malTracker, ...input },
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
            creatorId: ctx.session.user.id,
          },
        });

        return result;
      },
    ),

  update: protectedProcedure
    .meta({
      resource: "medias",
      action: "create",
    })
    .input(updateMediaSchema)
    .mutation(async ({ ctx, input }) => {
      const media = await ctx.db.media.findUnique({
        select: { id: true },
        where: { id: input.id },
      });

      if (!media) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Media not found",
        });
      }

      await ctx.db.media.update({
        where: { id: input.id },
        data: input,
      });
    }),

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
            where: { isMainCover: true, deletedAt: null },
            take: 1,
          },
          banners: {
            select: { id: true },
            take: 1,
            where: { deletedAt: null },
          },
          titles: {
            select: {
              title: true,
              language: true,
              priority: true,
              isAcronym: true,
              isMainTitle: true,
            },
            where: { deletedAt: null },
          },
          trackers: { select: { tracker: true, externalId: true } },
        },
        where: { id: mediaId, deletedAt: null },
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
          ctx.session?.user.preferredTitles,
        ),
        titles: result.titles,
        trackers: result.trackers.filter((t) => t.tracker !== "MANGADEX"),
      };

      return mediaLimited;
    }),

  getHomePage: publicProcedure.query(async ({ ctx }) => {
    const latestMedias = await MediaService.getLatestMedias();
    const featuredMedias = await MediaService.getFeaturedMedias(
      ctx.session?.user.preferredTitles,
    );

    return {
      latestMedias,
      featuredMedias,
    };
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
