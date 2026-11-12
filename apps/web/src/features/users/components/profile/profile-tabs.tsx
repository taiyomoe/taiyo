import * as stylex from "@stylexjs/stylex"
import { Tabs, TabsList, TabsPanel, TabsTab } from "@taiyomoe/ui/components/ui/tabs"
import { colors, font, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { getRouteApi } from "@tanstack/react-router"
import { lazy, Suspense } from "react"
import type { UserProfile } from "@/features/users/api/profile"
import type { ProfileTab } from "@/features/users/lib/profile-page"
import type { Session } from "@/lib/session"
import { useCommentCount } from "@/features/comments/hooks/use-comment-count"
import { CommentsTab } from "@/features/users/components/profile/tabs/comments-tab"
import { ListsTab, ListsTabSkeleton } from "@/features/users/components/profile/tabs/lists-tab"
import { OverviewTab } from "@/features/users/components/profile/tabs/overview/overview-tab"
import { StatsTabSkeleton } from "@/features/users/components/profile/tabs/stats-skeleton"
import {
  UploadsTab,
  UploadsTabSkeleton,
} from "@/features/users/components/profile/tabs/uploads-tab"
import { m } from "@/paraglide/messages"

// Stats is the heaviest tab to render and the least visited: split it out.
const StatsTab = lazy(async () => ({
  default: (await import("@/features/users/components/profile/tabs/stats-tab")).StatsTab,
}))
const routeApi = getRouteApi("/users/$username")
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
  count: {
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

export function ProfileTabs({
  profile,
  viewer,
}: {
  profile: UserProfile
  viewer: Session["user"] | null
}) {
  const { tab = "profile", page = 1 } = routeApi.useSearch()
  const navigate = routeApi.useNavigate()
  const commentCount = useCommentCount({ type: "USER", id: profile.id }, profile.commentCount)

  return (
    <Tabs
      onValueChange={(value: ProfileTab) => {
        void navigate({
          replace: true,
          resetScroll: false,
          search: { tab: value === "profile" ? undefined : value },
        })
      }}
      sx={styles.tabs}
      value={tab}
    >
      <TabsList sx={styles.tabList} variant="underline">
        <TabsTab sx={styles.tab} value="profile">
          {m.profile_tab_profile()}
        </TabsTab>
        <TabsTab sx={styles.tab} value="stats">
          {m.profile_tab_stats()}
        </TabsTab>
        <TabsTab sx={styles.tab} value="uploads">
          {m.profile_tab_uploads()}
          {profile.uploadCount === 0 ? null : <span sx={styles.count}>{profile.uploadCount}</span>}
        </TabsTab>
        <TabsTab sx={styles.tab} value="lists">
          {m.profile_tab_lists()}
          {profile.listCount === 0 ? null : <span sx={styles.count}>{profile.listCount}</span>}
        </TabsTab>
        <TabsTab sx={styles.tab} value="comments">
          {m.profile_tab_comments()}
          {commentCount === undefined || commentCount === 0 ? null : (
            <span sx={styles.count}>{commentCount}</span>
          )}
        </TabsTab>
      </TabsList>
      <TabsPanel value="profile">
        <Suspense fallback={<StatsTabSkeleton />}>
          <OverviewTab isOwner={viewer?.id === profile.id} profile={profile} />
        </Suspense>
      </TabsPanel>
      <TabsPanel value="stats">
        <Suspense fallback={<StatsTabSkeleton />}>
          <StatsTab profile={profile} />
        </Suspense>
      </TabsPanel>
      <TabsPanel value="uploads">
        <Suspense fallback={<UploadsTabSkeleton />}>
          <UploadsTab page={page} profile={profile} />
        </Suspense>
      </TabsPanel>
      <TabsPanel value="lists">
        <Suspense fallback={<ListsTabSkeleton />}>
          <ListsTab isOwner={viewer?.id === profile.id} page={page} profile={profile} />
        </Suspense>
      </TabsPanel>
      <TabsPanel value="comments">
        <CommentsTab profile={profile} viewer={viewer} />
      </TabsPanel>
    </Tabs>
  )
}
