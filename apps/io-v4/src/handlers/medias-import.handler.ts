import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import { streamSSE } from "hono/streaming"
import { z } from "zod"
import type { Context } from "../types"

export const mediasImportHandler = new Hono<Context>()

const importSchema = z.object({
  mdId: z.string().uuid(),
  downloadChapters: z.coerce.boolean().default(false),
})

mediasImportHandler.get("/", zValidator("query", importSchema), (c) =>
  streamSSE(c, async (s) => {
    while (true) {
      await s.writeSSE({ id: "azert", data: "Hello world!" })
      await s.sleep(1000)
    }
  }),
)
