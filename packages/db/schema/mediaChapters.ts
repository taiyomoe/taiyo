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

import type { MediaChapterPage } from "../types/mediaChapter.types";
import { mediaChapterComments } from "./mediaChapterComments";
import { mediaChapterScans } from "./mediaChapterScans";
import { medias } from "./medias";
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
    pages: json("pages").$type<MediaChapterPage[]>().notNull(),
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
    scans: many(mediaChapterScans),
    comments: many(mediaChapterComments),
  }),
);
