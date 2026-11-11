import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { Tabs, TabsList, TabsPanel, TabsTab } from "@taiyomoe/ui/components/ui/tabs"
import { colors, font, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { getRouteApi } from "@tanstack/react-router"
import type { Group } from "@/features/groups/api/groups"
import type { GroupTab } from "@/features/groups/lib/group-page"
import type { Session } from "@/lib/session"
import { CommentSection } from "@/features/comments/components/comment-section"
import { useCommentCount } from "@/features/comments/hooks/use-comment-count"
import { formatCompact } from "@/features/dashboard/lib/format"
import { GroupChapters } from "@/features/groups/components/group/tabs/group-chapters"
import { GroupMembers } from "@/features/groups/components/group/tabs/group-members"
import { GroupStats } from "@/features/groups/components/group/tabs/group-stats"
import { GroupTitles } from "@/features/groups/components/group/tabs/group-titles"
import { m } from "@/paraglide/messages"

const routeApi = getRouteApi("/groups/$groupId")
const styles = stylex.create({
  tabs: {
    gap: "1.5rem",
    minWidth: 0,
  },
  tabList: {
    boxShadow: `inset 0 -1px 0 ${colors.border}`,
    justifyContent: "flex-start",
    scrollbarWidth: "none",
    overflowX: "auto",
    paddingBottom: { '[data-orientation="horizontal"]': "1px", default: null },
    paddingTop: { '[data-orientation="horizontal"]': 0, default: null },
    width: "100%",
  },
  tab: {
    flexGrow: 0,
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

export function GroupTabs({
  group,
  user,
  overview,
}: {
  group: Group
  user: Session["user"] | null
  overview: ReactNode
}) {
  const { tab = "info", comment } = routeApi.useSearch()
  const navigate = routeApi.useNavigate()
  const commentCount = useCommentCount({ type: "GROUP", id: group.id }, group.commentCount)
  const tabs: Array<{ value: GroupTab; label: string; count?: number | undefined }> = [
    { value: "info", label: m.group_tab_info() },
    { value: "chapters", label: m.group_tab_chapters(), count: group.chapterCount },
    { value: "titles", label: m.group_tab_titles(), count: group.mediaCount },
    { value: "members", label: m.group_tab_members(), count: group.memberCount },
    { value: "comments", label: m.group_tab_comments(), count: commentCount },
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
      <TabsPanel value="info">{overview}</TabsPanel>
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
        <CommentSection
          getPermalink={(id) => `/groups/${group.id}?tab=comments&comment=${id}`}
          linkedCommentId={comment ?? null}
          target={{ type: "GROUP", id: group.id }}
          viewer={user}
        />
      </TabsPanel>
      <TabsPanel value="stats">
        <GroupStats groupId={group.id} />
      </TabsPanel>
    </Tabs>
  )
}
