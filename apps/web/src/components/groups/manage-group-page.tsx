import * as stylex from "@stylexjs/stylex"
import { ExternalLink } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { Tabs, TabsList, TabsPanel, TabsTab } from "@taiyomoe/ui/components/ui/tabs"
import { radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { Suspense } from "react"
import type { Session } from "@/lib/queries/session"
import { DashboardPage } from "@/components/dashboard/dashboard-page"
import { GroupAvatar } from "@/components/groups/group-avatar"
import { GroupInvitationsPanel } from "@/components/groups/group-invitations-panel"
import { GroupMembersPanel } from "@/components/groups/group-members-panel"
import { GroupSettingsPanel } from "@/components/groups/group-settings-panel"
import { usePermissions } from "@/lib/permissions"
import { groupQueryOptions } from "@/lib/queries/groups"
import { m } from "@/paraglide/messages"

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
})

export function ManageGroupPage({ groupId, user }: { groupId: string; user: Session["user"] }) {
  const { data: group } = useSuspenseQuery(groupQueryOptions(groupId))
  const can = usePermissions(user)
  const canInvite = can("group.inviteMember", { groupId, permissions: [] })
  const canEdit = can("group.update", { id: groupId })

  return (
    <DashboardPage
      actions={
        <Button render={<Link params={{ groupId }} to="/groups/$groupId" />} variant="outline">
          {m.manage_group_public_page()}
          <ExternalLink />
        </Button>
      }
      title={
        <span sx={styles.title}>
          <GroupAvatar id={group.id} name={group.name} />
          {group.name}
        </span>
      }
    >
      <Tabs defaultValue="members" sx={styles.tabs}>
        <TabsList variant="underline">
          <TabsTab value="members">{m.manage_tab_members()}</TabsTab>
          {canInvite ? <TabsTab value="invitations">{m.manage_tab_invitations()}</TabsTab> : null}
          {canEdit ? <TabsTab value="settings">{m.manage_tab_settings()}</TabsTab> : null}
        </TabsList>
        <TabsPanel sx={styles.panel} value="members">
          <Suspense fallback={<Skeleton sx={styles.skeleton} />}>
            <GroupMembersPanel can={can} group={group} userId={user.id} />
          </Suspense>
        </TabsPanel>
        {canInvite ? (
          <TabsPanel sx={styles.panel} value="invitations">
            <Suspense fallback={<Skeleton sx={styles.skeleton} />}>
              <GroupInvitationsPanel can={can} groupId={groupId} userId={user.id} />
            </Suspense>
          </TabsPanel>
        ) : null}
        {canEdit ? (
          <TabsPanel sx={styles.panel} value="settings">
            <GroupSettingsPanel group={group} />
          </TabsPanel>
        ) : null}
      </Tabs>
    </DashboardPage>
  )
}
