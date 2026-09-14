import {
  ArrowDown01Icon,
  ArrowTurnDownIcon,
  ArrowUp01Icon,
  CalculatorIcon as CalculatorGlyph,
  Calendar01Icon,
  Mail01Icon,
  Settings01Icon,
  SmileIcon as SmileGlyph,
  UserIcon as UserGlyph,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
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
import { Fragment } from "react"
import { fn } from "storybook/test"

type Item = {
  value: string
  label: string
  icon?: IconSvgElement
  shortcut?: string
}

type Group = { value: string; items: Item[] }

const defaultGroups: Group[] = [
  {
    value: "Suggestions",
    items: [
      { value: "calendar", label: "Calendar", icon: Calendar01Icon },
      { value: "search-emoji", label: "Search emoji", icon: SmileGlyph },
      { value: "calculator", label: "Calculator", icon: CalculatorGlyph },
    ],
  },
  {
    value: "Settings",
    items: [
      { value: "profile", label: "Profile", icon: UserGlyph, shortcut: "⌘P" },
      { value: "mail", label: "Mail", icon: Mail01Icon, shortcut: "⌘M" },
      { value: "settings", label: "Settings", icon: Settings01Icon, shortcut: "⌘S" },
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
                          {item.icon ? <HugeiconsIcon icon={item.icon} /> : null}
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
                    <HugeiconsIcon icon={ArrowUp01Icon} />
                  </Kbd>
                  <Kbd>
                    <HugeiconsIcon icon={ArrowDown01Icon} />
                  </Kbd>
                </KbdGroup>
                <span>Navigate</span>
              </div>
              <div className="flex items-center gap-2">
                <Kbd>
                  <HugeiconsIcon icon={ArrowTurnDownIcon} />
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
                          {item.icon ? <HugeiconsIcon icon={item.icon} /> : null}
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
                    <HugeiconsIcon icon={ArrowUp01Icon} />
                  </Kbd>
                  <Kbd>
                    <HugeiconsIcon icon={ArrowDown01Icon} />
                  </Kbd>
                </KbdGroup>
                <span>Navigate</span>
              </div>
              <div className="flex items-center gap-2">
                <Kbd>
                  <HugeiconsIcon icon={ArrowTurnDownIcon} />
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
                          {item.icon ? <HugeiconsIcon icon={item.icon} /> : null}
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
