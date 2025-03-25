import { db } from "@taiyomoe/db"
import { GroupsIndexService } from "@taiyomoe/meilisearch/services"
import { Group } from "mangadex-full-api"

const ensureGroups = async (input: string[], creatorId: string) => {
  const mdGroups = await Group.getMultiple(input)
  const groupIds: string[] = []
  const createdgroupIds: string[] = []

  for (const mdGroup of mdGroups) {
    const result = await db.group.findFirst({
      where: { name: mdGroup.name, deletedAt: null },
    })

    if (result) {
      groupIds.push(result.id)

      continue
    }

    const group = await db.group.create({
      data: {
        name: mdGroup.name,
        description: mdGroup.description,
        website: mdGroup.website,
        discord: mdGroup.discord,
        x: mdGroup.twitter,
        email: mdGroup.contactEmail,
        creatorId,
      },
    })

    // logger.debug(`Created group ${group.id} from MangaDex group ${mdGroup.id}`)

    groupIds.push(group.id)
    createdgroupIds.push(group.id)
  }

  if (createdgroupIds.length) {
    await GroupsIndexService.sync(db, createdgroupIds)
  }

  return groupIds
}

export const GroupsService = {
  ensureGroups,
}
