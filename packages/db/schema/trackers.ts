import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { mediaTrackers } from "./mediaTrackers";

export const trackers = pgTable("trackers", {
  id: uuid("id").defaultRandom().primaryKey(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  deletedAt: timestamp("deletedAt"),
  // -----
  name: text("name").notNull().unique(),
  logo: text("logo").notNull(),
});

export const trackersRelations = relations(trackers, ({ many }) => ({
  mediaTrackers: many(mediaTrackers),
}));
