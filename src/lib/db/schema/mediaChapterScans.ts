import { relations } from "drizzle-orm";
import {
  index,
  pgTable,
  primaryKey,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { mediaChapters } from "./mediaChapters";
import { scans } from "./scans";
import { users } from "./users";

export const mediaChapterScans = pgTable(
  "mediaChapterScans",
  {
    id: uuid("id").defaultRandom(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
    deletedAt: timestamp("deletedAt"),
    // -----
    scanId: uuid("scanId")
      .references(() => scans.id, { onDelete: "cascade" })
      .notNull(),
    mediaChapterId: uuid("mediaChapterId")
      .references(() => mediaChapters.id, { onDelete: "cascade" })
      .notNull(),
    creatorId: uuid("creatorId")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    deleterId: uuid("deleterId").references(() => users.id, {
      onDelete: "cascade",
    }),
  },
  (t) => ({
    pk: primaryKey(t.id, t.scanId, t.mediaChapterId),
    mediaChapterIdIdx: index("mediaChapterId_idx").on(t.mediaChapterId),
  }),
);

export const mediaChapterScansRelations = relations(
  mediaChapterScans,
  ({ one }) => ({
    scan: one(scans, {
      fields: [mediaChapterScans.scanId],
      references: [scans.id],
    }),
    chapter: one(mediaChapters, {
      fields: [mediaChapterScans.mediaChapterId],
      references: [mediaChapters.id],
    }),
    creator: one(users, {
      fields: [mediaChapterScans.creatorId],
      references: [users.id],
    }),
    deleter: one(users, {
      fields: [mediaChapterScans.deleterId],
      references: [users.id],
    }),
  }),
);
