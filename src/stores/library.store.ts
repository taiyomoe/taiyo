import { create } from "zustand";

import type { MediaLibraryStatus, UserLibraryMedia } from "~/lib/types";
import { LibraryUtils } from "~/lib/utils/library.utils";

export type LibraryState = {
  reading: UserLibraryMedia[];
  rereading: UserLibraryMedia[];
  completed: UserLibraryMedia[];
  onHold: UserLibraryMedia[];
  dropped: UserLibraryMedia[];
  planToRead: UserLibraryMedia[];

  populate: (status: MediaLibraryStatus, entries: UserLibraryMedia[]) => void;

  updateEntry: (
    mediaId: string,
    newStatus: MediaLibraryStatus | "delete",
  ) => void;
};

export const useLibraryStore = create<LibraryState>((set) => ({
  reading: [],
  rereading: [],
  completed: [],
  onHold: [],
  dropped: [],
  planToRead: [],

  populate: (status, entries) => {
    set((state) => {
      const newState = { ...state };
      newState[status] = entries;

      return newState;
    });
  },

  updateEntry: (mediaId, newStatus) => {
    set((state) => {
      const newState = { ...state };
      const entry = LibraryUtils.getEntry(newState, mediaId)!;

      LibraryUtils.deleteEntry(newState, mediaId);

      if (newStatus !== "delete") {
        newState[newStatus].push({
          ...entry,
          updatedAt: new Date(),
        });
      }

      return newState;
    });
  },
}));
