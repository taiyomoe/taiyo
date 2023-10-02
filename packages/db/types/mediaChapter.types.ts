import type { InferSelectModel } from "drizzle-orm";

import type {
  mediaChapterComments,
  mediaChapters,
} from "../schema/mediaChapters";
import type { Media } from "./media.types";

export type MediaChapter = InferSelectModel<typeof mediaChapters>;
export type MediaChapters = MediaChapter[];

export type MediaChapterComment = InferSelectModel<typeof mediaChapterComments>;
export type MediaChapterComments = MediaChapterComment[];

export type MediaChapterGroup = MediaChapters;
export type MediaChapterGroups = MediaChapters[];

export type MediaChapterWithRelations = MediaChapter & {
  media: Media;
  comments: MediaChapterComments;
};
