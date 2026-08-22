import preview from "@/storybook/preview"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Group, GroupSeparator, GroupText } from "@taiyomoe/ui/components/ui/group"
import { Input } from "@taiyomoe/ui/components/ui/input"
import { ArchiveIcon, ChevronDownIcon, CopyIcon, TrashIcon } from "lucide-react"

const meta = preview.meta({
  title: "UI/Group",
  component: Group,
  subcomponents: { GroupText, GroupSeparator },
  parameters: { layout: "centered" },
})

export const Default = meta.story({
  render: () => (
    <Group>
      <Button variant="outline">One</Button>
      <Button variant="outline">Two</Button>
      <Button variant="outline">Three</Button>
    </Group>
  ),
})

export const Vertical = meta.story({
  render: () => (
    <Group orientation="vertical">
      <Button variant="outline">Top</Button>
      <Button variant="outline">Middle</Button>
      <Button variant="outline">Bottom</Button>
    </Group>
  ),
})

export const WithSeparator = meta.story({
  render: () => (
    <Group>
      <Button variant="outline" aria-label="Archive">
        <ArchiveIcon />
      </Button>
      <GroupSeparator />
      <Button variant="outline" aria-label="Copy">
        <CopyIcon />
      </Button>
      <GroupSeparator />
      <Button variant="outline" aria-label="Delete">
        <TrashIcon />
      </Button>
    </Group>
  ),
})

export const WithText = meta.story({
  render: () => (
    <Group>
      <GroupText>https://</GroupText>
      <Input placeholder="example.com" />
      <Button variant="outline">
        Go
        <ChevronDownIcon />
      </Button>
    </Group>
  ),
})

export const SplitButton = meta.story({
  render: () => (
    <Group>
      <Button>Save</Button>
      <Button size="icon" aria-label="More options">
        <ChevronDownIcon />
      </Button>
    </Group>
  ),
})
