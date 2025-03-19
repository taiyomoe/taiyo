import { PrismaClient } from "@prisma/client"
import normalizeEmail from "validator/lib/normalizeEmail"

const prisma = new PrismaClient()

async function main() {
  await prisma.$transaction(async (tx) => {
    const users = await tx.user.findMany()

    for (const user of users) {
      const normalizedEmail = normalizeEmail(user.email)

      if (!normalizedEmail) {
        throw new Error(`Failed to normalize email for user ${user.id}`)
      }

      await tx.user.update({
        where: { id: user.id },
        data: { normalizedEmail },
      })
    }
  })
}

main()
  .catch(async (e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => await prisma.$disconnect())
