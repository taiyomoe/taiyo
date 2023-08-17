import { relations, sql } from "drizzle-orm";
import {
  int,
  mysqlTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

import { medias } from "./medias";

export const tags = mysqlTable("tags", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("createdAt")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt").onUpdateNow(),
  deletedAt: timestamp("deletedAt"),
  // -----
  name: varchar("name", { length: 256 }).notNull().unique(),
  description: text("description").notNull(),
});

export const mediaTags = mysqlTable("mediaTags", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("createdAt")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt").onUpdateNow(),
  deletedAt: timestamp("deletedAt"),
  // -----
  mediaId: int("mediaId").notNull(),
  tagId: int("tagId").notNull(),
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
