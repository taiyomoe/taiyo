import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { mediaChapterScans } from "./mediaChapterScans";
import { scanMembers } from "./scanMembers";

export const scans = pgTable("scans", {
  id: uuid("id").defaultRandom().primaryKey(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  deletedAt: timestamp("deletedAt"),
  // -----
  name: text("name").notNull(),
  description: text("description"),
  // -----
  logo: text("logo").notNull(),
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
});

export const scansRelations = relations(scans, ({ many }) => ({
  members: many(scanMembers),
  chapters: many(mediaChapterScans),
}));
