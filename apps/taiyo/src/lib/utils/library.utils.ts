import type { UserLibrary } from "@prisma/client"
import type { UserLibraryStatus } from "@taiyomoe/types"
import type { LibraryState } from "~/stores"

const getStatusKeys = () =>
  [
    "reading",
    "rereading",
    "completed",
    "onHold",
    "dropped",
    "planToRead",
  ] as UserLibraryStatus[]

const getStatuses = <T extends UserLibrary | LibraryState>(userLibrary: T) => ({
  reading: userLibrary.reading as T["reading"],
  rereading: userLibrary.rereading as T["rereading"],
  completed: userLibrary.completed as T["completed"],
  onHold: userLibrary.onHold as T["onHold"],
  dropped: userLibrary.dropped as T["dropped"],
  planToRead: userLibrary.planToRead as T["planToRead"],
})

const getStatusLabel = (input?: string | null) => {
  switch (input) {
    case "reading":
      return "Lendo"
    case "rereading":
      return "Relendo"
    case "completed":
      return "Completo"
    case "onHold":
      return "Pausado"
    case "dropped":
      return "Dropado"
    case "planToRead":
      return "Planeja ler"
    case "delete":
      return "Remover da biblioteca"
    default:
      return "Adicionar à biblioteca"
  }
}

const getEntry = <T extends UserLibrary | LibraryState>(
  userLibrary: T,
  mediaId: string,
) => {
  const statusKeys = getStatusKeys()

  for (const status of statusKeys) {
    const media = userLibrary[status].find((entry) =>
      "id" in entry ? entry.id === mediaId : entry.mediaId === mediaId,
    )

    if (media)
      return { ...media, libraryStatus: status } as T[typeof status][number]
  }
}

const deleteEntry = (
  userLibrary: UserLibrary | LibraryState,
  mediaId: string,
) => {
  for (const list of [
    userLibrary.reading,
    userLibrary.rereading,
    userLibrary.planToRead,
    userLibrary.completed,
    userLibrary.onHold,
    userLibrary.dropped,
  ]) {
    const index = list.findIndex((m) =>
      "id" in m ? m.id === mediaId : m.mediaId === mediaId,
    )

    if (index !== -1) list.splice(index, 1)
  }
}

export const LibraryUtils = {
  getStatusKeys,
  getStatuses,
  getStatusLabel,
  getEntry,
  deleteEntry,
}
