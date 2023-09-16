import type { InferSelectModel } from "drizzle-orm";

import type { mediaBanners } from "../schema/mediaBanners";
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

export type MediaWithRelations = Media & {
  covers: MediaCovers;
  banners: MediaBanners;
  titles: MediaTitles;
};
