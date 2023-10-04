import type { InferSelectModel } from "drizzle-orm";

import type { mediaChapterComments } from "../schema/mediaChapterComments";
import type { mediaChapters } from "../schema/mediaChapters";
import type { Media } from "./media.types";
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
