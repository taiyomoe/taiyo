import type { Languages, Media, Prisma } from "@prisma/client"

export type ImportMediaInitialMessageInput = {
  payload: Prisma.MediaCreateInput
  mainCoverPayload: {
    url: string
    volume: number
    language: Languages
  }
}

export type ImportMediaInitialMessageOutput = Media
