import type { InferSelectModel } from "drizzle-orm";
import { relations } from "drizzle-orm";
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

export const mediaBannersRelations = relations(mediaBanners, ({ one }) => ({
  media: one(medias, {
    fields: [mediaBanners.mediaId],
    references: [medias.id],
  }),
}));

export type MediaBanner = InferSelectModel<typeof mediaBanners>;
export type MediaBanners = MediaBanner[];
