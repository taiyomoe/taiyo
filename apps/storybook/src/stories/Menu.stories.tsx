import preview from "@/storybook/preview"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Kbd } from "@taiyomoe/ui/components/ui/kbd"
import {
  Menu,
  MenuCheckboxItem,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuPopup,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuShortcut,
  MenuSub,
  MenuSubPopup,
  MenuSubTrigger,
  MenuTrigger,
} from "@taiyomoe/ui/components/ui/menu"
import { fn } from "storybook/test"

const meta = preview.meta({
  title: "UI/Menu",
  component: Menu,
  subcomponents: {
    MenuTrigger,
    MenuPopup,
    MenuItem,
    MenuCheckboxItem,
    MenuRadioGroup,
    MenuRadioItem,
    MenuGroup,
    MenuGroupLabel,
    MenuSeparator,
    MenuShortcut,
    MenuSub,
    MenuSubTrigger,
    MenuSubPopup,
  },
  parameters: { layout: "centered" },
  args: { onOpenChange: fn() },
})

export const Default = meta.story({
  render: () => (
    <Menu>
      <MenuTrigger render={<Button variant="outline" />}>Open menu</MenuTrigger>
      <MenuPopup className="min-w-56">
        <MenuGroup>
          <MenuItem>
            Profile
            <MenuShortcut>
              <Kbd>⇧</Kbd>
              <Kbd>⌘</Kbd>
              <Kbd>P</Kbd>
            </MenuShortcut>
          </MenuItem>
          <MenuItem>
            Settings
            <MenuShortcut>
              <Kbd>⌘</Kbd>
              <Kbd>,</Kbd>
            </MenuShortcut>
          </MenuItem>
        </MenuGroup>
        <MenuSeparator />
        <MenuGroup>
          <MenuItem variant="destructive">Sign out</MenuItem>
        </MenuGroup>
      </MenuPopup>
    </Menu>
  ),
})

export const WithGroupsAndLabels = meta.story({
  render: () => (
    <Menu>
      <MenuTrigger render={<Button variant="outline" />}>Account</MenuTrigger>
      <MenuPopup className="min-w-56">
        <MenuGroup>
          <MenuGroupLabel>My account</MenuGroupLabel>
          <MenuItem>Profile</MenuItem>
          <MenuItem>Billing</MenuItem>
          <MenuItem>Settings</MenuItem>
        </MenuGroup>
        <MenuSeparator />
        <MenuGroup>
          <MenuGroupLabel>Team</MenuGroupLabel>
          <MenuItem>Invite members</MenuItem>
          <MenuItem>Workspace settings</MenuItem>
        </MenuGroup>
        <MenuSeparator />
        <MenuGroup>
          <MenuItem variant="destructive">Delete account</MenuItem>
        </MenuGroup>
      </MenuPopup>
    </Menu>
  ),
})

export const WithCheckboxItems = meta.story({
  render: () => (
    <Menu>
      <MenuTrigger render={<Button variant="outline" />}>View</MenuTrigger>
      <MenuPopup className="min-w-56">
        <MenuGroup>
          <MenuGroupLabel>Appearance</MenuGroupLabel>
          <MenuCheckboxItem defaultChecked>Status bar</MenuCheckboxItem>
          <MenuCheckboxItem>Activity bar</MenuCheckboxItem>
          <MenuCheckboxItem defaultChecked>Panel</MenuCheckboxItem>
        </MenuGroup>
      </MenuPopup>
    </Menu>
  ),
})

export const WithSwitchCheckboxItems = meta.story({
  render: () => (
    <Menu>
      <MenuTrigger render={<Button variant="outline" />}>Settings</MenuTrigger>
      <MenuPopup className="min-w-64">
        <MenuGroup>
          <MenuGroupLabel>Notifications</MenuGroupLabel>
          <MenuCheckboxItem defaultChecked variant="switch">
            Email
          </MenuCheckboxItem>
          <MenuCheckboxItem variant="switch">Push</MenuCheckboxItem>
          <MenuCheckboxItem defaultChecked variant="switch">
            SMS
          </MenuCheckboxItem>
        </MenuGroup>
      </MenuPopup>
    </Menu>
  ),
})

export const WithRadioItems = meta.story({
  render: () => (
    <Menu>
      <MenuTrigger render={<Button variant="outline" />}>Sort by</MenuTrigger>
      <MenuPopup className="min-w-48">
        <MenuGroup>
          <MenuGroupLabel>Sort by</MenuGroupLabel>
          <MenuRadioGroup defaultValue="recent">
            <MenuRadioItem value="recent">Most recent</MenuRadioItem>
            <MenuRadioItem value="popular">Most popular</MenuRadioItem>
            <MenuRadioItem value="alphabetical">Alphabetical</MenuRadioItem>
          </MenuRadioGroup>
        </MenuGroup>
      </MenuPopup>
    </Menu>
  ),
})

export const WithSubmenu = meta.story({
  render: () => (
    <Menu>
      <MenuTrigger render={<Button variant="outline" />}>File</MenuTrigger>
      <MenuPopup className="min-w-56">
        <MenuGroup>
          <MenuItem>New file</MenuItem>
          <MenuItem>Open…</MenuItem>
          <MenuSub>
            <MenuSubTrigger>Open recent</MenuSubTrigger>
            <MenuSubPopup className="min-w-48">
              <MenuGroup>
                <MenuItem>project-a.tsx</MenuItem>
                <MenuItem>project-b.tsx</MenuItem>
                <MenuItem>project-c.tsx</MenuItem>
              </MenuGroup>
              <MenuSeparator />
              <MenuGroup>
                <MenuItem>Clear recent</MenuItem>
              </MenuGroup>
            </MenuSubPopup>
          </MenuSub>
        </MenuGroup>
        <MenuSeparator />
        <MenuGroup>
          <MenuItem>Save</MenuItem>
        </MenuGroup>
      </MenuPopup>
    </Menu>
  ),
})

export const WithDisabledItems = meta.story({
  render: () => (
    <Menu>
      <MenuTrigger render={<Button variant="outline" />}>Edit</MenuTrigger>
      <MenuPopup className="min-w-48">
        <MenuGroup>
          <MenuItem>Undo</MenuItem>
          <MenuItem disabled>Redo</MenuItem>
        </MenuGroup>
        <MenuSeparator />
        <MenuGroup>
          <MenuItem>Cut</MenuItem>
          <MenuItem>Copy</MenuItem>
          <MenuItem disabled>Paste</MenuItem>
        </MenuGroup>
      </MenuPopup>
    </Menu>
  ),
})

export const Inset = meta.story({
  render: () => (
    <Menu>
      <MenuTrigger render={<Button variant="outline" />}>More</MenuTrigger>
      <MenuPopup className="min-w-56">
        <MenuGroup>
          <MenuGroupLabel inset>Workspace</MenuGroupLabel>
          <MenuItem inset>Overview</MenuItem>
          <MenuItem inset>Members</MenuItem>
          <MenuItem inset>Integrations</MenuItem>
        </MenuGroup>
      </MenuPopup>
    </Menu>
  ),
})
