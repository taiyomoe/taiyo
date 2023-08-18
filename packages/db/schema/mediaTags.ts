import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { medias } from "./medias";

export const tags = pgTable("tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  deletedAt: timestamp("deletedAt"),
  // -----
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description").notNull(),
});

export const mediaTags = pgTable("mediaTags", {
  id: uuid("id").defaultRandom().primaryKey(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  deletedAt: timestamp("deletedAt"),
  // -----
  mediaId: uuid("mediaId").notNull(),
  tagId: uuid("tagId").notNull(),
});

export const mediaTagsRelations = relations(mediaTags, ({ one }) => ({
  media: one(medias, {
    fields: [mediaTags.mediaId],
    references: [medias.id],
  }),
  tag: one(tags, {
    fields: [mediaTags.tagId],
    references: [tags.id],
  }),
}));
