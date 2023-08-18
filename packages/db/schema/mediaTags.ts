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
  mediaId: uuid("mediaId")
    .references(() => medias.id, { onDelete: "cascade" })
    .notNull(),
  tagId: uuid("tagId")
    .references(() => tags.id, { onDelete: "cascade" })
    .notNull(),
});
