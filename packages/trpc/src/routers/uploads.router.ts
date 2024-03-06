import { startUploadSessionSchema } from "@taiyomoe/schemas"
import { EncryptionUtils } from "@taiyomoe/utils"
import { createTRPCRouter, protectedProcedure } from "../trpc"

export const uploadsRouter = createTRPCRouter({
  startUploadSession: protectedProcedure
    .meta({ resource: "mediaChapters", action: "create" })
    .input(startUploadSessionSchema)
    .mutation(async ({ ctx, input }) => {
      const mediaChapterId = crypto.randomUUID()
      const uploadSession = await ctx.db.uploadSession.create({
        data: {
          type: input.type,
          userId: ctx.session.user.id,
          mediaId: input.mediaId,
          mediaChapterId,
        },
      })

      const toEncrypt = {
        uploadSessionId: uploadSession.id,
      }

      return {
        mediaChapterId,
        authToken: EncryptionUtils.encrypt(JSON.stringify(toEncrypt)),
      }
    }),
})
