import type { Prisma } from "@prisma/client"

export default async (tx: Prisma.TransactionClient) => {
  const users = await tx.$queryRaw<
    {
      contentRating: string
      preferredTitles: string | null
      showFollowing: boolean
      showLibrary: boolean
      homeLayout: string
      userId: string
    }[]
  >`SELECT * FROM "UserSetting"`

  for (const user of users) {
    const rawSettings = {
      preferredTitles: user.preferredTitles,
      showFollowing: user.showFollowing ? null : false,
      showLibrary: user.showLibrary ? null : false,
      homeLayout: user.homeLayout === "ROWS" ? null : "COLUMNS",
    }
    const settings = Object.fromEntries(
      Object.entries(rawSettings).filter(([, value]) => value !== null),
    )

    await tx.$executeRaw`UPDATE "User" SET "settings" = ${settings} WHERE "id" = ${user.userId}::UUID`
  }

  await tx.$executeRaw`DROP TABLE "UserSetting"`
  await tx.$executeRaw`DROP TYPE "HomeLayout"`
}
