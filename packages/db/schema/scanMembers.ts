import { relations, sql } from "drizzle-orm";
import {
  int,
  json,
  mysqlTable,
  serial,
  timestamp,
} from "drizzle-orm/mysql-core";

import { scans } from "./scans";
import { users } from "./users";

export const scanMembers = mysqlTable("scanMembers", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("createdAt")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt").onUpdateNow(),
  deletedAt: timestamp("deletedAt"),
  // -----
  roles: json("roles")
    .$type<
      [
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
      ]
    >()
    .notNull(),
  permissions: json("permissions")
    .$type<["UPLOAD", "EDIT", "DELETE"]>()
    .notNull(),
  // -----
  userId: int("userId").notNull(),
});

export const scanMembersRelations = relations(scanMembers, ({ many, one }) => ({
  scans: many(scans),
  user: one(users, {
    fields: [scanMembers.userId],
    references: [users.id],
  }),
}));
