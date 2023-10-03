import type { InferSelectModel } from "drizzle-orm";

import type { mediaBanners } from "../schema/mediaBanners";
import type { mediaCovers } from "../schema/mediaCovers";
import type { medias } from "../schema/medias";
import type { mediaTitles } from "../schema/mediaTitles";
import type { MediaChapterWithUsers } from "./mediaChapter.types";

export type Media = InferSelectModel<typeof medias>;
export type Medias = Media[];
export type MediaRelations = {
  covers: MediaCovers;
  banners: MediaBanners;
  titles: MediaTitles;
  chapters: MediaChapterWithUsers;
};

export type MediaCover = InferSelectModel<typeof mediaCovers>;
export type MediaCovers = MediaCover[];
export type MediaWithCovers = Media & Pick<MediaRelations, "covers">;
export type MediasWithCovers = MediaWithCovers[];

export type MediaBanner = InferSelectModel<typeof mediaBanners>;
export type MediaBanners = MediaBanner[];
export type MediaWithBanners = Media & Pick<MediaRelations, "banners">;
export type MediasWithBanners = MediaWithBanners[];

export type MediaTitle = InferSelectModel<typeof mediaTitles>;
export type MediaTitles = MediaTitle[];
export type MediaWithTitles = Media & Pick<MediaRelations, "titles">;

export type MediaCommentAttachement = { id: string; extension: "png" | "gif" };
export type MediaCommentAttachements = MediaCommentAttachement[];

export type MediaWithRelations = Media & MediaRelations;
