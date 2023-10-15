import { relations } from "drizzle-orm";
import {
  boolean,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { medias } from "./medias";
import { users } from "./users";

export const mediaTitles = pgTable("mediaTitles", {
  id: uuid("id").defaultRandom().primaryKey(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  deletedAt: timestamp("deletedAt"),
  // -----
  title: text("title").notNull(),
  language: varchar("language", {
    enum: [
      "ENGLISH",
      "JAPANESE",
      "KOREAN",
      "ROMAJI",
      "SPANISH",
      "PORTUGUESE",
      "FRENCH",
    ],
  }),
  isAcronym: boolean("acronym").default(false),
  // -----
  mediaId: uuid("mediaId")
    .references(() => medias.id, { onDelete: "cascade" })
    .notNull(),
  creatorId: uuid("creatorId")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  deleterId: uuid("deleterId").references(() => users.id, {
    onDelete: "cascade",
  }),
});

export const mediaTitlesRelations = relations(mediaTitles, ({ one }) => ({
  media: one(medias, {
    fields: [mediaTitles.mediaId],
    references: [medias.id],
  }),
  creator: one(users, {
    fields: [mediaTitles.creatorId],
    references: [users.id],
  }),
  deleter: one(users, {
    fields: [mediaTitles.deleterId],
    references: [users.id],
  }),
}));
