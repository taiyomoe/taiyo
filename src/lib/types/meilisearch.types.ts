import type { Media, MediaCover, MediaTitle, Scan } from "@prisma/client";

export type MediasIndexItem = {
  id: Media["id"];
  synopsis: Media["synopsis"];
  titles: Pick<
    MediaTitle,
    "title" | "language" | "priority" | "isAcronym" | "isMainTitle"
  >[];
  mainCoverId: MediaCover["id"];
};

export type ScansIndexItem = {
  id: Scan["id"];
  name: Scan["name"];
};
