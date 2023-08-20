import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const roles = pgTable("roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  deletedAt: timestamp("deletedAt"),
  // -----
  name: text("name").notNull().unique(),
  permissions: text("permissions").array().$type<Permissions>().notNull(),
});

export const permissionsArray = [
  "TAG:CREATE",
  "TAG:UPDATE",
  "TAG:DELETE",
  // -----
  "TRACKER:CREATE",
  "TRACKER:UPDATE",
  "TRACKER:DELETE",
  // -----
  "MEDIA:CREATE",
  "MEDIA:UPDATE",
  "MEDIA:DELETE",
  // -----
  "MEDIA_TAG:CREATE",
  "MEDIA_TAG:DELETE",
  // -----
  "MEDIA_TITLE:CREATE",
  "MEDIA_TITLE:UPDATE",
  "MEDIA_TITLE:DELETE",
  // -----
  "MEDIA_BANNER:CREATE",
  "MEDIA_BANNER:DELETE",
  // -----
  "MEDIA_COVER:CREATE",
  "MEDIA_COVER:UPDATE",
  "MEDIA_COVER:DELETE",
  // -----
  "MEDIA_CHAPTER:CREATE",
  "MEDIA_CHAPTER:UPDATE",
  "MEDIA_CHAPTER:DELETE",
  // -----
  "MEDIA_CHAPTER_COMMENT:UPDATE", // all users can update their own comments, but only admins can update other users' comments
  "MEDIA_CHAPTER_COMMENT:DELETE", // same
  // -----
  "SCAN:CREATE",
  "SCAN:UPDATE",
  "SCAN:DELETE",
  // -----
  "SCAN_MEMBER:CREATE",
  "SCAN_MEMBER:UPDATE",
  "SCAN_MEMBER:DELETE",
] as const;

export type Permission = (typeof permissionsArray)[number];
export type Permissions = Permission[];
