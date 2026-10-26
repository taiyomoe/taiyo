import * as stylex from "@stylexjs/stylex"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { Suspense } from "react"
import { AppShell } from "@/components/shell/app-shell"
import { groupQueryOptions } from "@/features/groups/api/groups"
import { GroupChapters } from "@/features/groups/components/group/group-chapters"
import { GroupChaptersSkeleton } from "@/features/groups/components/group/group-chapters-skeleton"
import { GroupHeader } from "@/features/groups/components/group/group-header"
import { GroupLinks } from "@/features/groups/components/group/group-links"
import { GroupMembers } from "@/features/groups/components/group/group-members"
import { groupStyles } from "@/features/groups/components/group/group-styles"
import { usePermissions } from "@/lib/permissions"
import { m } from "@/paraglide/messages"

const routeApi = getRouteApi("/groups/$groupId")
const styles = stylex.create({
  page: {
    gap: "2rem",
    marginInline: "auto",
    paddingBlock: "2.5rem",
    paddingInline: { default: "1.25rem", "@media (width >= 48rem)": "2rem" },
    display: "flex",
    flexDirection: "column",
    maxWidth: "88rem",
    width: "100%",
  },
  description: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "1rem",
    lineHeight: 1.6,
    whiteSpace: "pre-line",
    maxWidth: "48rem",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "1.125rem",
    fontWeight: 600,
  },
})

export function GroupPage() {
  const { session } = routeApi.useRouteContext()
  const { groupId } = routeApi.useParams()
  const { page } = routeApi.useLoaderDeps()
  const user = session?.user ?? null
  const { data: group } = useSuspenseQuery(groupQueryOptions(groupId))
  const can = usePermissions(user)
  const canManage =
    can("group.manageMembers", { id: group.id }) || can("group.update", { id: group.id })

  return (
    <AppShell user={user}>
      <div sx={styles.page}>
        <GroupHeader canManage={canManage} group={group} user={user} />
        {group.description === null || group.description === "" ? null : (
          <p sx={styles.description}>{group.description}</p>
        )}
        <GroupLinks group={group} />
        <section sx={groupStyles.column}>
          <h2 sx={styles.sectionTitle}>{m.group_members()}</h2>
          <Suspense fallback={<Skeleton sx={groupStyles.skeleton} />}>
            <GroupMembers groupId={groupId} />
          </Suspense>
        </section>
        <section sx={groupStyles.column}>
          <h2 sx={styles.sectionTitle}>{m.group_chapters()}</h2>
          <Suspense fallback={<GroupChaptersSkeleton />}>
            <GroupChapters groupId={groupId} page={page} />
          </Suspense>
        </section>
      </div>
    </AppShell>
  )
}
