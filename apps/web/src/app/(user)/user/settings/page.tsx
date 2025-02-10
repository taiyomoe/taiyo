import { db } from "@taiyomoe/db"
import { notFound } from "next/navigation"
import { getSession } from "~/utils/get-session"
import { UserSettingsLayout } from "./_components/user-settings-layout"

export default async function Page() {
  const session = await getSession()

  if (!session) {
    notFound()
  }

  const userProfile = await db.userProfile.findUnique({
    select: {
      birthDate: true,
      gender: true,
      city: true,
      country: true,
      about: true,
    },
    where: { userId: session.user.id },
  })

  if (!userProfile) {
    notFound()
  }

  return (
    <UserSettingsLayout
      user={{ ...session.user.settings, profile: userProfile }}
    />
  )
}
