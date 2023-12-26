import type { MediaCover } from "@prisma/client"

export type MediaCoverVolume = {
  number: number
  covers: MediaCover[]
}
