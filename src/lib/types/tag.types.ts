import type { InferSelectModel } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

import { tags } from "~/lib/db/schema/tags";

export type Tag = InferSelectModel<typeof tags>;

export const insertTagSchema = createInsertSchema(tags).pick({
  name: true,
  description: true,
  category: true,
  isAdult: true,
  alId: true,
});

export type InsertTag = (typeof insertTagSchema)["_type"];
