import type { InferSelectModel } from "drizzle-orm";

import type { mediaBanners } from "../schema/mediaBanners";
import type { mediaChapters } from "../schema/mediaChapters";
import type { mediaCovers } from "../schema/mediaCovers";
import type { medias } from "../schema/medias";
import type { mediaTitles } from "../schema/mediaTitles";

export type Media = InferSelectModel<typeof medias>;
export type Medias = Media[];

export type MediaCover = InferSelectModel<typeof mediaCovers>;
export type MediaCovers = MediaCover[];
export type MediaWithCovers = Media & { covers: MediaCovers };
export type MediasWithCovers = MediaWithCovers[];

export type MediaBanner = InferSelectModel<typeof mediaBanners>;
export type MediaBanners = MediaBanner[];
export type MediaWithBanners = Media & { banners: MediaBanners };
export type MediasWithBanners = MediaWithBanners[];

export type MediaTitle = InferSelectModel<typeof mediaTitles>;
export type MediaTitles = MediaTitle[];
export type MediaWithTitles = Media & { titles: MediaTitles };

export type MediaChapter = InferSelectModel<typeof mediaChapters>;
export type MediaChapters = MediaChapter[];
// export type MediaWithChapters = Media & { chapters: MediaChapters };

export type MediaChapterPage = { id: string };
export type MediaChapterPages = MediaChapterPage[];

export type MediaCommentAttachement = { id: string; extension: "png" | "gif" };
export type MediaCommentAttachements = MediaCommentAttachement[];

export type MediaWithRelations = Media & {
  covers: MediaCovers;
  banners: MediaBanners;
  titles: MediaTitles;
  chapters: MediaChapters;
};
