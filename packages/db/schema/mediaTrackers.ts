import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { medias } from "./medias";

export const trackers = pgTable("trackers", {
  id: uuid("id").defaultRandom().primaryKey(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  deletedAt: timestamp("deletedAt"),
  // -----
  name: text("name").notNull().unique(),
  logo: text("logo").notNull(),
});

export const mediaTrackers = pgTable("mediaTrackers", {
  id: uuid("id").defaultRandom().primaryKey(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  deletedAt: timestamp("deletedAt"),
  // -----
  trackerMediaId: text("trackerMediaId").notNull(),
  // -----
  trackerId: uuid("trackerId")
    .references(() => trackers.id, { onDelete: "cascade" })
    .notNull(),
  mediaId: uuid("mediaId")
    .references(() => medias.id, { onDelete: "cascade" })
    .notNull(),
});
