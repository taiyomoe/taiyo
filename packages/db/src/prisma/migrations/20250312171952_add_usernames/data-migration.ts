import { faker } from "@faker-js/faker"
import type { Prisma } from "@prisma/client"
import { normalizeDisplayName, normalizeUsername } from "@taiyomoe/utils"

export default async (tx: Prisma.TransactionClient) => {
  const takenUsernames = new Set<string>()
  const takenDisplayUsernames = new Set<string>()
  const users = await tx.$queryRaw<
    { id: string; name: string }[]
  >`SELECT "id", "name" FROM "User" ORDER BY "createdAt" ASC`

  const generateUsername = (set: Set<string>): string => {
    const username = faker.internet.username()

    return set.has(username) ? generateUsername(set) : username
  }

  for (const user of users) {
    let username = normalizeUsername(user.name)
    let displayUsername = normalizeDisplayName(user.name)

    if (takenUsernames.has(username)) {
      username = generateUsername(takenUsernames).toLowerCase()
    }

    if (takenDisplayUsernames.has(displayUsername)) {
      displayUsername = generateUsername(takenDisplayUsernames)
    }

    console.log(`Setting '${username}'::'${displayUsername}' for ${user.id}`)

    await tx.$executeRaw`UPDATE "User" SET "username" = ${username}, "displayUsername" = ${displayUsername} WHERE "id" = ${user.id}::UUID`

    takenUsernames.add(username)
    takenDisplayUsernames.add(displayUsername)
  }
}
