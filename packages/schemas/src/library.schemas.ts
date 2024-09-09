import { z } from "zod"
import { pageSchema } from "./common.schemas"

const statusSchema = z.enum([
  "reading",
  "rereading",
  "completed",
  "onHold",
  "dropped",
  "planToRead",
])
const statusSchemaWithDelete = z.enum([
  "reading",
  "rereading",
  "completed",
  "onHold",
  "dropped",
  "planToRead",
  "delete",
])

export const updateLibrarySchema = z.object({
  mediaId: z.string().uuid(),
  status: statusSchemaWithDelete,
})

export const getLibrarySchema = z.object({
  userId: z.string().uuid(),
  status: statusSchema,
  page: pageSchema,
})
