import { relations, sql } from "drizzle-orm";
import {
  boolean,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

import { medias } from "./medias";
import { scans } from "./scans";
import { users } from "./users";

export const mediaChapters = mysqlTable("mediaChapters", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("createdAt")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt").onUpdateNow(),
  deletedAt: timestamp("deletedAt"),
  // -----
  title: text("title"),
  number: varchar("number", { length: 256 }).notNull(),
  volume: varchar("volume", { length: 256 }),
  language: mysqlEnum("language", [
    "ENGLISH",
    "JAPANESE",
    "SPANISH",
    "PORTUGUESE",
    "FRENCH",
  ]),
  pages: json("pages").$type<MediaChapterPage[]>().notNull(),
  // -----
  isAdult: boolean("isAdult").default(false),
  // -----
  mediaId: int("mediaId").notNull(),
  uploaderId: int("uploaderId").notNull(),
});

export const mediaChaptersComments = mysqlTable("mediaChaptersComments", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("createdAt")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt").onUpdateNow(),
  deletedAt: timestamp("deletedAt"),
  // -----
  content: text("content").notNull(),
  // -----
  mediaChapterId: int("mediaChapterId").notNull(),
  userId: int("userId").notNull(),
});

export const mediaChaptersRelations = relations(
  mediaChapters,
  ({ one, many }) => ({
    scans: many(scans),
    media: one(medias, {
      fields: [mediaChapters.mediaId],
      references: [medias.id],
    }),
    uploader: one(users, {
      fields: [mediaChapters.uploaderId],
      references: [users.id],
    }),
  }),
);

export const mediaChaptersCommentsRelations = relations(
  mediaChaptersComments,
  ({ one }) => ({
    mediaChapter: one(mediaChapters, {
      fields: [mediaChaptersComments.mediaChapterId],
      references: [mediaChapters.id],
    }),
    user: one(users, {
      fields: [mediaChaptersComments.userId],
      references: [users.id],
    }),
  }),
);

export type MediaChapterPage = {
  id: string;
}[];
