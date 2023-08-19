import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  json,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { medias } from "./medias";
import { scans } from "./scans";
import { users } from "./users";

export const mediaChapters = pgTable(
  "mediaChapters",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
    deletedAt: timestamp("deletedAt"),
    // -----
    title: text("title"),
    number: text("number").notNull(),
    volume: text("volume"),
    language: varchar("language", {
      length: 255,
      enum: ["ENGLISH", "JAPANESE", "SPANISH", "PORTUGUESE", "FRENCH"],
    }),
    pages: json("pages").$type<MediaChapterPages>().notNull(),
    // -----
    isSuggestive: boolean("isSuggestive").default(false),
    isAdult: boolean("isAdult").default(false),
    flag: varchar("flag", { enum: ["OK", "STAFF_ONLY", "VIP_ONLY", "LOCKED"] }),
    // -----
    mediaId: uuid("mediaId")
      .references(() => medias.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("userId")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
  },
  (mediaChapter) => ({
    mediaIdIdx: index("mediaId_idx").on(mediaChapter.mediaId),
  }),
);

export const mediaChapterComments = pgTable(
  "mediaChapterComments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
    deletedAt: timestamp("deletedAt"),
    // -----
    content: text("content").notNull(),
    attachments: json("attachments")
      .$type<MediaCommentAttachements>()
      .notNull(),
    // -----
    parentCommentId: uuid("parentCommentId"),
    mediaChapterId: uuid("mediaChapterId")
      .references(() => mediaChapters.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("userId")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
  },
  (mediaChapterComment) => ({
    mediaChapterIdIdx: index("mediaChapterId_idx").on(
      mediaChapterComment.mediaChapterId,
    ),
  }),
);

export const mediaChaptersRelations = relations(mediaChapters, ({ many }) => ({
  scans: many(scans),
}));

export const mediaChapterCommentsRelations = relations(
  mediaChapterComments,
  ({ one, many }) => ({
    replies: many(mediaChapterComments),
    parentComment: one(mediaChapterComments, {
      fields: [mediaChapterComments.parentCommentId],
      references: [mediaChapterComments.id],
    }),
  }),
);

export type MediaChapterPage = { id: string };
export type MediaChapterPages = MediaChapterPage[];

export type MediaCommentAttachement = { id: string; extension: "png" | "gif" };
export type MediaCommentAttachements = MediaCommentAttachement[];
