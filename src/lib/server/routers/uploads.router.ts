import { z } from "zod";

import { UploadSessionTypeSchema } from "~/lib/schemas/prisma";
import { EncryptionUtils } from "~/lib/utils/encryption.utils";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const uploadsRouter = createTRPCRouter({
  startUploadSession: protectedProcedure
    .meta({ resource: "mediaChapters", action: "create" })
    .input(
      z.object({
        type: UploadSessionTypeSchema,
        mediaId: z.string().uuid(),
        mediaChapterId: z.string().uuid().optional(),
      }),
    )
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
