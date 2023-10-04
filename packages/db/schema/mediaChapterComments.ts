import { relations } from "drizzle-orm";
import {
  index,
  json,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import type { MediaCommentAttachements } from "../types";
import { mediaChapters } from "./mediaChapters";
import { users } from "./users";

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
