import preview from "@/storybook/preview"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Command,
  CommandCollection,
  CommandDialog,
  CommandDialogPopup,
  CommandDialogTrigger,
  CommandEmpty,
  CommandFooter,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandList,
  CommandPanel,
  CommandSeparator,
  CommandShortcut,
} from "@taiyomoe/ui/components/ui/command"
import { Kbd, KbdGroup } from "@taiyomoe/ui/components/ui/kbd"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CalculatorIcon,
  CalendarIcon,
  CornerDownLeftIcon,
  MailIcon,
  SettingsIcon,
  SmileIcon,
  UserIcon,
} from "lucide-react"
import { Fragment } from "react"
import { fn } from "storybook/test"

type Item = {
  value: string
  label: string
  icon?: typeof CalendarIcon
  shortcut?: string
}

type Group = { value: string; items: Item[] }

const defaultGroups: Group[] = [
  {
    value: "Suggestions",
    items: [
      { value: "calendar", label: "Calendar", icon: CalendarIcon },
      { value: "search-emoji", label: "Search emoji", icon: SmileIcon },
      { value: "calculator", label: "Calculator", icon: CalculatorIcon },
    ],
  },
  {
    value: "Settings",
    items: [
      { value: "profile", label: "Profile", icon: UserIcon, shortcut: "⌘P" },
      { value: "mail", label: "Mail", icon: MailIcon, shortcut: "⌘M" },
      { value: "settings", label: "Settings", icon: SettingsIcon, shortcut: "⌘S" },
    ],
  },
]
const meta = preview.meta({
  title: "UI/Command",
  component: CommandDialog,
  subcomponents: {
    CommandDialogTrigger,
    CommandDialogPopup,
    Command,
    CommandInput,
    CommandList,
    CommandGroup,
    CommandGroupLabel,
    CommandCollection,
    CommandItem,
    CommandSeparator,
    CommandShortcut,
    CommandEmpty,
    CommandFooter,
    CommandPanel,
  },
  parameters: { layout: "centered" },
  args: { onOpenChange: fn() },
})

export const Default = meta.story({
  render: () => (
    <CommandDialog>
      <CommandDialogTrigger render={<Button variant="outline" />}>
        Open Command Palette
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>J</Kbd>
        </KbdGroup>
      </CommandDialogTrigger>
      <CommandDialogPopup>
        <Command items={defaultGroups}>
          <CommandInput placeholder="Search for apps and commands..." />
          <CommandPanel>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandList>
              {(group: Group) => (
                <Fragment key={group.value}>
                  <CommandGroup items={group.items}>
                    <CommandGroupLabel>{group.value}</CommandGroupLabel>
                    <CommandCollection>
                      {(item: Item) => (
                        <CommandItem key={item.value} value={item.value}>
                          {item.icon ? <item.icon /> : null}
                          <span className="flex-1">{item.label}</span>
                          {item.shortcut ? (
                            <CommandShortcut>{item.shortcut}</CommandShortcut>
                          ) : null}
                        </CommandItem>
                      )}
                    </CommandCollection>
                  </CommandGroup>
                  <CommandSeparator />
                </Fragment>
              )}
            </CommandList>
          </CommandPanel>
          <CommandFooter>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <KbdGroup>
                  <Kbd>
                    <ArrowUpIcon />
                  </Kbd>
                  <Kbd>
                    <ArrowDownIcon />
                  </Kbd>
                </KbdGroup>
                <span>Navigate</span>
              </div>
              <div className="flex items-center gap-2">
                <Kbd>
                  <CornerDownLeftIcon />
                </Kbd>
                <span>Open</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Kbd>Esc</Kbd>
              <span>Close</span>
            </div>
          </CommandFooter>
        </Command>
      </CommandDialogPopup>
    </CommandDialog>
  ),
})

export const EmptyState = meta.story({
  render: () => (
    <CommandDialog>
      <CommandDialogTrigger render={<Button variant="outline" />}>
        Open empty palette
      </CommandDialogTrigger>
      <CommandDialogPopup>
        <Command items={[]}>
          <CommandInput defaultValue="zzzzz" placeholder="Search for apps and commands..." />
          <CommandPanel>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandList>
              {(group: Group) => (
                <Fragment key={group.value}>
                  <CommandGroup items={group.items}>
                    <CommandGroupLabel>{group.value}</CommandGroupLabel>
                    <CommandCollection>
                      {(item: Item) => (
                        <CommandItem key={item.value} value={item.value}>
                          {item.icon ? <item.icon /> : null}
                          <span className="flex-1">{item.label}</span>
                          {item.shortcut ? (
                            <CommandShortcut>{item.shortcut}</CommandShortcut>
                          ) : null}
                        </CommandItem>
                      )}
                    </CommandCollection>
                  </CommandGroup>
                  <CommandSeparator />
                </Fragment>
              )}
            </CommandList>
          </CommandPanel>
          <CommandFooter>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <KbdGroup>
                  <Kbd>
                    <ArrowUpIcon />
                  </Kbd>
                  <Kbd>
                    <ArrowDownIcon />
                  </Kbd>
                </KbdGroup>
                <span>Navigate</span>
              </div>
              <div className="flex items-center gap-2">
                <Kbd>
                  <CornerDownLeftIcon />
                </Kbd>
                <span>Open</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Kbd>Esc</Kbd>
              <span>Close</span>
            </div>
          </CommandFooter>
        </Command>
      </CommandDialogPopup>
    </CommandDialog>
  ),
})

export const WithoutFooter = meta.story({
  render: () => (
    <CommandDialog>
      <CommandDialogTrigger render={<Button variant="outline" />}>
        Open without footer
      </CommandDialogTrigger>
      <CommandDialogPopup>
        <Command items={defaultGroups}>
          <CommandInput placeholder="Search for apps and commands..." />
          <CommandPanel>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandList>
              {(group: Group) => (
                <Fragment key={group.value}>
                  <CommandGroup items={group.items}>
                    <CommandGroupLabel>{group.value}</CommandGroupLabel>
                    <CommandCollection>
                      {(item: Item) => (
                        <CommandItem key={item.value} value={item.value}>
                          {item.icon ? <item.icon /> : null}
                          <span className="flex-1">{item.label}</span>
                          {item.shortcut ? (
                            <CommandShortcut>{item.shortcut}</CommandShortcut>
                          ) : null}
                        </CommandItem>
                      )}
                    </CommandCollection>
                  </CommandGroup>
                  <CommandSeparator />
                </Fragment>
              )}
            </CommandList>
          </CommandPanel>
        </Command>
      </CommandDialogPopup>
    </CommandDialog>
  ),
})
