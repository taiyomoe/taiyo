import {
  ContentRating,
  db,
  Languages,
  MediaCountryOfOrigin,
  MediaDemography,
  MediaSource,
  MediaStatus,
  MediaType,
} from "@taiyomoe/db"
import Elysia from "elysia"
import z from "zod"
import { logger } from "../utils/logger"

const createMediaSchema = z.object({
  title: z.string(),
  description: z.string(),
  image: z.string(),
  creatorId: z.string().uuid(),
})

export const mediasRouter = new Elysia({ prefix: "/medias" }).post(
  "/",
  async ({ body }) => {
    logger.info("Creating a new media", { body })

    const media = await db.media.create({
      data: {
        synopsis: body.description,
        creatorId: body.creatorId,
        type: MediaType.MANGA,
        status: MediaStatus.RELEASING,
        source: MediaSource.ORIGINAL,
        demography: MediaDemography.SHOUNEN,
        countryOfOrigin: MediaCountryOfOrigin.JAPAN,
        contentRating: ContentRating.NORMAL,
        genres: [],
        tags: [],
        titles: {
          create: {
            title: body.title,
            language: Languages.en,
            priority: 0,
            isMainTitle: true,
            creatorId: body.creatorId,
          },
        },
        covers: {
          create: {
            language: Languages.en,
            isMainCover: true,
            uploaderId: body.creatorId,
          },
        },
      },
    })

    return { message: "Media created successfully", id: media.id }
  },
  {
    body: createMediaSchema,
    detail: {
      summary: "Create a new media",
      tags: ["media"],
    },
  },
)
