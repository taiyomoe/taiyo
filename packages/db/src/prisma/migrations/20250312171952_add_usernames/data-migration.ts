import { faker } from "@faker-js/faker"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
const USERNAME_REGEX = /^[a-zA-Z0-9_.]$/g

async function main() {
  await prisma.$transaction(async (tx) => {
    const takenUsernames = new Set<string>()
    const takenDisplayUsernames = new Set<string>()
    const users = await tx.user.findMany()

    for (const user of users) {
      let normalizedUsername = user.name
        .slice(0, 30)
        .replace(USERNAME_REGEX, "")
      let displayUsername = user.name

      if (!normalizedUsername || takenUsernames.has(normalizedUsername)) {
        normalizedUsername = faker.internet.username()
      }

      if (takenDisplayUsernames.has(displayUsername)) {
        displayUsername = faker.internet.username()
      }

      await tx.user.update({
        where: { id: user.id },
        data: {
          username: normalizedUsername,
          displayUsername,
        },
      })

      takenUsernames.add(normalizedUsername)
      takenDisplayUsernames.add(user.name)
    }
  })
}

main()
  .catch(async (e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => await prisma.$disconnect())
