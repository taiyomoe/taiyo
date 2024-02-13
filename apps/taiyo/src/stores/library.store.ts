import { create } from "zustand"

import type {
  MediaLimited,
  UserLibraryMedia,
  UserLibraryStatus,
} from "~/lib/types"
import { LibraryUtils } from "~/lib/utils/library.utils"

export type LibraryState = {
  sidebarState: "show" | "hide"
  toggleSidebar: () => void

  reading: UserLibraryMedia[]
  rereading: UserLibraryMedia[]
  completed: UserLibraryMedia[]
  onHold: UserLibraryMedia[]
  dropped: UserLibraryMedia[]
  planToRead: UserLibraryMedia[]

  addEntries: (status: UserLibraryStatus, entries: UserLibraryMedia[]) => void
  getEntry: (mediaId: string) => UserLibraryMedia | undefined
  updateEntry: (
    media: MediaLimited | UserLibraryMedia,
    newStatus: UserLibraryStatus | "delete",
  ) => void
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  sidebarState: "hide",
  toggleSidebar: () => {
    set((state) => ({
      ...state,
      sidebarState: state.sidebarState === "show" ? "hide" : "show",
    }))
  },

  reading: [],
  rereading: [],
  completed: [],
  onHold: [],
  dropped: [],
  planToRead: [],

  addEntries: (status, entries) => {
    set((state) => ({
      ...state,
      [status]: entries,
    }))
  },
  getEntry: (mediaId) => LibraryUtils.getEntry(get(), mediaId),
  updateEntry: (media, newStatus) => {
    set((state) => {
      const newState = { ...state }
      const entry = LibraryUtils.getEntry(newState, media.id)!

      LibraryUtils.deleteEntry(newState, media.id)

      if (newStatus !== "delete") {
        newState[newStatus].push({
          id: (entry ?? media).id,
          updatedAt: new Date(),
          coverId: (entry ?? media).coverId,
          mainTitle: (entry ?? media).mainTitle,
          mediaStatus: entry
            ? entry.mediaStatus
            : "status" in media
              ? media.status
              : media.mediaStatus,
          libraryStatus: newStatus,
        })
      }

      return newState
    })
  },
}))
