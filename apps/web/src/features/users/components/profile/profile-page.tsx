import * as stylex from "@stylexjs/stylex"
import { breakpoints } from "@taiyomoe/ui/styles/tokens.stylex"
import { getRouteApi } from "@tanstack/react-router"
import { Suspense } from "react"
import { AppShell } from "@/components/shell/app-shell"
import { ProfileContent } from "@/features/users/components/profile/profile-content"
import { ProfileSkeleton } from "@/features/users/components/profile/profile-skeleton"

const routeApi = getRouteApi("/users/$username")
const styles = stylex.create({
  page: {
    gap: "2rem",
    marginInline: "auto",
    paddingBlock: "2.5rem",
    paddingInline: { default: "1.25rem", [breakpoints.md]: "2rem" },
    display: "flex",
    flexDirection: "column",
    maxWidth: "88rem",
    width: "100%",
  },
})

export function ProfilePage() {
  const { session } = routeApi.useRouteContext()
  const { username } = routeApi.useParams()
  const user = session?.user ?? null

  return (
    <AppShell user={user}>
      <div sx={styles.page}>
        <Suspense fallback={<ProfileSkeleton />}>
          <ProfileContent username={username} viewer={user} />
        </Suspense>
      </div>
    </AppShell>
  )
}
