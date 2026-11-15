import { getRouteApi } from "@tanstack/react-router"
import { Suspense } from "react"
import { AppShell } from "@/components/shell/app-shell"
import { ProfileContent } from "@/features/users/components/profile/profile-content"
import { ProfileSkeleton } from "@/features/users/components/profile/profile-skeleton"

const routeApi = getRouteApi("/users/$username")

export function ProfilePage() {
  const { session } = routeApi.useRouteContext()
  const { username } = routeApi.useParams()
  const user = session?.user ?? null

  return (
    <AppShell user={user}>
      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileContent key={username.toLowerCase()} username={username} viewer={user} />
      </Suspense>
    </AppShell>
  )
}
