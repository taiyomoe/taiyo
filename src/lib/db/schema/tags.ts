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
import { users } from "./users";

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
  creatorId: uuid("creatorId")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  deleterId: uuid("deleterId").references(() => users.id, {
    onDelete: "cascade",
  }),
});

export const tagsRelations = relations(tags, ({ one, many }) => ({
  creator: one(users, {
    fields: [tags.creatorId],
    references: [users.id],
  }),
  deleter: one(users, {
    fields: [tags.deleterId],
    references: [users.id],
  }),
  mediaTags: many(mediaTags),
}));
