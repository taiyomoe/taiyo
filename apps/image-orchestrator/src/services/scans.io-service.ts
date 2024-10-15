import { db } from "@taiyomoe/db"
import { ScansIndexService } from "@taiyomoe/meilisearch/services"
import type { Group } from "mangadex-full-api"
import { ScansNotFoundError } from "../utils/errors"

const getByIds = async (ids: string[]) => {
  const result = await db.scan.findMany({
    where: { id: { in: ids } },
  })

  if (result.length !== ids.length) {
    throw new ScansNotFoundError()
  }

  return result
}

const getByName = async (name: string) => {
  const result = await db.scan.findFirst({
    where: { name },
  })

  if (!result) {
    throw new ScansNotFoundError()
  }

  return result
}

const insert = async (input: Group, creatorId: string) => {
  const result = await db.scan.create({
    data: {
      name: input.name,
      description: input.description,
      website: input.website,
      discord: input.discord,
      twitter: input.twitter,
      email: input.contactEmail,
      creatorId,
    },
  })

  await ScansIndexService.sync(db, [result.id])

  return result
}

export const ScansService = {
  getByIds,
  getByName,
  insert,
}
