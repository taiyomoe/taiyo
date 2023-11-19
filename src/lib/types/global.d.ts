import type { TAGS_PT } from "~/lib/i18n/tags";

declare global {
  namespace PrismaJson {
    type MediaChapterPage = { id: string };
    type MediaCommentAttachement = { id: string; extension: "png" | "gif" };
    type MediaTag = { key: keyof typeof TAGS_PT; isSpoiler: boolean };
  }
}
