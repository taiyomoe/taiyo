import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { scans } from "./scans";
import { users } from "./users";

export const scanMembers = pgTable("scanMembers", {
  id: uuid("id").defaultRandom().primaryKey(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  deletedAt: timestamp("deletedAt"),
  // -----
  roles: text("roles", {
    enum: [
      "OWNER",
      "ADMIN",
      "TRANSLATOR",
      "PROOFREADER",
      "CLEANER",
      "REDRAWER",
      "TYPESETTER",
      "QUALITY_CHECKER",
      "RAW_PROVIDER",
      "OTHER",
    ],
  })
    .array()
    .notNull(),
  permissions: varchar("permissions", { enum: ["UPLOAD", "EDIT", "DELETE"] })
    .array()
    .notNull(),
  // -----
  userId: uuid("userId")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
});

export const scanMembersRelations = relations(scanMembers, ({ many }) => ({
  scans: many(scans),
}));
