import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { medias } from "./medias";

export const mediaTitles = pgTable("mediaTitles", {
  id: uuid("id").defaultRandom().primaryKey(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  deletedAt: timestamp("deletedAt"),
  // -----
  title: text("title").notNull(),
  language: varchar("language", {
    enum: ["ENGLISH", "JAPANESE", "NATIVE", "ROMAJI", "SPANISH", "PORTUGUESE"],
  }),
  // -----
  mediaId: uuid("mediaId")
    .references(() => medias.id, { onDelete: "cascade" })
    .notNull(),
});
