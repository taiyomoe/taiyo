import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { scanMembers } from "./scanMembers";

export const scans = pgTable("scans", {
  id: uuid("id").defaultRandom().primaryKey(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  deletedAt: timestamp("deletedAt"),
  // -----
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate"),
  // -----
  logo: varchar("logo", { length: 255 }).notNull(),
  banner: varchar("banner", { length: 255 }),
  // -----
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  // -----
  website: varchar("website", { length: 255 }),
  discord: varchar("discord", { length: 255 }),
  twitter: varchar("twitter", { length: 255 }),
  facebook: varchar("facebook", { length: 255 }),
  instagram: varchar("instagram", { length: 255 }),
  email: varchar("email", { length: 255 }),
});

export const scansRelations = relations(scans, ({ many }) => ({
  members: many(scanMembers),
}));
