import type {
  Media,
  MediaBanner,
  MediaChapter,
  MediaCover,
  MediaTitle,
  Scan,
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
  // -----
  totalPages: number;
};
