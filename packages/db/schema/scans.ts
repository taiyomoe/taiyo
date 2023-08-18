import { relations, sql } from "drizzle-orm";
import {
  mysqlTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

import { scanMembers } from "./scanMembers";

export const scans = mysqlTable("scans", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("createdAt")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt").onUpdateNow(),
  deletedAt: timestamp("deletedAt"),
  // -----
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate"),
  // -----
  logo: varchar("logo", { length: 256 }).notNull(),
  banner: varchar("banner", { length: 256 }),
  // -----
  name: varchar("name", { length: 256 }).notNull(),
  description: text("description"),
  // -----
  website: varchar("website", { length: 256 }),
  discord: varchar("discord", { length: 256 }),
  twitter: varchar("twitter", { length: 256 }),
  facebook: varchar("facebook", { length: 256 }),
  instagram: varchar("instagram", { length: 256 }),
  email: varchar("email", { length: 256 }),
});

export const scansRelations = relations(scans, ({ many }) => ({
  members: many(scanMembers),
}));
