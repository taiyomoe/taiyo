import type {
  Media,
  MediaBanner,
  MediaChapter,
  MediaCover,
  MediaTag,
  MediaTitle,
  MediaTracker,
  Scan,
  Tag,
  User,
} from "@prisma/client";

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
  genres: Media["genres"];
  // -----
  mainTitle: MediaTitle["title"];
  titles: Pick<MediaTitle, "title" | "language" | "isAcronym" | "priority">[];
  coverId: MediaCover["id"];
  bannerId: MediaBanner["id"] | null;
  tags: Array<Pick<MediaTag, "isSpoiler"> & Pick<Tag, "name">>;
  trackers: Pick<MediaTracker, "tracker" | "externalId">[];
};

export type MediaTabs = "info" | "chapters";
