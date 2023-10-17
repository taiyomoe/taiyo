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
import { type AdapterAccount } from "next-auth/adapters";

import { RolesEnum } from "../../types";
import { mediaChapters } from "./mediaChapters";

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
    role: varchar("role", {
      enum: ["USER", "MODERATOR", "UPLOADER_INTERN", "UPLOADER", "ADMIN"],
    })
      .default(RolesEnum.USER)
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
    preferedTitles: varchar("preferedTitles", {
      enum: ["ROMAJI", "ENGLISH", "NATIVE"],
    }).default("ROMAJI"),
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
  uploadedChapters: many(mediaChapters),
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, { fields: [userSettings.userId], references: [users.id] }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));
