export type MediaLibraryStatus =
  | "reading"
  | "rereading"
  | "completed"
  | "onHold"
  | "dropped"
  | "planToRead";

export type UserLibraryMedia = {
  id: string;
  updatedAt: Date;
  coverId: string;
  mainTitle: string;
};
