import { db } from "@taiyomoe/db"
import Elysia from "elysia"
import z from "zod"
import { logger } from "../utils/logger"

const createMediaSchema = z.object({
  title: z.string(),
  description: z.string(),
  image: z.string(),
})

export const mediasRouter = new Elysia({ prefix: "/medias" }).post(
  "/",
  async ({ body }) => {
    logger.info("Creating a new media", { body })

    await db.media.findFirst()

    return { message: "Media created successfully" }
  },
  {
    body: createMediaSchema,
    detail: {
      summary: "Create a new media",
      tags: ["media"],
    },
  },
)
