import type { IconProps } from "@taiyomoe/ui/components/icons"
import type { ReactElement } from "react"
import * as stylex from "@stylexjs/stylex"
import {
  Bell,
  Book,
  ExternalLink,
  Eye,
  Shield,
  Sliders,
  User,
  UserCheck,
} from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { Tabs, TabsList, TabsPanel, TabsTab } from "@taiyomoe/ui/components/ui/tabs"
import { sceneFont } from "@taiyomoe/ui/styles/scene.stylex"
import { breakpoints, colors, font, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { getRouteApi, Link } from "@tanstack/react-router"
import { lazy, Suspense } from "react"
import { layout } from "@/components/layout/layout.stylex"
import { AppShell } from "@/components/shell/app-shell"
import { AccountSettings } from "@/features/settings/components/account/account-settings"
import { NotificationSettings } from "@/features/settings/components/notifications/notification-settings"
import { PreferencesSettings } from "@/features/settings/components/preferences/preferences-settings"
import { PrivacySettings } from "@/features/settings/components/privacy/privacy-settings"
import { ProfileSettings } from "@/features/settings/components/profile/profile-settings"
import { SETTINGS_TABS, type SettingsTab } from "@/features/settings/lib/settings-tabs"
import { m } from "@/paraglide/messages"

const SecuritySettings = lazy(async () => ({
  default: (await import("@/features/settings/components/security/security-settings"))
    .SecuritySettings,
}))
const ReaderSettings = lazy(async () => ({
  default: (await import("@/features/settings/components/reader/reader-settings")).ReaderSettings,
}))
const TABS = {
  profile: { label: m.user_settings_tab_profile, icon: User },
  account: { label: m.user_settings_tab_account, icon: UserCheck },
  security: { label: m.user_settings_tab_security, icon: Shield },
  preferences: { label: m.user_settings_tab_preferences, icon: Sliders },
  reader: { label: m.user_settings_tab_reader, icon: Book },
  notifications: { label: m.user_settings_tab_notifications, icon: Bell },
  privacy: { label: m.user_settings_tab_privacy, icon: Eye },
} satisfies Record<SettingsTab, { label: () => string; icon: (props: IconProps) => ReactElement }>
const routeApi = getRouteApi("/settings")
const styles = stylex.create({
  page: {
    gap: "1.75rem",
    marginInline: "auto",
    paddingInline: layout.gutter,
    display: "flex",
    flexDirection: "column",
    maxWidth: "60rem",
    paddingBottom: "4rem",
    paddingTop: { default: "1.5rem", [breakpoints.md]: "2.5rem" },
    width: "100%",
  },
  header: {
    gap: "1rem",
    alignItems: "flex-end",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  heading: {
    gap: "0.375rem",
    display: "flex",
    flexDirection: "column",
  },
  title: {
    margin: 0,
    fontFamily: sceneFont.display,
    fontSize: { default: "1.75rem", [breakpoints.md]: "2.25rem" },
    fontWeight: font.weightBold,
    letterSpacing: "-0.02em",
    lineHeight: 1.1,
  },
  subtitle: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.9375rem",
  },
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
  skeleton: {
    borderRadius: radius.xxl,
    height: "18rem",
  },
})

export function SettingsPage() {
  const { session } = routeApi.useRouteContext()
  const { tab = "profile" } = routeApi.useSearch()
  const navigate = routeApi.useNavigate()
  const fallback = <Skeleton sx={styles.skeleton} />

  return (
    <AppShell user={session.user}>
      <div sx={styles.page}>
        <header sx={styles.header}>
          <div sx={styles.heading}>
            <h1 sx={styles.title}>{m.user_settings_title()}</h1>
            <p sx={styles.subtitle}>{m.user_settings_subtitle()}</p>
          </div>
          <Button
            render={
              <Link params={{ username: session.user.username ?? "" }} to="/users/$username" />
            }
            variant="outline"
          >
            {m.user_settings_view_profile()}
            <ExternalLink />
          </Button>
        </header>
        <Tabs
          onValueChange={(value: SettingsTab) => {
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
            {SETTINGS_TABS.map((value) => {
              const { label, icon: Icon } = TABS[value]

              return (
                <TabsTab key={value} sx={styles.tab} value={value}>
                  <Icon size={16} />
                  {label()}
                </TabsTab>
              )
            })}
          </TabsList>
          <TabsPanel value="profile">
            <Suspense fallback={fallback}>
              <ProfileSettings user={session.user} />
            </Suspense>
          </TabsPanel>
          <TabsPanel value="account">
            <AccountSettings key={session.user.username} user={session.user} />
          </TabsPanel>
          <TabsPanel value="security">
            <Suspense fallback={fallback}>
              <SecuritySettings session={session} />
            </Suspense>
          </TabsPanel>
          <TabsPanel value="preferences">
            <PreferencesSettings />
          </TabsPanel>
          <TabsPanel value="reader">
            <Suspense fallback={fallback}>
              <ReaderSettings />
            </Suspense>
          </TabsPanel>
          <TabsPanel value="notifications">
            <NotificationSettings user={session.user} />
          </TabsPanel>
          <TabsPanel value="privacy">
            <PrivacySettings user={session.user} />
          </TabsPanel>
        </Tabs>
      </div>
    </AppShell>
  )
}
