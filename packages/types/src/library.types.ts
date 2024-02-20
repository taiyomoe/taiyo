import type { Media } from "@prisma/client"
import { MediaLimited } from "."

export type UserLibraryStatus =
  | "reading"
  | "rereading"
  | "completed"
  | "onHold"
  | "dropped"
  | "planToRead"

export type UserLibraryStatusWithDelete = UserLibraryStatus | "delete"

export type UserLibraryMedia = {
  id: string
  updatedAt: Date
  coverId: string
  mainTitle: string
  mediaStatus: Media["status"]
  libraryStatus: UserLibraryStatus
}

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
