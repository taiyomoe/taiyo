import { relations } from "drizzle-orm";
import { pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

import { medias } from "./medias";
import { users } from "./users";

export const mediaBanners = pgTable("mediaBanners", {
  id: uuid("id").defaultRandom().primaryKey(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  deletedAt: timestamp("deletedAt"),
  // -----
  mediaId: uuid("mediaId")
    .references(() => medias.id, { onDelete: "cascade" })
    .notNull(),
  uploaderId: uuid("uploaderId")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  deleterId: uuid("deleterId").references(() => users.id, {
    onDelete: "cascade",
  }),
});

export const mediaBannersRelations = relations(mediaBanners, ({ one }) => ({
  media: one(medias, {
    fields: [mediaBanners.mediaId],
    references: [medias.id],
  }),
  creator: one(users, {
    fields: [mediaBanners.uploaderId],
    references: [users.id],
  }),
  deleter: one(users, {
    fields: [mediaBanners.deleterId],
    references: [users.id],
  }),
}));
