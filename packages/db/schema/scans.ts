import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { mediaChapterScans } from "./mediaChapterScans";
import { scanMembers } from "./scanMembers";
import { users } from "./users";

export const scans = pgTable("scans", {
  id: uuid("id").defaultRandom().primaryKey(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  deletedAt: timestamp("deletedAt"),
  // -----
  name: text("name").notNull(),
  description: text("description"),
  // -----
  logo: text("logo"),
  banner: text("banner"),
  // -----
  website: text("website"),
  discord: text("discord"),
  twitter: text("twitter"),
  facebook: text("facebook"),
  instagram: text("instagram"),
  telegram: text("telegram"),
  youtube: text("youtube"),
  email: text("email"),
  // -----
  creatorId: uuid("creatorId")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  deleterId: uuid("deleterId").references(() => users.id, {
    onDelete: "cascade",
  }),
});

export const scansRelations = relations(scans, ({ one, many }) => ({
  creator: one(users, {
    fields: [scans.creatorId],
    references: [users.id],
  }),
  deleter: one(users, {
    fields: [scans.deleterId],
    references: [users.id],
  }),
  members: many(scanMembers),
  chapters: many(mediaChapterScans),
}));
