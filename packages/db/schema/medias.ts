import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { mediaBanners } from "./mediaBanners";
import { mediaChapters } from "./mediaChapters";
import { mediaCovers } from "./mediaCovers";
import { mediaTags } from "./mediaTags";
import { mediaTitles } from "./mediaTitles";

export const medias = pgTable("medias", {
  id: uuid("id").defaultRandom().primaryKey(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  deletedAt: timestamp("deletedAt"),
  // -----
  mdId: uuid("mdId"),
  malId: integer("malId"),
  alId: integer("alId"),
  // -----
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate"),
  // -----
  synopsis: text("synopsis"),
  isAdult: boolean("isAdult").default(false),
  oneShot: boolean("oneShot").default(false),
  trailer: text("trailer"),
  type: varchar("type", {
    enum: ["MANGA", "MANHWA", "MANHUA", "LIGHT_NOVEl", "OTHER"],
  }),
  status: varchar("status", {
    enum: ["FINISHED", "RELEASING", "NOT_YET_RELEASED", "CANCELLED", "HIATUS"],
  }),
  source: varchar("source", {
    enum: [
      "ORIGINAL",
      "LIGHT_NOVEL",
      "VISUAL_NOVEL",
      "WEB_NOVEL",
      "VIDEO_GAME",
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
  }).default("OK"),
});

export const mediasRelations = relations(medias, ({ many }) => ({
  tags: many(mediaTags),
  titles: many(mediaTitles),
  chapters: many(mediaChapters),
  covers: many(mediaCovers),
  banners: many(mediaBanners),
}));
