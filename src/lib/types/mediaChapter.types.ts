import type {
  Media,
  MediaChapter,
  MediaChapterComment,
  MediaTitle,
  Scan,
  User,
} from "@prisma/client";

export type MediaChapterPage = { id: string };
export type MediaCommentAttachement = { id: string; extension: "png" | "gif" };

export type MediaChapterLimitedBase = {
  id: MediaChapter["id"];
  number: MediaChapter["number"];
  title: MediaChapter["title"];
};

export type MediaChapterLimited = {
  id: MediaChapter["id"];
  title: MediaChapter["title"];
  number: MediaChapter["number"];
  volume: MediaChapter["volume"];
  pages: MediaChapter["pages"];
  previousChapter: MediaChapterLimitedBase | null;
  nextChapter: MediaChapterLimitedBase | null;
  // ----- RELATIONS
  uploader: {
    id: User["id"];
    name: User["name"];
  };
  media: {
    id: Media["id"];
    type: Media["type"];
    title: MediaTitle["title"];
    chapters: MediaChapterLimitedBase[];
  };
  scans: {
    id: Scan["id"];
    name: Scan["name"];
  }[];
  comments: MediaChapterComment[];
};

export type MediaChapterNavigation = {
  previousPage: number | null;
  currentPage: number;
  nextPage: number | null;
};

export type ReaderImage = { number: number; url: string; blobUrl: string };
