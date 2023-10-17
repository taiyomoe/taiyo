import { relations } from "drizzle-orm";
import { boolean, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

import { medias } from "./medias";
import { tags } from "./tags";
import { users } from "./users";

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
  creatorId: uuid("creatorId")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  deleterId: uuid("deleterId").references(() => users.id, {
    onDelete: "cascade",
  }),
});

export const mediaTagsRelations = relations(mediaTags, ({ one }) => ({
  tag: one(tags, {
    fields: [mediaTags.tagId],
    references: [tags.id],
  }),
  media: one(medias, {
    fields: [mediaTags.mediaId],
    references: [medias.id],
  }),
  creator: one(users, {
    fields: [mediaTags.creatorId],
    references: [users.id],
  }),
  deleter: one(users, {
    fields: [mediaTags.deleterId],
    references: [users.id],
  }),
}));
