import { Prisma } from "@prisma/client";
import type {
  Media,
  MediaChapter,
  MediaChapterComment,
  MediaCover,
  MediaTitle,
  Scan,
  User,
} from "@prisma/client";

export type MediaChapterPage = { id: string };
export type MediaCommentAttachement = { id: string; extension: "png" | "gif" };

export type LatestRelease = {
  id: MediaChapter["id"];
  createdAt: MediaChapter["createdAt"];
  number: MediaChapter["number"];
  volume: MediaChapter["volume"];
  title: MediaChapter["title"];
  media: {
    id: Media["id"];
    coverId: MediaCover["id"];
    mainTitle: MediaTitle["title"];
  };
  uploader: {
    id: User["id"];
    name: User["name"];
  };
  scans: {
    id: Scan["id"];
    name: Scan["name"];
  }[];
};

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

export type ReaderImage = { number: number; blobUrl: string };
export type ReaderSettings = {
  sidebar: {
    state: "show" | "hide";
    side: "left" | "right";
    openMode: "button" | "hover";
  };
  navbarMode: "fixed" | "sticky" | "hover";
  page: {
    mode: "single" | "longstrip";
    height: "fit" | "full";
    width: "fit" | "full";
    brightness: number;
  };
};

const mediaChapterWithRelations =
  Prisma.validator<Prisma.MediaChapterDefaultArgs>()({
    include: {
      scans: true,
    },
  });
export type MediaChapterWithRelations = Prisma.MediaChapterGetPayload<
  typeof mediaChapterWithRelations
>;
