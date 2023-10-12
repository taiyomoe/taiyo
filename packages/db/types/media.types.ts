import type { InferSelectModel } from "drizzle-orm";

import type { mediaBanners } from "../schema/mediaBanners";
import type { mediaCovers } from "../schema/mediaCovers";
import type { medias } from "../schema/medias";
import type { mediaTitles } from "../schema/mediaTitles";
import type { MediaChapter } from "./mediaChapter.types";
import type { Scan } from "./scan.types";
import type { User } from "./user.types";

export type Media = InferSelectModel<typeof medias>;
export type MediaCover = InferSelectModel<typeof mediaCovers>; // Used only below
export type MediaBanner = InferSelectModel<typeof mediaBanners>; // Used only below
export type MediaTitle = InferSelectModel<typeof mediaTitles>; // Used only below

export type LatestMedia = {
  id: Media["id"];
  coverId: MediaCover["id"];
};

// Used to display media chapter cards
export type MediaLimitedChapter = {
  id: MediaChapter["id"];
  createdAt: MediaChapter["createdAt"];
  title: MediaChapter["title"];
  number: MediaChapter["number"];
  volume: MediaChapter["volume"];
  // ----- RELATIONS
  user: {
    id: User["id"];
    name: User["name"];
  };
  scans: {
    id: Scan["id"];
    name: Scan["name"];
  }[];
};

export type MediaChapterGroup = {
  number: MediaChapter["number"];
  chapters: MediaLimitedChapter[];
};
export type MediaChapterGroups = MediaChapterGroup[];

export type MediaLimited = {
  id: Media["id"];
  // -----
  synopsis: Media["synopsis"];
  // -----
  title: MediaTitle["title"];
  coverId: MediaCover["id"];
  bannerId: MediaBanner["id"] | null;
  chapters: MediaLimitedChapter[];
};
