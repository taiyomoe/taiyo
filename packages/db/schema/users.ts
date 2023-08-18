import type { AdapterAccount } from "@auth/core/adapters";
import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  primaryKey,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * Everything here is basically untouchable.
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
    name: varchar("name", { length: 255 }),
    email: varchar("email", { length: 255 }).notNull(),
    emailVerified: timestamp("emailVerified", { mode: "date" }).default(
      sql`CURRENT_TIMESTAMP(3)`,
    ),
    image: varchar("image", { length: 255 }),
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
    city: varchar("city", { length: 255 }),
    country: varchar("country", { length: 255 }),
    about: varchar("about", { length: 255 }),
    showSuggestiveContent: boolean("showSuggestiveContent").default(false),
    showAdultContent: boolean("showAdultContent").default(false),
    // -----
    role: varchar("role", {
      enum: ["USER", "MODERATOR", "UPLOADER", "ADMIN"],
    }).default("USER"),
    // -----
    userId: uuid("userId").notNull(),
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
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
    refresh_token: varchar("refresh_token", { length: 255 }),
    access_token: varchar("access_token", { length: 255 }),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: varchar("id_token", { length: 255 }),
    session_state: varchar("session_state", { length: 255 }),
    // -----
    userId: uuid("userId").notNull(),
  },
  (account) => ({
    compoundKey: primaryKey(account.provider, account.providerAccountId),
    userIdIdx: index("userId_idx").on(account.userId),
  }),
);

export const sessions = pgTable(
  "session",
  {
    sessionToken: uuid("sessionToken").notNull().primaryKey(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
    // -----
    userId: varchar("userId", { length: 255 }).notNull(),
  },
  (session) => ({
    userIdIdx: index("userId_idx").on(session.userId),
  }),
);

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
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

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users),
}));
