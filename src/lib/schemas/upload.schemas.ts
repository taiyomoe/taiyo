import { z } from "zod";

import { UploadSessionTypeSchema } from "./prisma";

export const startUploadSessionSchema = z.object({
  type: UploadSessionTypeSchema,
  mediaId: z.string().uuid(),
  mediaChapterId: z.string().uuid().optional(),
});
