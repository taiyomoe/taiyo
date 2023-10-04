import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { medias } from "./medias";

export const tags = pgTable("tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  deletedAt: timestamp("deletedAt"),
  // -----
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  // -----
  isAdult: boolean("isAdult").default(false).notNull(),
  // -----
  alId: integer("alId").notNull(),
});

export const mediaTags = pgTable("mediaTags", {
  id: uuid("id").defaultRandom().primaryKey(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  deletedAt: timestamp("deletedAt"),
  // -----
  isSpoiler: boolean("isSpoiler").default(false).notNull(),
  // -----
  tagId: uuid("tagId")
    .references(() => tags.id, { onDelete: "cascade" })
    .notNull(),
  mediaId: uuid("mediaId")
    .references(() => medias.id, { onDelete: "cascade" })
    .notNull(),
});

export const tagsRelations = relations(tags, ({ many }) => ({
  mediaTags: many(mediaTags),
}));

export const mediaTagsRelations = relations(mediaTags, ({ one }) => ({
  tag: one(tags, {
    fields: [mediaTags.tagId],
    references: [tags.id],
  }),
  media: one(medias, {
    fields: [mediaTags.mediaId],
    references: [medias.id],
  }),
}));
