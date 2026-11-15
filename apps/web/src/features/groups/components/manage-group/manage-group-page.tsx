import type { Permissions } from "@taiyomoe/permissions"
import * as stylex from "@stylexjs/stylex"
import { ExternalLink } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { Tabs, TabsList, TabsPanel, TabsTab } from "@taiyomoe/ui/components/ui/tabs"
import { breakpoints, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi, Link } from "@tanstack/react-router"
import { Suspense } from "react"
import { DashboardPage } from "@/components/layout/dashboard-page"
import { ListCardSkeleton } from "@/components/layout/list-card-skeleton"
import { groupQueryOptions } from "@/features/groups/api/groups"
import { GroupAvatar } from "@/features/groups/components/group-avatar"
import { GroupChaptersPanel } from "@/features/groups/components/manage-group/chapters/group-chapters-panel"
import { GroupSettingsPanel } from "@/features/groups/components/manage-group/group-settings-panel"
import { GroupInvitationsPanel } from "@/features/groups/components/manage-group/invitations/group-invitations-panel"
import { GroupMembersPanel } from "@/features/groups/components/manage-group/members/group-members-panel"
import { usePermissions } from "@/lib/permissions"
import { m } from "@/paraglide/messages"

const routeApi = getRouteApi("/dashboard/groups/$groupId")
const styles = stylex.create({
  title: {
    gap: "1rem",
    alignItems: "center",
    display: "inline-flex",
  },
  tabs: {
    gap: "1.5rem",
    display: "flex",
    flexDirection: "column",
  },
  panel: {
    gap: "1.5rem",
    display: "flex",
    flexDirection: "column",
  },
  skeleton: {
    borderRadius: radius.xxl,
    height: "12rem",
  },
  avatarSkeleton: {
    borderRadius: radius.lg,
    flexShrink: 0,
    height: "2.5rem",
    width: "2.5rem",
  },
  nameSkeleton: {
    height: { default: "1.75rem", [breakpoints.md]: "2.25rem" },
    width: "12rem",
  },
})

export function ManageGroupPage() {
  const { session } = routeApi.useRouteContext()
  const { groupId } = routeApi.useParams()
  const { user } = session
  const can = usePermissions(user)
  const canInvite = can("group.inviteMember", { groupId, permissions: [] })
  const canEdit = can("group.update", { id: groupId })
  const groupChapter = { uploaderId: "", status: "PUBLISHED" as const, groupIds: [groupId] }
  const canManageChapters =
    can("chapter.update", groupChapter) || can("chapter.delete", groupChapter)

  return (
    <DashboardPage
      actions={
        <Button render={<Link params={{ groupId }} to="/groups/$groupId" />} variant="outline">
          {m.manage_group_public_page()}
          <ExternalLink />
        </Button>
      }
      title={
        <Suspense
          fallback={
            <span aria-hidden sx={styles.title}>
              <Skeleton sx={styles.avatarSkeleton} />
              <Skeleton sx={styles.nameSkeleton} />
            </span>
          }
        >
          <ManageGroupTitle groupId={groupId} />
        </Suspense>
      }
    >
      <Tabs defaultValue="members" sx={styles.tabs}>
        <TabsList variant="underline">
          <TabsTab value="members">{m.manage_tab_members()}</TabsTab>
          {canManageChapters ? <TabsTab value="chapters">{m.manage_tab_chapters()}</TabsTab> : null}
          {canInvite ? <TabsTab value="invitations">{m.manage_tab_invitations()}</TabsTab> : null}
          {canEdit ? <TabsTab value="settings">{m.manage_tab_settings()}</TabsTab> : null}
        </TabsList>
        <TabsPanel sx={styles.panel} value="members">
          <Suspense fallback={<ListCardSkeleton actions={["2rem"]} media="person" rows={3} />}>
            <ManageGroupMembers can={can} groupId={groupId} userId={user.id} />
          </Suspense>
        </TabsPanel>
        {canManageChapters ? (
          <TabsPanel sx={styles.panel} value="chapters">
            <Suspense fallback={<Skeleton sx={styles.skeleton} />}>
              <GroupChaptersPanel can={can} groupId={groupId} />
            </Suspense>
          </TabsPanel>
        ) : null}
        {canInvite ? (
          <TabsPanel sx={styles.panel} value="invitations">
            <Suspense fallback={<Skeleton sx={styles.skeleton} />}>
              <GroupInvitationsPanel can={can} groupId={groupId} userId={user.id} />
            </Suspense>
          </TabsPanel>
        ) : null}
        {canEdit ? (
          <TabsPanel sx={styles.panel} value="settings">
            <Suspense fallback={<Skeleton sx={styles.skeleton} />}>
              <ManageGroupSettings groupId={groupId} />
            </Suspense>
          </TabsPanel>
        ) : null}
      </Tabs>
    </DashboardPage>
  )
}

function ManageGroupTitle({ groupId }: { groupId: string }) {
  const { data: group } = useSuspenseQuery(groupQueryOptions(groupId))

  return (
    <span sx={styles.title}>
      <GroupAvatar id={group.id} name={group.name} />
      {group.name}
    </span>
  )
}

function ManageGroupMembers({
  can,
  groupId,
  userId,
}: {
  can: Permissions
  groupId: string
  userId: string
}) {
  const { data: group } = useSuspenseQuery(groupQueryOptions(groupId))

  return <GroupMembersPanel can={can} group={group} userId={userId} />
}

function ManageGroupSettings({ groupId }: { groupId: string }) {
  const { data: group } = useSuspenseQuery(groupQueryOptions(groupId))

  return <GroupSettingsPanel group={group} />
}
