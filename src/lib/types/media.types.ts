import { Prisma } from "@prisma/client";
import type {
  Media,
  MediaBanner,
  MediaChapter,
  MediaCover,
  MediaTitle,
  MediaTracker,
  Scan,
  User,
} from "@prisma/client";

import type { UserLibraryStatus } from "~/lib/types/library.types";

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
  // ----- USER PROGRESSION
  completed: boolean | null;
  // ----- RELATIONS
  uploader: {
    id: User["id"];
    name: User["name"];
  };
  scans: {
    id: Scan["id"];
    name: Scan["name"];
  }[];
};

export type MediaLimitedChapterPagination = {
  chapters: MediaLimitedChapter[];
  // -----
  totalPages: number;
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
  status: Media["status"];
  genres: Media["genres"];
  tags: PrismaJson.MediaTag[];
  // -----
  userLibrary: { status: UserLibraryStatus; updatedAt: string } | null;
  // -----
  mainTitle: MediaTitle["title"];
  titles: Pick<
    MediaTitle,
    "title" | "language" | "priority" | "isAcronym" | "isMainTitle"
  >[];
  coverId: MediaCover["id"];
  bannerId: MediaBanner["id"] | null;
  trackers: Pick<MediaTracker, "tracker" | "externalId">[];
};

export type SearchedMedia = {
  id: Media["id"];
  // -----
  synopsis: Media["synopsis"];
  // -----
  title: MediaTitle["title"];
  coverId: MediaCover["id"];
};

export type MediaTabs = "info" | "chapters";
export type MediaEditTabs = "info" | "covers" | "banners" | "stats";

const mediaWithRelations = Prisma.validator<Prisma.MediaDefaultArgs>()({
  include: {
    covers: true,
    banners: true,
    titles: true,
    trackers: true,
    creator: true,
  },
});
export type MediaWithRelations = Prisma.MediaGetPayload<
  typeof mediaWithRelations
>;
