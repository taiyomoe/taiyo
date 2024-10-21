import { bulkMutateMediasHandler } from "../handlers/bulk-mutate-medias.handler"
import { getMediaByIdHandler } from "../handlers/get-media-by-id.handler"
import { getMediaListHandler } from "../handlers/get-media-list.handler"
import { updateMediaHandler } from "../handlers/update-media.handler"
import { createTRPCRouter } from "../trpc"

export const mediasRouter = createTRPCRouter({
  update: updateMediaHandler,
  bulkMutate: bulkMutateMediasHandler,
  getById: getMediaByIdHandler,
  getList: getMediaListHandler,
})
