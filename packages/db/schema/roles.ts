import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import type { Permissions } from "../types";

export const roles = pgTable("roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  deletedAt: timestamp("deletedAt"),
  // -----
  name: text("name").notNull().unique(),
  permissions: text("permissions").array().$type<Permissions>().notNull(),
});
