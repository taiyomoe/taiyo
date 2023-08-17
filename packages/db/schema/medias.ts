import { relations, sql } from "drizzle-orm";
import {
  boolean,
  mysqlEnum,
  mysqlTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

import { mediaTags } from "./mediaTags";
import { mediaTitles } from "./mediaTitles";

export const medias = mysqlTable("medias", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("createdAt")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updatedAt").onUpdateNow(),
  deletedAt: timestamp("deletedAt"),
  // -----
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate"),
  // -----
  cover: varchar("cover", { length: 256 }).notNull(),
  banner: varchar("banner", { length: 256 }),
  trailer: varchar("trailer", { length: 256 }),
  // -----
  synopsis: text("synopsis"),
  isAdult: boolean("isAdult").default(false),
  format: mysqlEnum("format", [
    "TV",
    "TV_SHORT",
    "MOVIE",
    "SPECIAL",
    "OVA",
    "ONA",
  ]),
  season: mysqlEnum("season", ["WINTER", "SPRING", "SUMMER", "FALL"]),
  status: mysqlEnum("status", [
    "FINISHED",
    "RELEASING",
    "NOT_YET_RELEASED",
    "CANCELLED",
    "HIATUS",
  ]),
  source: mysqlEnum("source", [
    "ORIGINAL",
    "MANGA",
    "LIGHT_NOVEL",
    "VISUAL_NOVEL",
    "WEB_NOVEL",
    "VIDEO_GAME",
    "MANHWA",
    "MANHUA",
  ]),
  demography: mysqlEnum("demography", ["SHOUNEN", "SHOUJO", "SEINEN", "JOSEI"]),
  countryOfOrigin: mysqlEnum("countryOfOrigin", [
    "JAPAN",
    "KOREA",
    "CHINA",
    "USA",
    "FRANCE",
    "BRAZIL",
  ]),
  flag: mysqlEnum("flag", ["OK", "STAFF_ONLY", "VIP_ONLY"]),
});

export const mediasRelations = relations(medias, ({ many }) => ({
  tags: many(mediaTags),
  titles: many(mediaTitles),
}));
