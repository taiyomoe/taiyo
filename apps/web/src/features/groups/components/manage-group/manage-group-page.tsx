import * as stylex from "@stylexjs/stylex"
import { ExternalLink } from "@taiyomoe/ui/components/icons"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { Tabs, TabsList, TabsPanel, TabsTab } from "@taiyomoe/ui/components/ui/tabs"
import { breakpoints, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi, Link } from "@tanstack/react-router"
import { Suspense } from "react"
import { PageAction } from "@/components/filters/filter-toolbar"
import { DashboardPage } from "@/components/layout/dashboard-page"
import { groupQueryOptions } from "@/features/groups/api/groups"
import { GroupAvatar } from "@/features/groups/components/group-avatar"
import { GroupChaptersPanel } from "@/features/groups/components/manage-group/chapters/group-chapters-panel"
import { GroupSettingsPanel } from "@/features/groups/components/manage-group/group-settings-panel"
import { GroupInvitationsPanel } from "@/features/groups/components/manage-group/invitations/group-invitations-panel"
import { GroupMembersPanel } from "@/features/groups/components/manage-group/members/group-members-panel"
import { MANAGE_GROUP_TABS, type ManageGroupTab } from "@/features/groups/lib/manage-group-tabs"
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
    minWidth: 0,
  },
  // Scrolls sideways on phones rather than widening the page.
  tabList: {
    justifyContent: "flex-start",
    scrollbarWidth: "none",
    maxWidth: "100%",
    overflowX: "auto",
  },
  tab: {
    flexShrink: 0,
  },
  panel: {
    gap: "1.5rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
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
  const search = routeApi.useSearch()
  const navigate = routeApi.useNavigate()
  const { user } = session
  const can = usePermissions(user)
  const groupChapter = { uploaderId: "", status: "PUBLISHED" as const, groupIds: [groupId] }
  const shown: Record<ManageGroupTab, boolean> = {
    members: true,
    chapters: can("chapter.update", groupChapter) || can("chapter.delete", groupChapter),
    invitations: can("group.inviteMember", { groupId, permissions: [] }),
    settings: can("group.update", { id: groupId }),
  }
  const tab = search.tab !== undefined && shown[search.tab] ? search.tab : "members"
  const labels: Record<ManageGroupTab, string> = {
    members: m.manage_tab_members(),
    chapters: m.manage_tab_chapters(),
    invitations: m.manage_tab_invitations(),
    settings: m.manage_tab_settings(),
  }

  return (
    <DashboardPage
      actions={
        <PageAction render={<Link params={{ groupId }} to="/groups/$groupId" />} variant="outline">
          {m.manage_group_public_page()}
          <ExternalLink />
        </PageAction>
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
      <Tabs
        onValueChange={(next: ManageGroupTab) => {
          void navigate({
            replace: true,
            search: { tab: next === "members" ? undefined : next, page: undefined },
          })
        }}
        sx={styles.tabs}
        value={tab}
      >
        <TabsList sx={styles.tabList} variant="underline">
          {MANAGE_GROUP_TABS.filter((value) => shown[value]).map((value) => (
            <TabsTab key={value} sx={styles.tab} value={value}>
              {labels[value]}
            </TabsTab>
          ))}
        </TabsList>
        <TabsPanel sx={styles.panel} value="members">
          <GroupMembersPanel can={can} groupId={groupId} userId={user.id} />
        </TabsPanel>
        {shown.chapters ? (
          <TabsPanel sx={styles.panel} value="chapters">
            <GroupChaptersPanel
              can={can}
              groupId={groupId}
              onPageChange={(page) => {
                void navigate({
                  replace: true,
                  search: { tab: "chapters", page: page === 1 ? undefined : page },
                })
              }}
              page={search.page ?? 1}
            />
          </TabsPanel>
        ) : null}
        {shown.invitations ? (
          <TabsPanel sx={styles.panel} value="invitations">
            <GroupInvitationsPanel can={can} groupId={groupId} userId={user.id} />
          </TabsPanel>
        ) : null}
        {shown.settings ? (
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

function ManageGroupSettings({ groupId }: { groupId: string }) {
  const { data: group } = useSuspenseQuery(groupQueryOptions(groupId))

  return <GroupSettingsPanel group={group} />
}
