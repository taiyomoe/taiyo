import type { AdapterAccount } from "@auth/core/adapters";
import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { roles } from "./roles";

/**
 * Everything here (except for `userSettings`) is basically untouchable.
 * The Drizzle Adapter for NextAuth requires this exact schema to work.
 */

export const users = pgTable(
  "user",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
    deletedAt: timestamp("deletedAt"),
    // -----
    name: text("name"),
    email: text("email").notNull(),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
    image: text("image"),
    // -----
    roleId: uuid("roleId")
      .references(() => roles.id)
      /**
       * This is the hard-coded default USER role ID, which is seeded in the database.
       */
      .default("7bf9872c-1c80-4e78-be71-6fa0d3dc88d1")
      .notNull(),
  },
  (user) => ({
    idIdx: index("id_idx").on(user.id),
  }),
);

export const userSettings = pgTable(
  "userSettings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
    deletedAt: timestamp("deletedAt"),
    // -----
    birthDate: timestamp("birthDate", { mode: "date" }),
    gender: varchar("gender", { enum: ["MALE", "FEMALE", "OTHER"] }),
    city: text("city"),
    country: text("country"),
    about: text("about"),
    showSuggestiveContent: boolean("showSuggestiveContent").default(false),
    showAdultContent: boolean("showAdultContent").default(false),
    // -----
    userId: uuid("userId")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
  },
  (userSettings) => ({
    userIdIdx: index("userId_idx").on(userSettings.userId),
  }),
);

export const accounts = pgTable(
  "account",
  {
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
    deletedAt: timestamp("deletedAt"),
    // -----
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
    // -----
    userId: uuid("userId")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
  },
  (account) => ({
    compoundKey: primaryKey(account.provider, account.providerAccountId),
  }),
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").notNull().primaryKey(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
  // -----
  userId: uuid("userId")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.identifier, vt.token),
  }),
);

export const usersRelations = relations(users, ({ one, many }) => ({
  accounts: many(accounts),
  settings: one(userSettings, {
    fields: [users.id],
    references: [userSettings.userId],
  }),
}));
