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
  status: Media["status"];
  coverId: string;
  mainTitle: string;
};

export type UserLibraryMediaWithStatus = UserLibraryMedia & {
  libraryStatus: UserLibraryStatus;
};
