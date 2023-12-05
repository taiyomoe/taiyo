import { startUploadSessionSchema } from "~/lib/schemas";
import { EncryptionUtils } from "~/lib/utils/encryption.utils";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const uploadsRouter = createTRPCRouter({
  startUploadSession: protectedProcedure
    .meta({ resource: "mediaChapters", action: "create" })
    .input(startUploadSessionSchema)
    .mutation(async ({ ctx, input }) => {
      const uploadSession = await ctx.db.uploadSession.create({
        data: {
          type: input.type,
          userId: ctx.session.user.id,
          mediaId: input.mediaId,
          mediaChapterId: input.mediaChapterId,
        },
      });

      const toEncrypt = {
        uploadSessionId: uploadSession.id,
      };

      return EncryptionUtils.encrypt(JSON.stringify(toEncrypt));
    }),
});
