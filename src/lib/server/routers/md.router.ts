import { Manga } from "mangadex-full-api";

import { importMediaSchema } from "~/lib/schemas";
import { pusherServer } from "~/lib/soketi/server";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const mdRouter = createTRPCRouter({
  import: protectedProcedure
    .meta({ resource: "medias", action: "create" })
    .input(importMediaSchema)
    .mutation(async ({ ctx, input }) => {
      const media = await ctx.db.media.findFirst({
        where: {
          trackers: {
            some: {
              externalId: input.mdId,
            },
          },
        },
      });

      if (media) {
        throw new Error("Uma obra com esse ID da MangaDex já existe.");
      }

      void pusherServer.trigger("importChannel", "importEvent", {
        step: 1,
        content: "Recuperando as informações da obra...",
        type: "ongoing",
      });

      const manga = await Manga.get(input.mdId);
      console.log("manga", manga);

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
      ]);
    }),
});
