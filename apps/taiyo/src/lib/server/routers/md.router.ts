import { importMediaSchema } from "@taiyomoe/schemas"
import { TRPCError } from "@trpc/server"
import { Manga } from "mangadex-full-api"
import { env } from "~/lib/env.mjs"
import { MediaService } from "~/lib/services"
import { pusherServer } from "~/lib/soketi/server"
import type { UploadResponse } from "~/lib/types"
import { MdUtils } from "~/lib/utils/md.utils"
import { MediaUtils } from "~/lib/utils/media.utils"
import { createTRPCRouter, protectedProcedure } from "../trpc"

export const mdRouter = createTRPCRouter({
  import: protectedProcedure
    .meta({ resource: "medias", action: "create" })
    .input(importMediaSchema)
    .mutation(async ({ ctx, input }) => {
      const existingMedia = await ctx.db.media.findFirst({
        where: {
          trackers: {
            some: {
              externalId: input.mdId,
            },
          },
        },
      })

      if (existingMedia) {
        throw new Error("Uma obra com esse ID da MangaDex já existe.")
      }

      void pusherServer.trigger("importChannel", "importEvent", {
        step: 1,
        content: "Recuperando as informações da obra...",
        type: "ongoing",
      })

      const manga = await Manga.get(input.mdId)
      const covers = await manga.getCovers()
      const mainCover = await manga.mainCover.resolve()

      void pusherServer.triggerBatch([
        {
          channel: "importChannel",
          name: "importEvent",
          data: {
            step: 1,
            content: "Informações recuperadas",
            type: "success",
          },
        },
        {
          channel: "importChannel",
          name: "importEvent",
          data: {
            step: 2,
            content: "Criando a obra...",
            type: "ongoing",
          },
        },
      ])

      // End date, trailer, type "manga default", source
      const { genres, tags, isOneShot } = MdUtils.getGenresAndTags(manga)
      const titles = MdUtils.getTitles(manga)
      const trackers = MdUtils.getTrackers(manga)

      const media = await ctx.db.media.create({
        data: {
          startDate: manga.year
            ? new Date(Date.parse(manga.year.toString()))
            : null,
          // -----
          synopsis: input.synopsis,
          contentRating: MdUtils.getContentRating(manga),
          oneShot: isOneShot,
          type: MdUtils.getType(manga),
          status: "RELEASING",
          source: "LIGHT_NOVEL",
          demography: MdUtils.getDemography(manga),
          countryOfOrigin: MdUtils.getCountryOfOrigin(manga),
          genres,
          tags: tags.map((key) => ({ key, isSpoiler: false })),
          // -----
          titles: {
            create: titles.map((title) => ({
              ...title,
              creatorId: ctx.session.user.id,
            })),
          },
          trackers: {
            create: trackers.map((tracker) => ({
              ...tracker,
              creatorId: ctx.session.user.id,
            })),
          },
          // -----
          creatorId: ctx.session.user.id,
        },
      })

      void pusherServer.trigger("importChannel", "importEvent", {
        step: 2,
        content: "Obra criada",
        type: "success",
      })

      for (const [i, cover] of covers.entries()) {
        const coverLanguage = MdUtils.getLanguage(cover.locale)

        if (!coverLanguage) {
          continue
        }

        void pusherServer.trigger("importChannel", "importEvent", {
          step: 3,
          content: `Upando a cover ${i + 1}/${covers.length}...`,
          type: "ongoing",
        })

        const response = await fetch(MediaUtils.getUploadEndpoint(), {
          method: "POST",
          headers: {
            Authorization: env.IO_ADMIN_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: ctx.session.user.id,
            mediaId: media.id,
            type: "COVER",
            url: cover.imageSource,
          }),
        })

        const uploadCover = (await response.json()) as UploadResponse

        if ("error" in uploadCover) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Ocorreu um erro ao upar a cover ${i + 1}/${
              covers.length
            }.`,
          })
        }

        await ctx.db.mediaCover.create({
          data: {
            id: uploadCover.files[0]!,
            volume: Number.isNaN(parseFloat(cover.volume))
              ? null
              : parseFloat(cover.volume),
            isMainCover: mainCover.id === cover.id,
            language: coverLanguage,
            mediaId: media.id,
            uploaderId: ctx.session.user.id,
          },
        })
      }

      void pusherServer.triggerBatch([
        {
          channel: "importChannel",
          name: "importEvent",
          data: {
            step: 3,
            content: "Covers upadas",
            type: "success",
          },
        },
        {
          channel: "importChannel",
          name: "importEvent",
          data: {
            step: 4,
            content: "Reindexando a busca...",
            type: "ongoing",
          },
        },
      ])

      const indexItem = await MediaService.getIndexItem(media.id)
      await ctx.indexes.medias.updateDocuments([indexItem])

      void pusherServer.trigger("importChannel", "importEvent", {
        step: 4,
        content: "Busca reindexada",
        type: "success",
      })
    }),
})
