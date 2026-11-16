import { getRouteApi } from "@tanstack/react-router"
import { AppShell } from "@/components/shell/app-shell"
import { ProfileSkeleton } from "@/features/users/components/profile/profile-skeleton"

const routeApi = getRouteApi("/groups/$groupId")

export function GroupPageSkeleton() {
  const { session } = routeApi.useRouteContext()

  return (
    <AppShell overlayNavbar user={session?.user ?? null}>
      <ProfileSkeleton />
    </AppShell>
  )
}
