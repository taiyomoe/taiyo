import { z } from "zod";

export const updateLibrarySchema = z.object({
  mediaId: z.string().uuid(),
  status: z.enum([
    "reading",
    "rereading",
    "completed",
    "onHold",
    "dropped",
    "planToRead",
    "delete",
  ]),
});
