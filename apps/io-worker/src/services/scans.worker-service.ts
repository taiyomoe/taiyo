import { db } from "@taiyomoe/db"
import { ScansIndexService } from "@taiyomoe/meilisearch/services"
import { Group } from "mangadex-full-api"
import { logger } from "~/logger"

const ensureGroups = async (input: string[], creatorId: string) => {
  const groups = await Group.getMultiple(...input)
  const scansIds: string[] = []
  const createdScansIds: string[] = []

  for (const group of groups) {
    const result = await db.scan.findFirst({
      where: { name: group.name, deletedAt: null },
    })

    if (result) {
      scansIds.push(result.id)

      continue
    }

    const scan = await db.scan.create({
      data: {
        name: group.name,
        description: group.description,
        website: group.website,
        discord: group.discord,
        twitter: group.twitter,
        email: group.contactEmail,
        creatorId: creatorId,
      },
    })

    logger.debug(`Created scan ${scan.id} from MangaDex group ${group.id}`)

    scansIds.push(scan.id)
    createdScansIds.push(scan.id)
  }

  if (createdScansIds.length) {
    await ScansIndexService.sync(db, createdScansIds)
  }

  return scansIds
}

export const ScansService = {
  ensureGroups,
}
