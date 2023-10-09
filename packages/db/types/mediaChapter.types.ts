import type { InferSelectModel } from "drizzle-orm";

import type { mediaChapterComments } from "../schema/mediaChapterComments";
import type { mediaChapters } from "../schema/mediaChapters";
import type { Media, MediaTitle } from "./media.types";
import type { Scan } from "./scan.types";
import type { User } from "./user.types";

export type MediaChapter = InferSelectModel<typeof mediaChapters>;
export type MediaChapters = MediaChapter[];
export type MediaChapterRelations = {
  user: User;
  media: Media;
  comments: MediaChapterComments;
};

export type MediaChapterPage = { id: string };
export type MediaChapterPages = MediaChapterPage[];

export type MediaChapterComment = InferSelectModel<typeof mediaChapterComments>;
export type MediaChapterComments = MediaChapterComment[];

export type MediaChapterGroup = MediaChapterWithUser[];
export type MediaChapterGroups = MediaChapterGroup[];

export type MediaChapterWithUser = MediaChapter &
  Pick<MediaChapterRelations, "user">;
export type MediaChapterWithUsers = MediaChapterWithUser[];

export type MediaChapterWithRelations = MediaChapter & MediaChapterRelations;

export type MediaChapterLimited = {
  id: MediaChapter["id"];
  title: MediaChapter["title"];
  number: MediaChapter["number"];
  volume: MediaChapter["volume"];
  pages: MediaChapter["pages"];
  // ----- RELATIONS
  user: {
    id: User["id"];
    name: User["name"];
  };
  media: {
    id: Media["id"];
    type: Media["type"];
    title: MediaTitle["title"];
    chapters: {
      number: MediaChapter["number"];
      title: MediaChapter["title"];
    }[];
  };
  scans: {
    id: Scan["id"];
    name: Scan["name"];
  }[];
  comments: MediaChapterComments;
};
