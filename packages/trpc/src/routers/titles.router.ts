import { createTitleHandler } from "../handlers/create-title.handler"
import { deleteTitleHandler } from "../handlers/delete-title.handler"
import { updateTitleHandler } from "../handlers/update-title.handler"
import { createTRPCRouter } from "../trpc"

export const titlesRouter = createTRPCRouter({
  create: createTitleHandler,
  update: updateTitleHandler,
  delete: deleteTitleHandler,
})
