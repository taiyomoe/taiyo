import { type Prisma, db } from "@taiyomoe/db"

import { omit } from "radash"
import type { CreateMediaInput } from "../schemas"
import { MediaNotFoundError } from "../utils/errors"
import { TrackersService } from "./"

const getById = async (id: string) => {
  const result = await db.media.findUnique({ where: { id } })

  if (!result) {
    throw new MediaNotFoundError()
  }

  return result
}

const create = async (
  client: Prisma.TransactionClient,
  input: CreateMediaInput,
  creatorId: string,
) => {
  const trackers = TrackersService.getFormatted(input, creatorId)
  const result = await client.media.create({
    data: {
      ...omit(input, ["mainTitle", "mdId", "alId", "malId", "cover"]),
      titles: {
        create: {
          title: input.mainTitle,
          isMainTitle: true,
          language: "en",
          priority: 1,
          creatorId,
        },
      },
      trackers: { createMany: { data: trackers } },
      creatorId,
    },
  })

  return result
}

export const MediasService = {
  getById,
  create,
}
