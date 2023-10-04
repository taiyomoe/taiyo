import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { mediaTags } from "./mediaTags";

export const tags = pgTable("tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  deletedAt: timestamp("deletedAt"),
  // -----
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  // -----
  isAdult: boolean("isAdult").default(false).notNull(),
  // -----
  alId: integer("alId").notNull(),
});

export const tagsRelations = relations(tags, ({ many }) => ({
  mediaTags: many(mediaTags),
}));
