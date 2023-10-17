import type { InferSelectModel } from "drizzle-orm";

import type { mediaChapterComments } from "~/lib/db/schema/mediaChapterComments";
import type { mediaChapters } from "~/lib/db/schema/mediaChapters";
import type { Media, MediaTitle } from "./media.types";
import type { Scan } from "./scan.types";
import type { User } from "./user.types";

export type MediaChapter = InferSelectModel<typeof mediaChapters>;
export type MediaChapterComment = InferSelectModel<typeof mediaChapterComments>;

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
