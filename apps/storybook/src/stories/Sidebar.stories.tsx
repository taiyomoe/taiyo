import * as stylex from "@stylexjs/stylex"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import {
  BookOpen01Icon,
  Home01Icon,
  InboxIcon as InboxGlyph,
  Search01Icon,
  Settings01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
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
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@taiyomoe/ui/components/ui/sidebar"

const NAV_ITEMS = [
  { title: "Home", icon: Home01Icon, isActive: true },
  { title: "Inbox", icon: InboxGlyph, badge: "12" },
  { title: "Search", icon: Search01Icon },
  { title: "Library", icon: BookOpen01Icon },
  { title: "Members", icon: UserGroupIcon },
] as const
const styles = stylex.create({
  /** The square product mark the sidebar header shows next to the name. */
  brandTile: {
    borderRadius: radius.md,
    placeItems: "center",
    alignItems: "center",
    backgroundColor: colors.primary,
    color: colors.primaryForeground,
    display: "grid",
    fontSize: "0.875rem",
    fontWeight: 600,
    height: "1.75rem",
    width: "1.75rem",
  },
  noShrink: {
    flexShrink: 0,
  },
  row: {
    gap: "0.5rem",
    paddingInline: "0.5rem",
    alignItems: "center",
    display: "flex",
    height: "2.5rem",
  },
  label: {
    fontSize: "0.875rem",
    fontWeight: 500,
    lineHeight: "1.25rem",
  },
  spacing: {
    marginTop: "-1px",
  },
  row2: {
    gap: "0.5rem",
    paddingInline: "1rem",
    alignItems: "center",
    display: "flex",
    borderBottomColor: colors.border,
    borderBottomStyle: "solid",
    borderBottomWidth: 1,
    height: "3.5rem",
  },
  cell: {
    padding: "1.5rem",
    flex: "1",
  },
  caption: {
    color: colors.mutedForeground,
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
  },
})
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
    SidebarMenuSkeleton,
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
          <div sx={styles.row}>
            <div sx={styles.brandTile}>T</div>
            <span sx={styles.label}>Taiyō</span>
          </div>
        </SidebarHeader>
        <SidebarSeparator sx={styles.spacing} />
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
                      <HugeiconsIcon icon={item.icon} />
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
                <HugeiconsIcon icon={Settings01Icon} />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header sx={styles.row2}>
          <SidebarTrigger />
          <span sx={styles.label}>Dashboard</span>
        </header>
        <main sx={styles.cell}>
          <p sx={styles.caption}>
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
          <div sx={styles.row}>
            <div sx={styles.brandTile}>T</div>
            <span sx={styles.label}>Taiyō</span>
          </div>
        </SidebarHeader>
        <SidebarSeparator sx={styles.spacing} />
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
                      <HugeiconsIcon icon={item.icon} />
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
                <HugeiconsIcon icon={Settings01Icon} />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header sx={styles.row2}>
          <SidebarTrigger />
          <span sx={styles.label}>Dashboard</span>
        </header>
        <main sx={styles.cell}>
          <p sx={styles.caption}>Floating sidebar variant.</p>
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
          <div sx={styles.row}>
            <div sx={styles.brandTile}>T</div>
            <span sx={styles.label}>Taiyō</span>
          </div>
        </SidebarHeader>
        <SidebarSeparator sx={styles.spacing} />
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
                      <HugeiconsIcon icon={item.icon} />
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
                <HugeiconsIcon icon={Settings01Icon} />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header sx={styles.row2}>
          <SidebarTrigger />
          <span sx={styles.label}>Dashboard</span>
        </header>
        <main sx={styles.cell}>
          <p sx={styles.caption}>Inset sidebar variant.</p>
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
          <div sx={styles.row}>
            <div sx={styles.brandTile}>T</div>
            <span sx={styles.label}>Taiyō</span>
          </div>
        </SidebarHeader>
        <SidebarSeparator sx={styles.spacing} />
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
                      <HugeiconsIcon icon={item.icon} />
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
                <HugeiconsIcon icon={Settings01Icon} />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header sx={styles.row2}>
          <SidebarTrigger />
          <span sx={styles.label}>Dashboard</span>
        </header>
        <main sx={styles.cell}>
          <p sx={styles.caption}>
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
          <div sx={styles.row}>
            <div sx={styles.brandTile}>T</div>
            <span sx={styles.label}>Taiyō</span>
          </div>
        </SidebarHeader>
        <SidebarSeparator sx={styles.spacing} />
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
                      <HugeiconsIcon icon={item.icon} />
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
                <HugeiconsIcon icon={Settings01Icon} />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header sx={styles.row2}>
          <span sx={styles.label}>Dashboard</span>
        </header>
        <main sx={styles.cell}>
          <p sx={styles.caption}>
            With `collapsible="none"` the sidebar is fixed-width and the trigger has no effect.
          </p>
        </main>
      </SidebarInset>
    </SidebarProvider>
  ),
})

export const InitiallyCollapsed = meta.story({
  render: () => (
    <SidebarProvider defaultOpen={false}>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div sx={styles.row}>
            <div sx={[styles.brandTile, styles.noShrink]}>T</div>
            <span data-hide-when-collapsed sx={styles.label}>
              Taiyō
            </span>
          </div>
        </SidebarHeader>
        <SidebarSeparator sx={styles.spacing} />
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
                      <HugeiconsIcon icon={item.icon} />
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
                <HugeiconsIcon icon={Settings01Icon} />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header sx={styles.row2}>
          <SidebarTrigger />
          <span sx={styles.label}>Dashboard</span>
        </header>
        <main sx={styles.cell}>
          <p sx={styles.caption}>
            The provider starts closed, so the sidebar mounts as an icon rail. Use the trigger to
            expand it.
          </p>
        </main>
      </SidebarInset>
    </SidebarProvider>
  ),
})

export const Loading = meta.story({
  render: () => (
    <SidebarProvider defaultOpen>
      <Sidebar>
        <SidebarHeader>
          <div sx={styles.row}>
            <div sx={styles.brandTile}>T</div>
            <span sx={styles.label}>Taiyō</span>
          </div>
        </SidebarHeader>
        <SidebarSeparator sx={styles.spacing} />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {Array.from({ length: 5 }, (_, index) => (
                  <SidebarMenuItem key={`nav-${index}`}>
                    <SidebarMenuSkeleton showIcon />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Projects</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {Array.from({ length: 3 }, (_, index) => (
                  <SidebarMenuItem key={`project-${index}`}>
                    <SidebarMenuSkeleton />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header sx={styles.row2}>
          <SidebarTrigger />
          <span sx={styles.label}>Dashboard</span>
        </header>
        <main sx={styles.cell}>
          <p sx={styles.caption}>
            Map over `SidebarMenuSkeleton` while the navigation data loads. Each placeholder picks a
            deterministic width, so the rows do not all end at the same point.
          </p>
        </main>
      </SidebarInset>
    </SidebarProvider>
  ),
})
