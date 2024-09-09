import { type Prisma, db } from "@taiyomoe/db"
import { omit } from "radash"
import type { CreateMediaInput } from "../schemas"
import { MediaNotFoundError } from "../utils/errors"

const getById = async (id: string) => {
  const result = await db.media.findUnique({ where: { id } })

  if (!result) {
    throw new MediaNotFoundError()
  }

  return result
}

const create = (
  client: Prisma.TransactionClient,
  input: CreateMediaInput,
  creatorId: string,
) => {
  const trackers: Prisma.MediaTrackerCreateManyMediaInput[] = []

  if (input.mdId) {
    trackers.push({
      tracker: "MANGADEX",
      externalId: input.mdId,
      creatorId,
    })
  }

  if (input.alId) {
    trackers.push({
      tracker: "ANILIST",
      externalId: input.alId.toString(),
      creatorId,
    })
  }

  if (input.malId) {
    trackers.push({
      tracker: "MYANIMELIST",
      externalId: input.malId.toString(),
      creatorId,
    })
  }

  return client.media.create({
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
}

export const MediasService = {
  getById,
  create,
}
