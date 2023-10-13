import { z } from "zod";

import { DEFAULT_MEDIA_PAGE, DEFAULT_MEDIA_PER_PAGE } from "./constants";

export const mediaPaginationSchema = z.object({
  page: z.coerce.number().default(DEFAULT_MEDIA_PAGE),
  perPage: z.coerce.number().default(DEFAULT_MEDIA_PER_PAGE),
});
