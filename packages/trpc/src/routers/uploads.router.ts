import { startUploadSessionSchema } from "@taiyomoe/schemas"
import { createTRPCRouter, protectedProcedure } from "../trpc"

export const uploadsRouter = createTRPCRouter({
  startUploadSession: protectedProcedure
    .meta({ resource: "mediaChapters", action: "create" })
    .input(startUploadSessionSchema)
    .mutation(async () => {
      const mediaChapterId = crypto.randomUUID()

      return {
        mediaChapterId,
        authToken: "aet",
      }
    }),
})
