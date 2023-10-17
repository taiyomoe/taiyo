import { relations } from "drizzle-orm";
import { integer, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

import { medias } from "./medias";
import { users } from "./users";

export const mediaCovers = pgTable("mediaCovers", {
  id: uuid("id").defaultRandom().primaryKey(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  deletedAt: timestamp("deletedAt"),
  // -----
  volume: integer("volume"),
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

export const mediaCoversRelations = relations(mediaCovers, ({ one }) => ({
  media: one(medias, {
    fields: [mediaCovers.mediaId],
    references: [medias.id],
  }),
  creator: one(users, {
    fields: [mediaCovers.uploaderId],
    references: [users.id],
  }),
  deleter: one(users, {
    fields: [mediaCovers.deleterId],
    references: [users.id],
  }),
}));
