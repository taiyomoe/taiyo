import { getRouteApi } from "@tanstack/react-router"
import { Suspense } from "react"
import { AppShell } from "@/components/shell/app-shell"
import { GroupPageContent } from "@/features/groups/components/group/group-page-content"
import { ProfileSkeleton } from "@/features/users/components/profile/profile-skeleton"

const routeApi = getRouteApi("/groups/$groupId")

export function GroupPage() {
  const { session } = routeApi.useRouteContext()
  const { groupId } = routeApi.useParams()

  return (
    <AppShell user={session?.user ?? null}>
      <Suspense fallback={<ProfileSkeleton />}>
        <GroupPageContent groupId={groupId} user={session?.user ?? null} />
      </Suspense>
    </AppShell>
  )
}

export function GroupPageSkeleton() {
  const { session } = routeApi.useRouteContext()

  return (
    <AppShell user={session?.user ?? null}>
      <ProfileSkeleton />
    </AppShell>
  )
}
