import { deleteCoverHandler } from "../handlers/delete-cover.handler"
import { updateCoverHandler } from "../handlers/update-cover.handler"
import { createTRPCRouter } from "../trpc"

export const coversRouter = createTRPCRouter({
  update: updateCoverHandler,
  delete: deleteCoverHandler,
})
