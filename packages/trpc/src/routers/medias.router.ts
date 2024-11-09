import { bulkMutateMediasHandler } from "../handlers/bulk-mutate-medias.handler"
import { getMediaByIdHandler } from "../handlers/get-media-by-id.handler"
import { getMediasListHandler } from "../handlers/get-medias-list.handler"
import { importMediaHandler } from "../handlers/import-media.handler"
import { syncMediaHandler } from "../handlers/sync-media.handler"
import { updateMediaHandler } from "../handlers/update-media.handler"
import { createTRPCRouter } from "../trpc"

export const mediasRouter = createTRPCRouter({
  update: updateMediaHandler,
  bulkMutate: bulkMutateMediasHandler,
  getById: getMediaByIdHandler,
  getList: getMediasListHandler,
  import: importMediaHandler,
  sync: syncMediaHandler,
})
