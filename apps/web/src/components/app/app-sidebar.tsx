import * as stylex from "@stylexjs/stylex"
import { Link, useRouterState } from "@tanstack/react-router"
import { Book, Clock, Home } from "@taiyomoe/ui/components/icons"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@taiyomoe/ui/components/ui/sidebar"

import { m } from "@/paraglide/messages"

const styles = stylex.create({
  content: {
    paddingTop: "0.5rem",
  },
})

export function AppSidebar() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const isTitles = pathname.startsWith("/titles")

  return (
    <Sidebar collapsible="icon">
      <SidebarContent sx={styles.content}>
        <SidebarGroup>
          <SidebarGroupLabel>{m.app_nav_label()}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton render={<Link to="/" />} tooltip={m.app_nav_home()}>
                  <Home />
                  <span>{m.app_nav_home()}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isTitles}
                  render={<Link search={{}} to="/titles" />}
                  tooltip={m.app_nav_titles()}
                >
                  <Book />
                  <span>{m.app_nav_titles()}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link hash="latest" to="/" />}
                  tooltip={m.app_nav_latest()}
                >
                  <Clock />
                  <span>{m.app_nav_latest()}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
