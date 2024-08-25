import { auth } from "@taiyomoe/auth"
import { db } from "@taiyomoe/db"
import { UserSettingsLayout } from "./_components/user-settings-layout"

export default async function Page() {
  const session = await auth()
  const user = await db.user.findUnique({
    select: {
      settings: {
        select: {
          contentRating: true,
          preferredTitles: true,
          showFollowing: true,
          showLibrary: true,
        },
      },
      profile: {
        select: {
          birthDate: true,
          gender: true,
          city: true,
          country: true,
          about: true,
        },
      },
    },
    where: { id: session?.user.id },
  })

  if (!session || !user || !user.settings || !user.profile) {
    return null
  }

  return (
    <UserSettingsLayout user={{ ...user.settings, profile: user.profile }} />
  )
}
