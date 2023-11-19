import type { Tags } from "~/lib/constants";

declare global {
  namespace PrismaJson {
    type MediaChapterPage = { id: string };
    type MediaCommentAttachement = { id: string; extension: "png" | "gif" };
    type MediaTag = { key: keyof typeof Tags; isSpoiler: boolean };
  }
}
