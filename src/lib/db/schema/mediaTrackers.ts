import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { medias } from "./medias";
import { trackers } from "./trackers";
import { users } from "./users";

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
  creatorId: uuid("creatorId")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  deleterId: uuid("deleterId").references(() => users.id, {
    onDelete: "cascade",
  }),
});

export const mediaTrackersRelations = relations(mediaTrackers, ({ one }) => ({
  tracker: one(trackers, {
    fields: [mediaTrackers.trackerId],
    references: [trackers.id],
  }),
  media: one(medias, {
    fields: [mediaTrackers.mediaId],
    references: [medias.id],
  }),
  creator: one(users, {
    fields: [mediaTrackers.creatorId],
    references: [users.id],
  }),
  deleter: one(users, {
    fields: [mediaTrackers.deleterId],
    references: [users.id],
  }),
}));
