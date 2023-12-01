import type { Media } from "@prisma/client";

export type UserLibraryStatus =
  | "reading"
  | "rereading"
  | "completed"
  | "onHold"
  | "dropped"
  | "planToRead";

export type UserLibraryStatusWithDelete = UserLibraryStatus | "delete";

export type UserLibraryMedia = {
  id: string;
  updatedAt: Date;
  coverId: string;
  mainTitle: string;
  mediaStatus: Media["status"];
  libraryStatus: UserLibraryStatus;
};
