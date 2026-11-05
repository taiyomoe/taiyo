import * as stylex from "@stylexjs/stylex"
import { Tabs, TabsList, TabsPanel, TabsTab } from "@taiyomoe/ui/components/ui/tabs"
import { colors, font, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { getRouteApi } from "@tanstack/react-router"
import type { Group } from "@/features/groups/api/groups"
import type { GroupTab } from "@/features/groups/lib/group-page"
import type { Session } from "@/lib/session"
import { formatCompact } from "@/features/dashboard/lib/format"
import { GroupChapters } from "@/features/groups/components/group/tabs/group-chapters"
import { GroupComments } from "@/features/groups/components/group/tabs/group-comments"
import { GroupInfo } from "@/features/groups/components/group/tabs/group-info"
import { GroupMembers } from "@/features/groups/components/group/tabs/group-members"
import { GroupStats } from "@/features/groups/components/group/tabs/group-stats"
import { GroupTitles } from "@/features/groups/components/group/tabs/group-titles"
import { m } from "@/paraglide/messages"

const routeApi = getRouteApi("/groups/$groupId")
const styles = stylex.create({
  tabs: {
    gap: "1.5rem",
    gridColumnEnd: "tabs",
    gridColumnStart: "tabs",
    gridRowEnd: "tabs",
    gridRowStart: "tabs",
    minWidth: 0,
  },
  tabList: {
    justifyContent: "flex-start",
    scrollbarWidth: "none",
    maxWidth: "100%",
    overflowX: "auto",
  },
  tab: {
    flexShrink: 0,
  },
  tabCount: {
    borderRadius: radius.full,
    paddingInline: "0.4375rem",
    backgroundColor: `color-mix(in srgb, ${colors.foreground} 8%, transparent)`,
    color: colors.mutedForeground,
    fontFamily: font.mono,
    fontSize: "0.6875rem",
    fontWeight: 600,
    lineHeight: "1.125rem",
    marginInlineStart: "0.375rem",
  },
})

export function GroupTabs({ group, user }: { group: Group; user: Session["user"] | null }) {
  const { tab = "info" } = routeApi.useSearch()
  const navigate = routeApi.useNavigate()
  const tabs: Array<{ value: GroupTab; label: string; count?: number }> = [
    { value: "info", label: m.group_tab_info() },
    { value: "chapters", label: m.group_tab_chapters(), count: group.chapterCount },
    { value: "titles", label: m.group_tab_titles(), count: group.mediaCount },
    { value: "members", label: m.group_tab_members(), count: group.memberCount },
    { value: "comments", label: m.group_tab_comments(), count: group.commentCount },
    { value: "stats", label: m.group_tab_stats() },
  ]

  return (
    <Tabs
      onValueChange={(value: GroupTab) => {
        void navigate({
          replace: true,
          resetScroll: false,
          search: { tab: value === "info" ? undefined : value },
        })
      }}
      sx={styles.tabs}
      value={tab}
    >
      <TabsList sx={styles.tabList} variant="underline">
        {tabs.map(({ value, label, count }) => (
          <TabsTab key={value} sx={styles.tab} value={value}>
            {label}
            {count === undefined || count === 0 ? null : (
              <span sx={styles.tabCount}>{formatCompact(count)}</span>
            )}
          </TabsTab>
        ))}
      </TabsList>
      <TabsPanel value="info">
        <GroupInfo group={group} />
      </TabsPanel>
      <TabsPanel value="chapters">
        <GroupChapters groupId={group.id} />
      </TabsPanel>
      <TabsPanel value="titles">
        <GroupTitles groupId={group.id} />
      </TabsPanel>
      <TabsPanel value="members">
        <GroupMembers groupId={group.id} />
      </TabsPanel>
      <TabsPanel value="comments">
        <GroupComments group={group} user={user} />
      </TabsPanel>
      <TabsPanel value="stats">
        <GroupStats groupId={group.id} />
      </TabsPanel>
    </Tabs>
  )
}
