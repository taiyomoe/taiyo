import { relations, sql } from "drizzle-orm";
import {
  int,
  mysqlEnum,
  mysqlTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/mysql-core";

import { medias } from "./medias";

export const mediaTitles = mysqlTable("mediaTitles", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("createdAt")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt").onUpdateNow(),
  deletedAt: timestamp("deletedAt"),
  // -----
  title: text("title").notNull(),
  language: mysqlEnum("language", [
    "ENGLISH",
    "JAPANESE",
    "NATIVE",
    "ROMAJI",
    "SPANISH",
    "PORTUGUESE",
  ]),
  // -----
  mediaId: int("mediaId").notNull(),
});

export const mediaTitlesRelations = relations(mediaTitles, ({ one }) => ({
  media: one(medias, {
    fields: [mediaTitles.mediaId],
    references: [medias.id],
  }),
}));
