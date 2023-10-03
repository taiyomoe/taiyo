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

import type { MediaCommentAttachements } from "../types/media.types";
import type { MediaChapterPages } from "../types/mediaChapter.types";
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
    flag: varchar("flag", {
      enum: ["OK", "STAFF_ONLY", "VIP_ONLY", "LOCKED"],
    }).default("OK"),
    // -----
    userId: uuid("userId")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    mediaId: uuid("mediaId")
      .references(() => medias.id, { onDelete: "cascade" })
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

export const mediaChaptersRelations = relations(
  mediaChapters,
  ({ one, many }) => ({
    media: one(medias, {
      fields: [mediaChapters.mediaId],
      references: [medias.id],
    }),
    user: one(users, {
      fields: [mediaChapters.userId],
      references: [users.id],
    }),
    scans: many(scans),
    comments: many(mediaChapterComments),
  }),
);

export const mediaChapterCommentsRelations = relations(
  mediaChapterComments,
  ({ one, many }) => ({
    chapter: one(mediaChapters, {
      fields: [mediaChapterComments.mediaChapterId],
      references: [mediaChapters.id],
    }),
    parentComment: one(mediaChapterComments, {
      fields: [mediaChapterComments.parentCommentId],
      references: [mediaChapterComments.id],
    }),
    replies: many(mediaChapterComments),
  }),
);
