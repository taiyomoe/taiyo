import type { InferSelectModel } from "drizzle-orm";
import { relations } from "drizzle-orm";
import {
  boolean,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import type { MediaBanners } from "./mediaBanners";
import { mediaBanners } from "./mediaBanners";
import { mediaChapters } from "./mediaChapters";
import type { MediaCovers } from "./mediaCovers";
import { mediaCovers } from "./mediaCovers";
import { mediaTags } from "./mediaTags";
import type { MediaTitles } from "./mediaTitles";
import { mediaTitles } from "./mediaTitles";
import { mediaTrackers } from "./mediaTrackers";

export const medias = pgTable("medias", {
  id: uuid("id").defaultRandom().primaryKey(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  deletedAt: timestamp("deletedAt"),
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
  covers: many(mediaCovers),
  banners: many(mediaBanners),
  tags: many(mediaTags),
  titles: many(mediaTitles),
  chapters: many(mediaChapters),
  trackers: many(mediaTrackers),
}));

export type Media = InferSelectModel<typeof medias>;
export type Medias = Media[];
export type MediaWithCovers = Media & { covers: MediaCovers };
export type MediaWithBanners = Media & { banners: MediaBanners };
export type MediaWithTitles = Media & { titles: MediaTitles };

export type MediaWithRelations = Media & {
  covers: MediaCovers;
  banners: MediaBanners;
  titles: MediaTitles;
};
