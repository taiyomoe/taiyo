import { pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

import { medias } from "./medias";

export const mediaBanners = pgTable("mediaBanners", {
  id: uuid("id").defaultRandom().primaryKey(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  deletedAt: timestamp("deletedAt"),
  // -----
  mediaId: uuid("mediaId")
    .references(() => medias.id, { onDelete: "cascade" })
    .notNull(),
});
