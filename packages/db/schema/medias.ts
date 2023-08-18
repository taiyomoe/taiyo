import { relations } from "drizzle-orm";
import {
  boolean,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { mediaChapters } from "./mediaChapters";
import { mediaTags } from "./mediaTags";
import { mediaTitles } from "./mediaTitles";

export const medias = pgTable("medias", {
  id: uuid("id").defaultRandom().primaryKey(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  deletedAt: timestamp("deletedAt"),
  // -----
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate"),
  // -----
  cover: varchar("cover", { length: 255 }).notNull(),
  banner: varchar("banner", { length: 255 }),
  trailer: varchar("trailer", { length: 255 }),
  // -----
  synopsis: text("synopsis"),
  isAdult: boolean("isAdult").default(false),
  format: varchar("format", {
    enum: ["TV", "TV_SHORT", "MOVIE", "SPECIAL", "OVA", "ONA"],
  }),
  season: varchar("season", {
    enum: ["WINTER", "SPRING", "SUMMER", "FALL"],
  }),
  status: varchar("status", {
    enum: ["FINISHED", "RELEASING", "NOT_YET_RELEASED", "CANCELLED", "HIATUS"],
  }),
  source: varchar("source", {
    enum: [
      "ORIGINAL",
      "MANGA",
      "LIGHT_NOVEL",
      "VISUAL_NOVEL",
      "WEB_NOVEL",
      "VIDEO_GAME",
      "MANHWA",
      "MANHUA",
    ],
  }),
  demography: varchar("demography", {
    enum: ["SHOUNEN", "SHOUJO", "SEINEN", "JOSEI"],
  }),
  countryOfOrigin: varchar("countryOfOrigin", {
    enum: ["JAPAN", "KOREA", "CHINA", "USA", "FRANCE", "BRAZIL"],
  }),
  flag: varchar("flag", {
    enum: ["OK", "STAFF_ONLY", "VIP_ONLY", "LOCKED"],
  }),
});

export const mediasRelations = relations(medias, ({ many }) => ({
  tags: many(mediaTags),
  titles: many(mediaTitles),
  chapters: many(mediaChapters),
}));
