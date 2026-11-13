import type { IconProps } from "@taiyomoe/ui/components/icons"
import type { ReactElement } from "react"
import * as stylex from "@stylexjs/stylex"
import {
  Feed,
  History,
  Home,
  List,
  Shuffle,
  Sliders,
  Sparkles,
  Store,
  Users,
} from "@taiyomoe/ui/components/icons"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarResizeHandle,
  useSidebar,
} from "@taiyomoe/ui/components/ui/sidebar"
import { colors, font, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery } from "@tanstack/react-query"
import { Link, type LinkProps, useMatchRoute } from "@tanstack/react-router"
import { SoonBadge } from "@/components/feedback/soon-badge"
import { useRandomTitle } from "@/features/advanced-search/hooks/use-random-title"
import { DEFAULT_ADVANCED_SEARCH } from "@/features/advanced-search/lib/advanced-search"
import { sessionQueryOptions } from "@/lib/session"
import { m } from "@/paraglide/messages"

export type AppSidebarSection = {
  label?: () => string
  items: ReadonlyArray<{
    label: () => string
    icon: (props: IconProps) => ReactElement
    to?: LinkProps["to"]
    params?: LinkProps["params"]
    highlight?: boolean
    onClick?: () => void
    pending?: boolean
    soon?: boolean
  }>
}

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
  soonBadge: {
    paddingInline: 0,
    transform: "translateY(-50%)",
    right: "0.75rem",
    top: "50%",
  },
})

export function AppSidebar({ sections }: { sections?: readonly AppSidebarSection[] | undefined }) {
  const matchRoute = useMatchRoute()
  const { setOpenMobile } = useSidebar()
  const randomTitle = useRandomTitle()
  const { data: session } = useQuery({ ...sessionQueryOptions, staleTime: "static" })
  const defaultSections: AppSidebarSection[] = [
    {
      label: m.shell_nav_browse,
      items: [
        { label: m.shell_nav_home, icon: Home, to: "/" },
        { label: m.shell_nav_advanced_search, icon: Sliders, to: "/titles" },
        { label: m.shell_nav_recently_added, icon: Sparkles, to: "/recently-added" },
        {
          label: m.shell_nav_random_title,
          icon: Shuffle,
          onClick: () => {
            randomTitle.mutate(DEFAULT_ADVANCED_SEARCH)
          },
          pending: randomTitle.isPending,
        },
      ],
    },
    {
      label: m.shell_nav_my_library,
      items: [
        ...(typeof session?.user.username === "string"
          ? [
              {
                label: m.shell_nav_reading_history,
                icon: History,
                to: "/users/$username",
                params: { username: session.user.username },
                highlight: false,
              } as const,
            ]
          : []),
        { label: m.shell_nav_lists, icon: List, to: "/lists" },
      ],
    },
    {
      label: m.shell_nav_community,
      items: [
        { label: m.shell_nav_groups, icon: Users, to: "/groups" },
        { label: m.shell_nav_feed, icon: Feed, soon: true },
        { label: m.shell_nav_shop, icon: Store, to: "/shop" },
      ],
    },
  ]

  return (
    <Sidebar sx={styles.container}>
      <SidebarContent sx={styles.content}>
        {(sections ?? defaultSections).map((section, index) => (
          <SidebarGroup key={section.label?.() ?? index} sx={styles.group}>
            {section.label === undefined ? null : (
              <SidebarGroupLabel sx={styles.groupLabel}>{section.label()}</SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu sx={styles.menu}>
                {section.items.map(
                  ({ label, icon: Icon, to, params, highlight, onClick, pending, soon }) => {
                    const isActive =
                      to !== undefined &&
                      highlight !== false &&
                      Boolean(matchRoute({ to, ...(params === undefined ? {} : { params }) }))

                    return (
                      <SidebarMenuItem key={label()}>
                        <SidebarMenuButton
                          aria-busy={pending}
                          disabled={soon === true || pending === true}
                          isActive={isActive}
                          onClick={() => {
                            setOpenMobile(false)
                            onClick?.()
                          }}
                          render={
                            to === undefined ? undefined : (
                              <Link {...(params === undefined ? {} : { params })} to={to} />
                            )
                          }
                          sx={[styles.button, isActive && styles.buttonActive]}
                        >
                          <Icon
                            {...stylex.props(styles.icon, isActive && styles.iconActive)}
                            size={20}
                          />
                          <span>{label()}</span>
                        </SidebarMenuButton>
                        {soon === true ? (
                          <SidebarMenuBadge sx={styles.soonBadge}>
                            <SoonBadge />
                          </SidebarMenuBadge>
                        ) : null}
                      </SidebarMenuItem>
                    )
                  },
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarResizeHandle maxWidth={384} minWidth={208} />
    </Sidebar>
  )
}
