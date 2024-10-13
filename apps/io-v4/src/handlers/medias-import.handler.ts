import { Hono } from "hono"
import { streamSSE } from "hono/streaming"
import { z } from "zod"
import { withAuth } from "~/middlewares/auth.middleware"
import { withValidation } from "~/middlewares/validation.middleware"
import type { CustomContext } from "~/types"

export const mediasImportHandler = new Hono<CustomContext>()

const importSchema = z.object({
  mdId: z.string().uuid(),
  downloadChapters: z.coerce.boolean().default(false),
})

mediasImportHandler.get(
  "/",
  withAuth([
    ["medias", "create"],
    ["mediaCovers", "create"],
    ["mediaTitles", "create"],
    ["mediaChapters", "create"],
  ]),
  withValidation("query", importSchema),
  (c) =>
    streamSSE(c, async (s) => {
      while (true) {
        await s.writeSSE({ id: "azert", data: "Hello world!" })
        await s.sleep(1000)
      }
    }),
)
