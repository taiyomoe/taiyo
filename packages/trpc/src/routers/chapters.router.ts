import { getLatestChaptersGroupedByUserSchema } from "@taiyomoe/schemas"
import { bulkMutateChaptersHandler } from "../handlers/bulk-mutate-chapters.handler"
import { getChapterByIdHandler } from "../handlers/get-chapter-by-id.handler"
import { getChapterByMediaIdHandler } from "../handlers/get-chapter-by-media-id.handler"
import { getChaptersByUserIdHandler } from "../handlers/get-chapters-by-user-id.handler"
import { getChaptersListHandler } from "../handlers/get-chapters-list.handler"
import { updateChapterScansHandler } from "../handlers/update-chapter-scans.handler"
import { updateChapterVolumesHandler } from "../handlers/update-chapter-volumes.handler"
import { updateChapterHandler } from "../handlers/update-chapter.handler"
import { uploadChapterHandler } from "../handlers/upload-chapter.handler"
import { createTRPCRouter, publicProcedure } from "../trpc"

export const chaptersRouter = createTRPCRouter({
  upload: uploadChapterHandler,
  update: updateChapterHandler,
  updateVolumes: updateChapterVolumesHandler,
  updateScans: updateChapterScansHandler,
  bulkMutate: bulkMutateChaptersHandler,
  getById: getChapterByIdHandler,
  getByMediaId: getChapterByMediaIdHandler,
  getByUserId: getChaptersByUserIdHandler,
  getList: getChaptersListHandler,
  getLatest: publicProcedure.query(({ ctx }) =>
    ctx.services.chapters.getLatest(ctx.session?.user.preferredTitles),
  ),
  getLatestGroupedLite: publicProcedure.query(({ ctx }) =>
    ctx.services.chapters.getLatestGroupedLite(),
  ),
  getLatestGroupedByUser: publicProcedure
    .input(getLatestChaptersGroupedByUserSchema)
    .query(({ ctx, input }) =>
      ctx.services.chapters.getLatestGroupedByUser(
        input,
        ctx.session?.user.id,
        ctx.session?.user.preferredTitles,
      ),
    ),
})
