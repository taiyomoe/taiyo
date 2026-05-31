import preview from "@/storybook/preview"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@taiyomoe/ui/components/ui/sidebar"
import {
  BookOpenIcon,
  HomeIcon,
  InboxIcon,
  SearchIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react"

const NAV_ITEMS = [
  { title: "Home", icon: HomeIcon, isActive: true },
  { title: "Inbox", icon: InboxIcon, badge: "12" },
  { title: "Search", icon: SearchIcon },
  { title: "Library", icon: BookOpenIcon },
  { title: "Members", icon: UsersIcon },
] as const
const meta = preview.meta({
  title: "UI/Sidebar",
  component: Sidebar,
  subcomponents: {
    SidebarProvider,
    SidebarTrigger,
    SidebarHeader,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarMenuBadge,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
    SidebarSeparator,
    SidebarInset,
    SidebarRail,
  },
  parameters: { layout: "fullscreen" },
})

export const Default = meta.story({
  render: () => (
    <SidebarProvider defaultOpen>
      <Sidebar>
        <SidebarHeader>
          <div className="flex h-10 items-center gap-2 px-2">
            <div className="grid size-7 place-items-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
              T
            </div>
            <span className="text-sm font-medium">Taiyō</span>
          </div>
        </SidebarHeader>
        <SidebarSeparator className="-mt-px" />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV_ITEMS.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={"isActive" in item ? item.isActive : false}
                      tooltip={item.title}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                    {"badge" in item && item.badge ? (
                      <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                    ) : null}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Projects</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Acme Inc.">
                    <span>Acme Inc.</span>
                  </SidebarMenuButton>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton>Overview</SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton isActive>Tasks</SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Personal">
                    <span>Personal</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Settings">
                <SettingsIcon />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <span className="text-sm font-medium">Dashboard</span>
        </header>
        <main className="flex-1 p-6">
          <p className="text-sm text-muted-foreground">
            Resize the canvas or toggle the trigger to see the sidebar collapse behaviour. Press{" "}
            <kbd>Cmd/Ctrl + B</kbd> to toggle.
          </p>
        </main>
      </SidebarInset>
    </SidebarProvider>
  ),
})

export const Floating = meta.story({
  render: () => (
    <SidebarProvider defaultOpen>
      <Sidebar variant="floating">
        <SidebarHeader>
          <div className="flex h-10 items-center gap-2 px-2">
            <div className="grid size-7 place-items-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
              T
            </div>
            <span className="text-sm font-medium">Taiyō</span>
          </div>
        </SidebarHeader>
        <SidebarSeparator className="-mt-px" />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV_ITEMS.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={"isActive" in item ? item.isActive : false}
                      tooltip={item.title}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                    {"badge" in item && item.badge ? (
                      <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                    ) : null}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Settings">
                <SettingsIcon />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <span className="text-sm font-medium">Dashboard</span>
        </header>
        <main className="flex-1 p-6">
          <p className="text-sm text-muted-foreground">Floating sidebar variant.</p>
        </main>
      </SidebarInset>
    </SidebarProvider>
  ),
})

export const Inset = meta.story({
  render: () => (
    <SidebarProvider defaultOpen>
      <Sidebar variant="inset">
        <SidebarHeader>
          <div className="flex h-10 items-center gap-2 px-2">
            <div className="grid size-7 place-items-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
              T
            </div>
            <span className="text-sm font-medium">Taiyō</span>
          </div>
        </SidebarHeader>
        <SidebarSeparator className="-mt-px" />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV_ITEMS.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={"isActive" in item ? item.isActive : false}
                      tooltip={item.title}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                    {"badge" in item && item.badge ? (
                      <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                    ) : null}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Settings">
                <SettingsIcon />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <span className="text-sm font-medium">Dashboard</span>
        </header>
        <main className="flex-1 p-6">
          <p className="text-sm text-muted-foreground">Inset sidebar variant.</p>
        </main>
      </SidebarInset>
    </SidebarProvider>
  ),
})

export const CollapsibleIcon = meta.story({
  render: () => (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex h-10 items-center gap-2 px-2">
            <div className="grid size-7 place-items-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
              T
            </div>
            <span className="text-sm font-medium">Taiyō</span>
          </div>
        </SidebarHeader>
        <SidebarSeparator className="-mt-px" />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV_ITEMS.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={"isActive" in item ? item.isActive : false}
                      tooltip={item.title}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                    {"badge" in item && item.badge ? (
                      <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                    ) : null}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Settings">
                <SettingsIcon />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <span className="text-sm font-medium">Dashboard</span>
        </header>
        <main className="flex-1 p-6">
          <p className="text-sm text-muted-foreground">
            Collapsing the sidebar shrinks it to an icon rail; menu labels become tooltips.
          </p>
        </main>
      </SidebarInset>
    </SidebarProvider>
  ),
})

export const NonCollapsible = meta.story({
  render: () => (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="none">
        <SidebarHeader>
          <div className="flex h-10 items-center gap-2 px-2">
            <div className="grid size-7 place-items-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
              T
            </div>
            <span className="text-sm font-medium">Taiyō</span>
          </div>
        </SidebarHeader>
        <SidebarSeparator className="-mt-px" />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV_ITEMS.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={"isActive" in item ? item.isActive : false}
                      tooltip={item.title}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                    {"badge" in item && item.badge ? (
                      <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                    ) : null}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Settings">
                <SettingsIcon />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b px-4">
          <span className="text-sm font-medium">Dashboard</span>
        </header>
        <main className="flex-1 p-6">
          <p className="text-sm text-muted-foreground">
            With `collapsible="none"` the sidebar is fixed-width and the trigger has no effect.
          </p>
        </main>
      </SidebarInset>
    </SidebarProvider>
  ),
})
