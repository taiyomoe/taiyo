import * as stylex from "@stylexjs/stylex"
import { breakpoints } from "@taiyomoe/ui/styles/tokens.stylex"
import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { type ReactNode, Suspense } from "react"
import type { Session } from "@/lib/session"
import { RichText } from "@/components/rich-text/rich-text"
import { parseRichText } from "@/components/rich-text/rich-text-document"
import { AppShell } from "@/components/shell/app-shell"
import { LatestListSkeleton } from "@/features/chapters/components/latest-updates/latest-list"
import { groupQueryOptions } from "@/features/groups/api/groups"
import { GroupChapters } from "@/features/groups/components/group/group-chapters"
import { GroupHeader } from "@/features/groups/components/group/group-header"
import { GroupHeaderSkeleton } from "@/features/groups/components/group/group-header-skeleton"
import { GroupLinks } from "@/features/groups/components/group/group-links"
import {
  GroupMembers,
  GroupMembersSkeleton,
} from "@/features/groups/components/group/group-members"
import { groupStyles } from "@/features/groups/components/group/group-styles"
import { useGroupCommands } from "@/features/groups/hooks/use-group-commands"
import { usePermissions } from "@/lib/permissions"
import { m } from "@/paraglide/messages"

const routeApi = getRouteApi("/groups/$groupId")
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
  const can = usePermissions(user)
  const canManage =
    can("group.manageMembers", { id: groupId }) || can("group.update", { id: groupId })

  return (
    <GroupLayout
      chapters={
        <Suspense fallback={<LatestListSkeleton count={10} />}>
          <GroupChapters groupId={groupId} page={page} />
        </Suspense>
      }
      members={
        <Suspense fallback={<GroupMembersSkeleton />}>
          <GroupMembers groupId={groupId} />
        </Suspense>
      }
      overview={
        <Suspense fallback={<GroupHeaderSkeleton />}>
          <GroupOverview canManage={canManage} groupId={groupId} user={user} />
        </Suspense>
      }
      user={user}
    />
  )
}

export function GroupPageSkeleton() {
  const { session } = routeApi.useRouteContext()

  return (
    <GroupLayout
      chapters={<LatestListSkeleton count={10} />}
      members={<GroupMembersSkeleton />}
      overview={<GroupHeaderSkeleton />}
      user={session?.user ?? null}
    />
  )
}

function GroupLayout({
  user,
  overview,
  members,
  chapters,
}: {
  user: Session["user"] | null
  overview: ReactNode
  members: ReactNode
  chapters: ReactNode
}) {
  return (
    <AppShell user={user}>
      <div sx={styles.page}>
        {overview}
        <section sx={groupStyles.column}>
          <h2 sx={styles.sectionTitle}>{m.group_members()}</h2>
          {members}
        </section>
        <section sx={groupStyles.column}>
          <h2 sx={styles.sectionTitle}>{m.group_chapters()}</h2>
          {chapters}
        </section>
      </div>
    </AppShell>
  )
}

function GroupOverview({
  groupId,
  user,
  canManage,
}: {
  groupId: string
  user: Session["user"] | null
  canManage: boolean
}) {
  const { data: group } = useSuspenseQuery(groupQueryOptions(groupId))
  const description = parseRichText(group.description ?? "")

  useGroupCommands(group)

  return (
    <>
      <GroupHeader canManage={canManage} group={group} user={user} />
      <GroupLinks group={group} />
      {description.children.length === 0 ? null : <RichText collapsible document={description} />}
    </>
  )
}
