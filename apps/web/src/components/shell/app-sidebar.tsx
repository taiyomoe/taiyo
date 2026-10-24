import type { IconProps } from "@taiyomoe/ui/components/icons"
import type { ReactElement } from "react"
import * as stylex from "@stylexjs/stylex"
import {
  Bookmark,
  Flame,
  Forum,
  History,
  Home,
  List,
  Shuffle,
  Sliders,
  Sparkles,
  User,
  Users,
} from "@taiyomoe/ui/components/icons"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarResizeHandle,
  useSidebar,
} from "@taiyomoe/ui/components/ui/sidebar"
import { colors, font, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link, type LinkProps, useMatchRoute } from "@tanstack/react-router"
import { m } from "@/paraglide/messages"

export type AppSidebarSection = {
  label?: () => string
  items: ReadonlyArray<{
    label: () => string
    icon: (props: IconProps) => ReactElement
    to?: LinkProps["to"]
  }>
}

const SECTIONS: AppSidebarSection[] = [
  {
    label: m.shell_nav_browse,
    items: [
      { label: m.shell_nav_home, icon: Home, to: "/" },
      { label: m.shell_nav_advanced_search, icon: Sliders },
      { label: m.shell_nav_recently_added, icon: Sparkles },
      { label: m.shell_nav_popular_titles, icon: Flame },
      { label: m.shell_nav_random_title, icon: Shuffle },
    ],
  },
  {
    label: m.shell_nav_my_library,
    items: [
      { label: m.shell_nav_follows, icon: Bookmark },
      { label: m.shell_nav_reading_history, icon: History },
      { label: m.shell_nav_my_lists, icon: List },
    ],
  },
  {
    label: m.shell_nav_community,
    items: [
      { label: m.shell_nav_groups, icon: Users, to: "/groups" },
      { label: m.shell_nav_forums, icon: Forum },
      { label: m.shell_nav_users, icon: User },
    ],
  },
]
const styles = stylex.create({
  container: {
    height: "calc(100svh - var(--navbar-height))",
    top: "var(--navbar-height)",
  },
  content: {
    gap: "0.5rem",
    paddingBlock: "0.75rem",
  },
  group: {
    paddingBlock: "0.25rem",
    paddingInline: "0.75rem",
  },
  groupLabel: {
    paddingInline: "0.75rem",
    color: colors.mutedForeground,
    fontSize: "0.6875rem",
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    height: "2.25rem",
  },
  menu: {
    gap: "0.125rem",
  },
  button: {
    borderRadius: radius.lg,
    gap: "0.75rem",
    paddingInline: "0.75rem",
    color: {
      default: colors.sidebarForeground,
      ":hover": colors.sidebarAccentForeground,
    },
    fontFamily: font.sans,
    fontSize: "0.9375rem",
    fontWeight: 500,
    lineHeight: "1.25rem",
    textDecorationLine: "none",
    transitionDuration: "150ms",
    transitionProperty: "background-color, color",
    height: "2.625rem",
  },
  buttonActive: {
    backgroundColor: `color-mix(in srgb, ${colors.primary} 14%, transparent)`,
    color: `color-mix(in srgb, ${colors.primary} 72%, ${colors.foreground})`,
    fontWeight: 600,
  },
  icon: {
    color: colors.mutedForeground,
    flexShrink: 0,
  },
  iconActive: {
    color: "inherit",
  },
})

export function AppSidebar({
  sections = SECTIONS,
}: {
  sections?: readonly AppSidebarSection[] | undefined
}) {
  const matchRoute = useMatchRoute()
  const { setOpenMobile } = useSidebar()

  return (
    <Sidebar sx={styles.container}>
      <SidebarContent sx={styles.content}>
        {sections.map((section, index) => (
          <SidebarGroup key={section.label?.() ?? index} sx={styles.group}>
            {section.label === undefined ? null : (
              <SidebarGroupLabel sx={styles.groupLabel}>{section.label()}</SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu sx={styles.menu}>
                {section.items.map(({ label, icon: Icon, to }) => {
                  const isActive = to !== undefined && Boolean(matchRoute({ to }))

                  return (
                    <SidebarMenuItem key={label()}>
                      <SidebarMenuButton
                        isActive={isActive}
                        onClick={() => {
                          setOpenMobile(false)
                        }}
                        render={to === undefined ? undefined : <Link to={to} />}
                        sx={[styles.button, isActive && styles.buttonActive]}
                      >
                        <Icon
                          {...stylex.props(styles.icon, isActive && styles.iconActive)}
                          size={20}
                        />
                        <span>{label()}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarResizeHandle maxWidth={384} minWidth={208} />
    </Sidebar>
  )
}
