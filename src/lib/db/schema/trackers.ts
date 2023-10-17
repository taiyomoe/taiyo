import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { mediaTrackers } from "./mediaTrackers";
import { users } from "./users";

export const trackers = pgTable("trackers", {
  id: uuid("id").defaultRandom().primaryKey(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  deletedAt: timestamp("deletedAt"),
  // -----
  name: text("name").notNull().unique(),
  logo: text("logo").notNull(),
  // -----
  creatorId: uuid("creatorId")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  deleterId: uuid("deleterId").references(() => users.id, {
    onDelete: "cascade",
  }),
});

export const trackersRelations = relations(trackers, ({ one, many }) => ({
  creator: one(users, {
    fields: [trackers.creatorId],
    references: [users.id],
  }),
  deleter: one(users, {
    fields: [trackers.deleterId],
    references: [users.id],
  }),
  mediaTrackers: many(mediaTrackers),
}));
