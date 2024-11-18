import { commitCoverHandler } from "../handlers/commit-cover.handler"
import { deleteCoverHandler } from "../handlers/delete-cover.handler"
import { updateCoverHandler } from "../handlers/update-cover.handler"
import { uploadCoverHandler } from "../handlers/upload-cover.handler"
import { createTRPCRouter } from "../trpc"

export const coversRouter = createTRPCRouter({
  upload: uploadCoverHandler,
  commit: commitCoverHandler,
  update: updateCoverHandler,
  delete: deleteCoverHandler,
})
