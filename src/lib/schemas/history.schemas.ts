import { z } from "zod";

export const updateProgressionSchema = z.object({
  chapterId: z.string().uuid(),
  pageId: z.string().uuid(),
});
